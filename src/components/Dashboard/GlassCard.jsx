export default function GlassCard({ title, icon: Icon, children, className = '', cols = 1 }) {
  return (
    <div className={`glass rounded-[20px] p-6 ${className} glass-card`}
      style={cols > 1 ? { gridColumn: `span ${cols}` } : undefined}>
      {(title || Icon) && (
        <div className="flex items-center gap-2 mb-5">
          {Icon && <Icon size={18} className="text-brand-blue" />}
          {title && <h3 className="font-semibold text-text text-base">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
}
