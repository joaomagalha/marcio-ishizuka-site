/** Usado só pelo build (npm run build:css) — não é carregado no navegador. */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        ink: '#030303',
        paper: '#d4d4d4',
        // Acento da página "semente" (produto de entrada, tom agressivo/impulso),
        // trocado de laranja pra creme a pedido do João em 25/08/2026.
        ember: '#F0E6D2',
        emberDark: '#D8C7A3',
        // 2ª cor de acento (31/08/2026): vermelhão japonês (朱). O creme é o
        // tom calmo/superfície; o vermelhão é a cor "quente" — CTA, urgência,
        // 1 número de destaque por seção. Amarra no universo Japão da marca.
        zhu: '#E23B2E',
        zhuDark: '#C22E22',
        surface0: '#0A0A0A',
        surface1: '#141210',
        creamInk: '#17120E',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
