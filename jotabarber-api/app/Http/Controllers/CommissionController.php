<?php
namespace App\Http\Controllers;
use App\Application\Commissions\PayCommission;
use App\Support\{Access,Api};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class CommissionController extends Controller {
    private function barber(Request $r): ?int {return $r->route('own')?Access::barber($this->user($r),$this->branch($r)):($r->filled('barber_id')?(int)$r->query('barber_id'):null);}
    public function pending(Request $r) {
        $paid=DB::table('payments')->select('sale_id')->selectRaw('SUM(amount) as paid')->groupBy('sale_id');
        $q=DB::table('sale_services as ss')->join('sales as s','s.id','=','ss.sale_id')->leftJoinSub($paid,'p','p.sale_id','=','s.id')
            ->leftJoin('commission_settlement_items as i','i.sale_service_id','=','ss.id')->where('ss.branch_id',$this->branch($r))->where('s.status','CONFIRMED')->whereNull('i.id')->whereRaw('COALESCE(p.paid,0)>=s.total_amount')
            ->select('ss.*','s.sold_at','s.number');
        if($barber=$this->barber($r))$q->where('ss.barber_id',$barber);
        return Api::ok($q->orderBy('s.sold_at')->paginate($this->perPage($r)));
    }
    public function index(Request $r) {
        $q=DB::table('commission_settlements')->where('branch_id',$this->branch($r));if($b=$this->barber($r))$q->where('barber_id',$b);
        return Api::ok($q->orderByDesc('id')->paginate($this->perPage($r)));
    }
    public function show(Request $r) {
        $q=DB::table('commission_settlements')->where('branch_id',$this->branch($r))->where('id',$r->route('id'));if($b=$this->barber($r))$q->where('barber_id',$b);
        $s=$q->first();abort_unless($s,404);$s->items=DB::table('commission_settlement_items')->where('settlement_id',$s->id)->get();return Api::ok($s);
    }
    public function store(Request $r,PayCommission $action) {
        $d=$r->validate(['operation_key'=>'required|uuid','barber_id'=>'required|integer','period_start'=>'required|date_format:Y-m-d','period_end'=>'required|date_format:Y-m-d|after_or_equal:period_start','sale_service_ids'=>'required|array|min:1|max:500','sale_service_ids.*'=>'required|integer|distinct','payment_method_id'=>'required|integer','cash_session_id'=>'nullable|integer','reference'=>'nullable|string|max:150','notes'=>'nullable|string|max:2000']);
        return Api::ok($action->execute($d,$this->branch($r),$this->user($r)),'Comisiones pagadas.',201);
    }
}
