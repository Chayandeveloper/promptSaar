<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        // Seed default reward & prompt cost settings
        $now = now();
        DB::table('reward_settings')->insert([
            ['key' => 'rewards_enabled',      'value' => '1',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'coins_per_ad',          'value' => '10', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'daily_ad_limit',        'value' => '5',  'created_at' => $now, 'updated_at' => $now],
            ['key' => 'default_prompt_cost',   'value' => '30', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_settings');
    }
};
