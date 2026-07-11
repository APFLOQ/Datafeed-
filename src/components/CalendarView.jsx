import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthCells, calcPnL } from '../utils/calculations';
import { dateKey, fmtMoney } from '../utils/formatters';
import { MONTH_NAMES, WEEKDAYS } from '../utils/constants';
import StatCard from './ui/StatCard';

export default function CalendarView({ trades, cursor, setCursor, onSelectDay, monthTotal }) {
  const monthKey = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`;
  const monthTrades = useMemo(() => trades.filter((t) => t.date.startsWith(monthKey)), [trades, monthKey]);
  const dailyPnl = useMemo(() => {
    const map = {};
    monthTrades.forEach((t) => { map[t.date] = (map[t.date] || 0) + calcPnL(t); });
    return map;
  }, [monthTrades]);
  const maxAbsDaily = Math.max(1, ...Object.values(dailyPnl).map(Math.abs));
  const cells = getMonthCells(cursor.year, cursor.month);

  return (
    <>
      <div className="stat-strip">
        <StatCard label="This month" value={fmtMoney(monthTotal)} tone={monthTotal >= 0 ? 'up' : 'down'} />
        <StatCard label="Trades logged" value={monthTrades.length} />
        <StatCard label="All-time P&L" value={fmtMoney(monthTotal)} tone={monthTotal >= 0 ? 'up' : 'down'} />
      </div>
      <div className="cal-head">
        <button className="icon-btn" onClick={() => setCursor((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })}>
          <ChevronLeft size={16} />
        </button>
        <h3>{MONTH_NAMES[cursor.month]} {cursor.year}</h3>
        <button className="icon-btn" onClick={() => setCursor((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="cal-grid">
        {WEEKDAYS.map((w, i) => <div key={i} className="cal-weekday">{w}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="cal-cell empty" />;
          const ds = dateKey(cursor.year, cursor.month, day);
          const pnl = dailyPnl[ds];
          const count = monthTrades.filter((t) => t.date === ds).length;
          const alpha = pnl ? 0.16 + 0.6 * (Math.abs(pnl) / maxAbsDaily) : 0;
          const bg = pnl ? (pnl >= 0 ? `rgba(79,174,124,${alpha})` : `rgba(224,104,90,${alpha})`) : 'transparent';
          return (
            <button key={i} className="cal-cell" style={{ background: bg }} onClick={() => onSelectDay(ds)}>
              <span className="daynum">{day}</span>
              {pnl !== undefined && <span className={`cellpnl ${pnl >= 0 ? 'up' : 'down'}`}>{fmtMoney(pnl)}</span>}
              {count > 0 && <span className="cellcount">{count} trade{count > 1 ? 's' : ''}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}
