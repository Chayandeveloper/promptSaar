import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, Edit, Trash2, Tag, CheckCircle, XCircle, X, Save } from 'lucide-react';

interface Category { id: number; name: string; slug: string; icon: string; description: string; status: string; prompts_count: number; }
interface Admin { name: string; email: string; avatar?: string; }
interface Props { categories: Category[]; admin: Admin; }

const ICON_OPTIONS = ['sparkles','code','feather','trending-up','briefcase','book-open','share-2','check-circle','video','layers','image','brain','zap','globe','music','camera','heart','star'];

export default function CategoriesIndex({ categories, admin }: Props) {
    const [editing, setEditing] = useState<Category | null>(null);
    const [creating, setCreating] = useState(false);

    const createForm = useForm({ name: '', description: '', icon: 'sparkles', status: 'active', image: '' });
    const editForm   = useForm({ name: '', description: '', icon: 'sparkles', status: 'active', image: '' });

    const openCreate = () => { createForm.reset(); setCreating(true); };
    const openEdit = (c: Category) => {
        setEditing(c);
        editForm.setData({ name: c.name, description: c.description ?? '', icon: c.icon, status: c.status, image: c.image ?? '' });
    };

    const handleDelete = (id: number, name: string) => {
        if (!confirm(`Delete category "${name}"?`)) return;
        router.delete(`/admin/categories/${id}`);
    };

    const inputStyle = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

    const CategoryForm = ({ form, onSubmit, onCancel, title }: any) => (
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--color-surface)', border: '1px solid #6366f1' }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
                <button onClick={onCancel}><X size={16} style={{ color: 'var(--color-muted)' }} /></button>
            </div>
            <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Name *</label>
                    <input value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                        placeholder="Category name" className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Status</label>
                    <select value={form.data.status} onChange={e => form.setData('status', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Icon</label>
                    <select value={form.data.icon} onChange={e => form.setData('icon', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                        {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Image URL</label>
                    <input value={form.data.image} onChange={e => form.setData('image', e.target.value)}
                        placeholder="https://..." className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Description</label>
                    <textarea value={form.data.description} onChange={e => form.setData('description', e.target.value)}
                        rows={2} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
                </div>
                <div className="sm:col-span-2 flex gap-3 justify-end">
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm"
                        style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>Cancel</button>
                    <button type="submit" disabled={form.processing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <Save size={13} /> {form.processing ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <AdminLayout admin={admin} title="Categories">
            <Head title="Categories" />

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{categories.length} categories</p>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <Plus size={16} /> New Category
                </button>
            </div>

            {creating && (
                <CategoryForm form={createForm} title="Create Category"
                    onCancel={() => setCreating(false)}
                    onSubmit={(e: React.FormEvent) => { e.preventDefault(); createForm.post('/admin/categories', { onSuccess: () => setCreating(false) }); }} />
            )}

            {editing && (
                <CategoryForm form={editForm} title={`Edit: ${editing.name}`}
                    onCancel={() => setEditing(null)}
                    onSubmit={(e: React.FormEvent) => { e.preventDefault(); editForm.put(`/admin/categories/${editing.id}`, { onSuccess: () => setEditing(null) }); }} />
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                    <div key={c.id} className="rounded-2xl p-5"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                    style={{ background: 'linear-gradient(135deg,#6366f122,#8b5cf622)' }}>
                                    <Tag size={18} style={{ color: '#6366f1' }} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{c.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>/{c.slug}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-indigo-500/20">
                                    <Edit size={13} style={{ color: '#6366f1' }} />
                                </button>
                                <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 rounded-lg hover:bg-red-500/20">
                                    <Trash2 size={13} className="text-red-400" />
                                </button>
                            </div>
                        </div>
                        {c.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--color-muted)' }}>{c.description}</p>}
                        <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                                {c.prompts_count} prompts
                            </span>
                            <span className="flex items-center gap-1 text-xs">
                                {c.status === 'active'
                                    ? <><CheckCircle size={11} className="text-emerald-400" /><span className="text-emerald-400">Active</span></>
                                    : <><XCircle size={11} className="text-slate-400" /><span style={{ color: 'var(--color-muted)' }}>Inactive</span></>}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
