import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';

export default function EquityCurveCard({ trades }) {
  const curveData = useMemo(() => {
    let cum = 0;
    const sorted = [...trades]
      .filter((t) => t.date)
      .sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((t) => {
      const entry = Number(t.entryPrice) || 0;
      const exit = Number(t.exitPrice) || 0;
      const qty = Number(t.quantity) || 0;
      const dir = t.direction === 'short' ? -1 : 1;
      const pnl = (exit - entry) * qty * dir;
      cum += pnl;
      return { date: t.date.slice(5), pnl: cum };
    });
  }, [trades]);

  return (
    <GlassCard title="Equity Curve" icon={TrendingUp} cols={2}>
      {curveData.length === 0 ? (
        <p className="text-text-dim text-sm">No trades yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={curveData}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0084FF" stopOpacity={0.15} />
                <stop offset="1" stopColor="#0084FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#8991A3" fontSize={11} tick={{ fill: '#8991A3' }} />
            <YAxis stroke="#8991A3" fontSize={11} tick={{ fill: '#8991A3' }} />
            <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12 }} />
            <Area type="monotone" dataKey="pnl" stroke="#0084FF" strokeWidth={2} fill="url(#equityGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}
