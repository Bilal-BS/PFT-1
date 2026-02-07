
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import { TrendingUp, TrendingDown, Plus, Briefcase, PieChart as PieIcon, ArrowUpRight } from 'lucide-react'
import AddInvestmentModal from '../components/AddInvestmentModal'
import PageHeader from '../components/PageHeader'

export default function Investments() {
    const [investments, setInvestments] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [stats, setStats] = useState({ totalInvested: 0, totalValue: 0, totalPL: 0, totalROI: 0 })

    useEffect(() => {
        fetchInvestments()
    }, [])

    const fetchInvestments = async () => {
        setLoading(true)
        const { data } = await supabase.from('investments').select('*')
        if (data) {
            setInvestments(data)
            const invested = data.reduce((acc, curr) => acc + curr.invested_amount, 0)
            const current = data.reduce((acc, curr) => acc + curr.current_value, 0)
            const pl = current - invested
            const roi = invested > 0 ? (pl / invested) * 100 : 0
            setStats({ totalInvested: invested, totalValue: current, totalPL: pl, totalROI: roi })
        }
        setLoading(false)
    }

    return (
        <div className="p-4 lg:p-8 space-y-8">
            <PageHeader
                title="Investment Portfolio"
                description="Track your assets and market performance."
                actions={(
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-100 transition"
                    >
                        <Plus size={20} />
                        New Investment
                    </button>
                )}
            />

            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invested</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalInvested)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Market Value</span>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total P/L</span>
                    <div className={`flex items-center gap-1 mt-1 font-bold text-2xl ${stats.totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.totalPL >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        {formatCurrency(stats.totalPL)}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total ROI</span>
                    <p className={`text-2xl font-bold mt-1 ${stats.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.totalROI.toFixed(2)}%
                    </p>
                </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {investments.length === 0 ? (
                    <div className="col-span-2 bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                        <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No assets tracked yet</h3>
                        <p className="text-slate-500 mb-6 text-sm">Add your stocks, crypto, or real estate to start monitoring.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-indigo-600 font-bold hover:underline"
                        >
                            Add your first investment →
                        </button>
                    </div>
                ) : (
                    investments.map((inv) => {
                        const pl = inv.current_value - inv.invested_amount
                        const roi = (pl / inv.invested_amount) * 100
                        const isProfit = pl >= 0

                        return (
                            <div key={inv.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${isProfit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            <PieIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{inv.name}</h3>
                                            <p className="text-slate-400 text-xs font-medium">Started {new Date(inv.start_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1 font-bold text-sm ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                        {isProfit ? '+' : ''}{roi.toFixed(2)}%
                                        <ArrowUpRight size={16} className={!isProfit ? 'rotate-90' : ''} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Cost Basis</span>
                                        <span className="text-slate-700 font-bold">{formatCurrency(inv.invested_amount)}</span>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Market Value</span>
                                        <span className="text-indigo-600 font-bold">{formatCurrency(inv.current_value)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-xs text-slate-400 font-medium italic">Net Return</span>
                                    <span className={`font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                        {isProfit ? '+' : ''}{formatCurrency(pl)}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>


            <AddInvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdded={fetchInvestments}
            />
        </div >
    )
}
