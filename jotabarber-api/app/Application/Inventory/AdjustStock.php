<?php
namespace App\Application\Inventory;
use App\Support\{Audit,Idempotency,Records};
use Illuminate\Support\Facades\DB;
class AdjustStock {
    public function execute(array $d,int $branch,int $user): object {
        $hash=Idempotency::hash($d,$branch);
        return DB::transaction(function()use($d,$branch,$user,$hash){
            $p=DB::table('branch_products')->where('branch_id',$branch)->where('product_id',$d['product_id'])->lockForUpdate()->first();
            if(!$p||!$p->active)Records::error('product_id','Configura el producto en la sucursal primero.');Records::active('products',(int)$d['product_id']);
            $old=DB::table('inventory_movements')->where('operation_key',$d['operation_key'])->first();if($old){Idempotency::match($old,$branch,$hash);return $old;}
            $qty=(string)$d['quantity'];if(bccomp($qty,'0',3)<=0)Records::error('quantity','La cantidad debe ser positiva.');
            $positive=in_array($d['type'],['OPENING','PURCHASE','ADJUSTMENT_IN']);$delta=$positive?$qty:bcsub('0',$qty,3);$stock=bcadd((string)$p->stock_qty,$delta,3);
            if(bccomp($stock,'0',3)<0)Records::error('quantity','La salida dejaría stock negativo.');
            if($d['type']==='OPENING'&&DB::table('inventory_movements')->where('branch_id',$branch)->where('product_id',$p->product_id)->exists())Records::error('type','El producto ya tiene movimientos; utiliza un ajuste o compra.');
            $cost=(string)($d['unit_cost']??$p->average_cost);$average=(string)$p->average_cost;
            if(in_array($d['type'],['OPENING','PURCHASE']))$average=bcdiv(bcadd(bcmul((string)$p->stock_qty,$average,7),bcmul($qty,$cost,7),7),$stock,4);
            DB::table('branch_products')->where('branch_id',$branch)->where('product_id',$p->product_id)->update(['stock_qty'=>$stock,'average_cost'=>$average,'updated_at'=>now()]);
            $id=Records::insert('inventory_movements',['branch_id'=>$branch,'product_id'=>$p->product_id,'type'=>$d['type'],'quantity_delta'=>$delta,'unit_cost'=>$positive?$cost:$p->average_cost,'reason'=>$d['reason'],'occurred_at'=>now(),'created_by'=>$user,'operation_key'=>$d['operation_key'],'request_hash'=>$hash]);
            Audit::log($branch,$user,'ADJUST','inventory_movements',$id);return DB::table('inventory_movements')->where('id',$id)->first();
        },3);
    }
}
