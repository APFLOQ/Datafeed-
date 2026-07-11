import { ImageIcon, Link2, Eye, Pencil } from 'lucide-react';
import { calcPnL, computeTradeDiagnostics, shortDiagBadges } from '../utils/calculations';
import { fmtMoney, fmtDateShort } from '../utils/formatters';
import ConfirmDelete from './Modals/ConfirmDelete';

export default function TradeTable({ trades, strategies, onView, onEdit, onDelete }) {
  if (trades.length === 0) {
    return (
      <div className="empty-state">
        <h4>No trades yet</h4>
        <p>Log your first trade to start building your journal.</p>
      </div>
    );
  }
  return (
    <table className="trade-table">
      <thead>
        <tr>
          <th>Date</th><th>Symbol</th><th>Dir</th><th>P&amp;L</th><th>Strategy</th><th>Diag</th><th></th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t) => {
          const strat = strategies.find((s) => s.id === t.strategyId);
          const pnl = calcPnL(t);
          const d = computeTradeDiagnostics(t);
          return (
            <tr key={t.id}>
              <td className="mono">{fmtDateShort(t.date)}</td>
              <td className="mono">
                {t.symbol}
                {t.shots?.trigger?.img && <ImageIcon size={11} style={{ marginLeft: 6, verticalAlign: 'middle', opacity: 0.6 }} />}
                {t.videoLink && <Link2 size={11} style={{ marginLeft: 4, verticalAlign: 'middle', opacity: 0.6 }} />}
              </td>
              <td className="muted">{t.direction === 'short' ? 'Short' : 'Long'}</td>
              <td className={`mono ${pnl >= 0 ? 'up' : 'down'}`}>{fmtMoney(pnl)}</td>
              <td>{strat && <span className="tag" style={{ '--tag-color': strat.color }}>{strat.name}</span>}</td>
              <td>{shortDiagBadges(d).slice(0, 2).map((b, i) => <span key={i} className={`diag-chip ${b.tone}`}>{b.text}</span>)}</td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => onView(t)}><Eye size={14} /></button>
                  <button className="icon-btn" onClick={() => onEdit(t)}><Pencil size={14} /></button>
                  <ConfirmDelete onConfirm={() => onDelete(t.id)} />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
