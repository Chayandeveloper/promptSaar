<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prompts', function (Blueprint $table) {
            if (!Schema::hasColumn('prompts', 'gallery_images')) {
                $table->json('gallery_images')->nullable()->after('cover_image');
            }
            if (!Schema::hasColumn('prompts', 'video_url')) {
                $table->string('video_url', 1000)->nullable()->after('gallery_images');
            }
        });
    }

    public function down(): void
    {
        Schema::table('prompts', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('prompts', 'gallery_images')) {
                $columns[] = 'gallery_images';
            }
            if (Schema::hasColumn('prompts', 'video_url')) {
                $columns[] = 'video_url';
            }
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};

