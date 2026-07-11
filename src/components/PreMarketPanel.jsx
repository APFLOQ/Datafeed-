import { Pencil } from 'lucide-react';
import { fmtDateShort } from '../utils/formatters';
import { BIAS_LABEL, EXPECTED_TRIGGER_LABEL, DAY_TYPES, OVERNIGHT_INVENTORY } from '../utils/constants';
import ConfirmDelete from './Modals/ConfirmDelete';

export default function PreMarketPanel({ premarkets, onEdit, onDelete }) {
  if (premarkets.length === 0) {
    return (
      <div className="empty-state">
        <h4>A\u00fan no tienes fichas de Pre-Market</h4>
        <p>Registra tu sesgo, tus niveles clave y el trigger esperado antes de la apertura.</p>
      </div>
    );
  }
  return (
    <div className="premarket-list">
      {[...premarkets].sort((a, b) => (a.date < b.date ? 1 : -1)).map((p) => (
        <div key={p.id} className="premarket-row">
          <div className="premarket-row-head">
            <div>
              <strong className="mono">{p.ticker}</strong> <span className="muted">{fmtDateShort(p.date)}</span>{' '}
              <span className="tag" style={{ '--tag-color': p.bias === 'long' ? '#4FAE7C' : p.bias === 'short' ? '#E0685A' : '#7FB2D9' }}>
                {BIAS_LABEL[p.bias] || '\u2014'}
              </span>
            </div>
            <div className="row-actions">
              <button className="icon-btn" onClick={() => onEdit(p)}><Pencil size={14} /></button>
              <ConfirmDelete onConfirm={() => onDelete(p.id)} />
            </div>
          </div>
          <div className="premarket-levels">
            <span>HVL {p.hvl || '\u2014'}</span><span>LVN {p.lvn || '\u2014'}</span><span>POC {p.poc || '\u2014'}</span>
            <span>VIX/ATR {p.vix || '\u2014'}</span>
            <span>{DAY_TYPES.find((d) => d.value === p.dayTypePrev)?.label || '\u2014'}</span>
            <span>Overnight: {OVERNIGHT_INVENTORY.find((o) => o.value === p.overnightInventory)?.label || '\u2014'}</span>
          </div>
          <div className="muted" style={{ fontSize: 11.5 }}>
            Trigger esperado: {Object.entries(p.expectedTriggers || {}).filter(([, v]) => v).map(([k]) => EXPECTED_TRIGGER_LABEL[k]).join(', ') || '\u2014'}
          </div>
        </div>
      ))}
    </div>
  );
}
