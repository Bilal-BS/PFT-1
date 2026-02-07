
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import { Target, AlertCircle, CheckCircle2, Plus, Calendar } from 'lucide-react'
import SetBudgetModal from '../components/SetBudgetModal'
import PageHeader from '../components/PageHeader'

export default function Budgets() {
    const [budgets, setBudgets] = useState([])
    const [spending, setSpending] = useState({})
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

    useEffect(() => {
        fetchBudgetData()
    }, [currentMonth, currentYear])

    const fetchBudgetData = async () => {
        setLoading(true)
        // 1. Fetch Budgets
        const { data: budgetData } = await supabase
            .from('budgets')
            .select('*')
            .eq('month', currentMonth)
            .eq('year', currentYear)

        // 2. Fetch Spending for these categories
        const { data: txData } = await supabase
            .from('transactions')
            .select('category, amount')
            .eq('type', 'expense')
        // Note: In real app, we'd filter by month/year here too. 
        // For demo, we just group by category.

        const spendingMap = {}
        txData?.forEach(tx => {
            spendingMap[tx.category] = (spendingMap[tx.category] || 0) + tx.amount
        })

        setBudgets(budgetData || [])
        setSpending(spendingMap)
        setLoading(false)
    }

    return (
        <div className="p-4 lg:p-8 space-y-8">
            <PageHeader
                title="Budget Tracking"
                description="Monitor your spending limits and save more."
                actions={(
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
                            <button
                                onClick={() => setCurrentMonth(m => m > 1 ? m - 1 : 12)}
                                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"
                            >
                                ←
                            </button>
                            <div className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2">
                                <Calendar size={16} className="text-indigo-500" />
                                {new Date(0, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
                            </div>
                            <button
                                onClick={() => setCurrentMonth(m => m < 12 ? m + 1 : 1)}
                                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"
                            >
                                →
                            </button>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-100 dark:shadow-none transition"
                        >
                            <Plus size={20} />
                            Set Budget
                        </button>
                    </div>
                )}
            />

            {budgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center animate-in fade-in fill-mode-both duration-500">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                        <Target size={40} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No budgets set for this month</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">Take control of your finances by creating personal spending limits for each category.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                    >
                        Create First Budget
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => {
                        const spent = spending[budget.category] || 0
                        const percent = Math.min((spent / budget.amount) * 100, 100)
                        const isOver = spent > budget.amount
                        const remaining = budget.amount - spent

                        return (
                            <div key={budget.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{budget.category}</h3>
                                        <p className="text-xs text-slate-400 font-medium">Monthly Target: {formatCurrency(budget.amount)}</p>
                                    </div>
                                    {isOver ? (
                                        <AlertCircle size={20} className="text-red-500 animate-pulse" />
                                    ) : (
                                        <CheckCircle2 size={20} className="text-green-500" />
                                    )}
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-500 dark:text-slate-400 uppercase">Spent {percent.toFixed(0)}%</span>
                                        <span className={isOver ? 'text-red-600' : 'text-slate-900 dark:text-white'}>
                                            {isOver ? 'Over Budget' : `${formatCurrency(remaining)} left`}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${isOver ? 'bg-red-500' : percent > 80 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-50 dark:border-slate-700">
                                    <span className="text-slate-400 font-medium italic">Current Spending</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(spent)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}


            <SetBudgetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdded={fetchBudgetData}
            />
        </div >
    )
}
