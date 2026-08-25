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

    // IntersectionObserver: Triggers animations when blocks are within viewport
    if ('IntersectionObserver' in window) {
      const motionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            motionObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        motionObserver.observe(el);
      });
    }

    // Título da Hero: separa em palavras e aplica entrada escalonada (efeito exclusivo
    // desse título — ver css/style.css .split-word). Preserva o <span class="text-gold">
    // aninhado (as palavras dentro dele saem coloridas, herdando o estilo do pai).
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
            word.style.animationDelay = (BASE_DELAY + wordIndex * STEP).toFixed(3) + 's';
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
