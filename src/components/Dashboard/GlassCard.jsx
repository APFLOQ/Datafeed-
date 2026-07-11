export default function GlassCard({ title, icon: Icon, children, className = '', cols = 1 }) {
  return (
    <div className={`mac-window ${className} glass-card`}
      style={cols > 1 ? { gridColumn: `span ${cols}` } : undefined}>
      <div className="mac-window-header">
        <div className="traffic-lights">
          <div className="traffic-light red" />
          <div className="traffic-light yellow" />
          <div className="traffic-light green" />
        </div>
        {title && <span className="mac-window-title">{title}</span>}
      </div>
      <div className="mac-window-body">
        {children}
      </div>
    </div>
  );
}
