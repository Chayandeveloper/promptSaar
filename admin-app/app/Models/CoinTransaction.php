<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoinTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',           // reward, prompt_unlock, admin_adjustment, refund, bonus
        'amount',         // signed integer: +10, -30
        'balance_after',
        'reference_type', // daily_reward, prompt, admin
        'reference_id',
        'description',
    ];

    protected $casts = [
        'amount'        => 'integer',
        'balance_after' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
