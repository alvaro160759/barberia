<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('branches', 'slot_interval_minutes')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->dropColumn('slot_interval_minutes');
            });
        }
        if (! Schema::hasColumn('employees', 'slot_interval_minutes')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->smallInteger('slot_interval_minutes')->unsigned()->default(60)->after('active');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('employees', 'slot_interval_minutes')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('slot_interval_minutes');
            });
        }
        if (! Schema::hasColumn('branches', 'slot_interval_minutes')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->smallInteger('slot_interval_minutes')->unsigned()->default(30)->after('currency');
            });
        }
    }
};
