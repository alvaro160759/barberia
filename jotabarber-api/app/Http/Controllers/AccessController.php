<?php
namespace App\Http\Controllers;
use App\Models\User;
use App\Support\{Api,Records};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class AccessController extends Controller {
    public function branches(Request $r) {return Api::ok(\App\Support\Access::branches($this->user($r)));}
    public function showBranch(Request $r) {
        $id=(int)$r->route('id');abort_unless(\App\Support\Access::allowedBranch($this->user($r),$id),403);
        \App\Support\Access::require($this->user($r),$id,'branches.view');
        $branch=DB::table('branches')->where('id',$id)->first();abort_unless($branch,404);
        return Api::ok($branch);
    }
    public function createBranch(Request $r) {
        $d=$r->validate(['code'=>'required|string|max:20|unique:branches,code','name'=>'required|string|max:120','address'=>'nullable|string|max:255','phone'=>'nullable|string|max:30','timezone'=>'sometimes|timezone','currency'=>'sometimes|in:PEN']);
        return DB::transaction(function()use($r,$d){$id=Records::insert('branches',$d);DB::table('user_branches')->insert(['user_id'=>$this->user($r),'branch_id'=>$id,'active'=>true,'created_at'=>now(),'updated_at'=>now()]);
            // Copiar los roles del creador, no otorgar un rol más poderoso implícitamente.
            foreach(DB::table('branch_user_roles')->where('user_id',$this->user($r))->where('branch_id',$this->branch($r))->pluck('role_id') as $role)DB::table('branch_user_roles')->insert(['user_id'=>$this->user($r),'branch_id'=>$id,'role_id'=>$role]);
            return Api::ok(DB::table('branches')->where('id',$id)->first(),'Sucursal creada.',201);});
    }
    public function updateBranch(Request $r) {
        $id=(int)$r->route('id');abort_unless(\App\Support\Access::allowedBranch($this->user($r),$id),403);
        \App\Support\Access::require($this->user($r),$id,'branches.manage');
        $d=$r->validate(['name'=>'required|string|max:120','address'=>'nullable|string|max:255','phone'=>'nullable|string|max:30','active'=>'sometimes|boolean']);
        // No permitir desactivar la sucursal actual del usuario
        if(isset($d['active'])&&!$d['active'] && $id===$this->branch($r))Records::error('active','No puedes desactivar tu sucursal actual.');
        DB::table('branches')->where('id',$id)->update($d+['updated_at'=>now()]);return Api::ok(DB::table('branches')->where('id',$id)->first());
    }
    public function deleteBranch(Request $r) {
        $id=(int)$r->route('id');abort_unless(\App\Support\Access::allowedBranch($this->user($r),$id),403);
        \App\Support\Access::require($this->user($r),$id,'branches.manage');
        // No permitir eliminar la sucursal actual del usuario
        if($id===$this->branch($r))Records::error('id','No puedes eliminar tu sucursal actual.');
        $branch=DB::table('branches')->where('id',$id)->first();abort_unless($branch,404);
        DB::transaction(function()use($id){
            DB::table('user_branches')->where('branch_id',$id)->delete();
            DB::table('branch_user_roles')->where('branch_id',$id)->delete();
            DB::table('branches')->where('id',$id)->delete();
        });return Api::ok(null,'Sucursal eliminada.');
    }
    public function users(Request $r) {
        return Api::ok(
            DB::table('users as u')
                ->join('user_branches as ub','ub.user_id','=','u.id')
                ->leftJoin('branches as b','b.id','=','ub.branch_id')
                ->leftJoin('branch_user_roles as bur','bur.user_id','=','u.id')
                ->leftJoin('roles as r','r.id','=','bur.role_id')
                ->where('ub.branch_id',$this->branch($r))
                ->where('bur.branch_id',$this->branch($r))
                ->select('u.id','u.name','u.username','u.email','u.active','ub.active as branch_active','b.name as branch_name','r.name as role_name')
                ->distinct()
                ->paginate($this->perPage($r))
        );
    }
    public function showUser(Request $r) {
        $id=(int)$r->route('id');
        abort_unless(DB::table('user_branches')->where('user_id',$id)->where('branch_id',$this->branch($r))->exists(),404);
        $user=DB::table('users as u')
            ->where('u.id',$id)
            ->select('u.id','u.name','u.username','u.email','u.active')
            ->first();
        $roles=DB::table('branch_user_roles as bur')
            ->join('roles as r','r.id','=','bur.role_id')
            ->where('bur.user_id',$id)
            ->where('bur.branch_id',$this->branch($r))
            ->pluck('r.id')
            ->toArray();
        $user->role_ids=$roles;
        return Api::ok($user);
    }
    public function createUser(Request $r) {
        $d=$r->validate(['name'=>'required|string|max:150','username'=>'required|string|max:60|unique:users,username','email'=>'nullable|email|max:150|unique:users,email','password'=>'required|string|min:12|max:200','role_ids'=>'required|array|min:1','role_ids.*'=>'required|integer|distinct|exists:roles,id']);
        return DB::transaction(function()use($r,$d){$roles=$d['role_ids'];$this->validateRoles($r,$roles);unset($d['role_ids']);$u=User::create($d+['active'=>true]);DB::table('user_branches')->insert(['user_id'=>$u->id,'branch_id'=>$this->branch($r),'active'=>true,'created_at'=>now(),'updated_at'=>now()]);foreach($roles as $role)DB::table('branch_user_roles')->insert(['user_id'=>$u->id,'branch_id'=>$this->branch($r),'role_id'=>$role]);return Api::ok($u,'Usuario creado.',201);});
    }
    public function updateUser(Request $r) {
        $id=(int)$r->route('id');abort_unless(DB::table('user_branches')->where('user_id',$id)->where('branch_id',$this->branch($r))->exists(),404);
        $d=$r->validate(['name'=>'sometimes|required|string|max:150','email'=>'sometimes|nullable|email|max:150','password'=>'sometimes|nullable|string|min:12|max:200','active'=>'sometimes|boolean']);
        if($id===$this->user($r)&&isset($d['active'])&&!$d['active'])Records::error('active','No puedes desactivar tu propia cuenta.');
        $u=DB::transaction(function()use($id,$d){
            $u=User::whereKey($id)->lockForUpdate()->firstOrFail();
            // Si la contraseña está vacía o null, no actualizarla
            if(empty($d['password']) || $d['password']===null){
                unset($d['password']);
            }
            $u->fill($d)->save();
            if(isset($d['password'])||isset($d['active'])&&!$d['active'])$u->tokens()->delete();
            return $u;
        });
        return Api::ok($u);
    }
    public function deleteUser(Request $r) {
        $id=(int)$r->route('id');abort_unless(DB::table('user_branches')->where('user_id',$id)->where('branch_id',$this->branch($r))->exists(),404);
        if($id===$this->user($r))Records::error('user_id','No puedes eliminar tu propia cuenta.');
        DB::transaction(function()use($id){User::whereKey($id)->lockForUpdate()->firstOrFail()->delete();});return Api::ok(null,'Usuario eliminado.');
    }
    public function assignUser(Request $r) {
        $d=$r->validate(['user_id'=>'required|integer|exists:users,id','role_ids'=>'required|array','role_ids.*'=>'required|integer|distinct|exists:roles,id','active'=>'required|boolean']);
        $this->validateRoles($r,$d['role_ids']);
        if($d['user_id']===$this->user($r))Records::error('user_id','Modifica tu acceso desde otra cuenta administradora.');
        DB::transaction(function()use($r,$d){
            User::whereKey($d['user_id'])->lockForUpdate()->firstOrFail();
            DB::table('user_branches')->upsert([['user_id'=>$d['user_id'],'branch_id'=>$this->branch($r),'active'=>$d['active'],'created_at'=>now(),'updated_at'=>now()]],['user_id','branch_id'],['active','updated_at']);
            DB::table('branch_user_roles')->where('user_id',$d['user_id'])->where('branch_id',$this->branch($r))->delete();
            foreach($d['role_ids'] as $role)DB::table('branch_user_roles')->insert(['user_id'=>$d['user_id'],'branch_id'=>$this->branch($r),'role_id'=>$role]);
        });return Api::ok();
    }
    private function validateRoles(Request $r,array $roles): void {
        $requested=DB::table('role_permissions as rp')->join('permissions as p','p.id','=','rp.permission_id')->whereIn('rp.role_id',$roles)->pluck('p.code');
        abort_unless($requested->diff(\App\Support\Access::permissions($this->user($r),$this->branch($r)))->isEmpty(),403,'No puedes otorgar permisos que no posees.');
    }
    public function roles(Request $r) {return Api::ok(DB::table('roles')->orderBy('name')->get()->map(function($role){$role->permission_ids=DB::table('role_permissions')->where('role_id',$role->id)->pluck('permission_id');return $role;}));}
    public function showRole(Request $r) {
        $id=(int)$r->route('id');
        $role=DB::table('roles')->where('id',$id)->first();
        abort_unless($role,404);
        $role->permission_ids=DB::table('role_permissions')->where('role_id',$role->id)->pluck('permission_id');
        return Api::ok($role);
    }
    public function permissions(Request $r) {return Api::ok(DB::table('permissions')->orderBy('module')->orderBy('code')->get());}
    public function menus(Request $r) {return Api::ok(DB::table('menu_items')->orderBy('sort_order')->get());}
    public function updateMenu(Request $r) {
        $d=$r->validate(['label'=>'required|string|max:120','route'=>'nullable|string|max:150','icon'=>'nullable|string|max:60','sort_order'=>'required|integer|min:0','permission_id'=>'required|integer|exists:permissions,id','active'=>'required|boolean']);
        $id=(int)$r->route('id');abort_unless(DB::table('menu_items')->where('id',$id)->exists(),404);DB::table('menu_items')->where('id',$id)->update($d+['updated_at'=>now()]);return Api::ok();
    }
    public function saveRole(Request $r) {
        $d=$r->validate(['code'=>'required|string|max:60','name'=>'required|string|max:120','description'=>'nullable|string|max:255','permission_ids'=>'required|array','permission_ids.*'=>'required|integer|distinct|exists:permissions,id']);
        return DB::transaction(function()use($r,$d){$permissions=$d['permission_ids'];unset($d['permission_ids']);$id=(int)$r->route('id');
            if($id){$role=DB::table('roles')->where('id',$id)->lockForUpdate()->first();abort_unless($role,404);if($role->code==='admin')Records::error('code','El rol inicial admin se conserva para recuperación; crea y configura otros roles.');DB::table('roles')->where('id',$id)->update($d+['updated_at'=>now()]);}
            else $id=Records::insert('roles',$d);
            DB::table('role_permissions')->where('role_id',$id)->delete();foreach($permissions as $p)DB::table('role_permissions')->insert(['role_id'=>$id,'permission_id'=>$p]);return Api::ok(DB::table('roles')->where('id',$id)->first());});
    }
    public function deleteRole(Request $r) {
        $id=(int)$r->route('id');$role=DB::table('roles')->where('id',$id)->first();abort_unless($role,404);
        if($role->code==='admin')Records::error('code','El rol admin no puede eliminarse.');
        DB::transaction(function()use($id){DB::table('role_permissions')->where('role_id',$id)->delete();DB::table('roles')->where('id',$id)->delete();});return Api::ok(null,'Rol eliminado.');
    }
}
