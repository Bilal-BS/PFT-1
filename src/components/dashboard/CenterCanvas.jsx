import React, { useRef, useState } from 'react';
import DraggablePanel from './DraggablePanel';
import { useDashboardStore } from '../../store/dashboardStore';

const CenterCanvas = () => {
  const canvasRef = useRef(null);
  const [dragOverCanvas, setDragOverCanvas] = useState(false);

  const panels = useDashboardStore((state) => state.getPanels());
  const addPanel = useDashboardStore((state) => state.addPanel);
  const currentWorkspace = useDashboardStore((state) => state.getCurrentWorkspace());
  const deselectPanel = useDashboardStore((state) => state.deselectPanel);
  const isBlueprintMode = useDashboardStore((state) => state.isBlueprintMode);
  const isDark = currentWorkspace?.layout.theme === 'dark' || isBlueprintMode;

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('panelType')) {
      setDragOverCanvas(true);
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = () => {
    setDragOverCanvas(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOverCanvas(false);

    const panelTypeStr = e.dataTransfer.getData('panelType');
    if (!panelTypeStr) return;

    const panelType = JSON.parse(panelTypeStr);
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Color options for new panels
    const colors = ['blue-500', 'red-500', 'green-500', 'purple-500', 'yellow-500', 'pink-500', 'indigo-500', 'cyan-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newPanel = {
      id: `${panelType.id}_${Date.now()}`,
      type: panelType.id,
      title: panelType.name,
      dock: 'floating',
      width: 400,
      height: 250,
      x: Math.max(0, x - 200),
      y: Math.max(0, y - 125),
      collapsed: false,
      zIndex: Math.max(...panels.map(p => p.zIndex || 1)) + 1,
      color: randomColor
    };

    addPanel(newPanel);
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      deselectPanel();
    }
  };

  // Sort panels by z-index
  const sortedPanels = [...panels].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  return (
    <div
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      className={`flex-1 relative overflow-auto lg:overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-white'
        } ${dragOverCanvas ? (isDark ? 'ring-2 ring-blue-500' : 'ring-2 ring-blue-500') : ''}`}
    >
      {/* Canvas Background Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: isBlueprintMode ? `
            repeating-linear-gradient(0deg, transparent, transparent 9px, ${isDark ? '#334155' : '#e2e8f0'} 9px, ${isDark ? '#334155' : '#e2e8f0'} 10px),
            repeating-linear-gradient(90deg, transparent, transparent 9px, ${isDark ? '#334155' : '#e2e8f0'} 9px, ${isDark ? '#334155' : '#e2e8f0'} 10px),
            repeating-linear-gradient(0deg, transparent, transparent 49px, ${isDark ? '#475569' : '#cbd5e1'} 49px, ${isDark ? '#475569' : '#cbd5e1'} 50px),
            repeating-linear-gradient(90deg, transparent, transparent 49px, ${isDark ? '#475569' : '#cbd5e1'} 49px, ${isDark ? '#475569' : '#cbd5e1'} 50px)
          ` : `
            repeating-linear-gradient(0deg, transparent, transparent 49px, ${isDark ? '#ffffff' : '#000000'} 49px, ${isDark ? '#ffffff' : '#000000'} 50px),
            repeating-linear-gradient(90deg, transparent, transparent 49px, ${isDark ? '#ffffff' : '#000000'} 49px, ${isDark ? '#ffffff' : '#000000'} 50px)
          `
        }}
        pointerEvents="none"
      />

      {/* Drag Over Hint */}
      {dragOverCanvas && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-5 pointer-events-none rounded-lg">
          <div className={`text-lg font-semibold opacity-50 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            ➕ Drop panel here
          </div>
        </div>
      )}

      {/* Panels */}
      <div className="relative w-full h-full">
        {sortedPanels.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-sm">No panels yet</p>
            <p className="text-xs mt-1">Drag a tool from the left sidebar to add panels</p>
          </div>
        ) : (
          sortedPanels.map((panel) => (
            <DraggablePanel key={panel.id} panel={panel} />
          ))
        )}
      </div>

      {/* Grid Toggle (Optional) */}
      <div className="absolute bottom-4 right-4 text-xs opacity-30 pointer-events-none">
        Canvas • {sortedPanels.length} panel{sortedPanels.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default CenterCanvas;
