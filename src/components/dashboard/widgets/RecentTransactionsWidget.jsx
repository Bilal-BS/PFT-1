
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'

export default function RecentTransactionsWidget({ transactions, currency }) {
    return (
        <div className="p-6 h-full flex flex-col overflow-y-auto no-scrollbar">
            <div className="space-y-4">
                {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-emerald-50 hover:bg-white transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${tx.type === 'income' ? 'bg-emerald-600' : 'bg-rose-500'}`}>
                                {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate">{tx.note || 'Entry'}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.category || 'General'}</p>
                            </div>
                        </div>
                        <p className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {formatCurrency(tx.amount, currency)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
