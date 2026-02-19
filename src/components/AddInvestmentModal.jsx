
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AddInvestmentModal({ isOpen, onClose, onAdded }) {
    const [name, setName] = useState('')
    const [investedAmount, setInvestedAmount] = useState('')
    const [currentValue, setCurrentValue] = useState('')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('investments').insert({
            user_id: (await supabase.auth.getUser()).data.user.id,
            name,
            invested_amount: parseFloat(investedAmount),
            current_value: parseFloat(currentValue),
            start_date: startDate
        })

        if (error) {
            console.error("Investment creation error:", error)
            alert(`Error adding investment: ${error.message}`)
        } else {
            onAdded()
            onClose()
            setName('')
            setInvestedAmount('')
            setCurrentValue('')
        }
        setLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-6 text-slate-800">Add New Investment</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Asset Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Apple Inc, Bitcoin, Real Estate"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Invested Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={investedAmount}
                                onChange={(e) => setInvestedAmount(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Current Value</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
                        >
                            {loading ? 'Adding...' : 'Add Investment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
