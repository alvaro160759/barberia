<?php
namespace App\Http\Controllers;
use App\Support\{Api,Audit,Records};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class BranchCatalogController extends Controller {
    public function services(Request $r) {return Api::ok(DB::table('branch_services as bs')->join('services as s','s.id','=','bs.service_id')->where('bs.branch_id',$this->branch($r))->select('bs.*','s.name','s.code')->orderBy('s.name')->paginate($this->perPage($r)));}
    public function saveService(Request $r) {
        $d=$r->validate(['service_id'=>'required|integer','price'=>'required|regex:/^\d{1,8}(\.\d{1,2})?$/','duration_minutes'=>'required|integer|min:1|max:600','barber_percentage'=>'required|numeric|min:0|max:100|decimal:0,2','owner_percentage'=>'required|numeric|min:0|max:100|decimal:0,2','active'=>'sometimes|boolean']);
        Records::active('services',(int)$d['service_id']);
        if(bccomp(bcadd((string)$d['barber_percentage'],(string)$d['owner_percentage'],2),'100.00',2)!==0)Records::error('barber_percentage','Los porcentajes deben sumar 100.');
        $key=['branch_id'=>$this->branch($r),'service_id'=>$d['service_id']];
        DB::table('branch_services')->upsert([$key+$d+['created_at'=>now(),'updated_at'=>now()]],['branch_id','service_id'],['price','duration_minutes','barber_percentage','owner_percentage','active','updated_at']);
        return Api::ok(DB::table('branch_services')->where($key)->first());
    }
    public function products(Request $r) {return Api::ok(DB::table('branch_products as bp')->join('products as p','p.id','=','bp.product_id')->where('bp.branch_id',$this->branch($r))->select('bp.*','p.name','p.sku')->orderBy('p.name')->paginate($this->perPage($r)));}
    public function saveProduct(Request $r) {
        $d=$r->validate(['product_id'=>'required|integer','sale_price'=>'required|regex:/^\d{1,8}(\.\d{1,2})?$/','minimum_stock'=>'required|numeric|min:0|max:1000000|decimal:0,3','active'=>'sometimes|boolean']);Records::active('products',(int)$d['product_id']);
        $key=['branch_id'=>$this->branch($r),'product_id'=>$d['product_id']];
        // No se acepta stock_qty ni average_cost del cliente: solo movimientos de inventario.
        DB::table('branch_products')->upsert([$key+$d+['created_at'=>now(),'updated_at'=>now()]],['branch_id','product_id'],['sale_price','minimum_stock','active','updated_at']);
        return Api::ok(DB::table('branch_products')->where($key)->first());
    }
    public function rates(Request $r) {
        return Api::ok(DB::table('barber_service_rates')->where('branch_id',$this->branch($r))->paginate($this->perPage($r)));
    }
    public function saveRate(Request $r) {
        $d=$r->validate(['employee_id'=>'required|integer','service_id'=>'required|integer','barber_percentage'=>'required|numeric|min:0|max:100|decimal:0,2','owner_percentage'=>'required|numeric|min:0|max:100|decimal:0,2','active'=>'sometimes|boolean']);
        Records::barber((int)$d['employee_id'],$this->branch($r));
        if(!DB::table('branch_services')->where('branch_id',$this->branch($r))->where('service_id',$d['service_id'])->where('active',true)->exists())Records::error('service_id','Servicio no disponible.');
        if(bccomp(bcadd((string)$d['barber_percentage'],(string)$d['owner_percentage'],2),'100.00',2)!==0)Records::error('barber_percentage','Los porcentajes deben sumar 100.');
        DB::table('barber_service_rates')->upsert([['branch_id'=>$this->branch($r)]+$d+['created_at'=>now(),'updated_at'=>now()]],['branch_id','employee_id','service_id'],['barber_percentage','owner_percentage','active','updated_at']);
        return Api::ok(null,'Porcentajes guardados.');
    }
}
