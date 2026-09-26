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
}
