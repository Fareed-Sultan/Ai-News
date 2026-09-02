/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          crimson: "#E11D48",    // Sharp Breaking News Red
          ruby: "#BE123C",
          blue: "#2563EB",       // Electric Cobalt Blue
          cyan: "#0284C7",       // Vibrant Cyan / Tech
          amber: "#D97706",      // Sharp Market Gold / Amber
          emerald: "#059669",    // Live / Sports Emerald
          purple: "#7C3AED",     // Culture / Insight Violet
          dark: "#080C14",       // Deep Obsidian Base
          darkCard: "#0F172A",   // High-contrast Card Surface
          darkBorder: "rgba(255, 255, 255, 0.08)",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#080C14",
        },
      },
      fontFamily: {
        display: [
          "Outfit",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: [
          "Newsreader",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        body: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "glow-red": "0 0 20px -5px rgba(225, 29, 72, 0.4)",
        "glow-blue": "0 0 20px -5px rgba(37, 99, 235, 0.4)",
        "glow-amber": "0 0 20px -5px rgba(217, 119, 6, 0.4)",
        "news-card": "0 4px 20px -4px rgba(0, 0, 0, 0.06), 0 2px 6px -2px rgba(0, 0, 0, 0.04)",
        "news-card-dark": "0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 2px 10px -2px rgba(0, 0, 0, 0.4)",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(0.85)" },
        },
        beacon: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      animation: {
        ticker: "ticker 35s linear infinite",
        shimmer: "shimmer 1.6s infinite linear",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
        beacon: "beacon 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};

