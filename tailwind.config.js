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
