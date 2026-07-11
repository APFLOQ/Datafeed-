import { fmtPct, fmtRatio, fmtDateShort } from '../../utils/formatters';
import { calcPnL } from '../../utils/calculations';
import StatCard from '../ui/StatCard';

export default function RachasTab({ revengeEvents, overconfidenceEvents, sessionStats, trades, sortedForSequence }) {
  return (
    <>
      <div className="stat-strip">
        <StatCard label="Sesgo de venganza detectado" value={revengeEvents.length} tone={revengeEvents.length > 0 ? 'down' : undefined} />
        <StatCard label="Exceso de confianza detectado" value={overconfidenceEvents.length} tone={overconfidenceEvents.length > 0 ? 'down' : undefined} />
      </div>
      <div className="analytics-section">
        <h4>Comportamiento Post-Pérdida (Revenge Trading)</h4>
        {revengeEvents.length === 0 ? <p className="hint">Sin patrones de venganza detectados.</p> : (
          <table className="metric-table"><tbody>
            {revengeEvents.map(({ trade, reasons }, i) => (
              <tr key={i}><td>{trade.symbol} · {fmtDateShort(trade.date)}</td><td className="down">{reasons.join(', ')}</td></tr>
            ))}
          </tbody></table>
        )}
      </div>
      <div className="analytics-section">
        <h4>Comportamiento Post-Ganancia (Overconfidence)</h4>
        {overconfidenceEvents.length === 0 ? <p className="hint">Sin exceso de confianza detectado tras rachas ganadoras.</p> : (
          <table className="metric-table"><tbody>
            {overconfidenceEvents.map(({ trade, confirmations }, i) => (
              <tr key={i}><td>{trade.symbol} · {fmtDateShort(trade.date)}</td><td className="down">Solo {confirmations} confirmación(es) de Order Flow tras una racha ganadora.</td></tr>
            ))}
          </tbody></table>
        )}
      </div>
      <div className="analytics-section">
        <h4>Atribución de Alfa (Sincronización de Mercado)</h4>
        <table className="metric-table"><tbody>
          {sessionStats.map((s, i) => (
            <tr key={i}><td>{s.name}</td><td>{s.count} trades · PF {fmtRatio(s.pf)} · {fmtPct(s.winRate)} win rate</td></tr>
          ))}
        </tbody></table>
      </div>
      {trades.length > 0 && (
        <div className="analytics-section">
          <h4>Secuencia de Trades (Heatmap)</h4>
          <div className="flex flex-wrap gap-0.5">
            {sortedForSequence.map((t, i) => {
              const pnl = calcPnL(t);
              const intensity = Math.min(1, Math.abs(pnl) / 500);
              return (
                <div key={i}
                  className="w-6 h-6 rounded-sm cursor-help"
                  title={`${t.symbol} ${fmtDateShort(t.date)}: ${fmtMoney(pnl)}`}
                  style={{ background: pnl >= 0 ? `rgba(79,174,124,${0.2 + intensity * 0.8})` : `rgba(224,104,90,${0.2 + intensity * 0.8})` }}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function fmtMoney(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? '-' : '';
  return `${sign}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
