import { useState, useMemo } from 'react';
import { ANALYTICS_SUBTABS } from '../../utils/constants';
import { calcPnL, computeTradeDiagnostics, mean, stdev, skewness, sharpePoints, sortinoPoints, pfOf, winRateOf, sessionBucket, vixBucket, getDiagnosticTags } from '../../utils/calculations';
import { fmtDateShort, numOk } from '../../utils/formatters';
import { THRESHOLDS } from '../../utils/constants';
import ResumenTab from './ResumenTab';
import ConductaTab from './ConductaTab';
import CuantitativoTab from './CuantitativoTab';
import RachasTab from './RachasTab';
import CruzadosTab from './CruzadosTab';
import VolatilidadTab from './VolatilidadTab';
import PremarketTab from './PremarketTab';
import VisualTab from './VisualTab';

export default function AnalyticsDashboard({ trades, strategies, premarkets }) {
  const [sub, setSub] = useState('resumen');
  const [visualFilterTag, setVisualFilterTag] = useState('all');

  const stats = useMemo(() => {
    const all = trades.map((t) => calcPnL(t));
    const wins = all.filter((p) => p > 0);
    const losses = all.filter((p) => p < 0);
    const totalPnl = all.reduce((s, p) => s + p, 0);
    const winRate = all.length ? (wins.length / all.length) * 100 : 0;
    const avgWin = wins.length ? wins.reduce((s, p) => s + p, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((s, p) => s + p, 0) / losses.length : 0;
    const profitFactor = pfOf(all);
    return { totalPnl, winRate, avgWin, avgLoss, profitFactor, count: all.length };
  }, [trades]);

  const equityCurve = useMemo(() => {
    const sorted = [...trades].sort((a, b) => (a.date > b.date ? 1 : -1));
    let running = 0;
    return sorted.map((t) => { running += calcPnL(t); return { date: fmtDateShort(t.date), equity: Number(running.toFixed(2)) }; });
  }, [trades]);

  const byStrategy = useMemo(() => strategies.map((s) => {
    const ts = trades.filter((t) => t.strategyId === s.id);
    const pnl = ts.reduce((sum, t) => sum + calcPnL(t), 0);
    const wins = ts.filter((t) => calcPnL(t) > 0).length;
    return { name: s.name, color: s.color, pnl: Number(pnl.toFixed(2)), count: ts.length, winRate: ts.length ? (wins / ts.length) * 100 : 0 };
  }), [strategies, trades]);

  const byEmotion = useMemo(() => {
    const EMOTIONS = ['Disciplined', 'Confident', 'Patient', 'Hesitant', 'FOMO', 'Revenge', 'Impulsive'];
    return EMOTIONS.map((em) => {
      const ts = trades.filter((t) => t.emotion === em);
      const pnl = ts.reduce((sum, t) => sum + calcPnL(t), 0);
      return { name: em, pnl: Number(pnl.toFixed(2)), count: ts.length };
    }).filter((e) => e.count > 0);
  }, [trades]);

  const allDiag = useMemo(() => trades.map((t) => ({ t, d: computeTradeDiagnostics(t) })), [trades]);
  const pointsSeries = useMemo(() => allDiag.map((x) => x.d.pointsCaptured), [allDiag]);

  const sortedForSequence = useMemo(() => [...trades].sort((a, b) => {
    const ak = a.date + (a.entryTime || '00:00'); const bk = b.date + (b.entryTime || '00:00');
    return ak < bk ? -1 : 1;
  }), [trades]);

  const behaviorStats = useMemo(() => {
    const withEntryAudit = allDiag.filter((x) => x.d.entryAudit);
    const chasingCount = withEntryAudit.filter((x) => x.d.entryAudit.includes('Chasing')).length;
    const withEff = allDiag.filter((x) => x.d.exitEfficiency);
    const effGroups = { fear: 0, defensive: 0, standard: 0, optimal: 0 };
    withEff.forEach((x) => {
      if (x.d.exitEfficiency === 'Salida por Miedo / Titubeo') effGroups.fear++;
      else if (x.d.exitEfficiency === 'Salida Defensiva Correcta') effGroups.defensive++;
      else if (x.d.exitEfficiency === 'Gestión Técnica Estándar') effGroups.standard++;
      else effGroups.optimal++;
    });
    const coherenceAlerts = allDiag.filter((x) => x.d.coherenceAlert);
    const negAsymmetry = allDiag.filter((x) => x.d.stopToleranceLabel);
    const realizedRs = allDiag.filter((x) => x.d.realizedR !== null).map((x) => x.d.realizedR);
    const plannedRs = allDiag.filter((x) => x.d.plannedR !== null).map((x) => x.d.plannedR);
    return {
      chasingCount, highConvCount: withEntryAudit.length - chasingCount, withEntryAuditTotal: withEntryAudit.length,
      effGroups, withEffTotal: withEff.length, coherenceAlerts, negAsymmetry,
      avgRealizedR: realizedRs.length ? mean(realizedRs) : null, avgPlannedR: plannedRs.length ? mean(plannedRs) : null,
    };
  }, [allDiag]);

  const quantStats = useMemo(() => {
    const skew = skewness(pointsSeries);
    const sharpe = sharpePoints(pointsSeries);
    const sortino = sortinoPoints(pointsSeries);
    const sortedByDollar = trades.map((t) => ({ t, pnl: calcPnL(t) })).sort((a, b) => a.pnl - b.pnl);
    const tailCount = trades.length ? Math.max(1, Math.round(trades.length * 0.05)) : 0;
    const worstTail = sortedByDollar.slice(0, tailCount);
    const tailPnlSum = worstTail.reduce((s, x) => s + x.pnl, 0);
    const totalLossSum = sortedByDollar.filter((x) => x.pnl < 0).reduce((s, x) => s + x.pnl, 0);
    const tailShare = totalLossSum ? (tailPnlSum / totalLossSum) * 100 : 0;
    const withStop = allDiag.filter((x) => x.d.beyondStop);
    const atStop = withStop.filter((x) => x.d.beyondStop === 'at').length;
    const beyond = withStop.filter((x) => x.d.beyondStop === 'beyond').length;
    return { skew, sharpe, sortino, worstTail, tailShare, atStop, beyond, withStopTotal: withStop.length };
  }, [trades, pointsSeries, allDiag]);

  const revengeEvents = useMemo(() => {
    const events = [];
    for (let i = 1; i < sortedForSequence.length; i++) {
      const prev = sortedForSequence[i - 1], cur = sortedForSequence[i];
      if (calcPnL(prev) < 0) {
        const sizeUp = Number(cur.size) > Number(prev.size) && Number(prev.size) > 0;
        const contractUp = prev.contractSize === 'micro' && cur.contractSize === 'mini';
        const prevSlip = numOk(prev.plannedEntryPrice) ? Math.abs(Number(prev.entryPrice) - Number(prev.plannedEntryPrice)) : 0;
        const curSlip = numOk(cur.plannedEntryPrice) ? Math.abs(Number(cur.entryPrice) - Number(cur.plannedEntryPrice)) : 0;
        const slipUp = curSlip > 0 && curSlip > prevSlip * THRESHOLDS.revengeSlippageMultiplier;
        if (sizeUp || contractUp || slipUp) {
          events.push({ trade: cur, reasons: [sizeUp && 'aumentó tamaño', contractUp && 'subió de Micro a Mini', slipUp && 'mayor slippage de entrada'].filter(Boolean) });
        }
      }
    }
    return events;
  }, [sortedForSequence]);

  const overconfidenceEvents = useMemo(() => {
    const events = [];
    for (let i = 1; i < sortedForSequence.length; i++) {
      const prev = sortedForSequence[i - 1], cur = sortedForSequence[i];
      if (calcPnL(prev) > 0) {
        const confirmations = cur.orderFlow ? Object.values(cur.orderFlow).filter(Boolean).length : 0;
        if (confirmations <= 1) events.push({ trade: cur, confirmations });
      }
    }
    return events;
  }, [sortedForSequence]);

  const sessionStats = useMemo(() => {
    const buckets = {};
    trades.forEach((t) => { const b = sessionBucket(t.entryTime); (buckets[b] = buckets[b] || []).push(t); });
    return Object.entries(buckets).map(([name, ts]) => {
      const pnls = ts.map(calcPnL);
      return { name, count: ts.length, pf: pfOf(pnls), winRate: winRateOf(pnls) };
    }).sort((a, b) => b.count - a.count);
  }, [trades]);

  const crossStats = useMemo(() => {
    const total = trades.length;
    const noiseCount = trades.filter((t) => t.orderFlow && Object.values(t.orderFlow).every((v) => !v)).length;
    const noisePct = total ? (noiseCount / total) * 100 : 0;
    const withDelta = trades.filter((t) => t.orderFlow?.deltaConviction);
    const withoutDelta = trades.filter((t) => !t.orderFlow?.deltaConviction);
    const catalyst = { withDelta: { count: withDelta.length, pf: pfOf(withDelta.map(calcPnL)) }, withoutDelta: { count: withoutDelta.length, pf: pfOf(withoutDelta.map(calcPnL)) } };
    const contractStat = (arr) => {
      const pnls = arr.map(calcPnL);
      const slips = arr.filter((t) => numOk(t.plannedEntryPrice)).map((t) => Math.abs(Number(t.entryPrice) - Number(t.plannedEntryPrice)));
      return { count: arr.length, winRate: winRateOf(pnls), avgPnl: arr.length ? mean(pnls) : 0, avgSlip: slips.length ? mean(slips) : null };
    };
    const contractEfficiency = { mini: contractStat(trades.filter((t) => t.contractSize === 'mini')), micro: contractStat(trades.filter((t) => t.contractSize === 'micro')) };
    const trendDayTrades = trades.filter((t) => t.dayTypePrev === 'trend');
    const reversalOnTrend = trendDayTrades.filter((t) => t.orderFlow?.passiveAbsorption);
    const reversalOnTrendPnl = reversalOnTrend.reduce((s, t) => s + calcPnL(t), 0);
    const aggressionLongDelta = trades.filter((t) => t.direction === 'long' && t.orderFlow?.deltaConviction && t.overnightInventory);
    const overnightGroups = {};
    aggressionLongDelta.forEach((t) => { (overnightGroups[t.overnightInventory] = overnightGroups[t.overnightInventory] || []).push(t); });
    const overnightPerf = Object.entries(overnightGroups).map(([inv, ts]) => ({ inv, count: ts.length, winRate: winRateOf(ts.map(calcPnL)), pf: pfOf(ts.map(calcPnL)) }));
    const withHolding = allDiag.filter((x) => x.d.holdingMinutes !== null);
    const winners = withHolding.filter((x) => calcPnL(x.t) > 0);
    const losers = withHolding.filter((x) => calcPnL(x.t) < 0);
    return {
      noisePct, noiseCount, total, catalyst, contractEfficiency,
      trendDayCount: trendDayTrades.length, reversalOnTrendCount: reversalOnTrend.length, reversalOnTrendPnl,
      overnightPerf,
      avgHoldWin: winners.length ? mean(winners.map((x) => x.d.holdingMinutes)) : null,
      avgHoldLoss: losers.length ? mean(losers.map((x) => x.d.holdingMinutes)) : null,
      avgPtsPerMinWin: winners.length ? mean(winners.map((x) => x.d.pointsPerMinute).filter((v) => v !== null && !Number.isNaN(v))) : null,
    };
  }, [trades, allDiag]);

  const volatilityStats = useMemo(() => {
    const groups = { 'Baja (Compresión)': [], Normal: [], 'Alta (Expansión)': [] };
    trades.forEach((t) => { const b = vixBucket(t.vix); if (b) groups[b].push(t); });
    return Object.entries(groups).map(([name, ts]) => ({ name, count: ts.length, pf: pfOf(ts.map(calcPnL)), winRate: winRateOf(ts.map(calcPnL)) }));
  }, [trades]);

  const fidelityStats = useMemo(() => {
    const matched = trades.map((t) => ({ t, pm: premarkets.find((p) => p.date === t.date && p.ticker.toUpperCase() === t.symbol.toUpperCase()) })).filter((x) => x.pm && x.pm.bias);
    if (!matched.length) return null;
    const aligned = matched.filter(({ t, pm }) => pm.bias === 'neutral' || (pm.bias === 'long' && t.direction === 'long') || (pm.bias === 'short' && t.direction === 'short'));
    const fidelityPct = (aligned.length / matched.length) * 100;
    const nearZone = (t, pm) => {
      const levels = [pm.hvl, pm.lvn, pm.poc].filter(numOk).map(Number);
      if (!levels.length) return null;
      const entry = Number(t.entryPrice);
      const tol = Math.max(THRESHOLDS.zoneToleranceAbsolute, Math.abs(entry) * THRESHOLDS.zoneToleranceFraction);
      return levels.some((l) => Math.abs(entry - l) <= tol);
    };
    const withZoneInfo = matched.filter(({ t, pm }) => nearZone(t, pm) !== null);
    const inZone = withZoneInfo.filter(({ t, pm }) => nearZone(t, pm));
    const outZone = withZoneInfo.filter(({ t, pm }) => !nearZone(t, pm));
    const zonePf = { inZone: { count: inZone.length, pf: pfOf(inZone.map(({ t }) => calcPnL(t))) }, outZone: { count: outZone.length, pf: pfOf(outZone.map(({ t }) => calcPnL(t))) } };
    const losers = matched.filter(({ t }) => calcPnL(t) < 0);
    const deviatedLosers = losers.filter(({ t, pm }) => pm.bias !== 'neutral' && ((pm.bias === 'long' && t.direction === 'short') || (pm.bias === 'short' && t.direction === 'long')));
    const deviationPct = losers.length ? (deviatedLosers.length / losers.length) * 100 : 0;
    return { total: matched.length, aligned: aligned.length, fidelityPct, zonePf, losersTotal: losers.length, deviatedLosersCount: deviatedLosers.length, deviationPct };
  }, [trades, premarkets]);

  const visualCandidates = useMemo(() => {
    return allDiag
      .map(({ t, d }) => ({ t, tags: getDiagnosticTags(d) }))
      .filter((x) => x.t.shots?.trigger?.img)
      .filter((x) => visualFilterTag === 'all' || x.tags.includes(visualFilterTag));
  }, [allDiag, visualFilterTag]);

  if (trades.length === 0) {
    return (
      <div className="empty-state">
        <h4>Nothing to analyze yet</h4>
        <p>Log a few trades and your stats will show up here.</p>
      </div>
    );
  }

  const tabs = {
    resumen: <ResumenTab stats={stats} equityCurve={equityCurve} byStrategy={byStrategy} byEmotion={byEmotion} />,
    conducta: <ConductaTab behaviorStats={behaviorStats} />,
    cuantitativo: <CuantitativoTab quantStats={quantStats} trades={trades} />,
    rachas: <RachasTab revengeEvents={revengeEvents} overconfidenceEvents={overconfidenceEvents} sessionStats={sessionStats} trades={trades} sortedForSequence={sortedForSequence} />,
    cruzados: <CruzadosTab crossStats={crossStats} stats={stats} />,
    volatilidad: <VolatilidadTab volatilityStats={volatilityStats} trades={trades} />,
    premarket: <PremarketTab fidelityStats={fidelityStats} />,
    visual: <VisualTab candidates={visualCandidates} filterTag={visualFilterTag} setFilterTag={setVisualFilterTag} />,
  };

  return (
    <>
      <div className="subtab-row">
        {ANALYTICS_SUBTABS.map((s) => (
          <button key={s.key} className={`subtab-btn ${sub === s.key ? 'active' : ''}`} onClick={() => setSub(s.key)}>
            {s.label}
          </button>
        ))}
      </div>
      {tabs[sub]}
    </>
  );
}
