import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          elevated: 'var(--surface-elevated)',
          overlay: 'var(--surface-overlay)',
        },
        foreground: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        sui: {
          ocean: 'var(--sui-ocean)',
          'ocean-dark': 'var(--sui-ocean-dark)',
          sea: 'var(--sui-sea)',
          navy: 'var(--sui-navy)',
          midnight: 'var(--sui-midnight)',
          sky: 'var(--sui-sky)',
          mist: 'var(--sui-mist)',
          white: 'var(--sui-white)',
          gray: {
            50: 'var(--sui-gray-50)',
            100: 'var(--sui-gray-100)',
            200: 'var(--sui-gray-200)',
            300: 'var(--sui-gray-300)',
            400: 'var(--sui-gray-400)',
            500: 'var(--sui-gray-500)',
            600: 'var(--sui-gray-600)',
            700: 'var(--sui-gray-700)',
            800: 'var(--sui-gray-800)',
            900: 'var(--sui-gray-900)',
          },
          dark: 'var(--sui-dark)',
          accent: 'var(--sui-accent)',
          'accent-bright': 'var(--sui-accent-bright)',
          'accent-dim': 'var(--sui-accent-dim)',
          'accent-dark': 'var(--sui-accent-dark)',
          'accent-light': 'var(--sui-accent-light)',
          slate: 'var(--sui-slate)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Azeret Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
