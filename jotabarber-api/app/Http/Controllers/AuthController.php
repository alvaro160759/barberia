<?php
namespace App\Http\Controllers;
use App\Models\User;
use App\Support\{Access,Api};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth,DB,Hash};
use Laravel\Sanctum\PersonalAccessToken;
class AuthController extends Controller {
    public function login(Request $r) {
        $d=$r->validate(['username'=>'required|string|max:60','password'=>'required|string|max:200','branch_id'=>'nullable|integer|min:1']);
        abort_unless($r->hasSession(),422,'Para login web envía Origin de Vite y solicita /sanctum/csrf-cookie; para Postman usa /auth/token.');
        if(!Auth::guard('web')->attempt(['username'=>$d['username'],'password'=>$d['password'],'active'=>true]))
            return response()->json(['success'=>false,'message'=>'Credenciales incorrectas.'],401);
        $r->session()->regenerate();$user=Auth::guard('web')->user();
        $branches=Access::branches($user->id);
        $branch=$d['branch_id']??($branches->count()===1?$branches->first()->id:null);
        if($branch && !Access::allowedBranch($user->id,(int)$branch)) {Auth::guard('web')->logout();$r->session()->invalidate();abort(403,'Sucursal no autorizada.');}
        $r->session()->forget('branch_id');if($branch)$r->session()->put('branch_id',(int)$branch);
        return Api::ok(['user'=>$user,'branches'=>$branches,'branch_id'=>$branch]);
    }
    public function token(Request $r) {
        $d=$r->validate(['username'=>'required|string|max:60','password'=>'required|string|max:200','branch_id'=>'nullable|integer|min:1']);
        $u=User::where('username',$d['username'])->first();
        if(!$u) return response()->json(['success'=>false,'message'=>'El usuario no existe.'],401);
        if(!$u->active) return response()->json(['success'=>false,'message'=>'El usuario está dado de baja.'],401);
        if(!Hash::check($d['password'],$u->password)) return response()->json(['success'=>false,'message'=>'La contraseña es incorrecta.'],401);
        $branches=Access::branches($u->id);$branch=$d['branch_id']??($branches->count()===1?$branches->first()->id:null);
        if($branch)abort_unless(Access::allowedBranch($u->id,(int)$branch),403,'Sucursal no autorizada.');
        $token=DB::transaction(function()use($u,$branch){
            $token=$u->createToken('jotabarber',['*'],now()->addMinutes(config('jotabarber.token_expiration_minutes')));
            if($branch)DB::table('token_branches')->insert(['token_id'=>$token->accessToken->id,'branch_id'=>$branch]);
            return $token;
        });
        return Api::ok(['token'=>$token->plainTextToken,'token_type'=>'Bearer','user'=>$u,'branches'=>$branches,'branch_id'=>$branch]);
    }
    public function me(Request $r) {return Api::ok(['user'=>$r->user(),'branches'=>Access::branches($this->user($r))]);}
    public function branches(Request $r) {return Api::ok(Access::branches($this->user($r)));}
    public function selectBranch(Request $r) {
        $branch=(int)$r->validate(['branch_id'=>'required|integer|min:1'])['branch_id'];
        abort_unless(Access::allowedBranch($this->user($r),$branch),403,'Sucursal no autorizada.');
        $token=$r->user()->currentAccessToken();
        if($token instanceof PersonalAccessToken) DB::table('token_branches')->updateOrInsert(['token_id'=>$token->id],['branch_id'=>$branch]);
        else {abort_unless($r->hasSession(),401);$r->session()->put('branch_id',$branch);}
        return Api::ok(['branch_id'=>$branch,'permissions'=>Access::permissions($this->user($r),$branch)]);
    }
    public function menu(Request $r) {
        $permissions=Access::permissions($this->user($r),$this->branch($r));
        $items=DB::table('menu_items as m')->leftJoin('permissions as p','p.id','=','m.permission_id')
            ->where('m.active',true)->where(function($q)use($permissions){$q->whereIn('p.code',$permissions)->orWhereNull('m.permission_id');})
            ->select('m.*')->orderBy('m.sort_order')->get();
        // Padres sin permiso solo se conservan si tienen un descendiente visible.
        $tree=function($parent)use(&$tree,$items){return $items->where('parent_id',$parent)->filter(function($item)use(&$tree){$item->children=$tree($item->id);return $item->permission_id!==null || $item->children->isNotEmpty();})->values();};
        return Api::ok(['permissions'=>$permissions,'menu'=>$tree(null)]);
    }
    public function logout(Request $r) {
        $token=$r->user()->currentAccessToken();
        if($token instanceof PersonalAccessToken)$token->delete();
        else {Auth::guard('web')->logout();$r->session()->invalidate();$r->session()->regenerateToken();}
        return Api::ok(null,'Sesión cerrada.');
    }
}
