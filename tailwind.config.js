/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a', // Hijau khas pertanian
        secondary: '#0f172a', // Biru gelap untuk teks
      }
    },
  },
  plugins: [],
}