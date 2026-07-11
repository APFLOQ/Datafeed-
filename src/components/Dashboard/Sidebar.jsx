import { LayoutDashboard, ArrowLeftRight, BarChart3, Calendar, BookOpen, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: ArrowLeftRight, label: 'Trades', id: 'trades' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Calendar, label: 'Calendar', id: 'calendar' },
  { icon: Target, label: 'Pre-Market', id: 'premarket' },
  { icon: BookOpen, label: 'Playbook', id: 'playbook' },
]

export default function Sidebar({ activeSection, onSectionChange, collapsed }) {
  return (
    <nav
      className={cn(
        'flex flex-col gap-0.5 bg-card rounded-xl border p-1.5 transition-all duration-300',
        collapsed ? 'w-[52px]' : 'w-[170px]',
      )}
    >
      {links.map((l) => (
        <button
          key={l.id}
          onClick={() => onSectionChange(l.id)}
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-accent',
            activeSection === l.id && 'bg-primary/10 text-primary font-semibold',
          )}
          title={collapsed ? l.label : undefined}
        >
          <l.icon size={17} className="shrink-0" />
          {!collapsed && <span>{l.label}</span>}
        </button>
      ))}
    </nav>
  )
}
