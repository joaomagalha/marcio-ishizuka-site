/* Tela de carregamento "ninja".
   Progresso REAL (não é barra falsa): mede marcos de verdade do carregamento e só
   libera o site quando window.load dispara, ou seja, depois que todos os recursos
   não-lazy terminaram. A saída é um corte de katana que parte a tela em duas. */
(function () {
  const root = document.documentElement;
  const el = document.getElementById('preloader');

  // Sem o overlay no HTML não há nada a fazer, mas ainda assim precisamos liberar
  // as animações da hero, que ficam pausadas enquanto .is-preloading estiver ligada.
  if (!el) {
    root.classList.remove('is-preloading');
    return;
  }

  const fill = el.querySelector('.preloader-bar-fill');
  const pctEl = el.querySelector('.preloader-pct');
  const phraseEl = el.querySelector('.preloader-phrase');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tempo mínimo em tela: evita o "flash" feio quando tudo já está em cache e o
  // carregamento leva 200ms. Sem isso a tela pisca e parece bug.
  const MIN_MS = reduced ? 0 : 900;
  // Trava de segurança: se algum recurso externo travar (CDN fora do ar, rede ruim),
  // o site abre assim mesmo. Fica abaixo do failsafe de 8s que está no CSS.
  const HARD_MS = 7500;
  const t0 = performance.now();

  // Pesos aproximados de cada etapa real do carregamento.
  const WEIGHTS = { dom: 15, fonts: 25, hero: 25, load: 35 };
  const done = { dom: false, fonts: false, hero: false, load: false };

  const phrases = ['Ajustando a luz', 'Enquadrando a cena', 'Afiando os detalhes', 'Quase lá'];
  let phraseTimer = null;
  let shown = 0;
  let finished = false;

  function realTarget() {
    let t = 0;
    for (const key in WEIGHTS) {
      if (done[key]) t += WEIGHTS[key];
    }
    return t;
  }

  function render() {
    const elapsed = performance.now() - t0;
    // Teto por tempo: garante que a barra leve pelo menos MIN_MS pra encher, mesmo
    // que tudo carregue instantaneamente.
    const timeCeiling = MIN_MS > 0 ? (elapsed / MIN_MS) * 100 : 100;
    // Trava em 99% enquanto o window.load não dispara: nunca mostrar 100% mentindo.
    const target = Math.min(done.load ? 100 : Math.min(realTarget(), 99), timeCeiling);

    // Depois que tudo carregou de verdade, a barra corre pro fim mais rápido:
    // sem isso ela levava meio segundo só "alcançando" os 100% já conquistados.
    const ease = done.load ? 0.3 : 0.12;
    shown += (target - shown) * ease;
    if (Math.abs(target - shown) < 0.5) shown = target;

    fill.style.transform = 'scaleX(' + (shown / 100) + ')';
    pctEl.textContent = Math.round(shown) + '%';

    if (done.load && shown >= 99.5 && elapsed >= MIN_MS) {
      finish();
      return;
    }
    if (!finished) requestAnimationFrame(render);
  }

  function cleanup() {
    if (el.parentNode) el.parentNode.removeChild(el);
  }

  function finish() {
    if (finished) return;
    finished = true;

    clearInterval(phraseTimer);
    fill.style.transform = 'scaleX(1)';
    pctEl.textContent = '100%';

    if (reduced) {
      el.classList.add('is-open');
      root.classList.remove('is-preloading');
      setTimeout(cleanup, 400);
      return;
    }

    // 1) a lâmina corta a tela na diagonal
    el.classList.add('is-cut');
    // 2) as duas metades se afastam e a hero começa a animar junto com a abertura
    setTimeout(function () {
      el.classList.add('is-open');
      root.classList.remove('is-preloading');
    }, 300);
    setTimeout(cleanup, 1150);
  }

  function mark(key) {
    if (done[key]) return;
    done[key] = true;
  }

  // --- marcos reais de carregamento ---

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mark('dom'); });
  } else {
    mark('dom');
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { mark('fonts'); });
  } else {
    mark('fonts');
  }

  const heroImg = document.querySelector('#hero img');
  if (!heroImg) {
    mark('hero');
  } else if (heroImg.complete) {
    mark('hero');
  } else {
    heroImg.addEventListener('load', function () { mark('hero'); });
    heroImg.addEventListener('error', function () { mark('hero'); });
  }

  if (document.readyState === 'complete') {
    mark('load');
  } else {
    window.addEventListener('load', function () { mark('load'); });
  }

  setTimeout(function () {
    mark('load');
  }, HARD_MS);

  // --- frases rotativas ---

  if (!reduced && phraseEl) {
    let i = 0;
    phraseTimer = setInterval(function () {
      i = (i + 1) % phrases.length;
      phraseEl.style.opacity = '0';
      setTimeout(function () {
        phraseEl.textContent = phrases[i];
        phraseEl.style.opacity = '';
      }, 200);
    }, 900);
  }

  requestAnimationFrame(render);
})();
