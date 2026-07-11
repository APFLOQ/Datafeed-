export default function CtaSection({ onSignUp }) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[800px] mx-auto glass rounded-[24px] p-12 text-center">
        <h2 className="font-brand text-3xl mb-4 text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>
          Start journaling like a pro
        </h2>
        <p className="text-text-dim mb-8 max-w-md mx-auto">
          Join hundreds of traders who have transformed their consistency with Datafeed.
        </p>
        <button onClick={onSignUp} className="glass-btn px-10 py-4 text-base font-semibold">
          Get Started Free
        </button>
      </div>
    </section>
  );
}
