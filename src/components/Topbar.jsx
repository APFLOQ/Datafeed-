import { Plus } from 'lucide-react';

export default function Topbar({ tab, onAddTrade, onAddPremarket }) {
  const titles = {
    calendar: 'Monthly calendar',
    premarket: 'Ficha Pre-Market',
    trades: 'All trades',
    analytics: 'Analytics',
    playbook: 'Strategy playbook',
  };

  return (
    <div className="flex items-center justify-between px-6 py-[18px] border-b border-[#2B3242]">
      <h2 className="m-0 text-[17px] font-semibold">{titles[tab]}</h2>
      {(tab === 'calendar' || tab === 'trades') && (
        <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-[7px] cursor-pointer font-sans bg-accent text-[#1A130A] border border-accent" onClick={onAddTrade}>
          <Plus size={14} /> Add trade
        </button>
      )}
      {tab === 'premarket' && (
        <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-[7px] cursor-pointer font-sans bg-accent text-[#1A130A] border border-accent" onClick={onAddPremarket}>
          <Plus size={14} /> Nueva ficha
        </button>
      )}
    </div>
  );
}
