import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        navy: {
          DEFAULT: "var(--primary-navy)",
          50: "#e6eaf0",
          100: "#c2cede",
          200: "#9ab0c9",
          300: "#7292b4",
          400: "#547da5",
          500: "#366896",
          600: "#2f5f8e",
          700: "#265283",
          800: "#1e4678",
          900: "var(--primary-navy)",
        },
        teal: {
          DEFAULT: "var(--primary-teal)",
          50: "#e6f7f6",
          100: "#c1ebe9",
          200: "#98dfdb",
          300: "#6dd2cd",
          400: "#4dc8c2",
          500: "var(--primary-teal)",
          600: "#32a49e",
          700: "#2a928d",
          800: "#23807c",
          900: "#156060",
        },
        // Semantic Colors
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        // Background & Foreground
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        hero: ["3.5rem", { lineHeight: "1.1", fontWeight: "800" }],
        "hero-mobile": ["2.5rem", { lineHeight: "1.1", fontWeight: "800" }],
      },
      borderRadius: {
        "4xl": "32px",
        "5xl": "40px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(26, 54, 93, 0.1)",
        "glass-lg": "0 10px 25px rgba(26, 54, 93, 0.1), 0 20px 40px rgba(26, 54, 93, 0.15)",
        button: "0 4px 14px rgba(56, 178, 172, 0.4)",
        "button-hover": "0 6px 20px rgba(56, 178, 172, 0.5)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "gradient-move": "gradient-move 15s ease infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "gradient-move": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
