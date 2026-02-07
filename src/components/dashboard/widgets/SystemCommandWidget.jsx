
import { Activity, Users, CreditCard, ShieldCheck } from 'lucide-react'

export default function SystemCommandWidget() {
    return (
        <div className="p-6 h-full flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Users size={16} /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Users</p>
                        <p className="font-black text-slate-900 mt-1">1,280</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Activity size={16} /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Uptime</p>
                        <p className="font-black text-slate-900 mt-1">99.9%</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><CreditCard size={16} /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">API Req</p>
                        <p className="font-black text-slate-900 mt-1">45k</p>
                    </div>
                </div>
                <div className="p-4 bg-indigo-600 rounded-2xl flex items-center gap-3 text-white">
                    <div className="p-2 bg-indigo-500 rounded-lg"><ShieldCheck size={16} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none opacity-60 text-white">Security</p>
                        <p className="font-black mt-1">LOCKED</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Platform Pulse</p>
                <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="w-3/4 h-full bg-indigo-600 rounded-full" />
                </div>
            </div>
        </div>
    )
}
