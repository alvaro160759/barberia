<?php
namespace App\Application\Appointments;
use App\Support\{Audit,Records};
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
class SaveAppointment {
    public function execute(array $d,int $branch,int $user,?int $id=null): object {
        return DB::transaction(function()use($d,$branch,$user,$id){
            $old=$id?DB::table('appointments')->where('id',$id)->where('branch_id',$branch)->first():null;
            if($id)abort_unless($old,404);
            // Orden global consistente de barberos: evita reservas cruzadas y reduce deadlocks.
            $barbers=array_unique(array_filter([$d['barber_id'],$old?->barber_id]));sort($barbers);
            DB::table('employees')->whereIn('id',$barbers)->orderBy('id')->lockForUpdate()->get();
            Records::barber((int)$d['barber_id'],$branch);
            Records::active('customers',(int)$d['customer_id']);
            if($id){$old=DB::table('appointments')->where('id',$id)->where('branch_id',$branch)->lockForUpdate()->first();
                if(!in_array($old->status,['PENDING','CONFIRMED']))Records::error('status','La cita ya no se puede reprogramar.');}
            $duration=0;$services=[];
            foreach($d['service_ids'] as $serviceId){
                $s=DB::table('branch_services as bs')->join('services as s','s.id','=','bs.service_id')->where('bs.branch_id',$branch)->where('s.id',$serviceId)->where('bs.active',true)->where('s.active',true)->select('bs.*','s.name')->first();
                if(!$s)Records::error('service_ids','Hay un servicio no disponible en la sucursal.');
                $duration+=(int)$s->duration_minutes;$services[]=$s;
            }
            $start=CarbonImmutable::parse($d['starts_at'])->utc();$end=$start->addMinutes($duration);
            if($start->isPast())Records::error('starts_at','La cita debe comenzar en el futuro.');
            $zone=DB::table('branches')->where('id',$branch)->value('timezone');$localStart=$start->setTimezone($zone);$localEnd=$end->setTimezone($zone);
            $schedule=DB::table('barber_schedules')->where('branch_id',$branch)->where('employee_id',$d['barber_id'])->where('weekday',$localStart->dayOfWeekIso)->where('active',true)->get();
            $fits=$localStart->toDateString()===$localEnd->toDateString() && $schedule->contains(fn($s)=>$s->starts_at<=$localStart->format('H:i:s') && $s->ends_at>=$localEnd->format('H:i:s'));
            if(!$fits)Records::error('starts_at','La cita no cabe en el horario configurado del barbero.');
            $q=DB::table('appointments')->where('barber_id',$d['barber_id'])->whereIn('status',['PENDING','CONFIRMED','IN_PROGRESS'])->where('starts_at','<',$end)->where('ends_at','>',$start);
            if($id)$q->where('id','<>',$id);
            if($q->exists())Records::error('starts_at','El barbero ya tiene una cita en ese horario.');
            if(DB::table('barber_time_off')->where('employee_id',$d['barber_id'])->where('starts_at','<',$end)->where('ends_at','>',$start)->exists())Records::error('starts_at','El barbero tiene un bloqueo en ese horario.');
            $values=['branch_id'=>$branch,'customer_id'=>$d['customer_id'],'barber_id'=>$d['barber_id'],'starts_at'=>$start,'ends_at'=>$end,'notes'=>$d['notes']??null,'updated_at'=>now()];
            if($id){DB::table('appointments')->where('id',$id)->update($values);DB::table('appointment_services')->where('appointment_id',$id)->delete();}
            else $id=Records::insert('appointments',$values+['created_by'=>$user,'status'=>'PENDING']);
            foreach($services as $s)Records::insert('appointment_services',['appointment_id'=>$id,'branch_id'=>$branch,'service_id'=>$s->service_id,'service_name'=>$s->name,'quoted_price'=>$s->price,'duration_minutes'=>$s->duration_minutes]);
            Audit::log($branch,$user,'SAVE','appointments',$id);return DB::table('appointments')->where('id',$id)->first();
        },3);
    }
}
