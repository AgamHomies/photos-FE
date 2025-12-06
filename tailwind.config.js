/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: '#1a1a1a',
        secondary: '#4b5563',
        accent: '#3b82f6',
        background: '#f8fafc',
        lightgray: '#e2e8f0',
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        "fade-in-up": {
            "0%": {
                opacity: "0",
                transform: "translate(-50%, 20px)"
            },
            "100%": {
                opacity: "1",
                transform: "translate(-50%, 0)"
            }
        }
      },
      animation: {
        blob: "blob 7s infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
}