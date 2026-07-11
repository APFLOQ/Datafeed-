import { useMemo } from 'react';
import { DollarSign, Percent, TrendingUp, Activity, BarChart3 } from 'lucide-react';

function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="glass rounded-[16px] p-4 flex flex-col gap-1 min-w-[130px]">
      <div className="flex items-center gap-2 text-text-dim text-xs">
        <Icon size={14} className="text-brand-blue" />
        {label}
      </div>
      <span className={`font-mono text-lg font-semibold ${tone === 'up' ? 'text-profit' : tone === 'down' ? 'text-loss' : 'text-text'}`}>
        {value}
      </span>
    </div>
  );
}

export default function StatsCardGrid({ stats }) {
  const items = useMemo(() => [
    { icon: DollarSign, label: 'Total P&L', value: `$${stats.totalPnL?.toFixed(0) || 0}`, tone: stats.totalPnL >= 0 ? 'up' : 'down' },
    { icon: Percent, label: 'Win Rate', value: `${(stats.winRate || 0).toFixed(1)}%` },
    { icon: TrendingUp, label: 'Profit Factor', value: (stats.profitFactor || 0).toFixed(2) },
    { icon: Activity, label: 'Sharpe', value: (stats.sharpe || 0).toFixed(2) },
    { icon: BarChart3, label: 'Sortino', value: (stats.sortino || 0).toFixed(2) },
  ], [stats]);

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <MiniStat key={item.label} {...item} />
      ))}
    </div>
  );
}
