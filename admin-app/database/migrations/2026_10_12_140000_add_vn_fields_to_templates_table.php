<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('templates')) {
            Schema::table('templates', function (Blueprint $table) {
                if (!Schema::hasColumn('templates', 'is_vn')) {
                    $table->boolean('is_vn')->default(false)->after('is_featured');
                }
                if (!Schema::hasColumn('templates', 'vn_image_url')) {
                    $table->text('vn_image_url')->nullable()->after('is_vn');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('templates')) {
            Schema::table('templates', function (Blueprint $table) {
                if (Schema::hasColumn('templates', 'vn_image_url')) {
                    $table->dropColumn('vn_image_url');
                }
                if (Schema::hasColumn('templates', 'is_vn')) {
                    $table->dropColumn('is_vn');
                }
            });
        }
    }
};
