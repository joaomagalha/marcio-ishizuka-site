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
