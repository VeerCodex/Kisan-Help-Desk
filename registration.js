// CONFIG: Backend endpoint (change to your API)
const REGISTER_API = '/api/register';
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
// DOM Elements
const googleBtn = document.getElementById('googleBtn');
const maybeLater = document.getElementById('maybeLater');
const signupForm = document.getElementById('signupForm');
const formMsg = document.getElementById('formMsg');

// Google Button (Placeholder for OAuth)
googleBtn?.addEventListener('click', () => {
  alert('Google sign-in placeholder — replace with OAuth redirect (/auth/google).');
});

// Maybe Later
maybeLater?.addEventListener('click', () => {
  signupForm.style.display = 'none';
  formMsg.style.color = 'var(--muted)';
  formMsg.textContent = 'You can sign up anytime. Visit our home page to explore.';
});

// Form Submission
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.textContent = '';

  // Collect Data
  const data = {
    fullName: signupForm.fullName.value.trim(),
    password: signupForm.password.value,
    mobile: signupForm.mobile.value.trim(),
    address: signupForm.address.value.trim(),
    age: parseInt(signupForm.age.value, 10),
    sex: signupForm.sex.value,
    email: signupForm.email.value.trim() || null,
  };

  // Client Validation
  if (!data.fullName) return formMsg.textContent = 'Please enter full name';
  if (!data.password || data.password.length < 6) return formMsg.textContent = 'Password minimum 6 characters';
  if (!/^\d{10}$/.test(data.mobile)) return formMsg.textContent = 'Enter 10 digit mobile number';
  if (!data.address) return formMsg.textContent = 'Please enter address';
  if (!Number.isInteger(data.age) || data.age < 12 || data.age > 120) return formMsg.textContent = 'Enter a valid age';
  if (!data.sex) return formMsg.textContent = 'Select sex/gender';

  // UI Feedback
  const submitBtn = signupForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';

  try {
    const res = await fetch(REGISTER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => null);
      formMsg.textContent = errText || `Server returned ${res.status}`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';
      return;
    }

    const json = await res.json().catch(() => ({ ok: true }));
    formMsg.style.color = 'green';
    formMsg.textContent = json.message || 'Account created successfully! Check SMS/email for verification.';
    signupForm.reset(); // Clear form
    setTimeout(() => {
      // Optional: Redirect to home or dashboard
      window.location.href = '/dashboard.html';
    }, 2000);

  } catch (err) {
    formMsg.textContent = 'Network error: could not reach server.';
    console.error(err);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create account';
  }
});

// Scroll-triggered animations (matching centered structure)
window.addEventListener('load', () => {
  const sections = document.querySelectorAll('.registration-section');
  
  function checkVisibility() {
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        section.style.opacity = '1';
        section.style.animationDelay = `${index * 0.2}s`;
      }
    });
  }
  
  checkVisibility();
  window.addEventListener('scroll', checkVisibility);
});