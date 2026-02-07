import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CURRENCIES, formatCurrency } from '../lib/utils'
import {
    Settings as SettingsIcon, Globe, Bell, Shield,
    Plus, Trash2, RefreshCw, Key, User, CreditCard,
    ArrowRight, ExternalLink, Zap, Star, ShieldCheck,
    Mail, Briefcase, CheckCircle2, Layout
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Settings() {
    const [profile, setProfile] = useState(null)
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        role: ''
    })

    useEffect(() => {
        fetchSettingsData()
    }, [])

    const fetchSettingsData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const [profileRes, subRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user.id).single()
            ])

            if (profileRes.data) {
                setProfile(profileRes.data)
                setFormData({
                    full_name: profileRes.data.full_name || '',
                    role: profileRes.data.role || ''
                })
            }
            setSubscription(subRes.data)
        } catch (error) {
            console.error('Settings load error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (field, value) => {
        setSaving(true)
        const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', profile.id)
        if (!error) {
            setProfile(prev => ({ ...prev, [field]: value }))
        }
        setSaving(false)
    }

    const handleSaveIdentity = async () => {
        setSaving(true)
        const { error } = await supabase.from('profiles').update({
            full_name: formData.full_name,
            role: formData.role
        }).eq('id', profile.id)

        if (!error) {
            setProfile(prev => ({ ...prev, ...formData }))
            setEditMode(false)
        }
        setSaving(false)
    }

    const handleUpgradePlan = async (planId) => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()

        // In real app, this would be a checkout redirect
        // For demo/base, we update the subscription record
        const { error } = await supabase
            .from('subscriptions')
            .update({ plan_id: planId })
            .eq('user_id', user.id)

        if (!error) {
            await fetchSettingsData()
        }
        setSaving(false)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white lg:pl-[280px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-900/10 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Core...</p>
            </div>
        </div>
    )

    const currentPlanId = subscription?.plan_id || 'plan-free'

    return (
        <div className="p-4 lg:p-8 space-y-8 bg-[#F9FAFB]">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20">
                            <SettingsIcon size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.3em]">System Architecture</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Preferences</h1>
                    <p className="text-slate-500 mt-2 font-bold text-lg">Manage your identity, regional logic, and subscription tier.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Left Column: Core Settings */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Regional Logic Segment */}
                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                    <Globe size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Regional Logic</h2>
                            </div>
                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">Global Sync Active</span>
                        </div>

                        <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 ml-1">Universal Base Currency</label>
                                    <div className="relative group">
                                        <select
                                            value={profile?.base_currency}
                                            onChange={(e) => handleUpdateProfile('base_currency', e.target.value)}
                                            className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-slate-700 outline-none focus:bg-white focus:border-indigo-100 transition shadow-inner appearance-none"
                                        >
                                            {CURRENCIES.map(c => (
                                                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <RefreshCw size={18} className="group-focus-within:animate-spin" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-indigo-600 text-white rounded-[32px] shadow-2xl shadow-indigo-600/20 flex flex-col justify-between h-full min-h-[140px]">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">System Standard Unit</span>
                                        <span className="text-4xl font-black block mt-1 tracking-tighter">{profile?.base_currency}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-indigo-100/60 leading-relaxed mt-4">All ledger aggregates are re-indexed to this unit in real-time.</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-4">
                                <Link
                                    to="/currencies"
                                    className="flex-1 flex items-center justify-between p-6 bg-slate-900 rounded-[28px] text-white hover:bg-slate-800 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <RefreshCw size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-base">Forex Revaluation</p>
                                            <p className="text-[10px] font-bold text-slate-400">Adjust session rates</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <div className="flex-1 p-6 bg-slate-50 rounded-[28px] flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-base text-slate-800 tracking-tight">ISO-27001 Logic</p>
                                        <p className="text-[10px] font-bold text-slate-400">Regulated Calculations</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Segment */}
                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                                <Key size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Security Protocol</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-[32px] border border-transparent hover:border-slate-200 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm"><Bell size={20} className="text-slate-400" /></div>
                                    <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">Inactive</span>
                                </div>
                                <h4 className="font-black text-slate-900 mb-1">Passkey Sync</h4>
                                <p className="text-xs font-bold text-slate-400 mb-6">Biometric authentication for large transfers.</p>
                                <button className="w-full py-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">Emergency Setup</button>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[32px] border border-indigo-100 shadow-xl shadow-indigo-100/20">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20"><ShieldCheck size={20} /></div>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>
                                </div>
                                <h4 className="font-black text-slate-900 mb-1">Data Residency</h4>
                                <p className="text-xs font-bold text-slate-400 mb-6">Encrypted nodes hosted in Sri Lanka West.</p>
                                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                                    Verified Compliant
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interface Architecture Segment */}
                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
                        {(subscription?.plans?.name !== 'Pro' && subscription?.plans?.name !== 'Professional' && subscription?.plans?.name !== 'Ultimate') && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-amber-100 flex flex-col items-center text-center max-w-xs animate-in fade-in zoom-in duration-300">
                                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 mb-4">
                                        <Star size={32} fill="currentColor" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 mb-2">Architect Mode Locked</h4>
                                    <p className="text-xs font-bold text-slate-400 mb-6 leading-relaxed">Upgrade to a Professional tier to unlock deep workspace customization and widget positioning.</p>
                                    <button
                                        onClick={() => document.getElementById('tier-section').scrollIntoView({ behavior: 'smooth' })}
                                        className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition shadow-xl"
                                    >
                                        Inspect Plans
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                    <Layout size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Interface Architecture</h2>
                            </div>
                            <span className="px-4 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">Pro Feature</span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 rounded-[40px] p-10 border border-slate-100">
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Architect Mode</h3>
                                <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-sm">
                                    Fine-tune your financial workspace. Adjust widget positions, custom labels, color accents, and aesthetic depth.
                                </p>
                            </div>
                            <Link
                                to="/dashboard?customize=true"
                                className="px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition shadow-2xl flex items-center gap-3 whitespace-nowrap active:scale-95"
                            >
                                <SettingsIcon size={18} />
                                Launch Designer
                            </Link>
                        </div>
                    </div>


                </div>

                {/* Right Column: Identity & Subscription */}
                <div className="space-y-10">

                    {/* Profile Identity Card */}
                    <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl shadow-indigo-900/10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl flex items-center justify-center font-black text-4xl shadow-2xl shadow-black/40 ring-4 ring-white/10 group-hover:scale-105 transition-all duration-500">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                                    Portal-v2.5
                                </div>
                            </div>

                            {editMode ? (
                                <div className="space-y-6 mb-10 animate-in fade-in slide-in-from-bottom-4">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-bold text-white outline-none focus:bg-white/10 focus:border-indigo-400 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Professional Role</label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-bold text-white outline-none focus:bg-white/10 focus:border-indigo-400 transition"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleSaveIdentity}
                                            disabled={saving}
                                            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Commit Changes'}
                                        </button>
                                        <button
                                            onClick={() => setEditMode(false)}
                                            className="px-6 py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-12">
                                    <h3 className="text-3xl font-black tracking-tight mb-2">{profile?.full_name || 'System User'}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-[0.2em]">{profile?.role || 'Stakeholder'}</span>
                                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Verified Access</span>
                                    </div>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="w-full mt-10 py-5 bg-white text-slate-900 rounded-[24px] font-black text-sm hover:bg-slate-100 transition shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <User size={18} className="text-indigo-600" />
                                        Edit Identity Nodes
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Backdrop Subtle Effect */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <User size={160} />
                        </div>
                    </div>

                    {/* Subscription Tier Section */}
                    <div id="tier-section" className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-black text-xl text-slate-900 tracking-tight">Financial Tier</h4>
                            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                <Zap size={20} fill="currentColor" />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-[32px] mb-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 rounded-2xl ${subscription?.plans?.name === 'Pro' || subscription?.plans?.name === 'Ultimate' ? 'bg-amber-400 text-slate-900' : 'bg-indigo-600 text-white'}`}>
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-0.5">Active Plan</span>
                                        <p className="font-black text-xl tracking-tight">{subscription?.plans?.name || 'Standard'} Member</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-200/60">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    Billed {formatCurrency(subscription?.plans?.price || 0, subscription?.plans?.currency || 'LKR')}/month
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 text-white/5">
                                <Zap size={100} />
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            {[
                                { id: 'plan-std', name: 'Standard', desc: 'Basic Ledger & 1 Workspace' },
                                { id: 'plan-pro', name: 'Pro', desc: 'Architect Mode + Multi-Currency' },
                                { id: 'plan-ult', name: 'Ultimate', desc: 'Enterprise Logic & Unlimited Nodes' }
                            ].map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => handleUpgradePlan(p.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${currentPlanId === p.id ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-50 bg-slate-50 hover:border-indigo-100'}`}
                                >
                                    <div>
                                        <p className="font-black text-xs text-slate-900">{p.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{p.desc}</p>
                                    </div>
                                    {currentPlanId === p.id ? (
                                        <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">Active</span>
                                    ) : (
                                        <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Select</button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Link
                            to="/billing"
                            className="w-full py-5 bg-slate-100 text-slate-900 rounded-[24px] font-black text-sm hover:bg-slate-900 hover:text-white transition shadow-sm flex items-center justify-center gap-3 group"
                        >
                            <CreditCard size={18} />
                            Detailed Billing
                            <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Module Info */}
                    <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Logic Provider</span>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">PFT Core Engine V2</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Build Signature</span>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">7F9A2B4C</span>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}
