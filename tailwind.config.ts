import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#DC2626",
          dark: "#991B1B",
          light: "#FCA5A5",
        },
        ink: {
          900: "#0B0B0D",
          800: "#14151A",
          700: "#1F2128",
        },
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(220, 38, 38, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
