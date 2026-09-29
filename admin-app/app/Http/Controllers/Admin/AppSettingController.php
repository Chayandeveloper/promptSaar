<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingController extends Controller
{
    public function index(): Response
    {
        $settings = AppSetting::getAllSettings();

        return Inertia::render('Settings/AppVersion', [
            'settings' => $settings,
            'admin'    => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'min_version'          => 'required|string|max:20',
            'latest_version'       => 'required|string|max:20',
            'force_update'         => 'required|boolean',
            'update_url'           => 'required|url|max:500',
            'update_title'         => 'required|string|max:100',
            'update_message'       => 'required|string|max:1000',
            'maintenance_mode'     => 'required|boolean',
            'maintenance_message'  => 'required|string|max:1000',
        ]);

        AppSetting::set('min_version', $validated['min_version']);
        AppSetting::set('latest_version', $validated['latest_version']);
        AppSetting::set('force_update', $validated['force_update']);
        AppSetting::set('update_url', $validated['update_url']);
        AppSetting::set('update_title', $validated['update_title']);
        AppSetting::set('update_message', $validated['update_message']);
        AppSetting::set('maintenance_mode', $validated['maintenance_mode']);
        AppSetting::set('maintenance_message', $validated['maintenance_message']);

        return redirect()->back()->with('success', 'App version & force update settings updated successfully!');
    }
}
