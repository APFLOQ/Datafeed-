import { useState, useRef, useEffect } from 'react';
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
import { $ as anime } from 'animejs';

function SectionWrapper({ children, sectionId, activeSection }) {
  const ref = useRef(null);
  const prevActive = useRef(activeSection);

  useEffect(() => {
    if (sectionId === activeSection && prevActive.current !== activeSection) {
      prevActive.current = activeSection;
      const el = ref.current;
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.96) translateY(8px)';
        anime({
          targets: el,
          opacity: [0, 1],
          scale: [0.96, 1],
          translateY: [8, 0],
          duration: 400,
          easing: 'easeOutCubic',
        });
      }
    }
  }, [activeSection, sectionId]);

  if (sectionId !== activeSection) return null;

  return (
    <div ref={ref} className="lg:col-span-3 section-enter">
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { trades, strategies, premarkets, stats, saveTrade, deleteTrade, addStrategy, deleteStrategy, savePremarket, deletePremarket } = useJournal();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dateRange, setDateRange] = useState('all');
  const [calCursor, setCalCursor] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const dashboardRef = useRef(null);
  useCardEntrance(dashboardRef);

  return (
    <div className="min-h-screen mac-bg p-4 flex gap-4" style={{ minHeight: '100vh' }}>
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex-1 flex flex-col gap-3 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
        <TopBar dateRange={dateRange} onDateRangeChange={setDateRange} />

        <div ref={dashboardRef} className="grid grid-cols-1 lg:grid-cols-3 gap-3 auto-rows-min">
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

          <SectionWrapper sectionId="trades" activeSection={activeSection}>
            <GlassCard title="All Trades" icon={ArrowLeftRight}>
              <TradeTable
                trades={trades}
                strategies={strategies}
                onView={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </GlassCard>
          </SectionWrapper>

          <SectionWrapper sectionId="analytics" activeSection={activeSection}>
            <AnalyticsDashboard trades={trades} strategies={strategies} premarkets={premarkets} />
          </SectionWrapper>

          <SectionWrapper sectionId="calendar" activeSection={activeSection}>
            <GlassCard title="Trade Calendar" icon={Calendar} cols={2}>
              <CalendarView
                trades={trades}
                cursor={calCursor}
                setCursor={setCalCursor}
                onSelectDay={() => {}}
                monthTotal={stats.totalPnL}
              />
            </GlassCard>
          </SectionWrapper>

          <SectionWrapper sectionId="premarket" activeSection={activeSection}>
            <GlassCard title="Pre-Market" icon={Target}>
              <PreMarketPanel premarkets={premarkets} onEdit={() => {}} onDelete={() => {}} />
            </GlassCard>
          </SectionWrapper>

          <SectionWrapper sectionId="playbook" activeSection={activeSection}>
            <GlassCard title="Playbook" icon={BookOpen}>
              <PlaybookPanel strategies={strategies} onAdd={addStrategy} onDelete={deleteStrategy} />
            </GlassCard>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
