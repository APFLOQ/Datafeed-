import { useState } from 'react';
import { LogOut, Settings, ChevronDown } from 'lucide-react';

export default function TopBar({ dateRange, onDateRangeChange }) {
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
    </div>
  );
}
