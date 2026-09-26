import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Coins, Save, PlaySquare, CheckCircle, ShieldAlert, Zap, TrendingUp, Sparkles } from 'lucide-react';

interface Settings {
    enabled: boolean;
    coins_per_ad: number;
    daily_ad_limit: number;
    default_prompt_cost: number;
}

interface Metrics {
    total_coins_distributed: number;
    total_coins_spent: number;
    coins_today_distributed: number;
    coins_today_spent: number;
    total_reward_ads: number;
    ad_unlocks: number;
    coin_unlocks: number;
    total_prompts_count?: number;
}

interface Admin {
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    settings: Settings;
    metrics: Metrics;
    admin: Admin;
}

const inputStyle = {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
};

export default function RewardSettingsPage({ settings, metrics, admin }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        rewards_enabled: settings.enabled,
        coins_per_ad: settings.coins_per_ad,
        daily_ad_limit: settings.daily_ad_limit,
        default_prompt_cost: settings.default_prompt_cost,
        apply_to_existing: true,
    });

    const maxDailyCoins = data.coins_per_ad * data.daily_ad_limit;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings/rewards');
    };

    return (
        <AdminLayout admin={admin} title="Reward & Coin System Settings">
            <Head title="Reward Settings" />

            {/* Success alert */}
            {recentlySuccessful && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
                    <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Reward settings saved! Mobile devices will instantly reflect these configurations.</span>
                </div>
            )}

            {/* Performance metrics overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Coins Distributed</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            🪙
                        </div>
                    </div>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {metrics.total_coins_distributed.toLocaleString()}
                    </p>
                    <p className="text-xs mt-1 text-emerald-400">
                        +{metrics.coins_today_distributed.toLocaleString()} today
                    </p>
                </div>

                <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Coins Spent</span>
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            ⚡
                        </div>
                    </div>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {metrics.total_coins_spent.toLocaleString()}
                    </p>
                    <p className="text-xs mt-1 text-indigo-400">
                        {metrics.coins_today_spent.toLocaleString()} spent today
                    </p>
                </div>

                <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Ads Completed</span>
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <PlaySquare size={14} />
                        </div>
                    </div>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {metrics.total_reward_ads.toLocaleString()}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                        All-time video rewards
                    </p>
                </div>

                <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Unlock Split</span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <TrendingUp size={14} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-amber-400">{metrics.coin_unlocks}</span>
                        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Coins</span>
                        <span className="text-xs mx-0.5" style={{ color: 'var(--color-muted)' }}>/</span>
                        <span className="text-lg font-bold text-cyan-400">{metrics.ad_unlocks}</span>
                        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Ads</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                        Method comparison
                    </p>
                </div>
            </div>

            <form onSubmit={submit}>
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Settings Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Daily Rewards Section */}
                        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <div>
                                    <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>Daily Rewarded Ad Program</h3>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                        Allow users to watch rewarded advertisements to earn coins on a daily quota.
                                    </p>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={data.rewards_enabled}
                                            onChange={e => setData('rewards_enabled', e.target.checked)}
                                        />
                                        <div
                                            className={`w-12 h-6 rounded-full transition-colors ${data.rewards_enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                        >
                                            <div
                                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.rewards_enabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-indigo-400">
                                        {data.rewards_enabled ? 'ENABLED' : 'DISABLED'}
                                    </span>
                                </label>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                        Coins per Rewarded Advertisement *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="1000"
                                            value={data.coins_per_ad}
                                            onChange={e => setData('coins_per_ad', parseInt(e.target.value, 10) || 0)}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold outline-none"
                                            style={inputStyle}
                                        />
                                        <span className="absolute left-3 top-2.5 text-sm">🪙</span>
                                    </div>
                                    <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                                        Coins granted immediately upon ad completion callback.
                                    </p>
                                    {errors.coins_per_ad && <p className="mt-1 text-xs text-red-400">{errors.coins_per_ad}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                        Maximum Rewarded Ads per User per Day *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={data.daily_ad_limit}
                                            onChange={e => setData('daily_ad_limit', parseInt(e.target.value, 10) || 0)}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold outline-none"
                                            style={inputStyle}
                                        />
                                        <span className="absolute left-3 top-2.5 text-sm">📺</span>
                                    </div>
                                    <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                                        Server enforces strict date reset at 00:00:00 server time.
                                    </p>
                                    {errors.daily_ad_limit && <p className="mt-1 text-xs text-red-400">{errors.daily_ad_limit}</p>}
                                </div>
                            </div>

                            {/* Live calculation banner */}
                            <div className="mt-6 p-4 rounded-xl flex items-center justify-between" style={{ background: 'var(--color-surface-2)', border: '1px dashed var(--color-border)' }}>
                                <div className="flex items-center gap-3">
                                    <Zap size={18} className="text-amber-400" />
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                                            Daily Earning Capacity Calculation
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                            {data.coins_per_ad} coins × {data.daily_ad_limit} ads per day
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold text-amber-400">
                                        🪙 {maxDailyCoins}
                                    </span>
                                    <span className="text-xs block" style={{ color: 'var(--color-muted)' }}>max daily / user</span>
                                </div>
                            </div>
                        </div>

                        {/* Prompt Unlock Pricing */}
                        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text)' }}>Prompt Unlock Pricing</h3>
                            <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>
                                Configure default coin cost for prompts. Individual prompts can still be customized.
                            </p>

                            <div className="max-w-md">
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Default Prompt Unlock Cost *
                                </label>
                                <div className="relative max-w-xs">
                                    <input
                                        type="number"
                                        min="0"
                                        max="5000"
                                        value={data.default_prompt_cost}
                                        onChange={e => setData('default_prompt_cost', parseInt(e.target.value, 10) || 0)}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold outline-none"
                                        style={inputStyle}
                                    />
                                    <span className="absolute left-3 top-2.5 text-sm">🪙</span>
                                </div>
                                <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(data.apply_to_existing)}
                                        onChange={e => setData('apply_to_existing', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                                    />
                                    <span className="text-xs font-medium text-amber-300">
                                        Update all existing prompts ({metrics.total_prompts_count ?? 11} prompts) to {data.default_prompt_cost} coins
                                    </span>
                                </label>
                                <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                                    Pre-fills new prompts. When the box above is checked, saving will also update all existing prompts in the database.
                                </p>
                                {errors.default_prompt_cost && <p className="mt-1 text-xs text-red-400">{errors.default_prompt_cost}</p>}
                            </div>
                        </div>

                        {/* Save Action */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                <Save size={16} />
                                {processing ? 'Saving...' : 'Save Reward Configuration'}
                            </button>
                        </div>
                    </div>

                    {/* Architectural & Security Rules Panel */}
                    <div className="space-y-4">
                        <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold text-sm">
                                <ShieldAlert size={16} />
                                <span>Anti-Abuse Safeguards</span>
                            </div>
                            <ul className="space-y-2.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-400">✓</span>
                                    <span><strong>Server-Controlled Time:</strong> Client device clock changes cannot reset today's reward limit.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-400">✓</span>
                                    <span><strong>Replay & Duplicate Protection:</strong> Reward claim tokens prevent replaying HTTP requests.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-400">✓</span>
                                    <span><strong>Atomic Transactions:</strong> Database row locks prevent double-spend race conditions.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-400">✓</span>
                                    <span><strong>Immutable Ledger:</strong> Every coin spent or earned is logged in the transaction table.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-2 mb-3 text-indigo-400 font-semibold text-sm">
                                <Sparkles size={16} />
                                <span>Dual Unlock Engine</span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                PromptCraft offers two frictionless unlock paths for all users:
                            </p>
                            <div className="mt-3 space-y-2">
                                <div className="p-2.5 rounded-lg text-xs" style={{ background: 'var(--color-surface-2)' }}>
                                    <span className="font-bold text-amber-400">Option 1 — Coins:</span> Instant access without watching an ad.
                                </div>
                                <div className="p-2.5 rounded-lg text-xs" style={{ background: 'var(--color-surface-2)' }}>
                                    <span className="font-bold text-cyan-400">Option 2 — AdMob Ad:</span> Free access after completing rewarded video.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
