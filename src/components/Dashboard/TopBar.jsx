import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ranges = [
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
]

export default function TopBar({ dateRange, onDateRangeChange }) {
  return (
    <div className="flex items-center justify-between bg-card rounded-xl border px-4 py-2">
      <div className="flex items-center gap-4">
        <span className="font-brand text-lg font-bold tracking-tight">Datafeed</span>
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ranges.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
