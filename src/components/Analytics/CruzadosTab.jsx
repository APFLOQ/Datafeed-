import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { fmtPct, fmtRatio, fmtMoney } from '../../utils/formatters';
import { OVERNIGHT_INVENTORY } from '../../utils/constants';
import StatCard from '../ui/StatCard';

export default function CruzadosTab({ crossStats, stats }) {
  const catalystData = [
    { name: 'Con Delta', PF: crossStats.catalyst.withDelta.pf, trades: crossStats.catalyst.withDelta.count },
    { name: 'Sin Delta', PF: crossStats.catalyst.withoutDelta.pf, trades: crossStats.catalyst.withoutDelta.count },
  ];

  const radarData = [
    { metric: 'Win Rate', value: Math.round(stats.winRate), fullMark: 100 },
    { metric: 'Profit Factor', value: Math.min(100, Math.round((stats.profitFactor || 0) * 20)), fullMark: 100 },
    { metric: 'Payoff', value: Math.min(100, Math.round((stats.avgLoss ? Math.abs(stats.avgWin / stats.avgLoss) : 0) * 25)), fullMark: 100 },
  ];

  return (
    <>
      <div className="stat-strip">
        <StatCard label="Trades impulsivos" value={`${crossStats.noiseCount}/${crossStats.total}`} tone={crossStats.noisePct > 30 ? 'down' : undefined} />
        <StatCard label="% ruido" value={fmtPct(crossStats.noisePct)} />
      </div>
      {crossStats.catalyst.withDelta.count > 0 && (
        <div className="analytics-section">
          <h4>Rendimiento por Catalizador</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catalystData}>
              <CartesianGrid stroke="#3d3a39" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#8a8380" fontSize={11} tick={{ fill: '#8a8380' }} />
              <YAxis stroke="#8a8380" fontSize={11} tick={{ fill: '#8a8380' }} />
              <Tooltip contentStyle={{ background: '#1d1a18', border: '1px solid #3d3a39', borderRadius: 3 }} />
              <Bar dataKey="PF" radius={[4, 4, 0, 0]} fill="#ee6018" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {stats.count > 5 && (
        <div className="analytics-section">
          <h4>Radar de Métricas</h4>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#3d3a39" />
              <PolarAngleAxis dataKey="metric" stroke="#8991A3" fontSize={11} tick={{ fill: '#8991A3' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#8a8380" fontSize={10} tick={{ fill: '#8a8380' }} />
              <Radar name="Score" dataKey="value" stroke="#ee6018" fill="#ee6018" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={{ background: '#1d1a18', border: '1px solid #3d3a39', borderRadius: 3 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="analytics-section">
        <h4>Eficiencia por Contrato (Mini vs. Micro)</h4>
        <table className="metric-table"><tbody>
          <tr><td>Mini</td><td>{crossStats.contractEfficiency.mini.count} trades · {fmtPct(crossStats.contractEfficiency.mini.winRate)} win rate · slippage prom. {crossStats.contractEfficiency.mini.avgSlip !== null ? crossStats.contractEfficiency.mini.avgSlip.toFixed(2) : '\u2014'}</td></tr>
          <tr><td>Micro</td><td>{crossStats.contractEfficiency.micro.count} trades · {fmtPct(crossStats.contractEfficiency.micro.winRate)} win rate · slippage prom. {crossStats.contractEfficiency.micro.avgSlip !== null ? crossStats.contractEfficiency.micro.avgSlip.toFixed(2) : '\u2014'}</td></tr>
        </tbody></table>
      </div>
      <div className="analytics-section">
        <h4>Rendimiento según Inventario Overnight</h4>
        {crossStats.overnightPerf.length === 0 ? <p className="hint">Aún no hay suficientes trades de agresión etiquetados.</p> : (
          <table className="metric-table"><tbody>
            {crossStats.overnightPerf.map((o, i) => (
              <tr key={i}><td>{OVERNIGHT_INVENTORY.find((x) => x.value === o.inv)?.label || o.inv}</td><td>{o.count} trades · {fmtPct(o.winRate)} win rate · PF {fmtRatio(o.pf)}</td></tr>
            ))}
          </tbody></table>
        )}
      </div>
      <div className="analytics-section">
        <h4>Agrupación por Tipos de Día (Market Profile)</h4>
        <p className="hint" style={{ marginBottom: 8 }}>Trades en Trend Day: {crossStats.trendDayCount}. De ellos, {crossStats.reversalOnTrendCount} usaron tácticas de reversión (Absorción Pasiva) \u2014 P&amp;L combinado: <span className={crossStats.reversalOnTrendPnl >= 0 ? 'up' : 'down'}>{fmtMoney(crossStats.reversalOnTrendPnl)}</span>.</p>
        {crossStats.reversalOnTrendCount > 0 && crossStats.reversalOnTrendPnl < 0 && (
          <div className="kpi-note down">Estás buscando absorciones pasivas (táctica de reversión) en días de tendencia fuerte \u2014 una causa común de pérdidas catastróficas.</div>
        )}
      </div>
      <div className="analytics-section">
        <h4>Rendimiento por Duración</h4>
        <table className="metric-table"><tbody>
          <tr><td>Duración promedio \u2014 ganadores</td><td>{crossStats.avgHoldWin !== null ? `${crossStats.avgHoldWin.toFixed(0)} min` : '\u2014'}</td></tr>
          <tr><td>Duración promedio \u2014 perdedores</td><td>{crossStats.avgHoldLoss !== null ? `${crossStats.avgHoldLoss.toFixed(0)} min` : '\u2014'}</td></tr>
          <tr><td>Puntos por minuto \u2014 ganadores</td><td>{crossStats.avgPtsPerMinWin !== null ? crossStats.avgPtsPerMinWin.toFixed(3) : '\u2014'}</td></tr>
        </tbody></table>
      </div>
      <div className="analytics-section">
        <h4>Métricas Universales de Control</h4>
        <table className="metric-table"><tbody>
          <tr><td>Profit Factor</td><td>{fmtRatio(stats.profitFactor)}</td></tr>
          <tr><td>Win Rate</td><td>{fmtPct(stats.winRate)}</td></tr>
          <tr><td>Payoff Ratio</td><td>{stats.avgLoss ? fmtRatio(Math.abs(stats.avgWin / stats.avgLoss)) : '\u2014'}</td></tr>
          <tr><td>Esperanza matemática</td><td>{fmtMoney((stats.winRate / 100) * stats.avgWin + (1 - stats.winRate / 100) * stats.avgLoss)}</td></tr>
        </tbody></table>
      </div>
    </>
  );
}
