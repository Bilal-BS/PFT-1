
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'
import {
    Users, CreditCard, Activity, ShieldAlert,
    Search, Filter, CheckCircle, Ban, ArrowUpRight,
    Zap, Clock, CheckCircle2, XCircle, Settings,
    Edit3, Save, Trash2, Plus
} from 'lucide-react'

export default function SuperAdmin() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ totalUsers: 0, activeSubs: 0, revenue: 0, requests: 0 })
    const [users, setUsers] = useState([])
    const [rates, setRates] = useState([])
    const [plans, setPlans] = useState([])
    const [requests, setRequests] = useState([])
    const [activeTab, setActiveTab] = useState('users') // 'users', 'requests', 'plans', 'rates'
    const [searchQuery, setSearchQuery] = useState('')
    const [editingPlan, setEditingPlan] = useState(null)

    useEffect(() => {
        fetchAdminData()
    }, [])

    const fetchAdminData = async () => {
        try {
            setLoading(true)

            const [profilesRes, statusesRes, subsRes, ratesRes, plansRes, reqRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('user_status').select('*'),
                supabase.from('subscriptions').select('*'),
                supabase.from('exchange_rates').select('*'),
                supabase.from('plans').select('*'),
                supabase.from('subscription_requests').select('*, profiles(full_name, email), plans(name)')
            ])

            setRates(ratesRes.data || [])
            setPlans(plansRes.data || [])
            setRequests(reqRes.data || [])

            const profiles = profilesRes.data
            const statuses = statusesRes.data
            const subs = subsRes.data

            // Combine user data
            const combinedUsers = profiles?.filter(p => p.role !== 'superadmin').map(p => {
                const status = statuses?.find(s => s.user_id === p.id) || { is_active: true }
                const sub = subs?.find(s => s.user_id === p.id) || { status: 'none', plan_id: 'plan-free' }
                return { ...p, ...status, ...sub }
            })

            setUsers(combinedUsers || [])

            setStats({
                totalUsers: combinedUsers?.length || 0,
                activeSubs: subs?.filter(s => s.status === 'active').length || 0,
                revenue: (subs?.length || 0) * 1500, // Mock calc
                requests: reqRes.data?.filter(r => r.status === 'pending').length || 0
            })

        } catch (error) {
            console.error("Admin Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleApproveRequest = async (request) => {
        // 1. Update subscription
        await supabase.from('subscriptions')
            .update({ plan_id: request.plan_id, status: 'active', updated_at: new Date().toISOString() })
            .eq('user_id', request.user_id)

        // 2. Mark request as approved
        await supabase.from('subscription_requests')
            .update({ status: 'approved', processed_at: new Date().toISOString() })
            .eq('id', request.id)

        fetchAdminData()
    }

    const handleRejectRequest = async (requestId) => {
        await supabase.from('subscription_requests')
            .update({ status: 'rejected', processed_at: new Date().toISOString() })
            .eq('id', requestId)

        fetchAdminData()
    }

    const handleUpdatePlan = async () => {
        const { error } = await supabase.from('plans').update(editingPlan).eq('id', editingPlan.id)
        if (!error) {
            setEditingPlan(null)
            fetchAdminData()
        }
    }

    const toggleUserActiveState = async (userId, currentState) => {
        await supabase.from('user_status').update({ is_active: !currentState }).eq('user_id', userId)
        fetchAdminData()
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-[1700px] mx-auto px-6 md:px-10 pt-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20">
                                <ShieldAlert size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.3em]">Root Command System</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">System Admin</h1>
                        <p className="text-slate-500 mt-2 font-bold text-lg">Manage users, approve memberships, and calibrate platform logic.</p>
                    </div>
                </div>

                {/* Quick Stats - Thinner gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <AdminStatCard icon={<Users size={18} />} label="Nodes Connected" value={stats.totalUsers} color="indigo" />
                    <AdminStatCard icon={<Clock size={18} />} label="Pending Orders" value={stats.requests} color="amber" />
                    <AdminStatCard icon={<Zap size={18} />} label="Active SaaS" value={stats.activeSubs} color="emerald" />
                    <AdminStatCard icon={<CreditCard size={18} />} label="Est. Yield" value={formatCurrency(stats.revenue)} color="blue" />
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {['users', 'requests', 'plans', 'rates'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'}`}
                        >
                            {tab.replace('_', ' ')}
                            {tab === 'requests' && stats.requests > 0 && <span className="ml-2 w-1.5 h-1.5 bg-rose-500 rounded-full inline-block" />}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">

                    {/* User Management Tab */}
                    {activeTab === 'users' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-900">Node Directory</h2>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Filter by name, email or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold text-slate-700 w-80 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Identity Node</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Plan Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Logic Access</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Emergency Ctrl</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                                            <tr key={user.id} className="hover:bg-slate-50/30 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-lg">
                                                            {user.full_name?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-900 text-base">{user.full_name || 'Anonymous User'}</div>
                                                            <div className="text-xs font-bold text-slate-400 mt-0.5">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest w-fit">
                                                            {user.plan_id?.replace('plan-', '')}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 italic">Subscription ID: {user.id.slice(0, 8)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse shadow-lg shadow-emerald-200' : 'bg-rose-500 shadow-lg shadow-rose-200'}`} />
                                                        <span className={`text-[11px] font-black uppercase tracking-widest ${user.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {user.is_active ? 'Active Connection' : 'Access Restricted'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => toggleUserActiveState(user.user_id || user.id, user.is_active)}
                                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.is_active ? 'bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white hover:shadow-xl hover:shadow-rose-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-xl hover:shadow-emerald-100'}`}
                                                    >
                                                        {user.is_active ? 'Revoke Logic' : 'Grant Access'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Subscription Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="p-8 border-b border-slate-50">
                                <h2 className="text-2xl font-black text-slate-900">SaaS Upgrade Requests</h2>
                                <p className="text-sm font-bold text-slate-400 mt-1">Pending membership Tier elevations awaiting your validation.</p>
                            </div>
                            <div className="p-8">
                                {requests.filter(r => r.status === 'pending').length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="p-6 bg-slate-50 rounded-[32px] mb-6 text-slate-300">
                                            <CheckCircle2 size={64} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">All Nodes are in Sync</h3>
                                        <p className="text-slate-400 font-bold mt-2">No pending subscription requests found in current session.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {requests.filter(r => r.status === 'pending').map(req => (
                                            <div key={req.id} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[32px] flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all duration-500">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm font-black text-2xl group-hover:scale-110 transition-transform">
                                                        {req.profiles?.full_name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1.5">
                                                            <span className="text-[10px] font-black uppercase text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm">Upgrade Required</span>
                                                            <span className="text-[10px] font-bold text-slate-400">{new Date(req.requested_at).toLocaleString()}</span>
                                                        </div>
                                                        <h4 className="text-xl font-black text-slate-900">{req.profiles?.full_name}</h4>
                                                        <p className="text-sm font-bold text-slate-500 mt-1">Requesting elevation to <span className="text-indigo-600">{req.plans?.name} Plan</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleRejectRequest(req.id)}
                                                        className="p-4 bg-white text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <XCircle size={24} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveRequest(req)}
                                                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center gap-3"
                                                    >
                                                        <CheckCircle2 size={20} />
                                                        Approve Upgrade
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Plan Management Tab */}
                    {activeTab === 'plans' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">SaaS Framework</h2>
                                    <p className="text-sm font-bold text-slate-400 mt-1">Calibrate membership pricing and node limitations.</p>
                                </div>
                                <button className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"><Plus size={20} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
                                {plans.map(plan => (
                                    <div key={plan.id} className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl transition-all h-[450px]">
                                        {editingPlan?.id === plan.id ? (
                                            <div className="space-y-6 animate-in fade-in">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Friendly Name</label>
                                                    <input
                                                        type="text"
                                                        value={editingPlan.name}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                                        className="w-full bg-white border border-indigo-100 rounded-2xl px-5 py-3 font-black text-slate-900 text-lg outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Price (LKR)</label>
                                                    <input
                                                        type="number"
                                                        value={editingPlan.price}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                                                        className="w-full bg-white border border-indigo-100 rounded-2xl px-5 py-3 font-black text-slate-900 text-lg outline-none"
                                                    />
                                                </div>
                                                <div className="flex gap-3 pt-4">
                                                    <button onClick={handleUpdatePlan} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Save Node</button>
                                                    <button onClick={() => setEditingPlan(null)} className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm"><Zap size={24} /></div>
                                                        <button onClick={() => setEditingPlan(plan)} className="p-3 bg-white text-slate-300 hover:text-indigo-600 rounded-xl transition-all group-hover:shadow-sm"><Edit3 size={18} /></button>
                                                    </div>
                                                    <h3 className="text-3xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Base Configuration</p>
                                                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-10">
                                                        {formatCurrency(plan.price)}
                                                        <span className="text-sm text-slate-300 font-bold tracking-normal ml-2">/mo</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 bg-white/50 p-4 rounded-2xl">
                                                        <span>Accounts</span>
                                                        <span className="text-slate-900 font-black">{plan.features?.max_accounts || 0} Nodes</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 bg-white/50 p-4 rounded-2xl">
                                                        <span>Stability Engine</span>
                                                        <span className="text-emerald-500 font-black uppercase tracking-widest">Active</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Exchange Rates Tab */}
                    {activeTab === 'rates' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Conversion Matrix</h2>
                                    <p className="text-sm font-bold text-slate-400 mt-1">Calibrate the global exchange parity for all treasury nodes.</p>
                                </div>
                                <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest animate-pulse">Live Feed Override</div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {rates.map(rate => (
                                        <div key={rate.id} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all duration-500">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-lg text-slate-900 shadow-sm border border-slate-50">
                                                    {rate.from_currency}
                                                </div>
                                                <ArrowUpRight className="text-slate-300" size={20} />
                                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-xl shadow-indigo-100">
                                                    {rate.to_currency}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1.5">Node Weight</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        defaultValue={rate.rate}
                                                        onBlur={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val)) {
                                                                supabase.from('exchange_rates').update({ rate: val }).eq('id', rate.id).then(() => fetchAdminData());
                                                            }
                                                        }}
                                                        className="w-32 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-lg font-black text-slate-900 outline-none focus:border-indigo-600 transition-all text-right"
                                                    />
                                                    <button className="p-2.5 bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Save size={18} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function AdminStatCard({ icon, label, value, color }) {
    const colors = {
        indigo: 'bg-indigo-600 text-white shadow-indigo-200',
        emerald: 'bg-emerald-600 text-white shadow-emerald-200',
        blue: 'bg-blue-600 text-white shadow-blue-200',
        amber: 'bg-amber-500 text-white shadow-amber-200'
    }

    const iconColors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600'
    }

    return (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 group hover:-translate-y-1 transition-all duration-500 hover:shadow-xl hover:border-slate-50">
            <div className={`w-11 h-11 rounded-xl ${iconColors[color]} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <p className="text-3xl font-black text-slate-900 mt-1 tracking-tighter">{value}</p>
        </div>
    )
}
