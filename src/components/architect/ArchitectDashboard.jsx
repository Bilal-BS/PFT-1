
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Layout,
    Settings,
    Layers,
    Monitor,
    Menu,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    Plus,
    Save,
    RotateCcw
} from 'lucide-react'
import { useDashboardStore } from '../../store/dashboardStore'
import SidebarDock from './SidebarDock'
import PanelCanvas from './PanelCanvas'
import PropertiesPanel from './PropertiesPanel'

export default function ArchitectDashboard({ financials, transactions, accounts, pdcs, currency, role }) {
    const {
        workspaces,
        currentWorkspaceId,
        switchWorkspace,
        createWorkspace
    } = useDashboardStore()

    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
    const [selectedWidgetId, setSelectedWidgetId] = useState(null)

    const activeWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0]

    return (
        <div className="h-screen bg-[#0F1115] text-slate-300 flex flex-col overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Top Professional Toolbar */}
            <header className="h-14 border-b border-white/5 bg-[#16191E] flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <Layout size={18} className="text-white" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-[0.2em] text-white">Architect <span className="text-indigo-400">Pro</span></span>
                    </div>

                    <div className="h-6 w-[1px] bg-white/10" />

                    {/* Workspace Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest mr-2">Workspace</span>
                        <div className="flex bg-black/20 p-1 rounded-xl">
                            {workspaces.map(ws => (
                                <button
                                    key={ws.id}
                                    onClick={() => switchWorkspace(ws.id)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${ws.id === currentWorkspaceId
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    {ws.name}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    const name = prompt('Workspace Name?')
                                    if (name) createWorkspace(name)
                                }}
                                className="px-3 py-1.5 text-white/40 hover:text-white transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-black/20 rounded-xl p-1">
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><Save size={16} /></button>
                        <button className="p-2 text-white/40 hover:text-white transition-colors"><RotateCcw size={16} /></button>
                    </div>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                        <Settings size={14} />
                        System Preferences
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Tool Sidebar (Dockable) */}
                <SidebarDock
                    side="left"
                    isOpen={leftSidebarOpen}
                    toggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
                >
                    <div className="p-4 space-y-6">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] px-2">Core Engines</span>
                            <div className="grid grid-cols-2 gap-2">
                                {['Overview', 'Ledger', 'Velocity', 'Currency', 'PDC', 'Family'].map(tool => (
                                    <button
                                        key={tool}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
                                    >
                                        <Layers size={20} className="text-white/40 group-hover:text-indigo-400 transition-colors mb-2" />
                                        <span className="text-[8px] font-black uppercase text-white/30 group-hover:text-white">{tool}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </SidebarDock>

                {/* Main Canvas Workspace */}
                <main className="flex-1 relative bg-[#090A0D] overflow-hidden">
                    {/* Subtle Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                    <PanelCanvas
                        workspace={activeWorkspace}
                        selectedWidgetId={selectedWidgetId}
                        setSelectedWidgetId={setSelectedWidgetId}
                        financials={financials}
                        transactions={transactions}
                        accounts={accounts}
                        pdcs={pdcs}
                        currency={currency}
                    />
                </main>

                {/* Right Properties Sidebar (Dockable) */}
                <SidebarDock
                    side="right"
                    isOpen={rightSidebarOpen}
                    toggle={() => setRightSidebarOpen(!rightSidebarOpen)}
                >
                    <PropertiesPanel
                        selectedWidgetId={selectedWidgetId}
                        workspaceId={currentWorkspaceId}
                    />
                </SidebarDock>
            </div>

            {/* Logic Status/Footer */}
            <footer className="h-8 bg-[#16191E] border-t border-white/5 px-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Engine Normal</span>
                    </div>
                    <div className="h-3 w-[1px] bg-white/10" />
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">FPS: 60.0</span>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    <span>{activeWorkspace.name}</span>
                    <div className="h-3 w-[1px] bg-white/10" />
                    <span>V3.0.0A</span>
                </div>
            </footer>
        </div>
    )
}
