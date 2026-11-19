<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class DatabaseSeeder extends Seeder {
    public function run(): void {
        // El SQL anterior ya sembró estos catálogos. No sobrescribir roles configurados.
        if (DB::table('roles')->exists()) return;
        DB::transaction(function(){
            foreach(explode(';',file_get_contents(database_path('schema/seed.sql'))) as $statement){
                if(trim($statement)!=='') DB::unprepared($statement);
            }
        });

        // Ejecutar seeder de sucursales adicionales
        $this->call(BranchesSeeder::class);

        // Ejecutar seeder de categorías de productos
        $this->call(ProductCategoriesSeeder::class);

        // Ejecutar seeder de servicios
        $this->call(ServicesSeeder::class);

        // Ejecutar seeder de barberos
        $this->call(BarbersSeeder::class);

        // Ejecutar seeder de horarios de barberos
        $this->call(BarberSchedulesSeeder::class);

        // Ejecutar seeder de cajas registradoras
        $this->call(CashRegistersSeeder::class);
    }
}
