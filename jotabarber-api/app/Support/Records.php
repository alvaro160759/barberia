<?php
namespace App\Support;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
class Records {
    public static function active(string $table,int $id): object {
        $row=DB::table($table)->where('id',$id)->where('active',true)->first();
        if(!$row) throw ValidationException::withMessages([$table=>'Registro inexistente o inactivo.']);
        return $row;
    }
    public static function barber(int $id,int $branch,bool $lock=false): object {
        $q=DB::table('employees')->where('id',$id)->where('job_type','BARBER')->where('active',true);
        $barber=($lock?$q->lockForUpdate():$q)->first();
        if(!$barber || !DB::table('employee_branches')->where('employee_id',$id)->where('branch_id',$branch)->where('active',true)->exists())
            throw ValidationException::withMessages(['barber_id'=>'Barbero no disponible en la sucursal.']);
        return $barber;
    }
    public static function error(string $field,string $message): never {throw ValidationException::withMessages([$field=>$message]);}
    public static function insert(string $table,array $data): int {return DB::table($table)->insertGetId($data+['created_at'=>now(),'updated_at'=>now()]);}
}
