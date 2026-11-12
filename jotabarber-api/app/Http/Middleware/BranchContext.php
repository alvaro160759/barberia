<?php
namespace App\Http\Middleware;
use App\Support\Access;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;
class BranchContext {
    public function handle(Request $r,Closure $next) {
        $token=$r->user()->currentAccessToken();
        $branch=$token instanceof PersonalAccessToken
            ? DB::table('token_branches')->where('token_id',$token->id)->value('branch_id')
            : ($r->hasSession()?$r->session()->get('branch_id'):null);
        abort_unless($branch && Access::allowedBranch($r->user()->id,(int)$branch),403,'Selecciona una sucursal autorizada.');
        $r->attributes->set('branch_id',(int)$branch);return $next($r);
    }
}
