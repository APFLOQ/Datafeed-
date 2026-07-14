import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ChartAreaInteractive({ trades }) {
  const [timeRange, setTimeRange] = useState('all')

  const chartData = useMemo(() => {
    let cum = 0
    const sorted = [...trades]
      .filter((t) => t.date)
      .sort((a, b) => a.date.localeCompare(b.date))
    return sorted.map((t) => {
      const entry = Number(t.entryPrice) || 0
      const exit = Number(t.exitPrice) || 0
      const qty = Number(t.size) || 0
      const dir = t.direction === 'short' ? -1 : 1
      const pnl = (exit - entry) * qty * dir
      cum += pnl
      return { date: t.date, pnl: cum }
    })
  }, [trades])

  const filteredData = useMemo(() => {
    if (timeRange === 'all') return chartData
    const days = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7
    const ref = new Date()
    const cutoff = new Date(ref.getTime() - days * 86400000)
    return chartData.filter((d) => new Date(d.date) >= cutoff)
  }, [chartData, timeRange])

  const chartConfig = {
    pnl: { label: 'Equity', color: '#ee6018' },
  }

  return (
    <Card className="@container/card shadow-none border-[#3d3a39]">
      <CardHeader>
        <CardTitle className="font-['Geist',sans-serif] text-[14px] font-[400] tracking-[-0.025em] text-[#eeeeee]">
          Equity Curve
        </CardTitle>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="90d">3M</ToggleGroupItem>
            <ToggleGroupItem value="30d">1M</ToggleGroupItem>
            <ToggleGroupItem value="7d">7D</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-32 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="90d">3 Months</SelectItem>
              <SelectItem value="30d">1 Month</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData.length > 0 ? filteredData : [{ date: '', pnl: 0 }]}>
            <defs>
              <linearGradient id="fillPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ee6018" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ee6018" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#3d3a39" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) => v ? v.slice(5) : ''}
              stroke="#8a8380"
              style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="pnl"
              type="monotone"
              fill="url(#fillPnl)"
              stroke="#ee6018"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
