<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
class AssignAdminRoleSeeder extends Seeder {
    public function run(): void {
        $user = User::where('username', 'admin')->first();
        $role = DB::table('roles')->where('code', 'admin')->first();

        if ($user && $role) {
            // Crear sucursal principal si no existe
            $branchId = DB::table('branches')->insertGetId([
                'code' => 'MAIN',
                'name' => 'Principal',
                'address' => 'Dirección Principal',
                'phone' => '000000000',
                'timezone' => 'America/Lima',
                'currency' => 'PEN',
                'active' => true,
            ]);

            // Asignar usuario a la sucursal
            DB::table('user_branches')->insert([
                'user_id' => $user->id,
                'branch_id' => $branchId,
            ]);

            // Asignar rol de administrador en la sucursal
            DB::table('branch_user_roles')->insert([
                'user_id' => $user->id,
                'branch_id' => $branchId,
                'role_id' => $role->id,
            ]);

            $this->command->info('Rol de administrador asignado al usuario admin en la sucursal Principal (ID: ' . $branchId . ')');
        } else {
            $this->command->error('No se encontró el usuario admin o el rol admin');
        }
    }
}
