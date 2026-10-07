<?php

namespace App\Console\Commands;

use App\Services\FirebasePushService;
use Illuminate\Console\Command;

class SendScheduledNotificationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:send-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatches any scheduled push notifications that are due for delivery.';

    /**
     * Execute the console command.
     */
    public function handle(FirebasePushService $pushService): int
    {
        $this->info('Checking for due scheduled notifications...');
        $count = $pushService->processScheduledNotifications();

        if ($count > 0) {
            $this->info("Successfully dispatched {$count} scheduled notification(s).");
        } else {
            $this->comment('No scheduled notifications due at this time.');
        }

        return self::SUCCESS;
    }
}
