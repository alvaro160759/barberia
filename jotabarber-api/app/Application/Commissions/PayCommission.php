<?php
namespace App\Application\Commissions;
use App\Support\{Audit,Cash,Idempotency,Money,Records};
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
class PayCommission {
    public function execute(array $d,int $branch,int $user): object {
        $hash=Idempotency::hash($d,$branch);
        return DB::transaction(function()use($d,$branch,$user,$hash){
            $old=DB::table('commission_settlements')->where('operation_key',$d['operation_key'])->first();if($old){Idempotency::match($old,$branch,$hash);return $old;}
            Records::barber((int)$d['barber_id'],$branch);
            $rows=DB::table('sale_services')->whereIn('id',$d['sale_service_ids'])->where('branch_id',$branch)->where('barber_id',$d['barber_id'])->get();
            if($rows->count()!==count($d['sale_service_ids']))Records::error('sale_service_ids','Los servicios deben pertenecer al barbero y a la sucursal.');
            $saleIds=$rows->pluck('sale_id')->unique()->sort()->values()->all();
            $sales=DB::table('sales')->whereIn('id',$saleIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $rows=DB::table('sale_services')->whereIn('id',$d['sale_service_ids'])->orderBy('id')->lockForUpdate()->get();
            if(DB::table('commission_settlement_items')->whereIn('sale_service_id',$d['sale_service_ids'])->exists())Records::error('sale_service_ids','Uno o más servicios ya fueron liquidados.');
            $zone=DB::table('branches')->where('id',$branch)->value('timezone');
            $start=CarbonImmutable::parse($d['period_start'],$zone)->startOfDay()->utc();$end=CarbonImmutable::parse($d['period_end'],$zone)->addDay()->startOfDay()->utc();
            foreach($sales as $sale){
                $date=CarbonImmutable::parse($sale->sold_at,'UTC');
                if($sale->status!=='CONFIRMED'||$date->lt($start)||!$date->lt($end))Records::error('sale_service_ids','La venta está anulada o fuera del período.');
                $paid=Money::cents((string)DB::table('payments')->where('sale_id',$sale->id)->sum('amount'));
                if($paid<Money::cents((string)$sale->total_amount))Records::error('sale_service_ids','Solo se liquidan ventas completamente cobradas.');
            }
            $total=$rows->reduce(fn($sum,$row)=>$sum+Money::cents((string)$row->barber_amount),0);
            if($total<=0)Records::error('sale_service_ids','La liquidación debe tener un importe positivo.');
            $method=Records::active('payment_methods',(int)$d['payment_method_id']);$session=Cash::session($d['cash_session_id']??null,$branch,$method->code);
            if($method->code==='CASH'&&Cash::expected($session)<$total)Records::error('cash_session_id','Efectivo insuficiente para pagar la liquidación.');
            $id=Records::insert('commission_settlements',['branch_id'=>$branch,'barber_id'=>$d['barber_id'],'period_start'=>$d['period_start'],'period_end'=>$d['period_end'],'amount'=>Money::decimal($total),'status'=>'PAID','paid_at'=>now(),'payment_method_id'=>$method->id,'cash_session_id'=>$d['cash_session_id']??null,'reference'=>$d['reference']??null,'notes'=>$d['notes']??null,'created_by'=>$user,'operation_key'=>$d['operation_key'],'request_hash'=>$hash]);
            foreach($rows as $row)Records::insert('commission_settlement_items',['settlement_id'=>$id,'branch_id'=>$branch,'barber_id'=>$d['barber_id'],'sale_service_id'=>$row->id,'amount'=>$row->barber_amount]);
            Audit::log($branch,$user,'PAY','commission_settlements',$id);return DB::table('commission_settlements')->where('id',$id)->first();
        },3);
    }
}
