import { useMemo } from 'react'
import { DollarSign, Percent, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <Card size="sm" className="px-3 py-2.5 min-w-[120px]">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={12} className="text-primary" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <span className={cn(
        'font-mono text-lg font-semibold tracking-tight',
        tone === 'up' ? 'text-profit' : tone === 'down' ? 'text-loss' : 'text-foreground',
      )}>
        {value}
      </span>
    </Card>
  )
}

export default function StatsCardGrid({ stats }) {
  const items = useMemo(() => [
    { icon: DollarSign, label: 'Total P&L', value: `$${stats.totalPnL?.toFixed(0) || 0}`, tone: stats.totalPnL >= 0 ? 'up' : 'down' },
    { icon: Percent, label: 'Win Rate', value: `${(stats.winRate || 0).toFixed(1)}%` },
    { icon: TrendingUp, label: 'Profit Factor', value: (stats.profitFactor || 0).toFixed(2) },
    { icon: Activity, label: 'Sharpe', value: (stats.sharpe || 0).toFixed(2) },
    { icon: BarChart3, label: 'Sortino', value: (stats.sortino || 0).toFixed(2) },
  ], [stats])

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <MiniStat key={item.label} {...item} />
      ))}
    </div>
  )
}
