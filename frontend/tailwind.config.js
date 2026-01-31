/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          foreground: '#FFFFFF',
          soft: '#A29BFE',
          100: '#E0DVF9',
          900: '#342E70'
        },
        secondary: {
          DEFAULT: '#00CEC9',
          foreground: '#FFFFFF',
          soft: '#81ECEC',
          100: '#Dffbfb'
        },
        accent: {
          DEFAULT: '#FF7675',
          foreground: '#FFFFFF',
          soft: '#FAB1A0'
        },
        background: {
          light: '#F9F9FB',
          dark: '#18181B',
          card: {
            light: '#FFFFFF',
            dark: '#27272A'
          }
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'soft': '0 8px 30px rgb(0,0,0,0.04)',
        'hover': '0 20px 40px rgb(0,0,0,0.08)',
        'card': '0 4px 20px rgb(0,0,0,0.06)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      }
    },
  },
  plugins: [],
}
