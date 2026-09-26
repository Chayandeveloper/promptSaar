import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Sparkles, Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <>
            <Head title="Admin Login" />
            <div className="min-h-screen flex items-center justify-center p-4"
                style={{ background: 'radial-gradient(ellipse at top, #1a1a3e 0%, var(--color-bg) 60%)' }}>

                {/* Background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
                        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                </div>

                <div className="relative w-full max-w-md">
                    {/* Card */}
                    <div className="rounded-2xl p-8 shadow-2xl"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

                        {/* Logo */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                <Sparkles size={28} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Prompt Saar Admin</h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Sign in to your admin panel</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="admin@promptbaba.cloud"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                                        style={{
                                            background: 'var(--color-surface-2)',
                                            border: `1px solid ${errors.email ? '#ef4444' : 'var(--color-border)'}`,
                                            color: 'var(--color-text)',
                                        }}
                                        onFocus={e => (e.target.style.borderColor = '#6366f1')}
                                        onBlur={e => (e.target.style.borderColor = errors.email ? '#ef4444' : 'var(--color-border)')}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                                        style={{
                                            background: 'var(--color-surface-2)',
                                            border: `1px solid ${errors.password ? '#ef4444' : 'var(--color-border)'}`,
                                            color: 'var(--color-text)',
                                        }}
                                        onFocus={e => (e.target.style.borderColor = '#6366f1')}
                                        onBlur={e => (e.target.style.borderColor = errors.password ? '#ef4444' : 'var(--color-border)')}
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                {processing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <LogIn size={16} />
                                )}
                                {processing ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
