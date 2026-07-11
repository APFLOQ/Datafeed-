import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ranges = [
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
]

export default function SiteHeader({ dateRange, onDateRangeChange, sectionTitle }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 min-w-0">
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator orientation="vertical" className="mr-2 h-4 shrink-0" />
        <Breadcrumb className="truncate">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">{sectionTitle || 'Dashboard'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto shrink-0">
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ranges.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  )
}
