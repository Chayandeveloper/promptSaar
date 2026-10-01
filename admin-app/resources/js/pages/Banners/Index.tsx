import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Plus, Edit, Trash2, CheckCircle, XCircle, X, Save,
    Sparkles, ArrowRight, Lock, Eye, ExternalLink, Image as ImageIcon,
    Upload, Layers, Tag, Star, MoveUp
} from 'lucide-react';

interface PromptOption {
    id: number;
    title: string;
    cover_image: string;
    category_id: number;
    description: string;
    category?: { id: number; name: string; slug: string };
}

interface CategoryOption {
    id: number;
    name: string;
    slug: string;
}

interface Banner {
    id: number;
    title: string;
    subtitle?: string | null;
    badge_text: string;
    image_url: string;
    cta_text: string;
    action_type: 'prompt' | 'category' | 'url' | 'none';
    prompt_id?: number | null;
    category_id?: number | null;
    target_url?: string | null;
    is_active: boolean;
    order: number;
    prompt?: {
        id: number;
        title: string;
        cover_image: string;
        category?: { id: number; name: string; slug: string };
    };
    category?: { id: number; name: string; slug: string };
}

interface Admin {
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    banners: Banner[];
    prompts: PromptOption[];
    categories: CategoryOption[];
    admin: Admin;
}

const BADGE_PRESETS = [
    'FEATURED PROMPT',
    'SPECIAL OFFER',
    'NEW RELEASE',
    'COMMUNITY FAVORITE',
    'PRO TIP',
    'TRENDING NOW',
];

const CTA_PRESETS = [
    'View & Unlock',
    'Explore Now',
    'Learn More',
    'Try Prompt',
    'Claim Reward',
];

export default function BannersIndex({ banners, prompts, categories, admin }: Props) {
    const [editing, setEditing] = useState<Banner | null>(null);
    const [creating, setCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewBanner, setPreviewBanner] = useState<Partial<Banner> | null>(banners[0] || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialFormData = {
        title: '',
        subtitle: '',
        badge_text: 'FEATURED PROMPT',
        image_url: '',
        cta_text: 'View & Unlock',
        action_type: 'prompt' as 'prompt' | 'category' | 'url' | 'none',
        prompt_id: prompts[0]?.id || '',
        category_id: categories[0]?.id || '',
        target_url: '',
        is_active: true,
        order: 0,
    };

    const form = useForm(initialFormData);

    const openCreate = () => {
        setEditing(null);
        form.reset();
        if (prompts.length > 0) {
            const p = prompts[0];
            form.setData({
                ...initialFormData,
                title: p.title,
                subtitle: p.description,
                image_url: p.cover_image,
                prompt_id: p.id,
                category_id: p.category_id || '',
            });
            setPreviewBanner({
                title: p.title,
                subtitle: p.description,
                badge_text: 'FEATURED PROMPT',
                image_url: p.cover_image,
                cta_text: 'View & Unlock',
                action_type: 'prompt',
                prompt: p,
            });
        }
        setCreating(true);
    };

    const openEdit = (b: Banner) => {
        setCreating(false);
        setEditing(b);
        form.setData({
            title: b.title,
            subtitle: b.subtitle || '',
            badge_text: b.badge_text || 'FEATURED PROMPT',
            image_url: b.image_url,
            cta_text: b.cta_text || 'View & Unlock',
            action_type: b.action_type,
            prompt_id: b.prompt_id || '',
            category_id: b.category_id || '',
            target_url: b.target_url || '',
            is_active: b.is_active,
            order: b.order,
        });
        setPreviewBanner(b);
    };

    const handleSelectPrompt = (promptId: number) => {
        const p = prompts.find(item => item.id === promptId);
        if (p) {
            form.setData({
                ...form.data,
                action_type: 'prompt',
                prompt_id: p.id,
                category_id: p.category_id || '',
                title: p.title,
                subtitle: p.description,
                image_url: p.cover_image,
            });
            setPreviewBanner({
                ...form.data,
                title: p.title,
                subtitle: p.description,
                image_url: p.cover_image,
                prompt: p,
            } as any);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const tokenMeta = document.querySelector('meta[name="csrf-token"]');
            const token = tokenMeta ? tokenMeta.getAttribute('content') : '';

            const res = await fetch('/admin/banners/upload-image', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token || '',
                    'Accept': 'application/json',
                },
                body: data,
            });

            if (!res.ok) throw new Error('Failed to upload image');
            const result = await res.json();
            form.setData('image_url', result.url);
            setPreviewBanner(prev => ({ ...prev, image_url: result.url }));
        } catch (err: any) {
            alert(err.message || 'Image upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const toggleActive = (id: number) => {
        router.post(`/admin/banners/${id}/toggle`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number, title: string) => {
        if (!confirm(`Delete banner "${title}"?`)) return;
        router.delete(`/admin/banners/${id}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(`/admin/banners/${editing.id}`, {
                onSuccess: () => {
                    setEditing(null);
                },
            });
        } else {
            form.post('/admin/banners', {
                onSuccess: () => {
                    setCreating(false);
                },
            });
        }
    };

    const inputStyle = {
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
    };

    // Derived active top banner for showcase preview
    const activeTopBanner = previewBanner || banners.find(b => b.is_active) || banners[0];

    return (
        <AdminLayout admin={admin} title="Top Banners">
            <Head title="Top Hero Banners" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Top Hero Banners
                    </h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        Customize and switch the featured banner displayed at the top of the mobile app home screen anytime.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:opacity-90 self-start sm:self-auto"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    <Plus size={16} /> New Banner
                </button>
            </div>

            {/* Live Mobile Hero Banner Preview Card */}
            <div className="rounded-2xl p-6 mb-8 border border-indigo-500/30 overflow-hidden relative"
                style={{ background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 70%), var(--color-surface)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                            Live Mobile App Preview (Top Hero Card)
                        </span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Instant App Sync
                    </span>
                </div>

                {/* Mobile Mock Container */}
                <div className="max-w-md mx-auto">
                    <div className="relative rounded-2xl overflow-hidden border border-indigo-500/40 shadow-2xl aspect-video w-full bg-slate-900 group">
                        {/* Background Image */}
                        <img
                            src={activeTopBanner?.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80'}
                            alt="Banner Preview"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={e => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80';
                            }}
                        />
                        {/* Gradient */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(to bottom, transparent 0%, rgba(9, 13, 22, 0.4) 40%, rgba(9, 13, 22, 0.95) 100%)',
                            }}
                        />
                        {/* Content */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-end">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-indigo-200 border border-indigo-400/40"
                                    style={{ background: 'rgba(99, 102, 241, 0.4)' }}>
                                    <Sparkles size={11} className="text-indigo-300" />
                                    {activeTopBanner?.badge_text || 'FEATURED PROMPT'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30"
                                    style={{ background: 'rgba(245, 158, 11, 0.25)' }}>
                                    <Lock size={10} className="text-amber-400" />
                                    Ad Reward
                                </span>
                            </div>

                            <h3 className="text-white font-bold text-base leading-snug line-clamp-2 drop-shadow-md mb-2">
                                {activeTopBanner?.title || 'Discover Powerful AI Prompts'}
                            </h3>

                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md"
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                    <span>{activeTopBanner?.cta_text || 'View & Unlock'}</span>
                                    <ArrowRight size={13} />
                                </div>
                                <span className="text-xs text-slate-300 font-semibold px-2 py-0.5 rounded bg-black/40 border border-white/10">
                                    {activeTopBanner?.category?.name || (activeTopBanner?.prompt?.category?.name) || 'Featured'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-[11px] mt-2.5" style={{ color: 'var(--color-muted)' }}>
                        This is the exact view mobile users see at the very top of their home feed.
                    </p>
                </div>
            </div>

            {/* Create / Edit Form Drawer */}
            {(creating || editing) && (
                <div className="rounded-2xl p-6 mb-8 border border-indigo-500 shadow-xl"
                    style={{ background: 'var(--color-surface)' }}>
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={18} className="text-indigo-400" />
                            <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
                                {editing ? `Edit Banner: ${editing.title}` : 'Create New Top Banner'}
                            </h3>
                        </div>
                        <button
                            onClick={() => { setCreating(false); setEditing(null); }}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={18} style={{ color: 'var(--color-muted)' }} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Quick Prompt Select */}
                        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                            <label className="block text-xs font-semibold mb-1 text-indigo-300 flex items-center gap-1.5">
                                <Star size={13} className="text-amber-400" />
                                Quick Autofill: Choose from Published Prompts
                            </label>
                            <p className="text-[11px] mb-2" style={{ color: 'var(--color-muted)' }}>
                                Selecting a prompt automatically fills in the title, description, and cover image.
                            </p>
                            <select
                                onChange={e => {
                                    const val = Number(e.target.value);
                                    if (val) handleSelectPrompt(val);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
                                style={inputStyle}
                                defaultValue=""
                            >
                                <option value="" disabled>-- Select a prompt to feature as banner --</option>
                                {prompts.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.title} ({p.category?.name || 'General'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title & Badge */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Banner Headline *
                                </label>
                                <input
                                    value={form.data.title}
                                    onChange={e => {
                                        form.setData('title', e.target.value);
                                        setPreviewBanner(prev => ({ ...prev, title: e.target.value }));
                                    }}
                                    placeholder="e.g. Sora & Runway Gen-3 Cinematic Drone Flythrough"
                                    required
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                    style={inputStyle}
                                />
                                {form.errors.title && <p className="text-red-400 text-xs mt-1">{form.errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Badge Label (Top Tag)
                                </label>
                                <input
                                    value={form.data.badge_text}
                                    onChange={e => {
                                        form.setData('badge_text', e.target.value);
                                        setPreviewBanner(prev => ({ ...prev, badge_text: e.target.value }));
                                    }}
                                    placeholder="FEATURED PROMPT"
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-2"
                                    style={inputStyle}
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {BADGE_PRESETS.map(badge => (
                                        <button
                                            key={badge}
                                            type="button"
                                            onClick={() => {
                                                form.setData('badge_text', badge);
                                                setPreviewBanner(prev => ({ ...prev, badge_text: badge }));
                                            }}
                                            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors border ${
                                                form.data.badge_text === badge
                                                    ? 'bg-indigo-600 text-white border-indigo-500'
                                                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-indigo-400'
                                            }`}
                                        >
                                            {badge}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Image Uploader & URL */}
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Banner Image * <span className="text-indigo-400 font-semibold">(Recommended 16:9 ratio, e.g. 1920×1080 or 1280×720)</span>
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    value={form.data.image_url}
                                    onChange={e => {
                                        form.setData('image_url', e.target.value);
                                        setPreviewBanner(prev => ({ ...prev, image_url: e.target.value }));
                                    }}
                                    placeholder="https://images.unsplash.com/... or upload image"
                                    required
                                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                                    style={inputStyle}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
                                >
                                    <Upload size={15} />
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                            </div>
                        </div>

                        {/* Subtitle / Description */}
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Subtitle / Description (Optional)
                            </label>
                            <textarea
                                value={form.data.subtitle || ''}
                                onChange={e => {
                                    form.setData('subtitle', e.target.value);
                                    setPreviewBanner(prev => ({ ...prev, subtitle: e.target.value }));
                                }}
                                rows={2}
                                placeholder="Short context or highlight for this banner"
                                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                                style={inputStyle}
                            />
                        </div>

                        {/* Action Destination & CTA Button */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    When Tapped (Action Type)
                                </label>
                                <select
                                    value={form.data.action_type}
                                    onChange={e => form.setData('action_type', e.target.value as any)}
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                    style={inputStyle}
                                >
                                    <option value="prompt">Open AI Prompt</option>
                                    <option value="category">Open Category</option>
                                    <option value="url">External Link (Web)</option>
                                    <option value="none">Information Only</option>
                                </select>
                            </div>

                            {form.data.action_type === 'prompt' && (
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                        Target Prompt
                                    </label>
                                    <select
                                        value={form.data.prompt_id}
                                        onChange={e => {
                                            const id = Number(e.target.value);
                                            form.setData('prompt_id', id);
                                            const p = prompts.find(item => item.id === id);
                                            if (p) setPreviewBanner(prev => ({ ...prev, prompt: p }));
                                        }}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={inputStyle}
                                    >
                                        {prompts.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {form.data.action_type === 'category' && (
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                        Target Category
                                    </label>
                                    <select
                                        value={form.data.category_id}
                                        onChange={e => form.setData('category_id', Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={inputStyle}
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {form.data.action_type === 'url' && (
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                        Target URL
                                    </label>
                                    <input
                                        value={form.data.target_url}
                                        onChange={e => form.setData('target_url', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Button Text (CTA)
                                </label>
                                <input
                                    value={form.data.cta_text}
                                    onChange={e => {
                                        form.setData('cta_text', e.target.value);
                                        setPreviewBanner(prev => ({ ...prev, cta_text: e.target.value }));
                                    }}
                                    placeholder="View & Unlock"
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-1.5"
                                    style={inputStyle}
                                />
                                <div className="flex flex-wrap gap-1">
                                    {CTA_PRESETS.map(cta => (
                                        <button
                                            key={cta}
                                            type="button"
                                            onClick={() => {
                                                form.setData('cta_text', cta);
                                                setPreviewBanner(prev => ({ ...prev, cta_text: cta }));
                                            }}
                                            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                                        >
                                            {cta}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order & Active Status */}
                        <div className="flex items-center gap-6 pt-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={e => form.setData('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span style={{ color: 'var(--color-text)' }}>Active (Visible in App)</span>
                            </label>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                                    Priority Order:
                                </label>
                                <input
                                    type="number"
                                    value={form.data.order}
                                    onChange={e => form.setData('order', parseInt(e.target.value) || 0)}
                                    className="w-20 px-2 py-1 rounded-lg text-sm text-center outline-none"
                                    style={inputStyle}
                                />
                                <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                    (0 = highest priority)
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => { setCreating(false); setEditing(null); }}
                                className="px-4 py-2 rounded-xl text-sm"
                                style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                <Save size={15} />
                                {form.processing ? 'Saving...' : (editing ? 'Update Banner' : 'Create & Publish Banner')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Banners List Table */}
            <div className="rounded-2xl overflow-hidden shadow-lg"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                            Configured Banners ({banners.length})
                        </h2>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            The active banner with the lowest priority order (or highest ID) is shown at the top of the mobile home screen.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {['Banner', 'Badge & Subtitle', 'Target Destination', 'Order', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--color-muted)' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {banners.map((b, idx) => (
                                <tr
                                    key={b.id}
                                    className="hover:bg-white/[0.02] transition-colors"
                                    onClick={() => setPreviewBanner(b)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-16 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                                <img
                                                    src={b.image_url}
                                                    alt={b.title}
                                                    className="w-full h-full object-cover"
                                                    onError={e => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60';
                                                    }}
                                                />
                                                {idx === 0 && b.is_active && (
                                                    <div className="absolute top-0 right-0 bg-amber-400 text-black text-[9px] px-1 font-black">
                                                        TOP
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 max-w-xs">
                                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                                                    {b.title}
                                                </p>
                                                <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
                                                    CTA: "{b.cta_text || 'View & Unlock'}"
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1"
                                            style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                                            {b.badge_text}
                                        </span>
                                        {b.subtitle && (
                                            <p className="text-xs truncate max-w-xs" style={{ color: 'var(--color-muted)' }}>
                                                {b.subtitle}
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        {b.action_type === 'prompt' && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                <Layers size={11} />
                                                Prompt: {b.prompt?.title ? b.prompt.title.slice(0, 20) + '...' : `#${b.prompt_id}`}
                                            </span>
                                        )}
                                        {b.action_type === 'category' && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                                <Tag size={11} />
                                                Cat: {b.category?.name || `#${b.category_id}`}
                                            </span>
                                        )}
                                        {b.action_type === 'url' && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                                                <ExternalLink size={11} />
                                                Web Link
                                            </span>
                                        )}
                                        {b.action_type === 'none' && (
                                            <span className="text-xs px-2 py-0.5 rounded text-slate-400 bg-white/5">
                                                Info Only
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className="text-xs font-mono font-medium px-2 py-1 rounded bg-white/5" style={{ color: 'var(--color-muted)' }}>
                                            #{b.order}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                toggleActive(b.id);
                                            }}
                                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                                                b.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/30 hover:bg-slate-500/20'
                                            }`}
                                        >
                                            {b.is_active ? (
                                                <>
                                                    <CheckCircle size={12} className="text-emerald-400" />
                                                    <span>Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={12} className="text-slate-400" />
                                                    <span>Inactive</span>
                                                </>
                                            )}
                                        </button>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => openEdit(b)}
                                                className="p-1.5 rounded-lg transition-colors hover:bg-indigo-500/20 text-indigo-400"
                                                title="Edit Banner"
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(b.id, b.title)}
                                                className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20 text-red-400"
                                                title="Delete Banner"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {banners.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                                        No banners created yet. Click "+ New Banner" above to create your first top hero banner!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
