import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon, List, BarChart3, BookOpen, Plus, X, Trash2,
  Pencil, ChevronLeft, ChevronRight, Image as ImageIcon, Link2, Loader2,
  Eye, Sunrise, Camera,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

/* ================================================================== */
/* constants                                                          */
/* ================================================================== */

const EMOTIONS = ['Disciplined', 'Confident', 'Patient', 'Hesitant', 'FOMO', 'Revenge', 'Impulsive'];
const STRATEGY_COLORS = ['#D8A657', '#7FB2D9', '#B58BD9', '#4FAE7C', '#E0685A', '#7FD9C4', '#D98FB0'];
const DEFAULT_STRATEGIES = [
  { id: 'strat-1', name: 'Breakout', color: STRATEGY_COLORS[0] },
  { id: 'strat-2', name: 'Trend Follow', color: STRATEGY_COLORS[1] },
  { id: 'strat-3', name: 'Reversal', color: STRATEGY_COLORS[2] },
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ASSET_TYPES = [
  { value: 'futures', label: 'Futuros' },
  { value: 'options', label: 'Opciones' },
];
const CONTRACT_SIZES = [
  { value: 'micro', label: 'Micro (MES, MNQ)' },
  { value: 'mini', label: 'Mini (ES, NQ)' },
];
const CLOSE_CONTEXTS = [
  { value: 'target', label: 'Target Estructural' },
  { value: 'invalidation', label: 'Invalidation por Flujo' },
  { value: 'session_end', label: 'Fin de Sesión' },
];
const OVERNIGHT_INVENTORY = [
  { value: 'long', label: '100% Largo' },
  { value: 'short', label: '100% Corto' },
  { value: 'balanced', label: 'Balanceado' },
];
const DAY_TYPES = [
  { value: 'trend', label: 'Trend Day' },
  { value: 'normal', label: 'Normal Variation Day' },
  { value: 'range', label: 'Trading Range / Non-Trend Day' },
];
const ORDER_FLOW_FLAGS = [
  { key: 'deltaConviction', label: 'Convicción en Delta' },
  { key: 'passiveAbsorption', label: 'Absorción Pasiva' },
  { key: 'aggressionImbalance', label: 'Desequilibrio de Agresión' },
  { key: 'deltaDivergence', label: 'Divergencia Delta vs. Precio' },
  { key: 'volumeReaction', label: 'Reacción en Niveles de Volumen' },
];
const BIAS_OPTIONS = [
  { value: 'long', label: 'Largo' },
  { value: 'short', label: 'Corto' },
  { value: 'neutral', label: 'Neutral-Rotacional' },
];
const BIAS_LABEL = { long: 'Largo', short: 'Corto', neutral: 'Neutral-Rotacional' };
const EXPECTED_TRIGGER_LABEL = {
  absorption: 'Absorción Pasiva en Extremos',
  deltaConviction: 'Convicción en Delta tras Quiebre',
  imbalance: 'Desequilibrio de Agresión (Imbalance)',
};
const SHOT_STAGES = [
  { key: 'context', label: 'Contexto Pre-Market (TPO / Profile 90d)' },
  { key: 'trigger', label: 'Trigger Microestructura (Order Flow / Footprint)' },
  { key: 'post', label: 'Post-Trade — Excursión Completa (MAE/MFE)' },
];

const THRESHOLDS = {
  chasingRiskFraction: 0.25,
  chasingFallbackPct: 0.001,
  stopEpsilonRiskFraction: 0.05,
  revengeSlippageMultiplier: 1.5,
  zoneToleranceFraction: 0.0015,
  zoneToleranceAbsolute: 3,
  lowVix: 15,
  highVix: 22,
};

/* ================================================================== */
/* helpers                                                             */
/* ================================================================== */

const pad2 = (n) => String(n).padStart(2, '0');
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const dateKey = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const numOk = (v) => v !== '' && v !== undefined && v !== null && !Number.isNaN(Number(v));

function fmtMoney(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? '-' : '';
  return `${sign}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDateShort(dstr) {
  if (!dstr) return '';
  const [y, m, d] = dstr.split('-').map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`;
}
function fmtPts(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)} pts`;
}
function fmtPct(n, digits = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${n.toFixed(digits)}%`;
}
function fmtRatio(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  if (n === Infinity) return '∞';
  return n.toFixed(2);
}

function calcPnL(t) {
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

function getMonthCells(year, month) {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function compressImage(file) {
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

/* ---- statistics helpers ---- */
function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function stdev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
}
function skewness(arr) {
  if (arr.length < 3) return null;
  const m = mean(arr);
  const s = stdev(arr);
  if (!s) return 0;
  const n = arr.length;
  return (n / ((n - 1) * (n - 2))) * arr.reduce((acc, x) => acc + ((x - m) / s) ** 3, 0);
}
function sharpePoints(arr) {
  if (arr.length < 2) return null;
  const s = stdev(arr);
  return s ? mean(arr) / s : null;
}
function sortinoPoints(arr) {
  if (arr.length < 2) return null;
  const m = mean(arr);
  const downside = arr.filter((x) => x < 0);
  const dd = downside.length ? Math.sqrt(mean(downside.map((x) => x ** 2))) : 0;
  return dd ? m / dd : null;
}
function pfOf(pnls) {
  const w = pnls.filter((p) => p > 0).reduce((s, p) => s + p, 0);
  const l = Math.abs(pnls.filter((p) => p < 0).reduce((s, p) => s + p, 0));
  return l ? w / l : (w > 0 ? Infinity : 0);
}
function winRateOf(pnls) {
  return pnls.length ? (pnls.filter((p) => p > 0).length / pnls.length) * 100 : 0;
}

/* ---- diagnostics per trade ---- */
function computeTradeDiagnostics(t) {
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

function getDiagnosticTags(d) {
  const tags = [];
  if (d.entryAudit && d.entryAudit.includes('Chasing')) tags.push('Chasing');
  if (d.exitEfficiency === 'Salida por Miedo / Titubeo') tags.push('Salida por Miedo');
  if (d.stopToleranceLabel) tags.push('Gestión Asimétrica Negativa');
  if (d.flowConfirmations === 0) tags.push('Trade Impulsivo');
  if (d.coherenceAlert) tags.push('Coherencia Rota');
  return tags;
}

function shortDiagBadges(d) {
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

function sessionBucket(entryTime) {
  if (!entryTime) return 'Sin hora registrada';
  const [h, m] = entryTime.split(':').map(Number);
  if (Number.isNaN(h)) return 'Sin hora registrada';
  const mins = h * 60 + m;
  if (mins >= 9 * 60 + 30 && mins < 11 * 60) return 'Apertura NY (9:30–11:00)';
  if (mins >= 11 * 60 && mins < 14 * 60) return 'Mediodía (11:00–14:00)';
  if (mins >= 14 * 60 && mins < 16 * 60) return 'Cierre (14:00–16:00)';
  return 'Fuera de horario / Overnight';
}
function vixBucket(vix) {
  if (!numOk(vix)) return null;
  const v = Number(vix);
  if (v < THRESHOLDS.lowVix) return 'Baja (Compresión)';
  if (v <= THRESHOLDS.highVix) return 'Normal';
  return 'Alta (Expansión)';
}

/* ================================================================== */
/* small UI bits                                                       */
/* ================================================================== */

function StatCard({ label, value, tone }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${tone || ''}`}>{value}</div>
    </div>
  );
}

function ConfirmDelete({ onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 2500);
    return () => clearTimeout(t);
  }, [confirming]);
  if (confirming) {
    return (
      <button className="icon-btn danger" onClick={onConfirm} title="Click again to confirm">
        Confirm?
      </button>
    );
  }
  return (
    <button className="icon-btn" onClick={() => setConfirming(true)} title="Delete">
      <Trash2 size={14} />
    </button>
  );
}

function Lightbox({ img, note, label, onClose }) {
  return (
    <div className="modal-backdrop lightbox-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lightbox-card">
        <div className="lightbox-img-wrap">
          {img ? <img src={img} alt={label} /> : <div className="empty-state">Sin captura</div>}
        </div>
        <div className="lightbox-side">
          <div className="modal-head">
            <h3>{label}</h3>
            <button className="icon-btn" onClick={onClose}><X size={16} /></button>
          </div>
          <p className="hint" style={{ whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{note || 'Sin notas para esta captura.'}</p>
        </div>
      </div>
    </div>
  );
}

function ShotSlot({ label, shot, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      onChange({ ...shot, img: dataUrl });
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="shot-slot">
      <div className="shot-slot-head">
        <span>{label}</span>
        {shot.img && <button type="button" className="icon-btn" onClick={() => onChange({ ...shot, img: null })}><X size={12} /></button>}
      </div>
      {shot.img ? (
        <img src={shot.img} alt={label} className="shot-thumb" onClick={() => setLightboxOpen(true)} />
      ) : (
        <button type="button" className="btn secondary shot-upload-btn" onClick={() => fileRef.current?.click()}>
          <Camera size={13} /> {uploading ? 'Procesando…' : 'Subir captura'}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <textarea rows={2} className="shot-note" placeholder="Nota estructural…" value={shot.note || ''} onChange={(e) => onChange({ ...shot, note: e.target.value })} />
      {lightboxOpen && <Lightbox img={shot.img} note={shot.note} label={label} onClose={() => setLightboxOpen(false)} />}
    </div>
  );
}

/* ================================================================== */
/* trade form                                                          */
/* ================================================================== */

function TradeForm({ initial, strategies, premarkets, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleFlow = (key) => set('orderFlow', { ...form.orderFlow, [key]: !form.orderFlow[key] });
  const setShot = (stageKey, val) => set('shots', { ...form.shots, [stageKey]: val });

  const pnlPreview = calcPnL(form);
  const diag = useMemo(() => computeTradeDiagnostics(form), [form]);

  const matchedPremarket = useMemo(() => {
    if (!form.symbol || !form.date) return null;
    return premarkets.find((p) => p.date === form.date && p.ticker.trim().toUpperCase() === form.symbol.trim().toUpperCase());
  }, [premarkets, form.symbol, form.date]);

  const submit = () => {
    if (!form.symbol.trim() || !form.date) return;
    onSave({ ...form, symbol: form.symbol.trim().toUpperCase() });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-head">
          <h3>{initial.id ? 'Edit trade' : 'Log a trade'}</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {matchedPremarket && (
          <div className="mirror-panel">
            <div className="mirror-head"><Sunrise size={14} /> Modo Espejo — Pre-Market de hoy</div>
            <p>Sesgo declarado: <strong>{BIAS_LABEL[matchedPremarket.bias] || '—'}</strong> · Trigger esperado: {Object.entries(matchedPremarket.expectedTriggers || {}).filter(([, v]) => v).map(([k]) => EXPECTED_TRIGGER_LABEL[k]).join(', ') || '—'}</p>
            <p>Zonas: HVL {matchedPremarket.hvl || '—'} · LVN {matchedPremarket.lvn || '—'} · POC {matchedPremarket.poc || '—'}</p>
            {form.direction && matchedPremarket.bias && matchedPremarket.bias !== 'neutral' && (
              <p className={form.direction === matchedPremarket.bias ? 'up' : 'down'}>
                {form.direction === matchedPremarket.bias
                  ? 'Este trade está alineado con tu sesgo matutino.'
                  : `Atención: tu sesgo era ${BIAS_LABEL[matchedPremarket.bias]} y este trade es ${form.direction === 'long' ? 'Largo' : 'Corto'}.`}
              </p>
            )}
          </div>
        )}

        <div className="section-title">Datos básicos</div>
        <div className="form-grid">
          <label className="field"><span>Fecha</span><input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></label>
          <label className="field"><span>Símbolo</span><input placeholder="ES" value={form.symbol} onChange={(e) => set('symbol', e.target.value)} /></label>
          <label className="field"><span>Dirección</span>
            <select value={form.direction} onChange={(e) => set('direction', e.target.value)}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </label>
          <label className="field"><span>Size / qty</span><input type="number" step="any" value={form.size} onChange={(e) => set('size', e.target.value)} /></label>
          <label className="field"><span>Estrategia</span>
            <select value={form.strategyId} onChange={(e) => set('strategyId', e.target.value)}>
              <option value="">—</option>
              {strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="field"><span>Emoción / estado</span>
            <select value={form.emotion} onChange={(e) => set('emotion', e.target.value)}>
              <option value="">—</option>
              {EMOTIONS.map((em) => <option key={em} value={em}>{em}</option>)}
            </select>
          </label>
          <label className="field"><span>Fees</span><input type="number" step="any" value={form.fees} onChange={(e) => set('fees', e.target.value)} /></label>
        </div>

        <div className="section-title">Segmentación de activo</div>
        <div className="form-grid">
          <label className="field"><span>Tipo de activo</span>
            <select value={form.assetType} onChange={(e) => set('assetType', e.target.value)}>
              {ASSET_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Tamaño del contrato</span>
            <select value={form.contractSize} onChange={(e) => set('contractSize', e.target.value)}>
              {CONTRACT_SIZES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
        </div>

        <div className="section-title">Checklist de convicción en Order Flow</div>
        <div className="checklist-grid">
          {ORDER_FLOW_FLAGS.map((f) => (
            <label key={f.key} className="check-chip">
              <input type="checkbox" checked={!!form.orderFlow[f.key]} onChange={() => toggleFlow(f.key)} />
              {f.label}
            </label>
          ))}
        </div>

        <div className="section-title">Auditoría MAE / MFE</div>
        <div className="form-grid">
          <label className="field"><span>Precio Planeado del Setup</span><input type="number" step="any" value={form.plannedEntryPrice} onChange={(e) => set('plannedEntryPrice', e.target.value)} /></label>
          <label className="field"><span>Precio de Entrada Real</span><input type="number" step="any" value={form.entryPrice} onChange={(e) => set('entryPrice', e.target.value)} /></label>
          <label className="field"><span>Precio de Salida Real</span><input type="number" step="any" value={form.exitPrice} onChange={(e) => set('exitPrice', e.target.value)} /></label>
          <label className="field"><span>Stop Loss Planeado</span><input type="number" step="any" value={form.stopLossPrice} onChange={(e) => set('stopLossPrice', e.target.value)} /></label>
          <label className="field"><span>Objetivo Planeado (opcional)</span><input type="number" step="any" value={form.plannedTargetPrice} onChange={(e) => set('plannedTargetPrice', e.target.value)} /></label>
          <label className="field"><span>Precio Máximo Favorable (MFE)</span><input type="number" step="any" value={form.mfePrice} onChange={(e) => set('mfePrice', e.target.value)} /></label>
          <label className="field"><span>Precio Máximo Adverso (MAE)</span><input type="number" step="any" value={form.maePrice} onChange={(e) => set('maePrice', e.target.value)} /></label>
          <label className="field"><span>Contexto de cierre</span>
            <select value={form.closeContext} onChange={(e) => set('closeContext', e.target.value)}>
              <option value="">—</option>
              {CLOSE_CONTEXTS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Hora de entrada</span><input type="time" value={form.entryTime} onChange={(e) => set('entryTime', e.target.value)} /></label>
          <label className="field"><span>Hora de salida</span><input type="time" value={form.exitTime} onChange={(e) => set('exitTime', e.target.value)} /></label>
        </div>

        <div className="kpi-note">
          <strong>R realizado:</strong> {diag.realizedR !== null ? diag.realizedR.toFixed(2) + 'R' : '—'} {diag.plannedR !== null && <>· <strong>R planeado:</strong> {diag.plannedR.toFixed(2)}R</>}<br />
          <strong>Auditoría de entrada:</strong> {diag.entryAudit || '—'}<br />
          <strong>Auditoría de salida:</strong> {diag.exitEfficiency ? `${diag.exitEfficiency} (${fmtPct(diag.efficiencyPct)} del MFE)` : '—'}<br />
          {diag.stopToleranceLabel && <span className="down">{diag.stopToleranceLabel} — el MFE/MAE es {fmtRatio(diag.stopToleranceRatio)}</span>}
          {diag.coherenceAlert && <div className="down" style={{ marginTop: 4 }}>{diag.coherenceAlert}</div>}
        </div>

        <div className="section-title">Contexto de mercado</div>
        <div className="form-grid">
          <label className="field"><span>Inventario Overnight</span>
            <select value={form.overnightInventory} onChange={(e) => set('overnightInventory', e.target.value)}>
              <option value="">—</option>
              {OVERNIGHT_INVENTORY.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Estructura día anterior</span>
            <select value={form.dayTypePrev} onChange={(e) => set('dayTypePrev', e.target.value)}>
              <option value="">—</option>
              {DAY_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="field"><span>VIX / ATR del día</span><input type="number" step="any" value={form.vix} onChange={(e) => set('vix', e.target.value)} /></label>
        </div>

        <label className="field checkbox-row">
          <input type="checkbox" checked={form.useManualPnl} onChange={(e) => set('useManualPnl', e.target.checked)} />
          <span>Override con P&amp;L manual (opciones, spreads, etc.)</span>
        </label>
        {form.useManualPnl && (
          <label className="field">
            <span>P&amp;L manual</span>
            <input type="number" step="any" value={form.manualPnl} onChange={(e) => set('manualPnl', e.target.value)} />
          </label>
        )}
        <div className="pnl-preview">
          P&amp;L calculado:&nbsp;<span className={pnlPreview >= 0 ? 'up' : 'down'}>{fmtMoney(pnlPreview)}</span>
        </div>

        <div className="section-title">Capturas por etapas de la subasta</div>
        <div className="shot-grid">
          {SHOT_STAGES.map((s) => (
            <ShotSlot key={s.key} label={s.label} shot={form.shots[s.key]} onChange={(val) => setShot(s.key, val)} />
          ))}
        </div>

        <label className="field">
          <span>Video link (Loom, YouTube, Drive…)</span>
          <div className="upload-row">
            <Link2 size={14} />
            <input placeholder="https://" value={form.videoLink} onChange={(e) => set('videoLink', e.target.value)} />
          </div>
        </label>

        <label className="field">
          <span>Notas — tesis, qué pasó, lecciones</span>
          <textarea rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="¿Cuál era el setup? ¿Seguiste tu plan? ¿Qué harías diferente?" />
        </label>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={!form.symbol.trim() || !form.date}>
            {initial.id ? 'Save changes' : 'Add trade'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* pre-market form                                                     */
/* ================================================================== */

function PreMarketForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleTrigger = (k) => set('expectedTriggers', { ...form.expectedTriggers, [k]: !form.expectedTriggers[k] });
  const submit = () => {
    if (!form.ticker.trim() || !form.date || !form.bias) return;
    onSave({ ...form, ticker: form.ticker.trim().toUpperCase() });
  };
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-head">
          <h3>Ficha Pre-Market</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="form-grid">
          <label className="field"><span>Fecha</span><input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></label>
          <label className="field"><span>Ticker</span><input placeholder="ES" value={form.ticker} onChange={(e) => set('ticker', e.target.value)} /></label>
          <label className="field"><span>Contrato inicial</span>
            <select value={form.contractSize} onChange={(e) => set('contractSize', e.target.value)}>
              {CONTRACT_SIZES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Sesgo / Direccionalidad</span>
            <select value={form.bias} onChange={(e) => set('bias', e.target.value)}>
              <option value="">—</option>
              {BIAS_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </label>
          <label className="field"><span>HVL de 90 días</span><input type="number" step="any" value={form.hvl} onChange={(e) => set('hvl', e.target.value)} /></label>
          <label className="field"><span>LVN de confluencia</span><input type="number" step="any" value={form.lvn} onChange={(e) => set('lvn', e.target.value)} /></label>
          <label className="field"><span>POC sesión previa</span><input type="number" step="any" value={form.poc} onChange={(e) => set('poc', e.target.value)} /></label>
          <label className="field"><span>VIX / ATR del día</span><input type="number" step="any" value={form.vix} onChange={(e) => set('vix', e.target.value)} /></label>
          <label className="field"><span>Estructura día anterior</span>
            <select value={form.dayTypePrev} onChange={(e) => set('dayTypePrev', e.target.value)}>
              <option value="">—</option>
              {DAY_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Inventario Overnight</span>
            <select value={form.overnightInventory} onChange={(e) => set('overnightInventory', e.target.value)}>
              <option value="">—</option>
              {OVERNIGHT_INVENTORY.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
        <div className="field">
          <span>Trigger esperado de microestructura</span>
          <div className="checklist-grid">
            <label className="check-chip"><input type="checkbox" checked={!!form.expectedTriggers.absorption} onChange={() => toggleTrigger('absorption')} /> Absorción Pasiva en Extremos</label>
            <label className="check-chip"><input type="checkbox" checked={!!form.expectedTriggers.deltaConviction} onChange={() => toggleTrigger('deltaConviction')} /> Convicción en Delta tras Quiebre</label>
            <label className="check-chip"><input type="checkbox" checked={!!form.expectedTriggers.imbalance} onChange={() => toggleTrigger('imbalance')} /> Desequilibrio de Agresión</label>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={submit} disabled={!form.ticker.trim() || !form.date || !form.bias}>Guardar ficha</button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* day detail + trade detail modals                                    */
/* ================================================================== */

function DayDetail({ dateStr, trades, strategies, onClose, onAdd, onEdit, onDelete, onView }) {
  const dayTrades = trades.filter((t) => t.date === dateStr);
  const total = dayTrades.reduce((s, t) => s + calcPnL(t), 0);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-head">
          <h3>{fmtDateShort(dateStr)} <span className={`inline-pnl ${total >= 0 ? 'up' : 'down'}`}>{fmtMoney(total)}</span></h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        {dayTrades.length === 0 && <p className="hint">No trades logged this day yet.</p>}
        <div className="day-trade-list">
          {dayTrades.map((t) => {
            const strat = strategies.find((s) => s.id === t.strategyId);
            const pnl = calcPnL(t);
            const d = computeTradeDiagnostics(t);
            return (
              <div key={t.id} className="day-trade-row">
                <div>
                  <strong>{t.symbol}</strong>
                  <span className="muted"> {t.direction === 'short' ? 'Short' : 'Long'}</span>
                  {strat && <span className="tag" style={{ '--tag-color': strat.color }}>{strat.name}</span>}
                  <div style={{ marginTop: 4 }}>{shortDiagBadges(d).map((b, i) => <span key={i} className={`diag-chip ${b.tone}`}>{b.text}</span>)}</div>
                </div>
                <div className={pnl >= 0 ? 'up' : 'down'}>{fmtMoney(pnl)}</div>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => onView(t)}><Eye size={14} /></button>
                  <button className="icon-btn" onClick={() => onEdit(t)}><Pencil size={14} /></button>
                  <ConfirmDelete onConfirm={() => onDelete(t.id)} />
                </div>
              </div>
            );
          })}
        </div>
        <button className="btn primary full" onClick={() => onAdd(dateStr)}><Plus size={14} /> Add trade for this day</button>
      </div>
    </div>
  );
}

function TradeDetailModal({ trade, strategies, premarkets, onClose, onEdit }) {
  const d = useMemo(() => computeTradeDiagnostics(trade), [trade]);
  const pm = premarkets.find((p) => p.date === trade.date && p.ticker.toUpperCase() === trade.symbol.toUpperCase());
  const [lightbox, setLightbox] = useState(null);
  const strat = strategies.find((s) => s.id === trade.strategyId);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ width: 680 }}>
        <div className="modal-head">
          <h3>{trade.symbol} · {fmtDateShort(trade.date)} <span className={calcPnL(trade) >= 0 ? 'up' : 'down'}>{fmtMoney(calcPnL(trade))}</span></h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ marginBottom: 12 }}>
          {shortDiagBadges(d).map((b, i) => <span key={i} className={`diag-chip ${b.tone}`}>{b.text}</span>)}
          {strat && <span className="tag" style={{ '--tag-color': strat.color }}>{strat.name}</span>}
        </div>

        <table className="metric-table">
          <tbody>
            <tr><td>Dirección / Activo</td><td>{trade.direction === 'short' ? 'Short' : 'Long'} · {trade.assetType === 'options' ? 'Opciones' : 'Futuros'} · {trade.contractSize === 'mini' ? 'Mini' : 'Micro'}</td></tr>
            <tr><td>Entrada planeada → real</td><td>{trade.plannedEntryPrice || '—'} → {trade.entryPrice || '—'} {d.entrySlippage !== null && <span className="muted">(slippage {d.entrySlippage.toFixed(2)})</span>}</td></tr>
            <tr><td>Stop planeado</td><td>{trade.stopLossPrice || '—'}</td></tr>
            <tr><td>MFE / MAE (precio → puntos)</td><td>{trade.mfePrice || '—'} / {trade.maePrice || '—'} {d.mfePoints !== null && d.maePoints !== null && <span className="muted">({d.mfePoints.toFixed(2)} / {d.maePoints.toFixed(2)} pts)</span>}</td></tr>
            <tr><td>R planeado / realizado</td><td>{d.plannedR !== null ? d.plannedR.toFixed(2) + 'R' : '—'} / {d.realizedR !== null ? d.realizedR.toFixed(2) + 'R' : '—'}</td></tr>
            <tr><td>Eficiencia de salida</td><td>{d.efficiencyPct !== null ? `${fmtPct(d.efficiencyPct)} del MFE — ${d.exitEfficiency}` : '—'}</td></tr>
            <tr><td>Contexto de cierre</td><td>{CLOSE_CONTEXTS.find((c) => c.value === trade.closeContext)?.label || '—'}</td></tr>
            <tr><td>Duración / ritmo</td><td>{d.holdingMinutes !== null ? `${d.holdingMinutes} min` : '—'} {d.pointsPerMinute !== null && <span className="muted">({d.pointsPerMinute.toFixed(2)} pts/min)</span>}</td></tr>
            <tr><td>Checklist Order Flow</td><td>{ORDER_FLOW_FLAGS.filter((f) => trade.orderFlow?.[f.key]).map((f) => f.label).join(', ') || 'Vacío (impulsivo)'}</td></tr>
            <tr><td>Contexto de mercado</td><td>VIX/ATR {trade.vix || '—'} · {DAY_TYPES.find((dd) => dd.value === trade.dayTypePrev)?.label || '—'} · Overnight {OVERNIGHT_INVENTORY.find((o) => o.value === trade.overnightInventory)?.label || '—'}</td></tr>
          </tbody>
        </table>

        {d.coherenceAlert && <div className="kpi-note down">{d.coherenceAlert}</div>}

        {pm && (
          <div className="mirror-panel" style={{ marginTop: 12 }}>
            <div className="mirror-head"><Sunrise size={14} /> Comparación con tu Pre-Market</div>
            <p>Sesgo: {BIAS_LABEL[pm.bias] || '—'} · HVL {pm.hvl || '—'} · LVN {pm.lvn || '—'} · POC {pm.poc || '—'}</p>
          </div>
        )}

        <div className="section-title">Capturas por etapas</div>
        <div className="shot-grid">
          {SHOT_STAGES.map((s) => (
            <div key={s.key} className="shot-slot">
              <div className="shot-slot-head"><span>{s.label}</span></div>
              {trade.shots?.[s.key]?.img
                ? <img src={trade.shots[s.key].img} className="shot-thumb" alt={s.label} onClick={() => setLightbox(s.key)} />
                : <div className="hint">Sin captura</div>}
            </div>
          ))}
        </div>

        {trade.notes && (
          <>
            <div className="section-title">Notas</div>
            <p className="hint" style={{ whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{trade.notes}</p>
          </>
        )}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cerrar</button>
          <button className="btn primary" onClick={() => { onClose(); onEdit(trade); }}><Pencil size={14} /> Editar</button>
        </div>
      </div>

      {lightbox && trade.shots?.[lightbox] && (
        <Lightbox img={trade.shots[lightbox].img} note={trade.shots[lightbox].note} label={SHOT_STAGES.find((s) => s.key === lightbox).label} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

/* ================================================================== */
/* main app                                                             */
/* ================================================================== */

const emptyForm = () => ({
  id: null, date: todayStr(), symbol: '', direction: 'long', entryPrice: '', exitPrice: '',
  size: '', fees: '', useManualPnl: false, manualPnl: '', strategyId: '', emotion: '',
  notes: '', videoLink: '',
  assetType: 'futures', contractSize: 'micro',
  orderFlow: { deltaConviction: false, passiveAbsorption: false, aggressionImbalance: false, deltaDivergence: false, volumeReaction: false },
  plannedEntryPrice: '', stopLossPrice: '', plannedTargetPrice: '',
  mfePrice: '', maePrice: '', closeContext: '',
  entryTime: '', exitTime: '',
  overnightInventory: '', dayTypePrev: '', vix: '',
  shots: { context: { img: null, note: '' }, trigger: { img: null, note: '' }, post: { img: null, note: '' } },
});

const emptyPremarket = () => ({
  id: null, date: todayStr(), ticker: '', contractSize: 'micro',
  hvl: '', lvn: '', poc: '',
  bias: '', expectedTriggers: { absorption: false, deltaConviction: false, imbalance: false },
  vix: '', dayTypePrev: '', overnightInventory: '',
});

export default function TradingJournal() {
  const [trades, setTrades] = useState([]);
  const [strategies, setStrategies] = useState(DEFAULT_STRATEGIES);
  const [premarkets, setPremarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tab, setTab] = useState('calendar');
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [selectedDay, setSelectedDay] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm());
  const [newStratName, setNewStratName] = useState('');
  const [premarketFormOpen, setPremarketFormOpen] = useState(false);
  const [premarketFormData, setPremarketFormData] = useState(emptyPremarket());
  const [detailTrade, setDetailTrade] = useState(null);
  const [analyticsSub, setAnalyticsSub] = useState('resumen');
  const [visualFilterTag, setVisualFilterTag] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get('journal-trades');
        setTrades(res ? JSON.parse(res.value) : []);
      } catch { setTrades([]); }
      try {
        const res2 = await window.storage.get('journal-strategies');
        setStrategies(res2 ? JSON.parse(res2.value) : DEFAULT_STRATEGIES);
      } catch {
        setStrategies(DEFAULT_STRATEGIES);
        window.storage.set('journal-strategies', JSON.stringify(DEFAULT_STRATEGIES)).catch(() => {});
      }
      try {
        const res3 = await window.storage.get('journal-premarkets');
        setPremarkets(res3 ? JSON.parse(res3.value) : []);
      } catch { setPremarkets([]); }
      setLoading(false);
    })();
  }, []);

  async function persistTrades(next) {
    setTrades(next);
    setSaving(true);
    setSaveError('');
    try {
      const res = await window.storage.set('journal-trades', JSON.stringify(next));
      if (!res) throw new Error('save failed');
    } catch {
      setSaveError('Could not save — storage may be full. Try a smaller screenshot.');
    } finally {
      setSaving(false);
    }
  }
  async function persistStrategies(next) {
    setStrategies(next);
    try { await window.storage.set('journal-strategies', JSON.stringify(next)); } catch {}
  }
  async function persistPremarkets(next) {
    setPremarkets(next);
    try { await window.storage.set('journal-premarkets', JSON.stringify(next)); } catch {}
  }

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

  const saveTrade = (data) => {
    if (data.id) persistTrades(trades.map((t) => (t.id === data.id ? data : t)));
    else persistTrades([...trades, { ...data, id: uid() }]);
    setFormOpen(false);
  };
  const deleteTrade = (id) => persistTrades(trades.filter((t) => t.id !== id));

  const addStrategy = () => {
    if (!newStratName.trim()) return;
    const color = STRATEGY_COLORS[strategies.length % STRATEGY_COLORS.length];
    persistStrategies([...strategies, { id: uid(), name: newStratName.trim(), color }]);
    setNewStratName('');
  };
  const deleteStrategy = (id) => persistStrategies(strategies.filter((s) => s.id !== id));

  const openPremarketAdd = () => { setPremarketFormData(emptyPremarket()); setPremarketFormOpen(true); };
  const openPremarketEdit = (p) => { setPremarketFormData({ ...emptyPremarket(), ...p, expectedTriggers: { ...emptyPremarket().expectedTriggers, ...(p.expectedTriggers || {}) } }); setPremarketFormOpen(true); };
  const savePremarket = (data) => {
    if (data.id) persistPremarkets(premarkets.map((p) => (p.id === data.id ? data : p)));
    else persistPremarkets([...premarkets, { ...data, id: uid() }]);
    setPremarketFormOpen(false);
  };
  const deletePremarket = (id) => persistPremarkets(premarkets.filter((p) => p.id !== id));

  /* ---- calendar derived data ---- */
  const monthKey = `${cursor.year}-${pad2(cursor.month + 1)}`;
  const monthTrades = useMemo(() => trades.filter((t) => t.date.startsWith(monthKey)), [trades, monthKey]);
  const dailyPnl = useMemo(() => {
    const map = {};
    monthTrades.forEach((t) => { map[t.date] = (map[t.date] || 0) + calcPnL(t); });
    return map;
  }, [monthTrades]);
  const maxAbsDaily = Math.max(1, ...Object.values(dailyPnl).map(Math.abs));
  const monthTotal = Object.values(dailyPnl).reduce((s, v) => s + v, 0);
  const sortedTrades = useMemo(() => [...trades].sort((a, b) => (a.date < b.date ? 1 : -1)), [trades]);

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

  const byEmotion = useMemo(() => EMOTIONS.map((em) => {
    const ts = trades.filter((t) => t.emotion === em);
    const pnl = ts.reduce((sum, t) => sum + calcPnL(t), 0);
    return { name: em, pnl: Number(pnl.toFixed(2)), count: ts.length };
  }).filter((e) => e.count > 0), [trades]);

  const cells = getMonthCells(cursor.year, cursor.month);

  /* ---- advanced diagnostics ---- */
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

  const ANALYTICS_SUBTABS = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'conducta', label: 'Auditoría MAE/MFE' },
    { key: 'cuantitativo', label: 'Cuantitativo y Riesgo' },
    { key: 'rachas', label: 'Rachas y Sesgos' },
    { key: 'cruzados', label: 'Filtros Cruzados' },
    { key: 'volatilidad', label: 'Régimen de Volatilidad' },
    { key: 'premarket', label: 'Fidelidad al Plan' },
    { key: 'visual', label: 'Revisor Visual' },
  ];

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

        .app-root {
          --bg: #12161D; --surface: #1A2029; --surface-2: #212836; --border: #2B3242;
          --text: #E7E9EE; --text-dim: #8991A3; --text-faint: #5B6478;
          --accent: #D8A657; --accent-dim: rgba(216,166,87,0.14);
          --profit: #4FAE7C; --profit-dim: rgba(79,174,124,0.14);
          --loss: #E0685A; --loss-dim: rgba(224,104,90,0.14);
          font-family: 'IBM Plex Sans', sans-serif; background: var(--bg); color: var(--text);
          min-height: 100%; display: flex; border-radius: 12px; overflow: hidden; border: 1px solid var(--border);
        }
        .app-root * { box-sizing: border-box; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .up { color: var(--profit); } .down { color: var(--loss); } .muted { color: var(--text-dim); }
        .hint { color: var(--text-faint); font-size: 12px; margin: 4px 0 0; }

        .sidebar { width: 200px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border); padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; }
        .brand { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 15px; letter-spacing: 0.02em; padding: 0 8px 18px; display: flex; align-items: center; gap: 8px; }
        .brand .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
        .beta-pill { font-size: 9px; padding: 1px 6px; border-radius: 20px; background: var(--accent-dim); color: var(--accent); margin-left: auto; font-family: 'IBM Plex Sans'; }
        .nav-btn { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; border: none; background: transparent; color: var(--text-dim); font-size: 13px; cursor: pointer; text-align: left; font-family: inherit; }
        .nav-btn:hover { background: var(--surface-2); color: var(--text); }
        .nav-btn.active { background: var(--accent-dim); color: var(--accent); }
        .sidebar-foot { margin-top: auto; font-size: 11px; color: var(--text-faint); padding: 8px; display: flex; align-items: center; gap: 6px; }

        .main { flex: 1; min-width: 0; display: flex; flex-direction: column; max-height: 100%; }
        .topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid var(--border); }
        .topbar h2 { margin: 0; font-size: 17px; font-weight: 600; }
        .content { padding: 20px 24px; overflow-y: auto; }

        .btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; padding: 8px 14px; border-radius: 7px; border: 1px solid var(--border); cursor: pointer; font-family: inherit; }
        .btn.primary { background: var(--accent); color: #1A130A; border-color: var(--accent); }
        .btn.primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn.secondary { background: var(--surface-2); color: var(--text); }
        .btn.full { width: 100%; justify-content: center; margin-top: 14px; }
        .icon-btn { background: transparent; border: 1px solid var(--border); color: var(--text-dim); border-radius: 6px; padding: 5px 8px; cursor: pointer; display: inline-flex; align-items: center; }
        .icon-btn:hover { color: var(--text); }
        .icon-btn.danger { color: var(--loss); font-size: 11px; border-color: var(--loss); padding: 5px 8px; }

        .stat-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap: 10px; margin-bottom: 20px; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; }
        .stat-label { font-size: 11px; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
        .stat-value { font-family: 'IBM Plex Mono', monospace; font-size: 18px; font-weight: 600; }

        .cal-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .cal-head h3 { margin: 0; font-size: 15px; font-family: 'IBM Plex Mono', monospace; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .cal-weekday { text-align: center; font-size: 11px; color: var(--text-faint); padding-bottom: 4px; }
        .cal-cell { aspect-ratio: 1.15; border-radius: 8px; border: 1px solid var(--border); padding: 6px 8px; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; background: var(--surface); transition: transform 0.1s ease; }
        .cal-cell:hover { transform: translateY(-1px); border-color: var(--text-faint); }
        .cal-cell.empty { visibility: hidden; cursor: default; }
        .cal-cell .daynum { font-size: 11px; color: var(--text-faint); font-family: 'IBM Plex Mono', monospace; }
        .cal-cell .cellpnl { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; font-weight: 600; }
        .cal-cell .cellcount { font-size: 9.5px; color: var(--text-faint); }

        .trade-table { width: 100%; border-collapse: collapse; }
        .trade-table th { text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-faint); letter-spacing: 0.03em; padding: 8px 10px; border-bottom: 1px solid var(--border); }
        .trade-table td { padding: 10px; border-bottom: 1px solid var(--border); font-size: 13px; }
        .trade-table tr:hover td { background: var(--surface-2); }
        .tag { font-size: 10px; padding: 2px 7px; border-radius: 20px; margin-left: 6px; background: color-mix(in srgb, var(--tag-color) 18%, transparent); color: var(--tag-color); border: 1px solid color-mix(in srgb, var(--tag-color) 40%, transparent); }
        .row-actions { display: flex; gap: 6px; }

        .modal-backdrop { position: fixed; inset: 0; background: rgba(8,10,14,0.6); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
        .modal-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; width: 620px; max-width: 100%; max-height: 88vh; overflow-y: auto; }
        .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .modal-head h3 { margin: 0; font-size: 15px; display: flex; align-items: center; gap: 10px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
        .inline-pnl { font-family: 'IBM Plex Mono', monospace; font-size: 13px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; margin-bottom: 10px; }
        .field { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--text-dim); margin-bottom: 10px; }
        .field span { font-size: 11.5px; }
        .field input, .field select, .field textarea { background: var(--surface-2); border: 1px solid var(--border); border-radius: 7px; padding: 8px 10px; color: var(--text); font-size: 13px; font-family: inherit; outline: none; }
        .field input:focus, .field select:focus, .field textarea:focus, button:focus-visible, .cal-cell:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
        .checkbox-row { flex-direction: row; align-items: center; gap: 8px; }
        .checkbox-row input { width: auto; }
        .pnl-preview { font-size: 13px; margin: 4px 0 14px; color: var(--text-dim); }
        .upload-row { display: flex; align-items: center; gap: 8px; }
        .img-preview { margin-top: 8px; max-width: 100%; border-radius: 8px; border: 1px solid var(--border); }

        .day-trade-list { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; }
        .day-trade-row { display: grid; grid-template-columns: 1fr auto auto; align-items: start; gap: 12px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; font-size: 13px; }

        .empty-state { text-align: center; padding: 60px 20px; color: var(--text-faint); }
        .empty-state h4 { color: var(--text); margin-bottom: 6px; }

        .strategy-list { display: flex; flex-direction: column; gap: 8px; max-width: 480px; }
        .strategy-row { display: flex; align-items: center; gap: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; }
        .swatch { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
        .add-strategy-row { display: flex; gap: 8px; margin-top: 14px; max-width: 480px; }
        .add-strategy-row input { flex: 1; background: var(--surface-2); border: 1px solid var(--border); border-radius: 7px; padding: 8px 10px; color: var(--text); font-family: inherit; }

        .analytics-section { margin-bottom: 26px; }
        .analytics-section h4 { font-size: 13px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px; }
        .strat-table { width: 100%; }
        .strat-table td { padding: 7px 4px; font-size: 13px; border-bottom: 1px solid var(--border); }

        .save-status { font-size: 11px; color: var(--text-faint); display: flex; align-items: center; gap: 5px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .spin { animation: none; } .cal-cell { transition: none; } }

        .section-title { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-faint); margin: 18px 0 8px; padding-top: 14px; border-top: 1px solid var(--border); }
        .section-title:first-of-type { border-top: none; margin-top: 0; padding-top: 0; }
        .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
        .check-chip { display: flex; align-items: center; gap: 8px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 7px; padding: 8px 10px; font-size: 12.5px; cursor: pointer; }
        .check-chip input { width: auto; }
        .shot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 10px; }
        .shot-slot { display: flex; flex-direction: column; gap: 6px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px; }
        .shot-slot-head { display: flex; justify-content: space-between; align-items: flex-start; font-size: 11px; color: var(--text-dim); line-height: 1.3; }
        .shot-thumb { width: 100%; height: 90px; object-fit: cover; border-radius: 6px; cursor: zoom-in; border: 1px solid var(--border); }
        .shot-upload-btn { justify-content: center; width: 100%; font-size: 11.5px; padding: 18px 8px; }
        .shot-note { font-size: 11.5px !important; padding: 6px 8px !important; resize: vertical; }
        .lightbox-backdrop { z-index: 60; }
        .lightbox-card { display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; max-width: 92vw; max-height: 88vh; width: 900px; }
        .lightbox-img-wrap { flex: 1.4; background: #05070A; display: flex; align-items: center; justify-content: center; min-width: 0; }
        .lightbox-img-wrap img { max-width: 100%; max-height: 88vh; object-fit: contain; }
        .lightbox-side { flex: 1; padding: 18px; overflow-y: auto; border-left: 1px solid var(--border); min-width: 220px; }
        .mirror-panel { background: var(--accent-dim); border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); border-radius: 8px; padding: 10px 12px; font-size: 12.5px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; }
        .mirror-head { display: flex; align-items: center; gap: 6px; font-weight: 600; color: var(--accent); font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
        .diag-chip { display: inline-flex; align-items: center; font-size: 10px; padding: 2px 7px; border-radius: 20px; margin-right: 4px; margin-bottom: 2px; border: 1px solid; }
        .diag-chip.good { color: var(--profit); background: var(--profit-dim); border-color: color-mix(in srgb, var(--profit) 40%, transparent); }
        .diag-chip.bad { color: var(--loss); background: var(--loss-dim); border-color: color-mix(in srgb, var(--loss) 40%, transparent); }
        .diag-chip.neutral { color: var(--text-dim); background: var(--surface-2); border-color: var(--border); }
        .subtab-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
        .subtab-btn { font-size: 12px; padding: 6px 12px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); color: var(--text-dim); cursor: pointer; font-family: inherit; }
        .subtab-btn:hover { color: var(--text); }
        .subtab-btn.active { background: var(--accent-dim); color: var(--accent); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
        .metric-table { width: 100%; border-collapse: collapse; }
        .metric-table td { padding: 8px 6px; font-size: 12.5px; border-bottom: 1px solid var(--border); vertical-align: top; }
        .metric-table td:first-child { color: var(--text-dim); width: 42%; }
        .kpi-note { font-size: 12px; color: var(--text-dim); background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; margin: 10px 0; line-height: 1.6; }
        .premarket-list { display: flex; flex-direction: column; gap: 8px; }
        .premarket-row { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
        .premarket-row-head { display: flex; justify-content: space-between; align-items: center; }
        .premarket-levels { display: flex; gap: 14px; font-size: 12px; color: var(--text-dim); flex-wrap: wrap; }
        .visual-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
        .visual-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; cursor: zoom-in; }
        .visual-card img { width: 100%; height: 110px; object-fit: cover; display: block; }
        .visual-card-info { padding: 6px 8px; font-size: 10.5px; color: var(--text-dim); }
        .select-tag { background: var(--surface-2); border: 1px solid var(--border); border-radius: 7px; padding: 7px 10px; color: var(--text); font-family: inherit; font-size: 12.5px; margin-bottom: 14px; }

        @media (max-width: 720px) {
          .app-root { flex-direction: column; }
          .sidebar { width: 100%; flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--border); }
          .brand { display: none; }
          .form-grid, .checklist-grid, .shot-grid { grid-template-columns: 1fr; }
          .lightbox-card { flex-direction: column; }
        }
      `}</style>

      <aside className="sidebar">
        <div className="brand"><span className="dot" /> TAPELINE <span className="beta-pill">BETA</span></div>
        <button className={`nav-btn ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')}><CalendarIcon size={15} /> Calendar</button>
        <button className={`nav-btn ${tab === 'premarket' ? 'active' : ''}`} onClick={() => setTab('premarket')}><Sunrise size={15} /> Pre-Market</button>
        <button className={`nav-btn ${tab === 'trades' ? 'active' : ''}`} onClick={() => setTab('trades')}><List size={15} /> Trades</button>
        <button className={`nav-btn ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}><BarChart3 size={15} /> Analytics</button>
        <button className={`nav-btn ${tab === 'playbook' ? 'active' : ''}`} onClick={() => setTab('playbook')}><BookOpen size={15} /> Playbook</button>
        <div className="sidebar-foot">
          {saving ? <><Loader2 size={12} className="spin" /> Saving…</> : saveError ? <span className="down">{saveError}</span> : 'Synced'}
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <h2>
            {tab === 'calendar' && 'Monthly calendar'}
            {tab === 'premarket' && 'Ficha Pre-Market'}
            {tab === 'trades' && 'All trades'}
            {tab === 'analytics' && 'Analytics'}
            {tab === 'playbook' && 'Strategy playbook'}
          </h2>
          {(tab === 'calendar' || tab === 'trades') && <button className="btn primary" onClick={() => openAdd()}><Plus size={14} /> Add trade</button>}
          {tab === 'premarket' && <button className="btn primary" onClick={openPremarketAdd}><Plus size={14} /> Nueva ficha</button>}
        </div>

        <div className="content">
          {loading ? (
            <div className="empty-state">Loading your journal…</div>
          ) : tab === 'calendar' ? (
            <>
              <div className="stat-strip">
                <StatCard label="This month" value={fmtMoney(monthTotal)} tone={monthTotal >= 0 ? 'up' : 'down'} />
                <StatCard label="Trades logged" value={monthTrades.length} />
                <StatCard label="All-time P&L" value={fmtMoney(stats.totalPnl)} tone={stats.totalPnl >= 0 ? 'up' : 'down'} />
              </div>
              <div className="cal-head">
                <button className="icon-btn" onClick={() => setCursor((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })}><ChevronLeft size={16} /></button>
                <h3>{MONTH_NAMES[cursor.month]} {cursor.year}</h3>
                <button className="icon-btn" onClick={() => setCursor((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })}><ChevronRight size={16} /></button>
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
                    <button key={i} className="cal-cell" style={{ background: bg }} onClick={() => setSelectedDay(ds)}>
                      <span className="daynum">{day}</span>
                      {pnl !== undefined && <span className={`cellpnl ${pnl >= 0 ? 'up' : 'down'}`}>{fmtMoney(pnl)}</span>}
                      {count > 0 && <span className="cellcount">{count} trade{count > 1 ? 's' : ''}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          ) : tab === 'premarket' ? (
            premarkets.length === 0 ? (
              <div className="empty-state"><h4>Aún no tienes fichas de Pre-Market</h4><p>Registra tu sesgo, tus niveles clave y el trigger esperado antes de la apertura.</p></div>
            ) : (
              <div className="premarket-list">
                {[...premarkets].sort((a, b) => (a.date < b.date ? 1 : -1)).map((p) => (
                  <div key={p.id} className="premarket-row">
                    <div className="premarket-row-head">
                      <div>
                        <strong className="mono">{p.ticker}</strong> <span className="muted">{fmtDateShort(p.date)}</span>{' '}
                        <span className="tag" style={{ '--tag-color': p.bias === 'long' ? '#4FAE7C' : p.bias === 'short' ? '#E0685A' : '#7FB2D9' }}>{BIAS_LABEL[p.bias] || '—'}</span>
                      </div>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openPremarketEdit(p)}><Pencil size={14} /></button>
                        <ConfirmDelete onConfirm={() => deletePremarket(p.id)} />
                      </div>
                    </div>
                    <div className="premarket-levels">
                      <span>HVL {p.hvl || '—'}</span><span>LVN {p.lvn || '—'}</span><span>POC {p.poc || '—'}</span>
                      <span>VIX/ATR {p.vix || '—'}</span>
                      <span>{DAY_TYPES.find((d) => d.value === p.dayTypePrev)?.label || '—'}</span>
                      <span>Overnight: {OVERNIGHT_INVENTORY.find((o) => o.value === p.overnightInventory)?.label || '—'}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 11.5 }}>
                      Trigger esperado: {Object.entries(p.expectedTriggers || {}).filter(([, v]) => v).map(([k]) => EXPECTED_TRIGGER_LABEL[k]).join(', ') || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'trades' ? (
            sortedTrades.length === 0 ? (
              <div className="empty-state"><h4>No trades yet</h4><p>Log your first trade to start building your journal.</p></div>
            ) : (
              <table className="trade-table">
                <thead><tr><th>Date</th><th>Symbol</th><th>Dir</th><th>P&L</th><th>Strategy</th><th>Diag</th><th></th></tr></thead>
                <tbody>
                  {sortedTrades.map((t) => {
                    const strat = strategies.find((s) => s.id === t.strategyId);
                    const pnl = calcPnL(t);
                    const d = computeTradeDiagnostics(t);
                    return (
                      <tr key={t.id}>
                        <td className="mono">{fmtDateShort(t.date)}</td>
                        <td className="mono">{t.symbol}{t.shots?.trigger?.img && <ImageIcon size={11} style={{ marginLeft: 6, verticalAlign: 'middle', opacity: 0.6 }} />}{t.videoLink && <Link2 size={11} style={{ marginLeft: 4, verticalAlign: 'middle', opacity: 0.6 }} />}</td>
                        <td className="muted">{t.direction === 'short' ? 'Short' : 'Long'}</td>
                        <td className={`mono ${pnl >= 0 ? 'up' : 'down'}`}>{fmtMoney(pnl)}</td>
                        <td>{strat && <span className="tag" style={{ '--tag-color': strat.color }}>{strat.name}</span>}</td>
                        <td>{shortDiagBadges(d).slice(0, 2).map((b, i) => <span key={i} className={`diag-chip ${b.tone}`}>{b.text}</span>)}</td>
                        <td>
                          <div className="row-actions">
                            <button className="icon-btn" onClick={() => setDetailTrade(t)}><Eye size={14} /></button>
                            <button className="icon-btn" onClick={() => openEdit(t)}><Pencil size={14} /></button>
                            <ConfirmDelete onConfirm={() => deleteTrade(t.id)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          ) : tab === 'analytics' ? (
            trades.length === 0 ? (
              <div className="empty-state"><h4>Nothing to analyze yet</h4><p>Log a few trades and your stats will show up here.</p></div>
            ) : (
              <>
                <div className="subtab-row">
                  {ANALYTICS_SUBTABS.map((s) => (
                    <button key={s.key} className={`subtab-btn ${analyticsSub === s.key ? 'active' : ''}`} onClick={() => setAnalyticsSub(s.key)}>{s.label}</button>
                  ))}
                </div>

                {analyticsSub === 'resumen' && (
                  <>
                    <div className="stat-strip">
                      <StatCard label="Total P&L" value={fmtMoney(stats.totalPnl)} tone={stats.totalPnl >= 0 ? 'up' : 'down'} />
                      <StatCard label="Win rate" value={fmtPct(stats.winRate)} />
                      <StatCard label="Profit factor" value={fmtRatio(stats.profitFactor)} />
                      <StatCard label="Avg win" value={fmtMoney(stats.avgWin)} tone="up" />
                      <StatCard label="Avg loss" value={fmtMoney(stats.avgLoss)} tone="down" />
                      <StatCard label="Trades" value={stats.count} />
                    </div>
                    <div className="analytics-section">
                      <h4>Equity curve</h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={equityCurve}>
                          <CartesianGrid stroke="#2B3242" strokeDasharray="3 3" />
                          <XAxis dataKey="date" stroke="#5B6478" fontSize={11} tick={{ fill: '#5B6478' }} />
                          <YAxis stroke="#5B6478" fontSize={11} tick={{ fill: '#5B6478' }} />
                          <Tooltip contentStyle={{ background: '#1A2029', border: '1px solid #2B3242', borderRadius: 8, fontSize: 12 }} />
                          <Line type="monotone" dataKey="equity" stroke="#D8A657" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {byStrategy.some((s) => s.count > 0) && (
                      <div className="analytics-section">
                        <h4>P&amp;L by strategy</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={byStrategy.filter((s) => s.count > 0)}>
                            <CartesianGrid stroke="#2B3242" strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#5B6478" fontSize={11} tick={{ fill: '#5B6478' }} />
                            <YAxis stroke="#5B6478" fontSize={11} tick={{ fill: '#5B6478' }} />
                            <Tooltip contentStyle={{ background: '#1A2029', border: '1px solid #2B3242', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                              {byStrategy.filter((s) => s.count > 0).map((s, i) => <Cell key={i} fill={s.pnl >= 0 ? '#4FAE7C' : '#E0685A'} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <table className="strat-table"><tbody>
                          {byStrategy.filter((s) => s.count > 0).map((s, i) => (
                            <tr key={i}><td><span className="swatch" style={{ background: s.color, display: 'inline-block' }} /> {s.name}</td><td className="muted">{s.count} trades</td><td className="muted">{fmtPct(s.winRate)} win rate</td><td className={`mono ${s.pnl >= 0 ? 'up' : 'down'}`}>{fmtMoney(s.pnl)}</td></tr>
                          ))}
                        </tbody></table>
                      </div>
                    )}
                    {byEmotion.length > 0 && (
                      <div className="analytics-section">
                        <h4>P&amp;L by emotional state</h4>
                        <table className="strat-table"><tbody>
                          {byEmotion.sort((a, b) => a.pnl - b.pnl).map((e, i) => (
                            <tr key={i}><td>{e.name}</td><td className="muted">{e.count} trades</td><td className={`mono ${e.pnl >= 0 ? 'up' : 'down'}`}>{fmtMoney(e.pnl)}</td></tr>
                          ))}
                        </tbody></table>
                      </div>
                    )}
                  </>
                )}

                {analyticsSub === 'conducta' && (
                  <>
                    <div className="stat-strip">
                      <StatCard label="Chasing" value={`${behaviorStats.chasingCount}/${behaviorStats.withEntryAuditTotal}`} tone="down" />
                      <StatCard label="Alta convicción" value={`${behaviorStats.highConvCount}/${behaviorStats.withEntryAuditTotal}`} tone="up" />
                      <StatCard label="R realizado prom." value={behaviorStats.avgRealizedR !== null ? behaviorStats.avgRealizedR.toFixed(2) + 'R' : '—'} />
                      <StatCard label="R planeado prom." value={behaviorStats.avgPlannedR !== null ? behaviorStats.avgPlannedR.toFixed(2) + 'R' : '—'} />
                    </div>
                    <div className="analytics-section">
                      <h4>Eficiencia de salida (% del MFE capturado)</h4>
                      <table className="metric-table"><tbody>
                        <tr><td>Salida por Miedo / Titubeo (0–35%)</td><td>{behaviorStats.effGroups.fear} trades</td></tr>
                        <tr><td>Salida Defensiva Correcta</td><td>{behaviorStats.effGroups.defensive} trades</td></tr>
                        <tr><td>Gestión Técnica Estándar (36–70%)</td><td>{behaviorStats.effGroups.standard} trades</td></tr>
                        <tr><td>Ejecución Óptima de la Subasta (71–100%)</td><td>{behaviorStats.effGroups.optimal} trades</td></tr>
                      </tbody></table>
                    </div>
                    <div className="analytics-section">
                      <h4>Matriz de coherencia emocional</h4>
                      {behaviorStats.coherenceAlerts.length === 0 ? <p className="hint">Sin alertas — tu gestión coincide con tus confirmaciones de Order Flow.</p> : (
                        behaviorStats.coherenceAlerts.map(({ t }, i) => (
                          <div key={i} className="kpi-note down">{t.symbol} · {fmtDateShort(t.date)} — tuvo confirmación institucional pero eficiencia de salida baja sin invalidación de flujo.</div>
                        ))
                      )}
                    </div>
                    <div className="analytics-section">
                      <h4>Auditoría del Stop Loss (Tolerancia al Dolor)</h4>
                      {behaviorStats.negAsymmetry.length === 0 ? <p className="hint">Sin casos de gestión asimétrica negativa detectados.</p> : (
                        <table className="metric-table"><tbody>
                          {behaviorStats.negAsymmetry.map(({ t, d }, i) => (
                            <tr key={i}><td>{t.symbol} · {fmtDateShort(t.date)}</td><td className="down">MFE/MAE = {fmtRatio(d.stopToleranceRatio)} — soportas drawdowns severos para capturar migajas de precio.</td></tr>
                          ))}
                        </tbody></table>
                      )}
                    </div>
                  </>
                )}

                {analyticsSub === 'cuantitativo' && (
                  <>
                    <div className="stat-strip">
                      <StatCard label="Skewness (puntos)" value={quantStats.skew !== null ? quantStats.skew.toFixed(2) : '—'} />
                      <StatCard label="Sharpe (puntos)" value={fmtRatio(quantStats.sharpe)} />
                      <StatCard label="Sortino (puntos)" value={fmtRatio(quantStats.sortino)} />
                      <StatCard label="Cerrados en stop" value={quantStats.withStopTotal ? `${quantStats.atStop}/${quantStats.withStopTotal}` : '—'} />
                      <StatCard label="Cerrados más allá del stop" value={quantStats.withStopTotal ? `${quantStats.beyond}/${quantStats.withStopTotal}` : '—'} tone={quantStats.beyond > 0 ? 'down' : undefined} />
                    </div>
                    <div className="kpi-note">
                      Un sesgo positivo (skewness) indica pérdidas pequeñas y controladas frente a ganancias infrecuentes pero grandes — la firma de una curva convexa saludable. Sortino penaliza solo la volatilidad de las rachas de pérdidas, y es la métrica clave para validar convexidad.
                    </div>
                    <div className="analytics-section">
                      <h4>Aislamiento de Cisnes Negros (peor 5% de tus operaciones)</h4>
                      {quantStats.worstTail.length === 0 ? <p className="hint">Aún no hay suficientes operaciones.</p> : (
                        <>
                          <p className="hint" style={{ marginBottom: 8 }}>Estas operaciones concentran el {fmtPct(quantStats.tailShare)} de tus pérdidas totales.</p>
                          <table className="metric-table"><tbody>
                            {quantStats.worstTail.map(({ t, pnl }, i) => (
                              <tr key={i}><td>{t.symbol} · {fmtDateShort(t.date)}</td><td className="down mono">{fmtMoney(pnl)}</td></tr>
                            ))}
                          </tbody></table>
                        </>
                      )}
                    </div>
                  </>
                )}

                {analyticsSub === 'rachas' && (
                  <>
                    <div className="stat-strip">
                      <StatCard label="Sesgo de venganza detectado" value={revengeEvents.length} tone={revengeEvents.length > 0 ? 'down' : undefined} />
                      <StatCard label="Exceso de confianza detectado" value={overconfidenceEvents.length} tone={overconfidenceEvents.length > 0 ? 'down' : undefined} />
                    </div>
                    <div className="analytics-section">
                      <h4>Comportamiento Post-Pérdida (Revenge Trading)</h4>
                      {revengeEvents.length === 0 ? <p className="hint">Sin patrones de venganza detectados.</p> : (
                        <table className="metric-table"><tbody>
                          {revengeEvents.map(({ trade, reasons }, i) => (
                            <tr key={i}><td>{trade.symbol} · {fmtDateShort(trade.date)}</td><td className="down">{reasons.join(', ')}</td></tr>
                          ))}
                        </tbody></table>
                      )}
                    </div>
                    <div className="analytics-section">
                      <h4>Comportamiento Post-Ganancia (Overconfidence)</h4>
                      {overconfidenceEvents.length === 0 ? <p className="hint">Sin exceso de confianza detectado tras rachas ganadoras.</p> : (
                        <table className="metric-table"><tbody>
                          {overconfidenceEvents.map(({ trade, confirmations }, i) => (
                            <tr key={i}><td>{trade.symbol} · {fmtDateShort(trade.date)}</td><td className="down">Solo {confirmations} confirmación(es) de Order Flow tras una racha ganadora.</td></tr>
                          ))}
                        </tbody></table>
                      )}
                    </div>
                    <div className="analytics-section">
                      <h4>Atribución de Alfa (Sincronización de Mercado)</h4>
                      <table className="metric-table"><tbody>
                        {sessionStats.map((s, i) => (
                          <tr key={i}><td>{s.name}</td><td>{s.count} trades · PF {fmtRatio(s.pf)} · {fmtPct(s.winRate)} win rate</td></tr>
                        ))}
                      </tbody></table>
                    </div>
                  </>
                )}

                {analyticsSub === 'cruzados' && (
                  <>
                    <div className="stat-strip">
                      <StatCard label="Trades impulsivos" value={`${crossStats.noiseCount}/${crossStats.total}`} tone={crossStats.noisePct > 30 ? 'down' : undefined} />
                      <StatCard label="% ruido" value={fmtPct(crossStats.noisePct)} />
                    </div>
                    <div className="analytics-section">
                      <h4>Rendimiento por Catalizador</h4>
                      <table className="metric-table"><tbody>
                        <tr><td>Con Convicción en Delta</td><td>{crossStats.catalyst.withDelta.count} trades · PF {fmtRatio(crossStats.catalyst.withDelta.pf)}</td></tr>
                        <tr><td>Sin Convicción en Delta</td><td>{crossStats.catalyst.withoutDelta.count} trades · PF {fmtRatio(crossStats.catalyst.withoutDelta.pf)}</td></tr>
                      </tbody></table>
                    </div>
                    <div className="analytics-section">
                      <h4>Eficiencia por Contrato (Mini vs. Micro)</h4>
                      <table className="metric-table"><tbody>
                        <tr><td>Mini</td><td>{crossStats.contractEfficiency.mini.count} trades · {fmtPct(crossStats.contractEfficiency.mini.winRate)} win rate · slippage prom. {crossStats.contractEfficiency.mini.avgSlip !== null ? crossStats.contractEfficiency.mini.avgSlip.toFixed(2) : '—'}</td></tr>
                        <tr><td>Micro</td><td>{crossStats.contractEfficiency.micro.count} trades · {fmtPct(crossStats.contractEfficiency.micro.winRate)} win rate · slippage prom. {crossStats.contractEfficiency.micro.avgSlip !== null ? crossStats.contractEfficiency.micro.avgSlip.toFixed(2) : '—'}</td></tr>
                      </tbody></table>
                    </div>
                    <div className="analytics-section">
                      <h4>Rendimiento según Inventario Overnight (trades de agresión largos con Convicción en Delta)</h4>
                      {crossStats.overnightPerf.length === 0 ? <p className="hint">Aún no hay suficientes trades de agresión etiquetados.</p> : (
                        <table className="metric-table"><tbody>
                          {crossStats.overnightPerf.map((o, i) => (
                            <tr key={i}><td>{OVERNIGHT_INVENTORY.find((x) => x.value === o.inv)?.label || o.inv}</td><td>{o.count} trades · {fmtPct(o.winRate)} win rate · PF {fmtRatio(o.pf)}</td></tr>
                          ))}
                        </tbody></table>
                      )}
                    </div>
                    <div className="analytics-section">
                      <h4>Agrupación por Tipos de Día (Market Profile)</h4>
                      <p className="hint" style={{ marginBottom: 8 }}>Trades en Trend Day: {crossStats.trendDayCount}. De ellos, {crossStats.reversalOnTrendCount} usaron tácticas de reversión (Absorción Pasiva) — P&amp;L combinado: <span className={crossStats.reversalOnTrendPnl >= 0 ? 'up' : 'down'}>{fmtMoney(crossStats.reversalOnTrendPnl)}</span>.</p>
                      {crossStats.reversalOnTrendCount > 0 && crossStats.reversalOnTrendPnl < 0 && (
                        <div className="kpi-note down">Estás buscando absorciones pasivas (táctica de reversión) en días de tendencia fuerte — una causa común de pérdidas catastróficas.</div>
                      )}
                    </div>
                    <div className="analytics-section">
                      <h4>Rendimiento por Duración (Holding Time Efficiency)</h4>
                      <table className="metric-table"><tbody>
                        <tr><td>Duración promedio — ganadores</td><td>{crossStats.avgHoldWin !== null ? `${crossStats.avgHoldWin.toFixed(0)} min` : '—'}</td></tr>
                        <tr><td>Duración promedio — perdedores</td><td>{crossStats.avgHoldLoss !== null ? `${crossStats.avgHoldLoss.toFixed(0)} min` : '—'}</td></tr>
                        <tr><td>Puntos por minuto — ganadores</td><td>{crossStats.avgPtsPerMinWin !== null ? crossStats.avgPtsPerMinWin.toFixed(3) : '—'}</td></tr>
                      </tbody></table>
                    </div>
                    <div className="analytics-section">
                      <h4>Métricas Universales de Control</h4>
                      <table className="metric-table"><tbody>
                        <tr><td>Profit Factor</td><td>{fmtRatio(stats.profitFactor)}</td></tr>
                        <tr><td>Win Rate</td><td>{fmtPct(stats.winRate)}</td></tr>
                        <tr><td>Payoff Ratio</td><td>{stats.avgLoss ? fmtRatio(Math.abs(stats.avgWin / stats.avgLoss)) : '—'}</td></tr>
                        <tr><td>Esperanza matemática</td><td>{fmtMoney((stats.winRate / 100) * stats.avgWin + (1 - stats.winRate / 100) * stats.avgLoss)}</td></tr>
                      </tbody></table>
                    </div>
                  </>
                )}

                {analyticsSub === 'volatilidad' && (
                  <div className="analytics-section">
                    <h4>Profit Factor y Win Rate por régimen de VIX/ATR</h4>
                    {volatilityStats.every((v) => v.count === 0) ? <p className="hint">Registra el VIX/ATR en tus trades o fichas de Pre-Market para ver este desglose.</p> : (
                      <table className="metric-table"><tbody>
                        {volatilityStats.map((v, i) => (
                          <tr key={i}><td>{v.name}</td><td>{v.count} trades · PF {fmtRatio(v.pf)} · {fmtPct(v.winRate)} win rate</td></tr>
                        ))}
                      </tbody></table>
                    )}
                    {volatilityStats.find((v) => v.name === 'Alta (Expansión)')?.pf < 1 && volatilityStats.find((v) => v.name === 'Alta (Expansión)')?.count > 0 && (
                      <div className="kpi-note down">Tu ventaja (edge) parece desaparecer cuando la volatilidad es alta (VIX &gt; {THRESHOLDS.highVix}). Considera reducir tamaño o no operar esos días.</div>
                    )}
                  </div>
                )}

                {analyticsSub === 'premarket' && (
                  !fidelityStats ? (
                    <div className="empty-state"><h4>Sin datos suficientes</h4><p>Crea fichas de Pre-Market y regístralas el mismo día/ticker que tus trades para ver tu fidelidad al plan.</p></div>
                  ) : (
                    <>
                      <div className="stat-strip">
                        <StatCard label="Índice de Fidelidad al Plan" value={fmtPct(fidelityStats.fidelityPct)} tone={fidelityStats.fidelityPct >= 60 ? 'up' : 'down'} />
                        <StatCard label="Trades cruzados con Pre-Market" value={fidelityStats.total} />
                        <StatCard label="Desviación de sesgo en perdedores" value={fmtPct(fidelityStats.deviationPct)} tone={fidelityStats.deviationPct > 40 ? 'down' : undefined} />
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
                  )
                )}

                {analyticsSub === 'visual' && (
                  <>
                    <select className="select-tag" value={visualFilterTag} onChange={(e) => setVisualFilterTag(e.target.value)}>
                      <option value="all">Todas las capturas de trigger</option>
                      <option value="Chasing">Solo: Chasing</option>
                      <option value="Salida por Miedo">Solo: Salida por Miedo</option>
                      <option value="Gestión Asimétrica Negativa">Solo: Gestión Asimétrica Negativa</option>
                      <option value="Trade Impulsivo">Solo: Trade Impulsivo</option>
                      <option value="Coherencia Rota">Solo: Coherencia Rota</option>
                    </select>
                    {visualCandidates.length === 0 ? (
                      <div className="empty-state"><h4>Sin capturas para este filtro</h4><p>Sube capturas de "Trigger" en tus trades para poder auditarlas visualmente aquí.</p></div>
                    ) : (
                      <VisualReviewGrid candidates={visualCandidates} />
                    )}
                  </>
                )}
              </>
            )
          ) : (
            <>
              <p className="hint" style={{ marginBottom: 14 }}>Define the setups you actually trade so every entry gets tagged consistently.</p>
              <div className="strategy-list">
                {strategies.map((s) => (
                  <div key={s.id} className="strategy-row">
                    <span className="swatch" style={{ background: s.color }} />
                    <span style={{ flex: 1 }}>{s.name}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{trades.filter((t) => t.strategyId === s.id).length} trades</span>
                    <ConfirmDelete onConfirm={() => deleteStrategy(s.id)} />
                  </div>
                ))}
              </div>
              <div className="add-strategy-row">
                <input placeholder="New strategy name…" value={newStratName} onChange={(e) => setNewStratName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStrategy()} />
                <button className="btn primary" onClick={addStrategy}><Plus size={14} /> Add</button>
              </div>
            </>
          )}
        </div>
      </div>

      {formOpen && <TradeForm initial={formData} strategies={strategies} premarkets={premarkets} onSave={saveTrade} onClose={() => setFormOpen(false)} />}
      {premarketFormOpen && <PreMarketForm initial={premarketFormData} onSave={savePremarket} onClose={() => setPremarketFormOpen(false)} />}
      {selectedDay && (
        <DayDetail
          dateStr={selectedDay} trades={trades} strategies={strategies}
          onClose={() => setSelectedDay(null)}
          onAdd={(d) => { setSelectedDay(null); openAdd(d); }}
          onEdit={(t) => { setSelectedDay(null); openEdit(t); }}
          onView={(t) => { setSelectedDay(null); setDetailTrade(t); }}
          onDelete={deleteTrade}
        />
      )}
      {detailTrade && <TradeDetailModal trade={detailTrade} strategies={strategies} premarkets={premarkets} onClose={() => setDetailTrade(null)} onEdit={openEdit} />}
    </div>
  );
}

function VisualReviewGrid({ candidates }) {
  const [lightbox, setLightbox] = useState(null);
  return (
    <>
      <div className="visual-grid">
        {candidates.map(({ t }, i) => (
          <div key={i} className="visual-card" onClick={() => setLightbox(t)}>
            <img src={t.shots.trigger.img} alt="trigger" />
            <div className="visual-card-info">{t.symbol} · {fmtDateShort(t.date)}</div>
          </div>
        ))}
      </div>
      {lightbox && (
        <Lightbox img={lightbox.shots.trigger.img} note={lightbox.shots.trigger.note} label={`${lightbox.symbol} · ${fmtDateShort(lightbox.date)} — Trigger`} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
