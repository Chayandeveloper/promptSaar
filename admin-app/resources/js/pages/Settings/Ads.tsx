import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Tv, Save, CheckCircle, Sparkles,
    PlaySquare, Layers, Coins, RefreshCw, Info
} from 'lucide-react';

interface Settings {
    ads_enabled: boolean;
    interstitial_prompt_click: boolean;
    rewarded_prompt_unlock: boolean;
    rewarded_daily_coins: boolean;
    banner_ads_enabled: boolean;
    interstitial_ad_unit_id: string;
    banner_ad_unit_id: string;
    rewarded_ad_unit_id: string;
}

interface Admin {
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    settings: Settings;
    admin: Admin;
}

const inputStyle = {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
};

export default function AdsSettingsPage({ settings, admin }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        ads_enabled: settings.ads_enabled ?? true,
        interstitial_prompt_click: settings.interstitial_prompt_click ?? true,
        rewarded_prompt_unlock: settings.rewarded_prompt_unlock ?? true,
        rewarded_daily_coins: settings.rewarded_daily_coins ?? true,
        banner_ads_enabled: settings.banner_ads_enabled ?? true,
        interstitial_ad_unit_id: settings.interstitial_ad_unit_id || 'ca-app-pub-9010050634863664/9136172220',
        banner_ad_unit_id: settings.banner_ad_unit_id || 'ca-app-pub-9010050634863664/4429647201',
        rewarded_ad_unit_id: settings.rewarded_ad_unit_id || 'ca-app-pub-9010050634863664/7562991281',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings/ads', { preserveScroll: true });
    };

    return (
        <AdminLayout admin={admin} title="AdMob & Advertisement Controls">
            <Head title="AdMob & Advertisement Controls" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                                AdMob Advertisement Controls
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                <Sparkles size={12} />
                                Live Remote Config
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                            Control where and when ads appear across the mobile app. All settings take effect immediately in the app.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={submit}
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        {processing ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                        <span>{processing ? 'Saving...' : 'Save Ad Settings'}</span>
                    </button>
                </div>

                {/* Success Message */}
                {recentlySuccessful && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                        <CheckCircle size={18} className="flex-shrink-0" />
                        <span className="font-medium">Ad settings and switches saved successfully! Mobile clients will apply them immediately.</span>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Master Kill-Switch Card */}
                    <div
                        className="p-6 rounded-2xl border transition-all"
                        style={{
                            background: data.ads_enabled
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.04))'
                                : 'var(--color-surface)',
                            borderColor: data.ads_enabled ? 'rgba(99, 102, 241, 0.3)' : 'var(--color-border)',
                        }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-xl ${data.ads_enabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-700/30 text-zinc-400'}`}>
                                        <Tv size={20} />
                                    </div>
                                    <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Global Ads Master Switch
                                    </h2>
                                </div>
                                <p className="text-xs sm:text-sm pt-1" style={{ color: 'var(--color-muted)' }}>
                                    When turned OFF, all ads (interstitials, banners, and rewarded ads) are immediately disabled across the entire mobile application.
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                                <input
                                    type="checkbox"
                                    checked={data.ads_enabled}
                                    onChange={(e) => setData('ads_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Individual Ad Placements */}
                    <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
                            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                Ad Placements & Triggers
                            </h2>
                            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                Configure individual ad triggers. These can be toggled on or off independently.
                            </p>
                        </div>

                        {!data.ads_enabled && (
                            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
                                <Info size={16} className="flex-shrink-0" />
                                <span>The Global Master Switch above is <strong>OFF</strong>. All ads are currently deactivated app-wide. You can still configure individual placements below for when it is turned on.</span>
                            </div>
                        )}

                        {/* 1. Interstitial on Prompt Click */}
                        <div className="flex items-start justify-between gap-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <PlaySquare size={16} className="text-amber-400" />
                                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Interstitial Ad on Prompt Click
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        Fullscreen
                                    </span>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                    When a user clicks on any prompt card or banner prompt, an interstitial ad pops up first. Once closed or dismissed, the prompt details page opens.
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={Boolean(data.interstitial_prompt_click)}
                                    onChange={(e) => setData('interstitial_prompt_click', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            </label>
                        </div>

                        {/* 2. Rewarded Ad for Prompt Unlock */}
                        <div className="flex items-start justify-between gap-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Coins size={16} className="text-indigo-400" />
                                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Rewarded Ad for Prompt Unlock
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        Rewarded
                                    </span>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                    Allow users to unlock locked prompts by watching a rewarded video ad instead of paying coins.
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={Boolean(data.rewarded_prompt_unlock)}
                                    onChange={(e) => setData('rewarded_prompt_unlock', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {/* 3. Rewarded Ad for Daily Free Coins */}
                        <div className="flex items-start justify-between gap-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-emerald-400" />
                                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Rewarded Ad for Daily Bonus Coins
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Rewarded
                                    </span>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                    Allow users to watch rewarded ads on the Rewards screen to earn daily coins.
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={Boolean(data.rewarded_daily_coins)}
                                    onChange={(e) => setData('rewarded_daily_coins', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* 4. Banner Ads */}
                        <div className="flex items-start justify-between gap-4 py-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Layers size={16} className="text-sky-400" />
                                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Banner Ads
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                        Banner
                                    </span>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                    Show AdMob banner ads at the bottom or designated slots of app screens.
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={Boolean(data.banner_ads_enabled)}
                                    onChange={(e) => setData('banner_ads_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Ad Unit IDs Configuration */}
                    <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
                            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                AdMob Ad Unit IDs
                            </h2>
                            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                Set your live AdMob Ad Unit IDs for production, or use Google test IDs for testing.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Android Interstitial Ad Unit ID
                            </label>
                            <input
                                type="text"
                                value={data.interstitial_ad_unit_id}
                                onChange={(e) => setData('interstitial_ad_unit_id', e.target.value)}
                                placeholder="ca-app-pub-3940256099942544/1033173712"
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                style={inputStyle}
                            />
                            {errors.interstitial_ad_unit_id && (
                                <p className="text-red-400 text-xs mt-1">{errors.interstitial_ad_unit_id}</p>
                            )}
                            <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
                                Default Google Test ID: <code className="text-indigo-400 font-mono">ca-app-pub-3940256099942544/1033173712</code>.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Android Banner Ad Unit ID
                            </label>
                            <input
                                type="text"
                                value={data.banner_ad_unit_id}
                                onChange={(e) => setData('banner_ad_unit_id', e.target.value)}
                                placeholder="ca-app-pub-9010050634863664/4429647201"
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                style={inputStyle}
                            />
                            {errors.banner_ad_unit_id && (
                                <p className="text-red-400 text-xs mt-1">{errors.banner_ad_unit_id}</p>
                            )}
                            <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
                                Live Banner ID: <code className="text-indigo-400 font-mono">ca-app-pub-9010050634863664/4429647201</code>.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Android Rewarded Ad Unit ID (Prompt Unlock & Daily Coins)
                            </label>
                            <input
                                type="text"
                                value={data.rewarded_ad_unit_id}
                                onChange={(e) => setData('rewarded_ad_unit_id', e.target.value)}
                                placeholder="ca-app-pub-9010050634863664/7562991281"
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                style={inputStyle}
                            />
                            {errors.rewarded_ad_unit_id && (
                                <p className="text-red-400 text-xs mt-1">{errors.rewarded_ad_unit_id}</p>
                            )}
                            <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
                                Live Rewarded ID: <code className="text-indigo-400 font-mono">ca-app-pub-9010050634863664/7562991281</code>.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Save Bar */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                            <Info size={14} className="text-indigo-400" />
                            <span>Changes are fetched dynamically by the mobile application on launch and refresh.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {processing ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                            <span>{processing ? 'Saving...' : 'Save Settings'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
