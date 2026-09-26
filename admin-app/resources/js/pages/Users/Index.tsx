import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Users, Search, Coins, Plus, Minus, CheckCircle,
    X, AlertCircle, ArrowUpRight, ArrowDownLeft, Shield
} from 'lucide-react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    device_id?: string;
    role: string;
    coin_balance: number;
    ads_watched_today: number;
    daily_limit: number;
    total_coins_earned: number;
    total_coins_spent: number;
    created_at: string;
}

interface Admin {
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    users: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
    admin: Admin;
}

const inputStyle = {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
};

export default function UsersIndex({ users, filters, admin }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

    // Coin adjustment modal form
    const { data, setData, post, processing, reset, errors } = useForm({
        amount: 50,
        reason: 'Promotional bonus',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search }, { preserveState: true });
    };

    const openAdjustModal = (user: UserItem) => {
        setSelectedUser(user);
        reset();
    };

    const closeAdjustModal = () => {
        setSelectedUser(null);
        reset();
    };

    const submitAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        post(`/admin/users/${selectedUser.id}/adjust-coins`, {
            onSuccess: () => {
                closeAdjustModal();
            },
        });
    };

    return (
        <AdminLayout admin={admin} title="Users & Coin Balances">
            <Head title="User Coin Management" />

            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        User Accounts & Coin Ledgers
                    </h2>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                        Manage {users.total} active accounts, monitor ad consumption, and make verified coin adjustments.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search name, email, device ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl text-sm outline-none w-64 md:w-80"
                            style={inputStyle}
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                        style={{ background: '#6366f1' }}
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase font-semibold" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                            <tr>
                                <th className="px-5 py-3.5">User / Identifier</th>
                                <th className="px-5 py-3.5">Role</th>
                                <th className="px-5 py-3.5">Current Balance</th>
                                <th className="px-5 py-3.5">Today's Ads</th>
                                <th className="px-5 py-3.5">Total Earned</th>
                                <th className="px-5 py-3.5">Total Spent</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center" style={{ color: 'var(--color-muted)' }}>
                                        No users matching the query found.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                                                {u.name}
                                            </div>
                                            <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                                {u.email}
                                            </div>
                                            {u.device_id && (
                                                <div className="text-[11px] font-mono text-indigo-400/80">
                                                    ID: {u.device_id.substring(0, 16)}...
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                                {u.role === 'admin' && <Shield size={10} />}
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm">
                                                <span>🪙</span>
                                                <span>{u.coin_balance.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-xs">
                                                <span className="font-semibold text-slate-200">
                                                    {u.ads_watched_today}
                                                </span>
                                                <span className="text-slate-500"> / {u.daily_limit} ads</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-emerald-400 font-medium text-xs flex items-center gap-1">
                                                <ArrowUpRight size={13} />
                                                +{u.total_coins_earned.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-rose-400 font-medium text-xs flex items-center gap-1">
                                                <ArrowDownLeft size={13} />
                                                -{u.total_coins_spent.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openAdjustModal(u)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors"
                                            >
                                                Adjust Coins
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="p-4 flex items-center justify-between border-t border-slate-800 text-xs" style={{ color: 'var(--color-muted)' }}>
                        <span>Page {users.current_page} of {users.last_page}</span>
                        <div className="flex gap-2">
                            {Array.from({ length: users.last_page }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => router.get('/admin/users', { page: p, search }, { preserveState: true })}
                                    className={`w-7 h-7 rounded-lg font-medium ${p === users.current_page ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Adjust Coins Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                                    🪙
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                                        Adjust User Coin Balance
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                        {selectedUser.name} ({selectedUser.email})
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeAdjustModal} className="text-slate-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submitAdjustment} className="space-y-4">
                            {/* Current Balance */}
                            <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'var(--color-surface-2)' }}>
                                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Current Balance:</span>
                                <span className="font-bold text-amber-400 text-sm">🪙 {selectedUser.coin_balance}</span>
                            </div>

                            {/* Adjustment Amount */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Adjustment Amount (+ to add, - to deduct)
                                </label>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={e => setData('amount', parseInt(e.target.value, 10) || 0)}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold outline-none"
                                    style={inputStyle}
                                    placeholder="e.g. 50 or -20"
                                />
                                {errors.amount && <p className="mt-1 text-xs text-red-400">{errors.amount}</p>}
                            </div>

                            {/* Projected New Balance */}
                            <div className="text-xs text-slate-400 flex items-center justify-between px-1">
                                <span>Projected New Balance:</span>
                                <span className="font-bold text-white">
                                    🪙 {Math.max(0, selectedUser.coin_balance + data.amount)}
                                </span>
                            </div>

                            {/* Reason / Reference */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                    Reason / Description (Saved to Ledger) *
                                </label>
                                <input
                                    type="text"
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                    style={inputStyle}
                                    placeholder="e.g. Promotional bonus, Compensation, Error refund"
                                />
                                {errors.reason && <p className="mt-1 text-xs text-red-400">{errors.reason}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeAdjustModal}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-300"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || data.amount === 0}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                >
                                    {processing ? 'Processing...' : 'Confirm Adjustment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
