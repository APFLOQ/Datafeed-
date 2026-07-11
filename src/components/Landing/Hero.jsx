import { useRef } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { useStaggerText } from '../../hooks/useAnimations';

export default function Hero({ onSignUp }) {
  const titleRef = useRef(null);
  useStaggerText(titleRef);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden px-6">
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />
      <div className="relative z-10 max-w-[1600px] mx-auto w-full grid lg:grid-cols-2 gap-12 items-center pt-[120px]">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 text-sm text-text-dim">
            {[1,2,3,4,5].map((i) => <Star key={i} size={16} fill="#FF801E" color="#FF801E" />)}
            <span className="ml-2">Rated 4.9/5 by 2700+ traders</span>
          </div>
          <h1
            ref={titleRef}
            className="font-brand text-[75px] leading-[1.05] tracking-[-2px] text-text"
            style={{ fontFamily: 'Fustat, sans-serif' }}
          >
            Track, Analyze, Evolve
          </h1>
          <p className="text-lg text-text-dim max-w-md leading-relaxed" style={{ letterSpacing: '-0.5px' }}>
            Your institutional-grade trading journal. Track every trade, analyze your edge, and evolve your strategy with precision analytics.
          </p>
          <div className="flex gap-4">
            <button onClick={onSignUp} className="glass-btn flex items-center gap-2 px-8 py-4 text-base font-semibold">
              Get Started <ArrowRight size={18} />
            </button>
            <a href="#features" className="glass px-8 py-4 rounded-[16px] text-text font-medium text-sm flex items-center">
              Learn More
            </a>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <div className="glass-orb w-[400px] h-[400px] rounded-full relative">
            <div className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #60B1FF, #319AFF, #0084FF, #60B1FF)',
                filter: 'hue-rotate(-55deg) saturate(250%) brightness(1.2) contrast(1.1)',
                mixBlendMode: 'screen',
                WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 20%, black 80%)',
                mask: 'radial-gradient(circle at 50% 50%, transparent 20%, black 80%)',
              }}
            />
            <div className="absolute inset-[10%] rounded-full bg-white/20 backdrop-blur-[2px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
