<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DevicePushToken;
use App\Models\Prompt;
use App\Models\PushNotification;
use App\Services\FirebasePushService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        protected FirebasePushService $pushService
    ) {}

    public function index(): Response
    {
        // Check and dispatch any due scheduled notifications
        $this->pushService->processScheduledNotifications();

        $activeDevicesCount = DevicePushToken::where('is_active', true)->count();
        $fcmCount = DevicePushToken::where('is_active', true)->where('token_type', 'fcm')->count();
        $expoCount = DevicePushToken::where('is_active', true)->where('token_type', 'expo')->count();

        // 1. Pending scheduled notifications
        $scheduledNotifications = PushNotification::where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->orderBy('scheduled_at', 'asc')
            ->get();

        // 2. Sent / Past history
        $notifications = PushNotification::where('status', '!=', 'scheduled')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $prompts = Prompt::select('id', 'title')->where('is_published', true)->orderBy('title')->get();

        $credentialsPath = config('services.firebase.credentials') ?? storage_path('app/firebase-credentials.json');
        $hasCredentials = file_exists($credentialsPath);

        return Inertia::render('Notifications/Index', [
            'stats' => [
                'active_devices'  => $activeDevicesCount,
                'fcm_devices'     => $fcmCount,
                'expo_devices'    => $expoCount,
                'has_credentials' => $hasCredentials,
                'scheduled_count' => $scheduledNotifications->count(),
            ],
            'scheduled_notifications' => $scheduledNotifications,
            'notifications'           => $notifications,
            'prompts'                 => $prompts,
            'admin'                   => Auth::user()->only('name', 'email', 'avatar'),
            'server_time'             => now()->toIso8601String(),
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:150',
            'body'         => 'required|string|max:500',
            'image_url'    => 'nullable|url|max:500',
            'action_type'  => 'required|string|in:home,prompt,rewards,custom',
            'prompt_id'    => 'nullable|required_if:action_type,prompt|exists:prompts,id',
            'custom_url'   => 'nullable|string|max:500',
            'send_type'    => 'required|string|in:now,scheduled',
            'scheduled_at' => 'nullable|required_if:send_type,scheduled|date',
        ]);

        $data = [
            'type' => $validated['action_type'],
        ];

        $targetId = null;
        if ($validated['action_type'] === 'prompt') {
            $data['prompt_id'] = (int) $validated['prompt_id'];
            $targetId = (string) $validated['prompt_id'];
        } elseif ($validated['action_type'] === 'custom' && !empty($validated['custom_url'])) {
            $data['url'] = $validated['custom_url'];
            $targetId = $validated['custom_url'];
        }

        $scheduledAt = null;
        if ($validated['send_type'] === 'scheduled' && !empty($validated['scheduled_at'])) {
            $rawDate = $validated['scheduled_at'];
            $tzOffset = $request->input('timezone_offset'); // in minutes from JS getTimezoneOffset()

            if (str_contains($rawDate, 'Z') || preg_match('/[+-]\d{2}:?\d{2}$/', $rawDate)) {
                $scheduledAt = Carbon::parse($rawDate)->setTimezone('UTC');
            } elseif (is_numeric($tzOffset)) {
                // In JS, getTimezoneOffset() is negative for UTC+ (e.g. -330 for IST UTC+5:30)
                $scheduledAt = Carbon::parse($rawDate)->addMinutes((int) $tzOffset)->setTimezone('UTC');
            } else {
                $scheduledAt = Carbon::parse($rawDate)->setTimezone('UTC');
            }
        }

        $log = $this->pushService->broadcast(
            title: $validated['title'],
            body: $validated['body'],
            data: $data,
            imageUrl: $validated['image_url'] ?? null,
            actionType: $validated['action_type'],
            targetId: $targetId,
            scheduledAt: $scheduledAt
        );

        if ($scheduledAt && $scheduledAt > now()) {
            $formattedTime = $scheduledAt->format('M d, Y h:i A');
            return redirect()->back()->with('success', "Notification scheduled successfully for {$formattedTime}!");
        }

        return redirect()->back()->with('success', "Notification dispatched to {$log->sent_count} registered devices!");
    }

    public function sendNow(PushNotification $notification)
    {
        $this->pushService->dispatchNotification($notification);

        return redirect()->back()->with('success', "Notification #{$notification->id} dispatched immediately to {$notification->sent_count} registered devices!");
    }

    public function destroy(PushNotification $notification)
    {
        $notification->delete();

        return redirect()->back()->with('success', "Notification removed successfully.");
    }
}
