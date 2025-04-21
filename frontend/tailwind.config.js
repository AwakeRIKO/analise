/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'instagram-blue': '#0095f6',
        'instagram-darkBlue': '#00376b',
        'instagram-purple': '#8a3ab9',
        'instagram-darkPurple': '#6f2dbd',
        'instagram-pink': '#e95950',
        'instagram-yellow': '#fccc63',
        lightGray: '#f3f4f6',
        darkGray: '#4b5563'
      },
      backgroundImage: {
        'instagram-gradient': 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
} 