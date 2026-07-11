import { useState, useMemo } from 'react';
import { Pencil, X, Sunrise } from 'lucide-react';
import { calcPnL, computeTradeDiagnostics, shortDiagBadges } from '../../utils/calculations';
import { fmtMoney, fmtDateShort, fmtPct, fmtRatio } from '../../utils/formatters';
import { ORDER_FLOW_FLAGS, CLOSE_CONTEXTS, DAY_TYPES, OVERNIGHT_INVENTORY, SHOT_STAGES, BIAS_LABEL } from '../../utils/constants';
import Lightbox from './Lightbox';

export default function TradeDetailModal({ trade, strategies, premarkets, onClose, onEdit }) {
  const d = useMemo(() => computeTradeDiagnostics(trade), [trade]);
  const pm = premarkets.find((p) => p.date === trade.date && p.ticker.toUpperCase() === trade.symbol.toUpperCase());
  const [lightbox, setLightbox] = useState(null);
  const strat = strategies.find((s) => s.id === trade.strategyId);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ width: 680 }}>
        <div className="modal-head">
          <h3>{trade.symbol} · {fmtDateShort(trade.date)} <span className={calcPnL(trade) >= 0 ? 'up' : 'down'}>{fmtMoney(calcPnL(trade))}</span></h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ marginBottom: 12 }}>
          {shortDiagBadges(d).map((b, i) => <span key={i} className={`diag-chip ${b.tone}`}>{b.text}</span>)}
          {strat && <span className="tag" style={{ '--tag-color': strat.color }}>{strat.name}</span>}
        </div>

        <table className="metric-table">
          <tbody>
            <tr><td>Dirección / Activo</td><td>{trade.direction === 'short' ? 'Short' : 'Long'} · {trade.assetType === 'options' ? 'Opciones' : 'Futuros'} · {trade.contractSize === 'mini' ? 'Mini' : 'Micro'}</td></tr>
            <tr><td>Entrada planeada → real</td><td>{trade.plannedEntryPrice || '—'} → {trade.entryPrice || '—'} {d.entrySlippage !== null && <span className="muted">(slippage {d.entrySlippage.toFixed(2)})</span>}</td></tr>
            <tr><td>Stop planeado</td><td>{trade.stopLossPrice || '—'}</td></tr>
            <tr><td>MFE / MAE (precio → puntos)</td><td>{trade.mfePrice || '—'} / {trade.maePrice || '—'} {d.mfePoints !== null && d.maePoints !== null && <span className="muted">({d.mfePoints.toFixed(2)} / {d.maePoints.toFixed(2)} pts)</span>}</td></tr>
            <tr><td>R planeado / realizado</td><td>{d.plannedR !== null ? d.plannedR.toFixed(2) + 'R' : '—'} / {d.realizedR !== null ? d.realizedR.toFixed(2) + 'R' : '—'}</td></tr>
            <tr><td>Eficiencia de salida</td><td>{d.efficiencyPct !== null ? `${fmtPct(d.efficiencyPct)} del MFE — ${d.exitEfficiency}` : '—'}</td></tr>
            <tr><td>Contexto de cierre</td><td>{CLOSE_CONTEXTS.find((c) => c.value === trade.closeContext)?.label || '—'}</td></tr>
            <tr><td>Duración / ritmo</td><td>{d.holdingMinutes !== null ? `${d.holdingMinutes} min` : '—'} {d.pointsPerMinute !== null && <span className="muted">({d.pointsPerMinute.toFixed(2)} pts/min)</span>}</td></tr>
            <tr><td>Checklist Order Flow</td><td>{ORDER_FLOW_FLAGS.filter((f) => trade.orderFlow?.[f.key]).map((f) => f.label).join(', ') || 'Vacío (impulsivo)'}</td></tr>
            <tr><td>Contexto de mercado</td><td>VIX/ATR {trade.vix || '—'} · {DAY_TYPES.find((dd) => dd.value === trade.dayTypePrev)?.label || '—'} · Overnight {OVERNIGHT_INVENTORY.find((o) => o.value === trade.overnightInventory)?.label || '—'}</td></tr>
          </tbody>
        </table>

        {d.coherenceAlert && <div className="kpi-note down">{d.coherenceAlert}</div>}

        {pm && (
          <div className="mirror-panel" style={{ marginTop: 12 }}>
            <div className="mirror-head"><Sunrise size={14} /> Comparación con tu Pre-Market</div>
            <p>Sesgo: {BIAS_LABEL[pm.bias] || '—'} · HVL {pm.hvl || '—'} · LVN {pm.lvn || '—'} · POC {pm.poc || '—'}</p>
          </div>
        )}

        <div className="section-title">Capturas por etapas</div>
        <div className="shot-grid">
          {SHOT_STAGES.map((s) => (
            <div key={s.key} className="shot-slot">
              <div className="shot-slot-head"><span>{s.label}</span></div>
              {trade.shots?.[s.key]?.img
                ? <img src={trade.shots[s.key].img} className="shot-thumb" alt={s.label} onClick={() => setLightbox(s.key)} />
                : <div className="hint">Sin captura</div>}
            </div>
          ))}
        </div>

        {trade.notes && (
          <>
            <div className="section-title">Notas</div>
            <p className="hint" style={{ whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{trade.notes}</p>
          </>
        )}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cerrar</button>
          <button className="btn primary" onClick={() => { onClose(); onEdit(trade); }}><Pencil size={14} /> Editar</button>
        </div>
      </div>

      {lightbox && trade.shots?.[lightbox] && (
        <Lightbox img={trade.shots[lightbox].img} note={trade.shots[lightbox].note} label={SHOT_STAGES.find((s) => s.key === lightbox).label} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
