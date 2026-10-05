<?php

namespace App\Services;

use App\Models\AdRewardEvent;
use App\Models\CoinTransaction;
use App\Models\DailyRewardClaim;
use App\Models\Prompt;
use App\Models\PromptUnlock;
use App\Models\RewardSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RewardService
{
    /**
     * Resolves the authenticated User or identifies/auto-provisions a User from the device ID.
     */
    public function resolveUser(Request $request): User
    {
        if ($user = $request->user()) {
            return $user;
        }

        $deviceId = $request->header('X-Device-Id') ?? $request->input('device_id');

        if (!$deviceId) {
            $deviceId = 'anon_' . substr(md5($request->ip() . $request->userAgent()), 0, 16);
        }

        return User::firstOrCreate(
            ['device_id' => $deviceId],
            [
                'name'         => 'Explorer ' . substr($deviceId, -4),
                'email'        => $deviceId . '@device.local',
                'password'     => Hash::make(Str::random(32)),
                'coin_balance' => 0,
                'role'         => 'user',
            ]
        );
    }

    /**
     * Get user coin balance & totals.
     */
    public function getUserCoins(User $user): array
    {
        return [
            'balance'      => (int) $user->coin_balance,
            'total_earned' => $user->totalEarnedCoins(),
            'total_spent'  => $user->totalSpentCoins(),
        ];
    }

    /**
     * Get today's reward status for user using server-side date.
     */
    public function getTodayStatus(User $user, string $ip): array
    {
        $today = now()->toDateString();
        $coinsPerAd = (int) RewardSetting::get('coins_per_ad', 10);
        $dailyLimit = (int) RewardSetting::get('daily_ad_limit', 5);
        $enabled    = (bool) RewardSetting::get('rewards_enabled', true);

        $claim = DailyRewardClaim::where('user_id', $user->id)
            ->where('reward_date', $today)
            ->first();

        $adsWatched = $claim ? (int) $claim->ads_completed : 0;
        $coinsEarned = $claim ? (int) $claim->coins_earned : 0;
        $remainingAds = max(0, $dailyLimit - $adsWatched);
        $canWatch = $enabled && ($adsWatched < $dailyLimit);

        return [
            'enabled'            => $enabled,
            'ads_watched'        => $adsWatched,
            'daily_limit'        => $dailyLimit,
            'coins_per_ad'       => $coinsPerAd,
            'coins_earned_today' => $coinsEarned,
            'remaining_ads'      => $remainingAds,
            'can_watch'          => $canWatch,
            'max_coins_today'    => $dailyLimit * $coinsPerAd,
            'balance'            => (int) $user->coin_balance,
        ];
    }

    /**
     * Claim reward coins after watching rewarded advertisement.
     */
    public function claimAdReward(User $user, ?string $eventId, string $ip): array
    {
        $enabled = (bool) RewardSetting::get('rewards_enabled', true);
        if (!$enabled) {
            throw new \Exception('Daily rewards are currently disabled by the administrator.');
        }

        $dailyLimit = (int) RewardSetting::get('daily_ad_limit', 5);
        $coinsPerAd = (int) RewardSetting::get('coins_per_ad', 10);

        // Anti-abuse idempotency check
        if ($eventId && AdRewardEvent::where('event_id', $eventId)->exists()) {
            return $this->getTodayStatus($user, $ip);
        }

        return DB::transaction(function () use ($user, $eventId, $ip, $dailyLimit, $coinsPerAd) {
            $today = now()->toDateString();

            // Lock user row
            $lockedUser = User::where('id', $user->id)->lockForUpdate()->firstOrFail();

            // Lock or create claim row
            $claim = DailyRewardClaim::where('user_id', $lockedUser->id)
                ->where('reward_date', $today)
                ->lockForUpdate()
                ->first();

            if (!$claim) {
                $claim = DailyRewardClaim::create([
                    'user_id'       => $lockedUser->id,
                    'reward_date'   => $today,
                    'ads_completed' => 0,
                    'coins_earned'  => 0,
                    'ip_address'    => $ip,
                ]);
            }

            if ($claim->ads_completed >= $dailyLimit) {
                throw new \Exception('Daily reward limit reached. Come back tomorrow to earn more coins.');
            }

            // Increment claim stats
            $claim->increment('ads_completed');
            $claim->increment('coins_earned', $coinsPerAd);

            // Add coins to user balance
            $lockedUser->coin_balance += $coinsPerAd;
            $lockedUser->save();

            // Create ledger entry
            CoinTransaction::create([
                'user_id'        => $lockedUser->id,
                'type'           => 'reward',
                'amount'         => $coinsPerAd,
                'balance_after'  => $lockedUser->coin_balance,
                'reference_type' => 'daily_reward',
                'reference_id'   => (string) $claim->id,
                'description'    => 'Rewarded advertisement',
            ]);

            // Record idempotency event
            if ($eventId) {
                AdRewardEvent::create([
                    'user_id'      => $lockedUser->id,
                    'event_id'     => $eventId,
                    'reward_type'  => 'coins',
                    'reference_id' => (string) $claim->id,
                ]);
            }

            return [
                'message'            => "Great job! +{$coinsPerAd} coins added to your balance.",
                'coins_awarded'      => $coinsPerAd,
                'balance'            => $lockedUser->coin_balance,
                'ads_watched'        => $claim->ads_completed,
                'daily_limit'        => $dailyLimit,
                'remaining_ads'      => max(0, $dailyLimit - $claim->ads_completed),
                'coins_earned_today' => $claim->coins_earned,
            ];
        });
    }

    /**
     * Unlock prompt using coins atomically.
     */
    public function unlockWithCoins(User $user, int $promptId): array
    {
        $prompt = Prompt::with('category')->where('is_published', true)->findOrFail($promptId);

        // Check if already unlocked
        $alreadyUnlocked = PromptUnlock::where('prompt_id', $prompt->id)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->device_id) {
                    $q->orWhere('device_id', $user->device_id);
                }
            })
            ->exists();

        if ($alreadyUnlocked) {
            return [
                'message'     => 'Prompt is already unlocked',
                'prompt_text' => $prompt->prompt_text,
                'balance'     => $user->coin_balance,
                'coins_spent' => 0,
                'prompt'      => $prompt,
            ];
        }

        $cost = (int) $prompt->unlock_cost;

        return DB::transaction(function () use ($user, $prompt, $cost) {
            $lockedUser = User::where('id', $user->id)->lockForUpdate()->firstOrFail();

            if ($lockedUser->coin_balance < $cost) {
                throw new \DomainException(json_encode([
                    'error'          => 'insufficient_coins',
                    'message'        => "You need {$cost} coins to unlock this prompt, but your balance is {$lockedUser->coin_balance} coins.",
                    'required_coins' => $cost,
                    'balance'        => $lockedUser->coin_balance,
                    'deficit'        => $cost - $lockedUser->coin_balance,
                ]));
            }

            // Deduct coins atomically
            $lockedUser->coin_balance -= $cost;
            $lockedUser->save();

            // Record transaction
            CoinTransaction::create([
                'user_id'        => $lockedUser->id,
                'type'           => 'prompt_unlock',
                'amount'         => -$cost,
                'balance_after'  => $lockedUser->coin_balance,
                'reference_type' => 'prompt',
                'reference_id'   => (string) $prompt->id,
                'description'    => 'Unlocked "' . $prompt->title . '"',
            ]);

            // Record prompt unlock
            PromptUnlock::firstOrCreate([
                'prompt_id' => $prompt->id,
                'device_id' => $lockedUser->device_id,
            ], [
                'user_id'       => $lockedUser->id,
                'unlock_method' => 'coins',
                'coins_spent'   => $cost,
                'unlocked_at'   => now(),
            ]);

            $prompt->increment('unlock_count');

            return [
                'message'     => 'Prompt unlocked with coins successfully!',
                'prompt_text' => $prompt->prompt_text,
                'balance'     => $lockedUser->coin_balance,
                'coins_spent' => $cost,
                'prompt'      => $prompt,
            ];
        });
    }

    /**
     * Unlock prompt by watching rewarded ad (no coins deducted).
     */
    public function unlockWithAd(User $user, int $promptId, ?string $eventId, ?string $deviceId): array
    {
        $prompt = Prompt::with('category')->where('is_published', true)->findOrFail($promptId);

        $prompt->increment('unlock_count');

        if ($eventId) {
            AdRewardEvent::firstOrCreate([
                'event_id' => $eventId,
            ], [
                'user_id'      => $user->id,
                'reward_type'  => 'prompt_unlock',
                'reference_id' => (string) $prompt->id,
            ]);
        }

        // Record prompt unlock so the prompt stays unlocked in session/database
        PromptUnlock::firstOrCreate([
            'prompt_id' => $prompt->id,
            'device_id' => $deviceId ?? $user->device_id,
        ], [
            'user_id'       => $user->id,
            'unlock_method' => 'ad',
            'coins_spent'   => 0,
            'unlocked_at'   => now(),
        ]);

        return [
            'message'     => 'Prompt unlocked with rewarded ad!',
            'prompt_text' => $prompt->prompt_text,
            'balance'     => $user->coin_balance,
            'coins_spent' => 0,
            'prompt'      => $prompt,
        ];
    }

    /**
     * Admin manually adjusts coins for a user (with ledger transaction).
     */
    public function adjustCoinsByAdmin(User $user, int $amount, string $reason, ?int $adminId = null): CoinTransaction
    {
        return DB::transaction(function () use ($user, $amount, $reason, $adminId) {
            $lockedUser = User::where('id', $user->id)->lockForUpdate()->firstOrFail();
            $newBalance = max(0, $lockedUser->coin_balance + $amount);
            $actualDelta = $newBalance - $lockedUser->coin_balance;

            $lockedUser->coin_balance = $newBalance;
            $lockedUser->save();

            return CoinTransaction::create([
                'user_id'        => $lockedUser->id,
                'type'           => 'admin_adjustment',
                'amount'         => $actualDelta,
                'balance_after'  => $lockedUser->coin_balance,
                'reference_type' => 'admin',
                'reference_id'   => $adminId ? (string) $adminId : null,
                'description'    => $reason ?: 'Admin adjustment',
            ]);
        });
    }
}
