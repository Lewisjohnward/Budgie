/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xxs: "340px", // min-width
        xs: "540px", // min-width
      },
    },
  },
  plugins: [],
}; // tailwind.config.js
