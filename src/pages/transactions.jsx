
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Trash2, Calendar, Tag, Wallet } from 'lucide-react'
import AddTransactionModal from '../components/AddTransactionModal'
import PageHeader from '../components/PageHeader'

export default function Transactions() {
    const [transactions, setTransactions] = useState([])
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all') // all, income, expense
    const [currency, setCurrency] = useState('LKR')

    useEffect(() => {
        fetchTransactionData()
    }, [])

    const fetchTransactionData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            const [txRes, accRes, profRes] = await Promise.all([
                supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
                supabase.from('accounts').select('*'),
                supabase.from('profiles').select('base_currency').eq('id', user.id).single()
            ])

            setTransactions(txRes.data || [])
            setAccounts(accRes.data || [])
            setCurrency(profRes.data?.base_currency || 'LKR')
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const deleteTransaction = async (id) => {
        if (!confirm("Delete this entry?")) return
        const { error } = await supabase.from('transactions').delete().eq('id', id)
        if (!error) fetchTransactionData()
    }

    const filtered = transactions.filter(tx => {
        const matchesSearch = tx.note?.toLowerCase().includes(searchQuery.toLowerCase()) || tx.category?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' ? true : tx.type === filterType
        return matchesSearch && matchesType
    })

    return (
        <div className="p-4 lg:p-8 space-y-8">
            <PageHeader
                title="Financial Ledger"
                description="A complete history of your cashflow across all linked accounts."
                actions={(
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95"
                    >
                        <Plus size={20} />
                        Log Transaction
                    </button>
                )}
            />

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by category, date or notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {['all', 'income', 'expense'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition ${filterType === type ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Transaction Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Asset Source</th>
                                <th className="px-8 py-5 text-[10px) font-black uppercase text-slate-400 tracking-[0.2em]">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Memo</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Value</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(tx => (
                                <tr key={tx.id} className="group hover:bg-slate-50/50 transition whitespace-nowrap">
                                    <td className="px-8 py-6 font-bold text-slate-500 flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {tx.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        </div>
                                        {new Date(tx.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Wallet size={14} className="text-slate-300" />
                                            <span className="font-bold text-slate-700">{accounts.find(a => a.id === tx.account_id)?.name || 'Deleted Account'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest">{tx.category}</span>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-slate-400 max-w-xs truncate">{tx.note || 'No memo added'}</td>
                                    <td className={`px-8 py-6 text-right font-black text-lg ${tx.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => deleteTransaction(tx.id)}
                                            className="p-2 text-slate-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-medium italic">No ledger entries found for the current filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTransactionAdded={fetchTransactionData}
            />
        </div >
    )
}
