import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, Target, Zap, Waves, Sparkles } from 'lucide-react';

const UniversalInsightPanel = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isExpanded, setIsExpanded] = React.useState(true);

    const isArchitectMode = searchParams.get('customize') === 'true';

    // Determine context-based widgets
    const getPageContext = () => {
        const path = location.pathname;
        if (path === '/currencies') return { title: 'Treasury & Forex', color: 'emerald' };
        if (path === '/accounts') return { title: 'Liquidity & Assets', color: 'blue' };
        if (path === '/pdcs') return { title: 'Post-Dated Clearing', color: 'rose' };
        if (path === '/investments') return { title: 'Portfolio Growth', color: 'purple' };
        return { title: 'System Overview', color: 'indigo' };
    };

    const context = getPageContext();

    if (!isExpanded) return (
        <div className="flex justify-end mb-6">
            <button
                onClick={() => setIsExpanded(true)}
                className="px-4 py-2 bg-white/40 backdrop-blur-md border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white transition-all animate-in fade-in zoom-in group flex items-center gap-2"
            >
                {isArchitectMode && <Sparkles size={12} className="text-amber-500" />}
                Restore Intelligence Monitor
            </button>
        </div>
    );

    return (
        <div className={`mb-10 animate-in fade-in slide-in-from-top-4 duration-500 relative group/panel ${isArchitectMode ? 'ring-2 ring-amber-500/50 ring-offset-4 rounded-[40px]' : ''}`}>
            {isArchitectMode && (
                <div className="absolute -top-4 left-10 bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest z-40 shadow-xl border-2 border-white dark:border-slate-800">
                    Architect Mode Active
                </div>
            )}
            <button
                onClick={() => setIsExpanded(false)}
                className="absolute -top-3 -right-3 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover/panel:opacity-100 transition-opacity z-30 hover:scale-110 active:scale-95 shadow-xl"
            >
                <span className="text-xs">×</span>
            </button>
            <div className="relative group">
                {/* Background Liquid Glass Container */}
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/20 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all group-hover:shadow-3xl" />

                <div className="relative flex flex-col lg:flex-row items-stretch gap-px bg-slate-200/20 dark:bg-white/5 overflow-hidden rounded-[40px]">

                    {/* Context Badge */}
                    <div className={`p-8 lg:w-72 flex flex-col justify-between border-r border-white/10 relative overflow-hidden bg-${context.color}-500/5`}>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full bg-${context.color}-500 animate-pulse`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Context Monitor</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{context.title}</h3>
                        </div>
                        <div className={`mt-8 flex items-center gap-3 text-${context.color}-600 dark:text-${context.color}-400`}>
                            <Sparkles size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">AI Insights Pulse</span>
                        </div>

                        {/* Abstract Background Decoration */}
                        <div className="absolute -right-8 -bottom-8 opacity-10 blur-2xl flex">
                            <Waves size={160} className={`text-${context.color}-500 animate-slow-spin`} />
                        </div>
                    </div>

                    {/* Widgets Area */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3">

                        {/* Widget 1: Health Index */}
                        <div className={`p-8 flex flex-col justify-center border-r border-white/10 hover:bg-${context.color}-500/5 transition-colors cursor-pointer group/w`}>
                            <div className="flex items-baseline justify-between mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/w:text-${context.color}-500 transition-colors`}>Efficiency Score</span>
                                <TrendingUp size={14} className={`text-${context.color}-500`} />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">94<span className={`text-${context.color}-500 text-xl`}>%</span></span>
                                <div className="h-1 flex-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full bg-${context.color}-500 w-[94%]`} />
                                </div>
                            </div>
                        </div>

                        {/* Widget 2: Risk Profile */}
                        <div className={`p-8 flex flex-col justify-center border-r border-white/10 hover:bg-${context.color}-500/5 transition-colors cursor-pointer group/w`}>
                            <div className="flex items-baseline justify-between mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/w:text-${context.color}-500 transition-colors`}>Risk Exposure</span>
                                <TrendingDown size={14} className="text-rose-400" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 bg-${context.color}-50 dark:bg-${context.color}-900/20 text-${context.color}-500 rounded-xl`}>
                                    <ShieldAlert size={18} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Nominal</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No critical anomalies</p>
                                </div>
                            </div>
                        </div>

                        {/* Widget 3: Targets */}
                        <div className={`p-8 flex flex-col justify-center hover:bg-${context.color}-500/5 transition-colors cursor-pointer group/w`}>
                            <div className="flex items-baseline justify-between mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/w:text-${context.color}-500 transition-colors`}>Target Velocity</span>
                                <Target size={14} className={`text-${context.color}-500`} />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 bg-${context.color}-50 dark:bg-${context.color}-900/20 text-${context.color}-500 rounded-xl`}>
                                    <Zap size={18} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Optimal</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pacing +12% above mean</p>
                                </div>
                            </div>
                        </div>

                        {/* Architect Add Widget Placeholder */}
                        {isArchitectMode && (
                            <div className="p-8 flex items-center justify-center border-dashed border-2 border-amber-200 m-4 rounded-[30px] hover:bg-amber-50 transition-colors cursor-pointer group/add">
                                <div className="flex flex-col items-center gap-2">
                                    <Plus size={20} className="text-amber-400 group-hover/add:scale-125 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Add Insight Widget</span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper components...
const Plus = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
);

// Helper components missing from imports but used in design flow
const ShieldAlert = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
    </svg>
);

export default UniversalInsightPanel;
