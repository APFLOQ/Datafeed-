import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { fmtPct, fmtRatio } from '../../utils/formatters';
import { fmtDateShort } from '../../utils/formatters';
import StatCard from '../ui/StatCard';

export default function ConductaTab({ behaviorStats }) {
  const effData = [
    { name: 'Miedo / Titubeo', value: behaviorStats.effGroups.fear, color: '#E0685A' },
    { name: 'Defensiva Correcta', value: behaviorStats.effGroups.defensive, color: '#D8A657' },
    { name: 'Gestión Estándar', value: behaviorStats.effGroups.standard, color: '#7FB2D9' },
    { name: 'Ejecución Óptima', value: behaviorStats.effGroups.optimal, color: '#4FAE7C' },
  ].filter((d) => d.value > 0);

  return (
    <>
      <div className="stat-strip">
        <StatCard label="Chasing" value={`${behaviorStats.chasingCount}/${behaviorStats.withEntryAuditTotal}`} tone="down" />
        <StatCard label="Alta convicción" value={`${behaviorStats.highConvCount}/${behaviorStats.withEntryAuditTotal}`} tone="up" />
        <StatCard label="R realizado prom." value={behaviorStats.avgRealizedR !== null ? behaviorStats.avgRealizedR.toFixed(2) + 'R' : '\u2014'} />
        <StatCard label="R planeado prom." value={behaviorStats.avgPlannedR !== null ? behaviorStats.avgPlannedR.toFixed(2) + 'R' : '\u2014'} />
      </div>
      {effData.length > 0 && (
        <div className="analytics-section">
          <h4>Eficiencia de salida (% del MFE capturado)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={effData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {effData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1A2029', border: '1px solid #2B3242', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 text-xs text-text-dim">
            {effData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="analytics-section">
        <h4>Matriz de coherencia emocional</h4>
        {behaviorStats.coherenceAlerts.length === 0 ? <p className="hint">Sin alertas \u2014 tu gestión coincide con tus confirmaciones de Order Flow.</p> : (
          behaviorStats.coherenceAlerts.map(({ t }, i) => (
            <div key={i} className="kpi-note down">{t.symbol} · {fmtDateShort(t.date)} \u2014 tuvo confirmación institucional pero eficiencia de salida baja sin invalidación de flujo.</div>
          ))
        )}
      </div>
      <div className="analytics-section">
        <h4>Auditoría del Stop Loss (Tolerancia al Dolor)</h4>
        {behaviorStats.negAsymmetry.length === 0 ? <p className="hint">Sin casos de gestión asimétrica negativa detectados.</p> : (
          <table className="metric-table"><tbody>
            {behaviorStats.negAsymmetry.map(({ t, d }, i) => (
              <tr key={i}><td>{t.symbol} · {fmtDateShort(t.date)}</td><td className="down">MFE/MAE = {fmtRatio(d.stopToleranceRatio)} \u2014 soportas drawdowns severos para capturar migajas de precio.</td></tr>
            ))}
          </tbody></table>
        )}
      </div>
    </>
  );
}
