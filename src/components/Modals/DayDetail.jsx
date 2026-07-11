import { Plus, X } from 'lucide-react';
import { calcPnL, computeTradeDiagnostics, shortDiagBadges } from '../../utils/calculations';
import { fmtMoney, fmtDateShort } from '../../utils/formatters';
import ConfirmDelete from './ConfirmDelete';

export default function DayDetail({ dateStr, trades, strategies, onClose, onAdd, onEdit, onDelete, onView }) {
  const dayTrades = trades.filter((t) => t.date === dateStr);
  const total = dayTrades.reduce((s, t) => s + calcPnL(t), 0);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1A2029] border border-[#2B3242] rounded-xl p-5 w-[620px] max-w-full max-h-[88vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3.5">
          <h3 className="m-0 text-[15px] flex items-center gap-2.5">
            {fmtDateShort(dateStr)} <span className={`font-mono text-[13px] ${total >= 0 ? 'text-profit' : 'text-loss'}`}>{fmtMoney(total)}</span>
          </h3>
          <button className="bg-transparent border border-[#2B3242] text-text-dim rounded-md px-2 py-1.25 cursor-pointer inline-flex items-center hover:text-text" onClick={onClose}><X size={16} /></button>
        </div>
        {dayTrades.length === 0 && <p className="text-text-faint text-xs mt-1 mb-0">No trades logged this day yet.</p>}
        <div className="flex flex-col gap-2 my-2.5">
          {dayTrades.map((t) => {
            const strat = strategies.find((s) => s.id === t.strategyId);
            const pnl = calcPnL(t);
            const d = computeTradeDiagnostics(t);
            return (
              <div key={t.id} className="grid grid-cols-[1fr_auto_auto] items-start gap-3 bg-[#212836] border border-[#2B3242] rounded-lg p-2.5 text-[13px]">
                <div>
                  <strong>{t.symbol}</strong>
                  <span className="text-text-dim"> {t.direction === 'short' ? 'Short' : 'Long'}</span>
                  {strat && <span className="text-[10px] px-[7px] py-0.5 rounded-full ml-1.5 border" style={{ background: `color-mix(in srgb, ${strat.color} 18%, transparent)`, color: strat.color, borderColor: `color-mix(in srgb, ${strat.color} 40%, transparent)` }}>{strat.name}</span>}
                  <div className="mt-1">{shortDiagBadges(d).map((b, i) => (
                    <span key={i} className={`inline-flex items-center text-[10px] px-[7px] py-0.5 rounded-full mr-1 mb-0.5 border ${b.tone === 'good' ? 'text-profit bg-profit-dim border-profit/40' : b.tone === 'bad' ? 'text-loss bg-loss-dim border-loss/40' : 'text-text-dim bg-[#212836] border-[#2B3242]'}`}>{b.text}</span>
                  ))}</div>
                </div>
                <div className={pnl >= 0 ? 'text-profit' : 'text-loss'}>{fmtMoney(pnl)}</div>
                <div className="flex gap-1.5">
                  <button className="bg-transparent border border-[#2B3242] text-text-dim rounded-md px-2 py-1.25 cursor-pointer inline-flex items-center hover:text-text" onClick={() => onView(t)}><Eye size={14} /></button>
                  <button className="bg-transparent border border-[#2B3242] text-text-dim rounded-md px-2 py-1.25 cursor-pointer inline-flex items-center hover:text-text" onClick={() => onEdit(t)}><Pencil size={14} /></button>
                  <ConfirmDelete onConfirm={() => onDelete(t.id)} />
                </div>
              </div>
            );
          })}
        </div>
        <button className="w-full justify-center mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-[7px] cursor-pointer font-sans bg-accent text-[#1A130A] border border-accent" onClick={() => onAdd(dateStr)}><Plus size={14} /> Add trade for this day</button>
      </div>
    </div>
  );
}
