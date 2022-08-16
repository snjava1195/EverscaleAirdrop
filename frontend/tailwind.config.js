/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '414px',
      // => @media (min-width: 640px) { ... }

      md: '640px',
      // => @media (min-width: 768px) { ... }

      lg: '960px',
      // => @media (min-width: 1024px) { ... }

      xl: '1200px',
      // => @media (min-width: 1280px) { ... }
    },
    extend: {
      fontFamily: {
        faktum: ['Faktum'],
        pt_root: ['PT_Root'],
      },
    },
  },
  plugins: [],
};
