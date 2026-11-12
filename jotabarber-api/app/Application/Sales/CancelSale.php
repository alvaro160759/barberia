<?php
namespace App\Application\Sales;
use App\Support\{Audit,Records};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
class CancelSale {
    public function execute(int $id,string $reason,int $branch,int $user): object {
        return DB::transaction(function()use($id,$reason,$branch,$user){
            $s=DB::table('sales')->where('id',$id)->where('branch_id',$branch)->lockForUpdate()->first();abort_unless($s,404);
            if($s->status==='CANCELLED')return $s;
            if(DB::table('payments')->where('sale_id',$id)->exists())Records::error('sale_id','Venta cobrada: se necesita un proceso de devolución que aún no está habilitado.');
            if(DB::table('sale_services as ss')->join('commission_settlement_items as i','i.sale_service_id','=','ss.id')->where('ss.sale_id',$id)->exists())Records::error('sale_id','La venta tiene comisiones liquidadas.');
            foreach(DB::table('sale_products')->where('sale_id',$id)->orderBy('product_id')->get() as $line){
                $p=DB::table('branch_products')->where('branch_id',$branch)->where('product_id',$line->product_id)->lockForUpdate()->first();
                DB::table('branch_products')->where('branch_id',$branch)->where('product_id',$line->product_id)->update(['stock_qty'=>bcadd((string)$p->stock_qty,(string)$line->quantity,3),'updated_at'=>now()]);
                Records::insert('inventory_movements',['branch_id'=>$branch,'product_id'=>$line->product_id,'type'=>'RETURN','quantity_delta'=>$line->quantity,'unit_cost'=>$line->unit_cost,'occurred_at'=>now(),'reason'=>'Anulación venta '.$s->number,'created_by'=>$user,'operation_key'=>(string)Str::uuid()]);
            }
            DB::table('sales')->where('id',$id)->update(['status'=>'CANCELLED','cancelled_by'=>$user,'cancelled_at'=>now(),'cancellation_reason'=>$reason,'updated_at'=>now()]);
            Audit::log($branch,$user,'CANCEL','sales',$id,['reason'=>$reason]);return DB::table('sales')->where('id',$id)->first();
        },3);
    }
}
