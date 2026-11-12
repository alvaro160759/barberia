<?php
namespace App\Support;
use Illuminate\Support\Facades\DB;
class Audit {
    public static function log(int $branch,int $user,string $action,string $entity,int $id,array $values=[]): void {
        DB::table('audit_logs')->insert(['branch_id'=>$branch,'user_id'=>$user,'action'=>$action,'entity_type'=>$entity,'entity_id'=>$id,'new_values'=>$values?json_encode($values,JSON_THROW_ON_ERROR):null,'ip_address'=>request()->ip(),'occurred_at'=>now()]);
    }
}
