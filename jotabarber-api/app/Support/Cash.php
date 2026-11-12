<?php
namespace App\Support;
use Illuminate\Support\Facades\DB;
class Cash {
    // Llamar siempre dentro de una transacción.
    public static function session(?int $id,int $branch,string $method): ?object {
        if($method==='CASH'&&!$id)Records::error('cash_session_id','El efectivo requiere una caja abierta.');
        if(!$id)return null;
        $s=DB::table('cash_sessions')->where('id',$id)->where('branch_id',$branch)->first();
        if(!$s)Records::error('cash_session_id','Caja no encontrada en esta sucursal.');
        DB::table('cash_registers')->where('id',$s->cash_register_id)->lockForUpdate()->first();
        $s=DB::table('cash_sessions')->where('id',$id)->lockForUpdate()->first();
        if($s->status!=='OPEN')Records::error('cash_session_id','La caja ya está cerrada.');
        return $s;
    }
    public static function expected(object $session): int {
        $cash=DB::table('payment_methods')->where('code','CASH')->value('id');
        $payments=DB::table('payments')->where('cash_session_id',$session->id)->where('payment_method_id',$cash)->selectRaw('COALESCE(SUM(amount + tip_amount),0) as total')->value('total');
        $expenses=DB::table('expenses')->where('cash_session_id',$session->id)->where('payment_method_id',$cash)->sum('amount');
        $commissions=DB::table('commission_settlements')->where('cash_session_id',$session->id)->where('payment_method_id',$cash)->where('status','PAID')->sum('amount');
        return Money::cents((string)$session->opening_amount)+Money::cents((string)$payments)-Money::cents((string)$expenses)-Money::cents((string)$commissions);
    }
}
