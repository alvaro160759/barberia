<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BarbersSeeder extends Seeder
{
    public function run(): void
    {
        $branches = DB::table('branches')->pluck('id');
        
        if ($branches->isEmpty()) {
            $this->command->warn('No hay sucursales disponibles. Ejecuta BranchesSeeder primero.');
            return;
        }

        $barbers = [
            [
                'first_name' => 'Roberto',
                'last_name' => 'Jota',
                'job_type' => 'BARBER',
                'phone' => '987654320',
                'email' => 'roberto@jotabarber.com',
                'active' => true,
            ],
            [
                'first_name' => 'Carlos',
                'last_name' => 'García',
                'job_type' => 'BARBER',
                'phone' => '987654321',
                'email' => 'carlos@jotabarber.com',
                'active' => true,
            ],
            [
                'first_name' => 'Juan',
                'last_name' => 'Pérez',
                'job_type' => 'BARBER',
                'phone' => '987654322',
                'email' => 'juan@jotabarber.com',
                'active' => true,
            ],
            [
                'first_name' => 'Miguel',
                'last_name' => 'Rodríguez',
                'job_type' => 'BARBER',
                'phone' => '987654323',
                'email' => 'miguel@jotabarber.com',
                'active' => true,
            ],
            [
                'first_name' => 'Luis',
                'last_name' => 'Martínez',
                'job_type' => 'BARBER',
                'phone' => '987654324',
                'email' => 'luis@jotabarber.com',
                'active' => true,
            ],
            [
                'first_name' => 'Ana',
                'last_name' => 'López',
                'job_type' => 'BARBER',
                'phone' => '987654325',
                'email' => 'ana@jotabarber.com',
                'active' => true,
            ],
        ];

        DB::transaction(function () use ($barbers, $branches) {
            foreach ($barbers as $barber) {
                $employeeId = DB::table('employees')->updateOrInsert(
                    [
                        'first_name' => $barber['first_name'],
                        'last_name' => $barber['last_name'],
                    ],
                    [
                        'job_type' => $barber['job_type'],
                        'phone' => $barber['phone'],
                        'email' => $barber['email'],
                        'active' => $barber['active'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

                // Asociar barbero a todas las sucursales
                foreach ($branches as $branchId) {
                    $actualEmployeeId = DB::table('employees')
                        ->where('first_name', $barber['first_name'])
                        ->where('last_name', $barber['last_name'])
                        ->value('id');

                    if ($actualEmployeeId) {
                        DB::table('employee_branches')->updateOrInsert(
                            ['employee_id' => $actualEmployeeId, 'branch_id' => $branchId],
                            [
                                'active' => true,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]
                        );
                    }
                }
            }
        });

        $this->command->info('Barberos agregados exitosamente.');
    }
}
