<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BarberSchedulesSeeder extends Seeder
{
    public function run(): void
    {
        $barbers = DB::table('employees')
            ->where('job_type', 'BARBER')
            ->where('active', true)
            ->pluck('id');

        $branches = DB::table('branches')->where('active', true)->pluck('id');

        if ($barbers->isEmpty()) {
            $this->command->warn('No hay barberos disponibles. Ejecuta BarbersSeeder primero.');
            return;
        }

        if ($branches->isEmpty()) {
            $this->command->warn('No hay sucursales disponibles. Ejecuta BranchesSeeder primero.');
            return;
        }

        // Horarios variados por barbero para mejor demostración
        $barberSchedules = [
            // Roberto Jota (dueño) - Horario completo todos los días
            1 => [
                ['weekday' => 1, 'starts_at' => '08:00:00', 'ends_at' => '20:00:00'],
                ['weekday' => 2, 'starts_at' => '08:00:00', 'ends_at' => '20:00:00'],
                ['weekday' => 3, 'starts_at' => '08:00:00', 'ends_at' => '20:00:00'],
                ['weekday' => 4, 'starts_at' => '08:00:00', 'ends_at' => '20:00:00'],
                ['weekday' => 5, 'starts_at' => '08:00:00', 'ends_at' => '20:00:00'],
                ['weekday' => 6, 'starts_at' => '09:00:00', 'ends_at' => '18:00:00'],
                ['weekday' => 7, 'starts_at' => '10:00:00', 'ends_at' => '16:00:00'],
            ],
            // Carlos García - Horario estándar
            2 => [
                ['weekday' => 1, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 2, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 3, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 4, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 5, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 6, 'starts_at' => '09:00:00', 'ends_at' => '17:00:00'],
            ],
            // Juan Pérez - Horario medio día
            3 => [
                ['weekday' => 1, 'starts_at' => '10:00:00', 'ends_at' => '18:00:00'],
                ['weekday' => 2, 'starts_at' => '10:00:00', 'ends_at' => '18:00:00'],
                ['weekday' => 3, 'starts_at' => '10:00:00', 'ends_at' => '18:00:00'],
                ['weekday' => 4, 'starts_at' => '10:00:00', 'ends_at' => '18:00:00'],
                ['weekday' => 5, 'starts_at' => '10:00:00', 'ends_at' => '18:00:00'],
                ['weekday' => 6, 'starts_at' => '10:00:00', 'ends_at' => '15:00:00'],
            ],
            // Miguel Rodríguez - Horario tarde
            4 => [
                ['weekday' => 1, 'starts_at' => '12:00:00', 'ends_at' => '21:00:00'],
                ['weekday' => 2, 'starts_at' => '12:00:00', 'ends_at' => '21:00:00'],
                ['weekday' => 3, 'starts_at' => '12:00:00', 'ends_at' => '21:00:00'],
                ['weekday' => 4, 'starts_at' => '12:00:00', 'ends_at' => '21:00:00'],
                ['weekday' => 5, 'starts_at' => '12:00:00', 'ends_at' => '21:00:00'],
                ['weekday' => 6, 'starts_at' => '11:00:00', 'ends_at' => '19:00:00'],
            ],
            // Luis Martínez - Horario mañana
            5 => [
                ['weekday' => 1, 'starts_at' => '08:00:00', 'ends_at' => '16:00:00'],
                ['weekday' => 2, 'starts_at' => '08:00:00', 'ends_at' => '16:00:00'],
                ['weekday' => 3, 'starts_at' => '08:00:00', 'ends_at' => '16:00:00'],
                ['weekday' => 4, 'starts_at' => '08:00:00', 'ends_at' => '16:00:00'],
                ['weekday' => 5, 'starts_at' => '08:00:00', 'ends_at' => '16:00:00'],
                ['weekday' => 6, 'starts_at' => '09:00:00', 'ends_at' => '14:00:00'],
            ],
            // Ana López - Horario completo
            6 => [
                ['weekday' => 1, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 2, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 3, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 4, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 5, 'starts_at' => '09:00:00', 'ends_at' => '19:00:00'],
                ['weekday' => 6, 'starts_at' => '09:00:00', 'ends_at' => '17:00:00'],
            ],
        ];

        DB::transaction(function () use ($barbers, $branches, $barberSchedules) {
            foreach ($branches as $branchId) {
                foreach ($barbers as $barberId) {
                    $schedules = $barberSchedules[$barberId] ?? [];
                    foreach ($schedules as $schedule) {
                        DB::table('barber_schedules')->updateOrInsert(
                            [
                                'branch_id' => $branchId,
                                'employee_id' => $barberId,
                                'weekday' => $schedule['weekday'],
                            ],
                            [
                                'starts_at' => $schedule['starts_at'],
                                'ends_at' => $schedule['ends_at'],
                                'active' => true,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]
                        );
                    }
                }
            }
        });

        $this->command->info('Horarios de barberos agregados exitosamente.');
    }
}
