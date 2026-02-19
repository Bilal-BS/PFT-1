
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'
import {
    Users, CreditCard, Activity, ShieldAlert,
    Search, Filter, CheckCircle, Ban, ArrowUpRight,
    Zap, Clock, CheckCircle2, XCircle, Settings,
    Edit3, Save, Trash2, Plus, TrendingUp, TrendingDown,
    AlertTriangle, BarChart3, PieChart
} from 'lucide-react'

// Modular Components
import AdminStatCard from '../../components/admin/AdminStats'
import { RevenueChart, UserGrowthChart } from '../../components/admin/AdminCharts'
import AdminUserTable from '../../components/admin/AdminUserTable'
import AdminSubscriptionTable from '../../components/admin/AdminSubscriptionTable'
import AdminExpiryWidget from '../../components/admin/AdminExpiryWidget'

export default function SuperAdmin() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalUsers: 0, activeUsers: 0, newUsers: 0,
        totalSubs: 0, revenue: 0, expiredSubs: 0,
        expiringSoon: 0, growth: 0
    })
    const [users, setUsers] = useState([])
    const [rates, setRates] = useState([])
    const [plans, setPlans] = useState([])
    const [requests, setRequests] = useState([])
    const [activeTab, setActiveTab] = useState('dashboard') // dashboard, users, subscriptions, analytics, settings
    const [editingSubscription, setEditingSubscription] = useState(null)

    useEffect(() => {
        fetchAdminData()
    }, [])

    const fetchAdminData = async () => {
        try {
            setLoading(true)

            const [profilesRes, statusesRes, subsRes, ratesRes, plansRes, reqRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('user_status').select('*'),
                supabase.from('subscriptions').select('*, plans(*)'),
                supabase.from('exchange_rates').select('*'),
                supabase.from('plans').select('*'),
                supabase.from('subscription_requests').select('*, profiles(full_name, email), plans(name)')
            ])

            setRates(ratesRes.data || [])
            setPlans(plansRes.data || [])
            setRequests(reqRes.data || [])

            const profiles = profilesRes.data || []
            const statuses = statusesRes.data || []
            const subs = subsRes.data || []

            // Combine user data
            const combinedUsers = profiles.filter(p => p.role !== 'superadmin').map(p => {
                const status = statuses.find(s => s.user_id === p.id) || { is_active: true }
                const sub = subs.find(s => s.user_id === p.id) || { status: 'none', plan_id: 'plan-free' }
                return { ...p, ...status, ...sub }
            })

            setUsers(combinedUsers)

            // Calculate Stats
            const activeUsers = combinedUsers.filter(u => u.is_active).length
            const totalSubs = subs.filter(s => s.status === 'active').length
            const expiredSubs = subs.filter(s => s.status === 'expired').length

            // Mock Revenue Calculation (real app would sum transaction history)
            const revenue = subs.reduce((acc, sub) => {
                const plan = plansRes.data.find(p => p.id === sub.plan_id)
                return acc + (plan?.price || 0)
            }, 0)

            setStats({
                totalUsers: combinedUsers.length,
                activeUsers,
                newUsers: combinedUsers.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, // Last 30 days
                totalSubs,
                revenue,
                expiredSubs,
                expiringSoon: 5, // Mock
                growth: 12.5 // Mock
            })

        } catch (error) {
            console.error("Admin Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateSubscription = async () => {
        if (!editingSubscription) return

        const { error } = await supabase.from('subscriptions')
            .upsert({
                user_id: editingSubscription.user_id,
                plan_id: editingSubscription.plan_id,
                status: editingSubscription.status,
                updated_at: new Date().toISOString()
            })

        if (error) {
            console.error("Failed to update subscription:", error)
            alert("Failed to update subscription.")
        } else {
            setEditingSubscription(null)
            fetchAdminData()
            alert("Subscription updated successfully.")
        }
    }

    const toggleUserActiveState = async (userId, currentState) => {
        await supabase.from('user_status').upsert({ user_id: userId, is_active: !currentState })
        fetchAdminData()
    }

    const handleApproveRequest = async (request) => {
        const confirmApi = window.confirm(`Approve upgrade to ${request.plans?.name} for ${request.profiles?.full_name}?`)
        if (!confirmApi) return

        setLoading(true)
        try {
            // 1. Update/Create Subscription
            const { error: subError } = await supabase.from('subscriptions')
                .upsert({
                    user_id: request.user_id,
                    plan_id: request.plan_id,
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
                    updated_at: new Date().toISOString()
                })

            if (subError) throw subError

            // 2. Update Request Status
            const { error: reqError } = await supabase.from('subscription_requests')
                .update({ status: 'approved', resolved_at: new Date().toISOString() })
                .eq('id', request.id)

            if (reqError) throw reqError

            alert("Request Approved & Subscription Updated!")
            fetchAdminData()
        } catch (error) {
            console.error("Approval Error:", error)
            alert("Failed to approve request: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRejectRequest = async (requestId) => {
        if (!window.confirm("Reject this request?")) return

        setLoading(true)
        try {
            const { error } = await supabase.from('subscription_requests')
                .update({ status: 'rejected', resolved_at: new Date().toISOString() })
                .eq('id', requestId)

            if (error) throw error

            alert("Request Rejected.")
            fetchAdminData()
        } catch (error) {
            console.error("Rejection Error:", error)
            alert("Failed to reject: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    // Mock Chart Data
    const revenueData = [
        { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 5000 },
        { name: 'Apr', value: 4500 }, { name: 'May', value: 6000 }, { name: 'Jun', value: 5500 },
    ]

    const growthData = [
        { name: 'Jan', users: 120 }, { name: 'Feb', users: 132 }, { name: 'Mar', users: 150 },
        { name: 'Apr', users: 180 }, { name: 'May', users: 220 }, { name: 'Jun', users: 250 },
    ]

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-[1700px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                            <ShieldAlert size={20} />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Super Admin Nexus</h1>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['dashboard', 'users', 'subscriptions', 'settings'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1700px] mx-auto px-6 md:px-10 pt-10 space-y-10">

                {/* 1. Dashboard Overview */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <AdminStatCard icon={<Users size={20} />} label="Total Users" value={stats.totalUsers} trend="up" trendValue={`${stats.growth}%`} color="indigo" />
                            <AdminStatCard icon={<Zap size={20} />} label="Active Subscriptions" value={stats.totalSubs} color="emerald" />
                            <AdminStatCard icon={<CreditCard size={20} />} label="Monthly Revenue" value={formatCurrency(stats.revenue)} trend="up" trendValue="8.2%" color="blue" />
                            <AdminStatCard icon={<Clock size={20} />} label="Expiring Soon" value={stats.expiringSoon} trend="down" trendValue="2" color="amber" />
                        </div>

                        {/* Revenue & Growth Graphs */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900">Revenue Analytics (MRR)</h3>
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp size={20} /></div>
                                </div>
                                <RevenueChart data={revenueData} />
                            </div>
                            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900">User Growth</h3>
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={20} /></div>
                                </div>
                                <UserGrowthChart data={growthData} />
                            </div>
                        </div>

                        {/* Subscription Overview Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
                            <div className="lg:col-span-2 h-full">
                                <AdminSubscriptionTable plans={plans} users={users} />
                            </div>
                            <div className="h-full">
                                <AdminExpiryWidget users={users} />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. User Management */}
                {activeTab === 'users' && (
                    <div className="animate-in fade-in duration-500">
                        <AdminUserTable
                            users={users}
                            onEdit={(user) => setEditingSubscription({ user_id: user.id || user.user_id, plan_id: user.plan_id, status: user.status })}
                            onToggleStatus={toggleUserActiveState}
                        />
                    </div>
                )}

                {/* 3. Subscriptions & Requests */}
                {activeTab === 'subscriptions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                        {/* Pending Requests */}
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 mb-6">Upgrade Requests</h3>
                            {requests.filter(r => r.status === 'pending').length === 0 ? (
                                <div className="text-center py-10 text-slate-400 font-bold">No pending requests</div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.filter(r => r.status === 'pending').map(req => (
                                        <div key={req.id} className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
                                            <div>
                                                <h4 className="font-black text-slate-900 text-lg">{req.profiles?.full_name}</h4>
                                                <p className="text-sm font-bold text-slate-500">Requesting <span className="text-indigo-600">{req.plans?.name}</span></p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRejectRequest(req.id)}
                                                    className="p-3 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                    title="Reject Request"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleApproveRequest(req)}
                                                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                                    title="Approve Request"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. Settings (Plans, Coupons, Logs - Placeholders) */}
                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
                        <div
                            onClick={() => alert("Manage Plans: This feature will allow modifying Plan prices and features. Coming soon!")}
                            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all cursor-pointer active:scale-95"
                        >
                            <div className="mb-6 p-4 bg-indigo-50 text-indigo-600 rounded-3xl w-fit"><CreditCard size={32} /></div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Manage Plans</h3>
                            <p className="text-slate-500 font-bold">Edit pricing and features for all 4 tiers.</p>
                        </div>
                        <div
                            onClick={() => alert("System Logs: Audit trails are currently being recorded in the database. UI Viewer coming soon.")}
                            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-emerald-100 transition-all cursor-pointer active:scale-95"
                        >
                            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-3xl w-fit"><Settings size={32} /></div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">System Logs</h3>
                            <p className="text-slate-500 font-bold">View audit trails and security events.</p>
                        </div>
                        <div
                            onClick={() => alert("Support Tickets: Ticket management module is under development.")}
                            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-amber-100 transition-all cursor-pointer active:scale-95"
                        >
                            <div className="mb-6 p-4 bg-amber-50 text-amber-600 rounded-3xl w-fit"><AlertTriangle size={32} /></div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Support Tickets</h3>
                            <p className="text-slate-500 font-bold">Manage help requests from users.</p>
                        </div>
                    </div>
                )}

            </div>

            {/* Edit Subscription Modal */}
            {editingSubscription && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-black text-slate-900 mb-6">Edit Subscription</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Plan Tier</label>
                                <select
                                    value={editingSubscription.plan_id || ''}
                                    onChange={(e) => setEditingSubscription({ ...editingSubscription, plan_id: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Status</label>
                                <select
                                    value={editingSubscription.status || 'active'}
                                    onChange={(e) => setEditingSubscription({ ...editingSubscription, status: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="trial">Trial</option>
                                    <option value="expired">Expired</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setEditingSubscription(null)}
                                className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black transition hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateSubscription}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
