/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        sui: {
          ocean: '#0A1628',
          navy: '#1A2B4A',
          sky: '#4DA2FF',
          mist: '#E8F4FF',
          accent: '#6FBCFF',
        },
      },
    },
  },
  plugins: [],
};
