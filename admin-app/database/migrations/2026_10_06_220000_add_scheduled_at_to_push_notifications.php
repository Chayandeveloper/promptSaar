<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('push_notifications', function (Blueprint $table) {
            $table->timestamp('scheduled_at')->nullable()->index()->after('data');
            $table->timestamp('sent_at')->nullable()->after('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::table('push_notifications', function (Blueprint $table) {
            $table->dropIndex(['scheduled_at']);
            $table->dropColumn(['scheduled_at', 'sent_at']);
        });
    }
};
