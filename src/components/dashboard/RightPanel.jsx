import React from 'react';
import { X } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const RightPanel = () => {
  const currentWorkspace = useDashboardStore((state) => state.getCurrentWorkspace());
  const selectedPanel = useDashboardStore((state) => state.selectedPanel);
  const panels = useDashboardStore((state) => state.getPanels());
  const deselectPanel = useDashboardStore((state) => state.deselectPanel);
  const updatePanel = useDashboardStore((state) => state.updatePanel);
  const isDark = currentWorkspace?.layout.theme === 'dark';

  const selectedPanelData = panels.find((p) => p.id === selectedPanel);

  const colorOptions = [
    { name: 'Blue', value: 'blue-500' },
    { name: 'Red', value: 'red-500' },
    { name: 'Green', value: 'green-500' },
    { name: 'Purple', value: 'purple-500' },
    { name: 'Yellow', value: 'yellow-500' },
    { name: 'Pink', value: 'pink-500' },
    { name: 'Indigo', value: 'indigo-500' },
    { name: 'Cyan', value: 'cyan-500' },
  ];

  return (
    <div
      className={`w-full lg:w-80 border-l flex flex-col ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <span className="font-semibold uppercase text-sm tracking-wide opacity-70">Properties</span>
        {selectedPanel && (
          <button
            onClick={deselectPanel}
            className={`p-1 rounded-lg transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedPanel ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <div className="text-4xl mb-3">❓</div>
            <p className="text-sm font-semibold">NO PANEL SELECTED</p>
            <p className="text-xs mt-2 leading-relaxed">Click on any panel in the canvas to view and edit its properties.</p>
            <p className="text-xs mt-3 opacity-60">✓ Drag to move  ✓ Resize corner  ✓ Click to select</p>
          </div>
        ) : selectedPanelData ? (
          <div className="space-y-5">
            {/* Section: Basic */}
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3 break-words">Basic</h3>

              <div className="mb-3">
                <label className="block text-xs font-semibold uppercase opacity-70 mb-2 break-words">Title</label>
                <input
                  type="text"
                  value={selectedPanelData.title}
                  onChange={(e) => updatePanel(selectedPanel, { title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-sm break-words ${isDark ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Section: Appearance */}
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3 break-words">Appearance</h3>

              {/* Panel Color */}
              <div className="mb-3">
                <label className="block text-xs font-semibold uppercase opacity-70 mb-2 break-words">Header Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updatePanel(selectedPanel, { color: color.value })}
                      className={`h-8 rounded-lg transition transform hover:scale-110 ${selectedPanelData.color === color.value
                          ? 'ring-2 ring-offset-1 ring-white'
                          : 'opacity-70 hover:opacity-100'
                        } bg-${color.value}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Size & Position */}
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3 break-words">Size & Position</h3>

              {/* Position */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase opacity-70 mb-2 break-words">X Position</label>
                  <input
                    type="number"
                    value={selectedPanelData.x}
                    onChange={(e) => updatePanel(selectedPanel, { x: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg text-sm break-words ${isDark ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'
                      }`}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase opacity-70 mb-2 break-words">Y Position</label>
                  <input
                    type="number"
                    value={selectedPanelData.y}
                    onChange={(e) => updatePanel(selectedPanel, { y: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg text-sm break-words ${isDark ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'
                      }`}
                  />
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase opacity-70 mb-2 break-words">Width</label>
                  <input
                    type="number"
                    value={selectedPanelData.width}
                    onChange={(e) => updatePanel(selectedPanel, { width: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg text-sm break-words ${isDark ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'
                      }`}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase opacity-70 mb-2 break-words">Height</label>
                  <input
                    type="number"
                    value={selectedPanelData.height}
                    onChange={(e) => updatePanel(selectedPanel, { height: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg text-sm break-words ${isDark ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'
                      }`}
                  />
                </div>
              </div>
            </div>

            {/* Section: Layout */}
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3 break-words">Layout</h3>

              {/* Z-Index */}
              <div className="mb-3">
                <label className="block text-xs font-semibold uppercase opacity-70 mb-2 break-words">Z-Index (Depth)</label>
                <input
                  type="number"
                  value={selectedPanelData.zIndex}
                  onChange={(e) => updatePanel(selectedPanel, { zIndex: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'
                    }`}
                />
              </div>

              {/* Dock Location */}
              <div className="mb-3">
                <label className="block text-xs font-semibold uppercase opacity-70 mb-2 break-words">Dock Location</label>
                <select
                  value={selectedPanelData.dock}
                  onChange={(e) => updatePanel(selectedPanel, { dock: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="floating">Floating</option>
                  <option value="left">Left Dock</option>
                  <option value="right">Right Dock</option>
                  <option value="bottom">Bottom Dock</option>
                </select>
              </div>
            </div>

            {/* Section: Information */}
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3 break-words">Information</h3>

              {/* Panel Type */}
              <div className="mb-3">
                <label className="block text-xs font-semibold uppercase opacity-70 mb-2 break-words">Type</label>
                <div className={`px-3 py-2 rounded-lg text-sm font-medium break-words ${isDark ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'
                  }`}>
                  {selectedPanelData.type.charAt(0).toUpperCase() + selectedPanelData.type.slice(1)}
                </div>
              </div>

              {/* Collapsed State */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPanelData.collapsed}
                    onChange={(e) => updatePanel(selectedPanel, { collapsed: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium break-words">Collapse Panel</span>
                </label>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-200'} text-xs space-y-1`}>
              <div className="flex justify-between items-start gap-2 break-words">
                <span className="opacity-70 break-words">Panel ID:</span>
                <span className="font-mono text-xs opacity-70 break-all">{selectedPanel.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-start gap-2 break-words">
                <span className="opacity-70 break-words">Position:</span>
                <span className="font-mono break-words">{selectedPanelData.x}, {selectedPanelData.y}</span>
              </div>
              <div className="flex justify-between items-start gap-2 break-words">
                <span className="opacity-70 break-words">Size:</span>
                <span className="font-mono break-words">{selectedPanelData.width}×{selectedPanelData.height}px</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RightPanel;
