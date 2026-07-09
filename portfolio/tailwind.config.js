/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./frontend/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        emerald: {
          DEFAULT: "rgb(var(--color-emerald) / <alpha-value>)",
          soft: "rgb(var(--color-emerald-soft) / <alpha-value>)",
          deep: "rgb(var(--color-emerald-deep) / <alpha-value>)",
        },
        gold: "rgb(var(--color-gold) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-jakarta)", "sans-serif"],
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        "glass-lg": "var(--shadow-glass-lg)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "ping-slow": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.6)", opacity: "0" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "50%": { transform: "translate(20px, -30px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "ping-slow": "ping-slow 2.4s cubic-bezier(0,0,0.2,1) infinite",
        drift: "drift 12s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};
