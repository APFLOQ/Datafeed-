import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { fmtPct, fmtRatio, fmtMoney } from '../../utils/formatters';
import { calcPnL, computeTradeDiagnostics } from '../../utils/calculations';
import StatCard from '../UI/StatCard';

export default function CuantitativoTab({ quantStats, trades }) {
  const rMultipleData = useMemo(() => {
    const rs = trades.map((t) => {
      const d = computeTradeDiagnostics(t);
      return d.realizedR;
    }).filter((r) => r !== null && isFinite(r) && r !== undefined);
    const bins = {};
    const labels = [];
    const step = 0.5;
    let maxR = Math.max(...rs.map(Math.abs), 2);
    maxR = Math.ceil(maxR);
    for (let r = -maxR; r <= maxR; r += step) {
      const key = `${r.toFixed(1)}-${(r + step).toFixed(1)}`;
      labels.push({ min: r, max: r + step, key });
    }
    rs.forEach((r) => {
      const bin = labels.find((l) => r >= l.min && r < l.max);
      if (bin) bins[bin.key] = (bins[bin.key] || 0) + 1;
    });
    return labels.map((l) => ({ name: l.key, count: bins[l.key] || 0, negative: l.min < 0 && l.max <= 0 }));
  }, [trades]);

  return (
    <>
      <div className="stat-strip">
        <StatCard label="Skewness (puntos)" value={quantStats.skew !== null ? quantStats.skew.toFixed(2) : '\u2014'} />
        <StatCard label="Sharpe (puntos)" value={fmtRatio(quantStats.sharpe)} />
        <StatCard label="Sortino (puntos)" value={fmtRatio(quantStats.sortino)} />
        <StatCard label="Cerrados en stop" value={quantStats.withStopTotal ? `${quantStats.atStop}/${quantStats.withStopTotal}` : '\u2014'} />
        <StatCard label="Cerrados más allá del stop" value={quantStats.withStopTotal ? `${quantStats.beyond}/${quantStats.withStopTotal}` : '\u2014'} tone={quantStats.beyond > 0 ? 'down' : undefined} />
      </div>
      <div className="kpi-note">
        Un sesgo positivo (skewness) indica pérdidas pequeñas y controladas frente a ganancias infrecuentes pero grandes \u2014 la firma de una curva convexa saludable. Sortino penaliza solo la volatilidad de las rachas de pérdidas, y es la métrica clave para validar convexidad.
      </div>
      {rMultipleData.length > 0 && (
        <div className="analytics-section">
          <h4>Distribución de R Múltiple Realizado</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rMultipleData}>
              <CartesianGrid stroke="#2B3242" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#5B6478" fontSize={10} tick={{ fill: '#5B6478' }} interval={Math.max(1, Math.floor(rMultipleData.length / 15))} />
              <YAxis stroke="#5B6478" fontSize={11} tick={{ fill: '#5B6478' }} />
              <Tooltip contentStyle={{ background: '#1A2029', border: '1px solid #2B3242', borderRadius: 8 }} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {rMultipleData.map((entry, i) => <Cell key={i} fill={entry.negative ? '#E0685A' : '#4FAE7C'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="analytics-section">
        <h4>Aislamiento de Cisnes Negros (peor 5% de tus operaciones)</h4>
        {quantStats.worstTail.length === 0 ? <p className="hint">Aún no hay suficientes operaciones.</p> : (
          <>
            <p className="hint" style={{ marginBottom: 8 }}>Estas operaciones concentran el {fmtPct(quantStats.tailShare)} de tus pérdidas totales.</p>
            <table className="metric-table"><tbody>
              {quantStats.worstTail.map(({ t, pnl }, i) => (
                <tr key={i}><td>{t.symbol} · {fmtDateShortCustom(t.date)}</td><td className="down mono">{fmtMoney(pnl)}</td></tr>
              ))}
            </tbody></table>
          </>
        )}
      </div>
    </>
  );
}

function fmtDateShortCustom(dstr) {
  if (!dstr) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, d] = dstr.split('-').map(Number);
  return `${months[m - 1]} ${d}`;
}
