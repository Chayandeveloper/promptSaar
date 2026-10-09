<?php

use App\Http\Controllers\Api\AppVersionController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PromptController;
use App\Http\Controllers\Api\RewardController;
use App\Models\RewardSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mobile API & Reward System
|--------------------------------------------------------------------------
*/

// App Version & Force Update Config
Route::get('/app-version', [AppVersionController::class, 'check']);

// Ad Configuration (Admin toggles for all ads, interstitials, rewarded, banners)
Route::get('/ad-config', function () {
    return response()->json([
        'status' => 'ok',
        'config' => \App\Models\AppSetting::getAdSettings(),
    ]);
});

// Social Community Links (WhatsApp, Instagram, Telegram)
Route::get('/social-links', function () {
    return response()->json([
        'status'    => 'ok',
        'whatsapp'  => \App\Models\AppSetting::get('whatsapp_url', 'https://wa.me/'),
        'instagram' => \App\Models\AppSetting::get('instagram_url', 'https://instagram.com/'),
        'telegram'  => \App\Models\AppSetting::get('telegram_url', 'https://t.me/'),
    ]);
});

// Hero Banners
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/banners/active', [BannerController::class, 'active']);

// User Coin Balance & Transactions
Route::get('/me/coins', [RewardController::class, 'balance']);
Route::get('/me/coin-transactions', [RewardController::class, 'transactions']);
Route::get('/me/unlocked', [RewardController::class, 'unlocked']);

// Daily Reward System
Route::get('/rewards/config', [RewardController::class, 'config']);
Route::get('/rewards/today', [RewardController::class, 'today']);
Route::post('/rewards/ad-completed', [RewardController::class, 'adCompleted']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/categories/{slug}/prompts', [PromptController::class, 'categoryPrompts']);

// Prompts Discovery
Route::get('/prompts', [PromptController::class, 'index']);
Route::get('/prompts/featured', [PromptController::class, 'featured']);
Route::get('/prompts/trending', [PromptController::class, 'trending']);
Route::get('/prompts/recent', [PromptController::class, 'recent']);
Route::get('/prompts/{id}', [PromptController::class, 'show'])->whereNumber('id');

// Prompt Unlocks (Option 1: Coins, Option 2: Rewarded Ad, Option 3: Relock on exit)
Route::post('/prompts/{id}/unlock-with-coins', [PromptController::class, 'unlockWithCoins'])->whereNumber('id');
Route::post('/prompts/{id}/unlock-with-ad', [PromptController::class, 'unlockWithAd'])->whereNumber('id');
Route::post('/prompts/{id}/unlock', [PromptController::class, 'unlock'])->whereNumber('id'); // Legacy compatibility
Route::post('/prompts/{id}/relock', [PromptController::class, 'relock'])->whereNumber('id');

// Admin Reward API Endpoints (Section 22)
Route::prefix('admin')->group(function () {
    Route::get('/reward-settings', function () {
        return response()->json(RewardSetting::getAllSettings());
    });

    Route::put('/reward-settings', function (Request $request) {
        $validated = $request->validate([
            'coins_per_ad'        => 'required|integer|min:1|max:1000',
            'daily_ad_limit'      => 'required|integer|min:1|max:100',
            'rewards_enabled'     => 'required|boolean',
            'default_prompt_cost' => 'nullable|integer|min:1|max:5000',
        ]);

        RewardSetting::set('coins_per_ad', $validated['coins_per_ad']);
        RewardSetting::set('daily_ad_limit', $validated['daily_ad_limit']);
        RewardSetting::set('rewards_enabled', $validated['rewards_enabled']);
        if (isset($validated['default_prompt_cost'])) {
            RewardSetting::set('default_prompt_cost', $validated['default_prompt_cost']);
        }

        return response()->json([
            'message'  => 'Reward settings updated successfully',
            'settings' => RewardSetting::getAllSettings(),
        ]);
    });
});

// Push Notifications Device Registration & In-App Sync
Route::post('/notifications/register-token', [\App\Http\Controllers\Api\NotificationController::class, 'registerToken']);
Route::post('/notifications/unregister-token', [\App\Http\Controllers\Api\NotificationController::class, 'unregisterToken']);
Route::get('/notifications/latest', [\App\Http\Controllers\Api\NotificationController::class, 'latest']);

// Server / External Web Cron trigger for automated delivery (cPanel cron, curl, uptime monitor, or web ping)
Route::match(['get', 'post'], '/cron/send-scheduled', function (\App\Services\FirebasePushService $pushService) {
    $count = $pushService->processScheduledNotifications();
    return response()->json([
        'status'      => 'ok',
        'dispatched'  => $count,
        'server_time' => now()->toIso8601String(),
    ]);
});

