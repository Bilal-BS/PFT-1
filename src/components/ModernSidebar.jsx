import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, Wallet, Globe, History, Briefcase,
    ShieldCheck, PieChart, Landmark, Sparkles,
    Settings, LogOut, Zap, ChevronLeft, Moon, Sun,
    Palette, Circle, PaletteIcon
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { supabase } from '../lib/supabase';
import { THEME_CATEGORIES, ALL_THEMES } from '../constants/themes';

// Flatten moved to constants

export default function ModernSidebar({ isCollapsed, onToggle }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, setTheme } = useThemeStore();
    const [profile, setProfile] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [showThemePicker, setShowThemePicker] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const [profileRes, subRes] = await Promise.all([
                    supabase.from('profiles').select('*').eq('id', user.id).single(),
                    supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user.id).single()
                ]);
                setProfile(profileRes.data);
                setSubscription(subRes.data);
            }
        };
        fetchUserData();
    }, []);

    const features = subscription?.plans?.features || {};

    const menuItems = [
        {
            group: 'Core', items: [
                { name: 'Gateway', path: '/', icon: <LayoutGrid size={20} /> },
                { name: 'Dashboard', path: '/dashboard', icon: <PieChart size={20} /> },
                { name: 'Vaults', path: '/accounts', icon: <Wallet size={20} /> },
                { name: 'Ledger', path: '/transactions', icon: <History size={20} /> },
            ]
        },
        {
            group: 'Operations', items: [
                { name: 'PDC Vault', path: '/pdcs', icon: <Landmark size={20} />, locked: !features.pdc_management },
                { name: 'Budgets', path: '/budgets', icon: <PieChart size={20} /> },
                { name: 'Loans', path: '/loans', icon: <Wallet size={20} />, locked: !features.loans },
                { name: 'Currencies', path: '/currencies', icon: <Globe size={20} /> },
            ]
        },
        {
            group: 'Treasury', items: [
                { name: 'Assets', path: '/assets', icon: <Briefcase size={20} />, locked: !features.assets_management },
                { name: 'Portfolios', path: '/investments', icon: <PieChart size={20} />, locked: !features.investments },
            ]
        },
        {
            group: 'Intelligence', items: [
                { name: 'AI Insights', path: '/reports', icon: <PieChart size={20} />, locked: !features.smart_insights },
                { name: 'Tax Engine', path: '/taxes', icon: <Landmark size={20} />, locked: !features.tax_tools },
                { name: 'Zakat Logic', path: '/zakat', icon: <Sparkles size={20} />, locked: !features.zakat_calculator },
                { name: 'Family Shield', path: '/family', icon: <ShieldCheck size={20} />, locked: !features.family_sync },
                { name: 'Platform Prefs', path: '/settings', icon: <Settings size={20} /> },
            ]
        },
    ];

    if (profile?.role === 'superadmin') {
        menuItems.push({
            group: 'Core Control',
            items: [
                { name: 'Admin Console', path: '/admin', icon: <ShieldCheck size={20} className="text-rose-500" /> },
                { name: 'Billing Engine', path: '/billing', icon: <Zap size={20} /> },
            ]
        });
    }

    return (
        <aside
            className={`fixed left-0 top-0 h-screen glass-sidebar z-[60] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'w-24' : 'w-72'}`}
            style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--sidebar-border)' }}
        >
            {/* Branding */}
            <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group cursor-pointer hover:rotate-12 transition-transform">
                    <Sparkles size={24} fill="currentColor" />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <span className="text-xl font-black tracking-tighter text-[var(--text-main)] italic">NEXT<span className="text-emerald-500">GEN</span></span>
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-50">Financial Core</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar py-4">
                {menuItems.map((section) => (
                    <div key={section.group} className="space-y-2">
                        {!isCollapsed && (
                            <h4 className="px-4 text-[9px] font-black uppercase text-[var(--text-muted)] tracking-[0.2em] opacity-40">
                                {section.group}
                            </h4>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                const isLocked = item.locked;

                                return (
                                    <Link
                                        key={item.path}
                                        to={isLocked ? '/billing' : item.path}
                                        onClick={(e) => {
                                            if (isLocked) {
                                                // Optional: Add toast notification here
                                            }
                                        }}
                                        className={`flex items-center h-12 rounded-2xl transition-all relative group ${isCollapsed ? 'justify-center' : 'px-4 gap-4'} ${isActive ? 'nav-link-active' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--sidebar-active)]'} ${isLocked ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}
                                    >
                                        <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                            {item.icon}
                                        </div>
                                        {!isCollapsed && (
                                            <span className="text-[13px] font-bold tracking-tight flex items-center gap-2">
                                                {item.name}
                                                {isLocked && <span className="p-0.5 bg-amber-500/10 text-amber-500 rounded"><Settings size={10} className="stroke-2" /></span>}
                                            </span>
                                        )}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Theme & Profile Section */}
            <div className="p-4 mt-auto space-y-4">
                {/* Theme Selector Overlay */}
                <AnimatePresence>
                    {showThemePicker && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="absolute bottom-20 left-4 right-4 p-6 bg-[var(--card-bg)] border border-[var(--sidebar-border)] rounded-[32px] shadow-2xl z-50 max-h-[70vh] overflow-y-auto no-scrollbar"
                            style={{
                                border: 'var(--ui-border)',
                                boxShadow: 'var(--ui-shadow)',
                                backdropFilter: 'var(--ui-blur)'
                            }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)] italic">UI Skin Morphing</h3>
                                <button onClick={() => setShowThemePicker(false)} className="text-[var(--text-muted)] hover:text-rose-500 transition-colors">
                                    <LogOut size={14} className="rotate-180" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {THEME_CATEGORIES.map((cat) => (
                                    <div key={cat.name} className="space-y-4">
                                        <h4 className="text-[9px] font-black uppercase text-[var(--accent)] tracking-[0.2em] opacity-60">
                                            {cat.name}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {cat.themes.map((t) => {
                                                const isSelected = theme === t.id;
                                                const isPremium = t.type === 'premium';
                                                const isLocked = isPremium && subscription?.plans?.name === 'Standard';

                                                return (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => {
                                                            if (isLocked) {
                                                                alert("Premium Theme: Upgrade to unlock!");
                                                                navigate('/settings');
                                                                setShowThemePicker(false);
                                                                return;
                                                            }
                                                            setTheme(t.id);
                                                            if (!isCollapsed) setShowThemePicker(false);
                                                        }}
                                                        className={`flex flex-col items-center gap-3 p-3 rounded-2xl transition-all relative border ${isSelected ? 'border-[var(--accent)] bg-[var(--sidebar-active)]' : 'border-transparent hover:bg-[var(--sidebar-active)]'} ${isLocked ? 'opacity-50 grayscale' : ''}`}
                                                        title={t.name}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${t.color} shadow-lg shadow-[var(--accent-glow)]`}>
                                                            {t.icon}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-main)]">{t.name}</span>

                                                        {isLocked ? (
                                                            <div className="absolute top-1 right-1">
                                                                <Key size={8} className="text-slate-400" />
                                                            </div>
                                                        ) : isPremium && (
                                                            <div className="absolute top-1 right-1">
                                                                <Sparkles size={8} className="text-amber-500 fill-amber-500" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Theme Toggle Button */}
                <button
                    onClick={() => setShowThemePicker(!showThemePicker)}
                    className={`w-full flex items-center h-12 rounded-2xl bg-[var(--sidebar-active)] text-[var(--text-main)] transition-all border border-[var(--sidebar-border)] ${isCollapsed ? 'justify-center' : 'px-4 gap-4'}`}
                    style={{ border: 'var(--ui-border)', boxShadow: 'var(--ui-shadow)' }}
                >
                    <Palette size={20} className="text-emerald-500" />
                    {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Skin Engine</span>}
                </button>

                {/* Profile Card */}
                <div className={`p-3 rounded-3xl bg-[var(--bg-app)] border border-[var(--sidebar-border)] flex items-center ${isCollapsed ? 'justify-center h-14' : 'gap-3 h-16'}`}>
                    <div className="w-10 h-10 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[var(--accent-glow)] flex-shrink-0">
                        {profile?.full_name?.[0] || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-black text-[var(--text-main)] truncate leading-none mb-1">{profile?.full_name || 'System User'}</p>
                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest opacity-70">NextGen Alpha</p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center h-10 rounded-xl border border-dashed border-[var(--sidebar-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)] transition-all group"
                >
                    <ChevronLeft size={16} className={`transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </aside>
    );
}
