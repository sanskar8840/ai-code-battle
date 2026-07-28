/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        ink: {
          950: "#05070D",
          900: "#0A0E1A",
          800: "#131829",
          700: "#1C2338",
          600: "#2A3350",
        },
        // Light-mode surfaces
        paper: {
          50: "#FBFAF8",
          100: "#F4F2EE",
          200: "#E8E5DE",
        },
        // Accent: rating / XP / primary CTA
        amber: {
          400: "#F7B84B",
          500: "#F5A623",
          600: "#D98A0E",
        },
        // Accent: battle / duel state
        duel: {
          400: "#9B7CF6",
          500: "#7C3AED",
          600: "#6425D0",
        },
        // Semantic
        pass: "#22C55E",
        fail: "#EF4444",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "arena-grid":
          "linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(124, 58, 237, 0.45)",
        "glow-amber": "0 0 40px -10px rgba(245, 166, 35, 0.45)",
      },
    },
  },
  plugins: [],
};
