import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Sparkles, Command, Cpu } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const ArchitectureConsole = () => {
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef(null);
    const commands = useDashboardStore(state => state.aiCommands) || [];
    const addAICommand = useDashboardStore(state => state.addAICommand);
    const addPanel = useDashboardStore(state => state.addPanel);
    const isBlueprintMode = useDashboardStore(state => state.isBlueprintMode);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [commands]);

    const handleAction = (text) => {
        setIsThinking(true);

        // Simulate AI "Processing"
        setTimeout(() => {
            const cmd = text.toLowerCase();
            let response = "I've analyzed your request. Architecture adjusted.";

            if (cmd.includes('add') || cmd.includes('create')) {
                const type = cmd.includes('income') ? 'income' :
                    cmd.includes('expense') ? 'expense' :
                        cmd.includes('chart') ? 'chart' : 'balance';

                const newPanel = {
                    id: `${type}_${Date.now()}`,
                    type,
                    title: `AI Generated ${type.toUpperCase()}`,
                    dock: 'floating',
                    width: 400,
                    height: 250,
                    x: 400 + Math.random() * 100,
                    y: 200 + Math.random() * 100,
                    collapsed: false,
                    zIndex: 10,
                    color: type === 'income' ? 'green-500' : 'blue-500'
                };
                addPanel(newPanel);
                response = `Generated a professional ${type} module at your viewport coordinates.`;
            }

            addAICommand({
                text: input,
                response,
                type: 'ai'
            });
            setIsThinking(false);
            setInput('');
        }, 800);
    };

    return (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 w-[600px] max-w-[90vw] z-[70] transition-all duration-500 ${isBlueprintMode ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">

                {/* Header */}
                <div className="bg-slate-800/50 px-4 py-2 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Cpu size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vision Architecture Console</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>

                {/* Log Area */}
                <div
                    ref={scrollRef}
                    className="h-32 overflow-y-auto p-4 space-y-3 font-mono text-[11px] no-scrollbar bg-slate-950/50"
                >
                    {commands.length === 0 ? (
                        <div className="text-slate-600 italic">Waiting for architect input... Try "Add income widget"</div>
                    ) : (
                        commands.map((cmd, i) => (
                            <div key={i} className="animate-in fade-in slide-in-from-left-2 transition-all">
                                <div className="flex gap-2 text-slate-400">
                                    <span className="text-emerald-500">❯</span>
                                    <span>{cmd.text}</span>
                                </div>
                                <div className="flex gap-2 text-indigo-400 mt-1 pl-4 border-l border-white/5">
                                    <Sparkles size={10} className="mt-0.5" />
                                    <span>{cmd.response}</span>
                                </div>
                            </div>
                        ))
                    )}
                    {isThinking && (
                        <div className="flex gap-2 text-emerald-400 animate-pulse">
                            <span>⠋</span>
                            <span>Synthesizing layout logic...</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-slate-900 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAction(input)}
                            placeholder="Architectural Command (e.g., 'Add a pie chart')"
                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-10 py-3 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                        />
                        <Command size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                    <button
                        onClick={() => handleAction(input)}
                        className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>

            </div>

            {/* Status Pill */}
            <div className="mt-4 flex justify-center">
                <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Neural Link Active</span>
                </div>
            </div>
        </div>
    );
};

export default ArchitectureConsole;
