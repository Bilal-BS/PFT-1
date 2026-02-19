
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Landmark, Banknote, Briefcase, CreditCard, Plus, Calendar, Tag, FileText } from 'lucide-react'

export default function AddTransactionModal({ isOpen, onClose, onTransactionAdded, defaultType = 'expense' }) {
    const [amount, setAmount] = useState('')
    const [type, setType] = useState(defaultType)
    const [category, setCategory] = useState('')
    const [note, setNote] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)

    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSelectedAccount] = useState('')

    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setType(defaultType)
            setCategory('') // Reset category on type switch to avoid stale state
            fetchCategories()
            setAddToAssets(false)
            setAssetName('')
        }
    }, [isOpen, defaultType])

    useEffect(() => {
        if (isOpen) {
            fetchAccounts()
        }
    }, [isOpen])

    const fetchAccounts = async () => {
        const { data } = await supabase.from('accounts').select('id, name, currency, type')
        if (data && data.length > 0) {
            setAccounts(data)
            if (!selectedAccount) setSelectedAccount(data[0].id)
        }
    }

    const fetchCategories = async () => {
        setLoadingCategories(true)
        const { data } = await supabase.from('categories').select('*').eq('type', type)
        if (data) setCategories(data)
        setLoadingCategories(false)
    }

    const [addToAssets, setAddToAssets] = useState(false)
    const [assetName, setAssetName] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (!selectedAccount) {
            alert("Create an asset account first!")
            setLoading(false)
            return
        }

        const user = (await supabase.auth.getUser()).data.user

        // 1. Create Transaction
        const { error } = await supabase.from('transactions').insert({
            user_id: user.id,
            account_id: selectedAccount,
            type,
            category,
            amount: parseFloat(amount),
            note,
            transaction_date: date
        })

        if (error) {
            console.error('Transaction creation error:', error)
            alert('Error logging transaction: ' + error.message)
            setLoading(false)
            return
        }

        // 2. Create Asset if requested
        if (addToAssets && assetName) {
            const { error: assetError } = await supabase.from('assets').insert({
                user_id: user.id,
                name: assetName,
                value: parseFloat(amount),
                type: category === 'Investment' ? 'Investment' : 'Physical',
                description: `Auto-created from transaction on ${date}. ${note}`,
                currency: 'LKR'
            })

            if (assetError) {
                console.error("Failed to create asset:", assetError)
                alert("Transaction ledged, but failed to create Asset: " + assetError.message)
            }
        }

        onTransactionAdded()
        onClose()
        setAmount('')
        setNote('')
        setCategory('')
        setAddToAssets(false)
        setAssetName('')
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
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Account / Wallet</label>
                                <div className="relative">
                                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select
                                        value={selectedAccount}
                                        onChange={(e) => setSelectedAccount(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 appearance-none shadow-inner"
                                    >
                                        {accounts.length === 0 ? <option>No accounts found</option> : accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                                    </select>
                                </div>
                                {accounts.length === 0 && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">* Please create an account in the Accounts page first.</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Classification</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    required
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 appearance-none shadow-inner"
                                >
                                    <option value="" disabled>Select Category</option>
                                    {loadingCategories ? (
                                        <option disabled>Loading...</option>
                                    ) : (
                                        (categories.length > 0 ? categories : (
                                            type === 'income'
                                                ? ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other']
                                                : ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Shopping', 'Vehicle', 'Investment', 'Entertainment', 'Health', 'Education', 'Personal Care', 'Travel', 'Other']
                                        )).map(cat => {
                                            const val = typeof cat === 'string' ? cat : cat.name;
                                            return <option key={cat.id || val} value={val}>{val}</option>
                                        })
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Smart Asset Link - Shows for relevant categories (OUTFLOW ONLY) */}
                    {(['Investment', 'Housing', 'Vehicle', 'Shopping', 'Electronics'].includes(category)) && type === 'expense' && (
                        <div className={`p-5 rounded-3xl border transition-all duration-300 ${addToAssets ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                            <div className="flex items-center gap-4 mb-2">
                                <div className={`p-3 rounded-2xl transition-colors ${addToAssets ? 'bg-indigo-500 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-400'}`}>
                                    {category === 'Investment' ? <Banknote size={20} /> :
                                        category === 'Vehicle' ? <span className="text-lg">🚗</span> :
                                            category === 'Housing' ? <span className="text-lg">🏠</span> :
                                                <Tag size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm font-black ${addToAssets ? 'text-indigo-900' : 'text-slate-500'}`}>
                                        {category === 'Investment' ? 'Add to Portfolio' : 'Register Asset'}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {addToAssets ? 'Great! We will track this value.' : 'Want to track this purchase as an asset?'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={addToAssets} onChange={e => setAddToAssets(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            {addToAssets && (
                                <div className="mt-4 animate-in slide-in-from-top-2 fade-in pl-1">
                                    <label className="block text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1.5 ml-1">
                                        {category === 'Investment' ? 'Asset Name (e.g. Tesla Stock)' : 'Item Name'}
                                    </label>
                                    <input
                                        required={addToAssets}
                                        value={assetName}
                                        onChange={e => setAssetName(e.target.value)}
                                        placeholder="Name your asset..."
                                        className="w-full px-5 py-3.5 bg-white border border-indigo-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 text-sm transition-all"
                                    />
                                    <p className="text-[10px] text-indigo-400/60 mt-2 ml-1 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-indigo-400 inline-block"></span>
                                        This will create a record in your Assets page.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

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

                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Plus size={120} />
                </div>
            </div >
        </div >
    )
}
