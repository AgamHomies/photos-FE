/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: '#1a1a1a',
        secondary: '#4b5563',
        accent: '#3b82f6',
        background: '#f8fafc',
        lightgray: '#e2e8f0',
      }
    },
  },
  plugins: [],
}