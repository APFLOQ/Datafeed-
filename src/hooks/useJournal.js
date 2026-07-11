import { useState, useEffect } from 'react';
import { uid } from '../utils/formatters';
import { DEFAULT_STRATEGIES, STRATEGY_COLORS } from '../utils/constants';

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
