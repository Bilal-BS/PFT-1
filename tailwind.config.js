/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors here later for 'premium' feel
        primary: '#4F46E5', // Indigo-600 example
        secondary: '#10B981', // Emerald-500 example
      }
    },
  },
  plugins: [],
}
