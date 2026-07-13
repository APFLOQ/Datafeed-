import { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, BarChart, Bar, Cell } from 'recharts';
import { fmtPct, fmtRatio } from '../../utils/formatters';
import { THRESHOLDS } from '../../utils/constants';

export default function VolatilidadTab({ volatilityStats, trades }) {
  const scatterData = useMemo(() => {
    return trades
      .filter((t) => t.vix !== '' && t.vix !== undefined && t.vix !== null)
      .map((t) => {
        const entry = Number(t.entryPrice) || 0;
        const exit = Number(t.exitPrice) || 0;
        const dir = t.direction === 'short' ? -1 : 1;
        const points = (exit - entry) * dir;
        return { vix: Number(t.vix), rMultiple: points / (Math.abs(entry) || 1), trade: t.symbol };
      });
  }, [trades]);

  const hasData = volatilityStats.some((v) => v.count > 0);

  return (
    <div className="analytics-section">
      <h4>Profit Factor y Win Rate por régimen de VIX/ATR</h4>
      {!hasData ? <p className="hint">Registra el VIX/ATR en tus trades o fichas de Pre-Market para ver este desglose.</p> : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volatilityStats.filter((v) => v.count > 0)}>
              <CartesianGrid stroke="#3d3a39" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#8a8380" fontSize={11} tick={{ fill: '#8a8380' }} />
              <YAxis yAxisId="left" stroke="#8a8380" fontSize={11} tick={{ fill: '#8a8380' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#8a8380" fontSize={11} tick={{ fill: '#8a8380' }} />
              <Tooltip contentStyle={{ background: '#1d1a18', border: '1px solid #3d3a39', borderRadius: 3 }} />
              <Bar yAxisId="left" dataKey="pf" name="Profit Factor" fill="#ee6018" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="winRate" name="Win Rate %" fill="#a0ca92" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <table className="metric-table mt-4"><tbody>
            {volatilityStats.map((v, i) => (
              <tr key={i}><td>{v.name}</td><td>{v.count} trades · PF {fmtRatio(v.pf)} · {fmtPct(v.winRate)} win rate</td></tr>
            ))}
          </tbody></table>
        </>
      )}
      {scatterData.length > 3 && (
        <div className="analytics-section">
          <h4>VIX vs R-Multiple (cada punto es un trade)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid stroke="#3d3a39" strokeDasharray="3 3" />
              <XAxis dataKey="vix" name="VIX" stroke="#8a8380" fontSize={11} tick={{ fill: '#8a8380' }} />
              <YAxis dataKey="rMultiple" name="R-Multiple" stroke="#8a8380" fontSize={11} tick={{ fill: '#8a8380' }} />
              <ZAxis range={[30, 30]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#1d1a18', border: '1px solid #3d3a39', borderRadius: 3 }} />
              <Scatter data={scatterData} fill="#ee6018" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
      {volatilityStats.find((v) => v.name === 'Alta (Expansión)')?.pf < 1 && volatilityStats.find((v) => v.name === 'Alta (Expansión)')?.count > 0 && (
        <div className="kpi-note down">Tu ventaja (edge) parece desaparecer cuando la volatilidad es alta (VIX &gt; {THRESHOLDS.highVix}). Considera reducir tamaño o no operar esos días.</div>
      )}
    </div>
  );
}
