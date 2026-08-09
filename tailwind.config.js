/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#F5F1EA',
        'dark-text': '#1C2B3A',
        'copper': '#B5764C',
        'warm-gray': '#D8CFC0',
        'card-bg': '#FDFBF7',
      },
      fontFamily: {
        'sans': ['Cairo', 'Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
