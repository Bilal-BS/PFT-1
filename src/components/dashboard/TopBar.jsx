import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plus, RefreshCw, Save, Settings, Moon, Sun, Bell, Cpu, LayoutGrid, Grid, Search, LogOut } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { supabase } from '../../lib/supabase';

const TopBar = () => {
  const [profile, setProfile] = useState(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="h-16 px-8 flex items-center justify-between bg-transparent border-b border-[var(--sidebar-border)] sticky top-0 z-40 backdrop-blur-md">

      {/* Search - NextGen Style */}
      <div className="flex-1 max-w-xl relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={16} />
        <input
          type="text"
          placeholder="Global Search..."
          className="w-full bg-[var(--bg-app)] border border-[var(--sidebar-border)] rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-[var(--accent-soft)] focus:border-[var(--accent)] transition-all text-xs font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)] placeholder:opacity-50"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pl-6 border-l border-[var(--sidebar-border)]">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest">{profile?.full_name?.split(' ')[0] || 'User'}</p>
            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">System Online</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center font-black text-white text-xs border border-[var(--sidebar-border)] shadow-lg shadow-[var(--accent-glow)]">
            {profile?.full_name?.[0] || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
