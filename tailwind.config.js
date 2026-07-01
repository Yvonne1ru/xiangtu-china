/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#F5F0E6", dark: "#EDE7D9" },
        field: { DEFAULT: "#6B705C", light: "#8A9A5B", dark: "#5A5F4D" },
        earth: { DEFAULT: "#A0522D", light: "#C47A4A", dark: "#8B4513" },
        ink: { DEFAULT: "#333333", light: "#555555" },
      },
      fontFamily: {
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
        kai: ['"KaiTi"', '"STKaiti"', 'serif'],
      },
    },
  },
  plugins: [],
}