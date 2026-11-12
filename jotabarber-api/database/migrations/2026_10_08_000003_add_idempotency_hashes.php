<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {foreach(['sales','payments','inventory_movements','commission_settlements','expenses'] as $name)Schema::table($name,function(Blueprint $t){$t->char('request_hash',64)->nullable();});}
    public function down(): void {foreach(['sales','payments','inventory_movements','commission_settlements','expenses'] as $name)Schema::table($name,function(Blueprint $t){$t->dropColumn('request_hash');});}
};
