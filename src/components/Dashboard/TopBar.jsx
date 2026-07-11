import { useState } from 'react';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function TopBar({ dateRange, onDateRangeChange }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="glass rounded-[16px] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-brand text-xl text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>
          Datafeed
        </span>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="glass-input text-sm py-1.5 px-3"
        >
          <option value="1m">Last Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 glass py-1.5 px-4 rounded-[12px] text-sm text-text"
        >
          <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-text-dim text-xs max-w-[120px] truncate">{user?.email}</span>
          <ChevronDown size={14} className="text-text-faint" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 glass rounded-[12px] py-2 min-w-[160px] z-50">
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-dim hover:text-text hover:bg-white/10 transition-colors">
              <Settings size={14} /> Settings
            </button>
            <button onClick={signOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-loss hover:bg-white/10 transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
