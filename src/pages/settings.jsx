import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CURRENCIES, formatCurrency } from '../lib/utils'
import {
    Settings as SettingsIcon, Globe, Bell, Shield,
    Plus, Trash2, RefreshCw, Key, User, CreditCard,
    ArrowRight, ExternalLink, Zap, Star, ShieldCheck,
    Mail, Briefcase, CheckCircle2, Layout, Palette,
    Type, Maximize, Play, Grid
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { ALL_THEMES } from '../constants/themes'

const HIJRI_MONTHS = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-ula', 'Jumada al-akhira', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
]

export default function Settings() {
    const [profile, setProfile] = useState(null)
    const [subscription, setSubscription] = useState(null)
    const [availablePlans, setAvailablePlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        role: ''
    })
    const [zakatSettings, setZakatSettings] = useState(null)

    const {
        theme, setTheme,
        accentColor, setAccentColor,
        borderRadius, setRadius,
        animationsEnabled, setAnimations,
        fontFamily, setFont
    } = useThemeStore()

    useEffect(() => {
        fetchSettingsData()
    }, [])

    const fetchSettingsData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const [profileRes, subRes, zakatRes, plansRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user.id).limit(1).maybeSingle(),
                supabase.from('zakat_settings').select('*').eq('user_id', user.id).maybeSingle(),
                supabase.from('plans').select('*').order('price', { ascending: true })
            ])

            if (profileRes.data) {
                setProfile(profileRes.data)
                setFormData({
                    full_name: profileRes.data.full_name || '',
                    role: profileRes.data.role || ''
                })
            }
            setSubscription(subRes.data)
            setZakatSettings(zakatRes.data)
            setAvailablePlans(plansRes.data || [])
        } catch (error) {
            console.error('Settings load error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleZakatSettingChange = async (field, value) => {
        setSaving(true)
        const newSettings = { ...zakatSettings, [field]: value }

        const { error } = await supabase
            .from('zakat_settings')
            .upsert({
                user_id: profile.id,
                ...newSettings,
                updated_at: new Date().toISOString()
            })

        if (!error) {
            setZakatSettings(newSettings)
        } else {
            console.error(error)
            alert("Failed to update Zakat settings")
        }
        setSaving(false)
    }

    const handleToggleZakat = () => handleZakatSettingChange('is_enabled', !zakatSettings?.is_enabled)

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

        // 1. Update Profile
        const { error: profileError } = await supabase.from('profiles').update({
            full_name: formData.full_name,
            role: formData.role
        }).eq('id', profile.id)

        // 2. Update Password (if provided)
        let passwordMsg = ''
        if (formData.password && formData.password.trim().length > 0) {
            const { error: authError } = await supabase.auth.updateUser({ password: formData.password })
            if (authError) {
                console.error("Password update failed:", authError)
                alert("Failed to update password: " + authError.message)
            } else {
                passwordMsg = " & Password Updated"
            }
        }

        if (!profileError) {
            setProfile(prev => ({ ...prev, ...formData }))
            setEditMode(false)
            // Clear password from state for security
            setFormData(prev => ({ ...prev, password: '' }))
            alert(`Profile${passwordMsg} updated successfully!`)
        }
        setSaving(false)
    }

    const handleUpgradePlan = async (planId) => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase
            .from('subscription_requests')
            .insert({
                user_id: user.id,
                plan_id: planId,
                status: 'pending',
                type: 'upgrade',
                requested_at: new Date().toISOString()
            })

        if (!error) {
            alert("Upgrade request sent! Awaiting Superadmin approval.")
        } else {
            console.error(error)
            alert("Failed to send request.")
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

    const freePlan = availablePlans.find(p => p.price === 0)
    const currentPlanId = subscription?.plan_id || freePlan?.id

    return (
        <div className="p-4 lg:p-8 space-y-8 bg-[#F9FAFB]">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20">
                            <SettingsIcon size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.3em]">Visual Hub</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Interface Skin</h1>
                    <p className="text-slate-500 mt-2 font-bold text-lg">Morph your workspace soul: choose from 15+ distinct structural designs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Left Column: Core Settings */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Regional Logic Segment */}
                    <div className="premium-card p-10 transition-all hover:scale-[1.01]">
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
                                        <p className="text-xs font-bold text-slate-400">Regulated Calculations</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Islamic Finance Logic */}
                    <div className="premium-card p-10 transition-all hover:scale-[1.01] relative overflow-hidden">
                        {(subscription?.plans?.name !== 'Halal Wealth' && subscription?.plans?.name !== 'Ultimate' && profile?.role !== 'superadmin') && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-emerald-100 flex flex-col items-center text-center max-w-xs animate-in fade-in zoom-in duration-300">
                                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 mb-4">
                                        <Star size={32} fill="currentColor" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 mb-2">Islamic Mode Locked</h4>
                                    <p className="text-xs font-bold text-slate-400 mb-6 leading-relaxed">Upgrade to 'Halal Wealth' plan to unlock Zakat engine, Nisab tracking, and Shariah audit tools.</p>
                                    <Link
                                        to="/billing"
                                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition shadow-xl block"
                                    >
                                        Upgrade Now
                                    </Link>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Islamic Finance</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1">Shariah Compliance & Zakat Engine</p>
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label cursor-pointer gap-4">
                                    <span className="label-text text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        {saving ? 'Updating...' : zakatSettings?.is_enabled ? 'Mode Enabled' : 'Enable Mode'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-success"
                                        checked={zakatSettings?.is_enabled || false}
                                        onChange={handleToggleZakat}
                                        disabled={saving}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Zakat Date & Jewelry - New Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Zakat Day (Hijri)</label>
                                <select
                                    value={zakatSettings?.hijri_day || 1}
                                    onChange={(e) => handleZakatSettingChange('hijri_day', parseInt(e.target.value))}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    {[...Array(30)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Zakat Month</label>
                                <select
                                    value={zakatSettings?.hijri_month || 'Ramadan'}
                                    onChange={(e) => handleZakatSettingChange('hijri_month', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    {HIJRI_MONTHS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center justify-between md:justify-center gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Include Jewelry</label>
                                    <p className="text-[8px] font-bold text-slate-300">Personal usage items</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-emerald rounded-lg"
                                    checked={zakatSettings?.include_jewelry || false}
                                    onChange={(e) => handleZakatSettingChange('include_jewelry', e.target.checked)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-[32px] border border-transparent hover:border-emerald-100 transition-all group">
                                <h4 className="font-black text-slate-900 mb-1">Zakat Engine</h4>
                                <p className="text-xs font-bold text-slate-400 mb-4">2.5% wealth tax auto-calculated annually based on Hawl.</p>
                                <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                                    Automated Logic
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[32px] border border-transparent hover:border-emerald-100 transition-all group">
                                <h4 className="font-black text-slate-900 mb-1">Nisab Threshold</h4>
                                <p className="text-xs font-bold text-slate-400 mb-4">Auto-syncs with Gold (85g) or Silver (595g) market prices.</p>
                                <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    Gold Standard Active
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Segment */}
                    <div className="premium-card p-10">
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

                    {/* Appearance Segment */}
                    <div className="premium-card p-10 transition-all hover:scale-[1.01] relative overflow-hidden">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <Palette size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Appearance & Skin</h2>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {/* Theme Galaxy Grid */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 ml-1">Universal Theme Selector</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {ALL_THEMES.map((t) => {
                                        const isPremium = t.type === 'premium';
                                        const isLocked = isPremium && subscription?.plans?.name === 'Standard';

                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    if (isLocked) {
                                                        alert("This is a Premium Theme. Upgrade to Pro/Ultimate to unlock!");
                                                        document.getElementById('tier-section').scrollIntoView({ behavior: 'smooth' });
                                                        return;
                                                    }
                                                    setTheme(t.id);
                                                }}
                                                className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all relative border ${theme === t.id ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-50 hover:border-indigo-100 bg-slate-50/50'} ${isLocked ? 'opacity-70 grayscale-[0.5]' : ''}`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${t.color} shadow-lg`}>
                                                    {t.icon}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900">{t.name}</span>
                                                {isLocked ? (
                                                    <div className="absolute top-2 right-2 text-slate-400">
                                                        <Key size={10} fill="currentColor" />
                                                    </div>
                                                ) : isPremium && (
                                                    <div className="absolute top-2 right-2 text-amber-500">
                                                        <Star size={10} fill="currentColor" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 ml-1">Universal Accent</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-slate-900">{accentColor}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Global Brand Primary</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 ml-1">Corner Radius</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="48"
                                        step="4"
                                        value={parseInt(borderRadius)}
                                        onChange={(e) => setRadius(`${e.target.value}px`)}
                                        className="w-full accent-indigo-600"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[8px] font-bold text-slate-400">Sharp</span>
                                        <span className="text-[10px] font-black text-slate-900">{borderRadius}</span>
                                        <span className="text-[8px] font-bold text-slate-400">Round</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center justify-between p-6 rounded-[28px] border border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 rounded-xl text-slate-900"><Play size={16} /></div>
                                        <div>
                                            <p className="font-black text-sm text-slate-800">Cine-Motion</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">Smooth UI Animations</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-sm"
                                        checked={animationsEnabled}
                                        onChange={(e) => setAnimations(e.target.checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-6 rounded-[28px] border border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 rounded-xl text-slate-900"><Type size={16} /></div>
                                        <div>
                                            <p className="font-black text-sm text-slate-800">Dynamic Font</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">System Typography</p>
                                        </div>
                                    </div>
                                    <select
                                        value={fontFamily}
                                        onChange={(e) => setFont(e.target.value)}
                                        className="bg-transparent text-[10px] font-black underline outline-none cursor-pointer"
                                    >
                                        <option value="Outfit">Standard</option>
                                        <option value="'Inter', sans-serif">Inter</option>
                                        <option value="'Roboto', sans-serif">Roboto</option>
                                        <option value="'Space Grotesk', sans-serif">Space</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interface Architecture Segment */}
                    <div className="premium-card p-10 transition-all hover:scale-[1.01] relative overflow-hidden">
                        {(subscription?.plans?.name !== 'Pro' && subscription?.plans?.name !== 'Professional' && subscription?.plans?.name !== 'Ultimate' && profile?.role !== 'superadmin') && (
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
                    <div className="premium-card p-10 !bg-slate-900 text-white shadow-2xl shadow-indigo-900/10 relative overflow-hidden group">
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
                                        <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Email Address (Username)</label>
                                        <input
                                            type="text"
                                            value={profile?.email || ''} // Using profile state directly as email is not editable here
                                            disabled
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-bold text-slate-400 outline-none cursor-not-allowed"
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

                                    {/* Password Change Section */}
                                    <div className="pt-4 border-t border-white/10">
                                        <label className="block text-[9px] font-black uppercase text-emerald-400 tracking-widest mb-2">New Password (Optional)</label>
                                        <input
                                            type="password"
                                            placeholder="Enter to change..."
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-bold text-white outline-none focus:bg-white/10 focus:border-emerald-500 transition"
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
                                        Edit Identity & Security
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
                    <div id="tier-section" className="premium-card p-10 relative overflow-hidden">
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



                        // ... existing helper functions ...

                        // ... inside return ...

                        <div className="space-y-3 mb-8">
                            {availablePlans.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => handleUpgradePlan(p.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${currentPlanId === p.id ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-50 bg-slate-50 hover:border-indigo-100'}`}
                                >
                                    <div>
                                        <p className="font-black text-xs text-slate-900">{p.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{formatCurrency(p.price)}/mo</p>
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
                    <div className="premium-card p-8">
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
