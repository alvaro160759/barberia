<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $branches = DB::table('branches')->where('active', true)->pluck('id');

        if ($branches->isEmpty()) {
            $this->command->warn('No hay sucursales disponibles. Ejecuta BranchesSeeder primero.');
            return;
        }

        $categories = ['Cortes', 'Barba', 'Lavado', 'Tratamientos', 'Peinados'];
        foreach ($categories as $name) {
            DB::table('service_categories')->updateOrInsert(
                ['name' => $name],
                ['active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        $services = [
            ['category' => 'Cortes', 'code' => 'CORTE', 'name' => 'Corte de cabello', 'price' => 15.00, 'duration' => 30],
            ['category' => 'Cortes', 'code' => 'CORTE-NIÑO', 'name' => 'Corte de cabello niño', 'price' => 10.00, 'duration' => 20],
            ['category' => 'Cortes', 'code' => 'CORTE-FRENA', 'name' => 'Corte + Fade', 'price' => 20.00, 'duration' => 40],
            ['category' => 'Barba', 'code' => 'BARBA', 'name' => 'Perfilado de barba', 'price' => 10.00, 'duration' => 20],
            ['category' => 'Barba', 'code' => 'BARBA-RAZ', 'name' => 'Arreglo de barba completo', 'price' => 15.00, 'duration' => 30],
            ['category' => 'Lavado', 'code' => 'LAVADO', 'name' => 'Lavado de cabello', 'price' => 8.00, 'duration' => 15],
            ['category' => 'Lavado', 'code' => 'LAV-PEINADO', 'name' => 'Lavado y peinado', 'price' => 15.00, 'duration' => 30],
            ['category' => 'Tratamientos', 'code' => 'TRAT-KERATINA', 'name' => 'Tratamiento de keratina', 'price' => 80.00, 'duration' => 120],
            ['category' => 'Peinados', 'code' => 'PEINADO', 'name' => 'Peinado especial', 'price' => 15.00, 'duration' => 30],
        ];

        DB::transaction(function () use ($services, $branches) {
            foreach ($services as $service) {
                $categoryId = DB::table('service_categories')->where('name', $service['category'])->value('id');

                DB::table('services')->updateOrInsert(
                    ['code' => $service['code']],
                    [
                        'category_id' => $categoryId,
                        'name' => $service['name'],
                        'price' => $service['price'],
                        'active' => true,
                        'commission_percentage' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

                $serviceId = DB::table('services')->where('code', $service['code'])->value('id');

                foreach ($branches as $branchId) {
                    DB::table('branch_services')->updateOrInsert(
                        ['branch_id' => $branchId, 'service_id' => $serviceId],
                        [
                            'price' => $service['price'],
                            'duration_minutes' => $service['duration'],
                            'barber_percentage' => 40,
                            'owner_percentage' => 60,
                            'active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
            }
        });

        $this->command->info('Servicios de barbería creados y asignados a las sucursales.');
    }
}
