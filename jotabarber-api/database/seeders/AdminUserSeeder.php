<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
class AdminUserSeeder extends Seeder {
    public function run(): void {
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'password' => bcrypt('123456'),
                'active' => true,
                'name' => 'Administrador',
            ]
        );
        $this->command->info('Usuario administrador creado exitosamente');
    }
}
