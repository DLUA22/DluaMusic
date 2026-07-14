/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dlua-dark': '#121212',
        'dlua-gray': '#181818',
        'dlua-primary': '#1DB954',
      }
    },
  },
  plugins: [],
}