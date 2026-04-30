/* ============================================================
   CÊNICA — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. FAQ ACCORDION ---- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('open');
        const body = i.querySelector('.faq-body');
        if (body) body.style.maxHeight = null;
        const trigger = i.querySelector('.faq-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        const body = item.querySelector('.faq-body');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- 2. PROGRAM TOGGLE (B2B / B2C) ---- */
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const programPanels = document.querySelectorAll('.programs-panel');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;

      toggleBtns.forEach(b => b.classList.remove('active'));
      programPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  /* ---- 3. INTERSECTION OBSERVER — Scroll Reveals ---- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---- 4. SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const navHeight = document.querySelector('.nav')?.offsetHeight || 72;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ---- 5. NAV SCROLL BEHAVIOR ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const handleNavScroll = () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  /* ---- 6. ANIMATED COUNTERS ---- */
  const counters = document.querySelectorAll('.stat-counter');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            const duration = 1600;
            const startTime = performance.now();

            const update = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(eased * target);
              el.textContent = prefix + current + suffix;
              if (progress < 1) requestAnimationFrame(update);
            };

            requestAnimationFrame(update);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(counter => counterObserver.observe(counter));
  }

  /* ---- 7. CONTACT FORM HANDLER ---- */
  const contactForm = document.querySelector('.contact-form');
  const successMsg = document.querySelector('.success-message');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }

      // Simulate async
      setTimeout(() => {
        contactForm.style.display = 'none';
        if (successMsg) {
          successMsg.classList.add('visible');
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 900);
    });
  }

  /* ---- 8. HERO CANVAS PARTICLES ---- */
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const PARTICLE_COUNT = 28;
    const particles = [];

    const SPOTLIGHT_COLOR_1 = 'rgba(212, 134, 58,';
    const SPOTLIGHT_COLOR_2 = 'rgba(232, 200, 106,';

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.12,
        speedY: (Math.random() - 0.5) * 0.12,
        opacity: Math.random() * 0.5 + 0.1,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
        opacitySpeed: Math.random() * 0.006 + 0.002,
        color: Math.random() > 0.4 ? SPOTLIGHT_COLOR_1 : SPOTLIGHT_COLOR_2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // Update
        p.x += p.speedX / canvas.width * 100;
        p.y += p.speedY / canvas.height * 100;
        p.opacity += p.opacityDir * p.opacitySpeed;

        if (p.opacity >= 0.65 || p.opacity <= 0.05) p.opacityDir *= -1;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        if (p.y < -0.02) p.y = 1.02;
        if (p.y > 1.02) p.y = -0.02;

        // Draw glow
        const px = p.x * canvas.width;
        const py = p.y * canvas.height;
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        gradient.addColorStop(0, p.color + p.opacity + ')');
        gradient.addColorStop(1, p.color + '0)');

        ctx.beginPath();
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core dot
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (p.opacity + 0.3) + ')';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  /* ---- 9. BRAND BOOK NAV ACTIVE STATE ---- */
  const bbNavLinks = document.querySelectorAll('.bb-nav-item a');
  if (bbNavLinks.length > 0) {
    const bbSections = document.querySelectorAll('.bb-section[id]');

    const bbObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            bbNavLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { threshold: 0.35, rootMargin: '-60px 0px -40% 0px' }
    );

    bbSections.forEach(s => bbObserver.observe(s));
  }

  /* ---- 10. COLOR COPY (Brand Book) ---- */
  document.querySelectorAll('.color-card').forEach(card => {
    card.addEventListener('click', () => {
      const hex = card.querySelector('.color-hex')?.textContent?.trim();
      if (!hex) return;
      navigator.clipboard.writeText(hex).then(() => {
        const label = card.querySelector('.color-swatch-copied');
        if (label) {
          label.textContent = 'Copiado!';
          label.style.opacity = '1';
          setTimeout(() => { label.style.opacity = '0'; }, 1200);
        }
      }).catch(() => {});
    });
  });

  /* ---- 11. MOBILE NAV (close on link click) ---- */
  const mobileMenuBtn = document.querySelector('.nav-mobile-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('open', !expanded);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

});
