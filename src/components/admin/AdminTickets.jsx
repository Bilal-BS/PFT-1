import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            const { data } = await supabase
                .from('support_tickets')
                .select('*, profiles(full_name, email)') // Requires join, might need policy tweak if profiles logic is strict. Assuming left join works.
                .order('created_at', { ascending: false });

            setTickets(data || []);
            setLoading(false);
        };
        fetchTickets();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        await supabase.from('support_tickets').update({ status }).eq('id', id);
        setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
    };

    if (loading) return <div className="text-center p-10 font-bold text-slate-400">Loading Tickets...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {tickets.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-[32px]">
                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-400 font-bold">No active support tickets.</p>
                </div>
            ) : (
                tickets.map(ticket => (
                    <div key={ticket.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:border-indigo-100 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">{ticket.subject}</h3>
                                <p className="text-xs font-bold text-slate-400">From: {ticket.profiles?.email || 'Unknown User'}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${ticket.status === 'open' ? 'bg-rose-50 text-rose-600' :
                                    ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-amber-50 text-amber-600'
                                }`}>
                                {ticket.status}
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl">
                            {ticket.message}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition"
                            >
                                <CheckCircle2 size={14} /> Resolve
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition"
                            >
                                <Clock size={14} /> In Progress
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
