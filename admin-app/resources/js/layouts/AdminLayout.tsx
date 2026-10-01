import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Layers, Tag, Unlock, LogOut, Menu, X,
    Sparkles, ChevronRight, Bell, Users, Coins, Image as ImageIcon,
    Smartphone, Share2
} from 'lucide-react';

interface Admin { name: string; email: string; avatar?: string; }
interface Props { children: React.ReactNode; admin: Admin; title?: string; }

const navItems = [
    { href: '/admin/dashboard',        label: 'Dashboard',          icon: LayoutDashboard },
    { href: '/admin/prompts',          label: 'Prompts',            icon: Layers          },
    { href: '/admin/banners',          label: 'Top Banners',        icon: ImageIcon       },
    { href: '/admin/categories',       label: 'Categories',         icon: Tag             },
    { href: '/admin/users',            label: 'Users & Coins',      icon: Users           },
    { href: '/admin/notifications',    label: 'Push Notifications', icon: Bell            },
    { href: '/admin/settings/rewards', label: 'Reward Settings',    icon: Coins           },
    { href: '/admin/settings/app',     label: 'App Version',        icon: Smartphone      },
    { href: '/admin/settings/social',  label: 'Social Channels',    icon: Share2          },
    { href: '/admin/unlocks',          label: 'Unlocks',            icon: Unlock          },
];

export default function AdminLayout({ children, admin, title }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const logout = () => router.post('/admin/logout');

    const isActive = (href: string) => url.startsWith(href);

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>

                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Prompt Saar</p>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Admin Panel</p>
                    </div>
                    <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X size={18} style={{ color: 'var(--color-muted)' }} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = isActive(href);
                        return (
                            <Link key={href} href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${active ? 'text-white' : 'hover:text-white'}`}
                                style={active
                                    ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }
                                    : { color: 'var(--color-muted)' }}>
                                <Icon size={18} className={active ? 'text-white' : 'group-hover:text-indigo-400'} />
                                {label}
                                {active && <ChevronRight size={14} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin profile */}
                <div className="px-4 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                            {admin.avatar
                                ? <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
                                : <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                    {admin.name.charAt(0).toUpperCase()}
                                  </span>
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{admin.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{admin.email}</p>
                        </div>
                        <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors" title="Logout">
                            <LogOut size={14} className="text-red-400" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center gap-4 px-6 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                    <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu size={20} style={{ color: 'var(--color-muted)' }} />
                    </button>
                    <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{title}</h1>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Server running" />
                        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Live</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
