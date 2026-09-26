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
     * Broadcast a push notification to all active registered devices.
     */
    public function broadcast(
        string $title,
        string $body,
        array $data = [],
        ?string $imageUrl = null,
        string $actionType = 'home',
        ?string $targetId = null
    ): PushNotification {
        $tokens = DevicePushToken::where('is_active', true)->get();

        $notificationLog = PushNotification::create([
            'title'         => $title,
            'body'          => $body,
            'image_url'     => $imageUrl,
            'action_type'   => $actionType,
            'target_id'     => $targetId,
            'data'          => $data,
            'sent_count'    => $tokens->count(),
            'success_count' => 0,
            'failure_count' => 0,
            'status'        => 'sent',
        ]);

        if ($tokens->isEmpty()) {
            return $notificationLog;
        }

        $successCount = 0;
        $failureCount = 0;

        // Group tokens by type (Expo vs FCM)
        $expoTokens = $tokens->where('token_type', 'expo');
        $fcmTokens  = $tokens->where('token_type', 'fcm');

        // 1. Dispatch Expo tokens in batches
        if ($expoTokens->isNotEmpty()) {
            [$expoSuccess, $expoFailure] = $this->sendExpoBatch(
                $expoTokens->pluck('push_token')->toArray(),
                $title,
                $body,
                $data,
                $imageUrl
            );
            $successCount += $expoSuccess;
            $failureCount += $expoFailure;
        }

        // 2. Dispatch FCM native tokens
        if ($fcmTokens->isNotEmpty()) {
            foreach ($fcmTokens as $fcmRecord) {
                $ok = $this->sendFcmV1(
                    $fcmRecord->push_token,
                    $title,
                    $body,
                    $data,
                    $imageUrl
                );
                if ($ok) {
                    $successCount++;
                } else {
                    $failureCount++;
                }
            }
        }

        $notificationLog->update([
            'success_count' => $successCount,
            'failure_count' => $failureCount,
            'status'        => $failureCount === $tokens->count() && $tokens->isNotEmpty() ? 'failed' : 'sent',
        ]);

        return $notificationLog;
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
     * Send via Firebase Cloud Messaging (FCM HTTP v1 API).
     */
    protected function sendFcmV1(
        string $token,
        string $title,
        string $body,
        array $data,
        ?string $imageUrl = null
    ): bool {
        $credentialsPath = config('services.firebase.credentials') 
            ?? storage_path('app/firebase-credentials.json');

        if (!file_exists($credentialsPath)) {
            Log::info("[FCM] firebase-credentials.json not present at {$credentialsPath}. Notification logged.");
            return true; // Graceful fallback
        }

        try {
            $creds = json_decode(file_get_contents($credentialsPath), true);
            $projectId = $creds['project_id'] ?? null;
            if (!$projectId) return false;

            $accessToken = $this->getGoogleAccessToken($creds);
            if (!$accessToken) return false;

            $payload = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body'  => $body,
                    ],
                    'data' => array_map('strval', $data),
                    'android' => [
                        'priority' => 'HIGH',
                        'notification' => [
                            'sound'         => 'default',
                            'channel_id'    => 'default',
                            'default_sound' => true,
                        ],
                    ],
                ],
            ];

            if ($imageUrl) {
                $payload['message']['notification']['image'] = $imageUrl;
                $payload['message']['android']['notification']['image'] = $imageUrl;
            }

            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";
            $res = Http::withoutVerifying()
                ->withToken($accessToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, $payload);

            return $res->successful();
        } catch (\Throwable $e) {
            Log::error('[FCM] Error sending FCM message: ' . $e->getMessage());
            return false;
        }
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
