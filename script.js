/* script.js
   Put this file in the same folder as index.html
   This file contains:
     - mobile menu toggle
     - intersection observer for block animations
     - hero <-> main cross-fade on scroll
     - clickable feature blocks (open data-link)
*/

/* run after DOM ready */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile menu toggle ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const shown = mobileMenu.style.display === 'block';
      mobileMenu.style.display = shown ? 'none' : 'block';
      hamburger.setAttribute('aria-expanded', String(!shown));
      mobileMenu.setAttribute('aria-hidden', String(shown));
    });
  }

  /* ---------- IntersectionObserver: animate feature blocks ---------- */
  const blockObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
      else entry.target.classList.remove('active');
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('.feature').forEach(el => {
    blockObserver.observe(el);
  });

  /* ---------- HERO <-> MAIN cross-fade on scroll ---------- */
  const hero = document.getElementById('hero');
  const topbar = document.getElementById('topbar');
  const main = document.getElementById('main');

  // fraction of hero height used for fade distance (0..1)
  const HERO_FADE_FRACTION = 0.8;

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeroMain();
        ticking = false;
      });
      ticking = true;
    }
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function updateHeroMain() {
    if (!hero || !main || !topbar) return;
    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = hero.getBoundingClientRect().height;
    const fadePx = Math.max(80, heroHeight * HERO_FADE_FRACTION);
    const progress = clamp(scrollY / fadePx, 0, 1);

    // hero fades out and moves up a bit
    hero.style.opacity = String(1 - progress);
    hero.style.transform = `translateY(${ -10 * progress }px)`;
    // topbar fades slightly faster
    topbar.style.opacity = String(1 - progress * 1.05);

    // main fades in and slides up — we use class and inline style for smoothness
    if (progress > 0.02) main.classList.add('visible'); else main.classList.remove('visible');
    const mainTranslate = (1 - progress) * 14; // from 14px -> 0
    main.style.transform = `translateY(${mainTranslate}px)`;
    main.style.opacity = String(progress);
  }

  // attach events
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateHeroMain);
  // initial run
  updateHeroMain();

  /* ---------- Make whole feature block clickable (but allow inner links) ---------- */
  document.querySelectorAll('.feature').forEach(block => {
    block.addEventListener('click', (e) => {
      // if user clicked an inner anchor, let it do its job
      if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) return;
      const url = block.dataset.link;
      if (url) {
        // open in same tab: location.href = url;
        // open new tab:
        window.open(url, '_blank', 'noopener');
      }
    });

    // keyboard: Enter/Space opens link
    block.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const url = block.dataset.link;
        if (url) window.open(url, '_blank', 'noopener');
      }
    });
  });

}); // DOMContentLoaded end
