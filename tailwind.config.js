/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paleta-gris-claro': '#f5f5f5',
        'paleta-blanco': '#ffffff',
        'paleta-azul-oscuro': '#333366',
        'paleta-azul-claro': '#4F69C6',
        'paleta-azul-hover': '#3B51A3',
        'paleta-verde-claro': '#32A287',
        'paleta-verde-hover': '#28826D',
        'paleta-amarillo-claro': '#FFD700', 
        'paleta-amarillo-hover': '#FFC700', 
      },
    },
  },
  plugins: [],
}
// tailwind.config.js

