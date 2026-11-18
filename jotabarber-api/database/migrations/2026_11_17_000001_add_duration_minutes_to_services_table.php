<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('services', 'duration_minutes')) {
            Schema::table('services', function (Blueprint $table) {
                $table->smallInteger('duration_minutes')->unsigned()->default(30)->after('commission_percentage');
            });
        }
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('duration_minutes');
        });
    }
};
