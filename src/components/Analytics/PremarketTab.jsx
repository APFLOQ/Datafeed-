import { fmtPct, fmtRatio, fmtMoney } from '../../utils/formatters';
import StatCard from '../UI/StatCard';

function describeArc(cx, cy, r, startAngle, endAngle) {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export default function PremarketTab({ fidelityStats }) {
  if (!fidelityStats) {
    return (
      <div className="empty-state">
        <h4>Sin datos suficientes</h4>
        <p>Crea fichas de Pre-Market y regístralas el mismo d\u00eda/ticker que tus trades para ver tu fidelidad al plan.</p>
      </div>
    );
  }
  const pct = fidelityStats.fidelityPct;
  return (
    <>
      <div className="stat-strip">
        <StatCard label="Índice de Fidelidad al Plan" value={fmtPct(pct)} tone={pct >= 60 ? 'up' : 'down'} />
        <StatCard label="Trades cruzados con Pre-Market" value={fidelityStats.total} />
        <StatCard label="Desviación de sesgo en perdedores" value={fmtPct(fidelityStats.deviationPct)} tone={fidelityStats.deviationPct > 40 ? 'down' : undefined} />
      </div>
      <div className="flex justify-center my-4">
        <svg width="200" height="120" viewBox="0 0 200 120">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2B3242" strokeWidth="12" strokeLinecap="round" />
          <path d={describeArc(100, 100, 80, 180, 180 + (180 * Math.min(pct, 100)) / 100)}
            fill="none" stroke={pct >= 60 ? '#4FAE7C' : '#E0685A'} strokeWidth="12" strokeLinecap="round" />
          <text x="100" y="95" textAnchor="middle" fill="#E7E9EE" fontSize="24" fontFamily="IBM Plex Mono" fontWeight="600">
            {fmtPct(pct)}
          </text>
          <text x="100" y="118" textAnchor="middle" fill="#8991A3" fontSize="10">Fidelidad al Plan</text>
        </svg>
      </div>
      <div className="analytics-section">
        <h4>Eficiencia de la Zona Estructural</h4>
        <table className="metric-table"><tbody>
          <tr><td>Dentro de zona (HVL/LVN/POC)</td><td>{fidelityStats.zonePf.inZone.count} trades · PF {fmtRatio(fidelityStats.zonePf.inZone.pf)}</td></tr>
          <tr><td>Fuera de zona ("tierra de nadie")</td><td>{fidelityStats.zonePf.outZone.count} trades · PF {fmtRatio(fidelityStats.zonePf.outZone.pf)}</td></tr>
        </tbody></table>
      </div>
      <div className="kpi-note">
        El {fmtPct(fidelityStats.deviationPct)} de tus operaciones perdedoras ocurrieron en dirección contraria al sesgo que definiste en tu Pre-Market ({fidelityStats.deviatedLosersCount} de {fidelityStats.losersTotal}).
      </div>
    </>
  );
}
