<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DevicePushToken;
use App\Services\FirebasePushService;
use App\Services\RewardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected FirebasePushService $pushService,
        protected RewardService $rewardService
    ) {}

    /**
     * POST /api/notifications/register-token
     */
    public function registerToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'push_token' => 'required|string',
            'token_type' => 'nullable|string|in:fcm,expo',
            'platform'   => 'nullable|string|in:android,ios,web',
            'device_id'  => 'nullable|string',
        ]);

        $user = $this->rewardService->resolveUser($request);
        $deviceId = $validated['device_id'] ?? $request->header('X-Device-Id') ?? ($user ? $user->device_id : 'anonymous');
        $tokenType = $validated['token_type'] ?? 'fcm';
        $platform = $validated['platform'] ?? 'android';

        $tokenRecord = $this->pushService->registerToken(
            deviceId: $deviceId,
            pushToken: $validated['push_token'],
            tokenType: $tokenType,
            platform: $platform,
            user: $user
        );

        if ($tokenType === 'fcm') {
            try {
                $this->pushService->subscribeTokensToTopic([$validated['push_token']], 'all_users');
            } catch (\Throwable $e) {
                // Non-blocking to guarantee API registration always succeeds
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Push token registered successfully.',
            'device_id' => $tokenRecord->device_id,
            'token_type' => $tokenRecord->token_type,
        ]);
    }

    /**
     * POST /api/notifications/unregister-token
     */
    public function unregisterToken(Request $request): JsonResponse
    {
        $deviceId = $request->input('device_id') ?? $request->header('X-Device-Id');
        if ($deviceId) {
            DevicePushToken::where('device_id', $deviceId)->update(['is_active' => false]);
        }

        return response()->json(['success' => true, 'message' => 'Push token unregistered.']);
    }

    /**
     * GET /api/notifications/latest
     * Returns latest sent notifications for live testing in Expo Go and client in-app sync.
     */
    public function latest(Request $request): JsonResponse
    {
        // Fail-safe: trigger any overdue scheduled notifications
        try {
            $this->pushService->processScheduledNotifications();
        } catch (\Throwable $e) {}

        $sinceId = (int) $request->query('since_id', 0);

        $query = \App\Models\PushNotification::where(function ($q) {
            $q->where('status', 'sent')
              ->orWhereNotNull('sent_at');
        })->orderBy('id', 'desc');

        if ($sinceId > 0) {
            $query->where('id', '>', $sinceId);
        }

        $notifications = $query->limit(5)->get();

        return response()->json([
            'status'        => 'ok',
            'notifications' => $notifications,
        ]);
    }
}
