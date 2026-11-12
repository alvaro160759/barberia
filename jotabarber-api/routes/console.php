<?php
use App\Models\User;
use Illuminate\Support\Facades\{Artisan,DB};
Artisan::command('jotabarber:admin',function(){
    $username=$this->ask('Usuario administrador');$name=$this->ask('Nombre');$password=$this->secret('Contraseña (mínimo 12 caracteres)');
    if(!$username || !$name || strlen((string)$password)<12){$this->error('Datos inválidos.');return 1;}
    if(User::where('username',$username)->exists()){$this->error('El usuario ya existe; no se sobrescribió.');return 1;}
    $role=DB::table('roles')->where('code','admin')->first();if(!$role){$this->error('Ejecuta db:seed primero.');return 1;}
    DB::transaction(function()use($username,$name,$password,$role){
        $u=User::create(['username'=>$username,'name'=>$name,'password'=>$password,'active'=>true]);
        $branches=DB::table('branches')->where('active',true)->get();
        if($branches->isEmpty()){$id=DB::table('branches')->insertGetId(['code'=>'CENTRO','name'=>'Sucursal Centro','active'=>true,'created_at'=>now(),'updated_at'=>now()]);$branches=collect([(object)['id'=>$id]]);}
        foreach($branches as $b){DB::table('user_branches')->insert(['user_id'=>$u->id,'branch_id'=>$b->id,'active'=>true,'created_at'=>now(),'updated_at'=>now()]);DB::table('branch_user_roles')->insert(['user_id'=>$u->id,'branch_id'=>$b->id,'role_id'=>$role->id]);}
    });$this->info('Administrador creado.');return 0;
})->purpose('Crear el primer administrador sin contraseñas predeterminadas');
