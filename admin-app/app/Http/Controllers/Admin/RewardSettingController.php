<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoinTransaction;
use App\Models\DailyRewardClaim;
use App\Models\PromptUnlock;
use App\Models\RewardSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Prompt;

class RewardSettingController extends Controller
{
    public function index(): Response
    {
        $settings = RewardSetting::getAllSettings();

        // Performance & reward metrics
        $today = now()->toDateString();
        $metrics = [
            'total_coins_distributed' => (int) CoinTransaction::where('amount', '>', 0)->sum('amount'),
            'total_coins_spent'       => (int) abs(CoinTransaction::where('amount', '<', 0)->sum('amount')),
            'coins_today_distributed' => (int) CoinTransaction::where('amount', '>', 0)->whereDate('created_at', $today)->sum('amount'),
            'coins_today_spent'       => (int) abs(CoinTransaction::where('amount', '<', 0)->whereDate('created_at', $today)->sum('amount')),
            'total_reward_ads'        => (int) DailyRewardClaim::sum('ads_completed'),
            'ad_unlocks'              => (int) PromptUnlock::where('unlock_method', 'ad')->count(),
            'coin_unlocks'            => (int) PromptUnlock::where('unlock_method', 'coins')->count(),
            'total_prompts_count'     => Prompt::count(),
        ];

        return Inertia::render('Settings/Rewards', [
            'settings' => $settings,
            'metrics'  => $metrics,
            'admin'    => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'coins_per_ad'        => 'required|integer|min:1|max:1000',
            'daily_ad_limit'      => 'required|integer|min:1|max:100',
            'rewards_enabled'     => 'required|boolean',
            'default_prompt_cost' => 'required|integer|min:0|max:5000',
            'apply_to_existing'   => 'nullable|boolean',
        ]);

        RewardSetting::set('coins_per_ad', $validated['coins_per_ad']);
        RewardSetting::set('daily_ad_limit', $validated['daily_ad_limit']);
        RewardSetting::set('rewards_enabled', $validated['rewards_enabled']);
        RewardSetting::set('default_prompt_cost', $validated['default_prompt_cost']);

        $updatedPromptsCount = 0;
        if (!empty($validated['apply_to_existing'])) {
            $updatedPromptsCount = Prompt::query()->update(['unlock_cost' => $validated['default_prompt_cost']]);
        }

        $message = 'Reward & prompt cost settings saved successfully!';
        if ($updatedPromptsCount > 0) {
            $message .= " Also updated {$updatedPromptsCount} existing prompts to {$validated['default_prompt_cost']} coins.";
        }

        return redirect()->back()->with('success', $message);
    }
}
