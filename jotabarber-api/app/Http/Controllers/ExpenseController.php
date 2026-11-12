<?php
namespace App\Http\Controllers;
use App\Support\{Api,Audit,Cash,Idempotency,Money,Records};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ExpenseController extends Controller {
    public function index(Request $r) {return Api::ok(DB::table('expenses')->where('branch_id',$this->branch($r))->orderByDesc('id')->paginate($this->perPage($r)));}
    public function show(Request $r) {$e=DB::table('expenses')->where('branch_id',$this->branch($r))->where('id',$r->route('id'))->first();abort_unless($e,404);return Api::ok($e);}
    public function store(Request $r) {
        $d=$r->validate(['operation_key'=>'required|uuid','category_id'=>'required|integer','description'=>'required|string|max:255','amount'=>'required|regex:/^\d{1,8}(\.\d{1,2})?$/','payment_method_id'=>'required|integer','cash_session_id'=>'nullable|integer','reference'=>'nullable|string|max:100']);$hash=Idempotency::hash($d,$this->branch($r));
        return DB::transaction(function()use($r,$d,$hash){
            Records::active('expense_categories',(int)$d['category_id']);$method=Records::active('payment_methods',(int)$d['payment_method_id']);
            $session=Cash::session($d['cash_session_id']??null,$this->branch($r),$method->code);
            $old=DB::table('expenses')->where('operation_key',$d['operation_key'])->first();if($old){Idempotency::match($old,$this->branch($r),$hash);return Api::ok($old);}
            $amount=Money::cents((string)$d['amount']);if($amount<=0)Records::error('amount','El gasto debe ser positivo.');
            if($method->code==='CASH' && Cash::expected($session)<$amount)Records::error('amount','Efectivo disponible insuficiente.');
            $id=Records::insert('expenses',$d+['branch_id'=>$this->branch($r),'spent_at'=>now(),'created_by'=>$this->user($r),'request_hash'=>$hash]);
            Audit::log($this->branch($r),$this->user($r),'CREATE','expenses',$id);return Api::ok(DB::table('expenses')->where('id',$id)->first(),'Gasto registrado.',201);
        },3);
    }
}
