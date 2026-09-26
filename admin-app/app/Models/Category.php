<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'icon',
        'status',
    ];

    public function prompts(): HasMany
    {
        return $this->hasMany(Prompt::class);
    }

    public function publishedPrompts(): HasMany
    {
        return $this->hasMany(Prompt::class)->where('is_published', true);
    }
}
