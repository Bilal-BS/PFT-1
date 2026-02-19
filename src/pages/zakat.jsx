import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency, convertCurrency } from '../lib/utils'
import {
    Calculator, Scale, Droplets, HeartHandshake,
    ArrowRight, Info, History, CheckCircle2,
    Coins, TrendingUp, AlertTriangle
} from 'lucide-react'

export default function Zakat() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [accounts, setAccounts] = useState([])
    const [rates, setRates] = useState([])
    const [nisabMethod, setNisabMethod] = useState('gold') // or 'silver'
    const [zakatSettings, setZakatSettings] = useState(null)
    const [zakatHistory, setZakatHistory] = useState([])

    // Market Prices (Mocked for Demo - allow user to override in real app)
    const [goldPrice, setGoldPrice] = useState(24000) // Price per gram in Base Currency
    const [silverPrice, setSilverPrice] = useState(300)

    useEffect(() => {
        fetchZakatData()
    }, [])

    const fetchZakatData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            const [profRes, accRes, ratesRes, zakatRes, settingsRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('accounts').select('*').eq('user_id', user.id),
                supabase.from('exchange_rates').select('*'),
                supabase.from('zakat_records').select('*').order('created_at', { ascending: false }),
                supabase.from('zakat_settings').select('*').eq('user_id', user.id).maybeSingle()
            ])

            setProfile(profRes.data)
            setAccounts(accRes.data || [])
            setRates(ratesRes.data || [])
            setZakatHistory(zakatRes.data || [])
            setZakatSettings(settingsRes.data)
            if (settingsRes.data?.nisab_method) setNisabMethod(settingsRes.data.nisab_method.toLowerCase())
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // --- Calculation Engine (4-Step Flow) ---
    const baseCurrency = profile?.base_currency || 'LKR'

    // Step 1: Calculate Total Zakatable Assets
    const liquidAssets = accounts
        .filter(acc => acc.zakat_applicable && acc.zakat_treatment !== 'trading_inventory')
        .reduce((sum, acc) => sum + convertCurrency(acc.balance, acc.currency, baseCurrency, rates), 0)

    const tradingInventory = accounts
        .filter(acc => acc.zakat_applicable && acc.zakat_treatment === 'trading_inventory')
        .reduce((sum, acc) => sum + convertCurrency(acc.balance, acc.currency, baseCurrency, rates), 0)

    const totalAssets = liquidAssets + tradingInventory

    // Step 2: Subtract Immediate Debts (Credit Cards & Short-Term Loans)
    const shortTermDebts = accounts
        .filter(acc => acc.type === 'credit' || acc.type === 'loan')
        .reduce((sum, acc) => sum + convertCurrency(acc.balance, acc.currency, baseCurrency, rates), 0)

    const netZakatableWealth = Math.max(0, totalAssets - shortTermDebts)

    // Step 3: Check Nisab
    const NISAB_GOLD_GRAMS = 85
    const NISAB_SILVER_GRAMS = 595

    const nisabValue = nisabMethod === 'gold'
        ? goldPrice * NISAB_GOLD_GRAMS
        : silverPrice * NISAB_SILVER_GRAMS

    const isZakatable = netZakatableWealth >= nisabValue

    // Step 4: Calculate 2.5%
    const zakatDue = isZakatable ? netZakatableWealth * 0.025 : 0

    // Hijri Date Logic
    const todayHijri = new Intl.DateTimeFormat('en-u-ca-islamic-uma', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
    const isAnniversary = zakatSettings?.hijri_month && todayHijri.includes(zakatSettings.hijri_month) && todayHijri.includes(zakatSettings.hijri_day?.toString())

    // --- Payment Handler ---
    const handlePayZakat = async () => {
        if (!confirm(`Confirm recording Zakat payment of ${formatCurrency(zakatDue, baseCurrency)}? This will create a snapshot of your current holdings.`)) return

        setLoading(true)
        try {
            // 1. Record Transaction
            await supabase.from('transactions').insert({
                user_id: profile.id,
                type: 'expense',
                amount: zakatDue,
                description: `Annual Zakat Payment (${new Date().getFullYear()} / ${todayHijri})`,
                category: 'Charity',
                transaction_date: new Date().toISOString()
            })

            // 2. Create Zakat Record (Snapshot)
            const { error } = await supabase.from('zakat_records').insert({
                user_id: profile.id,
                hawl_year: parseInt(todayHijri.split(' ')[2]),
                total_assets: totalAssets,
                short_term_liabilities: shortTermDebts,
                net_zakatable_wealth: netZakatableWealth,
                nisab_threshold: nisabValue,
                zakat_due: zakatDue,
                amount_paid: zakatDue,
                status: 'Paid',
                hijri_date_display: todayHijri,
                assets_snapshot: {
                    liquid: liquidAssets,
                    trading: tradingInventory,
                    debts: shortTermDebts,
                    timestamp: new Date().toISOString()
                }
            })

            if (!error) {
                alert("Zakat payment recorded and wealth purifed! 🎉")
                fetchZakatData()
            }
        } catch (e) {
            console.error(e)
            alert("Error processing payment")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[600px]">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
    )

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-[1600px]">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-emerald-600 text-white rounded-[24px] shadow-xl shadow-emerald-200">
                    <Scale size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Zakat Engine</h1>
                    <p className="text-slate-500 font-bold mt-1">Annual wealth purification calculator & tracker.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Calculator */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Status Card */}
                    <div className={`p-10 rounded-[40px] text-white overflow-hidden relative ${isZakatable ? 'bg-emerald-600 shadow-2xl shadow-emerald-200' : 'bg-slate-800'}`}>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Current Hawl Status</span>
                                    {isAnniversary && (
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                            🌙 Anniversary Today
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-5xl font-black mt-2 tracking-tighter">
                                    {isZakatable ? 'Zakat is Due' : 'Below Nisab'}
                                </h2>
                                <p className="text-sm font-bold opacity-80 mt-2 max-w-md">
                                    {isZakatable
                                        ? `Your net zakatable wealth (${formatCurrency(netZakatableWealth, baseCurrency)}) exceeds the ${nisabMethod} nisab threshold.`
                                        : `Your wealth has not yet reached the minimum threshold for Zakat obligation.`
                                    }
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Estimated Liability</span>
                                <div className="text-6xl font-black tracking-tight mt-1">
                                    {formatCurrency(zakatDue, baseCurrency)}
                                </div>
                                {isZakatable && (
                                    <button
                                        onClick={handlePayZakat}
                                        className="mt-6 px-8 py-4 bg-white text-emerald-800 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-50 transition shadow-lg active:scale-95 flex items-center gap-3 float-right"
                                    >
                                        <HeartHandshake size={18} />
                                        Pay Zakat
                                    </button>
                                )}
                            </div>
                        </div>

                        {/*bg decoration*/}
                        <div className="absolute -bottom-20 -right-20 opacity-10">
                            <Scale size={300} />
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calculator size={24} /></div>
                                    <h3 className="font-black text-lg text-slate-800">Wealth Breakdown</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Step 1: Gross Assets</span>
                                        <span className="text-sm font-black text-slate-900">{formatCurrency(totalAssets, baseCurrency)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 px-3">
                                        <span className="text-[10px] font-bold text-slate-400">Liquid / Cash</span>
                                        <span className="text-xs font-bold text-slate-600">{formatCurrency(liquidAssets, baseCurrency)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 px-3">
                                        <span className="text-[10px] font-bold text-slate-400">Trading Inventory</span>
                                        <span className="text-xs font-bold text-slate-600">{formatCurrency(tradingInventory, baseCurrency)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-red-50/50 p-3 rounded-xl border border-dashed border-red-100">
                                        <span className="text-[10px] font-black uppercase text-red-400">Step 2: Less Debts</span>
                                        <span className="text-sm font-black text-red-600">-{formatCurrency(shortTermDebts, baseCurrency)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-50">
                                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Step 3: Net Zakatable</span>
                                <div className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                                    {formatCurrency(netZakatableWealth, baseCurrency)}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Scale size={24} /></div>
                                    <h3 className="font-black text-lg text-slate-800">Nisab Threshold</h3>
                                </div>
                                <select
                                    value={nisabMethod}
                                    onChange={(e) => setNisabMethod(e.target.value)}
                                    className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-black uppercase text-slate-600 border-none outline-none"
                                >
                                    <option value="gold">Gold (85g)</option>
                                    <option value="silver">Silver (595g)</option>
                                </select>
                            </div>
                            <div className="text-3xl font-black text-slate-900 tracking-tight">
                                {formatCurrency(nisabValue, baseCurrency)}
                            </div>
                            <p className="text-xs font-bold text-slate-400 mt-4 leading-relaxed">
                                {nisabMethod === 'gold'
                                    ? `Based on 85 grams of 24k Gold valuation @ ${formatCurrency(goldPrice, baseCurrency)}/g.`
                                    : `Based on 595 grams of Silver valuation @ ${formatCurrency(silverPrice, baseCurrency)}/g.`
                                }
                            </p>

                            <div className="mt-auto pt-6 border-t border-slate-50">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Step 4: Final Zakat (2.5%)</span>
                                <div className="text-3xl font-black text-emerald-600 tracking-tight mt-1">
                                    {formatCurrency(zakatDue, baseCurrency)}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: History & Resources */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 h-full">
                        <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-3">
                            <History size={20} className="text-slate-400" />
                            Payment History
                        </h3>

                        <div className="space-y-4">
                            {zakatHistory.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <TrendingUp size={24} />
                                    </div>
                                    <p className="text-sm font-black text-slate-400">No records found.</p>
                                </div>
                            ) : (
                                zakatHistory.map(rec => (
                                    <div key={rec.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group hover:bg-emerald-50 transition-colors">
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{rec.hijri_date_display || `Hijri Year ${rec.hawl_year}`}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{new Date(rec.created_at).toLocaleDateString()} • {rec.status}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-emerald-600">{formatCurrency(rec.amount_paid, baseCurrency)}</p>
                                            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Purified</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
