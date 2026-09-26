<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromptUnlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'prompt_id',
        'user_id',
        'device_id',
        'unlock_method', // 'coins' or 'ad'
        'coins_spent',
        'unlocked_at',
    ];

    protected $casts = [
        'coins_spent' => 'integer',
        'unlocked_at' => 'datetime',
    ];

    public function prompt(): BelongsTo
    {
        return $this->belongsTo(Prompt::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
