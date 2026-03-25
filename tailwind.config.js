/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      colors: {
        wordchain: {
          primary: '#6C5CE7',
          'primary-light': '#A29BFE',
          secondary: '#00CEC9',
          accent: '#FD79A8',
          warning: '#FDCB6E',
          bg: '#F4EDE7',
          text: '#2D3436',
          'text-light': '#636E72',
        },
        game: {
          wordchain: '#6C5CE7',
          'wordchain-light': '#A29BFE',
          capital: '#0984E3',
          'capital-light': '#74B9FF',
          english: '#00B894',
          'english-light': '#55EFC4',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        popIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        micPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(253, 121, 168, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(253, 121, 168, 0)' },
        },
        hintGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(253, 203, 110, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(253, 203, 110, 0.6)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        pulseRing: 'pulseRing 1.5s ease-out infinite',
        popIn: 'popIn 0.3s ease-out forwards',
        slideUp: 'slideUp 0.5s ease-out forwards',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        micPulse: 'micPulse 1.5s ease-in-out infinite',
        hintGlow: 'hintGlow 2s ease-in-out infinite',
        shake: 'shake 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};
