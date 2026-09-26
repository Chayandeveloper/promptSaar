<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Anonymous unlock log — no user account required
        Schema::create('prompt_unlocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prompt_id')->constrained()->cascadeOnDelete();
            $table->string('device_id')->nullable()->index(); // anonymous device identifier
            $table->timestamp('unlocked_at')->useCurrent();
            $table->timestamps();

            // One unlock per device per prompt
            $table->unique(['prompt_id', 'device_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prompt_unlocks');
    }
};
