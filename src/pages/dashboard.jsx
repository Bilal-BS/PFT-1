
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DefaultDashboard from '../components/dashboard/DefaultDashboard'
import Layout from '../components/Layout'
import DashboardManager from '../components/dashboard/DashboardManager'
import { useDashboardStore } from '../store/dashboardStore'
import { LayoutGrid, Settings } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [subscription, setSubscription] = useState(null)
    const [currentView, setCurrentView] = useState('default')
    const [searchParams, setSearchParams] = useSearchParams()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    useEffect(() => {
        if (searchParams.get('customize') === 'true' && subscription) {
            const plan = subscription?.plans?.name
            if (plan === 'Pro' || plan === 'Professional' || plan === 'Ultimate') {
                setCurrentView('manager')
            } else {
                console.warn('Architect Mode requires Professional Tier')
                setCurrentView('default')
            }
        } else if (!searchParams.get('customize')) {
            setCurrentView('default')
        }
    }, [searchParams, subscription])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const [profileRes, subRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user.id).single()
            ])

            setProfile(profileRes.data)
            setSubscription(subRes.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    // Show dashboard based on current view
    if (currentView === 'default') {
        const canCustomize = subscription?.plans?.name === 'Pro' || subscription?.plans?.name === 'Professional' || subscription?.plans?.name === 'Ultimate';

        const actions = canCustomize ? (
            <button
                onClick={() => setSearchParams({ customize: 'true' })}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-amber-600 transition font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
            >
                <Settings size={16} />
                Launch Architect Mode
            </button>
        ) : null;

        return (
            <div>
                <PageHeader
                    title="Dashboard"
                    description="Welcome back! Here's your financial overview."
                    actions={actions}
                />
                <DefaultDashboard />
            </div>
        )
    }

    if (currentView === 'manager') {
        return <DashboardManager onSelectDashboard={(id) => {
            if (id === 'default') {
                setSearchParams({})
                setCurrentView('default')
            } else {
                setCurrentView('custom')
            }
        }} />
    }

    // Custom dashboard view
    return (
        <div>
            <Layout />
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[60]">
                <button
                    onClick={() => setCurrentView('manager')}
                    className="p-4 bg-indigo-600 dark:bg-indigo-500 hover:bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 transition-all hover:scale-110 active:scale-95 group flex items-center gap-2"
                    title="My Dashboards"
                >
                    <LayoutGrid size={24} />
                    <span className="hidden group-hover:block font-black text-[10px] uppercase tracking-widest ml-2">My Dashboards</span>
                </button>
                <button
                    onClick={() => {
                        setSearchParams({})
                        setCurrentView('default')
                    }}
                    className="p-4 bg-white dark:bg-gray-800 hover:bg-rose-600 hover:text-white text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all hover:scale-110 active:scale-95 group flex items-center gap-2"
                    title="Exit to Dashboard"
                >
                    <div className="p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </div>
                    <span className="hidden group-hover:block font-black text-[10px] uppercase tracking-widest ml-2">Exit Designer</span>
                </button>
            </div>
        </div>
    )
}
