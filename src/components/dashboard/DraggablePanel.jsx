import React, { useRef, useState } from 'react';
import { GripVertical, X, Minimize2, Maximize2 } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { getWidget } from './Widgets';

const DraggablePanel = ({ panel }) => {
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const panelRef = useRef(null);

  const updatePanel = useDashboardStore((state) => state.updatePanel);
  const removePanel = useDashboardStore((state) => state.removePanel);
  const selectPanel = useDashboardStore((state) => state.selectPanel);
  const selectedPanel = useDashboardStore((state) => state.selectedPanel);
  const currentWorkspace = useDashboardStore((state) => state.getCurrentWorkspace());
  const isBlueprintMode = useDashboardStore((state) => state.isBlueprintMode);
  const isDark = currentWorkspace?.layout.theme === 'dark' || isBlueprintMode;

  const isSelected = selectedPanel === panel.id;

  // Color mapping for Tailwind colors to hex
  const colorMap = {
    'blue-500': '#3b82f6',
    'red-500': '#ef4444',
    'green-500': '#22c55e',
    'purple-500': '#a855f7',
    'yellow-500': '#eab308',
    'pink-500': '#ec4899',
    'indigo-500': '#6366f1',
    'cyan-500': '#06b6d4'
  };

  const panelHeaderColor = panel.color ? colorMap[panel.color] : null;

  const handleMouseDown = (e) => {
    if (e.target.closest('[data-resize]')) return;

    selectPanel(panel.id);
    setIsDraggingPanel(true);
    setDragOffset({
      x: e.clientX - panel.x,
      y: e.clientY - panel.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDraggingPanel) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    updatePanel(panel.id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDraggingPanel(false);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: panel.width,
      height: panel.height,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(250, resizeStart.width + deltaX);
    const newHeight = Math.max(150, resizeStart.height + deltaY);

    updatePanel(panel.id, { width: newWidth, height: newHeight });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDraggingPanel) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingPanel, dragOffset]);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStart]);

  if (panel.collapsed) {
    return (
      <div
        ref={panelRef}
        onClick={() => selectPanel(panel.id)}
        style={{
          position: 'absolute',
          left: `${panel.x}px`,
          top: `${panel.y}px`,
          width: `${panel.width}px`,
          zIndex: panel.zIndex,
          cursor: isDraggingPanel ? 'grabbing' : 'grab'
        }}
        className={`rounded-lg border flex items-center gap-2 px-3 py-2 ${isDark
          ? `${isSelected ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'} text-white`
          : `${isSelected ? 'bg-blue-100 border-blue-300' : 'bg-gray-200 border-gray-300'} text-gray-900`
          }`}
      >
        <GripVertical size={14} className="opacity-70" />
        <span className="text-sm font-medium truncate">{panel.title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            updatePanel(panel.id, { collapsed: false });
          }}
          className="ml-auto opacity-70 hover:opacity-100"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      onMouseDown={handleMouseDown}
      onClick={() => selectPanel(panel.id)}
      style={{
        position: 'absolute',
        left: `${panel.x}px`,
        top: `${panel.y}px`,
        width: `${panel.width}px`,
        height: `${panel.height}px`,
        zIndex: panel.zIndex,
        cursor: isDraggingPanel ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      className={`rounded-lg border shadow-lg flex flex-col overflow-hidden transition-colors ${isDark
        ? `${isSelected ? 'bg-gray-700 border-blue-500' : 'bg-gray-700 border-gray-600'}`
        : `${isSelected ? 'bg-white border-blue-400' : 'bg-white border-gray-300'}`
        }`}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: panelHeaderColor || (isDark ? '#1f2937' : '#f9fafb'),
          borderBottomColor: panelHeaderColor || (isDark ? '#4b5563' : '#e5e7eb')
        }}
        className={`px-4 py-3 border-b flex items-center justify-between cursor-grab select-none ${panelHeaderColor ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
      >
        <div className="flex items-center gap-2 flex-1">
          <GripVertical size={16} className="opacity-50" />
          <span className="font-semibold text-sm">{panel.title}</span>
          <span className="ml-auto text-xs opacity-50 bg-gray-500 px-2 py-1 rounded">{panel.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              updatePanel(panel.id, { collapsed: true });
            }}
            className={`p-1 rounded transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Collapse"
          >
            <Minimize2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePanel(panel.id);
            }}
            className={`p-1 rounded transition ${isDark ? 'hover:bg-red-600' : 'hover:bg-red-100'}`}
            title="Remove"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className={`h-full rounded ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {getWidget(panel.type, panel.title)}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        data-resize
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '20px',
          height: '20px',
          cursor: 'nwse-resize',
          background: `linear-gradient(135deg, transparent 50%, ${isDark ? '#3b82f6' : '#3b82f6'} 50%)`
        }}
        title="Drag to resize"
      />

      {/* Blueprint Metadata Overlay */}
      {isBlueprintMode && (
        <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/20 rounded-lg animate-in fade-in transition-all">
          {/* Top-Left: Coordinates */}
          <div className="absolute -top-1.5 -left-1.5 bg-emerald-600 text-[8px] font-black text-white px-2 py-0.5 rounded shadow-xl">
            {Math.round(panel.x)}, {Math.round(panel.y)}
          </div>
          {/* Bottom-Right: Dimensions */}
          <div className="absolute -bottom-1.5 -right-6 bg-slate-900 border border-emerald-500/50 text-[8px] font-black text-emerald-400 px-1.5 py-0.5 rounded shadow-xl uppercase">
            {panel.width} × {panel.height}
          </div>
          {/* Z-Index Indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 text-4xl font-black text-emerald-500 select-none">
            Z:{panel.zIndex}
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggablePanel;
