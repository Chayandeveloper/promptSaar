import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Bell, Send, Smartphone, CheckCircle, AlertTriangle,
    Layers, Coins, ExternalLink, Image as ImageIcon, Flame
} from 'lucide-react';

interface Stats {
    active_devices: number;
    fcm_devices: number;
    expo_devices: number;
    has_credentials: boolean;
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
    notifications: Paginated<NotificationItem>;
    prompts: PromptOption[];
    admin: Admin;
}

const inputStyle = {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
};

export default function NotificationsIndex({ stats, notifications, prompts, admin }: Props) {
    const { data, setData, post, processing, reset, errors, recentlySuccessful } = useForm({
        title: '',
        body: '',
        image_url: '',
        action_type: 'home',
        prompt_id: prompts[0]?.id ? String(prompts[0].id) : '',
        custom_url: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/notifications/send', {
            onSuccess: () => reset('title', 'body', 'image_url', 'custom_url'),
        });
    };

    return (
        <AdminLayout admin={admin} title="Push Notifications">
            <Head title="Push Notifications" />

            {/* Success alert */}
            {recentlySuccessful && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle size={18} />
                    <span className="text-sm font-semibold">Push notification dispatched successfully!</span>
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
                    <div className="flex items-center gap-2 mb-2 text-amber-400">
                        <Flame size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">FCM Native Tokens</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {stats.fcm_devices}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Firebase Cloud Messaging</p>
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
                    <div className="flex items-center gap-2.5 mb-5 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <Send size={18} className="text-indigo-400" />
                        <div>
                            <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>Broadcast Push Notification</h3>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                Deliver real-time notifications to all registered mobile devices.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Notification Title *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 🪙 Daily Reward Waiting! or New Trending Prompt"
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
                                placeholder="e.g. Claim +10 free coins now or check out the new 8K Cinematic Product prompt!"
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
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                <Send size={15} />
                                {processing ? 'Broadcasting...' : `Send Push to ${stats.active_devices} Devices`}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Live Mobile Push Preview */}
                <div className="rounded-2xl p-6 flex flex-col" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <Smartphone size={16} className="text-indigo-400" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                            Device Lockscreen Preview
                        </h4>
                    </div>

                    <div className="my-auto p-4 rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center">
                                    <Bell size={11} className="text-white" />
                                </div>
                                <span className="text-xs font-semibold text-slate-300">PromptCraft</span>
                            </div>
                            <span className="text-[10px] text-slate-400">now</span>
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

            {/* Notification History Table */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--color-text)' }}>
                    Notification Broadcast History
                </h3>

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
                                            {new Date(item.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
