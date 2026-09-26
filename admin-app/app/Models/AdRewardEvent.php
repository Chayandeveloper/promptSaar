<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdRewardEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'reward_type',   // 'coins' or 'prompt_unlock'
        'reference_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
