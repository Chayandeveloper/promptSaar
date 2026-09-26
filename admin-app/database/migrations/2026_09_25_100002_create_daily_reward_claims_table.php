<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_reward_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('reward_date');
            $table->unsignedInteger('ads_completed')->default(0);
            $table->unsignedInteger('coins_earned')->default(0);
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'reward_date']);
            $table->index('reward_date');
            $table->index('ip_address');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_reward_claims');
    }
};
