/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B35",
        secondary: "#2D4059",
        tertiary: "#5C6F7F",
        accent: "#FFD166",
        light: "#F9FAFB",
        dark: "#1A2639",
        beach: {
          blue: "#1C9CF6",
          sand: "#F4D58D",
          coral: "#FF8C61",
          teal: "#2EC4B6",
          sunset: "#FF5E5B",
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-bg.jpg')",
        'beach-gradient': 'linear-gradient(to right, #FF6B35, #FFD166)',
        'sunset-gradient': 'linear-gradient(to bottom, #FF6B35, #2EC4B6)',
      },
      boxShadow: {
        'beach': '0 4px 14px 0 rgba(255, 107, 53, 0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
} 