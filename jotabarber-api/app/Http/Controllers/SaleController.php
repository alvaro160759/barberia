<?php
namespace App\Http\Controllers;
use App\Application\Sales\{CreateSale,RegisterPayment,CancelSale};
use App\Support\{Access,Api,Money};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class SaleController extends Controller {
    public function index(Request $r) {
        $q=DB::table('sales as s')
            ->leftJoin('customers as c','c.id','=','s.customer_id')
            ->leftJoin('sale_services as ss','ss.sale_id','=','s.id')
            ->leftJoin('employees as e','e.id','=','ss.barber_id')
            ->select('s.id','s.number','s.sold_at','s.status','s.total_amount','s.subtotal_amount','s.discount_amount','s.customer_id','c.first_name as customer_first_name','c.last_name as customer_last_name','c.document_number as customer_document',DB::raw('MAX(e.first_name) as barber_first_name'),DB::raw('MAX(e.last_name) as barber_last_name'))
            ->selectSub(DB::table('sale_services')->whereColumn('sale_id','s.id')->selectRaw('COUNT(*)'),'services_count')
            ->selectSub(DB::table('sale_products')->whereColumn('sale_id','s.id')->selectRaw('COUNT(*)'),'products_count')
            ->groupBy('s.id','s.number','s.sold_at','s.status','s.total_amount','s.subtotal_amount','s.discount_amount','s.customer_id','c.first_name','c.last_name','c.document_number');
        if($r->filled('branch_id')){
            Access::require($this->user($r),$this->branch($r),'reports.global');
            $q->where('s.branch_id',(int)$r->input('branch_id'));
        }else{
            $q->where('s.branch_id',$this->branch($r));
        }
        if($r->filled('from'))$q->where('s.sold_at','>=',$r->input('from'));
        if($r->filled('to'))$q->where('s.sold_at','<=',$r->input('to').' 23:59:59');
        if($r->filled('status'))$q->where('s.status',$r->query('status'));
        return Api::ok($q->orderByDesc('s.id')->paginate($this->perPage($r)));
    }
    public function show(Request $r) {
        $s=DB::table('sales')->where('id',$r->route('id'))->where('branch_id',$this->branch($r))->first();abort_unless($s,404);
        $s->services=DB::table('sale_services')->where('sale_id',$s->id)->get();$s->products=DB::table('sale_products')->where('sale_id',$s->id)->get();$s->payments=DB::table('payments')->where('sale_id',$s->id)->get();
        $paid=$s->payments->reduce(fn($sum,$p)=>$sum+Money::cents((string)$p->amount),0);$s->paid_amount=Money::decimal($paid);$s->pending_amount=Money::decimal(Money::cents((string)$s->total_amount)-$paid);return Api::ok($s);
    }
    public function store(Request $r,CreateSale $action) {
        $d=$r->validate(['operation_key'=>'required|uuid','customer_id'=>'nullable|integer','appointment_id'=>'nullable|integer','notes'=>'nullable|string|max:2000','services'=>'sometimes|array|max:50','services.*.service_id'=>'required|integer','services.*.barber_id'=>'required|integer','services.*.quantity'=>'required|integer|min:1|max:100','services.*.discount_amount'=>'sometimes|regex:/^\d{1,8}(\.\d{1,2})?$/','products'=>'sometimes|array|max:50','products.*.product_id'=>'required|integer|distinct','products.*.quantity'=>'required|integer|min:1|max:10000','products.*.discount_amount'=>'sometimes|regex:/^\d{1,8}(\.\d{1,2})?$/']);
        return Api::ok($action->execute($d,$this->branch($r),$this->user($r)),'Venta registrada.',201);
    }
    public function payment(Request $r,RegisterPayment $action) {
        $d=$r->validate(['operation_key'=>'required|uuid','payment_method_id'=>'required|integer','cash_session_id'=>'nullable|integer','amount'=>'required|regex:/^\d{1,8}(\.\d{1,2})?$/','tip_amount'=>'sometimes|regex:/^\d{1,8}(\.\d{1,2})?$/','reference'=>'nullable|string|max:150']);
        return Api::ok($action->execute($d,(int)$r->route('id'),$this->branch($r),$this->user($r)),'Cobro registrado.',201);
    }
    public function cancel(Request $r,CancelSale $action) {$d=$r->validate(['reason'=>'required|string|max:255']);return Api::ok($action->execute((int)$r->route('id'),$d['reason'],$this->branch($r),$this->user($r)),'Venta anulada.');}
}
