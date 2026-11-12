<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
class AppServiceProvider extends ServiceProvider {
    public function register(): void {}
    public function boot(): void {
        RateLimiter::for('api',fn(Request $r)=>Limit::perMinute(120)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('login',fn(Request $r)=>[Limit::perMinute(20)->by($r->ip()),Limit::perMinute(5)->by(strtolower((string)$r->input('username')).'|'.$r->ip())]);
    }
}
