import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Plus, Edit, Trash2, CheckCircle, XCircle, X, Save,
    Sparkles, ArrowRight, Eye, ExternalLink, Image as ImageIcon,
    Upload, Video, Film, Play, Pause, Volume2, VolumeX,
    Flame, Smartphone, RefreshCw, Layers, Check, AlertCircle
} from 'lucide-react';

interface TemplateItem {
    id: number;
    title: string;
    description?: string | null;
    category: string;
    thumbnail_url: string;
    video_url: string;
    capcut_url: string;
    tags?: string[] | null;
    duration?: string | null;
    use_count: number;
    views_count: number;
    is_featured: boolean;
    is_vn?: boolean;
    vn_image_url?: string | null;
    is_active: boolean;
    order: number;
    created_at?: string;
}

interface Stats {
    total: number;
    active: number;
    total_uses: number;
    total_views: number;
}

interface Admin {
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    templates: {
        data: TemplateItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: Stats;
    categories: string[];
    filters: {
        search?: string;
        category?: string;
    };
    admin: Admin;
}

const CATEGORY_PRESETS = [
    'Trending',
    'Reels',
    'Beat Sync',
    'Aesthetic',
    'Photo Dump',
    'Cinematic',
    'Viral Effects',
    'Velocity / SlowMo',
    'Lyrics & Quotes',
];

export default function TemplatesIndex({ templates, stats, categories, filters, admin }: Props) {
    const [editing, setEditing] = useState<TemplateItem | null>(null);
    const [creating, setCreating] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [uploadingVn, setUploadingVn] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(templates.data[0] || null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'All');

    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const vnInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const initialFormData = {
        title: '',
        description: '',
        category: 'Trending',
        thumbnail_url: '',
        video_url: '',
        capcut_url: 'https://www.capcut.com/',
        duration: '0:15',
        tags: 'capcut, trending, reels',
        is_featured: false,
        is_vn: false,
        vn_image_url: '',
        is_active: true,
        order: 0,
    };

    const form = useForm(initialFormData);

    const openCreate = () => {
        form.reset();
        form.setData(initialFormData);
        setEditing(null);
        setCreating(true);
    };

    const openEdit = (tpl: TemplateItem) => {
        setCreating(false);
        setEditing(tpl);
        form.setData({
            title: tpl.title,
            description: tpl.description || '',
            category: tpl.category || 'Trending',
            thumbnail_url: tpl.thumbnail_url,
            video_url: tpl.video_url,
            capcut_url: tpl.capcut_url,
            duration: tpl.duration || '0:15',
            tags: Array.isArray(tpl.tags) ? tpl.tags.join(', ') : (tpl.tags || ''),
            is_featured: tpl.is_featured,
            is_vn: Boolean(tpl.is_vn),
            vn_image_url: tpl.vn_image_url || '',
            is_active: tpl.is_active,
            order: tpl.order,
        });
    };

    const closeModal = () => {
        setCreating(false);
        setEditing(null);
        form.reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(`/admin/templates/${editing.id}`, {
                onSuccess: () => closeModal(),
                onError: (errors) => {
                    console.error('Update template errors:', errors);
                },
            });
        } else {
            form.post('/admin/templates', {
                onSuccess: () => closeModal(),
                onError: (errors) => {
                    console.error('Create template errors:', errors);
                },
            });
        }
    };

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Are you sure you want to delete template "${title}"?`)) {
            router.delete(`/admin/templates/${id}`);
        }
    };

    const handleToggle = (id: number) => {
        router.post(`/admin/templates/${id}/toggle`);
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingVideo(true);
        const fd = new FormData();
        fd.append('video', file);

        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch('/admin/templates/upload-video', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrf || '',
                    'Accept': 'application/json',
                },
                body: fd,
            });

            if (res.status === 419) {
                alert('Session expired. Please refresh the page and log in again.');
                return;
            }

            const data = await res.json().catch(() => null);

            if (res.ok && data?.url) {
                form.setData('video_url', data.url);
            } else {
                const errorMsg = data?.errors?.video?.[0] || data?.message || `Upload failed with status ${res.status}`;
                alert(errorMsg);
            }
        } catch (err: any) {
            alert(err?.message || 'Upload error. The file may exceed the server file size limit.');
        } finally {
            if (e.target) e.target.value = '';
            setUploadingVideo(false);
        }
    };

    const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingThumb(true);
        const fd = new FormData();
        fd.append('thumbnail', file);

        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch('/admin/templates/upload-thumbnail', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrf || '',
                    'Accept': 'application/json',
                },
                body: fd,
            });

            if (res.status === 419) {
                alert('Session expired. Please refresh the page and try again.');
                return;
            }

            const data = await res.json().catch(() => null);

            if (res.ok && data?.url) {
                form.setData('thumbnail_url', data.url);
            } else {
                const errorMsg = data?.errors?.thumbnail?.[0] || data?.message || `Upload failed with status ${res.status}`;
                alert(errorMsg);
            }
        } catch (err: any) {
            alert(err?.message || 'Upload error');
        } finally {
            if (e.target) e.target.value = '';
            setUploadingThumb(false);
        }
    };

    const handleVnUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingVn(true);
        const fd = new FormData();
        fd.append('image', file);

        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch('/admin/templates/upload-vn-image', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrf || '',
                    'Accept': 'application/json',
                },
                body: fd,
            });

            if (res.status === 419) {
                alert('Session expired. Please refresh the page and try again.');
                return;
            }

            const data = await res.json().catch(() => null);

            if (res.ok && data?.url) {
                form.setData('vn_image_url', data.url);
            } else {
                const errorMsg = data?.errors?.image?.[0] || data?.message || `Upload failed with status ${res.status}`;
                alert(errorMsg);
            }
        } catch (err: any) {
            alert(err?.message || 'Upload error. File may be too large.');
        } finally {
            if (e.target) e.target.value = '';
            setUploadingVn(false);
        }
    };

    const applyFilter = (cat?: string, q?: string) => {
        const categoryVal = cat !== undefined ? cat : selectedCategory;
        const searchVal = q !== undefined ? q : search;
        router.get('/admin/templates', {
            category: categoryVal === 'All' ? '' : categoryVal,
            search: searchVal || '',
        }, { preserveState: true });
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <AdminLayout admin={admin} title="CapCut Video Templates">
            <Head title="CapCut Video Templates - Admin" />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                                <Film size={12} /> Mobile Reels / CapCut
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>
                            CapCut Video Templates
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                            Upload mobile 9:16 videos and direct CapCut template links for users to use in 1 tap.
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        <Plus size={18} />
                        Add New Template
                    </button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Templates</span>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                                <Video size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-black mt-2 text-white">{stats.total}</p>
                    </div>

                    <div className="p-4 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active</span>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                                <CheckCircle size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-black mt-2 text-emerald-400">{stats.active}</p>
                    </div>

                    <div className="p-4 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">CapCut Uses</span>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-500/10 text-pink-400">
                                <Flame size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-black mt-2 text-pink-400">{stats.total_uses.toLocaleString()}</p>
                    </div>

                    <div className="p-4 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Video Views</span>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-400">
                                <Eye size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-black mt-2 text-amber-400">{stats.total_views.toLocaleString()}</p>
                    </div>
                </div>

                {/* Main Content Grid: Preview on Left, List on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Live Mobile Screen Simulator Preview (4 cols) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6 p-4 rounded-2xl border flex flex-col items-center"
                            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                            <div className="w-full flex items-center justify-between mb-3 px-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                                    <Smartphone size={14} className="text-indigo-400" />
                                    <span>Instagram-Style Preview</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                    9:16 Vertical
                                </span>
                            </div>

                            {previewTemplate ? (
                                <div className="relative w-[260px] h-[490px] rounded-[36px] overflow-hidden bg-black shadow-2xl border-[6px] border-slate-800 flex flex-col justify-between">
                                    {/* Video / Thumbnail Player */}
                                    <div className="absolute inset-0 z-0 bg-slate-950">
                                        {previewTemplate.video_url ? (
                                            <video
                                                ref={videoRef}
                                                key={previewTemplate.video_url}
                                                src={previewTemplate.video_url}
                                                poster={previewTemplate.thumbnail_url}
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                loop
                                                muted={isMuted}
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={previewTemplate.thumbnail_url}
                                                alt={previewTemplate.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        {/* Subtle gradient vignette */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />
                                    </div>

                                    {/* Phone Top Notch / Header Overlay */}
                                    <div className="relative z-10 pt-3 px-4 flex items-center justify-between text-white text-xs">
                                        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-medium">
                                            <Film size={10} className="text-pink-400" />
                                            <span>CapCut</span>
                                        </div>
                                        <button
                                            onClick={() => setIsMuted(!isMuted)}
                                            className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
                                        >
                                            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                        </button>
                                    </div>

                                    {/* Center Play/Pause button on tap */}
                                    <div
                                        className="relative z-10 flex-1 flex items-center justify-center cursor-pointer"
                                        onClick={togglePlay}
                                    >
                                        {!isPlaying && (
                                            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
                                                <Play size={24} className="ml-1" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone Bottom Instagram/TikTok Reel Details */}
                                    <div className="relative z-10 p-4 space-y-2.5 text-white">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/80 text-white">
                                                    {previewTemplate.category}
                                                </span>
                                                {previewTemplate.duration && (
                                                    <span className="text-[10px] text-slate-300 font-mono">
                                                        {previewTemplate.duration}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-sm leading-tight drop-shadow-md line-clamp-1">
                                                {previewTemplate.title}
                                            </h3>
                                            {previewTemplate.description && (
                                                <p className="text-[11px] text-slate-200 line-clamp-2 mt-0.5 opacity-90 drop-shadow">
                                                    {previewTemplate.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Use This Template Button */}
                                        <div className="pt-1">
                                            <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 flex items-center justify-center gap-1.5 text-white font-bold text-xs shadow-lg shadow-pink-500/30">
                                                <Sparkles size={13} />
                                                <span>Use This Template</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1.5 px-0.5">
                                                <span>🔥 {previewTemplate.use_count.toLocaleString()} uses</span>
                                                <span>👁️ {previewTemplate.views_count.toLocaleString()} views</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-[260px] h-[490px] rounded-[36px] border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs p-6 text-center">
                                    <Film size={32} className="mb-2 opacity-40" />
                                    No template selected for preview
                                </div>
                            )}

                            {previewTemplate && (
                                <div className="mt-3 text-center">
                                    <a
                                        href={previewTemplate.capcut_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        <ExternalLink size={12} />
                                        Test CapCut Target Link
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Templates List & Controls (8 cols) */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* Filter Bar */}
                        <div className="p-4 rounded-2xl border space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && applyFilter(undefined, search)}
                                        placeholder="Search templates by title or tag..."
                                        className="w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:border-indigo-500"
                                        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    />
                                </div>
                                <button
                                    onClick={() => applyFilter(undefined, search)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                                >
                                    Filter
                                </button>
                            </div>

                            {/* Category Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                {['All', ...CATEGORY_PRESETS].map((cat) => {
                                    const active = selectedCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                applyFilter(cat, search);
                                            }}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                                active
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Templates List Table / Cards */}
                        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                            {templates.data.length > 0 ? (
                                <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                    {templates.data.map((tpl) => (
                                        <div
                                            key={tpl.id}
                                            onClick={() => setPreviewTemplate(tpl)}
                                            className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors cursor-pointer hover:bg-slate-800/40 ${
                                                previewTemplate?.id === tpl.id ? 'bg-indigo-500/10' : ''
                                            }`}
                                        >
                                            {/* Left Thumbnail & Info */}
                                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                {/* 9:16 aspect thumbnail */}
                                                <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0 group">
                                                    <img
                                                        src={tpl.thumbnail_url}
                                                        alt={tpl.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Play size={16} className="text-white fill-white" />
                                                    </div>
                                                    {tpl.duration && (
                                                        <div className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] text-white font-mono">
                                                            {tpl.duration}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                                                            {tpl.category}
                                                        </span>
                                                        {tpl.is_featured && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                                                                FEATURED
                                                            </span>
                                                        )}
                                                        {tpl.is_vn && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                                VN TEMPLATE
                                                            </span>
                                                        )}
                                                        <span className={`w-2 h-2 rounded-full ${tpl.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                                    </div>

                                                    <h4 className="font-bold text-sm text-white mt-1 truncate">
                                                        {tpl.title}
                                                    </h4>

                                                    <p className="text-xs text-slate-400 truncate mt-0.5">
                                                        {tpl.description || 'No description'}
                                                    </p>

                                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
                                                        <span className="text-rose-400 font-semibold">🔥 {tpl.use_count.toLocaleString()} uses</span>
                                                        <span>👁️ {tpl.views_count.toLocaleString()} views</span>
                                                        <span className="text-slate-500 truncate max-w-[150px]">
                                                            {tpl.capcut_url}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleToggle(tpl.id)}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                        tpl.is_active
                                                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                    }`}
                                                >
                                                    {tpl.is_active ? 'Active' : 'Inactive'}
                                                </button>

                                                <button
                                                    onClick={() => openEdit(tpl)}
                                                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-indigo-600 transition-colors"
                                                    title="Edit Template"
                                                >
                                                    <Edit size={15} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(tpl.id, tpl.title)}
                                                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                                                    title="Delete Template"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <Video size={40} className="mx-auto mb-3 opacity-30 text-indigo-400" />
                                    <h4 className="text-base font-bold text-white">No Templates Found</h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        Upload your first CapCut mobile video template to display inside the mobile app!
                                    </p>
                                    <button
                                        onClick={openCreate}
                                        className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                                    >
                                        Create Template
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {(creating || editing) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
                    <div
                        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                    >
                        {/* Pinned Sticky Header */}
                        <div
                            className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
                            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                                    <Film size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                                        {editing ? 'Edit Video Template' : 'Add New CapCut Video Template'}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {editing ? 'Update template details and assets' : 'Configure video, thumbnail, and action links'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form wrapping body and pinned footer */}
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                            {/* Scrollable Content Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                                {Object.keys(form.errors).length > 0 && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-1">
                                        <div className="font-bold flex items-center gap-1.5">
                                            <AlertCircle size={14} className="text-red-400" />
                                            Please correct the following errors:
                                        </div>
                                        <ul className="list-disc list-inside space-y-0.5 text-red-400 pl-1">
                                            {Object.entries(form.errors).map(([field, err]) => (
                                                <li key={field}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                        Template Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                        placeholder="e.g. Cinematic Travel Reel 2026 / SlowMo Beat"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-indigo-500 transition-colors"
                                        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        required
                                    />
                                    {form.errors.title && <p className="text-xs text-red-400 mt-1">{form.errors.title}</p>}
                                </div>

                                {/* Category & Duration */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                            Category *
                                        </label>
                                        <select
                                            value={form.data.category}
                                            onChange={(e) => form.setData('category', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-indigo-500 transition-colors"
                                            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        >
                                            {CATEGORY_PRESETS.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                            Duration (e.g. 0:15 / 0:30)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.duration}
                                            onChange={(e) => form.setData('duration', e.target.value)}
                                            placeholder="0:15"
                                            className="w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-indigo-500 transition-colors"
                                            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        />
                                    </div>
                                </div>

                                {/* CapCut Link */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1 flex items-center justify-between">
                                        <span>CapCut Template URL *</span>
                                        <span className="text-[10px] text-indigo-400 font-medium">Redirects to CapCut App</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.capcut_url}
                                        onChange={(e) => form.setData('capcut_url', e.target.value)}
                                        placeholder="https://www.capcut.com/template-detail/..."
                                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-indigo-500 transition-colors"
                                        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        required
                                    />
                                    {form.errors.capcut_url && <p className="text-xs text-red-400 mt-1">{form.errors.capcut_url}</p>}
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Provide the web link or deep link to the CapCut template. When user taps "Use This Template", this link is opened in CapCut.
                                    </p>
                                </div>

                                {/* Video Upload or Direct URL */}
                                <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold uppercase text-slate-300 flex items-center gap-1.5">
                                            <Video size={14} className="text-indigo-400" />
                                            9:16 Video File or Direct Video URL *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => videoInputRef.current?.click()}
                                            disabled={uploadingVideo}
                                            className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors font-medium shadow-sm disabled:opacity-50"
                                        >
                                            {uploadingVideo ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                                            Upload Video (MP4)
                                        </button>
                                    </div>

                                    <input
                                        type="file"
                                        ref={videoInputRef}
                                        onChange={handleVideoUpload}
                                        accept="video/*"
                                        className="hidden"
                                    />

                                    <input
                                        type="text"
                                        value={form.data.video_url}
                                        onChange={(e) => form.setData('video_url', e.target.value)}
                                        placeholder="https://... / video.mp4"
                                        className="w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:border-indigo-500"
                                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        required
                                    />
                                    {form.errors.video_url && <p className="text-xs text-red-400 mt-1">{form.errors.video_url}</p>}

                                    {form.data.video_url && (
                                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                                            <Check size={14} /> Video URL attached
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Upload or Direct URL */}
                                <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold uppercase text-slate-300 flex items-center gap-1.5">
                                            <ImageIcon size={14} className="text-pink-400" />
                                            Cover Thumbnail Image *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => thumbInputRef.current?.click()}
                                            disabled={uploadingThumb}
                                            className="text-xs px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-1.5 transition-colors font-medium shadow-sm disabled:opacity-50"
                                        >
                                            {uploadingThumb ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                                            Upload Image
                                        </button>
                                    </div>

                                    <input
                                        type="file"
                                        ref={thumbInputRef}
                                        onChange={handleThumbUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />

                                    <input
                                        type="text"
                                        value={form.data.thumbnail_url}
                                        onChange={(e) => form.setData('thumbnail_url', e.target.value)}
                                        placeholder="https://... / cover.jpg"
                                        className="w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:border-indigo-500"
                                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        required
                                    />
                                    {form.errors.thumbnail_url && <p className="text-xs text-red-400 mt-1">{form.errors.thumbnail_url}</p>}

                                    {form.data.thumbnail_url && (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={form.data.thumbnail_url}
                                                alt="Preview"
                                                className="w-12 h-16 rounded-lg object-cover border border-slate-700"
                                            />
                                            <span className="text-xs text-slate-400">Thumbnail preview</span>
                                        </div>
                                    )}
                                </div>

                                {/* VN Video Editor Toggle & Additional Image Upload */}
                                <div
                                    className="p-4 rounded-xl border space-y-3 transition-colors"
                                    style={{
                                        background: form.data.is_vn ? 'rgba(147, 51, 234, 0.08)' : 'var(--color-surface-2)',
                                        borderColor: form.data.is_vn ? 'rgba(147, 51, 234, 0.4)' : 'var(--color-border)',
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                                                    VN Template Feature
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                    Swipe-Left Image
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Turn this <strong>ON</strong> if this template has a VN Code / Preset / Tutorial image. In the mobile app, when users open this template and swipe left on the video, this image appears.
                                            </p>
                                        </div>

                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={form.data.is_vn}
                                                onChange={(e) => form.setData('is_vn', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    {/* If VN Option is ON, reveal Image Upload field */}
                                    {form.data.is_vn && (
                                        <div className="pt-3 border-t border-purple-500/20 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold uppercase text-purple-300 flex items-center gap-1.5">
                                                    <ImageIcon size={14} className="text-purple-400" />
                                                    VN Template Image / QR Code *
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => vnInputRef.current?.click()}
                                                    disabled={uploadingVn}
                                                    className="text-xs px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors font-medium shadow-sm disabled:opacity-50"
                                                >
                                                    {uploadingVn ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                                                    Upload VN Image
                                                </button>
                                            </div>

                                            <input
                                                type="file"
                                                ref={vnInputRef}
                                                onChange={handleVnUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />

                                            <input
                                                type="text"
                                                value={form.data.vn_image_url}
                                                onChange={(e) => form.setData('vn_image_url', e.target.value)}
                                                placeholder="https://... / vn_preset_qr.png or click Upload VN Image"
                                                className="w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:border-purple-500"
                                                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                                required={form.data.is_vn}
                                            />
                                            {form.errors.vn_image_url && <p className="text-xs text-red-400 mt-1">{form.errors.vn_image_url}</p>}

                                            {form.data.vn_image_url && (
                                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/25">
                                                    <img
                                                        src={form.data.vn_image_url}
                                                        alt="VN Image Preview"
                                                        className="w-12 h-16 rounded-lg object-cover border border-purple-500/40"
                                                    />
                                                    <div className="text-xs space-y-0.5">
                                                        <span className="text-purple-200 font-semibold flex items-center gap-1">
                                                            <Check size={13} className="text-emerald-400" /> VN Image Attached
                                                        </span>
                                                        <p className="text-[11px] text-slate-400">
                                                            When opened on the mobile app, swiping left will show this full-size image.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                        Description / Caption
                                    </label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        rows={2}
                                        placeholder="Write details about the template music, photos required, or style..."
                                        className="w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:border-indigo-500"
                                        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                        Tags (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.tags}
                                        onChange={(e) => form.setData('tags', e.target.value)}
                                        placeholder="reels, beat, trending, viral"
                                        className="w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:border-indigo-500"
                                        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                {/* Toggles */}
                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_featured}
                                            onChange={(e) => form.setData('is_featured', e.target.checked)}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                                        />
                                        <span>Featured Template</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_active}
                                            onChange={(e) => form.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                                        />
                                        <span>Active (Visible in App)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Pinned Sticky Footer */}
                            <div
                                className="flex items-center justify-end gap-3 px-6 py-3.5 border-t flex-shrink-0"
                                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}
                            >
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {editing ? 'Update Template' : 'Create Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
