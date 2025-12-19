/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        primary: '#B8860B',
        secondary: '#8B6914',
        accent: '#A0826D',
        background: {
          dark: '#000000',
          light: '#FAFBFC',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#E5E5E5',
          dark: '#1F2937',
        },
      },
    },
  },
  plugins: [],
}

