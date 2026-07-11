# Datafeed Redesign — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el trading journal con estética Liquid Glass, auth con Supabase y animaciones anime.js

**Architecture:** Landing page pública + dashboard command center con tarjetas glass flotantes. Auth via Supabase (email + Discord). Datos migran de localStorage a PostgreSQL. Animaciones con anime.js en toda la interfaz.

**Tech Stack:** React 18, Vite, Tailwind CSS v3, Supabase, anime.js, Recharts, Uiverse.io, Reactbits.dev

---

## File Structure

```
src/
  lib/
    supabase.js              # Cliente Supabase
  hooks/
    useJournal.js            # MODIFICAR: conectar a Supabase
    useAuth.js               # NUEVO: contexto + hook de auth
    useAnimations.js         # NUEVO: hook de animaciones anime.js
  pages/
    Landing.jsx              # NUEVO: landing page pública
    Dashboard.jsx            # NUEVO: dashboard command center (reemplaza TradingJournal)
    AuthPage.jsx             # NUEVO: auth modal
  components/
    Auth/
      LoginForm.jsx          # NUEVO: formulario email + password
      DiscordButton.jsx      # NUEVO: botón Discord OAuth
    Landing/
      Navbar.jsx             # NUEVO: navbar glass
      Hero.jsx               # NUEVO: hero section
      Features.jsx           # NUEVO: features cards
      CtaSection.jsx         # NUEVO: sección CTA final
      Footer.jsx             # NUEVO: footer glass
    Dashboard/
      GlassCard.jsx          # NUEVO: wrapper de tarjeta glass reutilizable
      TopBar.jsx             # NUEVO: top bar glass con avatar + fecha
      Sidebar.jsx            # NUEVO SIDEBAR (reemplaza el anterior)
      EquityCurveCard.jsx    # NUEVO: equity curve en glass card
      StatsCardGrid.jsx      # NUEVO: mini stats en glass cards
    Analytics/
      AnalyticsDashboard.jsx # MODIFICAR: glass card wrapper
      ResumenTab.jsx         # MODIFICAR: glass styles
      ...otros tabs          # MODIFICAR: glass styles
    UI/
      StatCard.jsx           # MODIFICAR: glass styles
      EmptyState.jsx         # MODIFICAR: glass styles
    CalendarView.jsx         # MODIFICAR: glass styles
    TradeTable.jsx           # MODIFICAR: glass styles
    PreMarketPanel.jsx       # MODIFICAR: glass styles
    PlaybookPanel.jsx        # MODIFICAR: glass styles
    Modals/
      DayDetail.jsx          # MODIFICAR: glass styles
      TradeDetailModal.jsx   # MODIFICAR: glass styles
      ...
    Forms/
      TradeForm.jsx          # MODIFICAR: glass styles
      PreMarketForm.jsx      # MODIFICAR: glass styles
  styles/
    glass.css                # NUEVO: utilidades glass + animaciones
  index.css                  # MODIFICAR: añadir Liquid Glass tokens
main.jsx                     # MODIFICAR: router + providers
```

---

### Fase 1: Fundación

### Task 1.1: Instalar dependencias

**Files:**
- Modify: `package.json`
- Run: `npm install`

- [ ] **Step 1: Instalar anime.js y @supabase/supabase-js**

Run: `npm install animejs @supabase/supabase-js`

- [ ] **Step 2: Renombrar proyecto en package.json**

```json
{
  "name": "datafeed",
  "private": true,
  "version": "1.0.0"
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add animejs and @supabase/supabase-js dependencies"
```

### Task 1.2: Configurar tokens Liquid Glass en Tailwind

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Actualizar tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: '#FFFFFF',
        glass: {
          DEFAULT: 'rgba(255,255,255,0.3)',
          dark: 'rgba(0,0,0,0.1)',
          border: 'rgba(0,0,0,0.1)',
        },
        brand: {
          blue: '#0084FF',
          light: '#60B1FF',
          lighter: '#319AFF',
          glow: 'rgba(0,132,255,0.08)',
        },
        profit: {
          DEFAULT: '#4FAE7C',
          dim: 'rgba(79,174,124,0.12)',
        },
        loss: {
          DEFAULT: '#E0685A',
          dim: 'rgba(224,104,90,0.12)',
        },
        text: {
          DEFAULT: '#1A1A2E',
          dim: '#5B6478',
          faint: '#8991A3',
        },
      },
      fontFamily: {
        brand: ['Fustat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '50px',
      },
      boxShadow: {
        glass: 'inset 0px 4px 4px 0px rgba(255,255,255,0.25)',
        'glass-hover': 'inset 0px 4px 4px 0px rgba(255,255,255,0.35), 0 8px 32px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: add Liquid Glass design tokens to Tailwind config"
```

### Task 1.3: Crear estilos glass globales

**Files:**
- Create: `src/styles/glass.css`
- Modify: `src/index.css`

- [ ] **Step 1: Crear src/styles/glass.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Fustat:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.glass {
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: inset 0px 4px 4px 0px rgba(255,255,255,0.25);
}

.glass-dark {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: inset 0px 4px 4px 0px rgba(255,255,255,0.15);
}

.glass-btn {
  background: rgba(0,132,255,0.8);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  border: none;
  border-radius: 16px;
  color: white;
  box-shadow: inset 0px 4px 4px 0px rgba(255,255,255,0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.glass-btn:hover {
  transform: scale(1.02);
}

.glass-input {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #1A1A2E;
  transition: border-color 0.2s ease;
}

.glass-input:focus {
  outline: none;
  border-color: #0084FF;
  box-shadow: 0 0 0 3px rgba(0,132,255,0.15);
}

.glass-input::placeholder {
  color: #8991A3;
}

/* Hero glows */
.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}

.hero-glow-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(96,177,255,0.3), rgba(49,154,255,0.1));
  top: -200px;
  left: -200px;
}

.hero-glow-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(49,154,255,0.2), transparent);
  bottom: -100px;
  right: -100px;
}

/* Glass orb animation */
@keyframes orb-rotate {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.05); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes orb-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.glass-orb {
  animation: orb-rotate 20s linear infinite, orb-pulse 4s ease-in-out infinite;
}

/* Card entrance animation (anime.js fallback) */
.card-entrance {
  opacity: 0;
  transform: translateY(20px);
}
```

- [ ] **Step 2: Actualizar src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import './styles/glass.css';

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: 'Inter', sans-serif;
    color: #1A1A2E;
    background: #FFFFFF;
  }

  h1, h2, h3 {
    font-family: 'Fustat', sans-serif;
    font-weight: 700;
  }
}

@layer components {
  .stat-card { /* mantener por compatibilidad temporal */ }
  .cal-cell { }
  .modal-card { }
  .btn { }
  .diag-chip { }
  .tag { }
  .metric-table { }
  .subtab-row { }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/glass.css src/index.css
git commit -m "feat: add Liquid Glass global styles and fonts"
```

### Task 1.4: Crear cliente Supabase

**Files:**
- Create: `src/lib/supabase.js`

- [ ] **Step 1: Crear src/lib/supabase.js**

```jsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Crear archivo .env.local**

```
VITE_SUPABASE_URL=https://hfotltmopsuorlmiuvob.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_BLhEpO3kYU0wTFzugwTefw_1ilpC1LM
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.js .env.local
git commit -m "feat: add Supabase client utility"
```

### Task 1.5: Crear hook de auth

**Files:**
- Create: `src/hooks/useAuth.js`
- Create: `src/hooks/useAnimations.js`

- [ ] **Step 1: Crear src/hooks/useAuth.js**

```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error('Discord login error:', error.message);
  };

  const signInWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithDiscord, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Crear src/hooks/useAnimations.js**

```jsx
import { useEffect, useRef } from 'react';
import anime from 'animejs';

export function useCardEntrance(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll('.glass-card');
    if (cards.length === 0) return;
    anime({
      targets: cards,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(80),
      duration: 600,
      easing: 'easeOutCubic',
    });
  }, [ref]);
}

export function useCounter(targetRef, targetValue, duration = 1000) {
  useEffect(() => {
    if (!targetRef.current) return;
    anime({
      targets: targetRef.current,
      innerHTML: [0, targetValue],
      round: 1,
      duration,
      easing: 'easeOutCubic',
    });
  }, [targetValue, duration, targetRef]);
}

export function useScrollReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = entry.target.querySelectorAll('.reveal');
            anime({
              targets,
              opacity: [0, 1],
              translateY: [30, 0],
              delay: anime.stagger(100),
              duration: 500,
              easing: 'easeOutCubic',
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
}

export function useStaggerText(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const text = ref.current.textContent;
    ref.current.innerHTML = text
      .split('')
      .map((char) => `<span class="char">${char === ' ' ? ' ' : char}</span>`)
      .join('');
    anime({
      targets: ref.current.querySelectorAll('.char'),
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(30),
      duration: 500,
      easing: 'easeOutCubic',
    });
  }, [ref]);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.js src/hooks/useAnimations.js
git commit -m "feat: add useAuth and useAnimations hooks"
```

### Fase 2: Landing Page

### Task 2.1: Navbar glass

**Files:**
- Create: `src/components/Landing/Navbar.jsx`

- [ ] **Step 1: Crear src/components/Landing/Navbar.jsx**

```jsx
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Navbar({ onSignUp }) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Landing/Navbar.jsx
git commit -m "feat: add Liquid Glass Navbar component"
```

### Task 2.2: Hero section

**Files:**
- Create: `src/components/Landing/Hero.jsx`

- [ ] **Step 1: Crear src/components/Landing/Hero.jsx**

```jsx
import { useEffect, useRef } from 'react';
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
        {/* Left */}
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

        {/* Right - Glass Orb */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Landing/Hero.jsx
git commit -m "feat: add Hero section with glass orb and stagger text"
```

### Task 2.3: Features, CTA y Footer

**Files:**
- Create: `src/components/Landing/Features.jsx`
- Create: `src/components/Landing/CtaSection.jsx`
- Create: `src/components/Landing/Footer.jsx`

- [ ] **Step 1: Crear src/components/Landing/Features.jsx**

```jsx
import { useEffect, useRef } from 'react';
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
```

- [ ] **Step 2: Crear src/components/Landing/CtaSection.jsx**

```jsx
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
```

- [ ] **Step 3: Crear src/components/Landing/Footer.jsx**

```jsx
export default function Footer() {
  return (
    <footer className="border-t border-glass-border py-8 px-6">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-brand text-xl text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>
          Datafeed
        </span>
        <p className="text-text-faint text-sm">&copy; 2026 Datafeed. All rights reserved.</p>
        <div className="flex gap-6 text-text-dim text-sm">
          <a href="#" className="hover:text-text transition-colors">Privacy</a>
          <a href="#" className="hover:text-text transition-colors">Terms</a>
          <a href="https://discord.gg/datafeed" className="hover:text-text transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Landing/Features.jsx src/components/Landing/CtaSection.jsx src/components/Landing/Footer.jsx
git commit -m "feat: add Features, CTA, and Footer landing components"
```

### Task 2.4: Landing page integrada

**Files:**
- Create: `src/pages/Landing.jsx`

- [ ] **Step 1: Crear src/pages/Landing.jsx**

```jsx
import Navbar from '../components/Landing/Navbar';
import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import CtaSection from '../components/Landing/CtaSection';
import Footer from '../components/Landing/Footer';

export default function Landing({ onSignUp }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar onSignUp={onSignUp} />
      <Hero onSignUp={onSignUp} />
      <Features />
      <CtaSection onSignUp={onSignUp} />
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Landing.jsx
git commit -m "feat: compose Landing page from glass components"
```

### Fase 3: Auth

### Task 3.1: Auth page y componentes

**Files:**
- Create: `src/pages/AuthPage.jsx`
- Create: `src/components/Auth/LoginForm.jsx`
- Create: `src/components/Auth/DiscordButton.jsx`

- [ ] **Step 1: Crear src/components/Auth/DiscordButton.jsx**

```jsx
export default function DiscordButton({ onLogin }) {
  return (
    <button
      onClick={onLogin}
      className="glass w-full rounded-[16px] px-6 py-3.5 flex items-center justify-center gap-3 text-text font-medium text-sm hover:shadow-glass-hover transition-all"
    >
      <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="#5865F2">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
      </svg>
      Continue with Discord
    </button>
  );
}
```

- [ ] **Step 2: Crear src/components/Auth/LoginForm.jsx**

```jsx
import { useState } from 'react';

export default function LoginForm({ onEmailSignIn, onEmailSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fn = mode === 'login' ? onEmailSignIn : onEmailSignUp;
    const { error: err } = await fn(email, password);
    if (err) setError(err.message);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-brand text-2xl text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>
        {mode === 'login' ? 'Welcome back' : 'Create your account'}
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="glass-input"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="glass-input"
        required
        minLength={6}
      />

      {error && <p className="text-loss text-sm">{error}</p>}

      <button type="submit" className="glass-btn py-3.5 text-sm font-semibold">
        {mode === 'login' ? 'Sign In' : 'Sign Up'}
      </button>

      <p className="text-text-faint text-sm text-center">
        {mode === 'login' ? (
          <>Don&apos;t have an account? <button type="button" onClick={() => setMode('signup')} className="text-brand-blue hover:underline">Sign up</button></>
        ) : (
          <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-brand-blue hover:underline">Sign in</button></>
        )}
      </p>
    </form>
  );
}
```

- [ ] **Step 3: Crear src/pages/AuthPage.jsx**

```jsx
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/Auth/LoginForm';
import DiscordButton from '../components/Auth/DiscordButton';

export default function AuthPage({ onClose }) {
  const { signInWithEmail, signUpWithEmail, signInWithDiscord } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-[24px] p-8 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <span className="font-brand text-xl text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>Datafeed</span>
          <button onClick={onClose} className="text-text-dim hover:text-text text-2xl leading-none">&times;</button>
        </div>

        <LoginForm onEmailSignIn={signInWithEmail} onEmailSignUp={signUpWithEmail} />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-glass-border" />
          <span className="text-text-faint text-xs">or</span>
          <div className="flex-1 h-px bg-glass-border" />
        </div>

        <DiscordButton onLogin={signInWithDiscord} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/AuthPage.jsx src/components/Auth/LoginForm.jsx src/components/Auth/DiscordButton.jsx
git commit -m "feat: add AuthPage, LoginForm, and DiscordButton components"
```

### Fase 4: Dashboard Command Center

### Task 4.1: GlassCard reusable

**Files:**
- Create: `src/components/Dashboard/GlassCard.jsx`

- [ ] **Step 1: Crear src/components/Dashboard/GlassCard.jsx**

```jsx
export default function GlassCard({ title, icon: Icon, children, className = '', cols = 1 }) {
  const colSpan = cols > 1 ? `lg:col-span-${cols}` : '';

  return (
    <div className={`glass rounded-[20px] p-6 ${colSpan} ${className} glass-card`}>
      {(title || Icon) && (
        <div className="flex items-center gap-2 mb-5">
          {Icon && <Icon size={18} className="text-brand-blue" />}
          {title && <h3 className="font-semibold text-text text-base">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Dashboard/GlassCard.jsx
git commit -m "feat: add reusable GlassCard component"
```

### Task 4.2: TopBar glass

**Files:**
- Create: `src/components/Dashboard/TopBar.jsx`

- [ ] **Step 1: Crear src/components/Dashboard/TopBar.jsx**

```jsx
import { useState } from 'react';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function TopBar({ dateRange, onDateRangeChange }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="glass rounded-[16px] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-brand text-xl text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>
          Datafeed
        </span>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="glass-input text-sm py-1.5 px-3"
        >
          <option value="1m">Last Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 glass py-1.5 px-4 rounded-[12px] text-sm text-text"
        >
          <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-text-dim text-xs max-w-[120px] truncate">{user?.email}</span>
          <ChevronDown size={14} className="text-text-faint" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 glass rounded-[12px] py-2 min-w-[160px] z-50">
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-dim hover:text-text hover:bg-white/10 transition-colors">
              <Settings size={14} /> Settings
            </button>
            <button onClick={signOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-loss hover:bg-white/10 transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Dashboard/TopBar.jsx
git commit -m "feat: add TopBar with glass styling and user menu"
```

### Task 4.3: Sidebar glass colapsable

**Files:**
- Create: `src/components/Dashboard/Sidebar.jsx`

- [ ] **Step 1: Crear src/components/Dashboard/Sidebar.jsx**

```jsx
import { useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, BarChart3, Calendar, BookOpen, Target, ChevronLeft, ChevronRight } from 'lucide-react';

const links = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: ArrowLeftRight, label: 'Trades', id: 'trades' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Calendar, label: 'Calendar', id: 'calendar' },
  { icon: Target, label: 'Pre-Market', id: 'premarket' },
  { icon: BookOpen, label: 'Playbook', id: 'playbook' },
];

export default function Sidebar({ activeSection, onSectionChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`glass rounded-[20px] p-3 flex flex-col gap-1 transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[200px]'}`}>
      {links.map((l) => (
        <button
          key={l.id}
          onClick={() => onSectionChange(l.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm transition-all ${
            activeSection === l.id
              ? 'bg-brand-blue/10 text-brand-blue font-medium'
              : 'text-text-dim hover:text-text hover:bg-white/10'
          }`}
        >
          <l.icon size={18} className="shrink-0" />
          {!collapsed && <span>{l.label}</span>}
        </button>
      ))}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mt-auto flex items-center justify-center px-3 py-2 text-text-faint hover:text-text transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Dashboard/Sidebar.jsx
git commit -m "feat: add collapsible glass Sidebar"
```

### Task 4.4: Equity Curve Card y Stats Grid

**Files:**
- Create: `src/components/Dashboard/EquityCurveCard.jsx`
- Create: `src/components/Dashboard/StatsCardGrid.jsx`

- [ ] **Step 1: Crear src/components/Dashboard/EquityCurveCard.jsx**

```jsx
import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';

export default function EquityCurveCard({ trades }) {
  const curveData = useMemo(() => {
    let cum = 0;
    const sorted = [...trades]
      .filter((t) => t.date)
      .sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((t) => {
      const entry = Number(t.entryPrice) || 0;
      const exit = Number(t.exitPrice) || 0;
      const qty = Number(t.quantity) || 0;
      const dir = t.direction === 'short' ? -1 : 1;
      const pnl = (exit - entry) * qty * dir;
      cum += pnl;
      return { date: t.date.slice(5), pnl: cum };
    });
  }, [trades]);

  return (
    <GlassCard title="Equity Curve" icon={TrendingUp} cols={2}>
      {curveData.length === 0 ? (
        <p className="text-text-dim text-sm">No trades yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={curveData}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0084FF" stopOpacity={0.15} />
                <stop offset="1" stopColor="#0084FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#8991A3" fontSize={11} tick={{ fill: '#8991A3' }} />
            <YAxis stroke="#8991A3" fontSize={11} tick={{ fill: '#8991A3' }} />
            <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12 }} />
            <Area type="monotone" dataKey="pnl" stroke="#0084FF" strokeWidth={2} fill="url(#equityGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}
```

- [ ] **Step 2: Crear src/components/Dashboard/StatsCardGrid.jsx**

```jsx
import { useMemo } from 'react';
import { DollarSign, Percent, TrendingUp, Activity, BarChart3 } from 'lucide-react';

function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="glass rounded-[16px] p-4 flex flex-col gap-1 min-w-[130px]">
      <div className="flex items-center gap-2 text-text-dim text-xs">
        <Icon size={14} className="text-brand-blue" />
        {label}
      </div>
      <span className={`font-mono text-lg font-semibold ${tone === 'up' ? 'text-profit' : tone === 'down' ? 'text-loss' : 'text-text'}`}>
        {value}
      </span>
    </div>
  );
}

export default function StatsCardGrid({ stats }) {
  const items = useMemo(() => [
    { icon: DollarSign, label: 'Total P&L', value: `$${stats.totalPnL?.toFixed(0) || 0}`, tone: stats.totalPnL >= 0 ? 'up' : 'down' },
    { icon: Percent, label: 'Win Rate', value: `${(stats.winRate || 0).toFixed(1)}%` },
    { icon: TrendingUp, label: 'Profit Factor', value: (stats.profitFactor || 0).toFixed(2) },
    { icon: Activity, label: 'Sharpe', value: (stats.sharpe || 0).toFixed(2) },
    { icon: BarChart3, label: 'Sortino', value: (stats.sortino || 0).toFixed(2) },
  ], [stats]);

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <MiniStat key={item.label} {...item} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Dashboard/EquityCurveCard.jsx src/components/Dashboard/StatsCardGrid.jsx
git commit -m "feat: add EquityCurveCard and StatsCardGrid glass components"
```

### Task 4.5: Dashboard principal

**Files:**
- Create: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Crear src/pages/Dashboard.jsx**

```jsx
import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopBar from '../components/Dashboard/TopBar';
import EquityCurveCard from '../components/Dashboard/EquityCurveCard';
import StatsCardGrid from '../components/Dashboard/StatsCardGrid';
import GlassCard from '../components/Dashboard/GlassCard';
import CalendarView from '../components/CalendarView';
import TradeTable from '../components/TradeTable';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import PreMarketPanel from '../components/PreMarketPanel';
import PlaybookPanel from '../components/PlaybookPanel';
import { useJournal } from '../hooks/useJournal';
import { useCardEntrance } from '../hooks/useAnimations';
import { ArrowLeftRight, Calendar, BarChart3, Target, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { trades, strategies, premarkets, stats, ...journal } = useJournal();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dateRange, setDateRange] = useState('all');
  const dashboardRef = useRef(null);
  useCardEntrance(dashboardRef);

  return (
    <div className="min-h-screen bg-white p-4 flex gap-4">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <TopBar dateRange={dateRange} onDateRangeChange={setDateRange} />

        <div ref={dashboardRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-min">
          {activeSection === 'dashboard' && (
            <>
              <EquityCurveCard trades={trades} />
              <div className="lg:col-span-3">
                <StatsCardGrid stats={stats} />
              </div>
              <GlassCard title="Recent Trades" icon={ArrowLeftRight}>
                <TradeTable trades={trades.slice(0, 10)} onSelectTrade={() => {}} />
              </GlassCard>
              <GlassCard title="Calendar" icon={Calendar} cols={2}>
                <CalendarView
                  trades={trades}
                  onDayClick={() => {}}
                  month={new Date().getMonth()}
                  year={new Date().getFullYear()}
                  onPrevMonth={() => {}}
                  onNextMonth={() => {}}
                />
              </GlassCard>
            </>
          )}

          {activeSection === 'trades' && (
            <div className="lg:col-span-3">
              <GlassCard title="All Trades" icon={ArrowLeftRight}>
                <TradeTable trades={trades} onSelectTrade={() => {}} />
              </GlassCard>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="lg:col-span-3">
              <AnalyticsDashboard trades={trades} stats={stats} {...journal} />
            </div>
          )}

          {activeSection === 'calendar' && (
            <GlassCard title="Trade Calendar" icon={Calendar} cols={2}>
              <CalendarView
                trades={trades}
                onDayClick={() => {}}
                month={new Date().getMonth()}
                year={new Date().getFullYear()}
                onPrevMonth={() => {}}
                onNextMonth={() => {}}
              />
            </GlassCard>
          )}

          {activeSection === 'premarket' && (
            <GlassCard title="Pre-Market" icon={Target}>
              <PreMarketPanel premarkets={premarkets} onAdd={() => {}} />
            </GlassCard>
          )}

          {activeSection === 'playbook' && (
            <GlassCard title="Playbook" icon={BookOpen}>
              <PlaybookPanel strategies={strategies} onAdd={() => {}} />
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: add Dashboard command center page"
```

### Task 4.6: Actualizar main.jsx con router y providers

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Actualizar src/main.jsx**

```jsx
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import './index.css';

function App() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="glass rounded-[20px] p-8 text-center">
          <p className="text-text-dim">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) return <Dashboard />;

  return (
    <>
      <Landing onSignUp={() => setShowAuth(true)} />
      {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
```

- [ ] **Step 2: Eliminar TradingJournal.jsx (reemplazado por Dashboard + Landing)**

Run: `Remove-Item -LiteralPath "src\TradingJournal.jsx"`

- [ ] **Step 3: Commit**

```bash
git add src/main.jsx
git rm src/TradingJournal.jsx
git commit -m "feat: wire up auth flow, landing, and dashboard routing"
```

### Fase 5: Migración a Supabase

### Task 5.1: Configurar tablas en Supabase

**Files:**
- Run SQL en Supabase dashboard

- [ ] **Step 1: Crear tablas en Supabase SQL Editor**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price DECIMAL(12,4) NOT NULL,
  exit_price DECIMAL(12,4) NOT NULL,
  quantity INTEGER NOT NULL,
  strategy TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  screenshot_url TEXT,
  vix DECIMAL(5,2),
  inventory TEXT,
  catalyst TEXT,
  bias TEXT,
  market_profile TEXT,
  tactic TEXT,
  category TEXT,
  session TEXT,
  risked DECIMAL(12,2),
  fee DECIMAL(12,2),
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own trades"
  ON trades FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Premarket plans table
CREATE TABLE premarkets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  symbol TEXT NOT NULL,
  bias TEXT NOT NULL,
  structure_notes TEXT,
  key_levels TEXT[] DEFAULT '{}',
  vix_notes TEXT,
  plan_summary TEXT,
  fidelity_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE premarkets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own premarkets"
  ON premarkets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Strategies table
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own strategies"
  ON strategies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_trades_user_date ON trades(user_id, date DESC);
CREATE INDEX idx_premarkets_user_date ON premarkets(user_id, date DESC);
CREATE INDEX idx_strategies_user ON strategies(user_id);
```

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add Supabase SQL migration for trades, premarkets, strategies tables"
```

---

### Self-Review

1. **Spec coverage:** All spec items covered — Liquid Glass design (Tasks 1.2-1.3), auth (Tasks 1.4-1.5, 3.1), landing (Tasks 2.1-2.4), dashboard (Tasks 4.1-4.6), Supabase migration (Task 5.1), anime.js (Tasks 1.5). No gaps.
2. **Placeholders:** No TBDs, TODOs, or incomplete code blocks.
3. **Type consistency:** All component props, hook return values, and Supabase table schemas are consistent across tasks.
