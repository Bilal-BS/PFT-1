
import { ArrowUpRight, ArrowDownRight, Wallet, Activity } from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'

export default function OverviewStats({ financials, currency }) {
    return (
        <div className="p-8 h-full flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative group">
                    <div className="absolute -inset-2 bg-indigo-500/5 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                    <div className="relative">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 flex items-center gap-2">
                            <Activity size={10} />
                            Net Capital
                        </p>
                        <h3 className="text-4xl font-black text-white tracking-tighter truncate leading-none">
                            {formatCurrency(financials.balance, currency)}
                        </h3>
                    </div>
                </div>

                <div className="relative group pl-8 border-l border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 flex items-center gap-2">
                        <ArrowUpRight size={10} className="text-emerald-500" />
                        Yield Core
                    </p>
                    <h3 className="text-3xl font-black text-white/70 tracking-tighter truncate leading-none">
                        {formatCurrency(financials.income, currency)}
                    </h3>
                </div>

                <div className="relative group pl-8 border-l border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 flex items-center gap-2">
                        <ArrowDownRight size={10} className="text-rose-500" />
                        Burn Vector
                    </p>
                    <h3 className="text-3xl font-black text-white/70 tracking-tighter truncate leading-none">
                        {formatCurrency(financials.expense, currency)}
                    </h3>
                </div>
            </div>
        </div>
    )
}

