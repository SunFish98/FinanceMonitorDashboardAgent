/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dashboard-bg': '#0a0e1a',
        'dashboard-card': '#0f1629',
        'dashboard-card-alt': '#131d35',
        'dashboard-border': '#1e2d4a',
        'dashboard-border-light': '#2a3f63',
        'accent-green': '#00d4aa',
        'accent-red': '#ff4d6d',
        'accent-yellow': '#ffd60a',
        'accent-blue': '#4d9fff',
        'accent-gold': '#f59e0b',
        'text-primary': '#e8eaf0',
        'text-secondary': '#8892b0',
        'text-muted': '#4a5568',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
