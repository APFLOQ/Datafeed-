import { useMemo } from 'react'
import { DollarSign, Percent, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function SectionCards({ stats }) {
  const items = useMemo(() => [
    { icon: DollarSign, label: 'Total P&L', value: `$${stats.totalPnL?.toFixed(0) || 0}`, tone: stats.totalPnL >= 0 ? 'up' : 'down' },
    { icon: Percent, label: 'Win Rate', value: `${(stats.winRate || 0).toFixed(1)}%` },
    { icon: TrendingUp, label: 'Profit Factor', value: (stats.profitFactor || 0).toFixed(2) },
    { icon: Activity, label: 'Sharpe', value: (stats.sharpe || 0).toFixed(2) },
    { icon: BarChart3, label: 'Sortino', value: (stats.sortino || 0).toFixed(2) },
  ], [stats])

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-5 px-4 lg:px-6">
      {items.map((item) => (
        <Card key={item.label} className="@container/card">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <item.icon size={14} className="text-primary" />
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <span className={cn(
              'font-mono text-xl font-semibold tracking-tight truncate block',
              item.tone === 'up' ? 'text-success' : item.tone === 'down' ? 'text-destructive' : '',
            )}>
              {item.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
