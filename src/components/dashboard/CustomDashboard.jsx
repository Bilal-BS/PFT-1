
import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { supabase } from '../../lib/supabase'
import WidgetWrapper from './WidgetWrapper'
import OverviewStats from './widgets/OverviewStats'
import FinancialVelocity from './widgets/FinancialVelocity'
import RecentTransactionsWidget from './widgets/RecentTransactionsWidget'
import CategoryExpenseChart from './widgets/CategoryExpenseChart'
import SystemCommandWidget from './widgets/SystemCommandWidget'
import { Plus, Layout, Save, RotateCcw, Box, Sun, Moon } from 'lucide-react'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function CustomDashboard({ financials, transactions, accounts, pdcs, currency, role }) {
    const [layouts, setLayouts] = useState({ lg: [] })
    const [enabledWidgets, setEnabledWidgets] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCustomizing, setIsCustomizing] = useState(false)
    const [theme, setTheme] = useState('light')
    const [widgetConfigs, setWidgetConfigs] = useState({})
    const [selectedWidgetId, setSelectedWidgetId] = useState(null)

    useEffect(() => {
        loadPreferences()
        const params = new URLSearchParams(window.location.search)
        if (params.get('customize')) {
            setIsCustomizing(true)
        }
    }, [])

    const loadPreferences = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('user_dashboard_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (data) {
            setLayouts({ lg: data.layout })
            setEnabledWidgets(data.enabled_widgets)
            setTheme(data.theme || 'light')
            setWidgetConfigs(data.widget_configs || {})
        } else {
            // New user init
            const defaults = [
                { i: 'overview', x: 0, y: 0, w: 12, h: 4 },
                { i: 'income_expense', x: 0, y: 4, w: 8, h: 10 },
                { i: 'recent_tx', x: 8, y: 4, w: 4, h: 10 }
            ]
            setLayouts({ lg: defaults })
            setEnabledWidgets(['overview', 'income_expense', 'recent_tx'])

            // Proactively save for them (optional but good for consistency)
            await supabase.from('user_dashboard_settings').insert({
                user_id: user.id,
                layout: defaults,
                enabled_widgets: ['overview', 'income_expense', 'recent_tx'],
                widget_configs: {}
            })
        }
        setLoading(false)
    }

    const savePreferences = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        await supabase
            .from('user_dashboard_settings')
            .update({
                layout: layouts.lg,
                enabled_widgets: enabledWidgets,
                theme: theme,
                widget_configs: widgetConfigs
            })
            .eq('user_id', user.id)

        setIsCustomizing(false)
        setSelectedWidgetId(null)
        alert("Dashboard configuration locked and saved! 🛡️")
    }

    const availableWidgets = [
        { id: 'overview', title: 'Capital Overview', roles: ['user', 'superadmin'] },
        { id: 'income_expense', title: 'Financial Velocity', roles: ['user', 'superadmin'] },
        { id: 'recent_tx', title: 'Ledger Activity', roles: ['user', 'superadmin'] },
        { id: 'category_dist', title: 'Category Distribution', roles: ['user', 'superadmin'] },
        { id: 'system_cmd', title: 'System Command', roles: ['superadmin'] }
    ].filter(w => w.roles.includes(role || 'user'))

    const addWidget = (id) => {
        if (enabledWidgets.includes(id)) return
        setEnabledWidgets([...enabledWidgets, id])
        const newWidget = { i: id, x: (enabledWidgets.length * 2) % 12, y: Infinity, w: 4, h: 6 }
        setLayouts({ ...layouts, lg: [...(layouts.lg || []), newWidget] })
    }

    const resetLayout = () => {
        const defaultLayout = [
            { i: 'overview', x: 0, y: 0, w: 12, h: 4 },
            { i: 'income_expense', x: 0, y: 4, w: 8, h: 10 },
            { i: 'recent_tx', x: 8, y: 4, w: 4, h: 10 }
        ]
        setLayouts({ lg: defaultLayout })
        setEnabledWidgets(['overview', 'income_expense', 'recent_tx'])
        setWidgetConfigs({})
    }

    const updateWidgetConfig = (id, key, value) => {
        setWidgetConfigs(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [key]: value
            }
        }))
    }

    const onLayoutChange = (currentLayout, allLayouts) => {
        if (isCustomizing) {
            setLayouts(allLayouts)
        }
    }

    const renderWidget = (id) => {
        switch (id) {
            case 'overview':
                return <OverviewStats financials={financials} currency={currency} />
            case 'income_expense':
                return <FinancialVelocity data={transactions} />
            case 'recent_tx':
                return <RecentTransactionsWidget transactions={transactions} currency={currency} />
            case 'category_dist':
                return <CategoryExpenseChart transactions={transactions} />
            case 'system_cmd':
                return <SystemCommandWidget />
            default:
                return null
        }
    }

    const getWidgetTitle = (id) => {
        switch (id) {
            case 'overview': return 'Capital Overview'
            case 'income_expense': return 'Financial Velocity'
            case 'recent_tx': return 'Ledger Activity'
            case 'category_dist': return 'Category Distribution'
            case 'system_cmd': return 'System Command'
            default: return 'Widget'
        }
    }

    if (loading) return null

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className={`p-3 rounded-2xl border transition-all ${theme === 'light' ? 'bg-white text-slate-400 border-slate-100' : 'bg-slate-900 text-amber-400 border-slate-800 shadow-xl'}`}
                    >
                        {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <button
                        onClick={() => {
                            setIsCustomizing(!isCustomizing)
                            if (!isCustomizing === false) setSelectedWidgetId(null)
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isCustomizing ? 'bg-amber-100 text-amber-700 shadow-xl shadow-amber-200/20' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'}`}
                    >
                        <Layout size={16} />
                        {isCustomizing ? 'Exit Designer' : 'Design Framework'}
                    </button>
                    {isCustomizing && (
                        <div className="animate-in fade-in slide-in-from-left-4 flex items-center gap-2">
                            <div className="h-10 w-[1px] bg-slate-100 mx-2" />
                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mr-2">Widget Library</p>
                            <div className="flex gap-2">
                                {availableWidgets.filter(w => !enabledWidgets.includes(w.id)).map(widget => (
                                    <button
                                        key={widget.id}
                                        onClick={() => addWidget(widget.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-[10px] hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                                    >
                                        <Plus size={12} />
                                        {widget.title}
                                    </button>
                                ))}
                            </div>
                            <div className="h-10 w-[1px] bg-slate-100 mx-4" />
                            <button
                                onClick={savePreferences}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-800"
                            >
                                <Save size={16} />
                                Commit Design
                            </button>
                            <button
                                onClick={resetLayout}
                                className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl border border-slate-100"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-8 items-start">
                <div className={`flex-1 transition-all ${isCustomizing ? 'scale-[0.98] origin-top' : ''}`}>
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={layouts}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={30}
                        isDraggable={isCustomizing}
                        isResizable={isCustomizing}
                        draggableHandle=".drag-handle"
                        onLayoutChange={onLayoutChange}
                        margin={[24, 24]}
                    >
                        {enabledWidgets.map(id => (
                            <div key={id}>
                                <WidgetWrapper
                                    title={getWidgetTitle(id)}
                                    config={widgetConfigs[id]}
                                    isSelected={selectedWidgetId === id}
                                    onClick={() => isCustomizing && setSelectedWidgetId(id)}
                                    onRemove={() => setEnabledWidgets(prev => prev.filter(w => w !== id))}
                                >
                                    {renderWidget(id)}
                                </WidgetWrapper>
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                </div>

                {isCustomizing && selectedWidgetId && (
                    <div className="w-80 bg-white rounded-[40px] border border-slate-100 shadow-2xl p-8 animate-in slide-in-from-right-8 sticky top-24 h-fit">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Design Properties</h3>
                            <button onClick={() => setSelectedWidgetId(null)} className="p-2 text-slate-400 hover:text-slate-900">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Label Context</label>
                                <input
                                    type="text"
                                    placeholder={getWidgetTitle(selectedWidgetId)}
                                    value={widgetConfigs[selectedWidgetId]?.customTitle || ''}
                                    onChange={(e) => updateWidgetConfig(selectedWidgetId, 'customTitle', e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Accent Palette</label>
                                <div className="flex gap-3">
                                    {['indigo', 'emerald', 'rose', 'amber', 'slate'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => updateWidgetConfig(selectedWidgetId, 'accentColor', color)}
                                            className={`w-10 h-10 rounded-xl transition-all ${color === 'indigo' ? 'bg-indigo-500' :
                                                color === 'emerald' ? 'bg-emerald-500' :
                                                    color === 'rose' ? 'bg-rose-500' :
                                                        color === 'amber' ? 'bg-amber-500' : 'bg-slate-500'
                                                } ${widgetConfigs[selectedWidgetId]?.accentColor === color ? 'ring-4 ring-slate-100 scale-110 shadow-lg' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Corner Radius</label>
                                <div className="flex gap-2">
                                    {[0, 12, 24, 32, 48].map(radius => (
                                        <button
                                            key={radius}
                                            onClick={() => updateWidgetConfig(selectedWidgetId, 'borderRadius', `${radius}px`)}
                                            className={`flex-1 py-3 rounded-xl border-2 transition-all font-black text-[10px] ${widgetConfigs[selectedWidgetId]?.borderRadius === `${radius}px` ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200'
                                                }`}
                                        >
                                            {radius}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Shadow Depth</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['sm', 'md', 'lg', 'xl'].map(depth => (
                                        <button
                                            key={depth}
                                            onClick={() => updateWidgetConfig(selectedWidgetId, 'shadowIntensity', depth)}
                                            className={`py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase ${widgetConfigs[selectedWidgetId]?.shadowIntensity === depth ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200'
                                                }`}
                                        >
                                            {depth}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                <Box size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">ID Hash</p>
                                <p className="font-black text-slate-900 text-[10px] mt-1">{selectedWidgetId.toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
