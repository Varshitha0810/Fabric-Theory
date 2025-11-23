/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        peach: {
          50: '#FFF5F1',
          100: '#FFEDE7',
          200: '#FFD8C2',
          300: '#FFC3A0',
          400: '#FFB18A',
          500: '#FFA070',
          600: '#FF8A65',
          700: '#FF7554',
        },
        fttext: '#5A3E36'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
