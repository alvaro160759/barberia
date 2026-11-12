<?php
namespace App\Http\Controllers;
use App\Application\Appointments\SaveAppointment;
use App\Support\{Access,Api,Audit,Records};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class AppointmentController extends Controller {
    public function index(Request $r) {
        $q=DB::table('appointments')->where('branch_id',$this->branch($r));
        if($r->route('own'))$q->where('barber_id',Access::barber($this->user($r),$this->branch($r)));
        elseif($r->filled('barber_id'))$q->where('barber_id',(int)$r->query('barber_id'));
        if($r->filled('status'))$q->where('status',$r->query('status'));
        $dates=$r->validate(['from'=>'sometimes|date','to'=>'sometimes|date|after:from']);
        if(isset($dates['from']))$q->where('starts_at','>=',\Carbon\CarbonImmutable::parse($dates['from'])->utc());
        if(isset($dates['to']))$q->where('starts_at','<',\Carbon\CarbonImmutable::parse($dates['to'])->utc());
        return Api::ok($q->orderBy('starts_at')->paginate($this->perPage($r)));
    }
    public function show(Request $r) {
        $q=DB::table('appointments')->where('branch_id',$this->branch($r))->where('id',$r->route('id'));
        if($r->route('own'))$q->where('barber_id',Access::barber($this->user($r),$this->branch($r)));
        $row=$q->first();abort_unless($row,404);$row->services=DB::table('appointment_services')->where('appointment_id',$row->id)->get();return Api::ok($row);
    }
    public function store(Request $r,SaveAppointment $action) {return $this->save($r,$action,null);}
    public function update(Request $r,SaveAppointment $action) {return $this->save($r,$action,(int)$r->route('id'));}
    private function save(Request $r,SaveAppointment $action,?int $id) {
        $d=$r->validate(['customer_id'=>'required|integer','barber_id'=>'required|integer','starts_at'=>['required','date','regex:/(Z|[+-]\d{2}:\d{2})$/'],'service_ids'=>'required|array|min:1|max:20','service_ids.*'=>'required|integer|distinct','notes'=>'nullable|string|max:2000']);
        return Api::ok($action->execute($d,$this->branch($r),$this->user($r),$id),'Cita guardada.',$id?200:201);
    }
    public function changeStatus(Request $r) {
        $d=$r->validate(['status'=>'required|in:CONFIRMED,IN_PROGRESS,COMPLETED,CANCELLED,NO_SHOW','reason'=>'nullable|string|max:255']);$id=(int)$r->route('id');
        return DB::transaction(function()use($r,$id,$d){
            $a=DB::table('appointments')->where('id',$id)->where('branch_id',$this->branch($r))->first();abort_unless($a,404);
            DB::table('employees')->where('id',$a->barber_id)->lockForUpdate()->first();
            $a=DB::table('appointments')->where('id',$id)->lockForUpdate()->first();
            $allowed=['PENDING'=>['CONFIRMED','CANCELLED','NO_SHOW'],'CONFIRMED'=>['IN_PROGRESS','CANCELLED','NO_SHOW'],'IN_PROGRESS'=>['COMPLETED','CANCELLED']];
            if(!in_array($d['status'],$allowed[$a->status]??[]))Records::error('status','Transición de estado no permitida.');
            if(in_array($d['status'],['CANCELLED','NO_SHOW']) && DB::table('sales')->where('appointment_id',$id)->where('status','CONFIRMED')->exists())Records::error('status','La cita tiene una venta confirmada.');
            if($d['status']==='NO_SHOW' && now()->lt($a->starts_at))Records::error('status','La cita todavía no ha comenzado.');
            DB::table('appointments')->where('id',$id)->update(['status'=>$d['status'],'cancellation_reason'=>$d['status']==='CANCELLED'?($d['reason']??null):null,'updated_at'=>now()]);Audit::log($this->branch($r),$this->user($r),'STATUS','appointments',$id,$d);return Api::ok();
        },3);
    }
}
