// crop.js — hero fade + section reveal for crop page
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

  window.addEventListener('scroll', () => { window.requestAnimationFrame(updateHero); }, {passive:true});
  window.addEventListener('resize', updateHero);
  window.addEventListener('load', updateHero);

  // IntersectionObserver for crop sections
  const secs = Array.from(document.querySelectorAll('.crop-section'));
  if (!secs.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
      else entry.target.classList.remove('active');
    });
  }, { root:null, threshold: 0.22 });

  secs.forEach(s => {
    s.tabIndex = 0;
    observer.observe(s);
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const h = s.querySelector('h2') || s.querySelector('h3');
        if (h) h.scrollIntoView({behavior:'smooth', block:'center'});
      }
    });
  });

})();
