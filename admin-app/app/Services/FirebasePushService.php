<?php

namespace App\Services;

use App\Models\DevicePushToken;
use App\Models\PushNotification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebasePushService
{
    /**
     * Register or refresh a device's push token.
     */
    public function registerToken(
        string $deviceId,
        string $pushToken,
        string $tokenType = 'fcm',
        string $platform = 'android',
        ?User $user = null
    ): DevicePushToken {
        return DevicePushToken::updateOrCreate(
            ['device_id' => $deviceId],
            [
                'user_id'      => $user?->id,
                'push_token'   => $pushToken,
                'token_type'   => $tokenType,
                'platform'     => $platform,
                'is_active'    => true,
                'last_seen_at' => now(),
            ]
        );
    }

    /**
     * Broadcast a push notification immediately or schedule it for a future timestamp.
     */
    public function broadcast(
        string $title,
        string $body,
        array $data = [],
        ?string $imageUrl = null,
        string $actionType = 'home',
        ?string $targetId = null,
        ?\DateTimeInterface $scheduledAt = null
    ): PushNotification {
        $isScheduled = $scheduledAt && $scheduledAt > now();

        $notificationLog = PushNotification::create([
            'title'         => $title,
            'body'          => $body,
            'image_url'     => $imageUrl,
            'action_type'   => $actionType,
            'target_id'     => $targetId,
            'data'          => $data,
            'sent_count'    => 0,
            'success_count' => 0,
            'failure_count' => 0,
            'status'        => $isScheduled ? 'scheduled' : 'processing',
            'scheduled_at'  => $scheduledAt,
            'sent_at'       => null,
        ]);

        if ($isScheduled) {
            Log::info("[PushService] Notification #{$notificationLog->id} scheduled for {$scheduledAt->format('Y-m-d H:i:s')}");
            return $notificationLog;
        }

        return $this->dispatchNotification($notificationLog);
    }

    protected ?string $cachedAccessToken = null;
    protected int $tokenExpiresAt = 0;

    /**
     * Dispatch an existing push notification record to all registered devices.
     */
    public function dispatchNotification(PushNotification $notification): PushNotification
    {
        @set_time_limit(300);
        @ignore_user_abort(true);

        $tokens = DevicePushToken::where('is_active', true)->get();

        $notification->update([
            'status'     => 'processing',
            'sent_count' => $tokens->count(),
            'sent_at'    => now(),
        ]);

        if ($tokens->isEmpty()) {
            $notification->update([
                'status'  => 'sent',
                'sent_at' => now(),
            ]);
            return $notification;
        }

        $successCount = 0;
        $failureCount = 0;

        try {
            // Group tokens by type (Expo vs FCM)
            $expoTokens = $tokens->where('token_type', 'expo');
            $fcmTokens  = $tokens->where('token_type', 'fcm');

            // 1. Dispatch Expo tokens in batches
            if ($expoTokens->isNotEmpty()) {
                [$expoSuccess, $expoFailure] = $this->sendExpoBatch(
                    $expoTokens->pluck('push_token')->toArray(),
                    $notification->title,
                    $notification->body,
                    $notification->data ?? [],
                    $notification->image_url
                );
                $successCount += $expoSuccess;
                $failureCount += $expoFailure;
            }

            // 2. Dispatch FCM native tokens in parallel pools
            if ($fcmTokens->isNotEmpty()) {
                [$fcmSuccess, $fcmFailure] = $this->sendFcmBatch(
                    $fcmTokens->pluck('push_token')->toArray(),
                    $notification->title,
                    $notification->body,
                    $notification->data ?? [],
                    $notification->image_url
                );
                $successCount += $fcmSuccess;
                $failureCount += $fcmFailure;
            }
        } finally {
            $notification->update([
                'success_count' => $successCount,
                'failure_count' => $failureCount,
                'status'        => 'sent',
                'sent_at'       => now(),
            ]);
        }

        Log::info("[PushService] Dispatched notification #{$notification->id} to {$tokens->count()} devices. Success: {$successCount}, Failed: {$failureCount}");

        return $notification;
    }

    /**
     * Process and dispatch all pending scheduled notifications that are due.
     * Returns the count of dispatched notifications.
     */
    public function processScheduledNotifications(): int
    {
        // Auto-heal any stale processing notifications (older than 2 minutes)
        PushNotification::where('status', 'processing')
            ->where('updated_at', '<', now()->subMinutes(2))
            ->update([
                'status'  => 'sent',
                'sent_at' => now(),
            ]);

        $due = PushNotification::where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->orderBy('scheduled_at', 'asc')
            ->get();

        $processed = 0;
        foreach ($due as $notification) {
            // Atomically transition status from scheduled to processing to prevent concurrent double dispatch
            $affected = PushNotification::where('id', $notification->id)
                ->where('status', 'scheduled')
                ->update(['status' => 'processing']);

            if ($affected > 0) {
                $notification->refresh();
                $this->dispatchNotification($notification);
                $processed++;
            }
        }

        return $processed;
    }

    /**
     * Send batch to Expo Push API.
     */
    protected function sendExpoBatch(
        array $tokens,
        string $title,
        string $body,
        array $data,
        ?string $imageUrl = null
    ): array {
        $chunks = array_chunk($tokens, 100);
        $success = 0;
        $failure = 0;

        foreach ($chunks as $chunk) {
            $messages = array_map(function ($token) use ($title, $body, $data, $imageUrl) {
                $msg = [
                    'to'        => $token,
                    'sound'     => 'default',
                    'title'     => $title,
                    'body'      => $body,
                    'data'      => $data,
                    'priority'  => 'high',
                    'channelId' => 'default',
                ];
                if ($imageUrl) {
                    $msg['richContent'] = ['image' => $imageUrl];
                }
                return $msg;
            }, $chunk);

            try {
                $response = Http::withHeaders([
                    'Accept'       => 'application/json',
                    'Content-Type' => 'application/json',
                ])->post('https://exp.host/--/api/v2/push/send', $messages);

                if ($response->successful()) {
                    $results = $response->json('data') ?? [];
                    foreach ($results as $res) {
                        if (($res['status'] ?? '') === 'ok') {
                            $success++;
                        } else {
                            $failure++;
                        }
                    }
                } else {
                    $failure += count($chunk);
                }
            } catch (\Throwable $e) {
                Log::warning('[ExpoPushService] Batch send failed: ' . $e->getMessage());
                $failure += count($chunk);
            }
        }

        return [$success, $failure];
    }

    /**
     * Send FCM tokens in concurrent batches via HTTP Pool.
     */
    protected function sendFcmBatch(
        array $tokens,
        string $title,
        string $body,
        array $data,
        ?string $imageUrl = null
    ): array {
        $credentialsPath = config('services.firebase.credentials') 
            ?? storage_path('app/firebase-credentials.json');

        if (!file_exists($credentialsPath)) {
            Log::info("[FCM] firebase-credentials.json not present at {$credentialsPath}. Notification logged.");
            return [count($tokens), 0];
        }

        try {
            $creds = json_decode(file_get_contents($credentialsPath), true);
            $projectId = $creds['project_id'] ?? null;
            if (!$projectId) return [0, count($tokens)];

            $accessToken = $this->getCachedGoogleAccessToken($creds);
            if (!$accessToken) return [0, count($tokens)];

            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";
            $chunks = array_chunk($tokens, 100);
            $success = 0;
            $failure = 0;
            $unregistered = [];

            foreach ($chunks as $chunk) {
                $responses = Http::pool(function ($pool) use ($chunk, $url, $accessToken, $title, $body, $data, $imageUrl) {
                    $requests = [];
                    foreach ($chunk as $token) {
                        $mergedData = array_merge([
                            'title'     => $title,
                            'body'      => $body,
                            'channelId' => 'default',
                        ], array_map('strval', $data));

                        $payload = [
                            'message' => [
                                'token' => $token,
                                'notification' => [
                                    'title' => $title,
                                    'body'  => $body,
                                ],
                                'data' => $mergedData,
                                'android' => [
                                    'priority' => 'HIGH',
                                    'notification' => [
                                        'sound'                 => 'default',
                                        'channel_id'            => 'default',
                                        'default_sound'         => true,
                                        'notification_priority' => 'PRIORITY_MAX',
                                        'visibility'            => 'PUBLIC',
                                    ],
                                ],
                            ],
                        ];
                        if ($imageUrl) {
                            $payload['message']['notification']['image'] = $imageUrl;
                            $payload['message']['android']['notification']['image'] = $imageUrl;
                        }
                        $requests[] = $pool->as($token)
                            ->withoutVerifying()
                            ->withToken($accessToken)
                            ->withHeaders(['Content-Type' => 'application/json'])
                            ->timeout(8)
                            ->post($url, $payload);
                    }
                    return $requests;
                });

                foreach ($responses as $token => $res) {
                    if ($res instanceof \Illuminate\Http\Client\Response && $res->successful()) {
                        $success++;
                    } else {
                        $failure++;
                        if ($res instanceof \Illuminate\Http\Client\Response) {
                            if ($res->status() === 404 || str_contains($res->body(), 'UNREGISTERED')) {
                                $unregistered[] = $token;
                            }
                        }
                    }
                }
            }

            if (!empty($unregistered)) {
                DevicePushToken::whereIn('push_token', $unregistered)->update(['is_active' => false]);
            }

            return [$success, $failure];
        } catch (\Throwable $e) {
            Log::error('[FCM] Batch send error: ' . $e->getMessage());
            return [0, count($tokens)];
        }
    }

    /**
     * Get or cached Google OAuth2 access token to prevent rate limits across thousands of devices.
     */
    protected function getCachedGoogleAccessToken(array $creds): ?string
    {
        if ($this->cachedAccessToken && time() < ($this->tokenExpiresAt - 120)) {
            return $this->cachedAccessToken;
        }

        $token = $this->getGoogleAccessToken($creds);
        if ($token) {
            $this->cachedAccessToken = $token;
            $this->tokenExpiresAt = time() + 3500;
        }

        return $token;
    }

    /**
     * Generates a short-lived Google OAuth2 access token via JWT using private key.
     */
    protected function getGoogleAccessToken(array $creds): ?string
    {
        $now = time();
        $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $claims = json_encode([
            'iss'   => $creds['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud'   => 'https://oauth2.googleapis.com/token',
            'exp'   => $now + 3600,
            'iat'   => $now,
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlClaims = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($claims));
        $signatureInput = $base64UrlHeader . '.' . $base64UrlClaims;

        $privateKey = openssl_pkey_get_private($creds['private_key']);
        if (!$privateKey) return null;

        openssl_sign($signatureInput, $binarySignature, $privateKey, 'SHA256');
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($binarySignature));
        $jwt = $signatureInput . '.' . $base64UrlSignature;

        $res = Http::withoutVerifying()->asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]);

        return $res->json('access_token');
    }
}
