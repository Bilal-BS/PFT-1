import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    LayoutGrid, Wallet, Globe, History, Target, Briefcase,
    ShieldCheck, PieChart, Landmark, Sparkles, Menu, X, ChevronLeft,
    Bell, Settings, LogOut, HelpCircle, User, Search, Zap
} from 'lucide-react'

export default function Sidebar({ isCollapsed, onToggle }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [profile, setProfile] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    // Internal state removed in favor of props

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                if (data) setProfile(data)
            }
        }
        fetchUserData()
    }, [])

    useEffect(() => {
        setIsOpen(false)
    }, [location.pathname])

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const sections = [
        {
            title: 'Management',
            links: [
                { name: 'App Launcher', path: '/', icon: <LayoutGrid size={20} /> },
                { name: 'Dashboard', path: '/dashboard', icon: <PieChart size={20} /> },
                { name: 'Accounts', path: '/accounts', icon: <Wallet size={20} /> },
                { name: 'PDC Vault', path: '/pdcs', icon: <Landmark size={20} /> },
            ]
        },
        {
            title: 'Treasury',
            links: [
                { name: 'Currency Engine', path: '/currencies', icon: <Globe size={20} /> },
                { name: 'General Ledger', path: '/transactions', icon: <History size={20} /> },
                { name: 'Asset Portfolio', path: '/investments', icon: <Briefcase size={20} /> },
            ]
        },
        {
            title: 'Intelligence',
            links: [
                { name: 'Analytics', path: '/reports', icon: <PieChart size={20} /> },
                { name: 'Budgets', path: '/budgets', icon: <Target size={20} /> },
                { name: 'Family Shield', path: '/family', icon: <ShieldCheck size={20} /> },
            ]
        },
        profile?.role === 'superadmin' ? {
            title: 'Platform Logic',
            links: [
                { name: 'SuperAdmin', path: '/admin', icon: <ShieldCheck size={20} className="text-rose-500" /> },
                { name: 'Billing Logic', path: '/billing', icon: <Zap size={20} /> },
            ]
        } : {
            title: 'Subscription',
            links: [
                { name: 'Membership', path: '/billing', icon: <Zap size={20} /> },
            ]
        }
    ].filter(Boolean)

    return (
        <>
            {/* Mobile Header (Search + Toggle) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-100 z-40 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white">
                        <Sparkles size={20} fill="white" />
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 lg:hidden transition-all duration-300"
                />
            )}

            <aside className={`fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:h-screen lg:inset-auto bg-white border-r border-slate-50 flex flex-col z-[55] transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'w-[80px]' : 'w-[280px]'} ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Collapse Toggle */}
                <button
                    onClick={onToggle}
                    className="hidden lg:flex absolute -right-3.5 top-12 w-7 h-7 bg-white border border-slate-100 rounded-full items-center justify-center text-slate-400 hover:text-emerald-900 hover:border-emerald-100 hover:shadow-lg transition-all z-[60]"
                >
                    <ChevronLeft size={14} className={`transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>

                {/* Logo Section */}
                <div className={`p-8 mb-2 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 bg-emerald-900 rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-all">
                            <Sparkles size={22} fill="white" />
                        </div>
                        {!isCollapsed && (
                            <div className="animate-in fade-in slide-in-from-left-4">
                                <span className="text-xl font-black text-slate-900 tracking-tight leading-none block italic">Donezo<span className="text-emerald-600">.</span></span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar py-6">
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            {!isCollapsed && <h4 className="px-5 text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-4 break-words">{section.title}</h4>}
                            <div className="space-y-1">
                                {section.links.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        title={isCollapsed ? link.name : ''}
                                        className={`flex items-center h-12 rounded-[20px] transition-all group relative ${isCollapsed ? 'justify-center mx-2' : 'px-5'} ${location.pathname === link.path ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                                    >
                                        <div className="flex items-center gap-4 relative z-10 min-w-0">
                                            <span className={`${location.pathname === link.path ? 'text-emerald-900 scale-110' : 'text-slate-300 group-hover:text-slate-600'} transition-all flex-shrink-0`}>
                                                {link.icon}
                                            </span>
                                            {!isCollapsed && <span className="text-[14px] tracking-tight break-words">{link.name}</span>}
                                        </div>
                                        {location.pathname === link.path && !isCollapsed && (
                                            <div className="w-1.5 h-1.5 bg-emerald-900 rounded-full absolute right-5" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Profile & Config */}
                <div className={`mt-auto p-6 ${isCollapsed ? 'flex flex-col items-center gap-4' : 'space-y-2'}`}>
                    <Link
                        to="/settings"
                        title="Settings"
                        className={`flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all ${location.pathname === '/settings' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <Settings size={20} />
                        {!isCollapsed && <span className="text-sm">Preferences</span>}
                    </Link>

                    <div className={`p-4 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center ${isCollapsed ? 'w-12 h-12 p-0 justify-center overflow-hidden' : 'gap-3 mt-4'}`}>
                        <div className={`rounded-[14px] bg-emerald-900 flex items-center justify-center text-white font-black flex-shrink-0 ${isCollapsed ? 'w-10 h-10 text-xs' : 'w-11 h-11 text-base'}`}>
                            {profile?.full_name?.[0] || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate leading-tight break-words">{profile?.full_name || 'System User'}</p>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5 break-words">Pro Tier</p>
                            </div>
                        )}
                        {!isCollapsed && (
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>

                    {/* Architect Toggle */}
                    <button
                        onClick={() => navigate('/?customize=true')}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-[24px] border-2 border-dashed transition-all group overflow-hidden relative ${isCollapsed ? 'px-0' : 'px-6'} ${location.search.includes('customize=true') ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-amber-200 hover:text-amber-600'}`}
                    >
                        <div className="flex items-center gap-3 relative z-10 transition-transform group-hover:scale-110">
                            <Sparkles size={18} className={location.search.includes('customize=true') ? 'text-amber-500' : 'text-slate-300 group-hover:text-amber-400'} fill={location.search.includes('customize=true') ? 'currentColor' : 'none'} />
                            {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Launch Architect</span>}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                </div>
            </aside>

            {/* Sidebar padding is applied via tailwind lg:pl-[280px] */}
        </>
    )
}
