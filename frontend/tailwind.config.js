/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2effd',
          100: '#e5ddfb',
          200: '#c9b8f6',
          300: '#a888ef',
          400: '#8a5ff0',
          500: '#6d3aeb',
          600: '#5b2fd6',
          700: '#4924ab',
          800: '#3b1e8a',
          900: '#2f186d',
        },
        surface: {
          light: '#ffffff',
          dark: '#0b0b0f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0, 0, 0, 0.06)',
        softDark: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}