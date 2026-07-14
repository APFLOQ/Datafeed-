export default function Loader({ label = 'Cargando' }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="loader-dots">
        <span />
        <span />
        <span />
      </div>
      {label && <span className="loader-label">{label}</span>}
    </div>
  );
}
