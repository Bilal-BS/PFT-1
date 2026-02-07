import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const LeftSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentWorkspace = useDashboardStore((state) => state.getCurrentWorkspace());
  const addPanel = useDashboardStore((state) => state.addPanel);
  const isDark = currentWorkspace?.layout.theme === 'dark';

  const panelTypes = [
    { id: 'income', name: 'Income', icon: '💰' },
    { id: 'expense', name: 'Expense', icon: '💸' },
    { id: 'balance', name: 'Balance', icon: '⚖️' },
    { id: 'bank', name: 'Bank', icon: '🏦' },
    { id: 'investment', name: 'Investment', icon: '📈' },
    { id: 'loans', name: 'Loans', icon: '🏦' },
    { id: 'transactions', name: 'Transactions', icon: '📋' },
    { id: 'chart', name: 'Chart', icon: '📊' },
    { id: 'alerts', name: 'Alerts', icon: '🔔' },
    { id: 'ai_insights', name: 'AI Insights', icon: '🧠' }
  ];

  const handleAddPanel = (type) => {
    const newPanel = {
      id: `${type.id}_${Date.now()}`,
      type: type.id,
      title: type.name,
      dock: 'floating',
      width: 400,
      height: 250,
      x: 350 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      collapsed: false,
      zIndex: 1
    };
    addPanel(newPanel);
  };

  return (
    <div
      className={`flex flex-col border-r transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        } w-full ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <span className={`${isCollapsed ? 'hidden' : 'block'} font-semibold text-sm uppercase tracking-wide opacity-70`}>Tools</span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:block p-1 rounded-lg transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Panel Types */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {panelTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleAddPanel(type)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'copy';
              e.dataTransfer.setData('panelType', JSON.stringify(type));
            }}
            title={type.name}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${isDark
              ? 'hover:bg-gray-700 active:bg-blue-600'
              : 'hover:bg-gray-200 active:bg-blue-500 active:text-white'
              }`}
          >
            <span className="text-lg">{type.icon}</span>
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left text-sm">{type.name}</span>
                <Plus size={14} className="opacity-50" />
              </>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className={`p-3 border-t ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        {!isCollapsed && (
          <div className="text-xs opacity-50 text-center">
            Drag tools to add
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
