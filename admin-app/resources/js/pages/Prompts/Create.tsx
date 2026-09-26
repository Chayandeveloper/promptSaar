import React, { useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Save, X, Upload, Plus, Tag } from 'lucide-react';

interface Category { id: number; name: string; slug: string; icon: string; }
interface Admin { name: string; email: string; avatar?: string; }
interface Props { categories: Category[]; defaultCost?: number; admin: Admin; }

const inputStyle = {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
};

export default function PromptsCreate({ categories, defaultCost = 30, admin }: Props) {
    const [tagInput, setTagInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        title: '',
        description: '',
        prompt_text: '',
        cover_image: '',
        unlock_cost: defaultCost,
        tags: [] as string[],
        is_featured: false,
        is_trending: false,
        is_published: true,
    });

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !data.tags.includes(tag)) {
            setData('tags', [...data.tags, tag]);
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => setData('tags', data.tags.filter(t => t !== tag));

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const form = new FormData();
        form.append('image', file);
        try {
            const res = await fetch('/admin/prompts/upload-image', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '' },
                body: form,
            });
            const json = await res.json();
            if (json.url) setData('cover_image', json.url);
        } finally {
            setUploading(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/prompts');
    };

    return (
        <AdminLayout admin={admin} title="Create Prompt">
            <Head title="Create Prompt" />

            <form onSubmit={submit}>
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main fields */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Title */}
                        <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Basic Info</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Title *</label>
                                    <input value={data.title} onChange={e => setData('title', e.target.value)}
                                        placeholder="e.g. Cinematic Product Photography" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                        style={inputStyle} />
                                    {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Category *</label>
                                    <select value={data.category_id} onChange={e => setData('category_id', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                                        <option value="">Select a category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.category_id && <p className="mt-1 text-xs text-red-400">{errors.category_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Short Description *</label>
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                        rows={2} placeholder="Brief description shown in the app listing..."
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
                                    {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Prompt Text */}
                        <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Prompt Text <span className="text-xs font-normal" style={{ color: 'var(--color-muted)' }}>(revealed after ad unlock)</span></h3>
                            <textarea value={data.prompt_text} onChange={e => setData('prompt_text', e.target.value)}
                                rows={10} placeholder="Enter the full AI prompt text here..."
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-y font-mono"
                                style={{ ...inputStyle, lineHeight: '1.6' }} />
                            {errors.prompt_text && <p className="mt-1 text-xs text-red-400">{errors.prompt_text}</p>}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Cover Image */}
                        <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Cover Image</h3>
                            {data.cover_image && (
                                <img src={data.cover_image} alt="Cover" className="w-full h-40 object-cover rounded-xl mb-3" />
                            )}
                            <input value={data.cover_image} onChange={e => setData('cover_image', e.target.value)}
                                placeholder="https://... or upload below" className="w-full px-3 py-2 rounded-xl text-xs outline-none mb-2"
                                style={inputStyle} />
                            <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-colors"
                                style={{ background: 'var(--color-surface-2)', border: '1px dashed var(--color-border)', color: 'var(--color-muted)' }}>
                                <Upload size={13} /> {uploading ? 'Uploading...' : 'Upload Image'}
                            </button>
                            {errors.cover_image && <p className="mt-1 text-xs text-red-400">{errors.cover_image}</p>}
                        </div>

                        {/* Tags */}
                        <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Tags</h3>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {data.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                                        style={{ background: '#6366f122', color: '#6366f1' }}>
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)}><X size={10} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    placeholder="Add tag..." className="flex-1 px-3 py-2 rounded-xl text-xs outline-none" style={inputStyle} />
                                <button type="button" onClick={addTag}
                                    className="px-3 py-2 rounded-xl text-xs" style={{ background: '#6366f1', color: 'white' }}>
                                    <Plus size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Settings</h3>
                            
                            {/* Unlock Cost */}
                            <div className="mb-4 pb-4 border-b border-slate-800">
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Unlock Cost (Coins) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="5000"
                                        value={data.unlock_cost}
                                        onChange={e => setData('unlock_cost', parseInt(e.target.value, 10) || 0)}
                                        className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-semibold outline-none"
                                        style={inputStyle}
                                    />
                                    <span className="absolute left-3 top-2 text-sm">🪙</span>
                                </div>
                                <p className="mt-1 text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                    Cost for users unlocking without watching an ad.
                                </p>
                                {errors.unlock_cost && <p className="mt-1 text-xs text-red-400">{errors.unlock_cost}</p>}
                            </div>

                            <div className="space-y-3">
                                {[
                                    { key: 'is_published', label: 'Published', sub: 'Visible in the mobile app' },
                                    { key: 'is_featured',  label: 'Featured',  sub: 'Show in hero section' },
                                    { key: 'is_trending',  label: 'Trending',  sub: 'Show in trending list' },
                                ].map(({ key, label, sub }) => (
                                    <label key={key} className="flex items-center justify-between cursor-pointer">
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
                                            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{sub}</p>
                                        </div>
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only"
                                                checked={(data as any)[key]}
                                                onChange={e => setData(key as any, e.target.checked)} />
                                            <div className={`w-10 h-5 rounded-full transition-colors ${(data as any)[key] ? 'bg-indigo-500' : ''}`}
                                                style={{ background: (data as any)[key] ? '#6366f1' : 'var(--color-border)' }}>
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${(data as any)[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <a href="/admin/prompts" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                                Cancel
                            </a>
                            <button type="submit" disabled={processing}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                <Save size={14} /> {processing ? 'Saving...' : 'Save Prompt'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
