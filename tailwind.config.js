/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Instrument Sans", "sans-serif"], // body font (new design 2026-07-24)
        head: ["Gabarito", "sans-serif"],        // headings
      },
    },
  },
  plugins: [],
};
