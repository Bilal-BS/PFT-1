import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, AlertTriangle, User, Globe } from 'lucide-react';

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data } = await supabase
                .from('system_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            setLogs(data || []);
            setLoading(false);
        };
        fetchLogs();
    }, []);

    if (loading) return <div className="text-center p-10 font-bold text-slate-400">Loading Logs...</div>;

    if (logs.length === 0) return (
        <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-[32px]">
            <Shield size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold">No system logs found.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <h2 className="p-6 text-xl font-black text-slate-900 border-b border-slate-50 flex items-center gap-3">
                <Globe size={20} className="text-indigo-600" /> System Audit Trail
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">User ID</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.map(log => (
                            <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.event_type === 'error' ? 'bg-rose-50 text-rose-600' :
                                            log.event_type === 'security' ? 'bg-amber-50 text-amber-600' :
                                                'bg-indigo-50 text-indigo-600'
                                        }`}>
                                        {log.event_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-700">{log.description}</td>
                                <td className="px-6 py-4 text-[10px] font-mono text-slate-400">{log.user_id || 'System'}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
