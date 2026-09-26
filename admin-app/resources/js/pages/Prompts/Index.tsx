import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, Search, Edit, Trash2, Eye, Star, TrendingUp, Filter, CheckCircle, XCircle } from 'lucide-react';

interface Category { id: number; name: string; slug: string; }
interface Prompt {
    id: number; title: string; description: string; cover_image: string;
    unlock_cost?: number;
    is_featured: boolean; is_trending: boolean; is_published: boolean;
    views: number; unlock_count: number; created_at: string; category: Category | null;
}
interface Paginated { data: Prompt[]; current_page: number; last_page: number; total: number; }
interface Admin { name: string; email: string; avatar?: string; }
interface Props { prompts: Paginated; categories: Category[]; filters: Record<string, string>; admin: Admin; }

export default function PromptsIndex({ prompts, categories, filters, admin }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? '');
    const [status, setStatus]   = useState(filters.status ?? '');
    const [deleting, setDeleting] = useState<number | null>(null);

    const applyFilters = () => {
        router.get('/admin/prompts', { search, category_id: categoryId, status }, { preserveState: true });
    };

    const handleDelete = (id: number, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeleting(id);
        router.delete(`/admin/prompts/${id}`, { onFinish: () => setDeleting(null) });
    };

    const toggleField = (id: number, field: 'is_featured' | 'is_trending' | 'is_published', current: boolean) => {
        router.put(`/admin/prompts/${id}`, { [field]: !current }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout admin={admin} title="Prompts">
            <Head title="Prompts" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{prompts.total} total prompts</p>
                </div>
                <Link href="/admin/prompts/create"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <Plus size={16} /> New Prompt
                </Link>
            </div>

            {/* Filters */}
            <div className="rounded-2xl p-4 mb-5 flex flex-wrap gap-3"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        placeholder="Search prompts..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={status} onChange={e => setStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
                <button onClick={applyFilters}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: '#6366f1', color: 'white' }}>
                    <Filter size={14} /> Filter
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {['Prompt', 'Category', 'Cost', 'Stats', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--color-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ '--tw-divide-opacity': 1 } as any}>
                            {prompts.data.map(p => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={p.cover_image} alt={p.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'; }} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate max-w-48" style={{ color: 'var(--color-text)' }}>{p.title}</p>
                                                <div className="flex gap-1 mt-0.5">
                                                    {p.is_featured && <Star size={10} className="text-amber-400" fill="currentColor" />}
                                                    {p.is_trending && <TrendingUp size={10} className="text-indigo-400" />}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                                            {p.category?.name ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold text-amber-400">
                                            🪙 {p.unlock_cost ?? 30}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                                                <Eye size={11} /> {p.views.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs" style={{ color: '#6366f1' }}>
                                                🔓 {p.unlock_count.toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => toggleField(p.id, 'is_published', p.is_published)}
                                            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors">
                                            {p.is_published
                                                ? <><CheckCircle size={12} className="text-emerald-400" /><span className="text-emerald-400">Published</span></>
                                                : <><XCircle size={12} className="text-slate-400" /><span style={{ color: 'var(--color-muted)' }}>Draft</span></>
                                            }
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/prompts/${p.id}/edit`}
                                                className="p-1.5 rounded-lg transition-colors hover:bg-indigo-500/20">
                                                <Edit size={14} style={{ color: '#6366f1' }} />
                                            </Link>
                                            <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id}
                                                className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20 disabled:opacity-50">
                                                <Trash2 size={14} className="text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {prompts.data.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-muted)' }}>No prompts found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {prompts.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            Page {prompts.current_page} of {prompts.last_page}
                        </p>
                        <div className="flex gap-2">
                            {Array.from({ length: prompts.last_page }, (_, i) => i + 1).map(page => (
                                <button key={page}
                                    onClick={() => router.get('/admin/prompts', { ...filters, page }, { preserveState: true })}
                                    className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                                    style={page === prompts.current_page
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
