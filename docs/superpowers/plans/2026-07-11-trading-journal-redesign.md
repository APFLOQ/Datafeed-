# Trading Journal Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 1700-line TradingJournal.jsx into modular components, migrate inline CSS to Tailwind, and enhance the analytics dashboard with interactive charts.

**Architecture:** Single `useJournal` hook manages all state. ~25 focused components under `src/components/`. Utils extracted to `src/utils/`. Each component receives data + callbacks as props. Tailwind replaces inline `<style>` block.

**Tech Stack:** React 18, Vite 5, Recharts 2, Tailwind CSS v3, lucide-react

---

### Task 1: Project Setup + Tailwind Install

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `src/index.css`

- [ ] **Install Tailwind dependencies**

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Configure `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1A2029',
          2: '#212836',
        },
        border: '#2B3242',
        text: {
          DEFAULT: '#E7E9EE',
          dim: '#8991A3',
          faint: '#5B6478',
        },
        accent: {
          DEFAULT: '#D8A657',
          dim: 'rgba(216,166,87,0.14)',
        },
        profit: {
          DEFAULT: '#4FAE7C',
          dim: 'rgba(79,174,124,0.14)',
        },
        loss: {
          DEFAULT: '#E0685A',
          dim: 'rgba(224,104,90,0.14)',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Configure `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
});
```

- [ ] **Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #12161D;
}

html, body, #root {
  height: 100%;
  margin: 0;
  background: var(--bg);
}
```

- [ ] **Import CSS in `src/main.jsx`**

```jsx
import './index.css';
```

- [ ] **Verify build works**

```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Commit**

```bash
git add package.json vite.config.js tailwind.config.js src/index.css src/main.jsx
git commit -m "feat: add Tailwind CSS configuration"
```

---

### Task 2: Extract Utilities

**Files:**
- Create: `src/utils/constants.js`
- Create: `src/utils/formatters.js`
- Create: `src/utils/calculations.js`
- Create: `src/utils/storage.js`

- [ ] **Create `src/utils/constants.js`** — all constants from TradingJournal.jsx lines 16-82

```js
export const EMOTIONS = ['Disciplined', 'Confident', 'Patient', 'Hesitant', 'FOMO', 'Revenge', 'Impulsive'];
export const STRATEGY_COLORS = ['#D8A657', '#7FB2D9', '#B58BD9', '#4FAE7C', '#E0685A', '#7FD9C4', '#D98FB0'];
export const DEFAULT_STRATEGIES = [
  { id: 'strat-1', name: 'Breakout', color: STRATEGY_COLORS[0] },
  { id: 'strat-2', name: 'Trend Follow', color: STRATEGY_COLORS[1] },
  { id: 'strat-3', name: 'Reversal', color: STRATEGY_COLORS[2] },
];
export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const ASSET_TYPES = [
  { value: 'futures', label: 'Futuros' },
  { value: 'options', label: 'Opciones' },
];
export const CONTRACT_SIZES = [
  { value: 'micro', label: 'Micro (MES, MNQ)' },
  { value: 'mini', label: 'Mini (ES, NQ)' },
];
export const CLOSE_CONTEXTS = [
  { value: 'target', label: 'Target Estructural' },
  { value: 'invalidation', label: 'Invalidation por Flujo' },
  { value: 'session_end', label: 'Fin de Sesión' },
];
export const OVERNIGHT_INVENTORY = [
  { value: 'long', label: '100% Largo' },
  { value: 'short', label: '100% Corto' },
  { value: 'balanced', label: 'Balanceado' },
];
export const DAY_TYPES = [
  { value: 'trend', label: 'Trend Day' },
  { value: 'normal', label: 'Normal Variation Day' },
  { value: 'range', label: 'Trading Range / Non-Trend Day' },
];
export const ORDER_FLOW_FLAGS = [
  { key: 'deltaConviction', label: 'Convicción en Delta' },
  { key: 'passiveAbsorption', label: 'Absorción Pasiva' },
  { key: 'aggressionImbalance', label: 'Desequilibrio de Agresión' },
  { key: 'deltaDivergence', label: 'Divergencia Delta vs. Precio' },
  { key: 'volumeReaction', label: 'Reacción en Niveles de Volumen' },
];
export const BIAS_OPTIONS = [
  { value: 'long', label: 'Largo' },
  { value: 'short', label: 'Corto' },
  { value: 'neutral', label: 'Neutral-Rotacional' },
];
export const BIAS_LABEL = { long: 'Largo', short: 'Corto', neutral: 'Neutral-Rotacional' };
export const EXPECTED_TRIGGER_LABEL = {
  absorption: 'Absorción Pasiva en Extremos',
  deltaConviction: 'Convicción en Delta tras Quiebre',
  imbalance: 'Desequilibrio de Agresión (Imbalance)',
};
export const SHOT_STAGES = [
  { key: 'context', label: 'Contexto Pre-Market (TPO / Profile 90d)' },
  { key: 'trigger', label: 'Trigger Microestructura (Order Flow / Footprint)' },
  { key: 'post', label: 'Post-Trade — Excursión Completa (MAE/MFE)' },
];
export const THRESHOLDS = {
  chasingRiskFraction: 0.25,
  chasingFallbackPct: 0.001,
  stopEpsilonRiskFraction: 0.05,
  revengeSlippageMultiplier: 1.5,
  zoneToleranceFraction: 0.0015,
  zoneToleranceAbsolute: 3,
  lowVix: 15,
  highVix: 22,
};
export const ANALYTICS_SUBTABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'conducta', label: 'Auditoría MAE/MFE' },
  { key: 'cuantitativo', label: 'Cuantitativo y Riesgo' },
  { key: 'rachas', label: 'Rachas y Sesgos' },
  { key: 'cruzados', label: 'Filtros Cruzados' },
  { key: 'volatilidad', label: 'Régimen de Volatilidad' },
  { key: 'premarket', label: 'Fidelidad al Plan' },
  { key: 'visual', label: 'Revisor Visual' },
];
```

- [ ] **Create `src/utils/formatters.js`** — all formatters from TradingJournal.jsx lines 88-119

```js
import { MONTH_NAMES } from './constants';

export const pad2 = (n) => String(n).padStart(2, '0');
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
export const dateKey = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
export const numOk = (v) => v !== '' && v !== undefined && v !== null && !Number.isNaN(Number(v));

export function fmtMoney(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? '-' : '';
  return `${sign}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function fmtDateShort(dstr) {
  if (!dstr) return '';
  const [y, m, d] = dstr.split('-').map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`;
}
export function fmtPts(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '\u2014';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)} pts`;
}
export function fmtPct(n, digits = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return '\u2014';
  return `${n.toFixed(digits)}%`;
}
export function fmtRatio(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '\u2014';
  if (n === Infinity) return '\u221E';
  return n.toFixed(2);
}
```

- [ ] **Create `src/utils/calculations.js`** — all calculation helpers from TradingJournal.jsx lines 121-326

Extract these functions exactly as they are in the current file:
- `calcPnL`
- `getMonthCells`
- `compressImage`
- `mean`, `stdev`, `skewness`, `sharpePoints`, `sortinoPoints`
- `pfOf`, `winRateOf`
- `computeTradeDiagnostics`
- `getDiagnosticTags`
- `shortDiagBadges`
- `sessionBucket`
- `vixBucket`

All functions take the same parameters and return the same values as the original. No changes.

- [ ] **Create `src/utils/storage.js`** — polyfill moved from `src/storagePolyfill.js`

```js
const DB_KEY = '__tapeline_kv__';

const readDb = () => {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '{}'); }
  catch { return {}; }
};
const writeDb = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key) {
      const db = readDb();
      if (!(key in db)) return null;
      return { key, value: db[key], shared: false };
    },
    async set(key, value) {
      const db = readDb();
      db[key] = value;
      writeDb(db);
      return { key, value, shared: false };
    },
    async delete(key) {
      const db = readDb();
      const existed = key in db;
      delete db[key];
      writeDb(db);
      return { key, deleted: existed, shared: false };
    },
    async list(prefix) {
      const db = readDb();
      const keys = Object.keys(db).filter((k) => !prefix || k.startsWith(prefix));
      return { keys, prefix, shared: false };
    },
  };
}
```

Remove `/src/storagePolyfill.js` after creating this.

- [ ] **Update `src/main.jsx`** to import from new location

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './utils/storage';
import './index.css';
import TradingJournal from './TradingJournal';
```

- [ ] **Verify build**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Commit**

```bash
git add src/utils/ src/main.jsx
git rm src/storagePolyfill.js
git commit -m "refactor: extract utils (constants, formatters, calculations, storage)"
```

---

### Task 3: Create useJournal Hook

**Files:**
- Create: `src/hooks/useJournal.js`
- Modify: `src/TradingJournal.jsx`

- [ ] **Create `src/hooks/useJournal.js`** — central state hook

This hook encapsulates ALL state from lines 816-914 of TradingJournal.jsx:

```jsx
import { useState, useEffect, useMemo } from 'react';
import { uid } from '../utils/formatters';
import { DEFAULT_STRATEGIES } from '../utils/constants';

export function useJournal() {
  const [trades, setTrades] = useState([]);
  const [strategies, setStrategies] = useState(DEFAULT_STRATEGIES);
  const [premarkets, setPremarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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
      setSaveError('Could not save \u2014 storage may be full. Try a smaller screenshot.');
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

  const saveTrade = (data) => {
    if (data.id) persistTrades(trades.map((t) => (t.id === data.id ? data : t)));
    else persistTrades([...trades, { ...data, id: uid() }]);
  };
  const deleteTrade = (id) => persistTrades(trades.filter((t) => t.id !== id));

  const addStrategy = (name) => {
    if (!name.trim()) return;
    const { STRATEGY_COLORS } = require('../utils/constants');
    const color = STRATEGY_COLORS[strategies.length % STRATEGY_COLORS.length];
    persistStrategies([...strategies, { id: uid(), name: name.trim(), color }]);
  };
  const deleteStrategy = (id) => persistStrategies(strategies.filter((s) => s.id !== id));

  const savePremarket = (data) => {
    if (data.id) persistPremarkets(premarkets.map((p) => (p.id === data.id ? data : p)));
    else persistPremarkets([...premarkets, { ...data, id: uid() }]);
  };
  const deletePremarket = (id) => persistPremarkets(premarkets.filter((p) => p.id !== id));

  return {
    trades, strategies, premarkets,
    loading, saving, saveError,
    saveTrade, deleteTrade,
    addStrategy, deleteStrategy,
    savePremarket, deletePremarket,
  };
}
```

Wait — I used `require` which is CJS. Let me fix this to use static import at the top:

```js
import { uid } from '../utils/formatters';
import { DEFAULT_STRATEGIES, STRATEGY_COLORS } from '../utils/constants';
```

And remove the `require` line. The `addStrategy` function becomes:

```js
const addStrategy = (name) => {
  if (!name.trim()) return;
  const color = STRATEGY_COLORS[strategies.length % STRATEGY_COLORS.length];
  persistStrategies([...strategies, { id: uid(), name: name.trim(), color }]);
};
```

- [ ] **Verify build**

```bash
npm run build
```
Expected: Build succeeds (warning about unused imports is OK for now).

- [ ] **Commit**

```bash
git add src/hooks/useJournal.js
git commit -m "refactor: create useJournal hook"
```

---

### Task 4: Extract Small UI Components

**Files:**
- Create: `src/components/UI/StatCard.jsx`
- Create: `src/components/UI/EmptyState.jsx`
- Create: `src/components/UI/ShotSlot.jsx`
- Create: `src/components/Modals/ConfirmDelete.jsx`
- Create: `src/components/Modals/Lightbox.jsx`

- [ ] **Create `src/components/UI/StatCard.jsx`**

```jsx
export default function StatCard({ label, value, tone }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${tone || ''}`}>{value}</div>
    </div>
  );
}
```

- [ ] **Create `src/components/UI/EmptyState.jsx`**

```jsx
export default function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{message}</p>
    </div>
  );
}
```

- [ ] **Create `src/components/UI/ShotSlot.jsx`** — lines 382-418 from original

```jsx
import { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { compressImage } from '../../utils/calculations';
import Lightbox from '../Modals/Lightbox';

export default function ShotSlot({ label, shot, onChange }) {
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
    } catch { /* ignore */ }
    finally { setUploading(false); }
  };

  return (
    <div className="shot-slot">
      <div className="shot-slot-head">
        <span>{label}</span>
        {shot.img && (
          <button type="button" className="icon-btn" onClick={() => onChange({ ...shot, img: null })}>
            <X size={12} />
          </button>
        )}
      </div>
      {shot.img ? (
        <img src={shot.img} alt={label} className="shot-thumb" onClick={() => setLightboxOpen(true)} />
      ) : (
        <button type="button" className="btn secondary shot-upload-btn" onClick={() => fileRef.current?.click()}>
          <Camera size={13} /> {uploading ? 'Procesando\u2026' : 'Subir captura'}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <textarea rows={2} className="shot-note" placeholder="Nota estructural\u2026" value={shot.note || ''} onChange={(e) => onChange({ ...shot, note: e.target.value })} />
      {lightboxOpen && <Lightbox img={shot.img} note={shot.note} label={label} onClose={() => setLightboxOpen(false)} />}
    </div>
  );
}
```

- [ ] **Create `src/components/Modals/ConfirmDelete.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function ConfirmDelete({ onConfirm }) {
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
```

- [ ] **Create `src/components/Modals/Lightbox.jsx`**

```jsx
import { X } from 'lucide-react';

export default function Lightbox({ img, note, label, onClose }) {
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
```

- [ ] **Update `src/TradingJournal.jsx`** — replace the StatCard/ConfirmDelete/Lightbox/ShotSlot definitions with imports

Add these imports at the top:
```jsx
import StatCard from './components/UI/StatCard';
import EmptyState from './components/UI/EmptyState';
import ConfirmDelete from './components/Modals/ConfirmDelete';
```

Remove the function definitions for `StatCard`, `ConfirmDelete`, `Lightbox`, and `ShotSlot` from TradingJournal.jsx.

- [ ] **Verify build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/UI/ src/components/Modals/ src/TradingJournal.jsx
git commit -m "refactor: extract UI components (StatCard, EmptyState, ShotSlot, ConfirmDelete, Lightbox)"
```

---

### Task 5: Extract Sidebar and Topbar

**Files:**
- Create: `src/components/Sidebar.jsx`
- Create: `src/components/Topbar.jsx`
- Modify: `src/TradingJournal.jsx`

- [ ] **Create `src/components/Sidebar.jsx`**

```jsx
import { Calendar as CalendarIcon, List, BarChart3, BookOpen, Sunrise, Loader2 } from 'lucide-react';

export default function Sidebar({ tab, setTab, saving, saveError }) {
  const tabs = [
    { key: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    { key: 'premarket', icon: Sunrise, label: 'Pre-Market' },
    { key: 'trades', icon: List, label: 'Trades' },
    { key: 'analytics', icon: BarChart3, label: 'Analytics' },
    { key: 'playbook', icon: BookOpen, label: 'Playbook' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand"><span className="dot" /> TAPELINE <span className="beta-pill">BETA</span></div>
      {tabs.map(({ key, icon: Icon, label }) => (
        <button key={key} className={`nav-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
          <Icon size={15} /> {label}
        </button>
      ))}
      <div className="sidebar-foot">
        {saving ? <><Loader2 size={12} className="spin" /> Saving\u2026</> : saveError ? <span className="down">{saveError}</span> : 'Synced'}
      </div>
    </aside>
  );
}
```

- [ ] **Create `src/components/Topbar.jsx`**

```jsx
import { Plus, Sunrise } from 'lucide-react';

export default function Topbar({ tab, onAddTrade, onAddPremarket }) {
  const titles = {
    calendar: 'Monthly calendar',
    premarket: 'Ficha Pre-Market',
    trades: 'All trades',
    analytics: 'Analytics',
    playbook: 'Strategy playbook',
  };

  return (
    <div className="topbar">
      <h2>{titles[tab]}</h2>
      {(tab === 'calendar' || tab === 'trades') && (
        <button className="btn primary" onClick={onAddTrade}><Plus size={14} /> Add trade</button>
      )}
      {tab === 'premarket' && (
        <button className="btn primary" onClick={onAddPremarket}><Plus size={14} /> Nueva ficha</button>
      )}
    </div>
  );
}
```

- [ ] **Update `src/TradingJournal.jsx`** — replace Sidebar and Topbar with imports

- [ ] **Verify build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/Sidebar.jsx src/components/Topbar.jsx src/TradingJournal.jsx
git commit -m "refactor: extract Sidebar and Topbar components"
```

---

### Task 6: Extract CalendarView

**Files:**
- Create: `src/components/CalendarView.jsx`
- Modify: `src/TradingJournal.jsx`

- [ ] **Create `src/components/CalendarView.jsx`**

This is the calendar tab content (lines 1318-1347 from the original JSX) plus its derived data computations (lines 917-925). It receives as props: trades, cursor, setCursor, setSelectedDay, totalPnl from stats.

```jsx
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthCells, calcPnL } from '../utils/calculations';
import { dateKey, fmtMoney } from '../utils/formatters';
import { MONTH_NAMES, WEEKDAYS } from '../utils/constants';
import StatCard from './UI/StatCard';

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
```

- [ ] **Update `src/TradingJournal.jsx`** — import CalendarView and replace the calendar tab content

- [ ] **Verify build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/CalendarView.jsx src/TradingJournal.jsx
git commit -m "refactor: extract CalendarView component"
```

---

### Task 7: Extract TradeTable and PreMarketPanel

**Files:**
- Create: `src/components/TradeTable.jsx`
- Create: `src/components/PreMarketPanel.jsx`
- Modify: `src/TradingJournal.jsx`

- [ ] **Create `src/components/TradeTable.jsx`**

Wraps the "All trades" table view (lines 1379-1408 of original). Props: sortedTrades, strategies, onView, onEdit, onDelete.

```jsx
import { ImageIcon, Link2, Eye, Pencil } from 'lucide-react';
import { calcPnL, computeTradeDiagnostics, shortDiagBadges } from '../utils/calculations';
import { fmtMoney, fmtDateShort } from '../utils/formatters';
import ConfirmDelete from './Modals/ConfirmDelete';

export default function TradeTable({ trades, strategies, onView, onEdit, onDelete }) {
  if (trades.length === 0) {
    return (
      <div className="empty-state">
        <h4>No trades yet</h4>
        <p>Log your first trade to start building your journal.</p>
      </div>
    );
  }
  return (
    <table className="trade-table">
      <thead>
        <tr>
          <th>Date</th><th>Symbol</th><th>Dir</th><th>P&amp;L</th><th>Strategy</th><th>Diag</th><th></th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t) => {
          const strat = strategies.find((s) => s.id === t.strategyId);
          const pnl = calcPnL(t);
          const d = computeTradeDiagnostics(t);
          return (
            <tr key={t.id}>
              <td className="mono">{fmtDateShort(t.date)}</td>
              <td className="mono">
                {t.symbol}
                {t.shots?.trigger?.img && <ImageIcon size={11} style={{ marginLeft: 6, verticalAlign: 'middle', opacity: 0.6 }} />}
                {t.videoLink && <Link2 size={11} style={{ marginLeft: 4, verticalAlign: 'middle', opacity: 0.6 }} />}
              </td>
              <td className="muted">{t.direction === 'short' ? 'Short' : 'Long'}</td>
              <td className={`mono ${pnl >= 0 ? 'up' : 'down'}`}>{fmtMoney(pnl)}</td>
              <td>{strat && <span className="tag" style={{ '--tag-color': strat.color }}>{strat.name}</span>}</td>
              <td>{shortDiagBadges(d).slice(0, 2).map((b, i) => <span key={i} className={`diag-chip ${b.tone}`}>{b.text}</span>)}</td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => onView(t)}><Eye size={14} /></button>
                  <button className="icon-btn" onClick={() => onEdit(t)}><Pencil size={14} /></button>
                  <ConfirmDelete onConfirm={() => onDelete(t.id)} />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

- [ ] **Create `src/components/PreMarketPanel.jsx`**

Wraps the pre-market fichas list (lines 1349-1377 of original).

```jsx
import { CONTRACT_SIZES } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { fmtDateShort } from '../utils/formatters';
import { BIAS_LABEL, EXPECTED_TRIGGER_LABEL, DAY_TYPES, OVERNIGHT_INVENTORY } from '../utils/constants';
import ConfirmDelete from './Modals/ConfirmDelete';

export default function PreMarketPanel({ premarkets, onEdit, onDelete }) {
  if (premarkets.length === 0) {
    return (
      <div className="empty-state">
        <h4>A\u00fan no tienes fichas de Pre-Market</h4>
        <p>Registra tu sesgo, tus niveles clave y el trigger esperado antes de la apertura.</p>
      </div>
    );
  }
  return (
    <div className="premarket-list">
      {[...premarkets].sort((a, b) => (a.date < b.date ? 1 : -1)).map((p) => (
        <div key={p.id} className="premarket-row">
          <div className="premarket-row-head">
            <div>
              <strong className="mono">{p.ticker}</strong> <span className="muted">{fmtDateShort(p.date)}</span>{' '}
              <span className="tag" style={{ '--tag-color': p.bias === 'long' ? '#4FAE7C' : p.bias === 'short' ? '#E0685A' : '#7FB2D9' }}>
                {BIAS_LABEL[p.bias] || '\u2014'}
              </span>
            </div>
            <div className="row-actions">
              <button className="icon-btn" onClick={() => onEdit(p)}><Pencil size={14} /></button>
              <ConfirmDelete onConfirm={() => onDelete(p.id)} />
            </div>
          </div>
          <div className="premarket-levels">
            <span>HVL {p.hvl || '\u2014'}</span><span>LVN {p.lvn || '\u2014'}</span><span>POC {p.poc || '\u2014'}</span>
            <span>VIX/ATR {p.vix || '\u2014'}</span>
            <span>{DAY_TYPES.find((d) => d.value === p.dayTypePrev)?.label || '\u2014'}</span>
            <span>Overnight: {OVERNIGHT_INVENTORY.find((o) => o.value === p.overnightInventory)?.label || '\u2014'}</span>
          </div>
          <div className="muted" style={{ fontSize: 11.5 }}>
            Trigger esperado: {Object.entries(p.expectedTriggers || {}).filter(([, v]) => v).map(([k]) => EXPECTED_TRIGGER_LABEL[k]).join(', ') || '\u2014'}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Update TradingJournal.jsx** — import and use TradeTable, PreMarketPanel

- [ ] **Verify build**

- [ ] **Commit**

```bash
git add src/components/TradeTable.jsx src/components/PreMarketPanel.jsx src/TradingJournal.jsx
git commit -m "refactor: extract TradeTable and PreMarketPanel"
```

---

### Task 8: Extract PlaybookPanel

**Files:**
- Create: `src/components/PlaybookPanel.jsx`
- Modify: `src/TradingJournal.jsx`

- [ ] **Create `src/components/PlaybookPanel.jsx`**

Wraps the strategy playbook section (lines 1697-1713 of original).

```jsx
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { STRATEGY_COLORS } from '../utils/constants';

export default function PlaybookPanel({ strategies, onAdd, onDelete }) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
  };

  return (
    <>
      <p className="hint" style={{ marginBottom: 14 }}>
        Define the setups you actually trade so every entry gets tagged consistently.
      </p>
      <div className="strategy-list">
        {strategies.map((s) => (
          <div key={s.id} className="strategy-row">
            <span className="swatch" style={{ background: s.color }} />
            <span>{s.name}</span>
            <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={() => onDelete(s.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="add-strategy-row">
        <input placeholder="New strategy name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn primary" onClick={handleAdd} disabled={!name.trim()}>
          <Plus size={14} /> Add
        </button>
      </div>
    </>
  );
}
```

- [ ] **Update TradingJournal.jsx** — import PlaybookPanel

- [ ] **Verify build**

- [ ] **Commit**

```bash
git add src/components/PlaybookPanel.jsx src/TradingJournal.jsx
git commit -m "refactor: extract PlaybookPanel"
```

---

### Task 9: Extract Forms (TradeForm + PreMarketForm)

**Files:**
- Create: `src/components/Forms/TradeForm.jsx`
- Create: `src/components/Forms/PreMarketForm.jsx`
- Modify: `src/TradingJournal.jsx`

- [ ] **Create `src/components/Forms/TradeForm.jsx`**

Copy the entire `TradeForm` function from original lines 424-603, plus all its dependencies imported. Also include the `emptyForm()` factory function. Props: `{ initial, strategies, premarkets, onSave, onClose }`.

```jsx
import { useState, useMemo } from 'react';
import { X, Link2 } from 'lucide-react';
import { calcPnL, computeTradeDiagnostics } from '../../utils/calculations';
import { fmtMoney, fmtPct, fmtRatio } from '../../utils/formatters';
import {
  EMOTIONS, ORDER_FLOW_FLAGS, CLOSE_CONTEXTS, OVERNIGHT_INVENTORY,
  DAY_TYPES, ASSET_TYPES, CONTRACT_SIZES, SHOT_STAGES,
  BIAS_LABEL, EXPECTED_TRIGGER_LABEL, THRESHOLDS,
} from '../../utils/constants';
import ShotSlot from '../UI/ShotSlot';
import { Sunrise } from 'lucide-react';

export const emptyForm = () => ({
  id: null, date: new Date().toISOString().slice(0, 10), symbol: '', direction: 'long',
  entryPrice: '', exitPrice: '', size: '', fees: '', useManualPnl: false, manualPnl: '',
  strategyId: '', emotion: '', notes: '', videoLink: '',
  assetType: 'futures', contractSize: 'micro',
  orderFlow: { deltaConviction: false, passiveAbsorption: false, aggressionImbalance: false, deltaDivergence: false, volumeReaction: false },
  plannedEntryPrice: '', stopLossPrice: '', plannedTargetPrice: '',
  mfePrice: '', maePrice: '', closeContext: '', entryTime: '', exitTime: '',
  overnightInventory: '', dayTypePrev: '', vix: '',
  shots: { context: { img: null, note: '' }, trigger: { img: null, note: '' }, post: { img: null, note: '' } },
});

export default function TradeForm({ initial, strategies, premarkets, onSave, onClose }) {
  // ... full component body from original lines 425-603
}
```

The full body is the same as the original function - copy it exactly from lines 425-603.

- [ ] **Create `src/components/Forms/PreMarketForm.jsx`**

Copy the `PreMarketForm` function from original lines 609-670.

```jsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { BIAS_OPTIONS, CONTRACT_SIZES, DAY_TYPES, OVERNIGHT_INVENTORY } from '../../utils/constants';

export const emptyPremarket = () => ({
  id: null, date: new Date().toISOString().slice(0, 10), ticker: '', contractSize: 'micro',
  hvl: '', lvn: '', poc: '', bias: '',
  expectedTriggers: { absorption: false, deltaConviction: false, imbalance: false },
  vix: '', dayTypePrev: '', overnightInventory: '',
});

export default function PreMarketForm({ initial, onSave, onClose }) {
  // ... full component body from original lines 610-670
}
```

- [ ] **Update TradingJournal.jsx** — import TradeForm, PreMarketForm, emptyForm, emptyPremarket.
Remove the function definitions and the empty factory functions from TradingJournal.jsx.

- [ ] **Verify build**

- [ ] **Commit**

```bash
git add src/components/Forms/ src/TradingJournal.jsx
git commit -m "refactor: extract TradeForm and PreMarketForm"
```

---

### Task 10: Extract Modals (DayDetail + TradeDetailModal)

**Files:**
- Create: `src/components/Modals/DayDetail.jsx`
- Create: `src/components/Modals/TradeDetailModal.jsx`
- Modify: `src/TradingJournal.jsx`

- [ ] **Create `src/components/Modals/DayDetail.jsx`**

Copy from original lines 676-714.

```jsx
import { Eye, Pencil, Plus, X } from 'lucide-react';
import { calcPnL, computeTradeDiagnostics, shortDiagBadges } from '../../utils/calculations';
import { fmtMoney, fmtDateShort } from '../../utils/formatters';
import ConfirmDelete from './ConfirmDelete';

export default function DayDetail({ dateStr, trades, strategies, onClose, onAdd, onEdit, onDelete, onView }) {
  const dayTrades = trades.filter((t) => t.date === dateStr);
  const total = dayTrades.reduce((s, t) => s + calcPnL(t), 0);
  // ... rest of component from lines 680-714
}
```

- [ ] **Create `src/components/Modals/TradeDetailModal.jsx`**

Copy from original lines 716-789.

- [ ] **Update TradingJournal.jsx** — import new modal components, remove old definitions.

- [ ] **Verify build**

- [ ] **Commit**

```bash
git add src/components/Modals/DayDetail.jsx src/components/Modals/TradeDetailModal.jsx src/TradingJournal.jsx
git commit -m "refactor: extract DayDetail and TradeDetailModal"
```

---

### Task 11: Extract Analytics Subtab Files

**Files:**
- Create: `src/components/Analytics/AnalyticsDashboard.jsx` (container with subtab nav)
- Create: `src/components/Analytics/ResumenTab.jsx`
- Create: `src/components/Analytics/ConductaTab.jsx`
- Create: `src/components/Analytics/CuantitativoTab.jsx`
- Create: `src/components/Analytics/RachasTab.jsx`
- Create: `src/components/Analytics/CruzadosTab.jsx`
- Create: `src/components/Analytics/VolatilidadTab.jsx`
- Create: `src/components/Analytics/PremarketTab.jsx`
- Create: `src/components/Analytics/VisualTab.jsx`
- Modify: `src/TradingJournal.jsx`

- [ ] **Create `src/components/Analytics/AnalyticsDashboard.jsx`**

Container with subtab navigation (original lines 1410-1695). It uses all derived stats computed in TradingJournal.jsx (lines 928-1122). These stats should be computed here via useMemo or passed as props.

For now, pass ALL derived stats as props from TradingJournal.jsx:

```jsx
import { useState } from 'react';
import { ANALYTICS_SUBTABS } from '../../utils/constants';
import ResumenTab from './ResumenTab';
import ConductaTab from './ConductaTab';
import CuantitativoTab from './CuantitativoTab';
import RachasTab from './RachasTab';
import CruzadosTab from './CruzadosTab';
import VolatilidadTab from './VolatilidadTab';
import PremarketTab from './PremarketTab';
import VisualTab from './VisualTab';
import EmptyState from '../UI/EmptyState';

export default function AnalyticsDashboard({
  trades, strategies, premarkets,
  stats, equityCurve, byStrategy, byEmotion,
  behaviorStats, quantStats, revengeEvents, overconfidenceEvents,
  sessionStats, crossStats, volatilityStats, fidelityStats,
  allDiag, visualCandidates, visualFilterTag, setVisualFilterTag,
}) {
  const [sub, setSub] = useState('resumen');

  if (trades.length === 0) {
    return <EmptyState title="Nothing to analyze yet" message="Log a few trades and your stats will show up here." />;
  }

  const tabs = {
    resumen: <ResumenTab stats={stats} equityCurve={equityCurve} byStrategy={byStrategy} byEmotion={byEmotion} />,
    conducta: <ConductaTab behaviorStats={behaviorStats} />,
    cuantitativo: <CuantitativoTab quantStats={quantStats} />,
    rachas: <RachasTab revengeEvents={revengeEvents} overconfidenceEvents={overconfidenceEvents} sessionStats={sessionStats} />,
    cruzados: <CruzadosTab crossStats={crossStats} stats={stats} />,
    volatilidad: <VolatilidadTab volatilityStats={volatilityStats} />,
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
```

- [ ] **Create subtab components** — each one takes the relevant props and renders the content from the original JSX.

`ResumenTab.jsx` — lines 1421-1474
`ConductaTab.jsx` — lines 1477-1513
`CuantitativoTab.jsx` — lines 1515-1541
`RachasTab.jsx` — lines 1543-1578
`CruzadosTab.jsx` — lines 1580-1635
`VolatilidadTab.jsx` — lines 1637-1651
`PremarketTab.jsx` — lines 1653-1675
`VisualTab.jsx` — lines 1677-1693

Each subtab imports its needed functions from utils.

- [ ] **Move stat computations from TradingJournal.jsx to AnalyticsDashboard.jsx**

The stat computations (lines 928-1122 of original) should ideally move to AnalyticsDashboard since they're only used there. Move all useMemo blocks for: `stats`, `equityCurve`, `byStrategy`, `byEmotion`, `allDiag`, `pointsSeries`, `behaviorStats`, `quantStats`, `revengeEvents`, `overconfidenceEvents`, `sessionStats`, `crossStats`, `volatilityStats`, `fidelityStats`, `visualCandidates` into AnalyticsDashboard.

This means TradingJournal.jsx no longer needs to compute these, and AnalyticsDashboard receives only `trades`, `strategies`, `premarkets` as props.

- [ ] **Update TradingJournal.jsx** — replace analytics tab content with `<AnalyticsDashboard>`.

- [ ] **Verify build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/Analytics/ src/TradingJournal.jsx
git commit -m "refactor: extract Analytics tab components"
```

---

### Task 12: Rewrite TradingJournal.jsx as Thin Shell

**Files:**
- Modify: `src/TradingJournal.jsx`

At this point, TradingJournal.jsx should only contain:
1. Imports of all components
2. The `useJournal` hook call
3. Local UI state (tab, cursor, formOpen, etc.)
4. Render with Sidebar, Topbar, CalendarView, etc.

Remove all inline `<style>` block — it will be replaced by Tailwind classes in the next layer.

Remove all imports that are no longer used.

**Final structure of TradingJournal.jsx:**

```jsx
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
  const monthKey = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`;
  const monthTrades = trades.filter((t) => t.date.startsWith(monthKey));

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
        <Topbar tab={tab} onAddTrade={() => openAdd()} onAddPremarket={() => { setPremarketFormData(emptyPremarket()); setPremarketFormOpen(true); }} />
        <div className="content">
          {tab === 'calendar' && (
            <CalendarView trades={trades} cursor={cursor} setCursor={setCursor} onSelectDay={setSelectedDay} />
          )}
          {tab === 'premarket' && (
            <PreMarketPanel premarkets={premarkets} onEdit={(p) => { setPremarketFormData({ ...emptyPremarket(), ...p }); setPremarketFormOpen(true); }} onDelete={deletePremarket} />
          )}
          {tab === 'trades' && (
            <TradeTable trades={sortedTrades} strategies={strategies} onView={setDetailTrade} onEdit={openEdit} onDelete={deleteTrade} />
          )}
          {tab === 'analytics' && (
            <AnalyticsDashboard trades={trades} strategies={strategies} premarkets={premarkets} />
          )}
          {tab === 'playbook' && (
            <PlaybookPanel strategies={strategies} onAdd={addStrategy} onDelete={deleteStrategy} />
          )}
        </div>
      </div>

      {formOpen && <TradeForm initial={formData} strategies={strategies} premarkets={premarkets} onSave={saveTrade} onClose={() => setFormOpen(false)} />}
      {premarketFormOpen && <PreMarketForm initial={premarketFormData} onSave={savePremarket} onClose={() => setPremarketFormOpen(false)} />}
      {selectedDay && <DayDetail dateStr={selectedDay} trades={trades} strategies={strategies} onAdd={openAdd} onEdit={openEdit} onDelete={deleteTrade} onView={setDetailTrade} onClose={() => setSelectedDay(null)} />}
      {detailTrade && <TradeDetailModal trade={detailTrade} strategies={strategies} premarkets={premarkets} onEdit={openEdit} onClose={() => setDetailTrade(null)} />}
    </div>
  );
}
```

- [ ] **Remove inline `<style>` block** from TradingJournal.jsx

- [ ] **Verify build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/TradingJournal.jsx
git commit -m "refactor: rewrite TradingJournal.jsx as thin shell"
```

---

### Task 13: Convert Components to Tailwind CSS

**Files:**
- Modify: All `src/components/*.jsx` files (~25 files)
- Add: Global CSS in `src/index.css` for styles that can't be Tailwind (animations, @keyframes)

Since the old inline `<style>` block was removed in Task 12, the app will look unstyled until components are converted.

**Strategy:** Convert component by component, starting from the shell and working inward.

- [ ] **Add global CSS for animations and leftover styles to `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #12161D;
}

html, body, #root { height: 100%; margin: 0; background: var(--bg); }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .spin { animation: none; }
}
```

- [ ] **Convert `Sidebar.jsx`** — replace CSS class names with Tailwind utility classes

Map the old CSS classes to Tailwind:
- `.sidebar` → `w-48 flex-shrink-0 bg-[#1A2029] border-r border-[#2B3242] p-5 flex flex-col gap-1`
- `.brand` → `font-mono font-semibold text-sm tracking-wide px-2 pb-4 flex items-center gap-2`
- `.brand .dot` → `w-2 h-2 rounded-full bg-accent`
- `.beta-pill` → `text-[9px] px-1.5 py-0.5 rounded-full bg-accent-dim text-accent ml-auto`
- `.nav-btn` → `flex items-center gap-2.5 px-2.5 py-2 rounded-lg border-none bg-transparent text-text-dim text-xs cursor-pointer text-left`
- `.nav-btn:hover` → `hover:bg-[#212836] hover:text-text`
- `.nav-btn.active` → `bg-accent-dim text-accent`
- `.sidebar-foot` → `mt-auto text-[11px] text-text-faint p-2 flex items-center gap-1.5`

- [ ] **Convert each component** following the same pattern. The CSS variable mappings are in `tailwind.config.js`:

```
--text → text-text
--text-dim → text-text-dim
--text-faint → text-text-faint
--surface → bg-[#1A2029]
--surface-2 → bg-[#212836]
--border → border-[#2B3242]
--accent → text-accent or bg-accent
--profit → text-profit
--loss → text-loss
```

For example, `CalendarView.jsx`:
- `.stat-strip` → `grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2.5 mb-5`
- `.stat-card` → `bg-[#1A2029] border border-[#2B3242] rounded-xl p-3`
- `.cal-head` → `flex items-center gap-2.5 mb-3.5`
- `.cal-grid` → `grid grid-cols-7 gap-1.5`
- `.cal-cell` → `aspect-[1.15] rounded-lg border border-[#2B3242] p-1.5 cursor-pointer flex flex-col justify-between bg-[#1A2029] transition-transform duration-100 hover:-translate-y-0.5 hover:border-text-faint`

- [ ] **Verify build after each converted component**

```bash
npm run build
```

- [ ] **Commit after all components converted**

```bash
git add src/
git commit -m "feat: migrate all components to Tailwind CSS"
```

---

### Task 14: Enhance Resumen + Conducta Charts

**Files:**
- Modify: `src/components/Analytics/ResumenTab.jsx`
- Modify: `src/components/Analytics/ConductaTab.jsx`

- [ ] **Update `ResumenTab.jsx`** — Add Treemap for strategy P&L

Replace the BarChart with a Treemap:

```jsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Treemap } from 'recharts';

// Add after the equity curve section:
{byStrategy.filter((s) => s.count > 0).length > 0 && (
  <div>
    <h4>P&amp;L by Strategy (Treemap)</h4>
    <ResponsiveContainer width="100%" height={250}>
      <Treemap
        data={byStrategy.filter((s) => s.count > 0)}
        dataKey="pnl"
        nameKey="name"
        stroke="#2B3242"
        fill="#D8A657"
        content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
          const pnl = payload?.pnl || 0;
          return (
            <g>
              <rect x={x} y={y} width={width} height={height}
                fill={pnl >= 0 ? `rgba(79,174,124,${0.3 + 0.5 * Math.min(1, pnl / 5000)})` : `rgba(224,104,90,${0.3 + 0.5 * Math.min(1, Math.abs(pnl) / 5000)})`}
                stroke="#2B3242" rx={4}
              />
              {width > 50 && height > 30 && (
                <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#E7E9EE" fontSize={11} fontFamily="IBM Plex Sans">
                  {payload?.name}
                </text>
              )}
            </g>
          );
        }}
      />
    </ResponsiveContainer>
  </div>
)}
```

Keep the existing LineChart and StatCards unchanged.

- [ ] **Update `ConductaTab.jsx`** — Add Donut chart for exit efficiency

Replace the exit efficiency table with a Donut chart:

```jsx
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// After the chasing stat-cards:
const effData = [
  { name: 'Miedo / Titubeo', value: behaviorStats.effGroups.fear, color: '#E0685A' },
  { name: 'Defensiva Correcta', value: behaviorStats.effGroups.defensive, color: '#D8A657' },
  { name: 'Gestión Estándar', value: behaviorStats.effGroups.standard, color: '#7FB2D9' },
  { name: 'Ejecución Óptima', value: behaviorStats.effGroups.optimal, color: '#4FAE7C' },
].filter((d) => d.value > 0);

<div>
  <h4>Eficiencia de salida (% del MFE capturado)</h4>
  <ResponsiveContainer width="100%" height={220}>
    <PieChart>
      <Pie data={effData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
        {effData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
      </Pie>
      <Tooltip contentStyle={{ background: '#1A2029', border: '1px solid #2B3242', borderRadius: 8, fontSize: 12 }} />
    </PieChart>
  </ResponsiveContainer>
  <div className="flex justify-center gap-4 mt-2 text-xs text-text-dim">
    {effData.map((d) => (
      <div key={d.name} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
        {d.name}: {d.value}
      </div>
    ))}
  </div>
</div>
```

Keep the coherence matrix and stop loss audit sections unchanged below the chart.

- [ ] **Verify build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/Analytics/ResumenTab.jsx src/components/Analytics/ConductaTab.jsx
git commit -m "feat: enhance Resumen with Treemap, Conducta with Donut chart"
```

---

### Task 15: Enhance Cuantitativo + Rachas Charts

**Files:**
- Modify: `src/components/Analytics/CuantitativoTab.jsx`
- Modify: `src/components/Analytics/RachasTab.jsx`

- [ ] **Update `CuantitativoTab.jsx`** — Add Histogram of R-multiple distribution

```jsx
import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { fmtRatio, fmtPct, fmtMoney } from '../../utils/formatters';

// Inside the component, before the black swan section:
<div>
  <h4>Distribución de R Múltiple Realizado</h4>
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={(() => {
      const rs = trades.map((t) => {
        const d = computeTradeDiagnostics(t);
        return d.realizedR;
      }).filter((r) => r !== null && isFinite(r));
      const bins = {};
      rs.forEach((r) => {
        const bin = r < -5 ? '-5+' : r > 5 ? '5+' : `${Math.floor(r)}:${Math.floor(r) + 1}`;
        bins[bin] = (bins[bin] || 0) + 1;
      });
      return Object.entries(bins).map(([name, count]) => ({ name, count }));
    })()}>
      <CartesianGrid stroke="#2B3242" strokeDasharray="3 3" />
      <XAxis dataKey="name" stroke="#5B6478" fontSize={11} />
      <YAxis stroke="#5B6478" fontSize={11} />
      <Tooltip contentStyle={{ background: '#1A2029', border: '1px solid #2B3242', borderRadius: 8 }} />
      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
        {data.map((entry, i) => <Cell key={i} fill={entry.name.startsWith('-') ? '#E0685A' : '#4FAE7C'} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>
```

- [ ] **Update `RachasTab.jsx`** — Add sequential heatmap and session scatter plot

Add after the existing tables:

```jsx
// Sequential trade heatmap
<div>
  <h4>Secuencia de Trades (Heatmap)</h4>
  <div className="flex flex-wrap gap-0.5">
    {sortedForSequence.map((t, i) => {
      const pnl = calcPnL(t);
      const intensity = Math.min(1, Math.abs(pnl) / 500);
      return (
        <div key={i}
          className="w-6 h-6 rounded-sm cursor-help"
          title={`${t.symbol} ${fmtDateShort(t.date)}: ${fmtMoney(pnl)}`}
          style={{ background: pnl >= 0 ? `rgba(79,174,124,${0.2 + intensity * 0.8})` : `rgba(224,104,90,${0.2 + intensity * 0.8})` }}
        />
      );
    })}
  </div>
</div>
```

- [ ] **Verify build**

- [ ] **Commit**

```bash
git add src/components/Analytics/CuantitativoTab.jsx src/components/Analytics/RachasTab.jsx
git commit -m "feat: add R-multiple histogram and sequential heatmap"
```

---

### Task 16: Enhance Cruzados + Volatilidad + Premarket + Visual Charts

**Files:**
- Modify: `src/components/Analytics/CruzadosTab.jsx`
- Modify: `src/components/Analytics/VolatilidadTab.jsx`
- Modify: `src/components/Analytics/PremarketTab.jsx`
- Modify: `src/components/Analytics/VisualTab.jsx`

- [ ] **Update `CruzadosTab.jsx`** — Add grouped bar chart + radar chart

```jsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
```

Add a grouped bar chart comparing catalyst performance, and a radar chart for overall metrics.

- [ ] **Update `VolatilidadTab.jsx`** — Add scatter plot VIX vs R-multiple

```jsx
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';
```

- [ ] **Update `PremarketTab.jsx`** — Add SVG gauge component for fidelity

```jsx
// Simple SVG gauge
<div className="flex justify-center">
  <svg width="200" height="120" viewBox="0 0 200 120">
    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2B3242" strokeWidth="12" strokeLinecap="round" />
    <path d={describeArc(20, 100, 80, 0, 180 * (fidelityStats.fidelityPct / 100))}
      fill="none" stroke={fidelityStats.fidelityPct >= 60 ? '#4FAE7C' : '#E0685A'}
      strokeWidth="12" strokeLinecap="round" />
    <text x="100" y="95" textAnchor="middle" fill="#E7E9EE" fontSize="24" fontFamily="IBM Plex Mono" fontWeight="600">
      {fmtPct(fidelityStats.fidelityPct)}
    </text>
  </svg>
</div>
```

- [ ] **Update `VisualTab.jsx`** — Masonry layout for screenshots

Replace the grid with CSS columns masonry:

```jsx
<div style={{ columnCount: 3, columnGap: 12 }}>
  {candidates.map(({ t, tags }, i) => (
    <div key={i} style={{ breakInside: 'avoid', marginBottom: 12 }} className="bg-[#1A2029] border border-[#2B3242] rounded-lg overflow-hidden cursor-zoom-in"
      onClick={() => setLightbox(t.shots.trigger.img)}>
      <img src={t.shots.trigger.img} alt="" className="w-full block" />
      <div className="p-1.5 text-[10.5px] text-text-dim flex flex-wrap gap-1">
        <span>{t.symbol} · {fmtDateShort(t.date)}</span>
        {tags.map((tag, j) => <span key={j} className="px-1.5 py-0.5 rounded-full bg-loss-dim text-loss text-[9px]">{tag}</span>)}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Verify build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/Analytics/
git commit -m "feat: enhance analytics charts (grouped bar, scatter, gauge, masonry)"
```

---

### Task 17: Final Polish and Verification

**Files:**
- All modified files

- [ ] **Run full build**

```bash
npm run build
```
Expected: Build succeeds with no errors. Any chunk size warnings (500 kB) are OK but note them.

- [ ] **Run dev server and smoke test**

```bash
npm run dev
```
Open `http://localhost:5173`. Verify:
- Sidebar navigation works between all tabs
- Calendar loads and shows correct dates
- Can open/close trade form
- Pre-market panel renders
- Analytics tabs render without errors

- [ ] **Fix any remaining CSS issues**

Look for unstyled elements. The old inline CSS classes (`.stat-card`, `.cal-cell`, `.modal-card`, etc.) should all be replaced with Tailwind equivalents. Fix any that were missed.

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: final polish and verification of trading journal redesign"
```

---

## Self-Review Checklist

- [ ] All spec requirements mapped to tasks? Yes — Layer 1 (Tasks 1-12), Layer 2 (Task 13), Layer 3 (Tasks 14-16), verification (Task 17)
- [ ] No placeholders, TODOs, or TBDs? All code is explicit.
- [ ] Type/name consistency? `useJournal` hook, `calcPnL`, `computeTradeDiagnostics` — all match original names.
