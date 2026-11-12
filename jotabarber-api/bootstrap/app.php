<?php
use App\Http\Middleware\ActiveUser;
use App\Http\Middleware\BranchContext;
use App\Http\Middleware\RequirePermission;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(api: __DIR__.'/../routes/api.php', commands: __DIR__.'/../routes/console.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->alias(['active' => ActiveUser::class, 'branch' => BranchContext::class, 'permission' => RequirePermission::class]);
        $middleware->throttleApi();
        $middleware->validateCsrfTokens(except: [
            'api/auth/*',
            'sanctum/csrf-cookie',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn (Request $r, Throwable $e) => $r->is('api/*') || $r->expectsJson());
        $exceptions->render(function (ValidationException $e, Request $r) {
            if ($r->is('api/*')) return response()->json(['success'=>false,'message'=>'Los datos enviados no son válidos.','errors'=>$e->errors()],422);
        });
        $exceptions->render(function (Illuminate\Database\QueryException $e, Request $r) {
            if ($r->is('api/*') && in_array((string) $e->getCode(), ['23000','23505'])) {
                return response()->json(['success'=>false,'message'=>'La operación entra en conflicto con un registro existente o una relación.'],409);
            }
        });
    })->create();
