/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF8",
        ink: "#14161A",
        muted: "#6B7280",
        line: "#E7E5E1",
        emerald: {
          DEFAULT: "#0F9B6E",
          soft: "#E3F3EC",
          deep: "#0B6E4F",
        },
        gold: "#C9A227",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(20, 22, 26, 0.08)",
        "glass-lg": "0 20px 60px rgba(20, 22, 26, 0.12)",
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
