/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0d14',
          2: '#111420',
          3: '#171b2b',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          hover: 'rgba(255,255,255,0.07)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          bright: 'rgba(255,255,255,0.15)',
        },
        text: {
          DEFAULT: '#eeeef2',
          dim: '#8b8fa8',
          muted: '#4a4e62',
        },
        accent: {
          DEFAULT: '#6366f1',
          dim: 'rgba(99,102,241,0.15)',
          glow: 'rgba(99,102,241,0.3)',
        },
        amber: {
          DEFAULT: '#f59e0b',
          dim: 'rgba(245,158,11,0.15)',
        },
        green: {
          DEFAULT: '#10b981',
          dim: 'rgba(16,185,129,0.15)',
        },
        red: {
          DEFAULT: '#ef4444',
          dim: 'rgba(239,68,68,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 1s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.2s ease both',
        'fade-in': 'fade-in 0.15s ease both',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}