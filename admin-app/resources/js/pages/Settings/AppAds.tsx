import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    FileCode, Save, CheckCircle, ExternalLink, Copy, Check,
    AlertCircle, Sparkles, RefreshCw, ShieldCheck,
    Info, Plus, Trash2, Globe, FileText, CheckCircle2, Shield,
    Edit3, X, HelpCircle, Layers, CheckSquare, Server, AlertTriangle
} from 'lucide-react';

interface Admin {
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    content: string;
    publicUrl: string;
    fileWritable: boolean;
    lastModified?: string | null;
    admin: Admin;
}

interface AccountItem {
    id: string;
    lineNumber: number;
    raw: string;
    label?: string;
    domain: string;
    publisherId: string;
    relationship: 'DIRECT' | 'RESELLER' | string;
    tagId?: string;
    isAdMob: boolean;
    isValid: boolean;
    error?: string;
}

const inputStyle = {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
};

const PRESET_NETWORKS = [
    {
        id: 'admob',
        name: 'Google AdMob',
        domain: 'google.com',
        relationship: 'DIRECT',
        tagId: 'f08c47fec0942fa0',
        pubPrefix: 'pub-',
        placeholder: 'pub-8448030863991486',
        badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        desc: 'Official Google AdMob seller verification',
    },
    {
        id: 'meta',
        name: 'Meta Audience Network',
        domain: 'facebook.com',
        relationship: 'DIRECT',
        tagId: 'c3fc741384551738',
        pubPrefix: '',
        placeholder: '123456789012345',
        badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        desc: 'Facebook & Meta Ads publisher ID',
    },
    {
        id: 'applovin',
        name: 'AppLovin',
        domain: 'applovin.com',
        relationship: 'DIRECT',
        tagId: 'bba312952136136d',
        pubPrefix: '',
        placeholder: 'your-applovin-id',
        badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
        desc: 'AppLovin MAX mediation & network',
    },
    {
        id: 'unity',
        name: 'Unity Ads',
        domain: 'unityads.unity3d.com',
        relationship: 'DIRECT',
        tagId: '40d6122a0011a9e7',
        pubPrefix: '',
        placeholder: 'your-unity-publisher-id',
        badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        desc: 'Unity Monetization Ads',
    },
    {
        id: 'ironsource',
        name: 'ironSource',
        domain: 'ironsource.com',
        relationship: 'DIRECT',
        tagId: 'b78a3c8e49520448',
        pubPrefix: '',
        placeholder: 'your-ironsource-id',
        badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        desc: 'ironSource LevelPlay mediation',
    },
    {
        id: 'inmobi',
        name: 'InMobi',
        domain: 'inmobi.com',
        relationship: 'DIRECT',
        tagId: '8996d4417a80800d',
        pubPrefix: '',
        placeholder: 'your-inmobi-id',
        badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        desc: 'InMobi Ad Network',
    },
    {
        id: 'custom',
        name: 'Custom Ad Partner',
        domain: '',
        relationship: 'DIRECT',
        tagId: '',
        pubPrefix: '',
        placeholder: 'Publisher Account ID',
        badgeColor: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
        desc: 'Any IAB authorized digital seller',
    },
];

export default function AppAdsPage({ content, publicUrl, fileWritable, lastModified, admin }: Props) {
    const { data, setData, put, processing, recentlySuccessful, errors } = useForm({
        content: content || '',
    });

    const pageProps = usePage<{ flash?: { success?: string; error?: string; warning?: string; info?: string } }>().props;
    const flash = pageProps.flash;

    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedContent, setCopiedContent] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'manager' | 'raw'>('manager');

    // Auto-save feedback states
    const [isSavingAction, setIsSavingAction] = useState(false);
    const [actionFeedback, setActionFeedback] = useState<string | null>(null);

    // Keep form content synchronized whenever props update from server
    useEffect(() => {
        setData('content', content || '');
    }, [content]);

    // Modal state for adding or editing an account
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);

    // Form fields for modal
    const [selectedPreset, setSelectedPreset] = useState('admob');
    const [modalDomain, setModalDomain] = useState('google.com');
    const [modalPubId, setModalPubId] = useState('');
    const [modalRelationship, setModalRelationship] = useState<'DIRECT' | 'RESELLER'>('DIRECT');
    const [modalTagId, setModalTagId] = useState('f08c47fec0942fa0');
    const [modalLabel, setModalLabel] = useState('');
    const [modalFormError, setModalFormError] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings/app-ads', { preserveScroll: true });
    };

    // Auto-publish changes directly to the server so additions and deletions persist immediately
    const publishDirectly = (newContent: string, message: string) => {
        setData('content', newContent);
        setIsSavingAction(true);
        router.put('/admin/settings/app-ads', { content: newContent }, {
            preserveScroll: true,
            onSuccess: () => {
                setActionFeedback(message);
                setTimeout(() => setActionFeedback(null), 4000);
            },
            onFinish: () => {
                setIsSavingAction(false);
            }
        });
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const handleCopyContent = () => {
        navigator.clipboard.writeText(data.content);
        setCopiedContent(true);
        setTimeout(() => setCopiedContent(false), 2000);
    };

    const handleCopyLine = (line: string, id: string) => {
        navigator.clipboard.writeText(line);
        setCopiedIndex(id);
        setTimeout(() => setCopiedIndex(null), 1800);
    };

    // Parse accounts from data.content
    const { accounts, totalLines, stats } = useMemo(() => {
        const lines = data.content.split('\n');
        const list: AccountItem[] = [];
        let pendingLabel: string | undefined = undefined;

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) {
                pendingLabel = undefined;
                return;
            }

            if (trimmed.startsWith('#')) {
                // If it looks like a label comment e.g. "# Label: My AdMob" or "# Account: Biswanath"
                const match = trimmed.match(/^#\s*(?:Label|Account|Name)?\s*:\s*(.+)$/i);
                if (match) {
                    pendingLabel = match[1].trim();
                } else {
                    // Check if comment contains a label
                    const stripped = trimmed.replace(/^#+\s*/, '');
                    if (stripped && !stripped.toLowerCase().startsWith('app-ads.txt') && !stripped.toLowerCase().startsWith('updated')) {
                        pendingLabel = stripped;
                    }
                }
                return;
            }

            // CSV syntax: domain, publisher_id, relationship, certification_id
            const parts = trimmed.split(',').map(p => p.trim());
            const domain = parts[0] || '';
            const publisherId = parts[1] || '';
            const relationship = (parts[2]?.toUpperCase() || 'DIRECT') as 'DIRECT' | 'RESELLER';
            const tagId = parts[3] || '';

            let isValid = true;
            let error = '';

            if (parts.length < 3) {
                isValid = false;
                error = 'Must contain at least 3 comma-separated fields (Domain, Publisher ID, DIRECT/RESELLER)';
            } else if (!domain.includes('.')) {
                isValid = false;
                error = 'Invalid domain name in field 1';
            } else if (!publisherId) {
                isValid = false;
                error = 'Missing publisher ID in field 2';
            } else if (relationship !== 'DIRECT' && relationship !== 'RESELLER') {
                isValid = false;
                error = `Field 3 must be "DIRECT" or "RESELLER" (found: "${parts[2]}")`;
            }

            const isAdMob = domain.toLowerCase() === 'google.com';

            list.push({
                id: `line-${index}-${publisherId || index}`,
                lineNumber: index + 1,
                raw: trimmed,
                label: pendingLabel,
                domain,
                publisherId,
                relationship,
                tagId,
                isAdMob,
                isValid,
                error,
            });

            pendingLabel = undefined;
        });

        const validAccounts = list.filter(a => a.isValid);
        const admobAccounts = validAccounts.filter(a => a.isAdMob);
        const directCount = validAccounts.filter(a => a.relationship === 'DIRECT').length;
        const resellerCount = validAccounts.filter(a => a.relationship === 'RESELLER').length;

        return {
            accounts: list,
            totalLines: lines.length,
            stats: {
                totalAccounts: list.length,
                validCount: validAccounts.length,
                invalidCount: list.length - validAccounts.length,
                admobCount: admobAccounts.length,
                directCount,
                resellerCount,
                charCount: data.content.length,
            },
        };
    }, [data.content]);

    // Open Modal for New Account
    const openAddAccountModal = (presetId: string = 'admob') => {
        const preset = PRESET_NETWORKS.find(p => p.id === presetId) || PRESET_NETWORKS[0];
        setEditingAccount(null);
        setSelectedPreset(preset.id);
        setModalDomain(preset.domain);
        setModalPubId('');
        setModalRelationship((preset.relationship as 'DIRECT' | 'RESELLER') || 'DIRECT');
        setModalTagId(preset.tagId);
        setModalLabel('');
        setModalFormError('');
        setIsModalOpen(true);
    };

    // Open Modal to Edit an Existing Account
    const openEditAccountModal = (acc: AccountItem) => {
        setEditingAccount(acc);
        const matchPreset = PRESET_NETWORKS.find(p => p.domain.toLowerCase() === acc.domain.toLowerCase());
        setSelectedPreset(matchPreset ? matchPreset.id : 'custom');
        setModalDomain(acc.domain);
        setModalPubId(acc.publisherId);
        setModalRelationship((acc.relationship === 'RESELLER' ? 'RESELLER' : 'DIRECT'));
        setModalTagId(acc.tagId || '');
        setModalLabel(acc.label || '');
        setModalFormError('');
        setIsModalOpen(true);
    };

    // Change Preset inside Modal
    const handlePresetChange = (presetId: string) => {
        setSelectedPreset(presetId);
        const preset = PRESET_NETWORKS.find(p => p.id === presetId);
        if (preset) {
            setModalDomain(preset.domain);
            if (preset.tagId) setModalTagId(preset.tagId);
            if (preset.id === 'admob' && modalPubId && !modalPubId.startsWith('pub-')) {
                setModalPubId(`pub-${modalPubId.replace(/[^0-9]/g, '')}`);
            }
        }
    };

    // Auto-clean Pub ID when typing or pasting
    const handlePubIdChange = (val: string) => {
        let clean = val.trim();
        if (selectedPreset === 'admob' || modalDomain.toLowerCase() === 'google.com') {
            const pubMatch = clean.match(/pub-?(\d{14,20})/i);
            if (pubMatch) {
                clean = `pub-${pubMatch[1]}`;
            } else if (/^\d{14,20}$/.test(clean)) {
                clean = `pub-${clean}`;
            }
        }
        setModalPubId(clean);
    };

    // Save Account from Modal (Add or Edit) - Automatically persists to backend
    const handleSaveAccount = (e: React.FormEvent) => {
        e.preventDefault();
        setModalFormError('');

        const domain = modalDomain.trim().toLowerCase();
        let pubId = modalPubId.trim();

        if (!domain || !domain.includes('.')) {
            setModalFormError('Please enter a valid exchange domain (e.g. google.com)');
            return;
        }

        if (!pubId) {
            setModalFormError('Publisher Account ID is required');
            return;
        }

        // If Google AdMob, ensure pub- prefix
        if (domain === 'google.com' && !pubId.startsWith('pub-') && /^\d+$/.test(pubId)) {
            pubId = `pub-${pubId}`;
        }

        // Check if publisher ID is already in file (when adding new)
        if (!editingAccount && accounts.some(a => a.domain.toLowerCase() === domain && a.publisherId.toLowerCase() === pubId.toLowerCase())) {
            setModalFormError(`This account (${domain}, ${pubId}) is already present in your app-ads.txt`);
            return;
        }

        const tag = modalTagId.trim();
        const lineRecord = tag
            ? `${domain}, ${pubId}, ${modalRelationship}, ${tag}`
            : `${domain}, ${pubId}, ${modalRelationship}`;

        const labelLine = modalLabel.trim() ? `# Label: ${modalLabel.trim()}\n` : '';
        const fullBlock = `${labelLine}${lineRecord}`;

        let newContent = data.content;

        if (editingAccount) {
            // Update existing line
            const lines = data.content.split('\n');
            const targetLineIndex = editingAccount.lineNumber - 1;

            if (targetLineIndex >= 0 && targetLineIndex < lines.length) {
                const prevIndex = targetLineIndex - 1;
                if (prevIndex >= 0 && lines[prevIndex].trim().startsWith('#') && lines[prevIndex].toLowerCase().includes('label:')) {
                    if (modalLabel.trim()) {
                        lines[prevIndex] = `# Label: ${modalLabel.trim()}`;
                        lines[targetLineIndex] = lineRecord;
                    } else {
                        lines.splice(prevIndex, 1);
                        lines[targetLineIndex - 1] = lineRecord;
                    }
                } else if (modalLabel.trim()) {
                    lines[targetLineIndex] = `${labelLine}${lineRecord}`;
                } else {
                    lines[targetLineIndex] = lineRecord;
                }
                newContent = lines.join('\n');
            }
        } else {
            // Append new account
            const trimmedContent = data.content.trim();
            newContent = trimmedContent ? `${trimmedContent}\n\n${fullBlock}\n` : `${fullBlock}\n`;
        }

        setIsModalOpen(false);
        setEditingAccount(null);
        publishDirectly(newContent, editingAccount ? 'Account updated and published live!' : `Account ${pubId} added and published live!`);
    };

    // Delete Account - Automatically persists to backend
    const handleDeleteAccount = (acc: AccountItem) => {
        if (!confirm(`Are you sure you want to remove account "${acc.publisherId}" (${acc.domain}) from app-ads.txt?`)) {
            return;
        }

        const lines = data.content.split('\n');
        const targetLineIndex = acc.lineNumber - 1;

        if (targetLineIndex >= 0 && targetLineIndex < lines.length) {
            const prevIndex = targetLineIndex - 1;
            if (prevIndex >= 0 && lines[prevIndex].trim().startsWith('#') && lines[prevIndex].toLowerCase().includes('label:')) {
                lines.splice(prevIndex, 2);
            } else {
                lines.splice(targetLineIndex, 1);
            }
            const cleaned = lines.filter((l, idx, arr) => !(l.trim() === '' && arr[idx - 1]?.trim() === ''));
            const newContent = cleaned.join('\n') + (cleaned.length > 0 ? '\n' : '');
            publishDirectly(newContent, `Account ${acc.publisherId} removed and published live!`);
        }
    };

    // Helper: Add Standard Header
    const insertHeaderComment = () => {
        const dateStr = new Date().toISOString().split('T')[0];
        const comment = `# app-ads.txt - Authorized Digital Sellers for Prompt Saar\n# Updated: ${dateStr}\n`;
        if (data.content.startsWith('# app-ads.txt')) {
            return;
        }
        const newContent = `${comment}${data.content.trimStart()}`;
        publishDirectly(newContent, 'Standard header comment inserted and published!');
    };

    // Helper: Format and Clean content
    const formatAndTrim = () => {
        const lines = data.content
            .split('\n')
            .map(line => line.trim())
            .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''));
        const newContent = lines.join('\n') + (lines.length > 0 ? '\n' : '');
        publishDirectly(newContent, 'Formatted and published successfully!');
    };

    const isBusy = processing || isSavingAction;

    return (
        <AdminLayout admin={admin} title="app-ads.txt / AdMob Sellers Editor">
            <Head title="app-ads.txt Editor — Authorized AdMob Sellers" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                                app-ads.txt / AdMob Sellers
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                                <ShieldCheck size={13} />
                                IAB Tech Lab Standard
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                            Add, manage, and verify all authorized Google AdMob accounts and ad partners hosted on your domain.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => openAddAccountModal('admob')}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                            title="Add a new Google AdMob Publisher Account"
                        >
                            <Plus size={16} />
                            <span>Add AdMob Account</span>
                        </button>

                        <button
                            type="button"
                            onClick={submit}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {isBusy ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                            <span>{isBusy ? 'Publishing...' : 'Save & Publish'}</span>
                        </button>
                    </div>
                </div>

                {/* Published Notification */}
                {(actionFeedback || recentlySuccessful || flash?.success) && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm animate-in fade-in duration-300">
                        <CheckCircle size={18} className="shrink-0" />
                        <div>
                            <span className="font-semibold">Published Successfully:</span> {actionFeedback || flash?.success || 'The updated app-ads.txt file with all accounts is now live on your domain and saved in database & disk.'}
                        </div>
                    </div>
                )}

                {/* Warning / Server Permissions Notification */}
                {(flash?.warning || !fileWritable) && (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm animate-in fade-in duration-300">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-400" />
                        <div className="space-y-1">
                            <span className="font-semibold">File System Permission Notice:</span>
                            <p className="text-xs text-amber-200/90 leading-relaxed">
                                {flash?.warning || 'The public/app-ads.txt file on disk is not writable by PHP. Settings are saved in the database, but if your web server (Nginx/Apache) serves static files directly from public/, changes won\'t appear on your live URL until file permissions are fixed (e.g. chmod 666 public/app-ads.txt).'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Live Serving Status Card */}
                <div className="p-5 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                                <Globe size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Public Live URL</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        200 OK • Live Crawler Ready
                                    </span>
                                </div>
                                <code className="text-xs sm:text-sm font-mono mt-0.5 block break-all font-semibold" style={{ color: 'var(--color-text)' }}>
                                    {publicUrl}
                                </code>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleCopyUrl}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
                                style={{ ...inputStyle, color: 'var(--color-text)' }}
                            >
                                {copiedUrl ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                            </button>
                            <a
                                href={publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                <ExternalLink size={14} />
                                <span>View Live File</span>
                            </a>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Authorized Accounts</p>
                            <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>
                                {stats.totalAccounts} <span className="text-xs font-normal text-slate-400">accounts</span>
                            </p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>AdMob Accounts</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {stats.admobCount > 0 ? (
                                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 size={15} /> {stats.admobCount} Configured
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                        <AlertCircle size={13} /> 0 AdMob accounts
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Relationship Breakdown</p>
                            <p className="text-xs font-bold mt-1" style={{ color: 'var(--color-text)' }}>
                                <span className="text-indigo-400">{stats.directCount} DIRECT</span>
                                <span className="text-slate-500 mx-1">•</span>
                                <span className="text-slate-400">{stats.resellerCount} RESELLER</span>
                            </p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Disk & Database Sync</p>
                            <p className="text-xs font-semibold mt-1 text-emerald-400 flex items-center gap-1">
                                <Shield size={13} /> {fileWritable ? 'Disk Synced' : 'Database Live'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* View Tabs & Quick Controls Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="inline-flex p-1 rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('manager')}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === 'manager'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <Layers size={14} />
                            <span>Accounts Manager ({accounts.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('raw')}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === 'raw'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <FileCode size={14} />
                            <span>Raw app-ads.txt Editor</span>
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => openAddAccountModal('custom')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border hover:border-indigo-500/50 transition-colors cursor-pointer"
                            style={{ ...inputStyle, color: 'var(--color-text)' }}
                        >
                            <Plus size={13} className="text-indigo-400" />
                            <span>+ Other Network</span>
                        </button>
                        <button
                            type="button"
                            onClick={insertHeaderComment}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border hover:border-indigo-500/50 transition-colors cursor-pointer"
                            style={{ ...inputStyle, color: 'var(--color-text)' }}
                            title="Insert header comment with date"
                        >
                            <FileText size={13} className="text-indigo-400" />
                            <span>+ Header</span>
                        </button>
                        <button
                            type="button"
                            onClick={formatAndTrim}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border hover:border-indigo-500/50 transition-colors cursor-pointer"
                            style={{ ...inputStyle, color: 'var(--color-text)' }}
                            title="Clean extra empty lines"
                        >
                            <Sparkles size={13} className="text-amber-400" />
                            <span>Format</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleCopyContent}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
                            style={{ ...inputStyle, color: 'var(--color-text)' }}
                        >
                            {copiedContent ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            <span>{copiedContent ? 'Copied' : 'Copy All'}</span>
                        </button>
                    </div>
                </div>

                {/* TAB 1: ACCOUNTS MANAGER */}
                {activeTab === 'manager' && (
                    <div className="space-y-4">
                        {accounts.length === 0 ? (
                            <div className="p-12 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3"
                                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    <FileCode size={24} />
                                </div>
                                <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                    No Authorized Accounts Configured
                                </h3>
                                <p className="text-xs max-w-md" style={{ color: 'var(--color-muted)' }}>
                                    Google AdMob requires you to publish your publisher account ID in app-ads.txt to verify app ownership and unlock ad revenue.
                                </p>
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => openAddAccountModal('admob')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                    >
                                        <Plus size={16} />
                                        <span>Add First AdMob Account</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {accounts.map((acc, index) => {
                                    return (
                                        <div
                                            key={acc.id}
                                            className="p-4 sm:p-5 rounded-2xl border transition-all hover:border-indigo-500/40 relative group"
                                            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-start sm:items-center gap-3">
                                                    {/* Account Number or AdMob Icon */}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                                                        acc.isAdMob
                                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                                    }`}>
                                                        {acc.isAdMob ? 'AdMob' : `#${index + 1}`}
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-mono text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                                                                {acc.publisherId || '(empty ID)'}
                                                            </span>

                                                            {acc.label && (
                                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                                                    {acc.label}
                                                                </span>
                                                            )}

                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                acc.relationship === 'DIRECT'
                                                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                            }`}>
                                                                {acc.relationship}
                                                            </span>

                                                            {acc.isValid ? (
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                                                    <CheckCircle2 size={12} /> Valid
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-medium" title={acc.error}>
                                                                    <AlertTriangle size={12} /> {acc.error}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Metadata row */}
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                                                            <span className="flex items-center gap-1">
                                                                <Globe size={12} className="text-slate-400" />
                                                                <code className="text-indigo-400 font-mono">{acc.domain}</code>
                                                            </span>
                                                            {acc.tagId && (
                                                                <span className="flex items-center gap-1">
                                                                    <ShieldCheck size={12} className="text-slate-400" />
                                                                    <span>TAG ID: <code className="font-mono text-slate-300">{acc.tagId}</code></span>
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] text-slate-500">
                                                                Line {acc.lineNumber}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1.5 shrink-0 sm:self-center self-end pt-2 sm:pt-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyLine(acc.raw, acc.id)}
                                                        className="p-2 rounded-lg border hover:border-indigo-500/50 transition-colors text-slate-400 hover:text-white cursor-pointer"
                                                        style={inputStyle}
                                                        title="Copy raw record line"
                                                    >
                                                        {copiedIndex === acc.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditAccountModal(acc)}
                                                        className="p-2 rounded-lg border hover:border-indigo-500/50 transition-colors text-slate-400 hover:text-white cursor-pointer"
                                                        style={inputStyle}
                                                        title="Edit account details"
                                                    >
                                                        <Edit3 size={14} className="text-indigo-400" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteAccount(acc)}
                                                        className="p-2 rounded-lg border hover:border-red-500/50 transition-colors text-slate-400 hover:text-red-400 cursor-pointer"
                                                        style={inputStyle}
                                                        title="Remove account from file"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => openAddAccountModal('admob')}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-indigo-500/40 text-xs sm:text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                                    >
                                        <Plus size={16} />
                                        <span>+ Add Another AdMob / Partner Account</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={submit}
                                        disabled={isBusy}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                    >
                                        {isBusy ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                                        <span>{isBusy ? 'Saving...' : 'Save & Publish Changes'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: RAW TEXT EDITOR */}
                {activeTab === 'raw' && (
                    <form onSubmit={submit} className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex items-center gap-2">
                                <FileCode size={18} className="text-indigo-400" />
                                <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                    Raw app-ads.txt Content
                                </h2>
                                <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                                    {totalLines} lines • {stats.charCount} chars
                                </span>
                            </div>
                            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                Edits here sync directly to the Accounts Manager
                            </span>
                        </div>

                        {/* Textarea Code Box */}
                        <div className="relative rounded-xl overflow-hidden border focus-within:border-indigo-500 transition-colors"
                            style={{ borderColor: errors.content ? '#ef4444' : 'var(--color-border)', background: '#0b0f17' }}>
                            <div className="flex items-center justify-between px-4 py-2 border-b text-xs text-slate-400"
                                style={{ background: '#111827', borderColor: '#1f2937' }}>
                                <span className="font-mono">app-ads.txt</span>
                                <span className="text-[11px] text-slate-400">text/plain • UTF-8</span>
                            </div>
                            <textarea
                                rows={12}
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                                spellCheck={false}
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                                className="w-full p-4 font-mono text-sm leading-relaxed text-emerald-400 focus:outline-none resize-y selection:bg-indigo-500/30"
                                style={{ background: 'transparent' }}
                                placeholder="google.com, pub-9010050634863664, DIRECT, f08c47fec0942fa0"
                            />
                        </div>

                        {errors.content && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={13} /> {errors.content}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                Changes immediately take effect on <code className="text-indigo-400 font-mono">/app-ads.txt</code> and sync to disk & database.
                            </p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                {processing ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                                <span>{processing ? 'Saving...' : 'Save app-ads.txt'}</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* Information Callout */}
                <div className="p-4 rounded-xl border flex items-start gap-3 text-xs"
                    style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--color-muted)' }}>
                    <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-semibold text-slate-200">How Google AdMob Crawls app-ads.txt:</p>
                        <p>
                            AdMob crawlers verify that your AdMob Publisher ID (<code className="text-indigo-400">pub-XXXXXXXXXXXXXXXX</code>) is listed as an authorized seller under your developer website domain. Multiple accounts can be added simultaneously without conflicts.
                        </p>
                    </div>
                </div>
            </div>

            {/* ADD / EDIT ACCOUNT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
                    <div
                        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                                    {editingAccount ? <Edit3 size={16} /> : <Plus size={16} />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                                        {editingAccount ? 'Edit Account' : 'Add Authorized Seller Account'}
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                        {editingAccount ? 'Update publisher record in app-ads.txt' : 'Add another AdMob or ad partner account'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSaveAccount} className="p-6 space-y-4">
                            {modalFormError && (
                                <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{modalFormError}</span>
                                </div>
                            )}

                            {/* Preset Selection Buttons (Only when adding) */}
                            {!editingAccount && (
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                                        Choose Network Preset
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {PRESET_NETWORKS.map(preset => {
                                            const isSelected = selectedPreset === preset.id;
                                            return (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() => handlePresetChange(preset.id)}
                                                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                                                        isSelected
                                                            ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-sm'
                                                            : 'border-zinc-800 bg-zinc-900/40 text-slate-400 hover:border-zinc-700'
                                                    }`}
                                                >
                                                    {preset.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Domain */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                                    Exchange Domain <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={modalDomain}
                                    onChange={e => setModalDomain(e.target.value)}
                                    placeholder="google.com"
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    style={inputStyle}
                                />
                                <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                    Canonical domain name of the advertising exchange (e.g. <code className="text-indigo-400">google.com</code> for AdMob).
                                </p>
                            </div>

                            {/* Publisher ID */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                                        Publisher Account ID <span className="text-red-400">*</span>
                                    </label>
                                    {modalDomain.toLowerCase() === 'google.com' && (
                                        <span className="text-[11px] text-emerald-400 font-medium">Format: pub-xxxxxxxxxxxxxxxx</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={modalPubId}
                                    onChange={e => handlePubIdChange(e.target.value)}
                                    placeholder="pub-8448030863991486"
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    style={inputStyle}
                                />
                                <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                    Your publisher account ID. For AdMob, this begins with <code className="text-indigo-400 font-mono">pub-</code>.
                                </p>
                            </div>

                            {/* Relationship & Cert Authority ID Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                                        Relationship
                                    </label>
                                    <select
                                        value={modalRelationship}
                                        onChange={e => setModalRelationship(e.target.value as 'DIRECT' | 'RESELLER')}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                                        style={inputStyle}
                                    >
                                        <option value="DIRECT">DIRECT (Owner)</option>
                                        <option value="RESELLER">RESELLER (Intermediary)</option>
                                    </select>
                                    <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                        DIRECT if you directly own the AdMob account.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                                        Cert Authority ID (TAG ID)
                                    </label>
                                    <input
                                        type="text"
                                        value={modalTagId}
                                        onChange={e => setModalTagId(e.target.value)}
                                        placeholder="f08c47fec0942fa0"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        style={inputStyle}
                                    />
                                    <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                        Google AdMob TAG ID is <code className="text-indigo-400 font-mono">f08c47fec0942fa0</code>.
                                    </p>
                                </div>
                            </div>

                            {/* Optional Label / Note */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                                    Account Label / Note (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={modalLabel}
                                    onChange={e => setModalLabel(e.target.value)}
                                    placeholder="e.g. Primary AdMob, Biswanath Account, Secondary Team ID"
                                    className="w-full px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    style={inputStyle}
                                />
                                <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                    Saved as a comment right above the record for easy identification.
                                </p>
                            </div>

                            {/* Live Preview Box */}
                            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Record Preview:
                                </span>
                                <div className="font-mono text-xs text-emerald-400 break-all">
                                    {modalLabel && <div className="text-slate-500"># Label: {modalLabel}</div>}
                                    {modalDomain || 'exchange.com'}, {modalPubId || 'pub-XXXX'}, {modalRelationship}
                                    {modalTagId ? `, ${modalTagId}` : ''}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                >
                                    {isBusy ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
                                    <span>{isBusy ? 'Saving...' : (editingAccount ? 'Update Account' : 'Add Account & Publish')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
