import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Share2, Save, CheckCircle, ExternalLink, MessageCircle, Send,
    Instagram, Smartphone, Sparkles, HelpCircle, RefreshCw
} from 'lucide-react';

interface Settings {
    whatsapp_url: string;
    instagram_url: string;
    telegram_url: string;
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

export default function SocialChannelsPage({ settings, admin }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        whatsapp_url: settings.whatsapp_url || 'https://wa.me/',
        instagram_url: settings.instagram_url || 'https://instagram.com/',
        telegram_url: settings.telegram_url || 'https://t.me/',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings/social', { preserveScroll: true });
    };

    // Helper to format preview target URL
    const getPreviewUrl = (channel: 'whatsapp' | 'instagram' | 'telegram') => {
        if (channel === 'whatsapp') {
            const raw = data.whatsapp_url?.trim() || '';
            if (!raw || raw === 'https://wa.me/') return 'https://whatsapp.com';
            if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
            const cleanNumber = raw.replace(/[^0-9]/g, '');
            return cleanNumber ? `https://wa.me/${cleanNumber}` : 'https://whatsapp.com';
        } else if (channel === 'instagram') {
            const raw = data.instagram_url?.trim() || '';
            if (!raw || raw === 'https://instagram.com/') return 'https://instagram.com';
            if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
            return `https://instagram.com/${raw.replace(/^@/, '')}`;
        } else {
            const raw = data.telegram_url?.trim() || '';
            if (!raw || raw === 'https://t.me/') return 'https://t.me';
            if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
            return `https://t.me/${raw.replace(/^@/, '')}`;
        }
    };

    return (
        <AdminLayout admin={admin} title="Social Channel Redirects">
            <Head title="Social Channel Redirects" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                                Social Channel Links
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                <Sparkles size={12} />
                                Active On Mobile App
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                            Manage the redirection destination for the WhatsApp, Instagram, and Telegram buttons positioned below the home banner.
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
                        <span>{processing ? 'Saving...' : 'Save Social Links'}</span>
                    </button>
                </div>

                {/* Success Message */}
                {recentlySuccessful && (
                    <div className="p-4 rounded-xl flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in">
                        <CheckCircle size={18} />
                        Social channel redirection links updated successfully! Changes reflect immediately on all mobile devices.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: The 3 Channel Forms */}
                    <div className="lg:col-span-2 space-y-5">
                        
                        {/* 1. WhatsApp Card */}
                        <div className="p-6 rounded-2xl space-y-4 transition-all" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: '#25D366' }}>
                                        <MessageCircle size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                            WhatsApp Redirect Link
                                        </h2>
                                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                            Direct chat with your phone number or group invite link
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                    #1 Button
                                </span>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                                    Target Number or URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.whatsapp_url}
                                        onChange={e => setData('whatsapp_url', e.target.value)}
                                        placeholder="https://wa.me/919876543210 or 919876543210"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-mono"
                                        style={inputStyle}
                                    />
                                    <a
                                        href={getPreviewUrl('whatsapp')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Test WhatsApp Link in browser"
                                        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                                    >
                                        <ExternalLink size={14} />
                                        <span>Test</span>
                                    </a>
                                </div>
                                {errors.whatsapp_url && (
                                    <p className="text-rose-400 text-xs mt-1">{errors.whatsapp_url}</p>
                                )}
                            </div>

                            {/* Helpers */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                                <span className="font-medium">Quick suggestions:</span>
                                <button
                                    type="button"
                                    onClick={() => setData('whatsapp_url', 'https://wa.me/91')}
                                    className="px-2 py-0.5 rounded-md hover:text-white transition-colors"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                                >
                                    +91 India
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('whatsapp_url', 'https://chat.whatsapp.com/')}
                                    className="px-2 py-0.5 rounded-md hover:text-white transition-colors"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                                >
                                    Group Invite Link
                                </button>
                            </div>
                        </div>

                        {/* 2. Instagram Card */}
                        <div className="p-6 rounded-2xl space-y-4 transition-all" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                                        style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
                                    >
                                        <Instagram size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                            Instagram Profile Link
                                        </h2>
                                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                            Account username or full page URL
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-pink-400 bg-pink-500/10 border border-pink-500/20">
                                    #2 Button
                                </span>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                                    Instagram Username or URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.instagram_url}
                                        onChange={e => setData('instagram_url', e.target.value)}
                                        placeholder="https://instagram.com/promptsaar or promptsaar"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-500/40 transition-all font-mono"
                                        style={inputStyle}
                                    />
                                    <a
                                        href={getPreviewUrl('instagram')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Test Instagram Link in browser"
                                        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 transition-all"
                                    >
                                        <ExternalLink size={14} />
                                        <span>Test</span>
                                    </a>
                                </div>
                                {errors.instagram_url && (
                                    <p className="text-rose-400 text-xs mt-1">{errors.instagram_url}</p>
                                )}
                            </div>

                            {/* Helpers */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                                <span className="font-medium">Quick suggestions:</span>
                                <button
                                    type="button"
                                    onClick={() => setData('instagram_url', 'https://instagram.com/promptsaar')}
                                    className="px-2 py-0.5 rounded-md hover:text-white transition-colors"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                                >
                                    @promptsaar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('instagram_url', 'https://instagram.com/')}
                                    className="px-2 py-0.5 rounded-md hover:text-white transition-colors"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                                >
                                    instagram.com/
                                </button>
                            </div>
                        </div>

                        {/* 3. Telegram Card */}
                        <div className="p-6 rounded-2xl space-y-4 transition-all" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: '#0088CC' }}>
                                        <Send size={20} className="translate-x-[-1px] translate-y-[-1px]" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                            Telegram Channel / Group Link
                                        </h2>
                                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                            Telegram channel invite link or username handle
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-sky-400 bg-sky-500/10 border border-sky-500/20">
                                    #3 Button
                                </span>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                                    Telegram Username or Channel Link
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.telegram_url}
                                        onChange={e => setData('telegram_url', e.target.value)}
                                        placeholder="https://t.me/promptsaar or promptsaar"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500/40 transition-all font-mono"
                                        style={inputStyle}
                                    />
                                    <a
                                        href={getPreviewUrl('telegram')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Test Telegram Link in browser"
                                        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-all"
                                    >
                                        <ExternalLink size={14} />
                                        <span>Test</span>
                                    </a>
                                </div>
                                {errors.telegram_url && (
                                    <p className="text-rose-400 text-xs mt-1">{errors.telegram_url}</p>
                                )}
                            </div>

                            {/* Helpers */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                                <span className="font-medium">Quick suggestions:</span>
                                <button
                                    type="button"
                                    onClick={() => setData('telegram_url', 'https://t.me/promptsaar')}
                                    className="px-2 py-0.5 rounded-md hover:text-white transition-colors"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                                >
                                    @promptsaar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('telegram_url', 'https://t.me/joinchat/')}
                                    className="px-2 py-0.5 rounded-md hover:text-white transition-colors"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                                >
                                    Private Invite Link
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right 1 Col: Mobile App Live Preview */}
                    <div className="space-y-5">
                        <div className="p-5 rounded-2xl space-y-4 sticky top-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-2">
                                <Smartphone size={17} className="text-indigo-400" />
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                    Live Mobile App Preview
                                </h3>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                Here is how the 3 interactive buttons appear directly under the top hero banner in the mobile app.
                            </p>

                            {/* Simulated Mobile Mockup */}
                            <div className="rounded-2xl p-4 bg-slate-950/80 border border-slate-800 shadow-xl space-y-3">
                                {/* Simulated Banner */}
                                <div 
                                    className="w-full aspect-[16/9] rounded-xl overflow-hidden relative flex flex-col justify-end p-3"
                                    style={{
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="relative z-10 text-white">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20">Featured</span>
                                        <p className="text-xs font-bold mt-1">Prompt Saar Banner</p>
                                    </div>
                                </div>

                                {/* Simulated 3 Social Buttons */}
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    {/* WhatsApp */}
                                    <div 
                                        className="flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-slate-900 shadow-sm cursor-default"
                                        title={`Redirects to: ${getPreviewUrl('whatsapp')}`}
                                    >
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: '#25D366' }}>
                                            <MessageCircle size={11} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">WhatsApp</span>
                                    </div>

                                    {/* Instagram */}
                                    <div 
                                        className="flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl border border-pink-500/30 bg-white dark:bg-slate-900 shadow-sm cursor-default"
                                        title={`Redirects to: ${getPreviewUrl('instagram')}`}
                                    >
                                        <div 
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                                            style={{ background: '#E1306C' }}
                                        >
                                            <Instagram size={11} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">Instagram</span>
                                    </div>

                                    {/* Telegram */}
                                    <div 
                                        className="flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl border border-sky-500/30 bg-white dark:bg-slate-900 shadow-sm cursor-default"
                                        title={`Redirects to: ${getPreviewUrl('telegram')}`}
                                    >
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: '#0088CC' }}>
                                            <Send size={10} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">Telegram</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">WhatsApp:</span>
                                        <span className="font-mono text-emerald-400 truncate max-w-[130px]" title={data.whatsapp_url}>
                                            {data.whatsapp_url || 'Not set'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">Instagram:</span>
                                        <span className="font-mono text-pink-400 truncate max-w-[130px]" title={data.instagram_url}>
                                            {data.instagram_url || 'Not set'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">Telegram:</span>
                                        <span className="font-mono text-sky-400 truncate max-w-[130px]" title={data.telegram_url}>
                                            {data.telegram_url || 'Not set'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Help box */}
                            <div className="p-3.5 rounded-xl flex items-start gap-2.5 text-xs" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                                <HelpCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>Automatic App Linking</p>
                                    <p style={{ color: 'var(--color-muted)' }}>
                                        When a user clicks on their phone, the mobile app first attempts to open the native WhatsApp, Instagram, or Telegram app installed on their phone; otherwise it gracefully falls back to their browser.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="w-full py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                <Save size={15} />
                                <span>{processing ? 'Saving...' : 'Save Settings'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
