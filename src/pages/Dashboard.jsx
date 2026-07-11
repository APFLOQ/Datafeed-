import { useState, useRef } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopBar from '../components/Dashboard/TopBar';
import EquityCurveCard from '../components/Dashboard/EquityCurveCard';
import StatsCardGrid from '../components/Dashboard/StatsCardGrid';
import GlassCard from '../components/Dashboard/GlassCard';
import CalendarView from '../components/CalendarView';
import TradeTable from '../components/TradeTable';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import PreMarketPanel from '../components/PreMarketPanel';
import PlaybookPanel from '../components/PlaybookPanel';
import { useJournal } from '../hooks/useJournal';
import { useCardEntrance } from '../hooks/useAnimations';
import { ArrowLeftRight, Calendar, BarChart3, Target, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { trades, strategies, premarkets, stats, saveTrade, deleteTrade, addStrategy, deleteStrategy, savePremarket, deletePremarket } = useJournal();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dateRange, setDateRange] = useState('all');
  const [calCursor, setCalCursor] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const dashboardRef = useRef(null);
  useCardEntrance(dashboardRef);

  return (
    <div className="min-h-screen bg-white p-4 flex gap-4">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <TopBar dateRange={dateRange} onDateRangeChange={setDateRange} />

        <div ref={dashboardRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-min">
          {activeSection === 'dashboard' && (
            <>
              <EquityCurveCard trades={trades} />
              <div className="lg:col-span-3">
                <StatsCardGrid stats={stats} />
              </div>
              <GlassCard title="Recent Trades" icon={ArrowLeftRight}>
                <TradeTable
                  trades={trades.slice(0, 10)}
                  strategies={strategies}
                  onView={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </GlassCard>
              <GlassCard title="Calendar" icon={Calendar} cols={2}>
                <CalendarView
                  trades={trades}
                  cursor={calCursor}
                  setCursor={setCalCursor}
                  onSelectDay={() => {}}
                  monthTotal={stats.totalPnL}
                />
              </GlassCard>
            </>
          )}

          {activeSection === 'trades' && (
            <div className="lg:col-span-3">
              <GlassCard title="All Trades" icon={ArrowLeftRight}>
                <TradeTable
                  trades={trades}
                  strategies={strategies}
                  onView={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </GlassCard>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="lg:col-span-3">
              <AnalyticsDashboard trades={trades} strategies={strategies} premarkets={premarkets} />
            </div>
          )}

          {activeSection === 'calendar' && (
            <GlassCard title="Trade Calendar" icon={Calendar} cols={2}>
              <CalendarView
                trades={trades}
                cursor={calCursor}
                setCursor={setCalCursor}
                onSelectDay={() => {}}
                monthTotal={stats.totalPnL}
              />
            </GlassCard>
          )}

          {activeSection === 'premarket' && (
            <GlassCard title="Pre-Market" icon={Target}>
              <PreMarketPanel premarkets={premarkets} onEdit={() => {}} onDelete={() => {}} />
            </GlassCard>
          )}

          {activeSection === 'playbook' && (
            <GlassCard title="Playbook" icon={BookOpen}>
              <PlaybookPanel strategies={strategies} onAdd={addStrategy} onDelete={deleteStrategy} />
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
