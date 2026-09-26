<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prompt_unlocks', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('prompt_id')->constrained()->nullOnDelete();
            $table->string('unlock_method')->default('ad')->after('device_id'); // 'coins' or 'ad'
            $table->unsignedInteger('coins_spent')->default(0)->after('unlock_method');

            $table->index(['user_id', 'prompt_id']);
            $table->index('unlock_method');
        });
    }

    public function down(): void
    {
        Schema::table('prompt_unlocks', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'unlock_method', 'coins_spent']);
        });
    }
};
