    // Sticky Header: add background color and blur on scroll
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    });

    // FAQ Accordion: only one item open at a time (fallback for browsers without <details name="">  support)
    document.querySelectorAll('#faq details[name="faq"]').forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          document.querySelectorAll('#faq details[name="faq"]').forEach((other) => {
            if (other !== item) other.open = false;
          });
        }
      });
    });

    // Flashlight Card tracking: updates mouse variables for radial hover effect
    document.querySelectorAll('.flashlight-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // Rede de segurança contra conteúdo preso invisível.
    // Os blocos começam em opacity: 0 e só aparecem quando a animação de entrada
    // roda. Se o navegador suspender essa animação no meio — acontece em navegador
    // embutido de app e em modo de baixo consumo — o texto simplesmente nunca
    // aparece. Aqui, se algum bloco continuar invisível depois do prazo, ele é
    // forçado a aparecer. Só age em quem travou: quem animou normal não é tocado.
    function resgatarSeInvisivel(el, prazoMs) {
      setTimeout(() => {
        if (parseFloat(getComputedStyle(el).opacity) < 0.9) {
          el.classList.add('motion-forced');
        }
      }, prazoMs);
    }

    // IntersectionObserver: Triggers animations when blocks are within viewport
    if ('IntersectionObserver' in window) {
      const motionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            motionObserver.unobserve(entry.target);
            resgatarSeInvisivel(entry.target, 1500);
          }
        });
      }, {
        // threshold 0.2 exigia que 20% do bloco já estivesse na tela pra só então
        // começar a animação: somado à duração dela, o conteúdo levava mais de 1s
        // pra aparecer depois de entrar no campo de visão. Agora dispara assim que
        // encosta na viewport, e o rootMargin adianta um pouco mais, então o bloco
        // já chega animado em vez de animar na frente do usuário.
        threshold: 0,
        rootMargin: '0px 0px 15% 0px'
      });

      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        motionObserver.observe(el);
      });
    }

    // Título da Hero: separa em palavras e aplica entrada escalonada (efeito exclusivo
    // desse título — ver css/style.css .split-word). Preserva o <span class="text-gold">
    // aninhado (as palavras dentro dele saem coloridas, herdando o estilo do pai).
    // try/catch de propósito: um erro aqui não pode impedir o bloco de resgate da
    // hero (logo abaixo) de rodar — os dois são a última linha de defesa contra
    // conteúdo travado invisível, e main.js é um único arquivo, então uma exceção
    // não tratada num bloco anterior interrompe todo o resto do arquivo.
    try {
      (function () {
      const heading = document.querySelector('#hero h1.hero-title');
      if (!heading) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const BASE_DELAY = 0.25; // alinhado ao delay do h1 dentro do .reveal-group
      const STEP = 0.045;
      let wordIndex = 0;

      function wrapWords(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach((part) => {
            if (part === '') return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const wrap = document.createElement('span');
            wrap.className = 'split-word-wrap';
            const word = document.createElement('span');
            word.className = 'split-word';
            // Par posicional com o "animation:" de duas animações em .split-word
            // (css/style.css): a primeira é a entrada, a segunda é o resgate em CSS
            // puro, que tem que continuar com delay fixo de 7s pra toda palavra.
            word.style.animationDelay = (BASE_DELAY + wordIndex * STEP).toFixed(3) + 's, 7s';
            word.textContent = part;
            wordIndex++;
            wrap.appendChild(word);
            frag.appendChild(wrap);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.childNodes).forEach(wrapWords);
        }
      }

      Array.from(heading.childNodes).forEach(wrapWords);
      })();
    } catch (e) {
      console.error('Falha ao separar o título em palavras:', e);
    }

    // Resgate da hero. É o caso mais crítico: se ela travar, o visitante vê um
    // título pela metade e nenhum botão. A contagem começa quando o preloader
    // libera as animações (antes disso elas estão pausadas de propósito).
    (function () {
      function resgatarHero() {
        document
          .querySelectorAll('#hero .reveal-group > *, #hero .split-word')
          .forEach((el) => resgatarSeInvisivel(el, 3000));
      }

      const root = document.documentElement;
      if (!root.classList.contains('is-preloading')) {
        resgatarHero();
        return;
      }
      const obs = new MutationObserver(() => {
        if (!root.classList.contains('is-preloading')) {
          obs.disconnect();
          resgatarHero();
        }
      });
      obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    })();
