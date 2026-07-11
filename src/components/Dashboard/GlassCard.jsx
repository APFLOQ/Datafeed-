import { ArrowRight } from 'lucide-react';

export default function GlassCard({ title, icon: Icon, children, className = '', cols = 1 }) {
  return (
    <div className={`glass-card ${className}`}
      style={cols > 1 ? { gridColumn: `span ${cols}` } : undefined}>
      {(title || Icon) && (
        <div className="glass-card-header">
          {Icon && <Icon size={15} className="text-brand-blue" />}
          {title && <span className="glass-card-title">{title}</span>}
        </div>
      )}
      <div className="glass-card-body">
        {children}
      </div>
    </div>
  );
}
