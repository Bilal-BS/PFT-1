
import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    LayoutDashboard, Wallet, Globe, History, Target, Briefcase,
    Handshake, FileText, CreditCard, Settings, LogOut, ShieldCheck
} from 'lucide-react'

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        const fetchRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
                if (data) setUserRole(data.role)
            }
        }
        fetchRole()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const navLinks = [
        { name: 'Home', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Accounts', path: '/accounts', icon: <Wallet size={18} /> },
        { name: 'Currencies', path: '/currencies', icon: <Globe size={18} /> },
        { name: 'Ledger', path: '/transactions', icon: <History size={18} /> },
        { name: 'Budgets', path: '/budgets', icon: <Target size={18} /> },
        { name: 'Assets', path: '/investments', icon: <Briefcase size={18} /> },
        { name: 'Billing', path: '/billing', icon: <CreditCard size={18} /> },
    ]

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 text-indigo-600 font-black text-2xl tracking-tighter group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-100">
                                P
                            </div>
                            PFT.io
                        </Link>
        <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${location.pathname === link.path ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {userRole === 'superadmin' && (
                            <Link
                                to="/admin"
                                className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition ${location.pathname === '/admin' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'}`}
                            >
                                <ShieldCheck size={14} />
                                Admin
                            </Link>
                        )}
                        <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />
                        <Link
                            to="/reports"
                            title="Intelligence"
                            className={`p-3 rounded-2xl transition ${location.pathname === '/reports' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        >
                            <FileText size={20} />
                        </Link>
                        <Link
                            to="/settings"
                            title="System Settings"
                            className={`p-3 rounded-2xl transition ${location.pathname === '/settings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        >
                            <Settings size={20} />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
