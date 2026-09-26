<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('coin_balance')->default(0)->after('password');
            $table->string('device_id')->nullable()->unique()->after('coin_balance');
        });

        Schema::table('prompts', function (Blueprint $table) {
            $table->unsignedInteger('unlock_cost')->default(30)->after('cover_image');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['coin_balance', 'device_id']);
        });

        Schema::table('prompts', function (Blueprint $table) {
            $table->dropColumn('unlock_cost');
        });
    }
};
