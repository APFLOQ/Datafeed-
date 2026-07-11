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
              <option value="">\u2014</option>
              {BIAS_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </label>
          <label className="field"><span>HVL de 90 d\u00edas</span><input type="number" step="any" value={form.hvl} onChange={(e) => set('hvl', e.target.value)} /></label>
          <label className="field"><span>LVN de confluencia</span><input type="number" step="any" value={form.lvn} onChange={(e) => set('lvn', e.target.value)} /></label>
          <label className="field"><span>POC sesi\u00f3n previa</span><input type="number" step="any" value={form.poc} onChange={(e) => set('poc', e.target.value)} /></label>
          <label className="field"><span>VIX / ATR del d\u00eda</span><input type="number" step="any" value={form.vix} onChange={(e) => set('vix', e.target.value)} /></label>
          <label className="field"><span>Estructura d\u00eda anterior</span>
            <select value={form.dayTypePrev} onChange={(e) => set('dayTypePrev', e.target.value)}>
              <option value="">\u2014</option>
              {DAY_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Inventario Overnight</span>
            <select value={form.overnightInventory} onChange={(e) => set('overnightInventory', e.target.value)}>
              <option value="">\u2014</option>
              {OVERNIGHT_INVENTORY.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
        <div className="field">
          <span>Trigger esperado de microestructura</span>
          <div className="checklist-grid">
            <label className="check-chip"><input type="checkbox" checked={!!form.expectedTriggers.absorption} onChange={() => toggleTrigger('absorption')} /> Absorci\u00f3n Pasiva en Extremos</label>
            <label className="check-chip"><input type="checkbox" checked={!!form.expectedTriggers.deltaConviction} onChange={() => toggleTrigger('deltaConviction')} /> Convicci\u00f3n en Delta tras Quiebre</label>
            <label className="check-chip"><input type="checkbox" checked={!!form.expectedTriggers.imbalance} onChange={() => toggleTrigger('imbalance')} /> Desequilibrio de Agresi\u00f3n</label>
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
