/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // React Native Paper MD3 カラーパレット
        primary: {
          DEFAULT: "#6750A4",
          container: "#EADDFF",
        },
        secondary: {
          DEFAULT: "#625B71",
          container: "#E8DEF8",
        },
        tertiary: {
          DEFAULT: "#7D5260",
          container: "#FFD8E4",
        },
        error: {
          DEFAULT: "#B3261E",
          container: "#F9DEDC",
        },
        surface: {
          DEFAULT: "#FFFBFE",
          variant: "#E7E0EC",
        },
        background: "#FFFBFE",
        outline: {
          DEFAULT: "#79747E",
          variant: "#CAC4D0",
        },
      },
    },
  },
  plugins: [],
};
