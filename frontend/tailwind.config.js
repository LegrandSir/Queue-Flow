/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'officeq-blue': '#1F9EF9', 
        'officeq-light-blue': '#E0F2FE', // For the 'Currently Serving' background
      },
      borderRadius: {
        'officeq': '1.5rem', // Changed from 5rem to match your cards better
      }
    },
  },
  plugins: [],
}