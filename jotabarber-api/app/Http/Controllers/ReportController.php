<?php
namespace App\Http\Controllers;
use App\Support\{Access,Api};
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ReportController extends Controller {
    private function range(Request $r): array {
        if($r->has('all_branches')) {
            $flag=filter_var($r->input('all_branches'),FILTER_VALIDATE_BOOLEAN,FILTER_NULL_ON_FAILURE);
            if($flag===null)\App\Support\Records::error('all_branches','Valor booleano inválido.');
            $r->merge(['all_branches'=>$flag]);
        }
        $d=$r->validate(['from'=>'required|date_format:Y-m-d','to'=>'required|date_format:Y-m-d|after_or_equal:from','all_branches'=>'sometimes|boolean']);
        $zone=DB::table('branches')->where('id',$this->branch($r))->value('timezone');$from=CarbonImmutable::parse($d['from'],$zone)->startOfDay();$end=CarbonImmutable::parse($d['to'],$zone)->addDay()->startOfDay();
        if($from->diffInDays($end)>366)\App\Support\Records::error('to','Consulta hasta 366 días por solicitud.');
        $branches=[$this->branch($r)];if($r->boolean('all_branches')){Access::require($this->user($r),$this->branch($r),'reports.global');$branches=Access::branches($this->user($r))->pluck('id')->all();}
        return [$from->utc(),$end->utc(),$zone,$branches];
    }
    public function dashboard(Request $r) {
        [$from,$end,$zone,$branches]=$this->range($r);
        $sales=DB::table('sales')->whereIn('branch_id',$branches)->where('status','CONFIRMED')->where('sold_at','>=',$from)->where('sold_at','<',$end);
        $payments=DB::table('payments')->whereIn('branch_id',$branches)->where('paid_at','>=',$from)->where('paid_at','<',$end);
        $expenses=DB::table('expenses')->whereIn('branch_id',$branches)->where('spent_at','>=',$from)->where('spent_at','<',$end);
        $commissions=DB::table('commission_settlements')->whereIn('branch_id',$branches)->where('status','PAID')->where('paid_at','>=',$from)->where('paid_at','<',$end);
        $revenue=(clone $sales)->sum('total_amount');$collected=(clone $payments)->sum('amount');$tips=(clone $payments)->sum('tip_amount');$spent=(clone $expenses)->sum('amount');$paidCommissions=(clone $commissions)->sum('amount');
        $daily=[];for($date=$from->setTimezone($zone);$date->lt($end->setTimezone($zone));$date=$date->addDay())$daily[$date->toDateString()]=['date'=>$date->toDateString(),'sales'=>'0.00','collections'=>'0.00','expenses'=>'0.00','commissions'=>'0.00'];
        foreach([['query'=>$sales,'date'=>'sold_at','amount'=>'total_amount','key'=>'sales'],['query'=>$payments,'date'=>'paid_at','amount'=>'amount','key'=>'collections'],['query'=>$expenses,'date'=>'spent_at','amount'=>'amount','key'=>'expenses'],['query'=>$commissions,'date'=>'paid_at','amount'=>'amount','key'=>'commissions']] as $source){
            foreach((clone $source['query'])->select($source['date'],$source['amount'])->cursor() as $row){$day=CarbonImmutable::parse($row->{$source['date']},'UTC')->setTimezone($zone)->toDateString();$daily[$day][$source['key']]=bcadd($daily[$day][$source['key']],(string)$row->{$source['amount']},2);}
        }
        return Api::ok(['sales_total'=>(string)$revenue,'sales_count'=>(clone $sales)->count(),'collections_total'=>(string)$collected,'tips_total'=>(string)$tips,'expenses_total'=>(string)$spent,'commissions_paid'=>(string)$paidCommissions,'operating_cash_flow'=>bcsub(bcsub((string)$collected,(string)$spent,2),(string)$paidCommissions,2),'daily'=>array_values($daily),'timezone'=>$zone]);
    }
    public function byBarber(Request $r) {
        [$from,$end,$zone,$branches]=$this->range($r);
        return Api::ok(DB::table('sale_services as ss')->join('sales as s','s.id','=','ss.sale_id')->join('employees as e','e.id','=','ss.barber_id')
            ->whereIn('s.branch_id',$branches)->where('s.status','CONFIRMED')->where('s.sold_at','>=',$from)->where('s.sold_at','<',$end)
            ->select('ss.barber_id','e.first_name','e.last_name')->selectRaw('SUM(ss.quantity) as services_count,SUM(ss.net_amount) as services_sales,SUM(ss.barber_amount) as barber_earned,SUM(ss.owner_amount) as owner_share')
            ->groupBy('ss.barber_id','e.first_name','e.last_name')->orderByDesc('services_sales')->get());
    }
    public function audit(Request $r) {return Api::ok(DB::table('audit_logs')->where('branch_id',$this->branch($r))->orderByDesc('id')->paginate($this->perPage($r)));}
}
