<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DevicePushToken;
use App\Models\Prompt;
use App\Models\PushNotification;
use App\Services\FirebasePushService;
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
        $activeDevicesCount = DevicePushToken::where('is_active', true)->count();
        $fcmCount = DevicePushToken::where('is_active', true)->where('token_type', 'fcm')->count();
        $expoCount = DevicePushToken::where('is_active', true)->where('token_type', 'expo')->count();

        $notifications = PushNotification::orderBy('created_at', 'desc')->paginate(15);
        $prompts = Prompt::select('id', 'title')->where('is_published', true)->orderBy('title')->get();

        $credentialsPath = config('services.firebase.credentials') ?? storage_path('app/firebase-credentials.json');
        $hasCredentials = file_exists($credentialsPath);

        return Inertia::render('Notifications/Index', [
            'stats' => [
                'active_devices' => $activeDevicesCount,
                'fcm_devices'    => $fcmCount,
                'expo_devices'   => $expoCount,
                'has_credentials'=> $hasCredentials,
            ],
            'notifications' => $notifications,
            'prompts'       => $prompts,
            'admin'         => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:150',
            'body'        => 'required|string|max:500',
            'image_url'   => 'nullable|url|max:500',
            'action_type' => 'required|string|in:home,prompt,rewards,custom',
            'prompt_id'   => 'nullable|required_if:action_type,prompt|exists:prompts,id',
            'custom_url'  => 'nullable|string|max:500',
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

        $log = $this->pushService->broadcast(
            title: $validated['title'],
            body: $validated['body'],
            data: $data,
            imageUrl: $validated['image_url'] ?? null,
            actionType: $validated['action_type'],
            targetId: $targetId
        );

        return redirect()->back()->with('success', "Notification dispatched to {$log->sent_count} registered devices!");
    }
}
