/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#FDF8F0',
        'bg-secondary': '#F5EDE3',
        'text-primary': '#3C2415',
        'text-secondary': '#6B4F3A',
        gold: {
          DEFAULT: '#C9A96E',
          dark: '#B08A52',
        },
        rose: {
          DEFAULT: '#E8B4C0',
          dark: '#D98FA1',
        },
        'bg-dark': '#2B1810',
        'bg-dark-alt': '#241008',
        cream: '#F0E4D3',
      },
      fontFamily: {
        title: ['"Playfair Display"', 'serif'],
        body: ['Lato', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      boxShadow: {
        sm: '0 2px 10px rgba(60, 36, 21, 0.08)',
        DEFAULT: '0 2px 10px rgba(60, 36, 21, 0.08)',
        md: '0 10px 30px rgba(60, 36, 21, 0.12)',
        lg: '0 20px 50px rgba(60, 36, 21, 0.18)',
      },
      borderRadius: {
        site: '18px',
      },
      maxWidth: {
        site: '1240px',
        'site-narrow': '760px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scrollHint: {
          '0%': { opacity: '1', top: '8px' },
          '100%': { opacity: '0', top: '24px' },
        },
        waPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(201, 169, 110, 0.55)' },
          '70%': { boxShadow: '0 0 0 18px rgba(201, 169, 110, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(201, 169, 110, 0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.9s ease forwards',
        scrollHint: 'scrollHint 1.8s infinite',
        waPulse: 'waPulse 2.4s infinite',
      },
    },
  },
  plugins: [],
};
