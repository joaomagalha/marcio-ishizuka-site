    (function () {
      'use strict';

      const section = document.getElementById('cronograma');
      if (!section) return;

      const timeline = section.querySelector('[data-cronograma]');
      const stage = section.querySelector('.cronograma-stage');
      const viewport = section.querySelector('.cronograma-viewport');
      const steps = Array.prototype.slice.call(section.querySelectorAll('.cronograma-step'));
      if (!timeline || !stage || !viewport || !steps.length) return;

      const total = steps.length;
      let maxScroll = 0;
      let viewportHeight = 0;
      let stepBottoms = [];

      // Mede a janela visível (.cronograma-viewport, só embaixo do cabeçalho fixo) e a
      // borda inferior de cada passo dentro da timeline. Precisa disso porque os 6 passos
      // juntos são mais altos que uma tela — mas o passo 1 sozinho cabe tranquilo, então
      // NÃO pode começar a rolar do zero (senão corta o topo dele à toa). Só rola o
      // suficiente pra manter visível o que já foi "alcançado" até agora.
      function measure() {
        const prevTransform = timeline.style.transform;
        timeline.style.transform = 'none';
        const tlRect = timeline.getBoundingClientRect();
        viewportHeight = viewport.clientHeight;
        stepBottoms = steps.map(function (el) {
          return el.getBoundingClientRect().bottom - tlRect.top;
        });
        maxScroll = Math.max(0, timeline.scrollHeight - viewportHeight);
        timeline.style.transform = prevTransform;
      }

      function render(progress) {
        const p = Math.max(0, Math.min(1, progress));
        timeline.style.setProperty('--progress', p.toFixed(4));

        const segment = p * (total - 1);
        const idx = Math.min(total - 1, Math.floor(segment + 1e-4));
        const nextIdx = Math.min(total - 1, idx + 1);
        const frac = segment - idx;
        const bottom0 = stepBottoms[idx] || 0;
        const bottom1 = stepBottoms[nextIdx] || bottom0;
        const neededBottom = bottom0 + (bottom1 - bottom0) * frac;
        const targetY = Math.max(0, Math.min(maxScroll, neededBottom - viewportHeight));
        timeline.style.transform = 'translateY(' + (-targetY).toFixed(1) + 'px)';

        const reached = idx;
        const complete = p > 0.995;

        for (let i = 0; i < total; i++) {
          steps[i].dataset.state =
            complete ? 'done' :
            i < reached ? 'done' :
            i === reached ? 'active' : 'idle';
        }
      }

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasGSAP = window.gsap && window.ScrollTrigger;

      // Fallback estático (mobile/tablet, sem GSAP, ou "reduzir movimento"): o CSS
      // (.cronograma-section:not(.is-ready)) já mostra a timeline completa e legível.
      if (prefersReduced || !hasGSAP) return;

      gsap.registerPlugin(ScrollTrigger);

      // Distância de scroll proporcional ao nº de passos (~70vh por passo, igual ao Luminae).
      const distance = total * 70;

      // Pin só ativo em desktop (≥1024px) — em mobile/tablet o GSAP fixaria largura no
      // elemento pinado e causaria overflow horizontal, por isso o fallback estático ali.
      gsap.matchMedia().add('(min-width: 1024px)', function () {
        section.classList.add('is-ready');
        measure();
        render(0);

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: 'top 80px',
          end: '+=' + distance + '%',
          pin: stage,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) { render(self.progress); },
          onRefresh: function (self) { measure(); render(self.progress); }
        });

        return function () {
          trigger.kill();
          section.classList.remove('is-ready');
          // Limpa o transform inline (senão a timeline fica deslocada/sobrepondo
          // o cabeçalho se a janela for redimensionada de desktop pra mobile).
          timeline.style.transform = '';
          timeline.style.removeProperty('--progress');
        };
      });
    })();
