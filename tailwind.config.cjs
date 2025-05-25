/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './.svelte-kit/**/*.{html,js,svelte,ts}' // Add this line
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#fff8f1' // Optional: for your custom color
      }
    },
  },
  plugins: [],
}