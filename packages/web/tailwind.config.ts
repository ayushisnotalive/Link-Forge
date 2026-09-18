import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        paper: "#000000",
        foreground: "#FFFFFF",
        white: "#FFFFFF",
        black: "#000000",
        ink: {
          DEFAULT: "#FFFFFF",
          muted: "#A1A1AA",
          subtle: "#71717A",
        },
        muted: {
          DEFAULT: "#A1A1AA",
          foreground: "#71717A",
        },
        line: "#27272A",
        border: "#27272A",
        rust: "#EF4444",
        orange: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          950: "#431407",
        },
        accent: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
          dark: "#C2410C",
          soft: "rgba(249, 115, 22, 0.12)",
        },
        primary: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
          dark: "#C2410C",
          foreground: "#FFFFFF",
          soft: "rgba(249, 115, 22, 0.12)",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        pop: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        soft: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      transitionDuration: {
        350: "350ms",
        400: "400ms",
        500: "500ms",
      },
      keyframes: {
        rowIn: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        softPop: {
          "0%": { transform: "scale(0.98)" },
          "60%": { transform: "scale(1.015)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        rowIn: "rowIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fadeIn: "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        softPop: "softPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
