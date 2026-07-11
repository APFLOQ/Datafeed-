import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Treemap } from 'recharts';
import { fmtMoney, fmtPct, fmtRatio } from '../../utils/formatters';
import StatCard from '../ui/StatCard';

export default function ResumenTab({ stats, equityCurve, byStrategy, byEmotion }) {
  return (
    <>
      <div className="stat-strip">
        <StatCard label="Total P&L" value={fmtMoney(stats.totalPnl)} tone={stats.totalPnl >= 0 ? 'up' : 'down'} />
        <StatCard label="Win rate" value={fmtPct(stats.winRate)} />
        <StatCard label="Profit factor" value={fmtRatio(stats.profitFactor)} />
        <StatCard label="Avg win" value={fmtMoney(stats.avgWin)} tone="up" />
        <StatCard label="Avg loss" value={fmtMoney(stats.avgLoss)} tone="down" />
        <StatCard label="Trades" value={stats.count} />
      </div>
      <div className="analytics-section">
        <h4>Equity curve</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={equityCurve}>
            <CartesianGrid stroke="#2B3242" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#5B6478" fontSize={11} tick={{ fill: '#5B6478' }} />
            <YAxis stroke="#5B6478" fontSize={11} tick={{ fill: '#5B6478' }} />
            <Tooltip contentStyle={{ background: '#1A2029', border: '1px solid #2B3242', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="equity" stroke="#D8A657" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {byStrategy.some((s) => s.count > 0) && (
        <div className="analytics-section">
          <h4>P&amp;L by strategy</h4>
          {byStrategy.filter((s) => s.count > 0).length > 3 ? (
            <ResponsiveContainer width="100%" height={250}>
              <Treemap
                data={byStrategy.filter((s) => s.count > 0)}
                dataKey="pnl"
                nameKey="name"
                stroke="#2B3242"
                fill="#D8A657"
                content={({ depth, x, y, width, height, index, payload, colors, name }) => {
                  if (!payload) return null;
                  const pnl = payload.pnl || 0;
                  return (
                    <g>
                      <rect x={x} y={y} width={width} height={height}
                        fill={pnl >= 0 ? `rgba(79,174,124,${0.3 + 0.5 * Math.min(1, pnl / 5000)})` : `rgba(224,104,90,${0.3 + 0.5 * Math.min(1, Math.abs(pnl) / 5000)})`}
                        stroke="#2B3242" rx={4}
                      />
                      {width > 50 && height > 30 && (
                        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#E7E9EE" fontSize={11} fontFamily="IBM Plex Sans">
                          {payload.name}
                        </text>
                      )}
                    </g>
                  );
                }}
              />
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byStrategy.filter((s) => s.count > 0)}>
                <CartesianGrid stroke="#2B3242" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#5B6478" fontSize={11} tick={{ fill: '#5B6478' }} />
                <YAxis stroke="#5B6478" fontSize={11} tick={{ fill: '#5B6478' }} />
                <Tooltip contentStyle={{ background: '#1A2029', border: '1px solid #2B3242', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {byStrategy.filter((s) => s.count > 0).map((s, i) => <Cell key={i} fill={s.pnl >= 0 ? '#4FAE7C' : '#E0685A'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <table className="strat-table"><tbody>
            {byStrategy.filter((s) => s.count > 0).map((s, i) => (
              <tr key={i}><td><span className="swatch" style={{ background: s.color, display: 'inline-block' }} /> {s.name}</td><td className="muted">{s.count} trades</td><td className="muted">{fmtPct(s.winRate)} win rate</td><td className={`mono ${s.pnl >= 0 ? 'up' : 'down'}`}>{fmtMoney(s.pnl)}</td></tr>
            ))}
          </tbody></table>
        </div>
      )}
      {byEmotion.length > 0 && (
        <div className="analytics-section">
          <h4>P&amp;L by emotional state</h4>
          <table className="strat-table"><tbody>
            {[...byEmotion].sort((a, b) => a.pnl - b.pnl).map((e, i) => (
              <tr key={i}><td>{e.name}</td><td className="muted">{e.count} trades</td><td className={`mono ${e.pnl >= 0 ? 'up' : 'down'}`}>{fmtMoney(e.pnl)}</td></tr>
            ))}
          </tbody></table>
        </div>
      )}
    </>
  );
}
