import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function GlassCard({ title, icon: Icon, children, className = '', cols = 1 }) {
  return (
    <Card
      size="sm"
      className={cn('overflow-hidden', className)}
      style={cols > 1 ? { gridColumn: `span ${cols}` } : undefined}
    >
      {(title || Icon) && (
        <CardHeader className="flex flex-row items-center gap-2 pb-1">
          {Icon && <Icon size={15} className="text-brand-blue" />}
          {title && <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</CardTitle>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
