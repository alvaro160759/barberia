<?php
namespace App\Http\Controllers;
use App\Support\{Api,Audit,Cash,Money,Records};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class CashController extends Controller {
    public function index(Request $r) {return Api::ok(DB::table('cash_sessions')->where('branch_id',$this->branch($r))->orderByDesc('id')->paginate($this->perPage($r)));}
    public function open(Request $r) {
        $d=$r->validate(['cash_register_id'=>'required|integer','opening_amount'=>'required|regex:/^\d{1,8}(\.\d{1,2})?$/']);
        return DB::transaction(function()use($r,$d){
            $register=DB::table('cash_registers')->where('id',$d['cash_register_id'])->where('branch_id',$this->branch($r))->where('active',true)->lockForUpdate()->first();
            if(!$register)Records::error('cash_register_id','Caja no disponible.');
            if(DB::table('cash_sessions')->where('cash_register_id',$register->id)->where('status','OPEN')->exists())Records::error('cash_register_id','La caja ya tiene una sesión abierta.');
            $id=Records::insert('cash_sessions',['branch_id'=>$this->branch($r),'cash_register_id'=>$register->id,'opened_by'=>$this->user($r),'opened_at'=>now(),'opening_amount'=>Money::decimal(Money::cents((string)$d['opening_amount'])),'status'=>'OPEN']);
            Audit::log($this->branch($r),$this->user($r),'OPEN','cash_sessions',$id);return Api::ok(DB::table('cash_sessions')->where('id',$id)->first(),'Caja abierta.',201);
        },3);
    }
    public function show(Request $r) {
        $s=DB::table('cash_sessions')->where('id',$r->route('id'))->where('branch_id',$this->branch($r))->first();abort_unless($s,404);
        $s->current_expected_amount=Money::decimal(Cash::expected($s));return Api::ok($s);
    }
    public function close(Request $r) {
        $d=$r->validate(['counted_amount'=>'required|regex:/^\d{1,8}(\.\d{1,2})?$/']);
        return DB::transaction(function()use($r,$d){
            $s=Cash::session((int)$r->route('id'),$this->branch($r),'CASH');$expected=Cash::expected($s);$counted=Money::cents((string)$d['counted_amount']);
            DB::table('cash_sessions')->where('id',$s->id)->update(['status'=>'CLOSED','closed_by'=>$this->user($r),'closed_at'=>now(),'expected_amount'=>Money::decimal($expected),'counted_amount'=>Money::decimal($counted),'difference_amount'=>Money::decimal($counted-$expected),'updated_at'=>now()]);
            Audit::log($this->branch($r),$this->user($r),'CLOSE','cash_sessions',$s->id);return Api::ok(DB::table('cash_sessions')->where('id',$s->id)->first(),'Caja cerrada.');
        },3);
    }
}
