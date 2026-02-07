
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AddLoanModal({ isOpen, onClose, onAdded }) {
    const [personName, setPersonName] = useState('')
    const [type, setType] = useState('given') // 'given' or 'taken'
    const [principal, setPrincipal] = useState('')
    const [interestRate, setInterestRate] = useState('0')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('loans').insert({
            user_id: (await supabase.auth.getUser()).data.user.id,
            person_name: personName,
            type,
            principal: parseFloat(principal),
            interest_rate: parseFloat(interestRate),
            start_date: startDate,
            status: 'active'
        })

        if (error) {
            alert("Error adding loan")
        } else {
            onAdded()
            onClose()
            setPersonName('')
            setPrincipal('')
        }
        setLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-6 text-slate-800">New Loan Record</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Loan Direction</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setType('given')}
                                className={`flex-1 py-2 rounded-xl border text-sm font-bold transition ${type === 'given' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                            >
                                I Lent Money
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('taken')}
                                className={`flex-1 py-2 rounded-xl border text-sm font-bold transition ${type === 'taken' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                            >
                                I Borrowed Money
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Person / Institution Name</label>
                        <input
                            type="text"
                            required
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value)}
                            placeholder="Who is this with?"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Principal Amount</label>
                            <input
                                type="number"
                                required
                                value={principal}
                                onChange={(e) => setPrincipal(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Interest Rate (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition">
                            {loading ? 'Recording...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
