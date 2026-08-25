/* Timeline do Cronograma — progresso ligado ao scroll, SEM pin.
   Versão anterior usava GSAP ScrollTrigger com pin (seção travada na tela
   enquanto a timeline rolava por dentro). Quebrou em uso real: o pin vira
   position:fixed + spacer, e no WebKit o atraso do evento de scroll fazia a
   seção "flutuar" por cima da seção anterior — mesmo problema de sempre neste
   site com truque de scroll sofisticado (ver histórico no css/style.css).
   Agora: a seção fica no fluxo normal da página e só duas coisas mudam ao
   rolar, a altura da linha dourada (--progress) e o estado de cada passo
   (idle/active/done). Sem fixed, sem spacer, sem CDN — impossível sobrepor.
   Funciona igual em desktop e mobile; sem JS ou com "reduzir movimento",
   o CSS mostra tudo concluído e legível (.cronograma-section:not(.is-ready)). */
(function () {
  'use strict';

  const section = document.getElementById('cronograma');
  if (!section) return;

  const timeline = section.querySelector('[data-cronograma]');
  const steps = Array.prototype.slice.call(section.querySelectorAll('.cronograma-step'));
  const nodes = steps.map(function (s) { return s.querySelector('.cronograma-node'); });
  if (!timeline || !steps.length || nodes.indexOf(null) !== -1) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  section.classList.add('is-ready');

  let ticking = false;

  function update() {
    ticking = false;

    // Linha de foco: um passo "acende" quando o centro do nó dele cruza 62%
    // da altura da tela (um pouco abaixo do meio: o leitor foca ali).
    const focus = window.innerHeight * 0.62;

    let reached = -1;
    const centers = nodes.map(function (n) {
      const r = n.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    for (let i = 0; i < centers.length; i++) {
      if (centers[i] <= focus) reached = i;
    }

    // Progresso contínuo da linha: interpola entre o centro do primeiro e do
    // último nó, pra linha acompanhar o scroll sem saltos.
    const first = centers[0];
    const last = centers[centers.length - 1];
    const p = last === first ? 1 : Math.max(0, Math.min(1, (focus - first) / (last - first)));
    timeline.style.setProperty('--progress', p.toFixed(4));

    const complete = reached === steps.length - 1;
    for (let i = 0; i < steps.length; i++) {
      steps[i].dataset.state =
        complete ? 'done' :
        i < reached ? 'done' :
        i === reached ? 'active' : 'idle';
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
