<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoinTransaction;
use App\Models\DailyRewardClaim;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(protected RewardService $rewardService)
    {
    }

    public function index(Request $request): Response
    {
        $query = User::query();

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                  ->orWhere('email', 'like', $term)
                  ->orWhere('device_id', 'like', $term);
            });
        }

        $today = now()->toDateString();
        $dailyLimit = (int) \App\Models\RewardSetting::get('daily_ad_limit', 5);

        $users = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        $userIds = collect($users->items())->pluck('id');

        // Fetch today's claims for these users
        $todayClaims = DailyRewardClaim::whereIn('user_id', $userIds)
            ->where('reward_date', $today)
            ->get()
            ->keyBy('user_id');

        // Fetch total earned and spent for these users
        $earnedSums = CoinTransaction::whereIn('user_id', $userIds)
            ->where('amount', '>', 0)
            ->groupBy('user_id')
            ->selectRaw('user_id, SUM(amount) as total')
            ->pluck('total', 'user_id');

        $spentSums = CoinTransaction::whereIn('user_id', $userIds)
            ->where('amount', '<', 0)
            ->groupBy('user_id')
            ->selectRaw('user_id, SUM(abs(amount)) as total')
            ->pluck('total', 'user_id');

        $usersTransformed = $users->through(function ($u) use ($todayClaims, $earnedSums, $spentSums, $dailyLimit) {
            $claim = $todayClaims->get($u->id);
            return [
                'id'                 => $u->id,
                'name'               => $u->name,
                'email'              => $u->email,
                'device_id'          => $u->device_id,
                'role'               => $u->role,
                'coin_balance'       => (int) $u->coin_balance,
                'ads_watched_today'  => $claim ? (int) $claim->ads_completed : 0,
                'daily_limit'        => $dailyLimit,
                'total_coins_earned' => (int) ($earnedSums[$u->id] ?? 0),
                'total_coins_spent'  => (int) ($spentSums[$u->id] ?? 0),
                'created_at'         => $u->created_at?->toIso8601String(),
            ];
        });

        return Inertia::render('Users/Index', [
            'users'   => $usersTransformed,
            'filters' => $request->only(['search']),
            'admin'   => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function adjustCoins(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|integer|not_in:0', // e.g. +100 or -50
            'reason' => 'required|string|max:255',
        ]);

        $this->rewardService->adjustCoinsByAdmin(
            $user,
            (int) $validated['amount'],
            $validated['reason'],
            Auth::id()
        );

        return redirect()->back()->with('success', "Adjusted coins for {$user->name} successfully!");
    }
}
