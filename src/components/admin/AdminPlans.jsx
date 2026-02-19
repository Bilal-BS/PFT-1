import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import { Edit3, CheckCircle2, Save, XCircle } from 'lucide-react';

export default function AdminPlans({ plans, onUpdate }) {
    const [editingPlan, setEditingPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSave = async (plan) => {
        setLoading(true);
        const { error } = await supabase.from('plans').update({
            price: plan.price,
            name: plan.name
        }).eq('id', plan.id);

        if (error) {
            alert('Error updating plan');
        } else {
            setEditingPlan(null);
            onUpdate(); // Trigger refresh in parent
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {plans.map(plan => (
                <div key={plan.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative group hover:border-indigo-100 transition-all">
                    {editingPlan === plan.id ? (
                        <div className="space-y-4">
                            <input
                                value={plan.name}
                                onChange={(e) => {
                                    const newPlans = plans.map(p => p.id === plan.id ? { ...p, name: e.target.value } : p);
                                    // This is a local mutation hack for UI, ideally handle in parent state or separate local state
                                    // For now simplified
                                }}
                                className="w-full text-xl font-black text-slate-900 border-b border-indigo-200 outline-none"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-400">LKR</span>
                                <input
                                    type="number"
                                    defaultValue={plan.price}
                                    id={`price-${plan.id}`}
                                    className="w-full text-2xl font-black text-indigo-600 border-b border-indigo-200 outline-none"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => {
                                        const newPrice = document.getElementById(`price-${plan.id}`).value;
                                        handleSave({ ...plan, price: newPrice });
                                    }}
                                    disabled={loading}
                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
                                >
                                    <Save size={16} className="mx-auto" />
                                </button>
                                <button
                                    onClick={() => setEditingPlan(null)}
                                    className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs"
                                >
                                    <XCircle size={16} className="mx-auto" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                                <button
                                    onClick={() => setEditingPlan(plan.id)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    <Edit3 size={18} />
                                </button>
                            </div>
                            <p className="text-3xl font-black text-indigo-600 mb-6">{formatCurrency(plan.price)}<span className="text-sm text-slate-400 font-bold">/mo</span></p>

                            <div className="space-y-2">
                                {Object.entries(plan.features || {}).map(([key, val]) => (
                                    <div key={key} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span className="uppercase">{key.replace(/_/g, ' ')}: {val.toString()}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
