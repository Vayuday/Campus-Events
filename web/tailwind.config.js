/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#b9d1ff",
          300: "#8fb3ff",
          400: "#5e8dff",
          500: "#3b69ff",
          600: "#2950e6",
          700: "#213fb3",
          800: "#1d368f",
          900: "#1a2f74",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,.06), 0 4px 16px rgba(15,23,42,.06)",
      },
    },
  },
  plugins: [],
};
