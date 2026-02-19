
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CURRENCIES } from '../lib/utils'

export default function CreateAccountModal({ isOpen, onClose, onAdded }) {
    const [name, setName] = useState('')
    const [type, setType] = useState('bank')
    const [balance, setBalance] = useState('0')
    const [currency, setCurrency] = useState('LKR')
    const [isZakatable, setIsZakatable] = useState(false)
    const [zakatTreatment, setZakatTreatment] = useState('zakatable')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('accounts').insert({
            user_id: (await supabase.auth.getUser()).data.user.id,
            name,
            type,
            balance: parseFloat(balance),
            currency,
            zakat_applicable: isZakatable,
            zakat_treatment: zakatTreatment
        })

        if (error) {
            alert("Error creating account")
        } else {
            onAdded()
            onClose()
            setName('')
            setBalance('0')
            setCurrency('LKR')
        }
        setLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
                <h2 className="text-2xl font-black mb-6 text-slate-800 tracking-tight">Setup New Account</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Account Identifier</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. HSBC Personal, Main Treasury"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Category</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-slate-700"
                            >
                                <option value="bank">Bank</option>
                                <option value="cash">Cash</option>
                                <option value="credit">Credit Card</option>
                                <option value="investment">Equity</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Account Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-slate-700"
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.code}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Opening Balance</label>
                        <input
                            type="number"
                            required
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-black text-2xl text-slate-900"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <input
                            type="checkbox"
                            checked={isZakatable}
                            onChange={(e) => setIsZakatable(e.target.checked)}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                        />
                        <div className="flex-1">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Zakatable Asset</p>
                            <p className="text-[10px] font-bold text-emerald-600 mb-3">Include in annual wealth tax calculation?</p>

                            {isZakatable && (
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-emerald-700 tracking-[0.1em] mb-1">Calculation Method</label>
                                    <select
                                        value={zakatTreatment}
                                        onChange={(e) => setZakatTreatment(e.target.value)}
                                        className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-1.5 text-[10px] font-bold text-emerald-800 outline-none"
                                    >
                                        <option value="zakatable">Liquid Asset / Cash</option>
                                        <option value="trading_inventory">Trading Inventory (Selling Price)</option>
                                        <option value="non_zakatable">Long-Term Investment (Capital Only)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition">Discard</button>
                        <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition active:scale-95">
                            {loading ? 'Processing...' : 'Verify & Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
