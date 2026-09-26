<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coin_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // reward, prompt_unlock, admin_adjustment, refund, bonus
            $table->integer('amount'); // signed: +10, -30
            $table->unsignedBigInteger('balance_after');
            $table->string('reference_type')->nullable(); // daily_reward, prompt, admin
            $table->string('reference_id')->nullable(); // prompt ID, claim ID, etc.
            $table->string('description');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coin_transactions');
    }
};
