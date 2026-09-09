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
          crimson: "#FF1053",    // Sharp Hyper Crimson / Breaking Red
          ruby: "#E11D48",
          blue: "#0066FF",       // Sharp Electric Cobalt
          cyan: "#00E5FF",       // Neon Cyan / High Tech
          amber: "#FFB703",      // Radiant Sunburst Gold / Markets
          emerald: "#00E599",    // Vivid Cyber Mint / Live Sports
          purple: "#9333EA",     // Vivid Violet / Culture
          obsidian: "#060913",   // Deep obsidian space base
          cardDark: "#0B1120",   // High-contrast deep card
          cardDarkHover: "#111C35",
          borderDark: "rgba(255, 255, 255, 0.12)",
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
          950: "#060913",
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
        "glow-crimson": "0 0 25px -4px rgba(255, 16, 83, 0.55)",
        "glow-blue": "0 0 25px -4px rgba(0, 102, 255, 0.55)",
        "glow-cyan": "0 0 25px -4px rgba(0, 229, 255, 0.55)",
        "glow-amber": "0 0 25px -4px rgba(255, 183, 3, 0.55)",
        "glow-emerald": "0 0 25px -4px rgba(0, 229, 153, 0.55)",
        "news-card": "0 6px 24px -4px rgba(0, 0, 0, 0.07), 0 2px 8px -2px rgba(0, 0, 0, 0.04)",
        "news-card-dark": "0 10px 35px -5px rgba(0, 0, 0, 0.7), 0 4px 14px -3px rgba(0, 0, 0, 0.5)",
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
          "0%": { transform: "scale(1)", opacity: "0.9" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
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
