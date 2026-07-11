/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
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
        // shadcn CSS variable tokens
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
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
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
