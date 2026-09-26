<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Prompt;
use App\Models\PromptUnlock;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->startOfDay();
        $todayDate = now()->toDateString();

        $stats = [
            'total_prompts'            => Prompt::count(),
            'published_prompts'        => Prompt::where('is_published', true)->count(),
            'draft_prompts'            => Prompt::where('is_published', false)->count(),
            'total_categories'         => Category::count(),
            'total_unlocks'            => PromptUnlock::count(),
            'today_unlocks'            => PromptUnlock::where('unlocked_at', '>=', $today)->count(),
            'featured_prompts'         => Prompt::where('is_featured', true)->count(),
            'trending_prompts'         => Prompt::where('is_trending', true)->count(),
            // Reward & Coin Analytics
            'total_coins_distributed'  => (int) \App\Models\CoinTransaction::where('amount', '>', 0)->sum('amount'),
            'total_coins_spent'        => (int) abs(\App\Models\CoinTransaction::where('amount', '<', 0)->sum('amount')),
            'coins_distributed_today'  => (int) \App\Models\CoinTransaction::where('amount', '>', 0)->whereDate('created_at', $todayDate)->sum('amount'),
            'coins_spent_today'        => (int) abs(\App\Models\CoinTransaction::where('amount', '<', 0)->whereDate('created_at', $todayDate)->sum('amount')),
            'reward_ads_completed'     => (int) \App\Models\DailyRewardClaim::sum('ads_completed'),
            'coin_unlocks'             => (int) PromptUnlock::where('unlock_method', 'coins')->count(),
            'ad_unlocks'               => (int) PromptUnlock::where('unlock_method', 'ad')->count(),
        ];

        $recentUnlocks = PromptUnlock::with('prompt.category')
            ->orderBy('id', 'desc')
            ->take(8)
            ->get()
            ->map(fn($u) => [
                'id'           => $u->id,
                'device_id'    => $u->device_id ? substr($u->device_id, 0, 8) . '...' : 'Anonymous',
                'prompt_title' => $u->prompt?->title,
                'category'     => $u->prompt?->category?->name,
                'unlocked_at'  => $u->unlocked_at?->toIso8601String(),
            ]);

        $topPrompts = Prompt::with('category')
            ->orderBy('unlock_count', 'desc')
            ->take(5)
            ->get(['id', 'title', 'unlock_count', 'views', 'category_id', 'is_featured', 'is_trending']);

        return Inertia::render('Dashboard/Index', [
            'stats'         => $stats,
            'recentUnlocks' => $recentUnlocks,
            'topPrompts'    => $topPrompts,
            'admin'         => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }
}
