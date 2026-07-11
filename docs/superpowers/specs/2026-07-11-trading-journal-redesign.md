# Trading Journal Redesign — Design Spec

## Overview

Refactor the Tapeline trading journal app (Vite + React) from a single 1700+ line file with inline CSS-in-JS into a modular component architecture with Tailwind CSS and an enhanced visual analytics dashboard.

## Architecture

### Layer 1: Component Splitting

**Current state:** Everything in `src/TradingJournal.jsx` (~1700 lines)

**Target structure:**

```
src/
├── main.jsx
├── storagePolyfill.js
├── index.css                          # Tailwind directives + custom theme
├── components/
│   ├── TradingJournal.jsx             # Shell: sidebar routing + state via useJournal
│   ├── Sidebar.jsx                    # Navigation sidebar with icon buttons
│   ├── Topbar.jsx                     # Top bar: title + action buttons + sync status
│   ├── CalendarView.jsx               # Calendar grid with daily P&L
│   ├── TradeTable.jsx                 # All trades sortable table
│   ├── PreMarketPanel.jsx             # Pre-market fichas list
│   ├── PlaybookPanel.jsx              # Strategy playbook CRUD
│   ├── Analytics/
│   │   ├── AnalyticsDashboard.jsx     # Container with subtab navigation
│   │   ├── ResumenTab.jsx             # Summary stats + equity curve + P&L by strategy
│   │   ├── ConductaTab.jsx            # MAE/MFE behavior audit
│   │   ├── CuantitativoTab.jsx        # Quantitative metrics + black swan isolation
│   │   ├── RachasTab.jsx              # Revenge/overconfidence detection
│   │   ├── CruzadosTab.jsx            # Cross-filtered metrics
│   │   ├── VolatilidadTab.jsx         # VIX regime performance
│   │   ├── PremarketTab.jsx           # Plan fidelity tracking
│   │   └── VisualTab.jsx              # Screenshot review grid
│   ├── Forms/
│   │   ├── TradeForm.jsx              # Trade entry/edit modal form
│   │   └── PreMarketForm.jsx          # Pre-market entry form
│   ├── Modals/
│   │   ├── DayDetail.jsx              # Day detail with trade list
│   │   ├── TradeDetailModal.jsx       # Full trade detail view
│   │   ├── Lightbox.jsx               # Image lightbox overlay
│   │   └── ConfirmDelete.jsx          # Double-click delete button
│   └── UI/
│       ├── StatCard.jsx               # Metric display card
│       ├── ShotSlot.jsx               # Screenshot upload slot
│       └── EmptyState.jsx             # Reusable empty state placeholder
├── utils/
│   ├── constants.js                   # All constants: emotions, strategies, thresholds
│   ├── formatters.js                  # fmtMoney, fmtDateShort, fmtPct, fmtPts, fmtRatio
│   ├── calculations.js                # calcPnL, computeTradeDiagnostics, stats helpers
│   └── storage.js                     # window.storage polyfill calls
└── hooks/
    └── useJournal.js                  # Central hook: trades, strategies, premarkets state
```

**State management:** Single `useJournal` custom hook that encapsulates all state (`trades`, `strategies`, `premarkets`) and persistence logic. Components receive data and callbacks as props.

### Layer 2: Tailwind CSS Migration

**Replace** the inline `<style>{`...`}</style>` block in TradingJournal.jsx with Tailwind utility classes.

**Theme tokens** mapped from current CSS variables:

| Current CSS variable | Tailwind equivalent |
|---|---|
| `--bg: #12161D` | `bg-[#12161D]` |
| `--surface: #1A2029` | `bg-[#1A2029]` |
| `--surface-2: #212836` | `bg-[#212836]` |
| `--border: #2B3242` | `border-[#2B3242]` |
| `--text: #E7E9EE` | `text-[#E7E9EE]` |
| `--text-dim: #8991A3` | `text-[#8991A3]` |
| `--accent: #D8A657` | `text/accent-[#D8A657]` |
| `--profit: #4FAE7C` | `text-[#4FAE7C]` |
| `--loss: #E0685A` | `text-[#E0685A]` |

**Custom Tailwind theme** in `tailwind.config.js` to define these as semantic tokens.

**Each component** will use Tailwind classes directly. No CSS files per component needed. A single `index.css` with `@tailwind base; @tailwind components; @tailwind utilities;` and the custom theme variables on `:root`.

**Setup steps:**
1. `npm install -D tailwindcss @tailwindcss/vite`
2. Configure `tailwind.config.js` with custom colors from the theme
3. Add Tailwind plugin to `vite.config.js`
4. Create `src/index.css` with Tailwind directives
5. Convert components one by one

### Layer 3: Visual Analytics Dashboard

Convert text-based analytics tables to interactive charts. Each analytics subtab gets reworked:

#### Resumen Tab
- **Current:** StatCards + equity line chart + P&L by strategy bar chart
- **Enhanced:** Add **Treemap** (Recharts) for P&L by strategy with color intensity

#### Conducta Tab (MAE/MFE Audit)
- **Current:** Raw counts in a table
- **Enhanced:** **Donut chart** showing exit efficiency distribution (miedo/defensiva/estándar/óptima) with red→yellow→green gradient
- Bar chart of chasing vs high-conviction entries

#### Cuantitativo Tab
- **Current:** StatCards + text table of worst 5% trades
- **Enhanced:** **Histogram** of R-multiple distribution (realized R values binned)
- Add distribution curve overlay

#### Rachas Tab (Streaks)
- **Current:** Tables of revenge/overconfidence events + session stats
- **Enhanced:** **Sequential heatmap** — each trade as a colored cell in sequence (green = win, red = loss), size proportional to |P&L|
- **Scatter plot** of entry time vs P&L (session attribution)

#### Cruzados Tab (Cross Filters)
- **Current:** Multiple small tables
- **Enhanced:** **Grouped bar chart**: PF comparison (with delta conviction vs without, mini vs micro)
- **Comparison radar chart**: win rate, PF, avg R, expectancy across dimensions

#### Volatilidad Tab
- **Current:** Single table + conditional text alert
- **Enhanced:** **Scatter plot** of VIX value vs R-multiple realized
- **Small multiples** (3 mini bar charts): one per VIX regime

#### Premarket Tab (Plan Fidelity)
- **Current:** StatCards + small table
- **Enhanced:** **Gauge component** (SVG) showing fidelity percentage 0-100%
- **Side-by-side bar chart**: PF in zone vs out of zone

#### Visual Tab
- **Current:** Grid of thumbnails with filter
- **Enhanced:** **Masonry layout** (CSS columns) with lazy loading

### New Charts Dependencies

- `recharts` (already installed) — LineChart, BarChart, Treemap, Scatter, Radar, Pie/Donut
- No new charting libraries needed

## Implementation Order

1. **Extract utils** — constants.js, formatters.js, calculations.js, storage.js (no visual change, safe first step)
2. **Create useJournal hook** — move all state + persistence logic
3. **Split UI components** — StatCard, ShotSlot, EmptyState, ConfirmDelete, Lightbox
4. **Split modals** — DayDetail, TradeDetailModal
5. **Split forms** — TradeForm, PreMarketForm
6. **Install & configure Tailwind**
7. **Split main panels** — Sidebar, Topbar, CalendarView, TradeTable, PreMarketPanel, PlaybookPanel
8. **Split Analytics tabs** — all 8 subtabs
9. **Rewrite TradingJournal.jsx** as thin shell → verify everything works
10. **Convert to Tailwind classes** — component by component
11. **Enhance analytics charts** — subtab by subtab

## Testing

- App is client-only (localStorage persistence). Manual testing after each layer.
- Run `npm run build` after Layer 2 to verify no build errors.
- Run `npm run dev` to verify UI renders correctly.

## Files Modified

- `src/TradingJournal.jsx` — removed (content distributed)
- `src/main.jsx` — unchanged (entry point)
- `src/storagePolyfill.js` — adapted for new import structure
- `package.json` — add tailwindcss, @tailwindcss/vite
- `vite.config.js` — add tailwind plugin
- `index.html` — no changes needed

## Files Created

- `src/index.css`
- `tailwind.config.js`
- `src/hooks/useJournal.js`
- `src/utils/constants.js`
- `src/utils/formatters.js`
- `src/utils/calculations.js`
- `src/utils/storage.js`
- `src/components/Sidebar.jsx`
- `src/components/Topbar.jsx`
- `src/components/CalendarView.jsx`
- `src/components/TradeTable.jsx`
- `src/components/PreMarketPanel.jsx`
- `src/components/PlaybookPanel.jsx`
- `src/components/Analytics/AnalyticsDashboard.jsx`
- `src/components/Analytics/ResumenTab.jsx`
- `src/components/Analytics/ConductaTab.jsx`
- `src/components/Analytics/CuantitativoTab.jsx`
- `src/components/Analytics/RachasTab.jsx`
- `src/components/Analytics/CruzadosTab.jsx`
- `src/components/Analytics/VolatilidadTab.jsx`
- `src/components/Analytics/PremarketTab.jsx`
- `src/components/Analytics/VisualTab.jsx`
- `src/components/Forms/TradeForm.jsx`
- `src/components/Forms/PreMarketForm.jsx`
- `src/components/Modals/DayDetail.jsx`
- `src/components/Modals/TradeDetailModal.jsx`
- `src/components/Modals/Lightbox.jsx`
- `src/components/Modals/ConfirmDelete.jsx`
- `src/components/UI/StatCard.jsx`
- `src/components/UI/ShotSlot.jsx`
- `src/components/UI/EmptyState.jsx`
