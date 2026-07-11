import { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { compressImage } from '../../utils/calculations';
import Lightbox from '../Modals/Lightbox';

export default function ShotSlot({ label, shot, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      onChange({ ...shot, img: dataUrl });
    } catch { /* ignore */ }
    finally { setUploading(false); }
  };

  return (
    <div className="shot-slot">
      <div className="shot-slot-head">
        <span>{label}</span>
        {shot.img && (
          <button type="button" className="icon-btn" onClick={() => onChange({ ...shot, img: null })}>
            <X size={12} />
          </button>
        )}
      </div>
      {shot.img ? (
        <img src={shot.img} alt={label} className="shot-thumb" onClick={() => setLightboxOpen(true)} />
      ) : (
        <button type="button" className="btn secondary shot-upload-btn" onClick={() => fileRef.current?.click()}>
          <Camera size={13} /> {uploading ? 'Procesando\u2026' : 'Subir captura'}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <textarea rows={2} className="shot-note" placeholder="Nota estructural\u2026" value={shot.note || ''} onChange={(e) => onChange({ ...shot, note: e.target.value })} />
      {lightboxOpen && <Lightbox img={shot.img} note={shot.note} label={label} onClose={() => setLightboxOpen(false)} />}
    </div>
  );
}
