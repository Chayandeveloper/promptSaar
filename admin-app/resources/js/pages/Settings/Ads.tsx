import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Tv, Save, CheckCircle, Sparkles,
    PlaySquare, Layers, Coins, RefreshCw, Info,
    ArrowLeft, Smartphone, LayoutGrid, FileCode, ExternalLink, ShieldCheck, Timer,
    Sliders, KeyRound, Check, Copy
} from 'lucide-react';

interface Settings {
    ads_enabled: boolean;
    interstitial_prompt_click: boolean;
    interstitial_cooldown_seconds?: number;
    interstitial_prompt_back: boolean;
    interstitial_template_click: boolean;
    interstitial_template_back: boolean;
    rewarded_prompt_unlock: boolean;
    rewarded_daily_coins: boolean;
    banner_ads_enabled: boolean;
    banner_template_detail: boolean;
    feed_ad_enabled: boolean;
    app_open_ad_enabled: boolean;
    interstitial_ad_unit_id: string;
    interstitial_prompt_back_id: string;
    interstitial_template_click_id?: string;
    interstitial_template_back_id?: string;
    banner_ad_unit_id: string;
    banner_template_detail_id?: string;
    feed_ad_unit_id: string;
    app_open_ad_unit_id: string;
    rewarded_ad_unit_id?: string;
    rewarded_prompt_unlock_id: string;
    rewarded_daily_coins_id: string;
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
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        ads_enabled: settings.ads_enabled ?? true,
        interstitial_prompt_click: settings.interstitial_prompt_click ?? true,
        interstitial_cooldown_seconds: settings.interstitial_cooldown_seconds ?? 45,
        interstitial_prompt_back: settings.interstitial_prompt_back ?? false,
        interstitial_template_click: settings.interstitial_template_click ?? true,
        interstitial_template_back: settings.interstitial_template_back ?? true,
        rewarded_prompt_unlock: settings.rewarded_prompt_unlock ?? true,
        rewarded_daily_coins: settings.rewarded_daily_coins ?? true,
        banner_ads_enabled: settings.banner_ads_enabled ?? true,
        banner_template_detail: settings.banner_template_detail ?? true,
        feed_ad_enabled: settings.feed_ad_enabled ?? true,
        app_open_ad_enabled: settings.app_open_ad_enabled ?? true,
        interstitial_ad_unit_id: settings.interstitial_ad_unit_id || 'ca-app-pub-9010050634863664/9136172220',
        interstitial_prompt_back_id: settings.interstitial_prompt_back_id || 'ca-app-pub-9010050634863664/9136172220',
        interstitial_template_click_id: settings.interstitial_template_click_id || settings.interstitial_ad_unit_id || 'ca-app-pub-9010050634863664/9136172220',
        interstitial_template_back_id: settings.interstitial_template_back_id || settings.interstitial_prompt_back_id || 'ca-app-pub-9010050634863664/9136172220',
        banner_ad_unit_id: settings.banner_ad_unit_id || 'ca-app-pub-9010050634863664/4429647201',
        banner_template_detail_id: settings.banner_template_detail_id || settings.banner_ad_unit_id || 'ca-app-pub-9010050634863664/4429647201',
        feed_ad_unit_id: settings.feed_ad_unit_id || 'ca-app-pub-9010050634863664/4429647201',
        app_open_ad_unit_id: settings.app_open_ad_unit_id || 'ca-app-pub-9010050634863664/9136172220',
        rewarded_prompt_unlock_id: settings.rewarded_prompt_unlock_id || settings.rewarded_ad_unit_id || 'ca-app-pub-9010050634863664/7562991281',
        rewarded_daily_coins_id: settings.rewarded_daily_coins_id || settings.rewarded_ad_unit_id || 'ca-app-pub-9010050634863664/7562991281',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings/ads', { preserveScroll: true });
    };

    const copyToClipboard = (key: string, text: string) => {
        if (!text) return;
        navigator.clipboard?.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <AdminLayout admin={admin} title="AdMob & Advertisement Controls">
            <Head title="AdMob & Advertisement Controls" />

            <div className="w-full space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                                AdMob Advertisement Controls
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                <Sparkles size={12} />
                                Live Remote Config
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                            Manage AdMob triggers, cooldown timings, and live production ad unit IDs across Android &amp; iOS in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href="/admin/settings/app-ads"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:bg-slate-800"
                            style={{
                                background: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text)',
                            }}
                        >
                            <FileCode size={14} className="text-indigo-400" />
                            <span>app-ads.txt</span>
                        </Link>

                        <button
                            type="button"
                            onClick={submit}
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {processing ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                            <span>{processing ? 'Saving Changes...' : 'Save Ad Settings'}</span>
                        </button>
                    </div>
                </div>

                {/* Success Notification */}
                {recentlySuccessful && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                        <CheckCircle size={18} className="flex-shrink-0" />
                        <span className="font-medium">Ad settings and switches saved successfully! Mobile clients will apply them immediately.</span>
                    </div>
                )}

                {/* Top 2-Column Banner: Master Switch + Authorized Sellers (app-ads.txt) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Card 1: Master Kill-Switch */}
                    <div
                        className="p-5 rounded-2xl border transition-all flex flex-col justify-between"
                        style={{
                            background: data.ads_enabled
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.09), rgba(139, 92, 246, 0.05))'
                                : 'var(--color-surface)',
                            borderColor: data.ads_enabled ? 'rgba(99, 102, 241, 0.35)' : 'var(--color-border)',
                        }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-xl ${data.ads_enabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-700/30 text-zinc-400'}`}>
                                        <Tv size={18} />
                                    </div>
                                    <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Global Ads Master Switch
                                    </h2>
                                </div>
                                <p className="text-xs pt-1 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                    When turned OFF, all ads (interstitials, banners, and rewarded videos) are instantly disabled app-wide.
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={data.ads_enabled}
                                    onChange={(e) => setData('ads_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--color-border)' }}>
                            <span style={{ color: 'var(--color-muted)' }}>Status:</span>
                            {data.ads_enabled ? (
                                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Active &amp; Monetizing
                                </span>
                            ) : (
                                <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                                    Paused App-Wide
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Card 2: Authorized Digital Sellers (app-ads.txt) */}
                    <div
                        className="p-5 rounded-2xl border flex flex-col justify-between"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(99, 102, 241, 0.04))',
                            borderColor: 'rgba(16, 185, 129, 0.25)',
                        }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                            Authorized Digital Sellers
                                        </h3>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                        Active
                                    </span>
                                </div>
                                <p className="text-xs pt-1 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                    Manage Google AdMob publisher accounts and authorized digital seller verification entries.
                                </p>
                            </div>

                            <Link
                                href="/admin/settings/app-ads"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer shrink-0 mt-0.5"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                <span>Manage</span>
                                <ExternalLink size={12} />
                            </Link>
                        </div>

                        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--color-border)' }}>
                            <span style={{ color: 'var(--color-muted)' }}>Public URL:</span>
                            <a
                                href="/app-ads.txt"
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                /app-ads.txt
                                <ExternalLink size={11} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* MAIN 2-COLUMN STRUCTURE */}
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* ========================================================
                            COLUMN 1 (LEFT): AD PLACEMENTS & ACTIVATION SWITCHES
                        ======================================================== */}
                        <div className="rounded-2xl border p-5 sm:p-6 space-y-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                            <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                                <div>
                                    <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                        <Sliders size={18} className="text-indigo-400" />
                                        <span>Ad Placements &amp; Switches</span>
                                    </h2>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                        Toggle ad formats and user journey display points
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    Column 1
                                </span>
                            </div>

                            {!data.ads_enabled && (
                                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
                                    <Info size={16} className="flex-shrink-0" />
                                    <span>Master Switch is currently <strong>OFF</strong>. Placements will remain inactive in the app until turned on.</span>
                                </div>
                            )}

                            {/* Group A: Interstitial Ads (Full-screen) */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-3.5 rounded-full bg-amber-500" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                        Fullscreen Interstitial Ads
                                    </h3>
                                </div>

                                {/* 1. Prompt Click */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <PlaySquare size={15} className="text-amber-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                Prompt Click Interstitial
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                Card Click
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Plays when a user taps a prompt card or hero banner before entering the detail screen.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.interstitial_prompt_click)}
                                            onChange={(e) => setData('interstitial_prompt_click', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>

                                {/* Cooldown Setting Box */}
                                <div className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-800/30" style={{ borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Timer size={14} className="text-amber-400" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                Prompt Click Cooldown
                                            </span>
                                        </div>
                                        <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                            Minimum wait time between consecutive prompt ads (recommended: 45s).
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <input
                                            type="number"
                                            min="0"
                                            max="300"
                                            value={data.interstitial_cooldown_seconds}
                                            onChange={(e) => setData('interstitial_cooldown_seconds', Number(e.target.value))}
                                            className="w-20 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            style={inputStyle}
                                        />
                                        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>sec</span>
                                    </div>
                                </div>

                                {/* 2. Prompt Back */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <ArrowLeft size={15} className="text-orange-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                Prompt Back / Exit
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                On Exit
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Displays when a user presses back or exits from the prompt details view.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.interstitial_prompt_back)}
                                            onChange={(e) => setData('interstitial_prompt_back', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>

                                {/* 3. Template Click */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <PlaySquare size={15} className="text-rose-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                Video Template Click
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                Template
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Displays when a user taps any video preset card in the Templates feed.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.interstitial_template_click)}
                                            onChange={(e) => setData('interstitial_template_click', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                    </label>
                                </div>

                                {/* 4. Template Back */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <ArrowLeft size={15} className="text-pink-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                Video Template Back / Exit
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                                On Exit
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Displays when returning back from the full-screen template video player screen.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.interstitial_template_back)}
                                            onChange={(e) => setData('interstitial_template_back', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                                    </label>
                                </div>

                                {/* 5. Launch Interstitial */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={15} className="text-purple-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                App Launch Interstitial
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                Cold Start
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Displays when a user opens/launches the mobile application.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.app_open_ad_enabled)}
                                            onChange={(e) => setData('app_open_ad_enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Group B: Rewarded Video Ads */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-3.5 rounded-full bg-indigo-500" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                                        Rewarded Video Ads (Earn &amp; Unlock)
                                    </h3>
                                </div>

                                {/* Rewarded Prompt Unlock */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Coins size={15} className="text-indigo-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                Rewarded Ad for Prompt Unlock
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                Free Unlock
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Enables users to unlock hidden prompt text by watching a rewarded video instead of paying coins.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.rewarded_prompt_unlock)}
                                            onChange={(e) => setData('rewarded_prompt_unlock', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                {/* Rewarded Daily Bonus */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={15} className="text-emerald-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                Rewarded Ad for Daily Bonus Coins
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Rewards Tab
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Enables users to watch ads in the Rewards screen to earn extra coins towards their balance.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.rewarded_daily_coins)}
                                            onChange={(e) => setData('rewarded_daily_coins', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Group C: Banner Ads */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-3.5 rounded-full bg-sky-500" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                                        Banner &amp; In-Feed Display Ads
                                    </h3>
                                </div>

                                {/* Bottom Banner */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Layers size={15} className="text-sky-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                Bottom Banner Ads
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                                Anchored
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Shows banner ads anchored at the bottom of app screens (prompt details, templates list).
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.banner_ads_enabled)}
                                            onChange={(e) => setData('banner_ads_enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                    </label>
                                </div>

                                {/* Template Detail Banner */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Layers size={15} className="text-violet-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                Template Detail Banner Ad
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                Below CTA
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Displays directly underneath the "USE THIS TEMPLATE" button inside video template screens.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.banner_template_detail)}
                                            onChange={(e) => setData('banner_template_detail', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                    </label>
                                </div>

                                {/* In-Feed Ads */}
                                <div className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <LayoutGrid size={15} className="text-cyan-400 shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                In-Feed Ads (Every 8 Prompts)
                                            </span>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                Feed Grid
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            Displays an inline ad banner after every 8 prompt cards as users scroll through feeds.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data.feed_ad_enabled)}
                                            onChange={(e) => setData('feed_ad_enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ========================================================
                            COLUMN 2 (RIGHT): ADMOB AD UNIT IDS & IDENTIFIERS
                        ======================================================== */}
                        <div className="rounded-2xl border p-5 sm:p-6 space-y-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                            <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                                <div>
                                    <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                        <KeyRound size={18} className="text-indigo-400" />
                                        <span>AdMob Ad Unit IDs</span>
                                    </h2>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                        Production Google AdMob IDs delivered dynamically to mobile
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    Column 2
                                </span>
                            </div>

                            {/* Section 1: Interstitial Unit IDs */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                        <PlaySquare size={13} />
                                        <span>Interstitial Units</span>
                                    </h3>
                                    <span className="text-[10px] text-slate-500 font-mono">Android / iOS</span>
                                </div>

                                {/* ID: Prompt Click */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            Prompt Click Interstitial ID
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('prompt_click', data.interstitial_ad_unit_id)}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'prompt_click' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'prompt_click' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.interstitial_ad_unit_id}
                                        onChange={(e) => setData('interstitial_ad_unit_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/9136172220"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        style={inputStyle}
                                    />
                                    {errors.interstitial_ad_unit_id && (
                                        <p className="text-red-400 text-xs mt-1">{errors.interstitial_ad_unit_id}</p>
                                    )}
                                </div>

                                {/* ID: Prompt Back */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            Prompt Back / Exit Interstitial ID
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('prompt_back', data.interstitial_prompt_back_id)}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'prompt_back' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'prompt_back' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.interstitial_prompt_back_id}
                                        onChange={(e) => setData('interstitial_prompt_back_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/9136172220"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* ID: Template Click */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            Video Template Click ID
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('tmpl_click', data.interstitial_template_click_id || '')}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'tmpl_click' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'tmpl_click' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.interstitial_template_click_id}
                                        onChange={(e) => setData('interstitial_template_click_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/9136172220"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* ID: Template Back */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            Video Template Back / Exit ID
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('tmpl_back', data.interstitial_template_back_id || '')}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'tmpl_back' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'tmpl_back' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.interstitial_template_back_id}
                                        onChange={(e) => setData('interstitial_template_back_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/9136172220"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* ID: Launch Interstitial */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            App Launch Interstitial ID
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('app_open', data.app_open_ad_unit_id)}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'app_open' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'app_open' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.app_open_ad_unit_id}
                                        onChange={(e) => setData('app_open_ad_unit_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/9136172220"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Section 2: Banner Unit IDs */}
                            <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                                        <Layers size={13} />
                                        <span>Banner &amp; In-Feed Units</span>
                                    </h3>
                                    <span className="text-[10px] text-slate-500 font-mono">320x50 / 300x250</span>
                                </div>

                                {/* ID: Bottom Banner */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            Bottom Anchored Banner ID
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('banner', data.banner_ad_unit_id)}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'banner' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'banner' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.banner_ad_unit_id}
                                        onChange={(e) => setData('banner_ad_unit_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/4429647201"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* ID: Template Detail Banner */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            Template Detail Banner ID
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('tmpl_banner', data.banner_template_detail_id || '')}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'tmpl_banner' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'tmpl_banner' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.banner_template_detail_id}
                                        onChange={(e) => setData('banner_template_detail_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/4429647201"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* ID: Feed Ad Unit */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            In-Feed Banner Ad ID (Feed Scroll)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('feed_banner', data.feed_ad_unit_id)}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'feed_banner' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'feed_banner' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.feed_ad_unit_id}
                                        onChange={(e) => setData('feed_ad_unit_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/4429647201"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Section 3: Rewarded Unit IDs */}
                            <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                        <Coins size={13} />
                                        <span>Rewarded Video Units</span>
                                    </h3>
                                    <span className="text-[10px] text-slate-500 font-mono">Rewarded Video</span>
                                </div>

                                {/* ID: Prompt Unlock */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            Rewarded Ad ID (Prompt Unlock)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('reward_unlock', data.rewarded_prompt_unlock_id)}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'reward_unlock' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'reward_unlock' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.rewarded_prompt_unlock_id}
                                        onChange={(e) => setData('rewarded_prompt_unlock_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/7562991281"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* ID: Daily Coins */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                            Rewarded Ad ID (Daily Free Coins)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard('reward_daily', data.rewarded_daily_coins_id)}
                                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {copiedKey === 'reward_daily' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{copiedKey === 'reward_daily' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.rewarded_daily_coins_id}
                                        onChange={(e) => setData('rewarded_daily_coins_id', e.target.value)}
                                        placeholder="ca-app-pub-9010050634863664/7562991281"
                                        className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Save Bar */}
                    <div
                        className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        style={{
                            background: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                        }}
                    >
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                            <Info size={15} className="text-indigo-400 shrink-0" />
                            <span>Changes update the database immediately and sync with active mobile apps upon restart or pull-to-refresh.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {processing ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                            <span>{processing ? 'Saving Changes...' : 'Save Ad Settings'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
