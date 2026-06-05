/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf0fd',
          100: '#f9d6f9',
          200: '#f2acf2',
          300: '#e87ae8',
          400: '#d84ed8',
          500: '#c940c9',
          600: '#C040BE',
          700: '#9a309a',
          800: '#722372',
          900: '#4e184e',
          950: '#2e0d2e',
        },
      },
    },
  },
  plugins: [],
}
