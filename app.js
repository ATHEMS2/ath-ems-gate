/* ============================================================
   app.js — شؤون الهلال الأحمر
   ============================================================ */

(function () {
  'use strict';

  /* ---- Theme Toggle ---- */
  const html        = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  // Persist theme across sessions
  const saved = localStorage.getItem('hlalTheme') || 'dark';
  html.setAttribute('data-theme', saved);

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hlalTheme', next);
  });

  /* ---- Card Keyboard & Click Navigation ---- */
  const cardMap = {
    'card-admin':        'الشؤون الإدارية',
    'card-appointments': 'تعيين وترقيات',
    'card-rewards':      'مكافآت وغرامات',
  };

  Object.entries(cardMap).forEach(([id, label]) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Click
    el.addEventListener('click', () => handleCardClick(label));

    // Keyboard
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick(label);
      }
    });
  });

  function handleCardClick(section) {
    // Ripple visual feedback
    const card = [...document.querySelectorAll('.card')].find(
      (c) => c.querySelector('.card-title')?.textContent.trim() === section
    );
    if (card) triggerRipple(card);

    // Placeholder — replace with actual navigation later
    console.log(`[HLAL] Navigating to: ${section}`);
  }

  /* ---- Ripple Effect ---- */
  function triggerRipple(el) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      width: 10px; height: 10px;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0);
      background: rgba(255, 30, 30, 0.25);
      animation: rippleAnim 0.6s ease-out forwards;
      pointer-events: none;
      z-index: 10;
    `;

    // Inject keyframes once
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes rippleAnim {
          to { transform: translate(-50%, -50%) scale(30); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  }

  /* ---- Scroll-triggered fade-in for cards ---- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.card').forEach((card) => {
    card.style.animationPlayState = 'paused';
    observer.observe(card);
  });

  /* ---- Navbar Shadow on Scroll ---- */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });

})();
