import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
    Smartphone, Save, CheckCircle, AlertTriangle, ShieldAlert, 
    ArrowUpCircle, ExternalLink, Wrench, RefreshCw, Clock, Lock
} from 'lucide-react';

interface Settings {
    min_version: string;
    latest_version: string;
    force_update: boolean;
    update_url: string;
    update_title: string;
    update_message: string;
    maintenance_mode: boolean;
    maintenance_message: string;
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

export default function AppVersionPage({ settings, admin }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        min_version: settings.min_version || '1.0.0',
        latest_version: settings.latest_version || '1.0.0',
        force_update: settings.force_update,
        update_url: settings.update_url || '',
        update_title: settings.update_title || 'New Update Available',
        update_message: settings.update_message || '',
        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Disabled currently as requested
    };

    return (
        <AdminLayout admin={admin} title="App Version & Force Update">
            <Head title="App Version & Force Update" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                                Mobile App Version & Force Update
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                                <Clock size={12} />
                                Coming Soon
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                            Preview and configure version requirements, force update triggers, and maintenance controls.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={true}
                        title="This feature will be available soon"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700/80 transition-all opacity-70"
                    >
                        <Lock size={15} className="text-amber-400" />
                        <span>Save Settings (Available Soon)</span>
                    </button>
                </div>

                {/* Coming Soon Notice Banner */}
                <div className="p-4 rounded-xl flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs sm:text-sm">
                    <Clock size={18} className="text-amber-400 shrink-0" />
                    <div>
                        <p className="font-semibold text-amber-200">Feature Preview Only — Will Be Soon Available</p>
                        <p className="text-amber-300/80 text-xs mt-0.5">
                            Saving and real-time remote updates are temporarily disabled and will be officially enabled in an upcoming release.
                        </p>
                    </div>
                </div>

                {recentlySuccessful && (
                    <div className="p-4 rounded-xl flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                        <CheckCircle size={18} />
                        App settings have been saved and are live for all mobile users!
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Form: 2 cols */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section 1: Versioning & Force Update */}
                        <div className="p-6 rounded-2xl space-y-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                                    <ArrowUpCircle size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Version Controls & Rules
                                    </h2>
                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                        Control which app versions are permitted to connect.
                                    </p>
                                </div>
                            </div>

                            {/* Global Force Toggle */}
                            <div className="p-4 rounded-xl flex items-center justify-between gap-4" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Force Update All Older Versions
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                        When enabled, any user with version &lt; Min Version cannot dismiss the update popup.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.force_update}
                                        onChange={e => setData('force_update', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                </label>
                            </div>

                            {/* Versions Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                                        Minimum Required Version
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1.0.0"
                                        value={data.min_version}
                                        onChange={e => setData('min_version', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        style={inputStyle}
                                    />
                                    <p className="text-[11px] mt-1 text-slate-400">Users below this version are blocked until updated.</p>
                                    {errors.min_version && <p className="text-xs text-rose-400 mt-1">{errors.min_version}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                                        Latest Version in Store
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1.0.1"
                                        value={data.latest_version}
                                        onChange={e => setData('latest_version', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        style={inputStyle}
                                    />
                                    <p className="text-[11px] mt-1 text-slate-400">Triggers an optional "Update Available" banner.</p>
                                    {errors.latest_version && <p className="text-xs text-rose-400 mt-1">{errors.latest_version}</p>}
                                </div>
                            </div>

                            {/* Store URL */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                                    Google Play Store / Download URL
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        placeholder="https://play.google.com/store/apps/details?id=com.fillosoftpromptsaar.app"
                                        value={data.update_url}
                                        onChange={e => setData('update_url', e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        style={inputStyle}
                                    />
                                    <a
                                        href={data.update_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                                        title="Open link"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                                {errors.update_url && <p className="text-xs text-rose-400 mt-1">{errors.update_url}</p>}
                            </div>

                            {/* Message & Title */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                                        Update Popup Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="New Update Available"
                                        value={data.update_title}
                                        onChange={e => setData('update_title', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        style={inputStyle}
                                    />
                                    {errors.update_title && <p className="text-xs text-rose-400 mt-1">{errors.update_title}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                                        Update Announcement Message
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe what's new in this release..."
                                        value={data.update_message}
                                        onChange={e => setData('update_message', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                                        style={inputStyle}
                                    />
                                    {errors.update_message && <p className="text-xs text-rose-400 mt-1">{errors.update_message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Maintenance Mode */}
                        <div className="p-6 rounded-2xl space-y-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                                    <Wrench size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Emergency Maintenance Mode
                                    </h2>
                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                        Temporarily block all app access during server upgrades or maintenance.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl flex items-center justify-between gap-4" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                        Maintenance Mode Active
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                        Displays maintenance screen on all mobile clients instantly.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.maintenance_mode}
                                        onChange={e => setData('maintenance_mode', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                                    Maintenance Notice Message
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Scheduled maintenance message..."
                                    value={data.maintenance_message}
                                    onChange={e => setData('maintenance_message', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                    style={inputStyle}
                                />
                                {errors.maintenance_message && <p className="text-xs text-rose-400 mt-1">{errors.maintenance_message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Mobile Preview Card */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl space-y-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-2">
                                <Smartphone size={18} className="text-rose-400" />
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                    Mobile App Preview
                                </h3>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                This is how the modal renders on your users' phones:
                            </p>

                            {/* Simulated Device Modal */}
                            <div className="p-5 rounded-2xl text-center space-y-4 shadow-xl border border-slate-700/50" style={{ background: '#0F172A' }}>
                                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                    <ArrowUpCircle size={24} />
                                </div>

                                <div>
                                    <h4 className="text-base font-bold text-white">
                                        {data.update_title || 'Update Required'}
                                    </h4>
                                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 mt-1.5 border border-rose-500/20">
                                        v{data.latest_version || '1.0.1'} Available
                                    </div>
                                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                                        {data.update_message || 'Please update the app to continue.'}
                                    </p>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="w-full py-2.5 rounded-xl text-white font-semibold text-xs shadow-md" style={{ background: 'linear-gradient(135deg, #E11D48, #FF7A00)' }}>
                                        Update Now
                                    </div>
                                    {!data.force_update && (
                                        <div className="w-full py-2 rounded-xl text-slate-400 font-medium text-xs">
                                            Maybe Later
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                <p><strong>Status summary:</strong></p>
                                <p>• Force update active: <span className={data.force_update ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>{data.force_update ? 'YES (Dismiss disabled)' : 'NO (Soft alert)'}</span></p>
                                <p>• Min allowed version: <code className="text-slate-200">{data.min_version}</code></p>
                                <p>• Latest target version: <code className="text-slate-200">{data.latest_version}</code></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
