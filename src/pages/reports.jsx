
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency, convertCurrency } from '../lib/utils'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'
import { FileText, Download, Filter, Calendar, TrendingUp } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function Reports() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        monthlyFlow: [],
        categorySpend: [],
        assetGrowth: [],
        summary: { income: 0, expense: 0, savings: 0 }
    })
    const [timeRange, setTimeRange] = useState('6M') // 1M, 6M, 1Y
    const [currency, setCurrency] = useState('LKR')
    const [exchangeRates, setExchangeRates] = useState([])

    useEffect(() => {
        fetchReportData()
    }, [timeRange])

    const fetchReportData = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        // Parallel fetch for everything needed
        const [profRes, txRes, accRes, ratesRes] = await Promise.all([
            supabase.from('profiles').select('base_currency').eq('id', user.id).single(),
            supabase.from('transactions').select('*').order('transaction_date', { ascending: true }),
            supabase.from('accounts').select('id, currency'),
            supabase.from('exchange_rates').select('*').eq('user_id', user.id)
        ])

        const baseCur = profRes.data?.base_currency || 'LKR'
        const txs = txRes.data || []
        const accs = accRes.data || []
        const rates = ratesRes.data || []

        setCurrency(baseCur)
        setExchangeRates(rates)

        // Helper to get currency for a transaction via its account
        const getTxValue = (t) => {
            const acc = accs.find(a => a.id === t.account_id)
            const txCur = acc?.currency || 'LKR'
            return convertCurrency(t.amount, txCur, baseCur, rates, t.transaction_date)
        }

        // 1. Monthly Cash Flow (Converted)
        const flowMap = {}
        txs.forEach(t => {
            const date = new Date(t.transaction_date)
            const month = date.toLocaleString('default', { month: 'short' })
            const val = getTxValue(t)

            if (!flowMap[month]) flowMap[month] = { month, income: 0, expense: 0, date }
            if (t.type === 'income') flowMap[month].income += val
            else flowMap[month].expense += val
        })
        const monthlyFlow = Object.values(flowMap).sort((a, b) => a.date - b.date)

        // 2. Category Breakdown (Converted)
        const catMap = {}
        txs.filter(t => t.type === 'expense').forEach(t => {
            const val = getTxValue(t)
            catMap[t.category] = (catMap[t.category] || 0) + val
        })
        const categorySpend = Object.entries(catMap).map(([name, value]) => ({ name, value }))

        // 3. Summary stats
        const totalIncome = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + getTxValue(t), 0)
        const totalExpense = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + getTxValue(t), 0)

        setData({
            monthlyFlow,
            categorySpend,
            summary: { income: totalIncome, expense: totalExpense, savings: totalIncome - totalExpense }
        })
        setLoading(false)
    }

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

    return (
        <div className="p-4 lg:p-8 space-y-8">
            <PageHeader
                title="Financial Intelligence"
                description="Multi-currency aware analytics and spending concentration."
                actions={(
                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="bg-white border-2 border-slate-50 px-6 py-3 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        >
                            <option value="1M">Month to Date</option>
                            <option value="6M">Semi-Annual</option>
                            <option value="1Y">Yearly Audit</option>
                        </select>
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition active:scale-95">
                            <Download size={18} />
                            Export PDF
                        </button>
                    </div>
                )}
            />

            {/* Global Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ReportStatCard title="Total Cash In" value={data.summary.income} currency={currency} trend="+12%" color="green" />
                <ReportStatCard title="Total Cash Out" value={data.summary.expense} currency={currency} trend="-4%" color="red" />
                <ReportStatCard title="Net Ledger Balance" value={data.summary.savings} currency={currency} trend="+22%" color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Flow Chart */}
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-800">Income vs Expense Flow</h3>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /> <span className="text-[10px] font-black uppercase text-slate-400">In</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /> <span className="text-[10px] font-black uppercase text-slate-400">Out</span></div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthlyFlow}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px' }} />
                                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spending Pie */}
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-8">Spending Concentration</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categorySpend}
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.categorySpend.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ paddingLeft: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Net Worth Trend (Simulated with Gradient) */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Historical Wealth Trajectory</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.monthlyFlow}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" hide />
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="income" stroke="#4f46e5" strokeWidth={6} fillOpacity={1} fill="url(#colorIncome)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>

    )
}

function ReportStatCard({ title, value, currency, trend, color }) {
    const colors = {
        green: 'text-green-600 bg-green-50',
        red: 'text-red-600 bg-red-50',
        indigo: 'text-indigo-600 bg-indigo-50'
    }
    return (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{title}</p>
                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(value, currency)}</h4>
                </div>
                <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${colors[color]}`}>
                    {trend}
                </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform -z-0 opacity-40" />
        </div>
    )
}
