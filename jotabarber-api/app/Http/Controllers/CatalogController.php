<?php
namespace App\Http\Controllers;
use App\Support\{Api,Audit,Records};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class CatalogController extends Controller {
    private function definition(Request $r): array {
        $d=config('catalogs.'.$r->route('resource'));abort_unless(is_array($d),404);return $d;
    }
    private function query(Request $r,array $d,bool $withBranchData=false) {
        $q=DB::table($d['table']);
        if($d['table']==='products'){
            // Determinar la sucursal objetivo para el JOIN
            if($r->filled('branch_id')){
                $targetBranchId = (int)$r->query('branch_id');
            } else {
                $targetBranchId = $this->branch($r);
            }
            
            // Solo hacer JOINs si se solicitan datos de branch
            if($withBranchData){
                $q->leftJoin('product_categories as pc','pc.id','=','products.category_id')
                  ->leftJoin('branch_products as bp',function($join) use ($targetBranchId){
                      $join->on('bp.product_id','=','products.id')
                           ->where('bp.branch_id','=',$targetBranchId);
                  })
                  ->select('products.*','pc.name as category_name','bp.sale_price as price','bp.stock_qty as stock');
            }
        }
        if($d['branch']??false)$q->where('branch_id',$this->branch($r));
        return $q;
    }
    public function index(Request $r) {
        $d=$this->definition($r);
        
        // Para productos, manejar el branch_id específico
        if($d['table']==='products'){
            // Determinar la sucursal objetivo
            if($r->filled('branch_id')){
                $targetBranchId = (int)$r->query('branch_id');
            } else {
                $targetBranchId = $this->branch($r);
            }
            
            $q=DB::table('products')
              ->leftJoin('product_categories as pc','pc.id','=','products.category_id')
              ->leftJoin('branch_products as bp',function($join) use ($targetBranchId){
                  $join->on('bp.product_id','=','products.id')
                       ->where('bp.branch_id','=',$targetBranchId);
              })
              ->select('products.*','pc.name as category_name','bp.sale_price as price','bp.stock_qty as stock');
        }
        // Para servicios, seleccionar todos los campos (incluye price y commission_percentage)
        elseif($d['table']==='services'){
            $q=DB::table('services')->select('services.*');
        }
        else {
            $q=$this->query($r,$d,true);
        }
        
        if($r->filled('q')){$term=substr((string)$r->query('q'),0,100);$q->where(function($q)use($d,$term){foreach($d['search'] as $column)$q->orWhere($column,'like','%'.$term.'%');});}
        if($r->has('active'))$q->where('active',$r->boolean('active'));
        
        return Api::ok($q->orderByDesc('id')->paginate($this->perPage($r)));
    }
    public function show(Request $r) {
        $d=$this->definition($r);
        $row=DB::table($d['table'])->where('id',$r->route('id'))->first();
        abort_unless($row,404);
        
        // Si es producto, agregar nombre de categoría y datos de sucursal
        if($d['table']==='products'){
            $category=DB::table('product_categories')->where('id',$row->category_id)->first();
            $row->category_name = $category ? $category->name : null;
            
            // Obtener precio y stock de la sucursal actual
            $branchProduct=DB::table('branch_products')
                ->where('branch_id',$this->branch($r))
                ->where('product_id',$row->id)
                ->first();
            
            $row->price = $branchProduct ? $branchProduct->sale_price : 0;
            $row->stock = $branchProduct ? $branchProduct->stock_qty : 0;
        }
        
        return Api::ok($row);
    }
    public function store(Request $r) {return $this->save($r,false);}
    public function update(Request $r) {return $this->save($r,true);}
    private function save(Request $r,bool $update) {
        $d=$this->definition($r);$data=$r->validate($d['rules']);
        
        // Generar SKU automáticamente solo al crear, no al actualizar
        if(!$update && $d['table']==='products' && empty($data['sku'])) {
            $data['sku'] = 'PROD-' . strtoupper(substr(str_replace(' ', '', microtime()), 0, 10)) . '-' . rand(1000, 9999);
        }
        
        if($d['table']==='payment_methods') {
            if(!$update && $data['code']==='CASH') Records::error('code','CASH viene creado por el seeder.');
            if($update) {
                $code=DB::table('payment_methods')->where('id',$r->route('id'))->value('code');
                if($code!==$data['code']) Records::error('code','El código del método de pago es inmutable.');
            }
        }
        return DB::transaction(function()use($r,$d,$data,$update){
            if($d['branch']??false)$data['branch_id']=$this->branch($r);
            if($update){
                $id=(int)$r->route('id');
                // Usar query simple sin JOINs para lockForUpdate
                $q=DB::table($d['table']);
                abort_unless($q->where('id',$id)->lockForUpdate()->first(),404);
                
                // Para productos, también actualizar precio y stock en branch_products
                if($d['table']==='products'){
                    // Extraer precio y stock para branch_products
                    $price = $data['price'] ?? $data['sale_price'] ?? null;
                    $stock = $data['stock'] ?? $data['stock_qty'] ?? null;
                    
                    // Eliminar campos que no pertenecen a products
                    unset($data['price'],$data['stock'],$data['sale_price'],$data['stock_qty']);
                    
                    // Actualizar producto
                    $q->where('id',$id)->update($data+['updated_at'=>now()]);
                    
                    // Actualizar o crear registro en branch_products
                    if($price !== null || $stock !== null){
                        $branchId=$this->branch($r);
                        $branchProduct=DB::table('branch_products')
                            ->where('branch_id',$branchId)
                            ->where('product_id',$id)
                            ->first();
                        
                        $branchData=['updated_at'=>now()];
                        if($price !== null)$branchData['sale_price']=$price;
                        if($stock !== null)$branchData['stock_qty']=$stock;
                        
                        if($branchProduct){
                            DB::table('branch_products')
                                ->where('branch_id',$branchId)
                                ->where('product_id',$id)
                                ->update($branchData);
                        } else {
                            DB::table('branch_products')->insert([
                                'branch_id'=>$branchId,
                                'product_id'=>$id,
                                'sale_price'=>$price??0,
                                'average_cost'=>0,
                                'stock_qty'=>$stock??0,
                                'minimum_stock'=>0,
                                'active'=>true,
                                'created_at'=>now(),
                                'updated_at'=>now()
                            ]);
                        }
                    }
                } else {
                    $q->where('id',$id)->update($data+['updated_at'=>now()]);
                }
            }
            else {
                // Para productos, extraer precio y stock antes de insertar
                if($d['table']==='products'){
                    $price = $data['price'] ?? $data['sale_price'] ?? 0;
                    $stock = $data['stock'] ?? $data['stock_qty'] ?? 0;
                    
                    // Eliminar campos que no pertenecen a products
                    unset($data['price'],$data['stock'],$data['sale_price'],$data['stock_qty']);
                }
                
                $id=Records::insert($d['table'],$data);
                
                // Si es un producto, crear el registro en branch_products para la sucursal actual
                if($d['table']==='products'){
                    DB::table('branch_products')->insert([
                        'branch_id'=>$this->branch($r),
                        'product_id'=>$id,
                        'sale_price'=>$price,
                        'average_cost'=>0,
                        'stock_qty'=>$stock,
                        'minimum_stock'=>0,
                        'active'=>true,
                        'created_at'=>now(),
                        'updated_at'=>now()
                    ]);
                }
            }
            Audit::log($this->branch($r),$this->user($r),$update?'UPDATE':'CREATE',$d['table'],$id);
            return Api::ok($this->query($r,$d,false)->where('id',$id)->first(),'Registro guardado.',$update?200:201);
        });
    }
    
    public function destroy(Request $r) {
        $d=$this->definition($r);$id=(int)$r->route('id');
        return DB::transaction(function()use($r,$d,$id){abort_unless($this->query($r,$d)->where('id',$id)->lockForUpdate()->first(),404);
            $this->query($r,$d)->where('id',$id)->update(['active'=>false,'updated_at'=>now()]);
            Audit::log($this->branch($r),$this->user($r),'DEACTIVATE',$d['table'],$id);return Api::ok(null,'Registro desactivado.');});
    }
}
