/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        glass: 'rgba(255, 255, 255, 0.08)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
      },
      animation: {
        'slide-down': 'slide-down 0.25s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  safelist: [
    'bg-white/5',
    'bg-white/10',
    'bg-white/20',
    'bg-black/5',
    'bg-black/10',
    'backdrop-blur-sm',
    'backdrop-blur',
    'backdrop-blur-md',
    {
      pattern: /bg-(white|black)-(5|10|20|30)/,
    },
    {
      pattern: /text-(white|black)-(50|60|70)/,
    },
    'animate-pulse-slow',
  ],

  plugins: [],
};
