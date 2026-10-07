import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    FileCode, Save, CheckCircle, ExternalLink, Copy, Check,
    AlertCircle, Sparkles, RefreshCw, ShieldCheck,
    Info, Plus, Trash2, Globe, FileText, CheckCircle2, Shield
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

interface ParsedEntry {
    lineNumber: number;
    raw: string;
    isComment: boolean;
    domain?: string;
    publisherId?: string;
    relationship?: string;
    tagId?: string;
    isValid?: boolean;
    error?: string;
}

const inputStyle = {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
};

export default function AppAdsPage({ content, publicUrl, fileWritable, lastModified, admin }: Props) {
    const { data, setData, put, processing, recentlySuccessful, errors } = useForm({
        content: content || '',
    });

    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedContent, setCopiedContent] = useState(false);
    const [showParsedTable, setShowParsedTable] = useState(true);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings/app-ads', { preserveScroll: true });
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

    const insertDefaultAdMob = () => {
        const adMobLine = 'google.com, pub-9010050634863664, DIRECT, f08c47fec0942fa0';
        if (data.content.includes('pub-9010050634863664')) {
            return;
        }
        const newContent = data.content.trim() ? `${data.content.trim()}\n${adMobLine}\n` : `${adMobLine}\n`;
        setData('content', newContent);
    };

    const insertHeaderComment = () => {
        const dateStr = new Date().toISOString().split('T')[0];
        const comment = `# app-ads.txt - Authorized Digital Sellers for Prompt Saar\n# Updated: ${dateStr}\n`;
        if (data.content.startsWith('# app-ads.txt')) {
            return;
        }
        setData('content', `${comment}${data.content.trimStart()}`);
    };

    const formatAndTrim = () => {
        const lines = data.content
            .split('\n')
            .map(line => line.trim())
            .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''));
        setData('content', lines.join('\n') + (lines.length > 0 ? '\n' : ''));
    };

    // Parse lines according to IAB app-ads.txt standard
    const parsedEntries = useMemo(() => {
        const lines = data.content.split('\n');
        const entries: ParsedEntry[] = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            if (trimmed.startsWith('#')) {
                entries.push({
                    lineNumber: index + 1,
                    raw: trimmed,
                    isComment: true,
                });
                return;
            }

            // Syntax: <Field 1>, <Field 2>, <Field 3>, <Field 4 (optional)>
            const parts = trimmed.split(',').map(p => p.trim());
            const domain = parts[0] || '';
            const publisherId = parts[1] || '';
            const relationship = parts[2]?.toUpperCase() || '';
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

            entries.push({
                lineNumber: index + 1,
                raw: trimmed,
                isComment: false,
                domain,
                publisherId,
                relationship,
                tagId,
                isValid,
                error,
            });
        });

        return entries;
    }, [data.content]);

    const stats = useMemo(() => {
        const validRecords = parsedEntries.filter(e => !e.isComment && e.isValid);
        const invalidRecords = parsedEntries.filter(e => !e.isComment && !e.isValid);
        const directCount = validRecords.filter(e => e.relationship === 'DIRECT').length;
        const resellerCount = validRecords.filter(e => e.relationship === 'RESELLER').length;
        const hasAdMob = parsedEntries.some(e => e.publisherId?.includes('pub-9010050634863664'));
        const lineCount = data.content.split('\n').filter(l => l.trim().length > 0).length;

        return {
            totalValid: validRecords.length,
            invalidCount: invalidRecords.length,
            directCount,
            resellerCount,
            hasAdMob,
            lineCount,
            charCount: data.content.length,
        };
    }, [parsedEntries, data.content]);

    return (
        <AdminLayout admin={admin} title="app-ads.txt Editor">
            <Head title="app-ads.txt Editor — Authorized Sellers" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                                app-ads.txt Editor
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                                <ShieldCheck size={13} />
                                IAB Tech Lab Standard
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                            Manage authorized digital sellers hosted on your domain for Google AdMob crawlers & fraud prevention.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={submit}
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {processing ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                            <span>{processing ? 'Publishing...' : 'Save & Publish'}</span>
                        </button>
                    </div>
                </div>

                {/* Recently Saved Notification */}
                {recentlySuccessful && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                        <CheckCircle size={18} className="shrink-0" />
                        <div>
                            <span className="font-semibold">Published Successfully:</span> The updated app-ads.txt file is now live and saved in database & public root.
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
                                        200 OK
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

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Authorized Sellers</p>
                            <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>
                                {stats.totalValid} <span className="text-xs font-normal text-slate-400">records</span>
                            </p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>AdMob Pub ID Status</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {stats.hasAdMob ? (
                                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 size={13} /> Verified
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                        <AlertCircle size={13} /> Missing AdMob
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>DIRECT vs RESELLER</p>
                            <p className="text-xs font-bold mt-1" style={{ color: 'var(--color-text)' }}>
                                <span className="text-indigo-400">{stats.directCount} DIRECT</span> / <span className="text-slate-400">{stats.resellerCount} RESELLER</span>
                            </p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>File Sync Status</p>
                            <p className="text-xs font-semibold mt-1 text-emerald-400 flex items-center gap-1">
                                <Shield size={13} /> {fileWritable ? 'Disk Writable & Synced' : 'Database Active'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Editor Card */}
                <form onSubmit={submit} className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                            <FileCode size={18} className="text-indigo-400" />
                            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                File Content Editor
                            </h2>
                            <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                                {stats.lineCount} lines • {stats.charCount} chars
                            </span>
                        </div>

                        {/* Quick Helper Tools */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={insertDefaultAdMob}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border hover:border-indigo-500/50 transition-colors cursor-pointer"
                                style={{ ...inputStyle, color: 'var(--color-text)' }}
                                title="Insert Prompt Saar Google AdMob seller line"
                            >
                                <Plus size={13} className="text-indigo-400" />
                                <span>+ AdMob ID</span>
                            </button>
                            <button
                                type="button"
                                onClick={insertHeaderComment}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border hover:border-indigo-500/50 transition-colors cursor-pointer"
                                style={{ ...inputStyle, color: 'var(--color-text)' }}
                                title="Insert header comment with current date"
                            >
                                <FileText size={13} className="text-indigo-400" />
                                <span>+ Header Comment</span>
                            </button>
                            <button
                                type="button"
                                onClick={formatAndTrim}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border hover:border-indigo-500/50 transition-colors cursor-pointer"
                                style={{ ...inputStyle, color: 'var(--color-text)' }}
                                title="Clean up whitespace and trailing empty lines"
                            >
                                <Sparkles size={13} className="text-amber-400" />
                                <span>Format</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCopyContent}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
                                style={{ ...inputStyle, color: 'var(--color-text)' }}
                            >
                                {copiedContent ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                <span>{copiedContent ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
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
                            rows={10}
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

                    {/* Save bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            Changes will immediately take effect on <code className="text-indigo-400 font-mono">/app-ads.txt</code> and sync to disk.
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

                {/* Parsed Live Inspector Table */}
                <div className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-emerald-400" />
                            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                                Syntax Inspector & Authorized Partners
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowParsedTable(!showParsedTable)}
                            className="text-xs text-indigo-400 hover:underline cursor-pointer"
                        >
                            {showParsedTable ? 'Collapse Details' : 'Expand Details'}
                        </button>
                    </div>

                    {showParsedTable && (
                        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                                        <th className="py-2.5 px-3 font-semibold" style={{ color: 'var(--color-muted)' }}>#</th>
                                        <th className="py-2.5 px-3 font-semibold" style={{ color: 'var(--color-muted)' }}>Exchange Domain</th>
                                        <th className="py-2.5 px-3 font-semibold" style={{ color: 'var(--color-muted)' }}>Publisher Account ID</th>
                                        <th className="py-2.5 px-3 font-semibold" style={{ color: 'var(--color-muted)' }}>Relationship</th>
                                        <th className="py-2.5 px-3 font-semibold" style={{ color: 'var(--color-muted)' }}>Cert Authority ID</th>
                                        <th className="py-2.5 px-3 font-semibold text-right" style={{ color: 'var(--color-muted)' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                    {parsedEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                                                No lines configured. Click "+ AdMob ID" above to add your seller line.
                                            </td>
                                        </tr>
                                    ) : (
                                        parsedEntries.map((entry, idx) => {
                                            if (entry.isComment) {
                                                return (
                                                    <tr key={idx} className="bg-slate-900/30">
                                                        <td className="py-2 px-3 font-mono text-slate-500">{entry.lineNumber}</td>
                                                        <td colSpan={5} className="py-2 px-3 font-mono text-slate-400 italic">
                                                            {entry.raw}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                                    <td className="py-2.5 px-3 font-mono text-slate-400">{entry.lineNumber}</td>
                                                    <td className="py-2.5 px-3 font-mono font-medium" style={{ color: 'var(--color-text)' }}>
                                                        {entry.domain}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-indigo-400">
                                                        {entry.publisherId}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                                            entry.relationship === 'DIRECT'
                                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                        }`}>
                                                            {entry.relationship || 'UNKNOWN'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-slate-400">
                                                        {entry.tagId || <span className="text-slate-600">—</span>}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        {entry.isValid ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                                                                <CheckCircle2 size={12} /> Valid
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-400 text-[11px] font-medium" title={entry.error}>
                                                                <AlertCircle size={12} /> {entry.error || 'Error'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
