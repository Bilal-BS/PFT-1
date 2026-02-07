
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Landmark, Banknote, Briefcase, CreditCard, Plus, Calendar, Tag, FileText } from 'lucide-react'

export default function AddTransactionModal({ isOpen, onClose, onTransactionAdded }) {
    const [amount, setAmount] = useState('')
    const [type, setType] = useState('expense')
    const [category, setCategory] = useState('')
    const [note, setNote] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)

    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSelectedAccount] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchAccounts()
        }
    }, [isOpen])

    const fetchAccounts = async () => {
        const { data } = await supabase.from('accounts').select('id, name, currency, type')
        if (data && data.length > 0) {
            setAccounts(data)
            setSelectedAccount(data[0].id)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (!selectedAccount) {
            alert("Create an asset account first!")
            setLoading(false)
            return
        }

        const { error } = await supabase.from('transactions').insert({
            user_id: (await supabase.auth.getUser()).data.user.id,
            account_id: selectedAccount,
            type,
            category,
            amount: parseFloat(amount),
            note,
            transaction_date: date
        })

        if (error) {
            console.error('Transaction creation error:', error)
            alert(`Error adding transaction: ${error.message}`)
        } else {
            onTransactionAdded()
            onClose()
            setAmount('')
            setNote('')
            setCategory('')
        }
        setLoading(false)
    }

    if (!isOpen) return null

    const account = accounts.find(a => a.id === selectedAccount)

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-xl border border-slate-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Log Flow</h2>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        <button type="button" onClick={() => setType('expense')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Outflow</button>
                        <button type="button" onClick={() => setType('income')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition ${type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}>Inflow</button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Transaction Value</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-6 text-2xl font-black text-slate-300">{account?.currency || 'LKR'}</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-24 pr-8 py-6 bg-slate-50 border-none rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-4xl text-slate-900 transition-all placeholder:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Asset Source</label>
                            <div className="relative">
                                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={selectedAccount}
                                    onChange={(e) => setSelectedAccount(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 appearance-none shadow-inner"
                                >
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Classification</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Food, Rent, Salary..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Event Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Optional Memo</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Note to self..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 px-8 py-4 bg-slate-100 text-slate-500 rounded-3xl font-black hover:bg-slate-200 transition">Discard</button>
                        <button type="submit" disabled={loading} className={`flex-1 px-8 py-4 rounded-3xl font-black shadow-2xl transition-all active:scale-95 ${type === 'income' ? 'bg-green-600 text-white shadow-green-100 hover:bg-green-700' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-indigo-600'}`}>
                            {loading ? 'Processing...' : `Commit ${type === 'income' ? 'Inflow' : 'Outflow'}`}
                        </button>
                    </div>
                </form>

                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Plus size={120} />
                </div>
            </div>
        </div>
    )
}
