import { useState, useEffect } from 'react';
import { LayoutDashboard, ArrowLeftRight, BarChart3, Calendar, BookOpen, Target } from 'lucide-react';

const links = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: ArrowLeftRight, label: 'Trades', id: 'trades' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Calendar, label: 'Calendar', id: 'calendar' },
  { icon: Target, label: 'Pre-Market', id: 'premarket' },
  { icon: BookOpen, label: 'Playbook', id: 'playbook' },
];

export default function Sidebar({ activeSection, onSectionChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`mac-dock transition-all duration-300 ${collapsed ? 'w-[56px]' : 'w-[180px]'}`}>
      {!collapsed && (
        <div className="px-3 pb-2 pt-1 text-xs font-semibold text-text-faint uppercase tracking-wider">
          Sections
        </div>
      )}
      {links.map((l) => (
        <button
          key={l.id}
          onClick={() => onSectionChange(l.id)}
          className={`mac-dock-item ${activeSection === l.id ? 'active' : ''}`}
          title={collapsed ? l.label : undefined}
        >
          <div className="mac-dock-item-icon">
            <l.icon size={18} />
          </div>
          {!collapsed && <span>{l.label}</span>}
        </button>
      ))}
    </div>
  );
}

export { links };
