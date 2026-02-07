import React from 'react';
import TopBar from './dashboard/TopBar';
import LeftSidebar from './dashboard/LeftSidebar';
import CenterCanvas from './dashboard/CenterCanvas';
import RightPanel from './dashboard/RightPanel';
import ArchitectureConsole from './dashboard/ArchitectureConsole';
import { useDashboardStore } from '../store/dashboardStore';

const Layout = () => {
  const currentWorkspace = useDashboardStore((state) => state.getCurrentWorkspace());
  const isDark = currentWorkspace?.layout.theme === 'dark';

  const [mobileTab, setMobileTab] = React.useState('canvas'); // 'tools', 'canvas', 'properties'

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Tools */}
        <div className={`${mobileTab === 'tools' ? 'flex w-full absolute inset-0 z-20' : 'hidden'} lg:static lg:flex lg:z-0`}>
          <LeftSidebar />
        </div>

        {/* Center Canvas */}
        <div className={`${mobileTab === 'canvas' ? 'flex' : 'hidden'} lg:flex flex-1 overflow-hidden`}>
          <CenterCanvas />
        </div>

        {/* Right Panel - Properties */}
        <div className={`${mobileTab === 'properties' ? 'flex w-full absolute inset-0 z-20' : 'hidden'} lg:static lg:flex lg:z-0`}>
          <RightPanel />
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-4 z-50">
        <button
          onClick={() => setMobileTab('tools')}
          className={`flex flex-col items-center gap-1 ${mobileTab === 'tools' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <span className="text-xl">🛠️</span>
          <span className="text-xs font-medium">Tools</span>
        </button>
        <button
          onClick={() => setMobileTab('canvas')}
          className={`flex flex-col items-center gap-1 ${mobileTab === 'canvas' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <span className="text-xl">🎨</span>
          <span className="text-xs font-medium">Canvas</span>
        </button>
        <button
          onClick={() => setMobileTab('properties')}
          className={`flex flex-col items-center gap-1 ${mobileTab === 'properties' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-xs font-medium">Properties</span>
        </button>
      </div>
      <ArchitectureConsole />
    </div>
  );
};

export default Layout;
