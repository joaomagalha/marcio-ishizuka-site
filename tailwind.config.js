/** Usado só pelo build (npm run build:css) — não é carregado no navegador. */
module.exports = {
  content: ['./index.html', './semente.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        ink: '#030303',
        paper: '#d4d4d4',
        // Acento da página "semente" (produto de entrada, tom agressivo/impulso).
        // Deliberadamente diferente do dourado da página prime — ver
        // clientes/marcio/2026-08-25-analise-referencias-lp-semente.md.
        ember: '#F0E6D2',
        emberDark: '#D8C7A3',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
