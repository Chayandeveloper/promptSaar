import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Bell, Send, Smartphone, CheckCircle, AlertTriangle,
    Layers, Coins, ExternalLink, Image as ImageIcon, Flame,
    Clock, Calendar, Trash2, Zap, Play, Check
} from 'lucide-react';

interface Stats {
    active_devices: number;
    fcm_devices: number;
    expo_devices: number;
    has_credentials: boolean;
    scheduled_count?: number;
}

interface PromptOption {
    id: number;
    title: string;
}

interface NotificationItem {
    id: number;
    title: string;
    body: string;
    image_url?: string;
    action_type: string;
    target_id?: string;
    sent_count: number;
    success_count: number;
    failure_count: number;
    status: string;
    scheduled_at?: string;
    sent_at?: string;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Admin {
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    stats: Stats;
    scheduled_notifications: NotificationItem[];
    notifications: Paginated<NotificationItem>;
    prompts: PromptOption[];
    admin: Admin;
    server_time?: string;
}

const inputStyle = {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
};

export default function NotificationsIndex({
    stats,
    scheduled_notifications = [],
    notifications,
    prompts,
    admin,
    server_time,
}: Props) {
    const [activeTab, setActiveTab] = useState<'scheduled' | 'history'>('scheduled');

    // Helper to get formatted local string for datetime-local
    const formatLocalDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${mins}`;
    };

    const getInitialScheduledTime = () => {
        const date = new Date(Date.now() + 60 * 60 * 1000); // 1 hour ahead by default
        return formatLocalDateTime(date);
    };

    const { data, setData, post, processing, reset, errors, recentlySuccessful } = useForm({
        title: '',
        body: '',
        image_url: '',
        action_type: 'home',
        prompt_id: prompts[0]?.id ? String(prompts[0].id) : '',
        custom_url: '',
        send_type: 'now' as 'now' | 'scheduled',
        scheduled_at: getInitialScheduledTime(),
    });

    const setQuickTime = (minutesAhead: number) => {
        const target = new Date(Date.now() + minutesAhead * 60 * 1000);
        setData('scheduled_at', formatLocalDateTime(target));
    };

    const setTomorrowTime = (hour: number) => {
        const target = new Date();
        target.setDate(target.getDate() + 1);
        target.setHours(hour, 0, 0, 0);
        setData('scheduled_at', formatLocalDateTime(target));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert browser local datetime-local value to exact UTC ISO string
        let finalScheduledAt = data.scheduled_at;
        if (data.send_type === 'scheduled' && data.scheduled_at) {
            const localDate = new Date(data.scheduled_at);
            if (!isNaN(localDate.getTime())) {
                finalScheduledAt = localDate.toISOString();
            }
        }

        router.post('/admin/notifications/send', {
            ...data,
            scheduled_at: finalScheduledAt,
            timezone_offset: new Date().getTimezoneOffset(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                reset('title', 'body', 'image_url', 'custom_url');
                if (data.send_type === 'scheduled') {
                    setActiveTab('scheduled');
                }
            },
        });
    };

    const handleSendNow = (item: NotificationItem) => {
        if (confirm(`Send "${item.title}" immediately to all ${stats.active_devices} devices?`)) {
            router.post(`/admin/notifications/${item.id}/send-now`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleDelete = (item: NotificationItem) => {
        if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
            router.delete(`/admin/notifications/${item.id}`, {
                preserveScroll: true,
            });
        }
    };

    const formatScheduledDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeRemaining = (dateStr?: string) => {
        if (!dateStr) return '';
        const target = new Date(dateStr).getTime();
        const now = Date.now();
        const diffMs = target - now;

        if (diffMs <= 0) return 'Due now (sending)';

        const diffMins = Math.round(diffMs / (60 * 1000));
        if (diffMins < 60) return `in ${diffMins} min${diffMins === 1 ? '' : 's'}`;

        const diffHours = Math.floor(diffMins / 60);
        const remMins = diffMins % 60;
        if (diffHours < 24) {
            return `in ${diffHours}h ${remMins > 0 ? remMins + 'm' : ''}`;
        }

        const diffDays = Math.floor(diffHours / 24);
        return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
    };

    return (
        <AdminLayout admin={admin} title="Push Notifications">
            <Head title="Push Notifications & Scheduler" />

            {/* Success alert */}
            {recentlySuccessful && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle size={18} />
                    <span className="text-sm font-semibold">Action completed successfully!</span>
                </div>
            )}

            {/* Credentials Notice if missing */}
            {!stats.has_credentials && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                        <p className="font-bold text-amber-200">Firebase Service Account Private Key Pending</p>
                        <p className="text-amber-300/80">
                            FCM native broadcasts require your Firebase Admin service account key file at{' '}
                            <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">storage/app/firebase-credentials.json</code>.
                            Expo devices will still receive notifications via Expo Push automatically!
                        </p>
                    </div>
                </div>
            )}

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                        <Smartphone size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Active Devices</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {stats.active_devices}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Registered push tokens</p>
                </div>

                <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2 mb-2 text-purple-400">
                        <Clock size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Queue</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">
                        {scheduled_notifications.length}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Pending timed notifications</p>
                </div>

                <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2 mb-2 text-cyan-400">
                        <Bell size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Expo Tokens</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {stats.expo_devices}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Expo Push Gateway</p>
                </div>

                <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                        <CheckCircle size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Firebase Config</span>
                    </div>
                    <span className={`text-sm font-bold ${stats.has_credentials ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {stats.has_credentials ? 'Connected (JSON Ready)' : 'Pending JSON Key'}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>HTTP v1 Service Account</p>
                </div>
            </div>

            {/* Compose & Live Preview */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Form */}
                <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2.5">
                            <Send size={18} className="text-indigo-400" />
                            <div>
                                <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>Create Push Notification</h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                    Send immediately or schedule for a specific date and time timer.
                                </p>
                            </div>
                        </div>

                        {/* Timing Selector Switch */}
                        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5">
                            <button
                                type="button"
                                onClick={() => setData('send_type', 'now')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    data.send_type === 'now'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Zap size={13} />
                                Send Now
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('send_type', 'scheduled')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    data.send_type === 'scheduled'
                                        ? 'bg-purple-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Clock size={13} />
                                Schedule Timer
                            </button>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Timer / Schedule Settings Card */}
                        {data.send_type === 'scheduled' && (
                            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                                        <Calendar size={15} />
                                        <span>Target Date & Time</span>
                                    </div>
                                    <span className="text-[11px] text-purple-400 font-medium">
                                        {data.scheduled_at ? formatScheduledDate(data.scheduled_at) : 'Select a time'}
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3 items-center">
                                    <div>
                                        <input
                                            type="datetime-local"
                                            value={data.scheduled_at}
                                            onChange={e => setData('scheduled_at', e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl text-sm font-medium outline-none text-white bg-slate-900 border border-purple-500/40 focus:border-purple-400"
                                            required={data.send_type === 'scheduled'}
                                        />
                                        {errors.scheduled_at && (
                                            <p className="mt-1 text-xs text-red-400">{errors.scheduled_at}</p>
                                        )}
                                    </div>

                                    {/* Quick presets */}
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setQuickTime(15)}
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                                        >
                                            +15m
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuickTime(60)}
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                                        >
                                            +1 Hour
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuickTime(180)}
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                                        >
                                            +3 Hours
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTomorrowTime(9)}
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                                        >
                                            Tomorrow 9 AM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTomorrowTime(18)}
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                                        >
                                            Tomorrow 6 PM
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Notification Title *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 🪙 Daily Reward Waiting! or New Trending AI Prompt"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none"
                                style={inputStyle}
                                required
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Notification Body / Message *
                            </label>
                            <textarea
                                rows={3}
                                placeholder="e.g. Claim +10 free coins now or check out the new Midjourney photorealistic prompt!"
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                                style={inputStyle}
                                required
                            />
                            {errors.body && <p className="mt-1 text-xs text-red-400">{errors.body}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    When User Taps Notification
                                </label>
                                <select
                                    value={data.action_type}
                                    onChange={e => setData('action_type', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer"
                                    style={inputStyle}
                                >
                                    <option value="home">Open App Home</option>
                                    <option value="rewards">Open Rewards & Free Coins Screen</option>
                                    <option value="prompt">Open Specific Prompt</option>
                                    <option value="custom">Custom Link / Web URL</option>
                                </select>
                            </div>

                            {data.action_type === 'prompt' && (
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                        Target Prompt
                                    </label>
                                    <select
                                        value={data.prompt_id}
                                        onChange={e => setData('prompt_id', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer"
                                        style={inputStyle}
                                    >
                                        {prompts.map(p => (
                                            <option key={p.id} value={p.id}>
                                                #{p.id} — {p.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {data.action_type === 'custom' && (
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                        Custom URL
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={data.custom_url}
                                        onChange={e => setData('custom_url', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                                        style={inputStyle}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Big Banner Image URL (Optional)
                            </label>
                            <input
                                type="url"
                                placeholder="https://images.unsplash.com/..."
                                value={data.image_url}
                                onChange={e => setData('image_url', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                                style={inputStyle}
                            />
                            {errors.image_url && <p className="mt-1 text-xs text-red-400">{errors.image_url}</p>}
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing || !data.title || !data.body}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                                style={{
                                    background: data.send_type === 'scheduled'
                                        ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    boxShadow: data.send_type === 'scheduled'
                                        ? '0 10px 25px -5px rgba(168, 85, 247, 0.4)'
                                        : '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                                }}
                            >
                                {data.send_type === 'scheduled' ? (
                                    <>
                                        <Clock size={15} />
                                        {processing ? 'Scheduling...' : 'Set Notification Timer'}
                                    </>
                                ) : (
                                    <>
                                        <Send size={15} />
                                        {processing ? 'Broadcasting...' : `Send Now to ${stats.active_devices} Devices`}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Live Mobile Push Preview */}
                <div className="rounded-2xl p-6 flex flex-col" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                            <Smartphone size={16} className="text-indigo-400" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                                Lockscreen Preview
                            </h4>
                        </div>
                        {data.send_type === 'scheduled' && (
                            <span className="text-[10px] font-semibold text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                                ⏰ Scheduled
                            </span>
                        )}
                    </div>

                    <div className="my-auto p-4 rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center">
                                    <Bell size={11} className="text-white" />
                                </div>
                                <span className="text-xs font-semibold text-slate-300">PromptCraft</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                                {data.send_type === 'scheduled' ? 'timer' : 'now'}
                            </span>
                        </div>

                        <p className="text-xs font-bold text-white mb-0.5">
                            {data.title || 'Your Notification Title'}
                        </p>
                        <p className="text-xs text-slate-300 line-clamp-2">
                            {data.body || 'Preview of the notification body message will appear right here in real-time as you type.'}
                        </p>

                        {data.image_url && (
                            <img
                                src={data.image_url}
                                alt="Notification attachment"
                                className="mt-2.5 rounded-lg w-full h-28 object-cover border border-slate-700/40"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                        )}

                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-indigo-400 font-medium">
                            <span>
                                {data.action_type === 'home' && 'Opens Home Screen'}
                                {data.action_type === 'rewards' && 'Opens 🪙 Earn Free Coins'}
                                {data.action_type === 'prompt' && `Opens Prompt #${data.prompt_id}`}
                                {data.action_type === 'custom' && 'Opens Link'}
                            </span>
                            <span className="text-slate-500">Swipe to dismiss</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Management: Tabs for Scheduled Queue vs History */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('scheduled')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'scheduled'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white bg-slate-800/40'
                            }`}
                        >
                            <Clock size={14} />
                            <span>Scheduled Queue</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                activeTab === 'scheduled' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                                {scheduled_notifications.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'history'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white bg-slate-800/40'
                            }`}
                        >
                            <Bell size={14} />
                            <span>Broadcast History</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                                {notifications.total}
                            </span>
                        </button>
                    </div>

                    <span className="text-[11px] text-slate-400">
                        Auto-processes on time trigger
                    </span>
                </div>

                {/* TAB 1: Scheduled Queue */}
                {activeTab === 'scheduled' && (
                    <div>
                        {scheduled_notifications.length === 0 ? (
                            <div className="py-12 text-center" style={{ color: 'var(--color-muted)' }}>
                                <Clock size={36} className="mx-auto mb-2 opacity-30 text-purple-400" />
                                <p className="text-sm font-medium">No scheduled notifications pending.</p>
                                <p className="text-xs mt-1 text-slate-500">
                                    Select "Schedule Timer" above to set multiple notifications for any future date & time.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {scheduled_notifications.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-3.5 flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                                                <Clock size={20} />
                                            </div>

                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                        ⏰ {formatScheduledDate(item.scheduled_at)}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        {getTimeRemaining(item.scheduled_at)}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 uppercase">
                                                        {item.action_type}
                                                        {item.target_id ? ` #${item.target_id}` : ''}
                                                    </span>
                                                </div>

                                                <p className="font-bold text-sm text-white">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-slate-300 line-clamp-1">
                                                    {item.body}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            <button
                                                type="button"
                                                onClick={() => handleSendNow(item)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                                                title="Trigger delivery right now without waiting"
                                            >
                                                <Play size={12} />
                                                Send Now
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                                                title="Cancel and delete this scheduled timer"
                                            >
                                                <Trash2 size={12} />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: Broadcast History */}
                {activeTab === 'history' && (
                    <div>
                        {notifications.data.length === 0 ? (
                            <div className="py-12 text-center" style={{ color: 'var(--color-muted)' }}>
                                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No notifications sent yet. Use the form above to send your first push!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
                                            <th className="pb-3 font-semibold">Title & Body</th>
                                            <th className="pb-3 font-semibold">Target Action</th>
                                            <th className="pb-3 font-semibold">Dispatched</th>
                                            <th className="pb-3 font-semibold">Status</th>
                                            <th className="pb-3 font-semibold text-right">Sent Date</th>
                                            <th className="pb-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                        {notifications.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/[0.02]">
                                                <td className="py-3 pr-4 max-w-xs">
                                                    <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-muted)' }}>
                                                        {item.body}
                                                    </p>
                                                </td>
                                                <td className="py-3">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                                                        {item.action_type}
                                                        {item.target_id ? ` #${item.target_id}` : ''}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <span className="font-semibold text-white">{item.sent_count}</span>
                                                    <span className="text-slate-400 ml-1">devices</span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        item.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {item.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right" style={{ color: 'var(--color-muted)' }}>
                                                    {item.sent_at ? new Date(item.sent_at).toLocaleString() : new Date(item.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="text-slate-500 hover:text-red-400 p-1 rounded-md transition-colors"
                                                        title="Delete record"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
