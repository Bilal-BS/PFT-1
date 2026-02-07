import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plus, RefreshCw, Save, Settings, Moon, Sun, Bell, Cpu, LayoutGrid, Grid, Search, LogOut } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { supabase } from '../../lib/supabase';

const TopBar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0)); // Jan 2026
  const currentWorkspace = useDashboardStore((state) => state.getCurrentWorkspace());
  const setTheme = useDashboardStore((state) => state.setTheme);
  const isBlueprintMode = useDashboardStore((state) => state.isBlueprintMode);
  const toggleBlueprintMode = useDashboardStore((state) => state.toggleBlueprintMode);
  const snapToGrid = useDashboardStore((state) => state.snapToGrid);
  const toggleSnapToGrid = useDashboardStore((state) => state.toggleSnapToGrid);
  const isDark = currentWorkspace?.layout.theme === 'dark' || isBlueprintMode;

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatMonth = (date) => {
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm h-11">
      <div className="px-4 h-full flex items-center justify-between gap-6">

        {/* Left: Branding - Tiny */}
        <Link to="/" className="flex items-center gap-1.5 group transition-transform hover:scale-105 active:scale-95">
          <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-[11px] font-black tracking-tighter text-slate-800 hidden md:block uppercase leading-none">Finance Tracker</span>
        </Link>

        {/* Center: Search Hub - Compact */}
        <div className="flex-1 max-w-lg group relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={13} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-slate-50 border border-slate-100 rounded-lg py-1.5 pl-9 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all text-xs font-medium text-slate-600 placeholder:text-slate-300"
          />
        </div>

        {/* Right: Profile & Sign Out - Compact */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-100">
            <img
              src="https://i.pravatar.cc/100?u=john"
              alt="Profile"
              className="w-7 h-7 rounded-lg object-cover border border-slate-50"
            />
            <div className="hidden sm:flex items-center gap-1 group cursor-pointer">
              <span className="text-[10px] font-black text-slate-700">Hi, John</span>
              <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
