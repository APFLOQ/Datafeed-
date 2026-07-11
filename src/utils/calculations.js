import { THRESHOLDS } from './constants';

export function calcPnL(t) {
  if (t.useManualPnl && t.manualPnl !== '' && t.manualPnl !== null && t.manualPnl !== undefined) {
    return Number(t.manualPnl) || 0;
  }
  const entry = Number(t.entryPrice) || 0;
  const exit = Number(t.exitPrice) || 0;
  const size = Number(t.size) || 0;
  const fees = Number(t.fees) || 0;
  const dir = t.direction === 'short' ? -1 : 1;
  return (exit - entry) * size * dir - fees;
}

export function getMonthCells(year, month) {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 640;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.55));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
export function stdev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
}
export function skewness(arr) {
  if (arr.length < 3) return null;
  const m = mean(arr);
  const s = stdev(arr);
  if (!s) return 0;
  const n = arr.length;
  return (n / ((n - 1) * (n - 2))) * arr.reduce((acc, x) => acc + ((x - m) / s) ** 3, 0);
}
export function sharpePoints(arr) {
  if (arr.length < 2) return null;
  const s = stdev(arr);
  return s ? mean(arr) / s : null;
}
export function sortinoPoints(arr) {
  if (arr.length < 2) return null;
  const m = mean(arr);
  const downside = arr.filter((x) => x < 0);
  const dd = downside.length ? Math.sqrt(mean(downside.map((x) => x ** 2))) : 0;
  return dd ? m / dd : null;
}
export function pfOf(pnls) {
  const w = pnls.filter((p) => p > 0).reduce((s, p) => s + p, 0);
  const l = Math.abs(pnls.filter((p) => p < 0).reduce((s, p) => s + p, 0));
  return l ? w / l : (w > 0 ? Infinity : 0);
}
export function winRateOf(pnls) {
  return pnls.length ? (pnls.filter((p) => p > 0).length / pnls.length) * 100 : 0;
}

export function computeTradeDiagnostics(t) {
  const dir = t.direction === 'short' ? -1 : 1;
  const entry = Number(t.entryPrice) || 0;
  const exit = Number(t.exitPrice) || 0;
  const pointsCaptured = (exit - entry) * dir;

  const hasPlanned = numOk(t.plannedEntryPrice);
  const hasStop = numOk(t.stopLossPrice);
  const risk = hasPlanned && hasStop ? Math.abs(Number(t.plannedEntryPrice) - Number(t.stopLossPrice)) : null;

  const hasTarget = numOk(t.plannedTargetPrice);
  const plannedR = risk && hasTarget ? Math.abs(Number(t.plannedTargetPrice) - Number(t.plannedEntryPrice)) / risk : null;
  const realizedR = risk ? pointsCaptured / risk : null;

  let entryAudit = null, entrySlippage = null;
  if (hasPlanned) {
    entrySlippage = Math.abs(entry - Number(t.plannedEntryPrice));
    const tolerance = risk ? risk * THRESHOLDS.chasingRiskFraction : Math.abs(Number(t.plannedEntryPrice)) * THRESHOLDS.chasingFallbackPct;
    entryAudit = entrySlippage <= tolerance
      ? 'Ejecución de Alta Convicción'
      : 'Ejecución Tardía — Persiguiendo el Precio (Chasing)';
  }

  const hasMfe = numOk(t.mfePrice);
  const hasMae = numOk(t.maePrice);
  const mfePoints = hasMfe ? (Number(t.mfePrice) - entry) * dir : null;
  const maePoints = hasMae ? (entry - Number(t.maePrice)) * dir : null;

  let efficiencyPct = null, exitEfficiency = null;
  if (mfePoints !== null && mfePoints > 0) {
    efficiencyPct = (pointsCaptured / mfePoints) * 100;
    const clamped = Math.max(0, Math.min(100, efficiencyPct));
    if (clamped <= 35) {
      exitEfficiency = t.closeContext === 'invalidation' ? 'Salida Defensiva Correcta' : 'Salida por Miedo / Titubeo';
    } else if (clamped <= 70) {
      exitEfficiency = 'Gestión Técnica Estándar';
    } else {
      exitEfficiency = 'Ejecución Óptima de la Subasta';
    }
  }

  const flowConfirmations = t.orderFlow ? Object.values(t.orderFlow).filter(Boolean).length : 0;
  let coherenceAlert = null;
  if (flowConfirmations >= 2 && efficiencyPct !== null && efficiencyPct < 35 && t.closeContext !== 'invalidation') {
    coherenceAlert = 'Tuviste confirmación institucional pero tu gestión emocional saboteó el desarrollo de la subasta.';
  }

  let stopToleranceRatio = null, stopToleranceLabel = null;
  if (mfePoints !== null && maePoints) {
    stopToleranceRatio = mfePoints / maePoints;
    if (stopToleranceRatio < 1) stopToleranceLabel = 'Gestión Asimétrica Negativa';
  }

  let holdingMinutes = null, pointsPerMinute = null;
  if (t.entryTime && t.exitTime) {
    const [eh, em] = t.entryTime.split(':').map(Number);
    const [xh, xm] = t.exitTime.split(':').map(Number);
    if (!Number.isNaN(eh) && !Number.isNaN(xh)) {
      holdingMinutes = (xh * 60 + xm) - (eh * 60 + em);
      if (holdingMinutes > 0) pointsPerMinute = pointsCaptured / holdingMinutes;
    }
  }

  let beyondStop = null;
  if (hasStop) {
    const stop = Number(t.stopLossPrice);
    const epsilon = risk ? risk * THRESHOLDS.stopEpsilonRiskFraction : Math.abs(stop) * 0.001;
    if (dir === 1) beyondStop = exit < stop - epsilon ? 'beyond' : (Math.abs(exit - stop) <= epsilon ? 'at' : 'other');
    else beyondStop = exit > stop + epsilon ? 'beyond' : (Math.abs(exit - stop) <= epsilon ? 'at' : 'other');
  }

  return {
    pointsCaptured, risk, realizedR, plannedR, entryAudit, entrySlippage,
    mfePoints, maePoints, efficiencyPct, exitEfficiency, coherenceAlert, flowConfirmations,
    stopToleranceRatio, stopToleranceLabel, holdingMinutes, pointsPerMinute, beyondStop,
  };
}

export function getDiagnosticTags(d) {
  const tags = [];
  if (d.entryAudit && d.entryAudit.includes('Chasing')) tags.push('Chasing');
  if (d.exitEfficiency === 'Salida por Miedo / Titubeo') tags.push('Salida por Miedo');
  if (d.stopToleranceLabel) tags.push('Gestión Asimétrica Negativa');
  if (d.flowConfirmations === 0) tags.push('Trade Impulsivo');
  if (d.coherenceAlert) tags.push('Coherencia Rota');
  return tags;
}

export function shortDiagBadges(d) {
  const badges = [];
  if (d.entryAudit) {
    badges.push(d.entryAudit.includes('Chasing') ? { text: 'Chasing', tone: 'bad' } : { text: 'Alta convicción', tone: 'good' });
  }
  if (d.exitEfficiency) {
    const map = {
      'Salida por Miedo / Titubeo': ['Miedo', 'bad'],
      'Salida Defensiva Correcta': ['Defensiva', 'good'],
      'Gestión Técnica Estándar': ['Estándar', 'neutral'],
      'Ejecución Óptima de la Subasta': ['Óptima', 'good'],
    };
    const [text, tone] = map[d.exitEfficiency] || [d.exitEfficiency, 'neutral'];
    badges.push({ text, tone });
  }
  if (d.coherenceAlert) badges.push({ text: 'Coherencia rota', tone: 'bad' });
  if (d.stopToleranceLabel) badges.push({ text: 'Asimetría -', tone: 'bad' });
  return badges;
}

export function sessionBucket(entryTime) {
  if (!entryTime) return 'Sin hora registrada';
  const [h, m] = entryTime.split(':').map(Number);
  if (Number.isNaN(h)) return 'Sin hora registrada';
  const mins = h * 60 + m;
  if (mins >= 9 * 60 + 30 && mins < 11 * 60) return 'Apertura NY (9:30–11:00)';
  if (mins >= 11 * 60 && mins < 14 * 60) return 'Mediodía (11:00–14:00)';
  if (mins >= 14 * 60 && mins < 16 * 60) return 'Cierre (14:00–16:00)';
  return 'Fuera de horario / Overnight';
}
export function vixBucket(vix) {
  if (!numOk(vix)) return null;
  const v = Number(vix);
  if (v < THRESHOLDS.lowVix) return 'Baja (Compresión)';
  if (v <= THRESHOLDS.highVix) return 'Normal';
  return 'Alta (Expansión)';
}

function numOk(v) {
  return v !== '' && v !== undefined && v !== null && !Number.isNaN(Number(v));
}
