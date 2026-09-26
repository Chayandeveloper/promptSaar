import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Unlock, Search, Filter } from 'lucide-react';

interface Prompt { id: number; title: string; category: { name: string } | null; }
interface UnlockRecord { id: number; device_id: string | null; prompt: Prompt | null; unlocked_at: string; }
interface Paginated { data: UnlockRecord[]; current_page: number; last_page: number; total: number; }
interface Admin { name: string; email: string; avatar?: string; }
interface Props { unlocks: Paginated; filters: Record<string, string>; admin: Admin; }

export default function UnlocksIndex({ unlocks, filters, admin }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = () => {
        router.get('/admin/unlocks', { search }, { preserveState: true });
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
            + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AdminLayout admin={admin} title="Unlock Analytics">
            <Head title="Unlocks" />

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{unlocks.total.toLocaleString()} total unlocks</p>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                            placeholder="Search by prompt..." className="pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', width: 220 }} />
                    </div>
                    <button onClick={applyFilters} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ background: '#6366f1', color: 'white' }}>
                        <Filter size={14} /> Filter
                    </button>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {['#', 'Prompt', 'Category', 'Device ID', 'Unlocked At'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--color-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {unlocks.data.map(u => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors"
                                    style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{u.id}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: '#6366f122' }}>
                                                <Unlock size={12} style={{ color: '#6366f1' }} />
                                            </div>
                                            <p className="text-sm font-medium max-w-48 truncate" style={{ color: 'var(--color-text)' }}>
                                                {u.prompt?.title ?? '—'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                                            {u.prompt?.category?.name ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                                        {u.device_id ? u.device_id.substring(0, 12) + '...' : 'Anonymous'}
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                                        {u.unlocked_at ? formatDate(u.unlocked_at) : '—'}
                                    </td>
                                </tr>
                            ))}
                            {unlocks.data.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                                    No unlocks yet — users unlock prompts after watching ads in the mobile app
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {unlocks.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Page {unlocks.current_page} of {unlocks.last_page}</p>
                        <div className="flex gap-2">
                            {Array.from({ length: Math.min(unlocks.last_page, 10) }, (_, i) => i + 1).map(page => (
                                <button key={page}
                                    onClick={() => router.get('/admin/unlocks', { ...filters, page }, { preserveState: true })}
                                    className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                                    style={page === unlocks.current_page
                                        ? { background: '#6366f1', color: 'white' }
                                        : { background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
