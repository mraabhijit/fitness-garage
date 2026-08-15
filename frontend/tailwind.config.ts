import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        'garage-black': '#1A1A1A',
        'garage-dark': '#2C2C2C',
        'garage-mid': '#3D3D3D',
        'garage-chrome': '#D4AF37',
        'garage-chrome-dim': '#A88A1C',
        'garage-white': '#F0F0F0',
        'garage-muted': '#9A9A9A',

        // Semantic Status
        'status-active': '#22C55E',
        'status-expired': '#EF4444',
        'status-pending': '#F59E0B',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['6rem', { lineHeight: '1', letterSpacing: '0.02em' }],
        'display-lg': ['4rem', { lineHeight: '1.05', letterSpacing: '0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '0.02em' }],
        'display-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '0.02em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
    },
  },
  plugins: [],
};

export default config;
