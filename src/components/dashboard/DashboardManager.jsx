import React, { useState } from 'react';
import { Plus, Copy, Trash2, Star, Settings } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const DashboardManager = ({ onSelectDashboard }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const workspaces = useDashboardStore((state) => state.workspaces);
  const currentWorkspaceId = useDashboardStore((state) => state.currentWorkspaceId);
  const createWorkspace = useDashboardStore((state) => state.createWorkspace);
  const duplicateWorkspace = useDashboardStore((state) => state.duplicateWorkspace);
  const deleteWorkspace = useDashboardStore((state) => state.deleteWorkspace);
  const switchWorkspace = useDashboardStore((state) => state.switchWorkspace);

  const handleCreate = () => {
    if (newDashboardName.trim()) {
      createWorkspace(newDashboardName);
      setNewDashboardName('');
      setShowCreateModal(false);
    }
  };

  const handleDuplicate = (workspaceId) => {
    const newId = duplicateWorkspace(workspaceId);
    switchWorkspace(newId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage your custom dashboards</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectDashboard('default')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
          >
            Exit to Dashboard
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <Plus size={20} />
            New Dashboard
          </button>
        </div>
      </div>

      {/* Dashboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Default Dashboard Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-green-500 hover:shadow-xl transition">
          <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
            <span className="text-5xl">📊</span>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Main Finance</h3>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                DEFAULT
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">System-provided. Safe, reliable, and always available.</p>
            <div className="flex gap-2">
              <button
                onClick={() => onSelectDashboard('default')}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                View
              </button>
              <button
                onClick={() => handleDuplicate('default')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition"
                title="Duplicate this dashboard"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Dashboard Cards */}
        {workspaces
          .filter((w) => w.id !== 'default')
          .map((workspace) => (
            <div
              key={workspace.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition border border-gray-200 dark:border-gray-700"
            >
              <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-5xl">📈</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{workspace.name}</h3>
                  {currentWorkspaceId === workspace.id && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {workspace.layout.panels.length} widgets • Last updated today
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      switchWorkspace(workspace.id);
                      onSelectDashboard(workspace.id);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDuplicate(workspace.id)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition"
                    title="Duplicate"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => deleteWorkspace(workspace.id)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Dashboard</h2>
            <input
              type="text"
              placeholder="Dashboard name..."
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDashboardName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">💡 Tips for Custom Dashboards</h3>
        <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <li>✓ Drag widgets freely to customize layout</li>
          <li>✓ Resize widgets to fit your preferences</li>
          <li>✓ Create multiple dashboards for different purposes</li>
          <li>✓ Duplicate the default dashboard to get started quickly</li>
          <li>✓ Your changes are saved automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardManager;
