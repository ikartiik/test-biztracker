/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      spacing: {
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '18': '4.5rem',
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'slide-down': 'slide-down 0.25s ease-out',
      },
      keyframes: {
        'slide-down': {
          from: { opacity: 0, transform: 'translateY(-8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
