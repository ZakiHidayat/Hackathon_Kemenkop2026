/* ============================================================
   KORPUS — Interactive Scripts
   Scroll reveals, nav state, counter animations, mobile menu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Nav Scroll Effect ---
  const nav = document.getElementById('nav');
  const handleScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- Mobile Toggle ---
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const spans = toggle.querySelectorAll('span');
      if (links.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    // Close on link click (mobile)
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.querySelectorAll('span').forEach(s => {
          s.style.transform = '';
          s.style.opacity = '';
        });
      });
    });
  }

  // --- Active Nav Link Highlight ---
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const observerNav = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observerNav.observe(s));

  // --- Scroll Reveal ---
  const reveals = document.querySelectorAll('.reveal');
  const observerReveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observerReveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${i % 4 * 0.1}s`;
    observerReveal.observe(el);
  });

  // --- Counter Animation (Hero stat) ---
  const heroStatEl = document.querySelector('.stat-number[data-count]');
  if (heroStatEl) {
    const target = parseInt(heroStatEl.dataset.count, 10);
    let current = 0;
    const duration = 2000;
    const start = performance.now();

    const animateCount = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.floor(eased * target);
      heroStatEl.textContent = current.toLocaleString('id-ID');
      if (progress < 1) requestAnimationFrame(animateCount);
    };

    // Start when hero is visible
    const heroObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(animateCount);
        heroObs.disconnect();
      }
    });
    heroObs.observe(heroStatEl);
  }

  // --- Metric Counter Animation ---
  const metricEls = document.querySelectorAll('.metric-value[data-target]');
  const metricObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const isPercent = target <= 100;
        const duration = 2000;
        const start = performance.now();

        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);

          if (isPercent) {
            el.textContent = `≥${current}%`;
          } else {
            el.textContent = current.toLocaleString('id-ID');
          }

          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        metricObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  metricEls.forEach(el => metricObs.observe(el));

  // --- Mouse Glow Effect on Sections ---
  document.querySelectorAll('section').forEach(section => {
    section.addEventListener('mousemove', e => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      section.style.setProperty('--mouse-x', `${x}%`);
      section.style.setProperty('--mouse-y', `${y}%`);
    });
  });

  // --- Smooth Scroll for "Kembali ke Atas" ---
  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

});
