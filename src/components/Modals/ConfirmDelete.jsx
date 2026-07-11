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
