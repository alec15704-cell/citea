/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37', // Dorado para un toque elegante de belleza
        secondary: '#1A1A1A', // Negro para barberías
      }
    },
  },
  plugins: [],
}
