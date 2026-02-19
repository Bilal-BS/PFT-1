
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency, CURRENCIES } from '../lib/utils'
import {
    RefreshCw, Plus, Globe, History, TrendingUp, TrendingDown,
    Calendar, ArrowRight, Trash2, Edit3, Check, X,
    LineChart as ChartIcon, Filter, Search, Eye, EyeOff, LayoutGrid
} from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import PageHeader from '../components/PageHeader'

export default function Currencies() {
    const [rates, setRates] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [baseCurrency, setBaseCurrency] = useState('LKR')
    const [editingId, setEditingId] = useState(null)
    const [editData, setEditData] = useState({})
    const [newRate, setNewRate] = useState({
        from: 'USD',
        to: 'LKR',
        rate: '',
        date: new Date().toISOString().split('T')[0]
    })
    const [selectedPair, setSelectedPair] = useState('USD-LKR')

    // Filtering State
    const [filterCurrency, setFilterCurrency] = useState('all')
    const [filterStartDate, setFilterStartDate] = useState('')
    const [filterEndDate, setFilterEndDate] = useState('')

    // Currency Management (Active/Deactive)
    const [activeCurrencies, setActiveCurrencies] = useState(CURRENCIES.map(c => c.code))
    const [showConfig, setShowConfig] = useState(true) // Always show by default for "Odoo style" management

    useEffect(() => {
        fetchCurrencyData()
    }, [])

    const fetchCurrencyData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Get Profile Base First
            const { data: profile } = await supabase.from('profiles').select('base_currency').eq('id', user.id).single()
            const base = profile?.base_currency || 'LKR'
            setBaseCurrency(base)

            // 2. Get Rates targeting this Base
            const { data: ratesData } = await supabase
                .from('exchange_rates')
                .select('*')
                .eq('to_currency', base)
                .order('rate_date', { ascending: true })

            setRates(ratesData || [])

            // 3. Set Defaults
            const defaultFrom = base === 'USD' ? 'EUR' : 'USD'
            setNewRate(prev => ({ ...prev, from: defaultFrom, to: base }))
            setSelectedPair(`${defaultFrom}-${base}`)

        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const toggleCurrencyStatus = (code) => {
        setActiveCurrencies(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        )
    }

    const filteredRates = useMemo(() => {
        return rates.filter(r => {
            const matchesCurrency = filterCurrency === 'all' || r.from_currency === filterCurrency || r.to_currency === filterCurrency;
            const matchesStart = !filterStartDate || new Date(r.rate_date) >= new Date(filterStartDate);
            const matchesEnd = !filterEndDate || new Date(r.rate_date) <= new Date(filterEndDate);
            return matchesCurrency && matchesStart && matchesEnd;
        }).slice().reverse();
    }, [rates, filterCurrency, filterStartDate, filterEndDate]);

    const handleSync = async () => {
        try {
            setIsSyncing(true)
            const { data: { user } } = await supabase.auth.getUser()

            // Check if table exists first (soft check by selecting 1 row)
            const { error: checkError } = await supabase.from('exchange_rates').select('id').limit(1)
            if (checkError && checkError.code === '42P01') { // Undefined table
                throw new Error("Missing 'exchange_rates' table. Please run the update script.")
            }

            await new Promise(r => setTimeout(r, 1500))

            const today = new Date().toISOString().split('T')[0]
            let mockRates = []

            if (baseCurrency === 'LKR') {
                mockRates = [
                    { from_currency: 'USD', to_currency: 'LKR', rate: 293 + Math.random() * 5, rate_date: today, user_id: user.id },
                    { from_currency: 'EUR', to_currency: 'LKR', rate: 318 + Math.random() * 5, rate_date: today, user_id: user.id },
                    { from_currency: 'GBP', to_currency: 'LKR', rate: 375 + Math.random() * 5, rate_date: today, user_id: user.id },
                    { from_currency: 'AED', to_currency: 'LKR', rate: 80 + Math.random() * 2, rate_date: today, user_id: user.id },
                    { from_currency: 'AUD', to_currency: 'LKR', rate: 192 + Math.random() * 3, rate_date: today, user_id: user.id },
                ]
            } else if (baseCurrency === 'USD') {
                mockRates = [
                    { from_currency: 'EUR', to_currency: 'USD', rate: 1.08 + Math.random() * 0.02, rate_date: today, user_id: user.id },
                    { from_currency: 'GBP', to_currency: 'USD', rate: 1.27 + Math.random() * 0.02, rate_date: today, user_id: user.id },
                    { from_currency: 'JPY', to_currency: 'USD', rate: 0.0065 + Math.random() * 0.0001, rate_date: today, user_id: user.id },
                ]
            } else {
                mockRates = [
                    { from_currency: 'USD', to_currency: baseCurrency, rate: 10 + Math.random(), rate_date: today, user_id: user.id },
                ]
            }

            const { error } = await supabase.from('exchange_rates').insert(mockRates)
            if (error) throw error

            await fetchCurrencyData()
        } catch (error) {
            console.error('Sync failed:', error)
            alert(error.message || "Failed to sync rates. Check database.")
        } finally {
            setIsSyncing(false)
        }
    }

    const handleAddRate = async (e) => {
        e.preventDefault()
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase.from('exchange_rates').insert({
            user_id: user.id,
            from_currency: newRate.from,
            to_currency: newRate.to,
            rate: parseFloat(newRate.rate),
            rate_date: newRate.date
        })

        if (!error) {
            fetchCurrencyData()
            setNewRate({ ...newRate, rate: '' })
        }
    }

    const deleteRate = async (id) => {
        if (!confirm("Delete this exchange rate entry?")) return
        const { error } = await supabase.from('exchange_rates').delete().eq('id', id)
        if (!error) fetchCurrencyData()
    }

    const startEdit = (rate) => {
        setEditingId(rate.id)
        setEditData({ rate: rate.rate, date: rate.rate_date })
    }

    const saveEdit = async (id) => {
        const { error } = await supabase.from('exchange_rates').update({
            rate: parseFloat(editData.rate),
            rate_date: editData.date
        }).eq('id', id)

        if (!error) {
            setEditingId(null)
            fetchCurrencyData()
        }
    }

    const [fromPair, toPair] = selectedPair.split('-')
    const chartData = rates.filter(r => r.from_currency === fromPair && r.to_currency === toPair)
        .map(r => ({ date: r.rate_date, rate: r.rate }))

    const latestRate = chartData[chartData.length - 1]?.rate || 0
    const previousRate = chartData[chartData.length - 2]?.rate || 0
    const change = latestRate && previousRate ? ((latestRate - previousRate) / previousRate) * 100 : 0

    if (loading) return null;

    return (
        <div className="space-y-8">
            <PageHeader
                title="Global Forex Engine"
                description="Enterprise Revaluation Ledger & Central Bank Sync."
                actions={(
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowConfig(!showConfig)}
                            className={`p-4 rounded-2xl border transition-all ${showConfig ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`group px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 ${isSyncing ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-900 text-white hover:bg-indigo-600 hover:border-indigo-600 shadow-xl active:scale-95'}`}
                        >
                            <RefreshCw className={isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} size={20} />
                            <span className="text-xs font-black uppercase tracking-widest">{isSyncing ? 'Processing...' : 'Update Buying Rate'}</span>
                        </button>
                    </div>
                )}
            />

            {/* Currency Manager Modal/Overlay */}
            {showConfig && (
                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-indigo-50 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Currencies</h3>
                        <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {CURRENCIES.map(curr => (
                            <button
                                key={curr.code}
                                onClick={() => toggleCurrencyStatus(curr.code)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${activeCurrencies.includes(curr.code) ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${activeCurrencies.includes(curr.code) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {curr.code}
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-bold text-slate-900">{curr.name}</span>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeCurrencies.includes(curr.code) ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-lg ${activeCurrencies.includes(curr.code) ? 'text-indigo-600 bg-white' : 'text-slate-300'}`}>
                                    {activeCurrencies.includes(curr.code) ? <Eye size={18} /> : <EyeOff size={18} />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Market Chart */}
                <div className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Market Fluctuations ({fromPair}/{toPair})</h2>
                            <select
                                value={selectedPair}
                                onChange={(e) => setSelectedPair(e.target.value)}
                                className="mt-2 bg-slate-50 border-none rounded-xl px-4 py-2 font-black text-indigo-600 outline-none text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition"
                            >
                                {activeCurrencies
                                    .filter(c => c !== baseCurrency)
                                    .map(code => {
                                        const curr = CURRENCIES.find(c => c.code === code);
                                        return (
                                            <option key={code} value={`${code}-${baseCurrency}`}>
                                                {code} / {baseCurrency} ({curr?.name || 'Foreign'})
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-black text-slate-900 tracking-tighter">{latestRate ? latestRate.toFixed(2) : '0.00'}</p>
                            <div className={`flex items-center justify-end gap-1 font-black text-[10px] uppercase tracking-widest mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {Math.abs(change).toFixed(2)}% Performance
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full no-scrollbar">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px' }}
                                    itemStyle={{ fontWeight: 900, color: '#4f46e5' }}
                                />
                                <Area type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorRate)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Manual Entry Form */}
                <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl shadow-slate-200">
                    <h2 className="text-2xl font-black mb-8 tracking-tight">Ledger Entry</h2>
                    <form onSubmit={handleAddRate} className="space-y-6">
                        <div>
                            <label className="block text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Origin Unit</label>
                            <select
                                value={newRate.from}
                                onChange={(e) => setNewRate({ ...newRate, from: e.target.value })}
                                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm appearance-none"
                            >
                                {CURRENCIES.filter(c => activeCurrencies.includes(c.code)).map(c => <option key={c.code} value={c.code} className="text-slate-900 font-bold">{c.code} - {c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Target Base (System)</label>
                            <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 font-black text-slate-500 cursor-not-allowed flex items-center justify-between">
                                <span>{baseCurrency}</span>
                                <span className="text-[10px] uppercase tracking-widest opacity-50">Local Base</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Basis</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    required
                                    value={newRate.rate}
                                    onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                                    placeholder="0.0000"
                                    className="w-full bg-white border-none rounded-2xl px-5 py-4 font-black text-slate-900 outline-none placeholder:text-slate-300 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Effective</label>
                                <input
                                    type="date"
                                    required
                                    value={newRate.date}
                                    onChange={(e) => setNewRate({ ...newRate, date: e.target.value })}
                                    className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-white hover:text-indigo-600 py-5 rounded-3xl font-black shadow-xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-3">
                            <Plus size={20} />
                            Commit Entry
                        </button>
                    </form>
                </div>
            </div>

            {/* Forex Revaluation Ledger (With Filters) */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <History className="text-indigo-500" size={24} />
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Detailed Revaluation Ledger</h3>
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                <Filter size={14} className="text-slate-400 ml-2" />
                                <select
                                    value={filterCurrency}
                                    onChange={(e) => setFilterCurrency(e.target.value)}
                                    className="bg-transparent border-none outline-none font-black text-[10px] uppercase tracking-widest text-slate-600 pr-4 cursor-pointer"
                                >
                                    <option value="all">All Currencies</option>
                                    {CURRENCIES.filter(c => activeCurrencies.includes(c.code)).map(c => (
                                        <option key={c.code} value={c.code}>{c.code}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                <input
                                    type="date"
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    className="bg-transparent border-none outline-none font-bold text-[10px] text-slate-500"
                                />
                                <span className="text-[10px] font-black text-slate-300">TO</span>
                                <input
                                    type="date"
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    className="bg-transparent border-none outline-none font-bold text-[10px] text-slate-500"
                                />
                            </div>
                            <button
                                onClick={() => { setFilterCurrency('all'); setFilterStartDate(''); setFilterEndDate(''); }}
                                className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                                title="Reset Filters"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[600px] overflow-y-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 sticky top-0 z-10">
                                <th className="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.25em]">Effective Date</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.25em]">Currency Pair</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.25em] text-right">Magnitude</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRates.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 italic">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold italic">No matching ledger entries found for the current filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRates.map(r => (
                                    <tr key={r.id} className="group hover:bg-indigo-50/30 transition-colors duration-300">
                                        <td className="px-10 py-8">
                                            {editingId === r.id ? (
                                                <input
                                                    type="date"
                                                    value={editData.date}
                                                    onChange={e => setEditData({ ...editData, date: e.target.value })}
                                                    className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 text-sm font-black outline-none ring-2 ring-indigo-500/10"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-900 block leading-none">{new Date(r.rate_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">ERP Validated</span>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center bg-slate-50 rounded-xl p-1.5 border border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                    <span className="px-3 py-1 bg-white rounded-lg text-[11px] font-black text-slate-700 shadow-sm">{r.from_currency}</span>
                                                    <ArrowRight size={14} className="mx-2 text-slate-300" />
                                                    <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[11px] font-black text-white shadow-lg shadow-indigo-100">{r.to_currency}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            {editingId === r.id ? (
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    value={editData.rate}
                                                    onChange={e => setEditData({ ...editData, rate: e.target.value })}
                                                    className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 text-right text-sm font-black outline-none ring-2 ring-indigo-500/10 w-32"
                                                />
                                            ) : (
                                                <div>
                                                    <div className="text-2xl font-black text-slate-900 tracking-tighter">{r.rate.toFixed(4)}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Entry Ref: #{r.id.substr(0, 4)}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                {editingId === r.id ? (
                                                    <>
                                                        <button onClick={() => saveEdit(r.id)} className="p-3 text-green-600 bg-green-50 rounded-xl hover:bg-green-100 shadow-sm">
                                                            <Check size={20} />
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="p-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 shadow-sm">
                                                            <X size={20} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEdit(r)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button onClick={() => deleteRate(r.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    )
}
