<?php
namespace App\Http\Controllers;
use App\Support\{Api,Records};
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ScheduleController extends Controller {
    public function schedules(Request $r) {return Api::ok(DB::table('barber_schedules')->where('branch_id',$this->branch($r))->orderBy('weekday')->get());}
    public function createSchedule(Request $r) {
        $d=$r->validate(['employee_id'=>'required|integer','weekday'=>'required|integer|min:1|max:7','starts_at'=>'required|date_format:H:i:s','ends_at'=>'required|date_format:H:i:s|after:starts_at']);
        return DB::transaction(function()use($r,$d){Records::barber((int)$d['employee_id'],$this->branch($r),true);
            if(DB::table('barber_schedules')->where('branch_id',$this->branch($r))->where('employee_id',$d['employee_id'])->where('weekday',$d['weekday'])->where('active',true)->where('starts_at','<',$d['ends_at'])->where('ends_at','>',$d['starts_at'])->exists())Records::error('starts_at','El horario se superpone con otro turno.');
            return Api::ok(['id'=>Records::insert('barber_schedules',$d+['branch_id'=>$this->branch($r),'active'=>true])],'Horario creado.',201);});
    }
    public function deleteSchedule(Request $r) {
        return DB::transaction(function()use($r){$id=(int)$r->route('id');$s=DB::table('barber_schedules')->where('id',$id)->where('branch_id',$this->branch($r))->first();abort_unless($s,404);DB::table('employees')->where('id',$s->employee_id)->lockForUpdate()->first();DB::table('barber_schedules')->where('id',$id)->update(['active'=>false,'updated_at'=>now()]);return Api::ok();});
    }
    public function timeOff(Request $r) {return Api::ok(DB::table('barber_time_off')->where('branch_id',$this->branch($r))->orderByDesc('starts_at')->paginate($this->perPage($r)));}
    public function createTimeOff(Request $r) {
        $d=$r->validate(['employee_id'=>'required|integer','starts_at'=>['required','date','regex:/(Z|[+-]\d{2}:\d{2})$/'],'ends_at'=>['required','date','after:starts_at','regex:/(Z|[+-]\d{2}:\d{2})$/'],'reason'=>'required|string|max:255']);
        return DB::transaction(function()use($r,$d){Records::barber((int)$d['employee_id'],$this->branch($r),true);$d['starts_at']=CarbonImmutable::parse($d['starts_at'])->utc();$d['ends_at']=CarbonImmutable::parse($d['ends_at'])->utc();
            if(DB::table('appointments')->where('barber_id',$d['employee_id'])->whereIn('status',['PENDING','CONFIRMED','IN_PROGRESS'])->where('starts_at','<',$d['ends_at'])->where('ends_at','>',$d['starts_at'])->exists())Records::error('starts_at','Primero reprograma las citas que se superponen con el bloqueo.');
            return Api::ok(['id'=>Records::insert('barber_time_off',$d+['branch_id'=>$this->branch($r)])],'Bloqueo creado.',201);},3);
    }
    public function deleteTimeOff(Request $r) {
        return DB::transaction(function()use($r){$id=(int)$r->route('id');$s=DB::table('barber_time_off')->where('id',$id)->where('branch_id',$this->branch($r))->first();abort_unless($s,404);DB::table('employees')->where('id',$s->employee_id)->lockForUpdate()->first();DB::table('barber_time_off')->where('id',$id)->delete();return Api::ok();});
    }
}
