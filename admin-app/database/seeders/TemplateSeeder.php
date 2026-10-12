<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        if (Template::count() > 0) {
            return;
        }

        $templates = [
            [
                'title'         => 'Cinematic SlowMo Glow Reel',
                'description'   => 'Trending aesthetic portrait slow motion template with soft film grain & color grade. 3 clips required.',
                'category'      => 'Trending',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=80',
                'video_url'     => '/storage/templates/videos/sample_reel.mp4',
                'capcut_url'    => 'https://www.capcut.com/template-detail/7382910401',
                'tags'          => ['cinematic', 'slowmo', 'reels', 'aesthetic'],
                'duration'      => '0:15',
                'use_count'     => 14200,
                'views_count'   => 89300,
                'is_featured'   => true,
                'is_active'     => true,
                'order'         => 1,
            ],
            [
                'title'         => 'Beat Sync Fast Cuts 2026',
                'description'   => 'Dynamic bass drop beat sync transitions. Perfect for travel, sneaker drops, and fitness highlights.',
                'category'      => 'Beat Sync',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=80',
                'video_url'     => '/storage/templates/videos/sample_reel.mp4',
                'capcut_url'    => 'https://www.capcut.com/template-detail/7391204912',
                'tags'          => ['beatsync', 'bassdrop', 'transitions', 'viral'],
                'duration'      => '0:12',
                'use_count'     => 28400,
                'views_count'   => 152000,
                'is_featured'   => true,
                'is_active'     => true,
                'order'         => 2,
            ],
            [
                'title'         => '90s Vintage VHS Camcorder',
                'description'   => 'Retro cassette VHS glitch date-stamp effect. Romantic nostalgic vibes for friends & memories.',
                'category'      => 'Aesthetic',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=720&q=80',
                'video_url'     => '/storage/templates/videos/sample_reel.mp4',
                'capcut_url'    => 'https://www.capcut.com/template-detail/7374829103',
                'tags'          => ['vhs', 'retro', '90s', 'aesthetic'],
                'duration'      => '0:18',
                'use_count'     => 9150,
                'views_count'   => 64100,
                'is_featured'   => false,
                'is_active'     => true,
                'order'         => 3,
            ],
            [
                'title'         => 'Monthly Photo Dump Polaroid',
                'description'   => 'Slideshow scrapbook with animated polaroid frames and gentle camera clicks. Add 10-15 photos.',
                'category'      => 'Photo Dump',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=720&q=80',
                'video_url'     => '/storage/templates/videos/sample_reel.mp4',
                'capcut_url'    => 'https://www.capcut.com/template-detail/7401928374',
                'tags'          => ['photodump', 'polaroid', 'memories', 'scrapbook'],
                'duration'      => '0:22',
                'use_count'     => 19800,
                'views_count'   => 112000,
                'is_featured'   => true,
                'is_active'     => true,
                'order'         => 4,
            ],
            [
                'title'         => 'Velocity Zoom Shake Edit',
                'description'   => 'High velocity speed ramps with 3D camera pan & motion blur flash. Works best with dance / sport videos.',
                'category'      => 'Reels',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=80',
                'video_url'     => '/storage/templates/videos/sample_reel.mp4',
                'capcut_url'    => 'https://www.capcut.com/template-detail/7395820194',
                'tags'          => ['velocity', 'speedramp', 'shake', 'reels'],
                'duration'      => '0:14',
                'use_count'     => 34100,
                'views_count'   => 210000,
                'is_featured'   => false,
                'is_active'     => true,
                'order'         => 5,
            ],
        ];

        foreach ($templates as $data) {
            Template::create($data);
        }
    }
}
