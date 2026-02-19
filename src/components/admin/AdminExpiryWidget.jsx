import { Clock, AlertCircle } from 'lucide-react';

export default function AdminExpiryWidget({ users }) {
    // Mock logic for expiring soon (since we might not have expiry dates for everyone yet)
    // Filter users with status 'active' and random expiry logic or just mock it for now
    const expiringUsers = users.filter(u => u.status === 'active').slice(0, 5); // Just take 5 for demo

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">Expiring Soon</h3>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <AlertCircle size={18} />
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
                {expiringUsers.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 font-bold text-sm">No expirations pending.</div>
                ) : (
                    expiringUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group hover:bg-amber-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-xs text-slate-700 shadow-sm">
                                    {user.full_name?.[0]}
                                </div>
                                <div>
                                    <div className="text-xs font-black text-slate-900">{user.full_name}</div>
                                    <div className="text-[10px] font-bold text-slate-400">Ends in 3 days</div>
                                </div>
                            </div>
                            <button className="text-[10px] font-black uppercase text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:scale-105 transition-transform">
                                Extend
                            </button>
                        </div>
                    ))
                )}
            </div>

            <button className="w-full mt-4 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                View All Expiring
            </button>
        </div>
    );
}
