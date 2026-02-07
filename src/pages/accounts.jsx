
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency, convertCurrency } from '../lib/utils'
import { Plus, Wallet, Landmark, CreditCard, Banknote, Trash2, ShieldAlert } from 'lucide-react'
import CreateAccountModal from '../components/CreateAccountModal'
import PageHeader from '../components/PageHeader'

export default function Accounts() {
    const [accounts, setAccounts] = useState([])
    const [subscription, setSubscription] = useState(null)
    const [currency, setCurrency] = useState('LKR')
    const [rates, setRates] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchAccountData()
    }, [])

    const fetchAccountData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            const [accRes, subRes, profRes, ratesRes] = await Promise.all([
                supabase.from('accounts').select('*'),
                supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user.id).single(),
                supabase.from('profiles').select('base_currency').eq('id', user.id).single(),
                supabase.from('exchange_rates').select('*').eq('user_id', user.id)
            ])

            setAccounts(accRes.data || [])
            setSubscription(subRes.data)
            setCurrency(profRes.data?.base_currency || 'LKR')
            setRates(ratesRes.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const deleteAccount = async (id) => {
        if (!confirm("Are you sure? This will delete all balance history for this account.")) return
        const { error } = await supabase.from('accounts').delete().eq('id', id)
        if (!error) fetchAccountData()
    }

    const plan = subscription?.plans
    const maxAccounts = plan?.features?.max_accounts || 2
    const isAtLimit = accounts.length >= maxAccounts

    return (
        <div className="p-4 lg:p-8 space-y-8">
            <PageHeader
                title="Financial Treasury"
                description={`Manage your ${accounts.length} liquid assets and credit facilities.`}
                actions={(
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {accounts.length} / {maxAccounts} Slots Used
                            </span>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={isAtLimit}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition shadow-xl ${isAtLimit ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 active:scale-95'}`}
                        >
                            <Plus size={20} />
                            Add Account
                        </button>
                    </div>
                )}
            />

            {isAtLimit && (
                <div className="mb-8 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4 text-indigo-700">
                    <ShieldAlert size={20} />
                    <p className="text-sm font-bold">You've reached your plan limit. <a href="/billing" className="underline">Upgrade to Pro</a> for unlimited account slots.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(acc => (
                    <AccountCard
                        key={acc.id}
                        account={acc}
                        baseCurrency={currency}
                        rates={rates}
                        onDelete={() => deleteAccount(acc.id)}
                    />
                ))}
            </div>


            <CreateAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdded={fetchAccountData}
            />
        </div >
    )
}

function AccountCard({ account, baseCurrency, rates, onDelete }) {
    const icons = {
        bank: <Landmark />,
        cash: <Banknote />,
        credit: <CreditCard />,
        investment: <Wallet />
    }

    const isDifferentCurrency = (account.currency || 'LKR') !== baseCurrency
    const convertedBalance = convertCurrency(account.balance, account.currency || 'LKR', baseCurrency, rates)

    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition group relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
                <div className={`p-4 rounded-2xl ${account.type === 'credit' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {icons[account.type || 'bank']}
                </div>
                <button
                    onClick={onDelete}
                    className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{account.type || 'General'}</span>
                <h3 className="text-xl font-bold text-slate-900 truncate">{account.name}</h3>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
                <p className="text-3xl font-black text-slate-900 tracking-tighter">
                    {formatCurrency(account.balance, account.currency || 'LKR')}
                </p>
                {isDifferentCurrency && (
                    <p className="text-sm font-bold text-indigo-500 mt-1">
                        ≈ {formatCurrency(convertedBalance, baseCurrency)}
                    </p>
                )}
            </div>

            {/* Backdrop Decoration */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform -z-0" />
        </div>
    )
}
