<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'thumbnail_url',
        'video_url',
        'capcut_url',
        'tags',
        'duration',
        'use_count',
        'views_count',
        'is_featured',
        'is_vn',
        'vn_image_url',
        'is_active',
        'order',
    ];

    protected $casts = [
        'tags'        => 'array',
        'use_count'   => 'integer',
        'views_count' => 'integer',
        'is_featured' => 'boolean',
        'is_vn'       => 'boolean',
        'is_active'   => 'boolean',
        'order'       => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->orderBy('order', 'asc')
                     ->orderBy('id', 'desc');
    }

    public function getVideoUrlAttribute($value): ?string
    {
        return $this->formatMediaUrl($value);
    }

    public function getThumbnailUrlAttribute($value): ?string
    {
        return $this->formatMediaUrl($value);
    }

    public function getVnImageUrlAttribute($value): ?string
    {
        return $this->formatMediaUrl($value);
    }

    protected function formatMediaUrl(?string $url): ?string
    {
        if (empty($url)) {
            return $url;
        }

        // Handle relative paths
        if (str_starts_with($url, '/storage/') || str_starts_with($url, 'storage/')) {
            $path = ltrim($url, '/');
            return url($path);
        }

        // Handle URLs with localhost or 127.0.0.1
        if (preg_match('#^https?://(?:localhost|127\.0\.0\.1)(?::\d+)?(/storage/.*)$#i', $url, $matches)) {
            $storagePath = ltrim($matches[1], '/');
            return url($storagePath);
        }

        return $url;
    }
}
