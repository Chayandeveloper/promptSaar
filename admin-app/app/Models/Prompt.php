<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prompt extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'description',
        'prompt_text',
        'cover_image',
        'unlock_cost',
        'tags',
        'is_featured',
        'is_trending',
        'is_published',
        'views',
        'unlock_count',
    ];

    protected $casts = [
        'unlock_cost'  => 'integer',
        'tags'         => 'array',
        'is_featured'  => 'boolean',
        'is_trending'  => 'boolean',
        'is_published' => 'boolean',
        'views'        => 'integer',
        'unlock_count' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function unlocks(): HasMany
    {
        return $this->hasMany(PromptUnlock::class);
    }
}
