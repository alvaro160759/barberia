<?php
namespace App\Application\Sales;
use App\Support\{Audit,Cash,Idempotency,Money,Records};
use Illuminate\Support\Facades\DB;
class RegisterPayment {
    public function execute(array $d,int $saleId,int $branch,int $user): object {
        $hash=Idempotency::hash($d+['sale_id'=>$saleId],$branch);
        return DB::transaction(function()use($d,$saleId,$branch,$user,$hash){
            $sale=DB::table('sales')->where('id',$saleId)->where('branch_id',$branch)->lockForUpdate()->first();abort_unless($sale,404);
            $old=DB::table('payments')->where('operation_key',$d['operation_key'])->first();if($old){Idempotency::match($old,$branch,$hash);return $old;}
            if($sale->status!=='CONFIRMED')Records::error('sale_id','La venta no admite cobros.');
            $method=Records::active('payment_methods',(int)$d['payment_method_id']);
            Cash::session($d['cash_session_id']??null,$branch,$method->code);
            $amount=Money::cents((string)$d['amount']);$paid=Money::cents((string)DB::table('payments')->where('sale_id',$saleId)->sum('amount'));
            if($amount<=0||$amount>Money::cents((string)$sale->total_amount)-$paid)Records::error('amount','El importe supera el saldo pendiente o no es positivo.');
            $tip=Money::cents((string)($d['tip_amount']??'0'));
            $id=Records::insert('payments',['sale_id'=>$saleId,'branch_id'=>$branch,'payment_method_id'=>$method->id,'cash_session_id'=>$d['cash_session_id']??null,'amount'=>Money::decimal($amount),'tip_amount'=>Money::decimal($tip),'reference'=>$d['reference']??null,'paid_at'=>now(),'created_by'=>$user,'operation_key'=>$d['operation_key'],'request_hash'=>$hash]);
            Audit::log($branch,$user,'PAYMENT','sales',$saleId);return DB::table('payments')->where('id',$id)->first();
        },3);
    }
}
