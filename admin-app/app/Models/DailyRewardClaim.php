<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyRewardClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reward_date',
        'ads_completed',
        'coins_earned',
        'ip_address',
    ];

    protected $casts = [
        'reward_date'   => 'date:Y-m-d',
        'ads_completed' => 'integer',
        'coins_earned'  => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
