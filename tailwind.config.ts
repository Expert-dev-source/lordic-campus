import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 50: "#f3f5fb", 100: "#e3e8f5", 200: "#c4cde8", 300: "#97a6d2", 400: "#6577b4", 500: "#46579a", 600: "#34437c", 700: "#27335f", 800: "#1a2347", 900: "#0f1730", 950: "#080d1d" },
        gold: { 50: "#fbf7ea", 100: "#f5ecc8", 200: "#ebd994", 300: "#dfc260", 400: "#d1aa3a", 500: "#b8902a", 600: "#936f20", 700: "#6f5319" },
        paper: "#f7f5ef",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
