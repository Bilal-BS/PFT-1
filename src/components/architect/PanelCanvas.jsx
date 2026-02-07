
import React from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import OverviewStats from '../dashboard/widgets/OverviewStats'
import FinancialVelocity from '../dashboard/widgets/FinancialVelocity'
import RecentTransactionsWidget from '../dashboard/widgets/RecentTransactionsWidget'
import CategoryExpenseChart from '../dashboard/widgets/CategoryExpenseChart'
import SystemCommandWidget from '../dashboard/widgets/SystemCommandWidget'
import WidgetWrapper from '../dashboard/WidgetWrapper'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function PanelCanvas({
    workspace,
    selectedWidgetId,
    setSelectedWidgetId,
    financials,
    transactions,
    accounts,
    pdcs,
    currency
}) {

    const renderWidgetContent = (id) => {
        switch (id) {
            case 'overview': return <OverviewStats financials={financials} currency={currency} />
            case 'income_expense': return <FinancialVelocity data={transactions} />
            case 'recent_tx': return <RecentTransactionsWidget transactions={transactions} currency={currency} />
            case 'category_dist': return <CategoryExpenseChart transactions={transactions} />
            case 'system_cmd': return <SystemCommandWidget />
            default: return null
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

    return (
        <div className="h-full w-full overflow-y-auto p-12 custom-scrollbar">
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: workspace?.layout?.panels || workspace?.panels || [] }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={30}
                draggableHandle=".drag-handle"
                margin={[32, 32]}
                isDraggable={true}
                isResizable={true}
            >
                {(workspace?.layout?.panels || workspace?.panels || []).map(panel => (
                    <div key={panel.id} className="group">
                        <WidgetWrapper
                            title={getWidgetTitle(panel.id)}
                            isSelected={selectedWidgetId === panel.id}
                            onClick={() => setSelectedWidgetId(panel.id)}
                            onRemove={() => console.log('remove', panel.id)}
                            // Professional dark theme override
                            config={{
                                accentColor: 'slate',
                                borderRadius: '24px',
                                shadowIntensity: 'xl'
                            }}
                        >
                            <div className="bg-[#1A1D23] h-full">
                                {renderWidgetContent(panel.id)}
                            </div>
                        </WidgetWrapper>
                    </div>
                ))}
            </ResponsiveGridLayout>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .react-grid-placeholder {
          background: rgba(99, 102, 241, 0.05) !important;
          border-radius: 24px !important;
          border: 1px dashed rgba(99, 102, 241, 0.2) !important;
          opacity: 1 !important;
        }
      `}</style>
        </div>
    )
}
