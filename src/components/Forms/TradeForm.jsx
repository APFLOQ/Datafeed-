import { useState, useMemo } from 'react';
import { X, Link2, Sunrise } from 'lucide-react';
import { calcPnL, computeTradeDiagnostics } from '../../utils/calculations';
import { fmtMoney, fmtPct, fmtRatio } from '../../utils/formatters';
import {
  EMOTIONS, ORDER_FLOW_FLAGS, CLOSE_CONTEXTS, OVERNIGHT_INVENTORY,
  DAY_TYPES, ASSET_TYPES, CONTRACT_SIZES, SHOT_STAGES,
  BIAS_LABEL, EXPECTED_TRIGGER_LABEL,
} from '../../utils/constants';
import ShotSlot from '../ui/ShotSlot';

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
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleFlow = (key) => set('orderFlow', { ...form.orderFlow, [key]: !form.orderFlow[key] });
  const setShot = (stageKey, val) => set('shots', { ...form.shots, [stageKey]: val });

  const pnlPreview = calcPnL(form);
  const diag = useMemo(() => computeTradeDiagnostics(form), [form]);

  const matchedPremarket = useMemo(() => {
    if (!form.symbol || !form.date) return null;
    return premarkets.find((p) => p.date === form.date && (p.ticker || '').trim().toUpperCase() === form.symbol.trim().toUpperCase());
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
            <div className="mirror-head"><Sunrise size={14} /> Modo Espejo \u2014 Pre-Market de hoy</div>
            <p>Sesgo declarado: <strong>{BIAS_LABEL[matchedPremarket.bias] || '\u2014'}</strong> \u00b7 Trigger esperado: {Object.entries(matchedPremarket.expectedTriggers || {}).filter(([, v]) => v).map(([k]) => EXPECTED_TRIGGER_LABEL[k]).join(', ') || '\u2014'}</p>
            <p>Zonas: HVL {matchedPremarket.hvl || '\u2014'} \u00b7 LVN {matchedPremarket.lvn || '\u2014'} \u00b7 POC {matchedPremarket.poc || '\u2014'}</p>
            {form.direction && matchedPremarket.bias && matchedPremarket.bias !== 'neutral' && (
              <p className={form.direction === matchedPremarket.bias ? 'up' : 'down'}>
                {form.direction === matchedPremarket.bias
                  ? 'Este trade est\u00e1 alineado con tu sesgo matutino.'
                  : `Atenci\u00f3n: tu sesgo era ${BIAS_LABEL[matchedPremarket.bias]} y este trade es ${form.direction === 'long' ? 'Largo' : 'Corto'}.`}
              </p>
            )}
          </div>
        )}

        <div className="section-title">Datos b\u00e1sicos</div>
        <div className="form-grid">
          <label className="field"><span>Fecha</span><input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></label>
          <label className="field"><span>S\u00edmbolo</span><input placeholder="ES" value={form.symbol} onChange={(e) => set('symbol', e.target.value)} /></label>
          <label className="field"><span>Direcci\u00f3n</span>
            <select value={form.direction} onChange={(e) => set('direction', e.target.value)}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </label>
          <label className="field"><span>Size / qty</span><input type="number" step="any" value={form.size} onChange={(e) => set('size', e.target.value)} /></label>
          <label className="field"><span>Estrategia</span>
            <select value={form.strategyId} onChange={(e) => set('strategyId', e.target.value)}>
              <option value="">\u2014</option>
              {strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="field"><span>Emoci\u00f3n / estado</span>
            <select value={form.emotion} onChange={(e) => set('emotion', e.target.value)}>
              <option value="">\u2014</option>
              {EMOTIONS.map((em) => <option key={em} value={em}>{em}</option>)}
            </select>
          </label>
          <label className="field"><span>Fees</span><input type="number" step="any" value={form.fees} onChange={(e) => set('fees', e.target.value)} /></label>
        </div>

        <div className="section-title">Segmentaci\u00f3n de activo</div>
        <div className="form-grid">
          <label className="field"><span>Tipo de activo</span>
            <select value={form.assetType} onChange={(e) => set('assetType', e.target.value)}>
              {ASSET_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Tama\u00f1o del contrato</span>
            <select value={form.contractSize} onChange={(e) => set('contractSize', e.target.value)}>
              {CONTRACT_SIZES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
        </div>

        <div className="section-title">Checklist de convicci\u00f3n en Order Flow</div>
        <div className="checklist-grid">
          {ORDER_FLOW_FLAGS.map((f) => (
            <label key={f.key} className="check-chip">
              <input type="checkbox" checked={!!form.orderFlow[f.key]} onChange={() => toggleFlow(f.key)} />
              {f.label}
            </label>
          ))}
        </div>

        <div className="section-title">Auditor\u00eda MAE / MFE</div>
        <div className="form-grid">
          <label className="field"><span>Precio Planeado del Setup</span><input type="number" step="any" value={form.plannedEntryPrice} onChange={(e) => set('plannedEntryPrice', e.target.value)} /></label>
          <label className="field"><span>Precio de Entrada Real</span><input type="number" step="any" value={form.entryPrice} onChange={(e) => set('entryPrice', e.target.value)} /></label>
          <label className="field"><span>Precio de Salida Real</span><input type="number" step="any" value={form.exitPrice} onChange={(e) => set('exitPrice', e.target.value)} /></label>
          <label className="field"><span>Stop Loss Planeado</span><input type="number" step="any" value={form.stopLossPrice} onChange={(e) => set('stopLossPrice', e.target.value)} /></label>
          <label className="field"><span>Objetivo Planeado (opcional)</span><input type="number" step="any" value={form.plannedTargetPrice} onChange={(e) => set('plannedTargetPrice', e.target.value)} /></label>
          <label className="field"><span>Precio M\u00e1ximo Favorable (MFE)</span><input type="number" step="any" value={form.mfePrice} onChange={(e) => set('mfePrice', e.target.value)} /></label>
          <label className="field"><span>Precio M\u00e1ximo Adverso (MAE)</span><input type="number" step="any" value={form.maePrice} onChange={(e) => set('maePrice', e.target.value)} /></label>
          <label className="field"><span>Contexto de cierre</span>
            <select value={form.closeContext} onChange={(e) => set('closeContext', e.target.value)}>
              <option value="">\u2014</option>
              {CLOSE_CONTEXTS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Hora de entrada</span><input type="time" value={form.entryTime} onChange={(e) => set('entryTime', e.target.value)} /></label>
          <label className="field"><span>Hora de salida</span><input type="time" value={form.exitTime} onChange={(e) => set('exitTime', e.target.value)} /></label>
        </div>

        <div className="kpi-note">
          <strong>R realizado:</strong> {diag.realizedR !== null ? diag.realizedR.toFixed(2) + 'R' : '\u2014'} {diag.plannedR !== null && <>· <strong>R planeado:</strong> {diag.plannedR.toFixed(2)}R</>}<br />
          <strong>Auditor\u00eda de entrada:</strong> {diag.entryAudit || '\u2014'}<br />
          <strong>Auditor\u00eda de salida:</strong> {diag.exitEfficiency ? `${diag.exitEfficiency} (${fmtPct(diag.efficiencyPct)} del MFE)` : '\u2014'}<br />
          {diag.stopToleranceLabel && <span className="down">{diag.stopToleranceLabel} \u2014 el MFE/MAE es {fmtRatio(diag.stopToleranceRatio)}</span>}
          {diag.coherenceAlert && <div className="down" style={{ marginTop: 4 }}>{diag.coherenceAlert}</div>}
        </div>

        <div className="section-title">Contexto de mercado</div>
        <div className="form-grid">
          <label className="field"><span>Inventario Overnight</span>
            <select value={form.overnightInventory} onChange={(e) => set('overnightInventory', e.target.value)}>
              <option value="">\u2014</option>
              {OVERNIGHT_INVENTORY.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Estructura d\u00eda anterior</span>
            <select value={form.dayTypePrev} onChange={(e) => set('dayTypePrev', e.target.value)}>
              <option value="">\u2014</option>
              {DAY_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="field"><span>VIX / ATR del d\u00eda</span><input type="number" step="any" value={form.vix} onChange={(e) => set('vix', e.target.value)} /></label>
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
          <span>Video link (Loom, YouTube, Drive\u2026)</span>
          <div className="upload-row">
            <Link2 size={14} />
            <input placeholder="https://" value={form.videoLink} onChange={(e) => set('videoLink', e.target.value)} />
          </div>
        </label>

        <label className="field">
          <span>Notas \u2014 tesis, qu\u00e9 pas\u00f3, lecciones</span>
          <textarea rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="\u00bfCu\u00e1l era el setup? \u00bfSeguiste tu plan? \u00bfQu\u00e9 har\u00edas diferente?" />
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
