import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0A0F1C",
        surface: "#121B2D",
        card: "#182338",
        border: {
          DEFAULT: "#28364F",
          hover: "#2F3E56",
        },
        text: {
          primary: "#F3F5F7",
          secondary: "#C7D0DC",
          muted: "#9CA8B8",
          disabled: "#6B778C",
        },
        accent: {
          DEFAULT: "#6AA9FF",
          hover: "#4D7FD6",
          highlight: "#D4A35F",
          light: "#EBD6A3",
          dark: "#8F6B2E",
        },
        status: {
          success: "#3CAF7A",
          warning: "#E0B341",
          error: "#E06C75",
          info: "#8B7CF6",
          special: "#4EB6C1",
        },
        // reading-page themes (light / sepia) live alongside the dark app theme
        reading: {
          light: { bg: "#FFFFFF", text: "#1A1A1A" },
          sepia: { bg: "#F4ECD8", text: "#3A2E1F" },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "12px",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
