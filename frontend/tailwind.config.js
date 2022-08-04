/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        faktum: ['Faktum'],
        pt_root: ['PT_Root'],
      },
    },
  },
  plugins: [],
};
