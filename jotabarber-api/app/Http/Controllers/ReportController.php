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
        $d=$r->validate(['barber_id'=>'nullable|integer|min:1','service_id'=>'nullable|integer|min:1','branch_id'=>'nullable|integer|min:1']);
        // Convertir a enteros por si vienen como strings
        if(isset($d['barber_id']))$d['barber_id']=(int)$d['barber_id'];
        if(isset($d['service_id']))$d['service_id']=(int)$d['service_id'];
        if(isset($d['branch_id']))$d['branch_id']=(int)$d['branch_id'];
        if(!empty($d['branch_id'])){
            Access::require($this->user($r),$this->branch($r),'reports.global');
            $branches=[(int)$d['branch_id']];
        }
        $base=DB::table('sale_services as ss')->join('sales as s','s.id','=','ss.sale_id')->join('employees as e','e.id','=','ss.barber_id')
            ->join('services as svc','svc.id','=','ss.service_id')
            ->whereIn('s.branch_id',$branches)->where('s.status','CONFIRMED')->where('s.sold_at','>=',$from)->where('s.sold_at','<',$end);
        if(!empty($d['barber_id']))$base->where('ss.barber_id',$d['barber_id']);
        if(!empty($d['service_id']))$base->where('ss.service_id',$d['service_id']);
        $byBarber=(clone $base)->select('ss.barber_id','e.first_name','e.last_name')->selectRaw('SUM(ss.quantity) as services_count,SUM(ss.net_amount) as services_sales,SUM(ss.barber_amount) as barber_earned,AVG(svc.commission_percentage) as avg_commission_pct')
            ->groupBy('ss.barber_id','e.first_name','e.last_name')->orderByDesc('services_sales')->get();
        $byServiceType=(clone $base)->select('svc.name')->selectRaw('SUM(ss.quantity) as count')->groupBy('svc.id','svc.name')->orderByDesc('count')->get();
        $byBarberMap=$byBarber->keyBy('barber_id');
        $totalServices=$byBarber->sum('services_count');
        $totalClients=DB::table('sales')->whereIn('branch_id',$branches)->where('status','CONFIRMED')->where('sold_at','>=',$from)->where('sold_at','<',$end)->distinct('customer_id')->count('customer_id');
        $totalSales=$byBarber->sum('services_sales');
        $totalCommissions=$byBarber->sum('barber_earned');
        $details=null;
        if(!empty($d['barber_id'])){
            $details=DB::table('sale_services as ss')->join('sales as s','s.id','=','ss.sale_id')->leftJoin('customers as c','c.id','=','s.customer_id')
                ->join('services as svc','svc.id','=','ss.service_id')
                ->whereIn('s.branch_id',$branches)->where('s.status','CONFIRMED')->where('s.sold_at','>=',$from)->where('s.sold_at','<',$end)->where('ss.barber_id',$d['barber_id'])
                ->select('s.sold_at','c.first_name as customer_first_name','c.last_name as customer_last_name','svc.name as service_name','ss.unit_price as price','ss.quantity','ss.barber_percentage','ss.barber_amount')
                ->orderBy('s.sold_at')->get();
        }
        return Api::ok(['summary'=>['services_count'=>(int)$totalServices,'clients_count'=>(int)$totalClients,'total_sales'=>(string)$totalSales,'total_commissions'=>(string)$totalCommissions],'by_barber'=>$byBarber,'by_service_type'=>$byServiceType,'details'=>$details]);
    }
    public function audit(Request $r) {return Api::ok(DB::table('audit_logs')->where('branch_id',$this->branch($r))->orderByDesc('id')->paginate($this->perPage($r)));}
}
