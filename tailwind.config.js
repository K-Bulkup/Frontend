/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        base: '16px',
        sm: '14px',
        lg: '18px',
        xl: '20px',
        title: '24px',
      },
      colors: {
        primary: '#FBE081',
        secondary: '#383838',
        gray100: '#EEEEEE',
        gray200: '#D0D0D0',
        gray800: '#383838',
        black: '#090909',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
