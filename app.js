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
