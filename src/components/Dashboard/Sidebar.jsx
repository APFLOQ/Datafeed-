import { useState } from 'react';
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
    <div className={`glass-sidebar transition-all duration-300 ${collapsed ? 'w-[52px]' : 'w-[170px]'}`}>
      {links.map((l) => (
        <button
          key={l.id}
          onClick={() => onSectionChange(l.id)}
          className={`glass-sidebar-item ${activeSection === l.id ? 'active' : ''}`}
          title={collapsed ? l.label : undefined}
        >
          <l.icon size={17} className="shrink-0" />
          {!collapsed && <span>{l.label}</span>}
        </button>
      ))}
    </div>
  );
}
