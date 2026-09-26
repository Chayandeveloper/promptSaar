<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'role',
        'coin_balance',
        'device_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'coin_balance'      => 'integer',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function unlocks(): HasMany
    {
        return $this->hasMany(PromptUnlock::class);
    }

    public function coinTransactions(): HasMany
    {
        return $this->hasMany(CoinTransaction::class);
    }

    public function dailyRewardClaims(): HasMany
    {
        return $this->hasMany(DailyRewardClaim::class);
    }

    public function totalEarnedCoins(): int
    {
        return (int) $this->coinTransactions()->where('amount', '>', 0)->sum('amount');
    }

    public function totalSpentCoins(): int
    {
        return (int) abs($this->coinTransactions()->where('amount', '<', 0)->sum('amount'));
    }

    public function pushTokens(): HasMany
    {
        return $this->hasMany(DevicePushToken::class);
    }
}

