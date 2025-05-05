/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0084C4', // Azul claro da marca
        'primary-dark': '#002E52', // Azul escuro da marca
        'secondary': '#202A36', // Azul muito escuro/quase preto
        'accent': '#0084C4', // Azul vibrante para destaques
        'divulga-blue': '#0084C4',
        'divulga-dark': '#002E52',
        'divulga-light': '#EBF6FF',
        'divulga-gray': '#EFEFEF',
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
        'divulga-gradient': 'linear-gradient(90deg, #002E52 0%, #0084C4 100%)',
        'instagram-gradient': 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
} 