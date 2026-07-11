import { useMemo } from 'react'
import { cn } from '@/lib/utils'

const items = [
  { key: 'totalPnL', label: 'Total P&L', fmt: (v) => `$${(v || 0).toFixed(0)}` },
  { key: 'winRate', label: 'Win Rate', fmt: (v) => `${(v || 0).toFixed(1)}%` },
  { key: 'profitFactor', label: 'Profit Factor', fmt: (v) => (v || 0).toFixed(2) },
  { key: 'sharpe', label: 'Sharpe', fmt: (v) => (v || 0).toFixed(2) },
  { key: 'sortino', label: 'Sortino', fmt: (v) => (v || 0).toFixed(2) },
]

export default function SectionCards({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 px-4 lg:px-6 border-b border-[#3d3a39]">
      {items.map((item, i) => {
        const v = stats[item.key]
        const isPos = item.key === 'totalPnL' ? v >= 0 : null
        return (
          <div
            key={item.key}
            className={cn(
              'py-5 px-5 min-w-0',
              i < items.length - 1 && 'border-r border-[#3d3a39]'
            )}
          >
            <div className="font-[\'Geist_Mono\',monospace] text-[12px] uppercase tracking-[-0.24px] leading-none text-[#8a8380] mb-3 truncate">
              {item.label}
            </div>
            <div
              className={cn(
                'font-[\'Geist\',sans-serif] text-[28px] sm:text-[32px] font-[400] tracking-[-0.04em] leading-none truncate',
                isPos === true && 'text-[#a0ca92]',
                isPos === false && 'text-destructive',
                isPos === null && 'text-[#eeeeee]'
              )}
            >
              {item.fmt(v)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
