<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AccessController,
    AppointmentController,
    AuthController,
    BranchCatalogController,
    CashController,
    CatalogController,
    CommissionController,
    EmployeeController,
    ExpenseController,
    InventoryController,
    ReportController,
    SaleController,
    ScheduleController
};

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('token', [AuthController::class, 'token'])->middleware('throttle:login');
});

// Authenticated routes (no branch selection required)
Route::middleware(['auth:sanctum', 'active'])->prefix('auth')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::get('branches', [AuthController::class, 'branches']);
    Route::post('branch', [AuthController::class, 'selectBranch']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('menu', [AuthController::class, 'menu'])->middleware('branch');
});

// Authenticated routes requiring branch selection
Route::middleware(['auth:sanctum', 'active', 'branch'])->group(function () {

    // Access control (branches, users, roles, permissions)
    Route::prefix('access')->name('access.')->group(function () {
        Route::get('branches', [AccessController::class, 'branches'])
            ->middleware('permission:branches.view')
            ->name('branches.index');
        Route::get('branches/{id}', [AccessController::class, 'showBranch'])
            ->middleware('permission:branches.view')
            ->whereNumber('id')
            ->name('branches.show');
        Route::post('branches', [AccessController::class, 'createBranch'])
            ->middleware('permission:branches.manage')
            ->name('branches.store');
        Route::put('branches/{id}', [AccessController::class, 'updateBranch'])
            ->middleware('permission:branches.manage')
            ->whereNumber('id')
            ->name('branches.update');
        Route::delete('branches/{id}', [AccessController::class, 'deleteBranch'])
            ->middleware('permission:branches.manage')
            ->whereNumber('id')
            ->name('branches.destroy');

        Route::get('users', [AccessController::class, 'users'])
            ->middleware('permission:users.view')
            ->name('users.index');
        Route::get('users/{id}', [AccessController::class, 'showUser'])
            ->middleware('permission:users.view')
            ->whereNumber('id')
            ->name('users.show');
        Route::post('users', [AccessController::class, 'createUser'])
            ->middleware('permission:users.manage')
            ->name('users.store');
        Route::put('users/{id}', [AccessController::class, 'updateUser'])
            ->middleware('permission:users.manage')
            ->whereNumber('id')
            ->name('users.update');
        Route::delete('users/{id}', [AccessController::class, 'deleteUser'])
            ->middleware('permission:users.manage')
            ->whereNumber('id')
            ->name('users.destroy');
        Route::post('user-branches', [AccessController::class, 'assignUser'])
            ->middleware('permission:users.manage')
            ->name('users.assign');

        Route::get('roles', [AccessController::class, 'roles'])
            ->middleware('permission:roles.view')
            ->name('roles.index');
        Route::get('roles/{id}', [AccessController::class, 'showRole'])
            ->middleware('permission:roles.view')
            ->whereNumber('id')
            ->name('roles.show');
        Route::post('roles', [AccessController::class, 'saveRole'])
            ->middleware('permission:roles.manage')
            ->name('roles.store');
        Route::put('roles/{id}', [AccessController::class, 'saveRole'])
            ->middleware('permission:roles.manage')
            ->whereNumber('id')
            ->name('roles.update');
        Route::delete('roles/{id}', [AccessController::class, 'deleteRole'])
            ->middleware('permission:roles.manage')
            ->whereNumber('id')
            ->name('roles.destroy');

        Route::get('permissions', [AccessController::class, 'permissions'])
            ->middleware('permission:roles.view')
            ->name('permissions.index');
        Route::get('menus', [AccessController::class, 'menus'])
            ->middleware('permission:roles.view')
            ->name('menus.index');
        Route::put('menus/{id}', [AccessController::class, 'updateMenu'])
            ->middleware('permission:roles.manage')
            ->whereNumber('id')
            ->name('menus.update');
    });

    // Catalog resources (CRUD endpoints)
    Route::prefix('catalog')->name('catalog.')->group(function () {
        $catalogResources = [
            'customers' => ['view' => 'customers.view', 'manage' => 'customers.manage'],
            'service-categories' => ['view' => 'services.view', 'manage' => 'services.manage'],
            'services' => ['view' => 'services.view', 'manage' => 'services.manage'],
            'product-categories' => ['view' => 'products.view', 'manage' => 'products.manage'],
            'products' => ['view' => 'products.view', 'manage' => 'products.manage'],
            'expense-categories' => ['view' => 'expenses.view', 'manage' => 'expenses.manage'],
            'cash-registers' => ['view' => 'cash.view', 'manage' => 'cash.manage'],
            'payment-methods' => ['view' => 'cash.view', 'manage' => 'cash.manage'],
        ];

        foreach ($catalogResources as $resource => $permissions) {
            Route::prefix($resource)->name("{$resource}.")->group(function () use ($resource, $permissions) {
                Route::get('/', [CatalogController::class, 'index'])
                    ->middleware("permission:{$permissions['view']}")
                    ->defaults('resource', $resource)
                    ->name('index');
                Route::get('/{id}', [CatalogController::class, 'show'])
                    ->middleware("permission:{$permissions['view']}")
                    ->whereNumber('id')
                    ->defaults('resource', $resource)
                    ->name('show');
                Route::post('/', [CatalogController::class, 'store'])
                    ->middleware("permission:{$permissions['manage']}")
                    ->defaults('resource', $resource)
                    ->name('store');
                Route::put('/{id}', [CatalogController::class, 'update'])
                    ->middleware("permission:{$permissions['manage']}")
                    ->whereNumber('id')
                    ->defaults('resource', $resource)
                    ->name('update');
                Route::delete('/{id}', [CatalogController::class, 'destroy'])
                    ->middleware("permission:{$permissions['manage']}")
                    ->whereNumber('id')
                    ->defaults('resource', $resource)
                    ->name('destroy');
            });
        }
    });

    // Employees management
    Route::prefix('employees')->name('employees.')->group(function () {
        Route::get('/', [EmployeeController::class, 'index'])
            ->middleware('permission:employees.view')
            ->name('index');
        Route::get('/directory', [EmployeeController::class, 'directory'])
            ->middleware('permission:users.manage')
            ->name('directory');
        Route::post('/', [EmployeeController::class, 'store'])
            ->middleware('permission:employees.manage')
            ->name('store');
        Route::get('/{id}', [EmployeeController::class, 'show'])
            ->middleware('permission:employees.view')
            ->whereNumber('id')
            ->name('show');
        Route::put('/{id}', [EmployeeController::class, 'update'])
            ->middleware('permission:employees.manage')
            ->whereNumber('id')
            ->name('update');
        Route::delete('/{id}', [EmployeeController::class, 'destroy'])
            ->middleware('permission:employees.manage')
            ->whereNumber('id')
            ->name('destroy');
        Route::post('assign', [EmployeeController::class, 'assign'])
            ->middleware('permission:users.manage')
            ->name('assign');
    });

    // Branch-specific catalog
    Route::prefix('branch')->name('branch.')->group(function () {
        Route::get('services', [BranchCatalogController::class, 'services'])
            ->middleware('permission:services.view')
            ->name('services.index');
        Route::put('services', [BranchCatalogController::class, 'saveService'])
            ->middleware('permission:services.manage')
            ->name('services.update');
        Route::get('products', [BranchCatalogController::class, 'products'])
            ->middleware('permission:products.view')
            ->name('products.index');
        Route::put('products', [BranchCatalogController::class, 'saveProduct'])
            ->middleware('permission:products.manage')
            ->name('products.update');
        Route::get('barber-service-rates', [BranchCatalogController::class, 'rates'])
            ->middleware('permission:services.view')
            ->name('rates.index');
        Route::put('barber-service-rates', [BranchCatalogController::class, 'saveRate'])
            ->middleware('permission:services.manage')
            ->name('rates.update');
    });

    // Schedules
    Route::prefix('schedules')->name('schedules.')->group(function () {
        Route::get('barber', [ScheduleController::class, 'schedules'])
            ->middleware('permission:employees.view')
            ->name('barber.index');
        Route::post('barber', [ScheduleController::class, 'createSchedule'])
            ->middleware('permission:employees.manage')
            ->name('barber.store');
        Route::delete('barber/{id}', [ScheduleController::class, 'deleteSchedule'])
            ->middleware('permission:employees.manage')
            ->whereNumber('id')
            ->name('barber.destroy');
        Route::get('barber/time-off', [ScheduleController::class, 'timeOff'])
            ->middleware('permission:employees.view')
            ->name('barber.time-off.index');
        Route::post('barber/time-off', [ScheduleController::class, 'createTimeOff'])
            ->middleware('permission:employees.manage')
            ->name('barber.time-off.store');
        Route::delete('barber/time-off/{id}', [ScheduleController::class, 'deleteTimeOff'])
            ->middleware('permission:employees.manage')
            ->whereNumber('id')
            ->name('barber.time-off.destroy');
    });

    // Appointments
    Route::prefix('appointments')->name('appointments.')->group(function () {
        Route::get('/', [AppointmentController::class, 'index'])
            ->middleware('permission:appointments.view')
            ->name('index');
        Route::get('/{id}', [AppointmentController::class, 'show'])
            ->middleware('permission:appointments.view')
            ->whereNumber('id')
            ->name('show');
        Route::post('/', [AppointmentController::class, 'store'])
            ->middleware('permission:appointments.manage')
            ->name('store');
        Route::put('/{id}', [AppointmentController::class, 'update'])
            ->middleware('permission:appointments.manage')
            ->whereNumber('id')
            ->name('update');
        Route::patch('/{id}/status', [AppointmentController::class, 'changeStatus'])
            ->middleware('permission:appointments.manage')
            ->whereNumber('id')
            ->name('status');
    });

    // My appointments (user-specific)
    Route::prefix('my-appointments')->name('my-appointments.')->group(function () {
        Route::get('/', [AppointmentController::class, 'index'])
            ->middleware('permission:appointments.view_own')
            ->defaults('own', true)
            ->name('index');
        Route::get('/{id}', [AppointmentController::class, 'show'])
            ->middleware('permission:appointments.view_own')
            ->whereNumber('id')
            ->defaults('own', true)
            ->name('show');
    });

    // Sales
    Route::prefix('sales')->name('sales.')->group(function () {
        Route::get('/', [SaleController::class, 'index'])
            ->middleware('permission:sales.view')
            ->name('index');
        Route::get('/{id}', [SaleController::class, 'show'])
            ->middleware('permission:sales.view')
            ->whereNumber('id')
            ->name('show');
        Route::post('/', [SaleController::class, 'store'])
            ->middleware('permission:sales.create')
            ->name('store');
        Route::post('/{id}/payments', [SaleController::class, 'payment'])
            ->middleware('permission:sales.create')
            ->whereNumber('id')
            ->name('payment');
        Route::post('/{id}/cancel', [SaleController::class, 'cancel'])
            ->middleware('permission:sales.cancel')
            ->whereNumber('id')
            ->name('cancel');
    });

    // Inventory
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('movements', [InventoryController::class, 'index'])
            ->middleware('permission:inventory.view')
            ->name('movements.index');
        Route::post('movements', [InventoryController::class, 'store'])
            ->middleware('permission:inventory.manage')
            ->name('movements.store');
    });

    // Cash sessions
    Route::prefix('cash-sessions')->name('cash-sessions.')->group(function () {
        Route::get('/', [CashController::class, 'index'])
            ->middleware('permission:cash.view')
            ->name('index');
        Route::get('/{id}', [CashController::class, 'show'])
            ->middleware('permission:cash.view')
            ->whereNumber('id')
            ->name('show');
        Route::post('/', [CashController::class, 'open'])
            ->middleware('permission:cash.manage')
            ->name('open');
        Route::post('/{id}/close', [CashController::class, 'close'])
            ->middleware('permission:cash.manage')
            ->whereNumber('id')
            ->name('close');
    });

    // Expenses
    Route::prefix('expenses')->name('expenses.')->group(function () {
        Route::get('/', [ExpenseController::class, 'index'])
            ->middleware('permission:expenses.view')
            ->name('index');
        Route::get('/{id}', [ExpenseController::class, 'show'])
            ->middleware('permission:expenses.view')
            ->whereNumber('id')
            ->name('show');
        Route::post('/', [ExpenseController::class, 'store'])
            ->middleware('permission:expenses.manage')
            ->name('store');
    });

    // Commissions
    Route::prefix('commissions')->name('commissions.')->group(function () {
        Route::get('pending', [CommissionController::class, 'pending'])
            ->middleware('permission:commissions.view')
            ->name('pending');
        Route::get('/', [CommissionController::class, 'index'])
            ->middleware('permission:commissions.view')
            ->name('index');
        Route::get('/{id}', [CommissionController::class, 'show'])
            ->middleware('permission:commissions.view')
            ->whereNumber('id')
            ->name('show');
        Route::post('/', [CommissionController::class, 'store'])
            ->middleware('permission:commissions.pay')
            ->name('store');
    });

    // My commissions (user-specific)
    Route::prefix('my-commissions')->name('my-commissions.')->group(function () {
        Route::get('pending', [CommissionController::class, 'pending'])
            ->middleware('permission:commissions.view_own')
            ->defaults('own', true)
            ->name('pending');
        Route::get('/', [CommissionController::class, 'index'])
            ->middleware('permission:commissions.view_own')
            ->defaults('own', true)
            ->name('index');
        Route::get('/{id}', [CommissionController::class, 'show'])
            ->middleware('permission:commissions.view_own')
            ->whereNumber('id')
            ->defaults('own', true)
            ->name('show');
    });

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('dashboard', [ReportController::class, 'dashboard'])
            ->middleware('permission:dashboard.view')
            ->name('dashboard');
        Route::get('by-barber', [ReportController::class, 'byBarber'])
            ->middleware('permission:reports.view')
            ->name('by-barber');
    });

    // Audit logs
    Route::get('audit-logs', [ReportController::class, 'audit'])
        ->middleware('permission:audit.view')
        ->name('audit-logs.index');
});
