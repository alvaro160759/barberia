<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductCategoriesSeeder extends Seeder {
    public function run(): void {
        $categories = [
            ['name' => 'Cuidado Capilar'],
            ['name' => 'Afeitado'],
            ['name' => 'Coloración'],
            ['name' => 'Herramientas'],
            ['name' => 'Accesorios'],
            ['name' => 'Estilizado'],
            ['name' => 'Tratamientos'],
        ];

        foreach ($categories as $category) {
            DB::table('product_categories')->updateOrInsert(
                ['name' => $category['name']],
                array_merge($category, ['active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        $this->command->info('Categorías de productos de barbería creadas.');
    }
}
