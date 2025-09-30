/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta personalizada basada en tus colores
        dark: {
          900: '#300232', // RGB(48,2,50)
          800: '#3F4A51', // RGB(63,74,81)
          700: '#466F60', // RGB(70,111,96)
          600: '#1a1a1a',
          500: '#2a2a2a',
          400: '#3a3a3a',
        },
        nature: {
          600: '#82AA65', // RGB(130,170,101)
          500: '#ADD468', // RGB(173,212,104)
          400: '#b8e6b8',
          300: '#c8f2c8',
          200: '#e8f5e8',
        },
        accent: {
          green: '#00ff88',
          lime: '#32cd32',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'bounce-soft': 'bounceSoft 2s infinite',
        'leaf-sway': 'leafSway 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'pulse-green': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .8 },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(-5%)' },
        },
        leafSway: {
          '0%, 100%': { transform: 'rotate(-5deg) translateX(0px)' },
          '50%': { transform: 'rotate(5deg) translateX(10px)' },
        },
      },
      backgroundImage: {
        'gradient-nature': 'linear-gradient(135deg, #300232 0%, #466F60 50%, #82AA65 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      }
    },
  },
  plugins: [],
}