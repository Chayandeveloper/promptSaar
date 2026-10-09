<?php

namespace App\Console\Commands;

use App\Models\PushNotification;
use App\Services\FirebasePushService;
use Illuminate\Console\Command;

class DispatchNotificationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:dispatch {id : The ID of the PushNotification record to dispatch}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatches a specific push notification record to all registered devices in the background.';

    /**
     * Execute the console command.
     */
    public function handle(FirebasePushService $pushService): int
    {
        $id = (int) $this->argument('id');
        $notification = PushNotification::find($id);

        if (!$notification) {
            $this->error("PushNotification record #{$id} was not found.");
            return self::FAILURE;
        }

        $this->info("Dispatching notification #{$id} (\"{$notification->title}\") to all active devices...");

        $pushService->dispatchNotification($notification);

        $this->info("Completed dispatch for notification #{$id}. Success: {$notification->success_count}, Failed: {$notification->failure_count}.");

        return self::SUCCESS;
    }
}
