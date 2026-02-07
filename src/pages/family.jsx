
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
    ShieldCheck, Users, UserPlus, Trash2, Shield,
    Crown, Mail, ArrowRight, Zap, Star, Search, Plus
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'

export default function FamilyShield() {
    const [family, setFamily] = useState(null)
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [familyName, setFamilyName] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        fetchFamilyData()
    }, [])

    const fetchFamilyData = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        const { data: memberData } = await supabase
            .from('family_members')
            .select('*, families(*)')
            .eq('user_id', user.id)
            .single()

        if (memberData) {
            setFamily(memberData.families)
            const { data: allMembers } = await supabase
                .from('family_members')
                .select('*, profiles(full_name, role)')
                .eq('family_id', memberData.family_id)
            setMembers(allMembers || [])
        }
        setLoading(false)
    }

    const createFamily = async (e) => {
        e.preventDefault()
        if (!familyName) return
        setIsCreating(true)
        const { data: { user } } = await supabase.auth.getUser()

        try {
            const { data: newFamily, error: fError } = await supabase
                .from('families')
                .insert({ name: familyName, owner_id: user.id })
                .select()
                .single()

            if (newFamily) {
                await supabase.from('family_members').insert({
                    family_id: newFamily.id,
                    user_id: user.id,
                    role: 'admin'
                })
                await supabase.from('profiles').update({ family_id: newFamily.id }).eq('id', user.id)
                fetchFamilyData()
            }
        } catch (error) {
            console.error('Family creation failed:', error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleSendInvite = (e) => {
        e.preventDefault()
        if (!inviteEmail) return
        alert(`Neural invitation dispatched to: ${inviteEmail}`)
        setInviteEmail('')
    }

    const handleDeleteMember = async (memberId) => {
        if (!confirm('Are you sure you want to disconnect this member from the Shield?')) return
        try {
            await supabase.from('family_members').delete().eq('id', memberId)
            fetchFamilyData()
        } catch (error) {
            console.error('Member removal failed')
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white lg:pl-[280px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Verifying Permissions...</p>
            </div>
        </div>
    )

    return (
        <div className="p-4 lg:p-8 space-y-8 bg-[#F9FAFB]">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck size={14} className="text-emerald-600 shadow-sm" />
                        <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full tracking-widest">Enterprise Feature</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Family Shield</h1>
                    <p className="text-slate-400 font-bold mt-1">Multi-user wealth management and legacy coordination.</p>
                </div>
            </div>

            {!family ? (
                /* Initial State: Create a Family */
                <div className="max-w-3xl mx-auto py-24 px-12 emerald-card text-center bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 emerald-gradient" />
                    <div className="mb-10 flex justify-center">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-900 shadow-xl shadow-emerald-900/10 animate-float">
                            <Users size={48} />
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Activate Group Intelligence</h2>
                    <p className="text-slate-500 font-bold mb-12 text-lg max-w-xl mx-auto leading-relaxed">Secure your family legacy. Shared accounts, biometric validation, and collective treasury monitoring starts here.</p>

                    <form onSubmit={createFamily} className="flex flex-col gap-5 max-w-md mx-auto">
                        <input
                            type="text"
                            placeholder="Enter Shield Name (e.g. Matrix Family)"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            required
                            className="w-full h-16 bg-slate-50 border-none rounded-[24px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-center tracking-tight"
                        />
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full bg-emerald-900 text-white h-16 rounded-[24px] font-black text-lg shadow-2xl shadow-emerald-900/10 hover:bg-emerald-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                        >
                            {isCreating ? 'Synchronizing Nodes...' : 'Initialize Shield'}
                            <ArrowRight size={22} />
                        </button>
                    </form>
                </div>
            ) : (
                /* Dashboard State */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Member Management */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="emerald-card p-10 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-12 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-emerald-50 rounded-[20px] text-emerald-900 shadow-lg shadow-emerald-900/5">
                                        <Crown size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{family.name}</h2>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mt-1">Group Node Alpha Active</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{members.length}</span>
                                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest mt-1">Active Sodes</span>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {members.map((m) => (
                                    <div key={m.id} className="group flex items-center justify-between p-7 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:border-emerald-50 border border-transparent rounded-[32px] transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center font-black text-2xl text-white shadow-xl ${m.role === 'admin' ? 'emerald-gradient ring-4 ring-emerald-50' : 'bg-slate-300'}`}>
                                                {m.profiles?.full_name?.[0] || 'M'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-slate-900 text-xl tracking-tight">{m.profiles?.full_name || 'System User'}</span>
                                                    {m.role === 'admin' && <Crown size={18} className="text-amber-500 fill-amber-500" />}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full">{m.role} access</span>
                                                    <span className="text-[10px] font-bold text-slate-400 italic">Connected {new Date(m.joined_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteMember(m.id)}
                                            className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Aesthetic Backdrop */}
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Shield size={240} />
                            </div>
                        </div>

                        <div className="emerald-gradient rounded-[40px] p-12 text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-8 flex items-center gap-4">
                                    <Zap size={32} className="fill-white" />
                                    Shield Protocols
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 hover:bg-white/20 transition-all">
                                        <p className="text-[10px] font-black uppercase text-emerald-200 tracking-[0.2em] mb-3">Group Insight</p>
                                        <p className="font-bold text-lg leading-relaxed italic">"Risk exposure is minimal. Collective treasury health is verified at 98.4%."</p>
                                    </div>
                                    <div className="p-8 bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 hover:bg-white/20 transition-all">
                                        <p className="text-[10px] font-black uppercase text-emerald-200 tracking-[0.2em] mb-3">System Node</p>
                                        <p className="font-bold text-lg leading-relaxed">ISO-27001 Cryptographic Validation Active Across All Nodes.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32 group-hover:opacity-30 transition-opacity" />
                        </div>
                    </div>

                    {/* Invite Deployment */}
                    <div className="space-y-10">
                        <div className="emerald-card p-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 bg-emerald-50 rounded-[22px] text-emerald-900 shadow-lg shadow-emerald-900/5">
                                    <UserPlus size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Deploy Invite</h2>
                            </div>

                            <form onSubmit={handleSendInvite} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 ml-1">E-Mail Address</label>
                                    <div className="relative">
                                        <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="email"
                                            placeholder="member@domain.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            required
                                            className="w-full h-16 pl-16 pr-6 bg-slate-50 border-none rounded-[24px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-emerald-900 text-white h-16 rounded-[24px] font-black shadow-xl shadow-emerald-900/10 hover:bg-emerald-800 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                                >
                                    Send Invite
                                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </form>
                        </div>

                        <div className="p-10 bg-slate-50/50 rounded-[40px] border border-slate-100 italic relative overflow-hidden">
                            <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-lg">
                                <Star size={20} className="text-amber-500 fill-amber-500" />
                                Security Brief
                            </h4>
                            <ul className="space-y-5">
                                {[
                                    'Shared nodes are view-only for standard members.',
                                    'Owners must authorize all capital deployments.',
                                    'Group PDCs require biometric verification.',
                                    'All transactions are audited for family integrity.'
                                ].map((text, i) => (
                                    <li key={i} className="flex items-start gap-4 text-xs font-bold text-slate-500 leading-relaxed group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}
