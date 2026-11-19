<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CashRegistersSeeder extends Seeder
{
    public function run(): void
    {
        $branches = DB::table('branches')->where('active', true)->pluck('id');

        if ($branches->isEmpty()) {
            $this->command->warn('No hay sucursales disponibles. Ejecuta BranchesSeeder primero.');
            return;
        }

        DB::transaction(function () use ($branches) {
            foreach ($branches as $branchId) {
                DB::table('cash_registers')->updateOrInsert(
                    ['branch_id' => $branchId, 'name' => 'Caja principal'],
                    [
                        'active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        });

        $this->command->info('Cajas registradoras agregadas exitosamente.');
    }
}
