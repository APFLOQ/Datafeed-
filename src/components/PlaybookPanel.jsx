import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

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
