import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Layers, Tag, Unlock, TrendingUp, Star, FileText, Activity } from 'lucide-react';

interface Stats {
    total_prompts: number; published_prompts: number; draft_prompts: number;
    total_categories: number; total_unlocks: number; today_unlocks: number;
    featured_prompts: number; trending_prompts: number;
    total_coins_distributed?: number;
    total_coins_spent?: number;
    coins_distributed_today?: number;
    coins_spent_today?: number;
    reward_ads_completed?: number;
    coin_unlocks?: number;
    ad_unlocks?: number;
}
interface RecentUnlock { id: number; device_id: string; prompt_title: string; category: string; unlocked_at: string; }
interface TopPrompt { id: number; title: string; unlock_count: number; views: number; is_featured: boolean; is_trending: boolean; }
interface Admin { name: string; email: string; avatar?: string; }
interface Props { stats: Stats; recentUnlocks: RecentUnlock[]; topPrompts: TopPrompt[]; admin: Admin; }

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: number; icon: any; color: string; sub?: string }) {
    return (
        <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
                style={{ background: color + '22' }}>
                <Icon size={22} style={{ color }} />
            </div>
            <div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{label}</p>
                <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>{value.toLocaleString()}</p>
                {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{sub}</p>}
            </div>
        </div>
    );
}

const defaultStats: Stats = {
    total_prompts: 0,
    published_prompts: 0,
    draft_prompts: 0,
    total_categories: 0,
    total_unlocks: 0,
    today_unlocks: 0,
    featured_prompts: 0,
    trending_prompts: 0,
    total_coins_distributed: 0,
    total_coins_spent: 0,
    coins_distributed_today: 0,
    coins_spent_today: 0,
    reward_ads_completed: 0,
    coin_unlocks: 0,
    ad_unlocks: 0,
};

export default function DashboardIndex({
    stats = defaultStats,
    recentUnlocks = [],
    topPrompts = [],
    admin = { name: 'Admin', email: 'admin@promptcraft.ai' },
}: Props) {
    const safeStats = { ...defaultStats, ...(stats || {}) };

    return (
        <AdminLayout admin={admin} title="Dashboard">
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Prompts"    value={safeStats.total_prompts}     icon={Layers}    color="#6366f1" sub={`${safeStats.published_prompts} published`} />
                <StatCard label="Categories"       value={safeStats.total_categories}  icon={Tag}       color="#06b6d4" />
                <StatCard label="Total Unlocks"    value={safeStats.total_unlocks}     icon={Unlock}    color="#8b5cf6" sub={`${safeStats.today_unlocks} today`} />
                <StatCard label="Featured Prompts" value={safeStats.featured_prompts}  icon={Star}      color="#f59e0b" sub={`${safeStats.trending_prompts} trending`} />
            </div>

            {/* Reward & Coin Performance (Section 32) */}
            <div className="rounded-2xl p-5 mb-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-base">🪙</span>
                        <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                            Reward & Coin Economy Performance
                        </h2>
                    </div>
                    <span className="text-xs text-indigo-400 font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Live Analytics
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="p-3.5 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Coins Distributed</p>
                        <p className="text-lg font-bold text-emerald-400 mt-1">
                            {(safeStats.total_coins_distributed ?? 0).toLocaleString()} 🪙
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            +{(safeStats.coins_distributed_today ?? 0).toLocaleString()} today
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Coins Spent</p>
                        <p className="text-lg font-bold text-rose-400 mt-1">
                            {(safeStats.total_coins_spent ?? 0).toLocaleString()} 🪙
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {(safeStats.coins_spent_today ?? 0).toLocaleString()} spent today
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Coin Unlocks</p>
                        <p className="text-lg font-bold text-amber-400 mt-1">
                            {(safeStats.coin_unlocks ?? 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Instant unlock</p>
                    </div>

                    <div className="p-3.5 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Ad Unlocks</p>
                        <p className="text-lg font-bold text-cyan-400 mt-1">
                            {(safeStats.ad_unlocks ?? 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Rewarded ad</p>
                    </div>

                    <div className="p-3.5 rounded-xl col-span-2 sm:col-span-1" style={{ background: 'var(--color-surface-2)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Reward Ads Finished</p>
                        <p className="text-lg font-bold text-indigo-400 mt-1">
                            {(safeStats.reward_ads_completed ?? 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Completed video ads</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Prompts */}
                <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} style={{ color: '#6366f1' }} />
                        <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Top Prompts by Unlocks</h2>
                    </div>
                    <div className="space-y-3">
                        {topPrompts.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: 'var(--color-surface-2)' }}>
                                <span className="text-xs font-bold w-6 text-center"
                                    style={{ color: i === 0 ? '#f59e0b' : 'var(--color-muted)' }}>
                                    #{i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{p.title}</p>
                                    <div className="flex gap-2 mt-0.5">
                                        {p.is_featured && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#f59e0b22', color: '#f59e0b' }}>Featured</span>}
                                        {p.is_trending && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#6366f122', color: '#6366f1' }}>Trending</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold" style={{ color: '#6366f1' }}>{p.unlock_count.toLocaleString()}</p>
                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{p.views.toLocaleString()} views</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Unlocks */}
                <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={18} style={{ color: '#10b981' }} />
                        <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Recent Unlocks</h2>
                    </div>
                    <div className="space-y-2">
                        {recentUnlocks.map((u) => (
                            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: 'var(--color-surface-2)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: '#10b98122' }}>
                                    <Unlock size={14} style={{ color: '#10b981' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{u.prompt_title}</p>
                                    <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{u.category} · {u.device_id}</p>
                                </div>
                                <p className="text-xs flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
                                    {u.unlocked_at ? new Date(u.unlocked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                </p>
                            </div>
                        ))}
                        {recentUnlocks.length === 0 && (
                            <p className="text-center text-sm py-6" style={{ color: 'var(--color-muted)' }}>No unlocks yet</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
