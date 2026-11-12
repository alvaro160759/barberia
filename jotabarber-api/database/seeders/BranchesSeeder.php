<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BranchesSeeder extends Seeder
{
    public function run(): void
    {
        $branches = [
            [
                'code' => '001',
                'name' => 'Sede Principal',
                'address' => 'Av. Principal 123',
                'phone' => '555-0001',
                'timezone' => 'America/Lima',
                'currency' => 'PEN',
                'active' => true,
            ],
            [
                'code' => '002',
                'name' => 'Sede Norte',
                'address' => 'Calle Norte 456',
                'phone' => '555-0002',
                'timezone' => 'America/Lima',
                'currency' => 'PEN',
                'active' => true,
            ],
            [
                'code' => '003',
                'name' => 'Sede Sur',
                'address' => 'Av. Sur 789',
                'phone' => '555-0003',
                'timezone' => 'America/Lima',
                'currency' => 'PEN',
                'active' => true,
            ],
            [
                'code' => '004',
                'name' => 'Sede Este',
                'address' => 'Jr. Este 321',
                'phone' => '555-0004',
                'timezone' => 'America/Lima',
                'currency' => 'PEN',
                'active' => true,
            ],
            [
                'code' => '005',
                'name' => 'Sede Oeste',
                'address' => 'Calle Oeste 654',
                'phone' => '555-0005',
                'timezone' => 'America/Lima',
                'currency' => 'PEN',
                'active' => true,
            ],
        ];

        DB::transaction(function () use ($branches) {
            $adminUser = DB::table('users')->where('username', 'admin')->first();

            foreach ($branches as $branch) {
                $branchId = DB::table('branches')->updateOrInsert(
                    ['code' => $branch['code']],
                    [
                        'name' => $branch['name'],
                        'address' => $branch['address'],
                        'phone' => $branch['phone'],
                        'timezone' => $branch['timezone'],
                        'currency' => $branch['currency'],
                        'active' => $branch['active'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

                // Si el usuario admin existe, asociarlo a la sucursal
                if ($adminUser) {
                    $actualBranchId = DB::table('branches')->where('code', $branch['code'])->value('id');
                    if ($actualBranchId) {
                        DB::table('user_branches')->updateOrInsert(
                            ['user_id' => $adminUser->id, 'branch_id' => $actualBranchId],
                            [
                                'active' => true,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]
                        );

                        // Asignar el rol admin a esta sucursal
                        $adminRoleId = DB::table('roles')->where('code', 'admin')->value('id');
                        if ($adminRoleId) {
                            DB::table('branch_user_roles')->updateOrInsert(
                                ['user_id' => $adminUser->id, 'branch_id' => $actualBranchId, 'role_id' => $adminRoleId],
                                []
                            );
                        }
                    }
                }
            }
        });

        $this->command->info('Sucursales agregadas exitosamente.');
    }
}
