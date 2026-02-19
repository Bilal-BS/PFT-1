import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabase';
import { Box, Plus, X, UploadCloud } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Assets() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState('Physical');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setAssets(data || []);
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to remove this asset?")) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('assets').delete().eq('id', id);
            if (error) throw error;
            fetchAssets();
        } catch (error) {
            alert('Error deleting asset: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const [editingAsset, setEditingAsset] = useState(null);

    const openEditModal = (asset) => {
        setEditingAsset(asset);
        setName(asset.name);
        setValue(asset.value);
        setType(asset.type);
        setDescription(asset.description);
        setIsModalOpen(true);
    };

    const handleRegisterOrUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            const payload = {
                user_id: user.id,
                name,
                value: parseFloat(value),
                type,
                description,
                currency: 'LKR'
            };

            let error;
            if (editingAsset) {
                const { error: updateError } = await supabase.from('assets').update(payload).eq('id', editingAsset.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('assets').insert(payload);
                error = insertError;
            }

            if (error) throw error;

            setIsModalOpen(false);
            setEditingAsset(null);
            setName('');
            setValue('');
            setDescription('');
            fetchAssets();
        } catch (error) {
            console.error(error);
            if (error.code === '42P01') {
                alert("Critical Error: The 'assets' table does not exist. Please run the SQL Update Script provided to fix the database.");
            } else {
                alert('Error saving asset: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const totalValuation = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <PageHeader
                title="Asset Registry"
                description="Manage physical and digital assets, depreciation, and valuation."
                actions={(
                    <button
                        onClick={() => {
                            setEditingAsset(null);
                            setName('');
                            setValue('');
                            setDescription('');
                            setIsModalOpen(true);
                        }}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Register Asset
                    </button>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <Box size={24} />
                        </div>
                        <h3 className="font-black text-slate-800 uppercase tracking-wide text-xs">Total Valuation</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{formatCurrency(totalValuation)}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Active Assets: {assets.length}</p>
                </div>

                <div className="col-span-1 md:col-span-2 premium-card p-10 flex flex-col items-center justify-center text-center">
                    {assets.length === 0 ? (
                        <>
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Box size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Asset Inventory Empty</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-6">Register your high-value assets to track their appreciation or depreciation over time.</p>
                        </>
                    ) : (
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            {assets.map(asset => (
                                <div key={asset.id} className="group relative p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition bg-white shadow-sm hover:shadow-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900">{asset.name}</h4>
                                        <span className="px-2 py-1 bg-slate-100 text-[10px] font-black uppercase tracking-wider rounded-lg text-slate-500">{asset.type}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900">{formatCurrency(asset.value)}</p>
                                    <p className="text-xs text-slate-400 mt-1 truncate">{asset.description || 'No description'}</p>

                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                                        <button
                                            onClick={() => openEditModal(asset)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                        >
                                            <UploadCloud size={14} /> {/* Reusing icon as Edit for now, ideally use Edit2 */}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Register/Edit Asset Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-800">{editingAsset ? 'Edit Asset' : 'Register New Asset'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleRegisterOrUpdate} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Asset Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Macbook Pro M3"
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Estimated Value (LKR)</label>
                                <input
                                    type="number"
                                    required
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Physical">Physical (Hardware, Furniture)</option>
                                    <option value="Digital">Digital (Software, Crypto)</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Vehicle">Vehicle</option>
                                    <option value="Investment">Investment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Serial numbers, purchase details..."
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-600 transition disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (editingAsset ? 'Update Asset' : 'Confirm Registration')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
