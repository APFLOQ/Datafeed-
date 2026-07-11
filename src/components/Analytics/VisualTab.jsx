import { useState } from 'react';
import { fmtDateShort } from '../../utils/formatters';
import Lightbox from '../Modals/Lightbox';

export default function VisualTab({ candidates, filterTag, setFilterTag }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      <select className="select-tag" value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
        <option value="all">Todas las capturas de trigger</option>
        <option value="Chasing">Solo: Chasing</option>
        <option value="Salida por Miedo">Solo: Salida por Miedo</option>
        <option value="Gestión Asimétrica Negativa">Solo: Gestión Asimétrica Negativa</option>
        <option value="Trade Impulsivo">Solo: Trade Impulsivo</option>
        <option value="Coherencia Rota">Solo: Coherencia Rota</option>
      </select>
      {candidates.length === 0 ? (
        <div className="empty-state">
          <h4>Sin capturas para este filtro</h4>
          <p>Sube capturas de "Trigger" en tus trades para poder auditarlas visualmente aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {candidates.map(({ t, tags }, i) => (
            <div key={i}
              className="bg-[#1A2029] border border-[#2B3242] rounded-lg overflow-hidden cursor-zoom-in"
              onClick={() => setLightbox(t.shots.trigger.img)}>
              <img src={t.shots.trigger.img} alt="" className="w-full block" />
              <div className="p-1.5 text-[10.5px] text-text-dim flex flex-wrap gap-1">
                <span>{t.symbol} · {fmtDateShort(t.date)}</span>
                {tags.map((tag, j) => (
                  <span key={j} className="px-1.5 py-0.5 rounded-full bg-loss-dim text-loss text-[9px]">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {lightbox && (
        <Lightbox img={lightbox} note={null} label="Trigger screenshot" onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
