<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Seed default app version and force update settings
        $now = now();
        DB::table('app_settings')->insert([
            ['key' => 'min_version',          'value' => '1.0.0', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'latest_version',       'value' => '1.0.0', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'force_update',         'value' => '0',     'created_at' => $now, 'updated_at' => $now],
            ['key' => 'update_url',           'value' => 'https://play.google.com/store/apps/details?id=com.fillosoftpromptsaar.app', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'update_title',         'value' => 'New Update Available', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'update_message',       'value' => 'A new and improved version of Prompt Saar is available with new prompts, banners, and bug fixes. Please update to enjoy the best experience.', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'maintenance_mode',     'value' => '0',     'created_at' => $now, 'updated_at' => $now],
            ['key' => 'maintenance_message',  'value' => 'Prompt Saar is currently undergoing scheduled maintenance. Please check back shortly.', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
