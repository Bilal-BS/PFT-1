import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminStatCard({ icon, label, value, trend, trendValue, color }) {
    const colors = {
        indigo: 'bg-indigo-600 text-white shadow-indigo-200',
        emerald: 'bg-emerald-600 text-white shadow-emerald-200',
        blue: 'bg-blue-600 text-white shadow-blue-200',
        amber: 'bg-amber-500 text-white shadow-amber-200',
        rose: 'bg-rose-500 text-white shadow-rose-200',
        violet: 'bg-violet-600 text-white shadow-violet-200',
    };

    const iconColors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
        violet: 'bg-violet-50 text-violet-600',
    };

    return (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 group hover:-translate-y-1 transition-all duration-500 hover:shadow-xl hover:border-slate-50 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${iconColors[color] || iconColors.indigo} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trendValue}
                    </div>
                )}
            </div>

            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
            </div>

            {/* Background decoration */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 ${colors[color] || colors.indigo} pointer-events-none`} />
        </div>
    );
}
