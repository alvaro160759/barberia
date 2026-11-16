<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
class AssignAdminRoleSeeder extends Seeder {
    public function run(): void {
        $user = User::where('username', 'admin')->first();
        $role = DB::table('roles')->where('code', 'admin')->first();
        $branches = DB::table('branches')->where('active', true)->get();

        if (!$user || !$role) {
            $this->command->error('No se encontró el usuario admin o el rol admin');
            return;
        }
        if ($branches->isEmpty()) {
            $this->command->warn('No hay sucursales activas. Ejecuta BranchesSeeder primero.');
            return;
        }

        foreach ($branches as $branch) {
            DB::table('user_branches')->updateOrInsert(
                ['user_id' => $user->id, 'branch_id' => $branch->id],
                ['active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
            $roleAssigned = DB::table('branch_user_roles')
                ->where('user_id', $user->id)
                ->where('branch_id', $branch->id)
                ->where('role_id', $role->id)
                ->exists();
            if (!$roleAssigned) {
                DB::table('branch_user_roles')->insert([
                    'user_id' => $user->id,
                    'branch_id' => $branch->id,
                    'role_id' => $role->id,
                ]);
            }
        }

        $this->command->info('Rol de administrador asignado al usuario admin en ' . $branches->count() . ' sucursal(es).');
    }
}
