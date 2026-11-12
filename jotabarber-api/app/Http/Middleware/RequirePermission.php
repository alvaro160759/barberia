<?php
namespace App\Http\Middleware;
use App\Support\Access;
use Closure;
use Illuminate\Http\Request;
class RequirePermission {
    public function handle(Request $r,Closure $next,string $permission) {
        Access::require($r->user()->id,$r->attributes->get('branch_id'),$permission);return $next($r);
    }
}
