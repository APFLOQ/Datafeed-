import { Calendar as CalendarIcon, List, BarChart3, BookOpen, Sunrise, Loader2 } from 'lucide-react';

export default function Sidebar({ tab, setTab, saving, saveError }) {
  const tabs = [
    { key: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    { key: 'premarket', icon: Sunrise, label: 'Pre-Market' },
    { key: 'trades', icon: List, label: 'Trades' },
    { key: 'analytics', icon: BarChart3, label: 'Analytics' },
    { key: 'playbook', icon: BookOpen, label: 'Playbook' },
  ];

  return (
    <aside className="w-48 flex-shrink-0 bg-[#1A2029] border-r border-[#2B3242] p-5 flex flex-col gap-1">
      <div className="font-mono font-semibold text-sm tracking-wide px-2 pb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent" /> TAPELINE{' '}
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-dim text-accent ml-auto font-sans">BETA</span>
      </div>
      {tabs.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border-none bg-transparent text-text-dim text-xs cursor-pointer text-left font-sans hover:bg-[#212836] hover:text-text ${tab === key ? '!bg-accent-dim !text-accent' : ''}`}
          onClick={() => setTab(key)}
        >
          <Icon size={15} /> {label}
        </button>
      ))}
      <div className="mt-auto text-[11px] text-text-faint p-2 flex items-center gap-1.5">
        {saving ? <><Loader2 size={12} className="spin" /> Saving\u2026</> : saveError ? <span className="text-loss">{saveError}</span> : 'Synced'}
      </div>
    </aside>
  );
}
