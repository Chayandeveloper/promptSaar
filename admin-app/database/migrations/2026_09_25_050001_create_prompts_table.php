<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prompts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->longText('prompt_text');
            $table->string('cover_image');
            $table->json('tags')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->boolean('is_published')->default(true);
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('unlock_count')->default(0);
            $table->timestamps();

            $table->index(['is_published', 'is_featured']);
            $table->index(['is_published', 'is_trending']);
            $table->index(['is_published', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prompts');
    }
};
