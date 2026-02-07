
import { Settings, X, Maximize2, Move, Filter, RefreshCcw } from 'lucide-react'
import { useState } from 'react'

export default function WidgetWrapper({
    title,
    children,
    onRemove,
    onSettings,
    onRefresh,
    dragHandleClass = 'drag-handle',
    config = {},
    isSelected = false,
    onClick
}) {
    const [showFilters, setShowFilters] = useState(false)

    const {
        accentColor = 'slate',
        borderRadius = '24px',
        shadowIntensity = 'xl',
        customTitle = ''
    } = config

    const getBgColor = () => {
        if (accentColor === 'slate') return 'bg-[#16191E] border-white/5'
        switch (accentColor) {
            case 'emerald': return 'bg-emerald-950/20 border-emerald-500/20'
            case 'rose': return 'bg-rose-950/20 border-rose-500/20'
            case 'amber': return 'bg-amber-950/20 border-amber-500/20'
            case 'indigo': return 'bg-indigo-950/20 border-indigo-500/20'
            default: return 'bg-[#16191E] border-white/5'
        }
    }

    return (
        <div
            onClick={onClick}
            style={{ borderRadius }}
            className={`${getBgColor()} border shadow-${shadowIntensity} overflow-hidden flex flex-col h-full group transition-all duration-300 ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : ''
                }`}
        >
            <div className={`px-5 py-3 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-sm`}>
                <div className="flex items-center gap-3">
                    <div className={`${dragHandleClass} cursor-move p-1 text-white/10 hover:text-white/40 transition-colors`}>
                        <Move size={12} />
                    </div>
                    <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] truncate max-w-[150px]">
                        {customTitle || title}
                    </h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }} className={`p-1.5 rounded-lg transition-all ${showFilters ? 'bg-indigo-500 text-white' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
                        <Filter size={12} />
                    </button>
                    {onRefresh && (
                        <button onClick={(e) => { e.stopPropagation(); onRefresh(); }} className="p-1.5 text-white/20 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-all">
                            <RefreshCcw size={12} />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1.5 text-white/20 hover:text-rose-500 hover:bg-white/5 rounded-lg transition-all">
                        <X size={12} />
                    </button>
                </div>
            </div>
            {showFilters && (
                <div className="px-5 py-2 bg-black/40 border-b border-white/5 flex items-center gap-4 animate-in slide-in-from-top-1">
                    <button className="text-[8px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">This Month</button>
                    <button className="text-[8px] font-black uppercase text-white/20 hover:text-white/60">Yearly</button>
                </div>
            )}
            <div className="flex-1 overflow-hidden relative bg-black/10">
                {children}
            </div>
        </div>
    )
}

