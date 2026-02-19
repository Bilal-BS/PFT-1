import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Edit3, Trash2, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUserTable({ users, onEdit, onToggleStatus }) {
    const [search, setSearch] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredUsers = users.filter(user => {
        const matchSearch = user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase());
        const matchPlan = filterPlan === 'all' || user.plan_id === filterPlan;
        const matchStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.is_active) ||
            (filterStatus === 'inactive' && !user.is_active);
        return matchSearch && matchPlan && matchStatus;
    });

    const getPlanColor = (planId) => {
        if (!planId) return 'bg-slate-100 text-slate-500';
        if (planId.includes('pro')) return 'bg-violet-100 text-violet-700';
        if (planId.includes('premium')) return 'bg-indigo-100 text-indigo-700';
        if (planId.includes('basic')) return 'bg-blue-100 text-blue-700';
        return 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-slate-900">User Directory</h2>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-slate-700 w-64 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        />
                    </div>

                    <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5"
                    >
                        <option value="all">All Plans</option>
                        <option value="plan-free">Free</option>
                        <option value="plan-basic">Basic</option>
                        <option value="plan-premium">Premium</option>
                        <option value="plan-pro">Pro / Business</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">User Identity</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Plan & Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Usage Stats</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-600">
                                            {user.full_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 text-sm">{user.full_name || 'Anonymous'}</div>
                                            <div className="text-xs font-bold text-slate-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1.5 items-start">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getPlanColor(user.plan_id)}`}>
                                            {user.plans?.name || 'Unknown Plan'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            <span className="text-[10px] font-bold text-slate-400 capitalize">{user.status || 'No Sub'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex gap-4">
                                        <div>
                                            <div className="text-[10px] uppercase font-black text-slate-300 tracking-widest">Joined</div>
                                            <div className="text-sm font-bold text-slate-700">{new Date(user.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onToggleStatus(user.id, user.is_active)}
                                            className={`p-2 rounded-xl transition-all ${user.is_active ? 'text-emerald-300 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                        >
                                            {user.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
