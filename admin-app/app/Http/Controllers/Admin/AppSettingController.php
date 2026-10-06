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
        return redirect()->back()->with('info', 'App version settings saving is temporarily disabled.');
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
            'interstitial_prompt_click'   => (bool) AppSetting::get('interstitial_prompt_click', true),
            'interstitial_prompt_back'    => (bool) AppSetting::get('interstitial_prompt_back', true),
            'rewarded_prompt_unlock'      => (bool) AppSetting::get('rewarded_prompt_unlock', true),
            'rewarded_daily_coins'        => (bool) AppSetting::get('rewarded_daily_coins', true),
            'banner_ads_enabled'          => (bool) AppSetting::get('banner_ads_enabled', true),
            'feed_ad_enabled'             => (bool) AppSetting::get('feed_ad_enabled', true),
            'app_open_ad_enabled'         => (bool) AppSetting::get('app_open_ad_enabled', true),
            'interstitial_ad_unit_id'     => (string) AppSetting::get('interstitial_ad_unit_id', 'ca-app-pub-9010050634863664/9136172220'),
            'interstitial_prompt_back_id' => (string) AppSetting::get('interstitial_prompt_back_id', 'ca-app-pub-9010050634863664/9136172220'),
            'banner_ad_unit_id'           => (string) AppSetting::get('banner_ad_unit_id', 'ca-app-pub-9010050634863664/4843372292'),
            'feed_ad_unit_id'             => (string) AppSetting::get('feed_ad_unit_id', 'ca-app-pub-9010050634863664/4843372292'),
            'app_open_ad_unit_id'         => (string) AppSetting::get('app_open_ad_unit_id', 'ca-app-pub-9010050634863664/9136172220'),
            'rewarded_ad_unit_id'         => (string) AppSetting::get('rewarded_ad_unit_id', 'ca-app-pub-9010050634863664/7562991281'),
            'rewarded_prompt_unlock_id'   => (string) AppSetting::get('rewarded_prompt_unlock_id', AppSetting::get('rewarded_ad_unit_id', 'ca-app-pub-9010050634863664/7562991281')),
            'rewarded_daily_coins_id'     => (string) AppSetting::get('rewarded_daily_coins_id', AppSetting::get('rewarded_ad_unit_id', 'ca-app-pub-9010050634863664/7562991281')),
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
            'interstitial_prompt_back',
            'rewarded_prompt_unlock',
            'rewarded_daily_coins',
            'banner_ads_enabled',
            'feed_ad_enabled',
            'app_open_ad_enabled',
        ];

        foreach ($keys as $key) {
            AppSetting::set($key, $request->boolean($key));
        }

        $idKeys = [
            'interstitial_ad_unit_id',
            'interstitial_prompt_back_id',
            'banner_ad_unit_id',
            'feed_ad_unit_id',
            'app_open_ad_unit_id',
            'rewarded_ad_unit_id',
            'rewarded_prompt_unlock_id',
            'rewarded_daily_coins_id',
        ];

        foreach ($idKeys as $idKey) {
            if ($request->filled($idKey)) {
                AppSetting::set($idKey, $request->input($idKey));
            }
        }

        return redirect()->back()->with('success', 'AdMob advertisement settings and controls updated successfully!');
    }
}
