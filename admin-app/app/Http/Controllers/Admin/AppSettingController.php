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

    public function adsIndex(): Response
    {
        $settings = [
            'ads_enabled'               => (bool) AppSetting::get('ads_enabled', true),
            'interstitial_prompt_click' => (bool) AppSetting::get('interstitial_prompt_click', true),
            'rewarded_prompt_unlock'    => (bool) AppSetting::get('rewarded_prompt_unlock', true),
            'rewarded_daily_coins'      => (bool) AppSetting::get('rewarded_daily_coins', true),
            'banner_ads_enabled'        => (bool) AppSetting::get('banner_ads_enabled', true),
            'interstitial_ad_unit_id'   => (string) AppSetting::get('interstitial_ad_unit_id', 'ca-app-pub-3940256099942544/1033173712'),
            'banner_ad_unit_id'         => (string) AppSetting::get('banner_ad_unit_id', 'ca-app-pub-3940256099942544/6300978111'),
        ];

        return Inertia::render('Settings/Ads', [
            'settings' => $settings,
            'admin'    => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function updateAds(Request $request)
    {
        $keys = [
            'ads_enabled',
            'interstitial_prompt_click',
            'rewarded_prompt_unlock',
            'rewarded_daily_coins',
            'banner_ads_enabled',
        ];

        foreach ($keys as $key) {
            AppSetting::set($key, $request->boolean($key));
        }

        if ($request->filled('interstitial_ad_unit_id')) {
            AppSetting::set('interstitial_ad_unit_id', $request->input('interstitial_ad_unit_id'));
        }

        if ($request->filled('banner_ad_unit_id')) {
            AppSetting::set('banner_ad_unit_id', $request->input('banner_ad_unit_id'));
        }

        return redirect()->back()->with('success', 'AdMob advertisement settings and controls updated successfully!');
    }
}
