import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { uid } from '../utils/formatters';
import { DEFAULT_STRATEGIES, STRATEGY_COLORS } from '../utils/constants';

function calcStats(trades) {
  const total = trades.length;
  if (total === 0) return { count: 0, totalPnL: 0, winRate: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, sharpe: 0, sortino: 0 };
  const wins = trades.filter((t) => {
    const entry = Number(t.entry_price);
    const exit = Number(t.exit_price);
    const qty = Number(t.quantity);
    const dir = t.direction === 'short' ? -1 : 1;
    return (exit - entry) * qty * dir > 0;
  });
  const losses = trades.filter((t) => {
    const entry = Number(t.entry_price);
    const exit = Number(t.exit_price);
    const qty = Number(t.quantity);
    const dir = t.direction === 'short' ? -1 : 1;
    return (exit - entry) * qty * dir <= 0;
  });
  const totalPnL = trades.reduce((sum, t) => {
    const entry = Number(t.entry_price);
    const exit = Number(t.exit_price);
    const qty = Number(t.quantity);
    const dir = t.direction === 'short' ? -1 : 1;
    return sum + (exit - entry) * qty * dir;
  }, 0);
  const avgWin = wins.length ? wins.reduce((s, t) => {
    const entry = Number(t.entry_price);
    const exit = Number(t.exit_price);
    const qty = Number(t.quantity);
    const dir = t.direction === 'short' ? -1 : 1;
    return s + (exit - entry) * qty * dir;
  }, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => {
    const entry = Number(t.entry_price);
    const exit = Number(t.exit_price);
    const qty = Number(t.quantity);
    const dir = t.direction === 'short' ? -1 : 1;
    return s + Math.abs((exit - entry) * qty * dir);
  }, 0) / losses.length : 0;
  const winRate = (wins.length / total) * 100;
  const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : avgWin > 0 ? Infinity : 0;

  return { count: total, totalPnL, winRate, profitFactor, avgWin, avgLoss, sharpe: 0, sortino: 0 };
}

export function useJournal() {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [premarkets, setPremarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [tradesRes, strategiesRes, premarketsRes] = await Promise.all([
        supabase.from('trades').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('strategies').select('*').eq('user_id', user.id).order('name'),
        supabase.from('premarkets').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);
      if (tradesRes.data) setTrades(tradesRes.data);
      if (strategiesRes.data && strategiesRes.data.length > 0) setStrategies(strategiesRes.data);
      else setStrategies(DEFAULT_STRATEGIES);
      if (premarketsRes.data) setPremarkets(premarketsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const saveTrade = async (data) => {
    setSaving(true);
    setSaveError('');
    try {
      const record = {
        user_id: user.id,
        date: data.date,
        symbol: data.symbol,
        direction: data.direction,
        entry_price: Number(data.entryPrice) || Number(data.entry_price) || 0,
        exit_price: Number(data.exitPrice) || Number(data.exit_price) || 0,
        quantity: Number(data.quantity) || 0,
        strategy: data.strategy || null,
        tags: data.tags || [],
        notes: data.notes || null,
        screenshot_url: data.screenshot_url || data.screenshotUrl || null,
        vix: data.vix ? Number(data.vix) : null,
        inventory: data.inventory || data.inv || null,
        catalyst: data.catalyst || null,
        bias: data.bias || null,
        market_profile: data.market_profile || data.marketProfile || null,
        tactic: data.tactic || null,
        category: data.category || null,
        session: data.session || null,
        risked: data.risked ? Number(data.risked) : null,
        fee: data.fee ? Number(data.fee) : null,
        result: data.result || null,
      };
      if (data.id && !data.id.startsWith('temp_')) {
        await supabase.from('trades').update(record).eq('id', data.id);
      } else {
        await supabase.from('trades').insert(record);
      }
      await fetchData();
    } catch (err) {
      setSaveError('Could not save trade.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteTrade = async (id) => {
    try {
      await supabase.from('trades').delete().eq('id', id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete trade:', err);
    }
  };

  const addStrategy = async (name) => {
    if (!name.trim()) return;
    try {
      await supabase.from('strategies').insert({ user_id: user.id, name: name.trim() });
      await fetchData();
    } catch (err) {
      console.error('Failed to add strategy:', err);
    }
  };

  const deleteStrategy = async (id) => {
    try {
      await supabase.from('strategies').delete().eq('id', id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete strategy:', err);
    }
  };

  const savePremarket = async (data) => {
    try {
      const record = {
        user_id: user.id,
        date: data.date,
        symbol: data.symbol,
        bias: data.bias,
        structure_notes: data.structure_notes || data.structureNotes || null,
        key_levels: data.key_levels || data.keyLevels || [],
        vix_notes: data.vix_notes || data.vixNotes || null,
        plan_summary: data.plan_summary || data.planSummary || null,
        fidelity_score: data.fidelity_score || data.fidelityScore || null,
      };
      if (data.id && !data.id.startsWith('temp_')) {
        await supabase.from('premarkets').update(record).eq('id', data.id);
      } else {
        await supabase.from('premarkets').insert(record);
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to save premarket:', err);
    }
  };

  const deletePremarket = async (id) => {
    try {
      await supabase.from('premarkets').delete().eq('id', id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete premarket:', err);
    }
  };

  const stats = calcStats(trades);

  return {
    trades, strategies, premarkets,
    loading, saving, saveError,
    saveTrade, deleteTrade,
    addStrategy, deleteStrategy,
    savePremarket, deletePremarket,
    stats,
  };
}
