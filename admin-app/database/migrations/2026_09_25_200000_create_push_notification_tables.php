<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Device Push Tokens
        Schema::create('device_push_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('device_id')->index();
            $table->text('push_token');
            $table->string('token_type', 20)->default('fcm'); // 'fcm' or 'expo'
            $table->string('platform', 20)->default('android'); // 'android', 'ios', 'web'
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->index(['device_id', 'is_active']);
        });

        // 2. Push Notification History & Deliverability
        Schema::create('push_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('image_url')->nullable();
            $table->string('action_type', 30)->default('home'); // 'home', 'prompt', 'rewards', 'custom'
            $table->string('target_id')->nullable();
            $table->json('data')->nullable();
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('failure_count')->default(0);
            $table->string('status', 20)->default('sent');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_notifications');
        Schema::dropIfExists('device_push_tokens');
    }
};
