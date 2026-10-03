<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Prompt;
use App\Models\PromptUnlock;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromptController extends Controller
{
    public function __construct(protected RewardService $rewardService)
    {
    }

    /**
     * Check if prompt is unlocked for user.
     */
    protected function isPromptUnlocked(Prompt $prompt, ?User $user): bool
    {
        if (!$user) return false;

        return PromptUnlock::where('prompt_id', $prompt->id)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->device_id) {
                    $q->orWhere('device_id', $user->device_id);
                }
            })
            ->exists();
    }

    /**
     * Format prompt for public listing.
     */
    protected function formatSummary(Prompt $prompt, ?User $user = null): array
    {
        $isUnlocked = $this->isPromptUnlocked($prompt, $user);

        return [
            'id'           => $prompt->id,
            'title'        => $prompt->title,
            'slug'         => $prompt->slug,
            'description'  => $prompt->description,
            'cover_image'  => $prompt->cover_image,
            'unlock_cost'  => (int) ($prompt->unlock_cost ?? 30),
            'category_id'  => $prompt->category_id,
            'category'     => $prompt->category ? [
                'id'   => $prompt->category->id,
                'name' => $prompt->category->name,
                'slug' => $prompt->category->slug,
                'icon' => $prompt->category->icon,
            ] : null,
            'tags'         => $prompt->tags ?? [],
            'is_featured'  => (bool) $prompt->is_featured,
            'is_trending'  => (bool) $prompt->is_trending,
            'is_locked'    => !$isUnlocked,
            'prompt_text'  => $isUnlocked ? $prompt->prompt_text : null,
            'views'        => $prompt->views,
            'unlock_count' => $prompt->unlock_count,
            'created_at'   => $prompt->created_at->toIso8601String(),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $query = Prompt::with('category')->where('is_published', true);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        } elseif ($request->filled('category')) {
            $slug = $request->category;
            $query->whereHas('category', fn($q) => $q->where('slug', $slug));
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(fn($q) => $q->where('title', 'like', $term)->orWhere('description', 'like', $term));
        }

        $perPage = (int) $request->input('per_page', 15);
        $prompts = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data'         => collect($prompts->items())->map(fn($p) => $this->formatSummary($p, $user)),
            'current_page' => $prompts->currentPage(),
            'last_page'    => $prompts->lastPage(),
            'per_page'     => $prompts->perPage(),
            'total'        => $prompts->total(),
        ]);
    }

    public function featured(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $prompts = Prompt::with('category')
            ->where('is_published', true)
            ->where('is_featured', true)
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        return response()->json(['featured' => $prompts->map(fn($p) => $this->formatSummary($p, $user))]);
    }

    public function trending(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $prompts = Prompt::with('category')
            ->where('is_published', true)
            ->where('is_trending', true)
            ->orderBy('unlock_count', 'desc')
            ->take(10)
            ->get();

        return response()->json(['trending' => $prompts->map(fn($p) => $this->formatSummary($p, $user))]);
    }

    public function recent(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $prompts = Prompt::with('category')
            ->where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json(['recent' => $prompts->map(fn($p) => $this->formatSummary($p, $user))]);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $prompt = Prompt::with('category')->where('is_published', true)->findOrFail($id);
        $prompt->increment('views');

        return response()->json(['prompt' => $this->formatSummary($prompt, $user)]);
    }

    public function categoryPrompts(string $slug, Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $category = Category::where('slug', $slug)->firstOrFail();

        $query = Prompt::with('category')
            ->where('category_id', $category->id)
            ->where('is_published', true);

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(fn($q) => $q->where('title', 'like', $term)->orWhere('description', 'like', $term));
        }

        $perPage = (int) $request->input('per_page', 15);
        $prompts = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'category' => [
                'id'          => $category->id,
                'name'        => $category->name,
                'slug'        => $category->slug,
                'description' => $category->description,
                'image'       => $category->image,
                'icon'        => $category->icon,
            ],
            'prompts' => [
                'data'         => collect($prompts->items())->map(fn($p) => $this->formatSummary($p, $user)),
                'current_page' => $prompts->currentPage(),
                'last_page'    => $prompts->lastPage(),
                'per_page'     => $prompts->perPage(),
                'total'        => $prompts->total(),
            ],
        ]);
    }

    /**
     * POST /api/prompts/{id}/unlock-with-coins
     * Atomically deducts coins and returns prompt text.
     */
    public function unlockWithCoins(int $id, Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);

        try {
            $result = $this->rewardService->unlockWithCoins($user, $id);
            return response()->json([
                'message'     => $result['message'],
                'prompt_text' => $result['prompt_text'],
                'balance'     => $result['balance'],
                'coins_spent' => $result['coins_spent'],
                'prompt'      => $this->formatSummary($result['prompt'], $user),
            ]);
        } catch (\DomainException $e) {
            $decoded = json_decode($e->getMessage(), true) ?? ['message' => $e->getMessage()];
            return response()->json($decoded, 422);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /api/prompts/{id}/unlock-with-ad
     * Records ad-based unlock and returns prompt text without charging coins.
     */
    public function unlockWithAd(int $id, Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $eventId = $request->input('event_id') ?? $request->input('ad_event_id');
        $deviceId = $request->input('device_id') ?? $request->header('X-Device-Id');

        try {
            $result = $this->rewardService->unlockWithAd($user, $id, $eventId, $deviceId);
            return response()->json([
                'message'     => $result['message'],
                'prompt_text' => $result['prompt_text'],
                'balance'     => $result['balance'],
                'coins_spent' => 0,
                'prompt'      => $this->formatSummary($result['prompt'], $user),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /api/prompts/{id}/unlock
     * Legacy endpoint — alias to unlockWithAd.
     */
    public function unlock(int $id, Request $request): JsonResponse
    {
        return $this->unlockWithAd($id, $request);
    }

    /**
     * POST /api/prompts/{id}/relock
     * Relocks the prompt when user exits the details view so it must be unlocked again next time.
     */
    public function relock(int $id, Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $deviceId = $request->input('device_id') ?? $request->header('X-Device-Id');

        PromptUnlock::where('prompt_id', $id)
            ->where(function ($q) use ($user, $deviceId) {
                $q->where('user_id', $user->id);
                if ($user->device_id) {
                    $q->orWhere('device_id', $user->device_id);
                }
                if ($deviceId) {
                    $q->orWhere('device_id', $deviceId);
                }
            })
            ->delete();

        return response()->json([
            'status'  => 'ok',
            'message' => 'Prompt relocked successfully.',
        ]);
    }
}
