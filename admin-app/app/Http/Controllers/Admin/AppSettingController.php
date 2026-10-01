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
            'min_version'          => 'nullable|string|max:20',
            'latest_version'       => 'nullable|string|max:20',
            'force_update'         => 'nullable|boolean',
            'update_url'           => 'nullable|string|max:500',
            'update_title'         => 'nullable|string|max:100',
            'update_message'       => 'nullable|string|max:1000',
            'maintenance_mode'     => 'nullable|boolean',
            'maintenance_message'  => 'nullable|string|max:1000',
            'whatsapp_url'         => 'nullable|string|max:500',
            'instagram_url'        => 'nullable|string|max:500',
            'telegram_url'         => 'nullable|string|max:500',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                AppSetting::set($key, $value);
            }
        }

        return redirect()->back()->with('success', 'App version settings updated successfully!');
    }

    public function socialIndex(): Response
    {
        $settings = [
            'whatsapp_url'  => (string) AppSetting::get('whatsapp_url', 'https://wa.me/'),
            'instagram_url' => (string) AppSetting::get('instagram_url', 'https://instagram.com/'),
            'telegram_url'  => (string) AppSetting::get('telegram_url', 'https://t.me/'),
        ];

        return Inertia::render('Settings/SocialChannels', [
            'settings' => $settings,
            'admin'    => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function updateSocial(Request $request)
    {
        $validated = $request->validate([
            'whatsapp_url'  => 'nullable|string|max:500',
            'instagram_url' => 'nullable|string|max:500',
            'telegram_url'  => 'nullable|string|max:500',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                AppSetting::set($key, $value);
            }
        }

        return redirect()->back()->with('success', 'Social redirect channels updated successfully!');
    }
}
