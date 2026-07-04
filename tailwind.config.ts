import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a6d3a",   // Vert foncé principal (cercle logo)
          light: "#e8f5e9",     // Fond vert très léger
          50: "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#4caf50",
          500: "#2e7d32",
          600: "#1a6d3a",
          700: "#155d30",
          800: "#104d27",
          900: "#0a3d1e",
        },
        leaf: {
          DEFAULT: "#4caf50",   // Vert feuille vif (accent)
          light: "#81c784",
          dark: "#2e7d32",
        },
        earth: {
          DEFAULT: "#8B6914",   // Brun terroir (sol dans le logo)
          light: "#c4a35a",
          dark: "#5d4610",
          50: "#fdf6e3",
        },
        background: "#f5f7f5",  // Fond légèrement teinté vert
        surface: "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
