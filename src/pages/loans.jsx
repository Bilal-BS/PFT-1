
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import { Handshake, ArrowDownLeft, ArrowUpRight, Plus, Clock, CheckCircle2 } from 'lucide-react'
import AddLoanModal from '../components/AddLoanModal'
import PageHeader from '../components/PageHeader'

export default function Loans() {
    const [loans, setLoans] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [summary, setSummary] = useState({ given: 0, taken: 0 })

    useEffect(() => {
        fetchLoans()
    }, [])

    const fetchLoans = async () => {
        setLoading(true)
        const { data } = await supabase.from('loans').select('*')
        if (data) {
            setLoans(data)
            const given = data.filter(l => l.type === 'given' && l.status === 'active').reduce((acc, curr) => acc + curr.principal, 0)
            const taken = data.filter(l => l.type === 'taken' && l.status === 'active').reduce((acc, curr) => acc + curr.principal, 0)
            setSummary({ given, taken })
        }
        setLoading(false)
    }

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'completed' : 'active'
        const { error } = await supabase.from('loans').update({ status: newStatus }).eq('id', id)
        if (!error) fetchLoans()
    }

    return (
        <div className="p-4 lg:p-8 space-y-8">
            <PageHeader
                title="Debt & Loans"
                description="Manage money you've lent or borrowed."
                actions={(
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-100 transition"
                    >
                        <Plus size={20} />
                        Record Loan
                    </button>
                )}
            />

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                        <ArrowUpRight size={32} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Receivable</span>
                        <p className="text-3xl font-bold text-slate-900">{formatCurrency(summary.given)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                        <ArrowDownLeft size={32} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Payable</span>
                        <p className="text-3xl font-bold text-slate-900">{formatCurrency(summary.taken)}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Section 1: Money Lent */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Handshake size={20} className="text-green-500" />
                        <h2 className="text-xl font-bold text-slate-800">Money Lent (Receivable)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loans.filter(l => l.type === 'given').length === 0 ? (
                            <p className="col-span-full text-slate-400 text-sm italic">You haven't lent money to anyone recently.</p>
                        ) : (
                            loans.filter(l => l.type === 'given').map(loan => (
                                <LoanCard key={loan.id} loan={loan} onToggle={() => toggleStatus(loan.id, loan.status)} />
                            ))
                        )}
                    </div>
                </div>

                {/* Section 2: Money Borrowed */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Handshake size={20} className="text-red-500" />
                        <h2 className="text-xl font-bold text-slate-800">Money Borrowed (Payable)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loans.filter(l => l.type === 'taken').length === 0 ? (
                            <p className="col-span-full text-slate-400 text-sm italic">You don't have any active borrowings.</p>
                        ) : (
                            loans.filter(l => l.type === 'taken').map(loan => (
                                <LoanCard key={loan.id} loan={loan} onToggle={() => toggleStatus(loan.id, loan.status)} />
                            ))
                        )}
                    </div>
                </div>
            </div>


            <AddLoanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdded={fetchLoans}
            />
        </div >
    )
}

function LoanCard({ loan, onToggle }) {
    const isActive = loan.status === 'active'
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition duration-300 ${!isActive ? 'opacity-60 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-slate-900">{loan.person_name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Recorded {new Date(loan.start_date).toLocaleDateString()}</p>
                </div>
                <button
                    onClick={onToggle}
                    className={`p-2 rounded-lg transition ${isActive ? 'bg-slate-50 text-slate-400 hover:text-green-600 hover:bg-green-50' : 'bg-green-50 text-green-600'}`}
                    title={isActive ? "Mark as paid" : "Reopen loan"}
                >
                    {isActive ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                </button>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">{formatCurrency(loan.principal)}</span>
                {loan.interest_rate > 0 && <span className="text-xs font-bold text-slate-400">@ {loan.interest_rate}%</span>}
            </div>
            <div className={`mt-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                {loan.status}
            </div>
        </div>
    )
}
