import { ArrowRight } from 'lucide-react';

export default function Navbar({ onSignUp }) {
  return (
    <nav className="fixed top-[30px] left-1/2 -translate-x-1/2 z-50 w-fit max-w-[90vw]">
      <div className="glass rounded-[16px] px-6 py-3 flex items-center gap-8">
        <a href="/" className="font-brand text-2xl font-bold text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>
          Datafeed
        </a>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-text-dim hover:text-text transition-colors text-sm font-medium">Features</a>
          <a href="#pricing" className="text-text-dim hover:text-text transition-colors text-sm font-medium">Pricing</a>
          <a href="#docs" className="text-text-dim hover:text-text transition-colors text-sm font-medium">Docs</a>
        </div>
        <button onClick={onSignUp} className="glass-btn flex items-center gap-2 px-5 py-2 text-sm font-semibold">
          Sign Up <ArrowRight size={16} />
        </button>
      </div>
    </nav>
  );
}
