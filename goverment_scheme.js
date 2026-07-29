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

  // Make entire .about-section clickable using data-link
  document.querySelectorAll('.about-section').forEach(section => {
    const link = section.dataset.link;
    if (!link) return;

    // Visual hint
    section.style.cursor = 'pointer';

    // Mouse click: ignore clicks on actual anchors/buttons inside
    section.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return; // allow inner links/buttons to work normally
      window.open(link, '_blank'); // or use location.href = link for same tab
    });

    // Keyboard accessibility: open on Enter or Space when focused
    section.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        // prevent page scroll on space
        e.preventDefault();
        window.open(link, '_blank');
      }
    });

    // Ensure it is keyboard-focusable (you already had tabindex="0", good)
    if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '0');
    // Add ARIA role for assistive tech
    if (!section.hasAttribute('role')) section.setAttribute('role', 'link');
});

