<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppVersionController extends Controller
{
    /**
     * Check current client version and return update status.
     */
    public function check(Request $request, \App\Services\FirebasePushService $pushService): JsonResponse
    {
        // Fail-safe: trigger any overdue scheduled notifications
        try {
            $pushService->processScheduledNotifications();
        } catch (\Throwable $e) {
            // Ignore background error so API check never fails
        }

        $settings = AppSetting::getAllSettings();
        $clientVersion = $request->query('version', '1.0.0');

        $minVersion    = $settings['min_version'] ?: '1.0.0';
        $latestVersion = $settings['latest_version'] ?: '1.0.0';
        $globalForce   = (bool) $settings['force_update'];

        // Determine if force update is needed
        $isBelowMin = version_compare($clientVersion, $minVersion, '<');
        $needsForceUpdate = $globalForce || $isBelowMin;

        // Determine if soft update is needed
        $needsSoftUpdate = !$needsForceUpdate && version_compare($clientVersion, $latestVersion, '<');

        return response()->json([
            'status'               => 'ok',
            'client_version'       => $clientVersion,
            'min_version'          => $minVersion,
            'latest_version'       => $latestVersion,
            'force_update_flag'    => $globalForce,
            'needs_force_update'   => $needsForceUpdate,
            'needs_soft_update'    => $needsSoftUpdate,
            'update_url'           => $settings['update_url'],
            'update_title'         => $settings['update_title'],
            'update_message'       => $settings['update_message'],
            'maintenance_mode'     => (bool) $settings['maintenance_mode'],
            'maintenance_message'  => $settings['maintenance_message'],
        ]);
    }
}
