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
