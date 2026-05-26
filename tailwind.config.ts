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
        primary: "#FF6B35",
        secondary: "#0F172A",
        tertiary: "#64748B",
        accent: "#FFD166",
        light: "#F9FAFB",
        dark: "#111827",
        ocean: "#2EC4B6",
        sand: "#F4D35E",
        coral: "#FF5E5B",
        turquoise: "#40E0D0",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-bg.jpg')",
        'pattern': "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(249, 250, 251, 0.6)), url('/images/pattern.svg')",
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};

export default config;