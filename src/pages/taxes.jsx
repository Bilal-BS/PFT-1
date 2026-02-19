import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Landmark, Plus, Calendar, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';

export default function Taxes() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [year, setYear] = useState(new Date().getFullYear());
    const [category, setCategory] = useState('Income Tax');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('Estimated');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchTaxRecords();
    }, []);

    const fetchTaxRecords = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('tax_records')
                .select('*')
                .eq('user_id', user.id)
                .order('due_date', { ascending: true });

            if (error) throw error;
            setRecords(data || []);
        } catch (error) {
            console.error('Error fetching taxes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('tax_records').insert({
                user_id: user.id,
                tax_year: parseInt(year),
                category,
                amount: parseFloat(amount),
                status,
                due_date: dueDate || null,
                notes
            });

            if (error) throw error;

            fetchTaxRecords();
            setIsModalOpen(false);
            // Reset Form But Keep Year
            setAmount('');
            setNotes('');
        } catch (error) {
            alert('Error adding record: ' + error.message);
        }
    };

    const totalLiability = records.filter(r => r.status !== 'Paid').reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalPaid = records.filter(r => r.status === 'Paid').reduce((sum, r) => sum + (r.amount || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Tax Management"
                description="Track liabilities, deductions, and payment schedules."
                actions={(
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
                    >
                        <Plus size={16} />
                        Add Record
                    </button>
                )}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-8 bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                            <AlertCircle size={20} />
                        </div>
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Total Liability</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(totalLiability, 'LKR')}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Outstanding</p>
                </div>

                <div className="premium-card p-8 bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <CheckCircle size={20} />
                        </div>
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Total Paid</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(totalPaid, 'LKR')}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Settled</p>
                </div>

                <div className="premium-card p-8 bg-slate-900 text-white border-none shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg text-white">
                            <Calendar size={20} />
                        </div>
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Next Due</h3>
                    </div>
                    <p className="text-xl font-bold">
                        {records.find(r => r.status !== 'Paid' && r.due_date)
                            ? new Date(records.find(r => r.status !== 'Paid' && r.due_date).due_date).toLocaleDateString()
                            : 'No upcoming dates'}
                    </p>
                </div>
            </div>

            {/* Tax Records List */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">Tax Records</h3>
                </div>

                {records.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Landmark size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2">No Records Yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">Start tracking your taxes to avoid penalties and stay organized.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-bold text-sm hover:underline">Add your first record</button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {records.map(record => (
                            <div key={record.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${record.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                                            record.status === 'Overdue' ? 'bg-rose-50 text-rose-600' :
                                                'bg-amber-50 text-amber-600'
                                        }`}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-900">{record.category}</h4>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">{record.tax_year}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {record.status} • Due: {record.due_date ? new Date(record.due_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-lg">{formatCurrency(record.amount, 'LKR')}</p>
                                    <p className="text-xs text-slate-400 font-medium max-w-[150px] truncate">{record.notes}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Record Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800">New Tax Record</h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Fiscal Year</label>
                                    <input
                                        type="number"
                                        required
                                        value={year}
                                        onChange={e => setYear(e.target.value)}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Status</label>
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                    >
                                        <option>Estimated</option>
                                        <option>Filed</option>
                                        <option>Paid</option>
                                        <option>Overdue</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Tax Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option>Income Tax</option>
                                    <option>VAT / GST</option>
                                    <option>Corporate Tax</option>
                                    <option>Property Tax</option>
                                    <option>Stamp Duty</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Amount (LKR)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">LKR</span>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full pl-16 pr-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-2xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Notes</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Optional..."
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition active:scale-95">
                                Save Tax Record
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
