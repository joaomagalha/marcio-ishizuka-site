/** Usado só pelo build (npm run build:css) — não é carregado no navegador. */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        ink: '#030303',
        paper: '#d4d4d4',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
