/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      padding: {
        '0.25': '0.0625rem',
        '0.5': '0.125rem',
      },
    },
  },
  plugins: [],
}

