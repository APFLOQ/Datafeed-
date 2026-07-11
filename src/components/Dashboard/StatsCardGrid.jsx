import { useMemo } from 'react';
import { DollarSign, Percent, TrendingUp, Activity, BarChart3 } from 'lucide-react';

function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="glass-stat">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className="text-brand-blue" />
        <span className="glass-stat-label">{label}</span>
      </div>
      <span className={`glass-stat-value ${tone === 'up' ? 'text-profit' : tone === 'down' ? 'text-loss' : 'text-text'}`}>
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
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <MiniStat key={item.label} {...item} />
      ))}
    </div>
  );
}
