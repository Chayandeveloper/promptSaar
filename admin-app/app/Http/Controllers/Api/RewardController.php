<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoinTransaction;
use App\Models\PromptUnlock;
use App\Models\RewardSetting;
use App\Services\RewardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RewardController extends Controller
{
    public function __construct(protected RewardService $rewardService)
    {
    }

    /**
     * GET /api/me/coins
     * Return user's current coin balance & lifetime statistics.
     */
    public function balance(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        return response()->json($this->rewardService->getUserCoins($user));
    }

    /**
     * GET /api/rewards/config
     * Returns global reward and default prompt unlock configuration.
     */
    public function config(): JsonResponse
    {
        return response()->json(RewardSetting::getAllSettings());
    }

    /**
     * GET /api/rewards/today
     * Returns user's rewarded ad status for today.
     */
    public function today(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $status = $this->rewardService->getTodayStatus($user, $request->ip());
        return response()->json($status);
    }

    /**
     * POST /api/rewards/ad-completed
     * Awards configured coins after verified ad playback.
     */
    public function adCompleted(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $eventId = $request->input('event_id') ?? $request->input('ad_event_id');

        try {
            $result = $this->rewardService->claimAdReward($user, $eventId, $request->ip());
            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'error'   => 'daily_limit_reached',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * GET /api/me/coin-transactions
     * Returns history of coin earnings & spending.
     */
    public function transactions(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $perPage = (int) $request->input('per_page', 20);

        $transactions = CoinTransaction::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data'         => $transactions->items(),
            'current_page' => $transactions->currentPage(),
            'last_page'    => $transactions->lastPage(),
            'total'        => $transactions->total(),
            'balance'      => $user->coin_balance,
        ]);
    }

    /**
     * GET /api/me/unlocked
     * Returns list of prompts unlocked by this user/device.
     */
    public function unlocked(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);

        $unlocks = PromptUnlock::with('prompt.category')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->device_id) {
                    $q->orWhere('device_id', $user->device_id);
                }
            })
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'unlocked_prompt_ids' => $unlocks->pluck('prompt_id')->unique()->values(),
            'unlocks'             => $unlocks->map(fn($u) => [
                'id'            => $u->id,
                'prompt_id'     => $u->prompt_id,
                'prompt_title'  => $u->prompt?->title,
                'unlock_method' => $u->unlock_method,
                'coins_spent'   => $u->coins_spent,
                'unlocked_at'   => $u->unlocked_at?->toIso8601String(),
            ]),
        ]);
    }
}
