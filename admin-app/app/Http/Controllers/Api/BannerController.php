<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Prompt;
use App\Models\PromptUnlock;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    protected RewardService $rewardService;

    public function __construct(RewardService $rewardService)
    {
        $this->rewardService = $rewardService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $banners = Banner::with(['prompt.category', 'category'])
            ->active()
            ->get();

        return response()->json([
            'banners' => $banners->map(fn($b) => $this->formatBanner($b, $user)),
        ]);
    }

    public function active(Request $request): JsonResponse
    {
        $user = $this->rewardService->resolveUser($request);
        $banner = Banner::with(['prompt.category', 'category'])
            ->active()
            ->first();

        return response()->json([
            'banner' => $banner ? $this->formatBanner($banner, $user) : null,
        ]);
    }

    protected function formatBanner(Banner $banner, ?User $user = null): array
    {
        $promptData = null;
        if ($banner->prompt) {
            $prompt = $banner->prompt;
            $isUnlocked = false;
            if ($user) {
                $isUnlocked = PromptUnlock::where('prompt_id', $prompt->id)
                    ->where(function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                        if ($user->device_id) {
                            $q->orWhere('device_id', $user->device_id);
                        }
                    })
                    ->exists();
            }

            $promptData = [
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
                'created_at'   => $prompt->created_at?->toIso8601String(),
            ];
        }

        $categoryName = $banner->category?->name ?? $banner->prompt?->category?->name;
        $categorySlug = $banner->category?->slug ?? $banner->prompt?->category?->slug;

        return [
            'id'            => $banner->id,
            'title'         => $banner->title,
            'subtitle'      => $banner->subtitle,
            'badge_text'    => $banner->badge_text ?: 'FEATURED PROMPT',
            'image_url'     => $banner->image_url,
            'cta_text'      => $banner->cta_text ?: 'View & Unlock',
            'action_type'   => $banner->action_type,
            'prompt_id'     => $banner->prompt_id,
            'category_id'   => $banner->category_id,
            'category_name' => $categoryName,
            'category_slug' => $categorySlug,
            'target_url'    => $banner->target_url,
            'is_active'     => (bool) $banner->is_active,
            'order'         => (int) $banner->order,
            'prompt'        => $promptData,
        ];
    }
}
