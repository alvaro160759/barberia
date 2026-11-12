<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('personal_access_tokens',function(Blueprint $table){
            $table->id();$table->morphs('tokenable');$table->string('name');$table->string('token',64)->unique();
            $table->text('abilities')->nullable();$table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();$table->timestamps();
        });
        Schema::create('token_branches',function(Blueprint $table){
            $table->foreignId('token_id')->primary()->constrained('personal_access_tokens')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches');
        });
        Schema::create('password_reset_tokens',function(Blueprint $table){$table->string('email')->primary();$table->string('token');$table->timestamp('created_at')->nullable();});
    }
    public function down(): void {Schema::dropIfExists('token_branches');Schema::dropIfExists('personal_access_tokens');Schema::dropIfExists('password_reset_tokens');}
};
