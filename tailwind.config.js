/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#FFFFFF',
        'bg-alt': '#FAF7F2',
        'text-primary': '#333333',
        'text-secondary': '#888888',
        gold: {
          DEFAULT: '#C9A96E',
          dark: '#B08A52',
        },
        rose: {
          DEFAULT: '#E8A0AB',
          dark: '#D98497',
        },
        border: {
          light: '#E8E3DC',
        },
        success: '#2FA84F',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
        DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.06)',
        md: '0 6px 20px rgba(0, 0, 0, 0.08)',
        lg: '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        card: '12px',
      },
      maxWidth: {
        site: '1240px',
        'site-narrow': '760px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bump: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.35)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease forwards',
        slideIn: 'slideIn 0.3s ease forwards',
        bump: 'bump 0.4s ease',
      },
    },
  },
  plugins: [],
};
