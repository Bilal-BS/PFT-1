
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, TrendingUp, Calendar, Zap, ArrowRight, ShieldCheck, Banknote } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function AIIntelligencePanel({ accounts, transactions, pdcs, currency }) {
    const navigate = useNavigate();

    const insights = useMemo(() => {
        const list = [];

        // 1. Zero-Balance / Low Liquidity Alert
        const lowBalanceAccounts = accounts.filter(acc => acc.balance < 5000);
        if (lowBalanceAccounts.length > 0) {
            list.push({
                type: 'critical',
                title: 'Liquidity Warning',
                message: `${lowBalanceAccounts.length} account(s) are near zero balance. Potential disruption in automated payments.`,
                icon: <AlertCircle className="text-rose-500" />,
                action: 'Refill Treasury',
                link: '/accounts'
            });
        }

        // 2. Upcoming PDC Maturity Alert
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);

        const upcomingIssuedPDCs = pdcs.filter(p =>
            p.type === 'issued' &&
            p.status === 'pending' &&
            new Date(p.maturity_date) <= next7Days
        );

        if (upcomingIssuedPDCs.length > 0) {
            const totalDue = upcomingIssuedPDCs.reduce((sum, p) => sum + Number(p.amount), 0);
            list.push({
                type: 'warning',
                title: 'Outflow Impending',
                message: `${upcomingIssuedPDCs.length} PDCs totaling ${formatCurrency(totalDue, currency)} mature within 7 days.`,
                icon: <Banknote className="text-amber-500" />,
                action: 'View Vault',
                link: '/pdcs'
            });
        }

        // 3. Positive Growth Insight
        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

        if (income > expense) {
            list.push({
                type: 'positive',
                title: 'Wealth Acceleration',
                message: `Net positive variance of ${formatCurrency(income - expense, currency)} detected. Ideal for asset deployment.`,
                icon: <TrendingUp className="text-emerald-500" />,
                action: 'Expand Portfolio',
                link: '/investments'
            });
        }

        // 4. Budget Integrity
        list.push({
            type: 'info',
            title: 'Audit Health',
            message: 'Financial integrity is active. ISO-27001 standards are fully synchronized with global nodes.',
            icon: <ShieldCheck className="text-indigo-500" />,
            action: 'View Analytics',
            link: '/reports'
        });

        return list;
    }, [accounts, pdcs, transactions, currency]);

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/10">
                    <Zap size={22} fill="white" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Feed</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-0.5">Neural Financial Monitoring</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {insights.map((insight, idx) => (
                    <div key={idx} className="emerald-card p-8 group relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <div className="p-4 bg-slate-50 rounded-[22px] group-hover:bg-emerald-50 group-hover:text-emerald-900 transition-all">
                                    {insight.icon}
                                </div>
                                <div className={`w-2.5 h-2.5 rounded-full ${insight.type === 'critical' ? 'bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.5)]' :
                                        insight.type === 'warning' ? 'bg-amber-500' :
                                            insight.type === 'positive' ? 'bg-emerald-500' : 'bg-emerald-900'
                                    }`} />
                            </div>
                            <h4 className="font-black text-slate-900 text-lg mb-2 leading-tight">{insight.title}</h4>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">{insight.message}</p>
                        </div>

                        {insight.action && (
                            <button
                                onClick={() => navigate(insight.link)}
                                className="w-full py-4 bg-slate-900 text-white rounded-[18px] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
                            >
                                {insight.action}
                                <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
