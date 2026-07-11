import { useState } from 'react';
import { useJournal } from './hooks/useJournal';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CalendarView from './components/CalendarView';
import TradeTable from './components/TradeTable';
import PreMarketPanel from './components/PreMarketPanel';
import PlaybookPanel from './components/PlaybookPanel';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import TradeForm, { emptyForm } from './components/Forms/TradeForm';
import PreMarketForm, { emptyPremarket } from './components/Forms/PreMarketForm';
import DayDetail from './components/Modals/DayDetail';
import TradeDetailModal from './components/Modals/TradeDetailModal';
import { todayStr } from './utils/formatters';

export default function TradingJournal() {
  const {
    trades, strategies, premarkets,
    loading, saving, saveError,
    saveTrade, deleteTrade,
    addStrategy, deleteStrategy,
    savePremarket, deletePremarket,
  } = useJournal();

  const [tab, setTab] = useState('calendar');
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [selectedDay, setSelectedDay] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm());
  const [premarketFormOpen, setPremarketFormOpen] = useState(false);
  const [premarketFormData, setPremarketFormData] = useState(emptyPremarket());
  const [detailTrade, setDetailTrade] = useState(null);

  const sortedTrades = [...trades].sort((a, b) => (a.date < b.date ? 1 : -1));

  const openAdd = (presetDate) => { setFormData({ ...emptyForm(), date: presetDate || todayStr() }); setFormOpen(true); };
  const openEdit = (t) => {
    const base = emptyForm();
    const merged = { ...base, ...t };
    merged.orderFlow = { ...base.orderFlow, ...(t.orderFlow || {}) };
    merged.shots = {
      context: { ...base.shots.context, ...(t.shots?.context || {}) },
      trigger: { ...base.shots.trigger, ...(t.shots?.trigger || {}), img: t.shots?.trigger?.img || t.image || null },
      post: { ...base.shots.post, ...(t.shots?.post || {}) },
    };
    merged.useManualPnl = !!t.useManualPnl;
    setFormData(merged);
    setFormOpen(true);
  };

  if (loading) return <div className="empty-state">Loading your journal\u2026</div>;

  return (
    <div className="app-root">
      <Sidebar tab={tab} setTab={setTab} saving={saving} saveError={saveError} />
      <div className="main">
        <Topbar
          tab={tab}
          onAddTrade={() => openAdd()}
          onAddPremarket={() => { setPremarketFormData(emptyPremarket()); setPremarketFormOpen(true); }}
        />
        <div className="content">
          {tab === 'calendar' && (
            <CalendarView trades={trades} cursor={cursor} setCursor={setCursor} onSelectDay={setSelectedDay} />
          )}
          {tab === 'premarket' && (
            <PreMarketPanel
              premarkets={premarkets}
              onEdit={(p) => { setPremarketFormData({ ...emptyPremarket(), ...p }); setPremarketFormOpen(true); }}
              onDelete={deletePremarket}
            />
          )}
          {tab === 'trades' && (
            <TradeTable
              trades={sortedTrades}
              strategies={strategies}
              onView={setDetailTrade}
              onEdit={openEdit}
              onDelete={deleteTrade}
            />
          )}
          {tab === 'analytics' && (
            <AnalyticsDashboard trades={trades} strategies={strategies} premarkets={premarkets} />
          )}
          {tab === 'playbook' && (
            <PlaybookPanel strategies={strategies} onAdd={addStrategy} onDelete={deleteStrategy} />
          )}
        </div>
      </div>

      {formOpen && (
        <TradeForm initial={formData} strategies={strategies} premarkets={premarkets} onSave={saveTrade} onClose={() => setFormOpen(false)} />
      )}
      {premarketFormOpen && (
        <PreMarketForm initial={premarketFormData} onSave={savePremarket} onClose={() => setPremarketFormOpen(false)} />
      )}
      {selectedDay && (
        <DayDetail
          dateStr={selectedDay} trades={trades} strategies={strategies}
          onAdd={openAdd} onEdit={openEdit} onDelete={deleteTrade} onView={setDetailTrade}
          onClose={() => setSelectedDay(null)}
        />
      )}
      {detailTrade && (
        <TradeDetailModal
          trade={detailTrade} strategies={strategies} premarkets={premarkets}
          onEdit={openEdit} onClose={() => setDetailTrade(null)}
        />
      )}
    </div>
  );
}
