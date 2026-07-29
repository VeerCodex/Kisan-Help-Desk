// about.js  — animations + hero fade
// Save this file as about.js in same folder as about.html and about.css

// HERO fade on scroll
(function(){
  const hero = document.getElementById('hero');
  const HERO_FADE_FRAC = 0.7;

  function updateHero() {
    if (!hero) return;
    const y = window.scrollY || window.pageYOffset;
    const h = hero.getBoundingClientRect().height;
    const fadePx = Math.max(60, h * HERO_FADE_FRAC);
    const progress = Math.max(0, Math.min(1, y / fadePx));
    hero.style.opacity = String(1 - progress);
    hero.style.transform = `translateY(${ -8 * progress }px)`;
  }

  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateHero);
  }, {passive: true});
  window.addEventListener('resize', updateHero);
  window.addEventListener('load', updateHero);
})();

// IntersectionObserver for sections (trigger .active)
(function(){
  const sections = Array.from(document.querySelectorAll('.about-section'));
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, {
    root: null,
    threshold: 0.22,
    rootMargin: '0px'
  });

  sections.forEach(sec => {
    sec.tabIndex = 0; // keyboard focusable
    observer.observe(sec);
  });

  // keyboard: Enter/Space focuses the heading
  sections.forEach(s => {
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const h = s.querySelector('h2');
        if (h) h.scrollIntoView({behavior:'smooth', block:'center'});
      }
    });
  });
})();
