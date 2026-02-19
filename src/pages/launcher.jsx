import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Wallet, ArrowLeftRight, TrendingDown,
    TrendingUp, PieChart, Receipt, Calendar, Target,
    BarChart2, HandCoins, CreditCard, FileText, Landmark,
    Box, Settings, Search, Bell, Star, Grid, Banknote, Building2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const apps = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', path: '/dashboard' },
    { id: 'accounts', name: 'Accounts', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', path: '/accounts' },
    { id: 'transactions', name: 'Transactions', icon: ArrowLeftRight, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', path: '/transactions?tab=all' },
    { id: 'expenses', name: 'Expenses', icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', path: '/transactions?tab=expense' },
    { id: 'income', name: 'Income', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', path: '/transactions?tab=income' },
    { id: 'budgets', name: 'Budgets', icon: PieChart, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', path: '/budgets' },
    { id: 'bills', name: 'Bills', icon: Receipt, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', path: '/pdcs' },
    { id: 'subscriptions', name: 'Subscriptions', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', path: '/billing' },
    { id: 'savings', name: 'Savings', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', path: '/investments' },
    { id: 'investments', name: 'Investments', icon: BarChart2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', path: '/investments' },
    { id: 'loans', name: 'Loans', icon: HandCoins, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', path: '/loans' },
    { id: 'credit-cards', name: 'Credit Cards', icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', path: '/accounts' },
    { id: 'currencies', name: 'Currencies', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', path: '/currencies' },
    { id: 'reports', name: 'Reports', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', path: '/reports' },
    { id: 'taxes', name: 'Tax Engine', icon: Building2, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', path: '/taxes' },
    { id: 'zakat', name: 'Zakat', icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', path: '/zakat' },
    { id: 'assets', name: 'Assets', icon: Box, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10', path: '/assets' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10', path: '/settings' },
];

const AppLauncher = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = React.useState('user');

    React.useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (profile?.role === 'superadmin') {
                    setUserRole('superadmin');
                }
            }
        };
        checkRole();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12 animate-in fade-in duration-700">

            {/* Header with Sign Out */}
            <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Apps</h1>
                    <p className="text-slate-500 font-medium">Select an application to launch.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-500 hidden sm:block">
                        {userRole === 'superadmin' ? 'Super Admin' : 'User'}
                    </span>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-rose-50 hover:text-rose-600 border border-slate-200 dark:border-slate-700 shadow-sm transition-all font-bold text-xs uppercase tracking-wider"
                    >
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* App Grid - 6 Columns for higher density */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {apps.map((app) => (
                    <div
                        key={app.id}
                        onClick={() => app.path && navigate(app.path)}
                        className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl p-3 hover:scale-105 hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl relative overflow-hidden h-36"
                    >
                        {/* Internal wave decoration (Lower opacity for clarity) */}
                        <div className={`absolute inset-0 opacity-5 ${app.bg} -rotate-12 translate-y-16 group-hover:translate-y-12 transition-transform duration-700`} />

                        {/* Top: Star Icon (Favorite) - Smaller */}
                        <div className="flex justify-end mb-2">
                            <Star size={10} className="text-amber-400 fill-amber-400 group-hover:scale-125 transition-transform" />
                        </div>

                        {/* Center: Icon - Compact */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className={`${app.id === 'dashboard' ? 'animate-slow-spin' : ''}`}>
                                <app.icon size={22} strokeWidth={2} className={`${app.color} transition-transform duration-700 group-hover:scale-110`} />
                            </div>
                        </div>

                        {/* Bottom: Info - Ultra Mini */}
                        <div className="text-center mt-2">
                            <h3 className="text-[10px] font-black text-slate-800 dark:text-white mb-0.5 tracking-tighter uppercase leading-none">{app.name}</h3>
                            {app.stat ? (
                                <p className="text-[7px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                                    {app.stat}
                                </p>
                            ) : (
                                <p className="text-[7px] font-black text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest leading-none">Open</p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Admin Exclusive App - Compact */}
                {userRole === 'superadmin' && (
                    <div
                        onClick={() => navigate('/admin')}
                        className="group flex flex-col bg-slate-900 rounded-2xl p-3 hover:scale-105 hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-slate-800 shadow-xl relative overflow-hidden h-36"
                    >
                        <div className="flex justify-end mb-2">
                            <Star size={8} className="text-slate-700 fill-slate-700" />
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <Grid size={22} strokeWidth={2} className="text-emerald-500" />
                        </div>
                        <div className="text-center mt-2">
                            <h3 className="text-[10px] font-black text-white mb-0.5 tracking-tighter uppercase leading-none">Admin</h3>
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Console</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppLauncher;
