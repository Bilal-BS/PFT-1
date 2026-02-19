
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import { CreditCard, CheckCircle, Zap, ShieldCheck, Star } from 'lucide-react'

export default function Billing() {
    const [subscription, setSubscription] = useState(null)
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [upgrading, setUpgrading] = useState(false)

    useEffect(() => {
        fetchBillingData()
    }, [])

    const fetchBillingData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                console.warn("User not authenticated")
                setLoading(false)
                return
            }

            const [subRes, plansRes, reqRes] = await Promise.all([
                supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user.id).maybeSingle(),
                supabase.from('plans').select('*').order('price', { ascending: true }),
                supabase.from('subscription_requests').select('*').eq('user_id', user.id).eq('status', 'pending').maybeSingle()
            ])

            setSubscription(subRes.data)
            setPlans(plansRes.data || [])
            if (reqRes.data) {
                setUpgrading(true) // Reuse state to lock UI
                // Optionally store the pending request to show which plan
            }
        } catch (error) {
            console.error("Billing fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    const upgradePlan = async (planId) => {
        try {
            setUpgrading(true)
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

            if (error) throw error

            alert("Upgrade request sent! A Superadmin will approve it shortly. 🎉")
            fetchBillingData()
        } catch (e) {
            console.error(e)
            alert("Failed to send upgrade request. Please try again.")
        } finally {
            setUpgrading(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[600px]">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
    )

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-[1600px]">
            <div className="mb-12">
                <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">Financial Freedom Tiers</h1>
                <p className="text-slate-500 font-medium italic text-lg">Choose a scale that fits your wealth management goals.</p>
            </div>

            {/* Current Plan Highlight */}
            <div className="bg-indigo-600 rounded-[40px] p-10 text-white mb-16 shadow-2xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                        <Zap size={40} className="text-indigo-200" />
                    </div>
                    <div>
                        <span className="text-xs font-black text-indigo-200 uppercase tracking-[0.3em]">Active Tier</span>
                        <h2 className="text-4xl font-black">{subscription?.plans?.name || 'Starter'} Member</h2>
                    </div>
                </div>
                <div className="text-center md:text-right relative z-10">
                    {upgrading ? (
                        <div className="bg-amber-500/20 border border-amber-500/50 rounded-2xl p-4 mb-4">
                            <p className="text-amber-100 font-bold flex items-center gap-2">
                                <span className="animate-pulse">●</span> Pending Approval
                            </p>
                        </div>
                    ) : subscription ? (
                        <p className="text-indigo-100 font-bold mb-4">Membership active since {new Date(subscription.start_date).toLocaleDateString()}</p>
                    ) : (
                        <p className="text-indigo-100 font-bold mb-4">You are on the free Starter plan.</p>
                    )}
                    <div className="flex gap-4">
                        <button className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-slate-50 transition">Billing Portal</button>
                        <button className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-2xl font-black backdrop-blur-sm hover:bg-white/20 transition">Invoices</button>
                    </div>
                </div>

                {/* Backdrop SVG Pattern */}
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <svg width="400" height="400" viewBox="0 0 100 100" fill="white">
                        <circle cx="100" cy="0" r="100" />
                    </svg>
                </div>
            </div>

            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map(plan => (
                    <div key={plan.id} className={`bg-white p-10 rounded-[48px] border-2 transition-all group relative ${subscription?.plan_id === plan.id ? 'border-indigo-600 shadow-2xl' : 'border-slate-50 shadow-sm hover:shadow-xl hover:border-indigo-100'}`}>
                        {plan.name === 'Halal Wealth' && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                                <Star size={12} fill="white" />
                                Recommended for You
                            </div>
                        )}

                        <div className="mb-10">
                            <h3 className="text-3xl font-black text-slate-900 mb-1">{plan.name}</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">SaaS Subscription</p>
                        </div>

                        <div className="mb-12 font-black text-slate-900">
                            <span className="text-5xl">{formatCurrency(plan.price, plan.currency || 'USD')}</span>
                            <span className="text-sm text-slate-400 ml-1">/mo</span>
                        </div>

                        <div className="space-y-4 mb-12">
                            {Object.entries(plan.features || {}).map(([key, val]) => (
                                <div key={key} className="flex items-start gap-3 text-slate-600">
                                    <div className="mt-1 p-1 bg-emerald-50 rounded-lg text-emerald-600 flex-shrink-0">
                                        <CheckCircle size={14} />
                                    </div>
                                    <span className="text-sm font-bold capitalize leading-relaxed break-words">
                                        {val === true ? 'Unlimited' : val.toString()} {key.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1 p-1 bg-indigo-50 rounded-lg text-indigo-600 flex-shrink-0">
                                    <ShieldCheck size={14} />
                                </div>
                                <span className="text-sm font-bold leading-relaxed break-words">ISO-27001 Financial Encryption</span>
                            </div>
                        </div>

                        <button
                            disabled={subscription?.plan_id === plan.id || upgrading}
                            onClick={() => upgradePlan(plan.id)}
                            className={`w-full py-5 rounded-3xl font-black transition-all ${subscription?.plan_id === plan.id ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-2xl active:scale-95'}`}
                        >
                            {subscription?.plan_id === plan.id ? 'Active Membership' : 'Switch to ' + plan.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
