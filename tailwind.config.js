/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0faf0",
          100: "#dcf5dc",
          200: "#b8eab8",
          300: "#86d886",
          400: "#4fc44f",
          500: "#2da82d",
          600: "#228722",
          700: "#1a6b1a",
          800: "#145214",
          900: "#0d3b0d",
        },
        earth: {
          50: "#f8faf7",
          100: "#eef4ec",
          200: "#d8ebd4",
          300: "#b8d8b2",
          400: "#8cbd84",
          500: "#5a9a52",
          600: "#3d7a35",
          700: "#2d5e27",
          800: "#1e3f1a",
          900: "#112410",
        },
      },
    },
  },
  plugins: [],
};
