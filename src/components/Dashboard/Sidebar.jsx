import { useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, BarChart3, Calendar, BookOpen, Target, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className={`glass rounded-[20px] p-3 flex flex-col gap-1 transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[200px]'}`}>
      {links.map((l) => (
        <button
          key={l.id}
          onClick={() => onSectionChange(l.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm transition-all ${
            activeSection === l.id
              ? 'bg-brand-blue/10 text-brand-blue font-medium'
              : 'text-text-dim hover:text-text hover:bg-white/10'
          }`}
        >
          <l.icon size={18} className="shrink-0" />
          {!collapsed && <span>{l.label}</span>}
        </button>
      ))}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mt-auto flex items-center justify-center px-3 py-2 text-text-faint hover:text-text transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
}
