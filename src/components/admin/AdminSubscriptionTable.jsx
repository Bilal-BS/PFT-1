import { formatCurrency } from '../../lib/utils';

export default function AdminSubscriptionTable({ plans, users }) {
    // Calculate stats per plan
    const planStats = plans.map(plan => {
        const planUsers = users.filter(u => u.plan_id === plan.id);
        const active = planUsers.filter(u => u.status === 'active').length;
        const expired = planUsers.filter(u => u.status === 'expired').length;
        const revenue = active * plan.price; // Simplified MRR calc

        return {
            ...plan,
            active,
            expired,
            revenue
        };
    });

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm h-full">
            <h3 className="text-xl font-black text-slate-900 mb-6">Subscription Overview</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 rounded-xl">
                        <tr>
                            <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest rounded-l-xl">Plan</th>
                            <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest">Active</th>
                            <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest">Expired</th>
                            <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest rounded-r-xl text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {planStats.map(stat => (
                            <tr key={stat.id}>
                                <td className="px-4 py-4 font-black text-slate-700 text-sm">{stat.name}</td>
                                <td className="px-4 py-4 font-bold text-slate-500 text-xs">{stat.active}</td>
                                <td className="px-4 py-4 font-bold text-slate-400 text-xs">{stat.expired}</td>
                                <td className="px-4 py-4 font-black text-emerald-600 text-sm text-right">{formatCurrency(stat.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
