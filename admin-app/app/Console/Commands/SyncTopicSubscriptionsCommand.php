<?php

namespace App\Console\Commands;

use App\Models\DevicePushToken;
use App\Services\FirebasePushService;
use Illuminate\Console\Command;

class SyncTopicSubscriptionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:sync-topic {--topic=all_users : The topic name to subscribe tokens to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Subscribes all active FCM device tokens in the database to the Firebase broadcast topic.';

    /**
     * Execute the console command.
     */
    public function handle(FirebasePushService $pushService): int
    {
        $topic = $this->option('topic') ?: 'all_users';

        $tokens = DevicePushToken::where('is_active', true)
            ->where('token_type', 'fcm')
            ->pluck('push_token')
            ->toArray();

        $total = count($tokens);

        if ($total === 0) {
            $this->warn('No active FCM tokens found in the database.');
            return self::SUCCESS;
        }

        $this->info("Found {$total} active FCM tokens. Subscribing to topic \"{$topic}\" in batches of 1,000...");

        $bar = $this->output->createProgressBar(ceil($total / 1000));
        $bar->start();

        $chunks = array_chunk($tokens, 1000);
        $totalSubscribed = 0;

        foreach ($chunks as $chunk) {
            $count = $pushService->subscribeTokensToTopic($chunk, $topic);
            $totalSubscribed += $count;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Successfully synced {$totalSubscribed}/{$total} devices to topic \"{$topic}\" on Google Firebase!");

        return self::SUCCESS;
    }
}
