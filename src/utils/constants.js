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
