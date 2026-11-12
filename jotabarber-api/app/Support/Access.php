<?php
namespace App\Support;
use Illuminate\Support\Facades\DB;
class Access {
    public static function branches(int $userId) {
        return DB::table('branches as b')->join('user_branches as ub','ub.branch_id','=','b.id')
            ->where('ub.user_id',$userId)->where('ub.active',true)
            ->select('b.id','b.code','b.name','b.address','b.phone','b.active','b.timezone','b.currency')->orderBy('b.id')->get();
    }
    public static function allowedBranch(int $userId,int $branch): bool {
        return self::branches($userId)->contains('id',$branch);
    }
    public static function permissions(int $userId,int $branch) {
        return DB::table('branch_user_roles as bur')->join('role_permissions as rp','rp.role_id','=','bur.role_id')
            ->join('permissions as p','p.id','=','rp.permission_id')->where('bur.user_id',$userId)
            ->where('bur.branch_id',$branch)->distinct()->pluck('p.code');
    }
    public static function require(int $userId,int $branch,string $permission): void {
        abort_unless(self::permissions($userId,$branch)->contains($permission),403,'No tienes permiso para esta acción.');
    }
    public static function barber(int $userId,int $branch): int {
        $id=DB::table('employees as e')->join('employee_branches as eb','eb.employee_id','=','e.id')
            ->where('e.user_id',$userId)->where('e.active',true)->where('e.job_type','BARBER')
            ->where('eb.branch_id',$branch)->where('eb.active',true)->value('e.id');
        abort_unless($id,403,'El usuario no tiene un barbero activo asociado a esta sucursal.');
        return (int)$id;
    }
}
