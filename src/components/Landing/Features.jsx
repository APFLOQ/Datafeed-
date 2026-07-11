import { useRef } from 'react';
import { TrendingUp, BarChart3, Calendar, Target } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useAnimations';

const features = [
  { icon: TrendingUp, title: 'Equity Curve', desc: 'Track your cumulative P&L with drawdown analysis and risk metrics.' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Sharpe, Sortino, Profit Factor, and convexity diagnostics.' },
  { icon: Calendar, title: 'Trade Calendar', desc: 'Visual heatmap of your trading days with daily P&L.' },
  { icon: Target, title: 'Pre-Market Planning', desc: 'Log your thesis, bias, and structural zones before each session.' },
];

export default function Features() {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  return (
    <section id="features" ref={sectionRef} className="py-24 px-6">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="font-brand text-4xl text-center mb-4 text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>
          Everything you need to trade better
        </h2>
        <p className="text-text-dim text-center mb-16 max-w-lg mx-auto">
          Institutional-grade tools designed for the retail trader who takes their craft seriously.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-[20px] p-8 reveal flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-glow flex items-center justify-center">
                <f.icon size={24} className="text-brand-blue" />
              </div>
              <h3 className="font-semibold text-lg text-text">{f.title}</h3>
              <p className="text-text-dim text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
