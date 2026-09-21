import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFCF7',
          100: '#FAF7F0',
          200: '#F4EFE6',
          300: '#EBE3D5',
          400: '#DFD4C0',
          DEFAULT: '#FAF7F0',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          500: '#737373',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          DEFAULT: '#1C1917',
        },
        terracotta: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          DEFAULT: '#C2410C',
        },
        sage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          DEFAULT: '#0F766E',
        },
        ocean: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          DEFAULT: '#0369A1',
        },
        sand: {
          100: '#F5F2EB',
          200: '#EBE5D8',
          300: '#DFD6C2',
          400: '#CEBE9F',
          DEFAULT: '#E8E1D3',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'journal': '0 4px 20px -2px rgba(28, 25, 23, 0.06), 0 2px 6px -1px rgba(28, 25, 23, 0.04)',
        'journal-lg': '0 12px 32px -4px rgba(28, 25, 23, 0.08), 0 4px 12px -2px rgba(28, 25, 23, 0.04)',
        'journal-hover': '0 16px 36px -6px rgba(28, 25, 23, 0.12), 0 6px 16px -2px rgba(28, 25, 23, 0.06)',
      },
      borderRadius: {
        'journal': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
