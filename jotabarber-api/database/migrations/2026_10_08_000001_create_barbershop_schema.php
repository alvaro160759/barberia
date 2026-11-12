<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        $tables = ["branches", "users", "roles", "permissions", "role_permissions", "user_branches", "branch_user_roles", "menu_items", "employees", "employee_branches", "customers", "service_categories", "services", "branch_services", "barber_service_rates", "barber_schedules", "barber_time_off", "appointments", "appointment_services", "product_categories", "products", "branch_products", "cash_registers", "cash_sessions", "sales", "sale_services", "sale_products", "payment_methods", "payments", "inventory_movements", "expense_categories", "expenses", "commission_settlements", "commission_settlement_items", "audit_logs"];
        $existing = array_filter($tables,fn($table)=>Schema::hasTable($table));
        if ($existing) {
            if (count($existing)!==count($tables) || !config('jotabarber.allow_existing_schema')) {
                throw new RuntimeException('Se requiere base vacía, o el SQL completo anterior con ALLOW_EXISTING_SCHEMA=true. No mezcles esquemas.');
            }
            return;
        }
        $sql=file_get_contents(database_path('schema/tables.sql'));
        foreach (explode(';',$sql) as $statement) { if (trim($statement)!=='') DB::unprepared($statement); }
    }
    public function down(): void {
        throw new RuntimeException('Este esquema puede adoptar datos anteriores: rollback automático no disponible. Restaura una copia de respaldo para revertirlo.');
    }
};
