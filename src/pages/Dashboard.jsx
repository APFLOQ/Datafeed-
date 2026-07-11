import { useState, useRef, useEffect, useMemo } from 'react'
import AppSidebar from '../components/AppSidebar'
import SiteHeader from '../components/SiteHeader'
import SectionCards from '../components/SectionCards'
import ChartAreaInteractive from '../components/ChartAreaInteractive'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import CalendarView from '../components/CalendarView'
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard'
import PreMarketPanel from '../components/PreMarketPanel'
import PlaybookPanel from '../components/PlaybookPanel'
import { useJournal } from '../hooks/useJournal'
import { useCardEntrance } from '../hooks/useAnimations'
import { ArrowLeftRight, Calendar, Target, BookOpen } from 'lucide-react'
import { $ as anime } from 'animejs'

const sectionTitles = {
  dashboard: 'Dashboard',
  trades: 'Trades',
  analytics: 'Analytics',
  calendar: 'Calendar',
  premarket: 'Pre-Market',
  playbook: 'Playbook',
}

function SectionWrapper({ children, sectionId, activeSection }) {
  const ref = useRef(null)
  const prevActive = useRef(activeSection)

  useEffect(() => {
    if (sectionId === activeSection && prevActive.current !== activeSection) {
      prevActive.current = activeSection
      const el = ref.current
      if (el) {
        el.style.opacity = '0'
        anime({
          targets: el,
          opacity: [0, 1],
          scale: [0.96, 1],
          translateY: [8, 0],
          duration: 400,
          easing: 'easeOutCubic',
        })
      }
    }
  }, [activeSection, sectionId])

  if (sectionId !== activeSection) return null
  return <div ref={ref} className="section-enter min-w-0">{children}</div>
}

export default function Dashboard() {
  const { trades, strategies, premarkets, stats, addStrategy, deleteStrategy } = useJournal()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [dateRange, setDateRange] = useState('all')
  const [calCursor, setCalCursor] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() })
  const dashboardRef = useRef(null)
  useCardEntrance(dashboardRef)

  const sectionTitle = sectionTitles[activeSection] || 'Dashboard'

  return (
    <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)' }}>
      <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <SiteHeader dateRange={dateRange} onDateRangeChange={setDateRange} sectionTitle={sectionTitle} />
        <div className="flex flex-1 flex-col min-w-0 max-w-full">
          <div className="@container/main flex flex-1 flex-col gap-2 min-w-0 max-w-full">
            <div ref={dashboardRef} className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 min-w-0">
              {activeSection === 'dashboard' && (
                <>
                  <SectionCards stats={stats} />
                  <div className="px-4 lg:px-6 min-w-0">
                    <ChartAreaInteractive trades={trades} />
                  </div>
                  <div className="grid gap-4 px-4 lg:px-6 lg:grid-cols-2 min-w-0">
                    <Card className="min-w-0 ring-0 border border-[#3d3a39] shadow-none">
                      <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <ArrowLeftRight size={14} className="text-signal-orange shrink-0" />
                        <CardTitle className="font-['Geist_Mono',monospace] text-[12px] uppercase tracking-[-0.24px] leading-none text-[#8a8380] truncate">
                          Recent Trades
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="min-w-0 overflow-x-auto">
                        <DisplayTable trades={trades.slice(0, 10)} strategies={strategies} />
                      </CardContent>
                    </Card>
                    <Card className="min-w-0 ring-0 border border-[#3d3a39] shadow-none">
                      <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Calendar size={14} className="text-signal-orange shrink-0" />
                        <CardTitle className="font-['Geist_Mono',monospace] text-[12px] uppercase tracking-[-0.24px] leading-none text-[#8a8380] truncate">
                          Calendar
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="min-w-0 overflow-x-auto">
                        <CalendarView
                          trades={trades}
                          cursor={calCursor}
                          setCursor={setCalCursor}
                          onSelectDay={() => {}}
                          monthTotal={stats.totalPnL}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              <SectionWrapper sectionId="trades" activeSection={activeSection}>
                <div className="px-4 lg:px-6 min-w-0">
                  <Card className="min-w-0 ring-0 border border-[#3d3a39] shadow-none">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <ArrowLeftRight size={14} className="text-signal-orange shrink-0" />
                      <CardTitle className="font-['Geist_Mono',monospace] text-[12px] uppercase tracking-[-0.24px] leading-none text-[#8a8380] truncate">
                        All Trades
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="min-w-0 overflow-x-auto">
                      <DisplayTable trades={trades} strategies={strategies} />
                    </CardContent>
                  </Card>
                </div>
              </SectionWrapper>

              <SectionWrapper sectionId="analytics" activeSection={activeSection}>
                <div className="px-4 lg:px-6 min-w-0">
                  <AnalyticsDashboard trades={trades} strategies={strategies} premarkets={premarkets} />
                </div>
              </SectionWrapper>

              <SectionWrapper sectionId="calendar" activeSection={activeSection}>
                <div className="px-4 lg:px-6 min-w-0">
                  <Card className="min-w-0 ring-0 border border-[#3d3a39] shadow-none">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <Calendar size={14} className="text-signal-orange shrink-0" />
                      <CardTitle className="font-['Geist_Mono',monospace] text-[12px] uppercase tracking-[-0.24px] leading-none text-[#8a8380] truncate">
                        Trade Calendar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="min-w-0 overflow-x-auto">
                      <CalendarView
                        trades={trades}
                        cursor={calCursor}
                        setCursor={setCalCursor}
                        onSelectDay={() => {}}
                        monthTotal={stats.totalPnL}
                      />
                    </CardContent>
                  </Card>
                </div>
              </SectionWrapper>

              <SectionWrapper sectionId="premarket" activeSection={activeSection}>
                <div className="px-4 lg:px-6 min-w-0">
                  <Card className="min-w-0 ring-0 border border-[#3d3a39] shadow-none">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <Target size={14} className="text-signal-orange shrink-0" />
                      <CardTitle className="font-['Geist_Mono',monospace] text-[12px] uppercase tracking-[-0.24px] leading-none text-[#8a8380] truncate">
                        Pre-Market
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="min-w-0">
                      <PreMarketPanel premarkets={premarkets} onEdit={() => {}} onDelete={() => {}} />
                    </CardContent>
                  </Card>
                </div>
              </SectionWrapper>

              <SectionWrapper sectionId="playbook" activeSection={activeSection}>
                <div className="px-4 lg:px-6 min-w-0">
                  <Card className="min-w-0 ring-0 border border-[#3d3a39] shadow-none">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <BookOpen size={14} className="text-signal-orange shrink-0" />
                      <CardTitle className="font-['Geist_Mono',monospace] text-[12px] uppercase tracking-[-0.24px] leading-none text-[#8a8380] truncate">
                        Playbook
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="min-w-0">
                      <PlaybookPanel strategies={strategies} onAdd={addStrategy} onDelete={deleteStrategy} />
                    </CardContent>
                  </Card>
                </div>
              </SectionWrapper>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DisplayTable({ trades, strategies }) {
  const stratMap = useMemo(() => {
    const m = {}
    ;(strategies || []).forEach((s) => { m[s.name] = s })
    return m
  }, [strategies])

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        No trades yet
      </div>
    )
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="whitespace-nowrap">Symbol</TableHead>
            <TableHead className="whitespace-nowrap">Direction</TableHead>
            <TableHead className="whitespace-nowrap">Entry</TableHead>
            <TableHead className="whitespace-nowrap">Exit</TableHead>
            <TableHead className="whitespace-nowrap">Qty</TableHead>
            <TableHead className="whitespace-nowrap text-right">P&L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((t, i) => {
            const entry = Number(t.entryPrice) || 0
            const exit = Number(t.exitPrice) || 0
            const qty = Number(t.quantity) || 0
            const dir = t.direction === 'short' ? -1 : 1
            const pnl = (exit - entry) * qty * dir
            return (
              <TableRow key={t.id || i}>
                <TableCell className="font-medium whitespace-nowrap">{t.date}</TableCell>
                <TableCell className="truncate max-w-[100px]">{t.symbol}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className={t.direction === 'long' ? 'text-success' : 'text-destructive'}>
                    {t.direction}
                  </span>
                </TableCell>
                <TableCell className="font-mono whitespace-nowrap">{entry.toFixed(2)}</TableCell>
                <TableCell className="font-mono whitespace-nowrap">{exit.toFixed(2)}</TableCell>
                <TableCell className="whitespace-nowrap">{qty}</TableCell>
                <TableCell className={`text-right font-mono whitespace-nowrap ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
