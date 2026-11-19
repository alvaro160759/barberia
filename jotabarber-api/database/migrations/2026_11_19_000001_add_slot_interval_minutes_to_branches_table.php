<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('branches', 'slot_interval_minutes')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->smallInteger('slot_interval_minutes')->unsigned()->default(30)->after('currency');
            });
        }
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn('slot_interval_minutes');
        });
    }
};
