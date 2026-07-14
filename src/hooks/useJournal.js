import { useState, useEffect } from 'react';
import { uid } from '../utils/formatters';
import { DEFAULT_STRATEGIES, STRATEGY_COLORS } from '../utils/constants';
import { sharpePoints, sortinoPoints } from '../utils/calculations';

export function useJournal() {
  const [trades, setTrades] = useState([]);
  const [strategies, setStrategies] = useState(DEFAULT_STRATEGIES);
  const [premarkets, setPremarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get('journal-trades');
        setTrades(res ? JSON.parse(res.value) : []);
      } catch { setTrades([]); }
      try {
        const res2 = await window.storage.get('journal-strategies');
        setStrategies(res2 ? JSON.parse(res2.value) : DEFAULT_STRATEGIES);
      } catch { setStrategies(DEFAULT_STRATEGIES); }
      try {
        const res3 = await window.storage.get('journal-premarkets');
        setPremarkets(res3 ? JSON.parse(res3.value) : []);
      } catch { setPremarkets([]); }
      setLoading(false);
    })();
  }, []);

  async function persistTrades(next) {
    setTrades(next);
    try { await window.storage.set('journal-trades', JSON.stringify(next)); } catch {}
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
    const color = STRATEGY_COLORS[strategies.length % STRATEGY_COLORS.length];
    persistStrategies([...strategies, { id: uid(), name: name.trim(), color }]);
  };
  const deleteStrategy = (id) => persistStrategies(strategies.filter((s) => s.id !== id));

  const savePremarket = (data) => {
    if (data.id) persistPremarkets(premarkets.map((p) => (p.id === data.id ? data : p)));
    else persistPremarkets([...premarkets, { ...data, id: uid() }]);
  };
  const deletePremarket = (id) => persistPremarkets(premarkets.filter((p) => p.id !== id));

  function calcStats(trades) {
    const total = trades.length;
    if (total === 0) return { count: 0, totalPnL: 0, winRate: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, sharpe: 0, sortino: 0 };
    const wins = trades.filter((t) => {
      const entry = Number(t.entryPrice || t.entry_price);
      const exit = Number(t.exitPrice || t.exit_price);
      const qty = Number(t.size);
      const dir = t.direction === 'short' ? -1 : 1;
      return (exit - entry) * qty * dir > 0;
    });
    const losses = trades.filter((t) => {
      const entry = Number(t.entryPrice || t.entry_price);
      const exit = Number(t.exitPrice || t.exit_price);
      const qty = Number(t.size);
      const dir = t.direction === 'short' ? -1 : 1;
      return (exit - entry) * qty * dir <= 0;
    });
    const totalPnL = trades.reduce((sum, t) => {
      const entry = Number(t.entryPrice || t.entry_price);
      const exit = Number(t.exitPrice || t.exit_price);
      const qty = Number(t.size);
      const dir = t.direction === 'short' ? -1 : 1;
      return sum + (exit - entry) * qty * dir;
    }, 0);
    const avgWin = wins.length ? wins.reduce((s, t) => {
      const entry = Number(t.entryPrice || t.entry_price);
      const exit = Number(t.exitPrice || t.exit_price);
      const qty = Number(t.size);
      const dir = t.direction === 'short' ? -1 : 1;
      return s + (exit - entry) * qty * dir;
    }, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((s, t) => {
      const entry = Number(t.entryPrice || t.entry_price);
      const exit = Number(t.exitPrice || t.exit_price);
      const qty = Number(t.size);
      const dir = t.direction === 'short' ? -1 : 1;
      return s + Math.abs((exit - entry) * qty * dir);
    }, 0) / losses.length : 0;
    const winRate = (wins.length / total) * 100;
    const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : avgWin > 0 ? Infinity : 0;
    const pnls = trades.map((t) => {
      const entry = Number(t.entryPrice || t.entry_price);
      const exit = Number(t.exitPrice || t.exit_price);
      const qty = Number(t.size);
      const dir = t.direction === 'short' ? -1 : 1;
      return (exit - entry) * qty * dir;
    });
    const sharpe = sharpePoints(pnls) ?? 0;
    const sortino = sortinoPoints(pnls) ?? 0;
    return { count: total, totalPnL, winRate, profitFactor, avgWin, avgLoss, sharpe, sortino };
  }

  return {
    trades, strategies, premarkets,
    loading,
    saveTrade, deleteTrade,
    addStrategy, deleteStrategy,
    savePremarket, deletePremarket,
    stats: calcStats(trades),
  };
}
