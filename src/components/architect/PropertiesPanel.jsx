
import React from 'react'

export default function PropertiesPanel({ selectedWidgetId, workspaceId }) {
    if (!selectedWidgetId) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-white/20 font-black text-2xl">?</span>
                </div>
                <h4 className="text-[11px] font-black uppercase text-white tracking-[0.2em] mb-2">No selection</h4>
                <p className="text-[10px] font-bold text-white/20 leading-relaxed uppercase tracking-widest">
                    Select a panel on the canvas to inspect its architecture.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-[#16191E]">
            <div className="p-6 border-b border-white/5">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] block mb-2">Properties</span>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">{selectedWidgetId}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                    <span className="text-[9px] font-black uppercase text-white/20 tracking-widest block mb-4">Transform</span>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[8px] font-black text-white/30 uppercase block mb-1">X-Node</label>
                            <div className="bg-black/20 p-2 rounded-lg text-xs font-mono text-white/60">0.00</div>
                        </div>
                        <div>
                            <label className="text-[8px] font-black text-white/30 uppercase block mb-1">Y-Node</label>
                            <div className="bg-black/20 p-2 rounded-lg text-xs font-mono text-white/60">4.00</div>
                        </div>
                    </div>
                </div>

                <div>
                    <span className="text-[9px] font-black uppercase text-white/20 tracking-widest block mb-4">Appearance</span>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Accent Core</span>
                            <div className="w-6 h-6 rounded-md bg-indigo-600 border border-white/20" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Opacity</span>
                            <span className="text-xs font-mono text-white/60">100%</span>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <button className="w-full py-4 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all">
                        Terminate Panel
                    </button>
                </div>
            </div>
        </div>
    )
}
