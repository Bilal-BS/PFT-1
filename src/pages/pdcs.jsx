
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import {
    Landmark, Plus, Search, Filter, Calendar,
    ArrowRight, CheckCircle2, AlertCircle, Trash2, Tag, Info
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function PDCs() {
    const [pdcs, setPdcs] = useState([])
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filterType, setFilterType] = useState('all') // all, issued, received

    useEffect(() => {
        fetchPDCData()
    }, [])

    const fetchPDCData = async () => {
        try {
            setLoading(true)
            const [pdcRes, accRes] = await Promise.all([
                supabase.from('pdcs').select('*').order('maturity_date', { ascending: true }),
                supabase.from('accounts').select('*')
            ])
            setPdcs(pdcRes.data || [])
            setAccounts(accRes.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const clearCheque = async (id) => {
        const { error } = await supabase.from('pdcs').update({ status: 'cleared' }).eq('id', id)
        if (!error) fetchPDCData()
    }

    const deleteCheque = async (id) => {
        if (!confirm("Permenantly remove this cheque record?")) return
        const { error } = await supabase.from('pdcs').delete().eq('id', id)
        if (!error) fetchPDCData()
    }

    const filtered = pdcs.filter(p => filterType === 'all' ? true : p.type === filterType)

    return (
        <div className="p-4 lg:p-8 space-y-8">
            <PageHeader
                title="PDC Vault"
                description="Manage and track Post-Dated Cheque maturity dates."
                actions={(
                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                            {['all', 'issued', 'received'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition shadow-xl active:scale-95">
                            <Plus size={18} />
                            Log Cheque
                        </button>
                    </div>
                )}
            />
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                        <Info size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1.5">Pending Maturity</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(pdcs.filter(p => p.status === 'pending').reduce((a, b) => a + b.amount, 0))}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1.5">Cleared Volume</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(pdcs.filter(p => p.status === 'cleared').reduce((a, b) => a + b.amount, 0))}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1.5">Maturity Alerts</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{pdcs.filter(p => p.status === 'pending' && new Date(p.maturity_date) < new Date()).length} Critical</p>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Maturity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Cheque Details</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Party / Entity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((pdc) => {
                                const isOverdue = pdc.status === 'pending' && new Date(pdc.maturity_date) < new Date()
                                return (
                                    <tr key={pdc.id} className="group hover:bg-slate-50/50 transition whitespace-nowrap">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={16} className={isOverdue ? 'text-red-500' : 'text-indigo-400'} />
                                                <span className={`font-black tracking-tight ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {new Date(pdc.maturity_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            {isOverdue && <span className="text-[8px] font-black uppercase text-red-400 bg-red-50 px-2 py-0.5 rounded ml-7 mt-1 block w-fit">Overdue Maturity</span>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900">{pdc.cheque_number}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pdc.bank_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${pdc.type === 'received' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {pdc.type === 'received' ? <Plus size={12} /> : <ArrowRight size={12} />}
                                                </div>
                                                <span className="font-bold text-slate-600">{pdc.payee_payer}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-lg font-black text-slate-900">{formatCurrency(pdc.amount, pdc.currency)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${pdc.status === 'cleared' ? 'bg-green-50 text-green-600' :
                                                    pdc.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                                                        'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {pdc.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {pdc.status === 'pending' && (
                                                    <button
                                                        onClick={() => clearCheque(pdc.id)}
                                                        className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                                                        title="Clear Cheque"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => deleteCheque(pdc.id)} className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-medium italic">No PDC records found in the vault.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
