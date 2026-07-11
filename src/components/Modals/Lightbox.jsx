import { X } from 'lucide-react';

export default function Lightbox({ img, note, label, onClose }) {
  return (
    <div className="modal-backdrop lightbox-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lightbox-card">
        <div className="lightbox-img-wrap">
          {img ? <img src={img} alt={label} /> : <div className="empty-state">Sin captura</div>}
        </div>
        <div className="lightbox-side">
          <div className="modal-head">
            <h3>{label}</h3>
            <button className="icon-btn" onClick={onClose}><X size={16} /></button>
          </div>
          <p className="hint" style={{ whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{note || 'Sin notas para esta captura.'}</p>
        </div>
      </div>
    </div>
  );
}
