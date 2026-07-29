/* navbar.js - Unified navigation, SVG logo replacement, custom modal dialogs, and smart notifications hub */

// Custom dialog functions exposed globally
window.customAlert = function(message) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-dialog-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.style.backdropFilter = 'blur(5px)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '99999';
  overlay.style.animation = 'fadeIn 0.2s ease-out';

  const box = document.createElement('div');
  box.style.background = 'white';
  box.style.padding = '24px';
  box.style.borderRadius = '16px';
  box.style.maxWidth = '380px';
  box.style.width = '85%';
  box.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
  box.style.textAlign = 'center';
  box.style.border = '1px solid rgba(0,0,0,0.05)';

  const text = document.createElement('p');
  text.textContent = message;
  text.style.margin = '0 0 20px';
  text.style.fontSize = '1.05rem';
  text.style.fontWeight = '600';
  text.style.color = '#1a4d2e';
  text.style.lineHeight = '1.5';
  text.style.whiteSpace = 'pre-line';

  const okBtn = document.createElement('button');
  okBtn.textContent = 'OK';
  okBtn.style.padding = '10px 24px';
  okBtn.style.background = '#2f855a';
  okBtn.style.color = 'white';
  okBtn.style.border = 'none';
  okBtn.style.borderRadius = '8px';
  okBtn.style.fontWeight = '700';
  okBtn.style.cursor = 'pointer';
  okBtn.style.transition = 'background 0.2s';
  okBtn.addEventListener('mouseover', () => okBtn.style.background = '#276749');
  okBtn.addEventListener('mouseout', () => okBtn.style.background = '#2f855a');
  okBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  box.appendChild(text);
  box.appendChild(okBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

window.customConfirm = function(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-dialog-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.style.backdropFilter = 'blur(5px)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '99999';
  overlay.style.animation = 'fadeIn 0.2s ease-out';

  const box = document.createElement('div');
  box.style.background = 'white';
  box.style.padding = '24px';
  box.style.borderRadius = '16px';
  box.style.maxWidth = '380px';
  box.style.width = '85%';
  box.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
  box.style.textAlign = 'center';
  box.style.border = '1px solid rgba(0,0,0,0.05)';

  const text = document.createElement('p');
  text.textContent = message;
  text.style.margin = '0 0 20px';
  text.style.fontSize = '1.05rem';
  text.style.fontWeight = '600';
  text.style.color = '#1a4d2e';
  text.style.lineHeight = '1.5';

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '12px';
  btnContainer.style.justifyContent = 'center';

  const noBtn = document.createElement('button');
  noBtn.textContent = 'Cancel';
  noBtn.style.padding = '10px 20px';
  noBtn.style.background = '#edf2f7';
  noBtn.style.color = '#4a5568';
  noBtn.style.border = 'none';
  noBtn.style.borderRadius = '8px';
  noBtn.style.fontWeight = '700';
  noBtn.style.cursor = 'pointer';
  noBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  const yesBtn = document.createElement('button');
  yesBtn.textContent = 'Confirm';
  yesBtn.style.padding = '10px 20px';
  yesBtn.style.background = '#e53e3e';
  yesBtn.style.color = 'white';
  yesBtn.style.border = 'none';
  yesBtn.style.borderRadius = '8px';
  yesBtn.style.fontWeight = '700';
  yesBtn.style.cursor = 'pointer';
  yesBtn.style.transition = 'background 0.2s';
  yesBtn.addEventListener('mouseover', () => yesBtn.style.background = '#c53030');
  yesBtn.addEventListener('mouseout', () => yesBtn.style.background = '#e53e3e');
  yesBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    onConfirm();
  });

  btnContainer.appendChild(noBtn);
  btnContainer.appendChild(yesBtn);
  box.appendChild(text);
  box.appendChild(btnContainer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const shown = mobileMenu.style.display === 'block';
      mobileMenu.style.display = shown ? 'none' : 'block';
      hamburger.setAttribute('aria-expanded', String(!shown));
      mobileMenu.setAttribute('aria-hidden', String(shown));
    });

    document.addEventListener('click', (e) => {
      if (mobileMenu.style.display === 'block' && !mobileMenu.contains(e.target) && e.target !== hamburger) {
        mobileMenu.style.display = 'none';
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Close notifications dropdown on outside clicks
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    const bell = document.getElementById('notifBell');
    if (dropdown && dropdown.style.display === 'block' && !dropdown.contains(e.target) && e.target !== bell && !bell.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // 2. Dynamic Sprout SVG Logo Replacement
  replaceLogosWithSVG();

  // 3. Dynamically update auth links based on login state
  updateAuthLinks();

  // 4. Highlight the active link based on current filename
  highlightActiveLink();
});

function replaceLogosWithSVG() {
  const logoSelector = 'img.logo, img.logo-footer, img.brand-logo, img.brand-logo-small';
  const logos = document.querySelectorAll(logoSelector);
  
  const sproutSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#2f855a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="logo" style="width: 42px; height: 42px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15)); flex-shrink:0;">
      <path d="M12 22V12"></path>
      <path d="M12 12C12 7.58172 15.5817 4 20 4"></path>
      <path d="M12 15C12 11.6863 9.31371 9 6 9"></path>
      <path d="M6 9C6 9 9 9 12 12"></path>
      <path d="M20 4C20 4 17 4 14 7"></path>
    </svg>
  `;

  logos.forEach(logo => {
    if (logo && logo.parentNode) {
      const temp = document.createElement('div');
      temp.innerHTML = sproutSvg.trim();
      const svg = temp.firstChild;
      
      if (logo.className) {
        svg.setAttribute('class', logo.className);
      }
      logo.parentNode.replaceChild(svg, logo);
    }
  });
}

function updateAuthLinks() {
  const currentUser = JSON.parse(localStorage.getItem('kissan_current_user') || 'null');
  const navContainer = document.getElementById('mainNav');
  const mobileContainer = document.getElementById('mobileMenu');

  let baseLinks = `
    <a href="index.html">Home</a>
    <a href="about.html">About Us</a>
    <a href="crop-advisory.html">Crop Advisory</a>
    <a href="goverment_scheme.html">Govt Schemes</a>
    <a href="weather.html">Weather</a>
    <a href="marketplace.html">Marketplace</a>
  `;

  let userLinks = '';
  if (currentUser) {
    // Read notifications for badge
    const notifications = JSON.parse(localStorage.getItem('kissan_notifications_' + currentUser.mobile) || '[]');
    const unreadCount = notifications.filter(n => n.unread).length;
    const badgeHtml = unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : '';

    userLinks = `
      <a href="query.html">Q&A Support</a>
      <a href="profile.html">Profile</a>
      <a href="dashboard.html">Dashboard</a>
      <div class="notif-wrapper" style="position:relative; display:inline-block; align-self:center; margin:0 4px;">
        <button id="notifBell" onclick="window.toggleNotifications(event)" style="background:none; border:none; color:white; font-size:1.25rem; cursor:pointer; position:relative; display:flex; align-items:center; padding:8px;">
          🔔${badgeHtml}
        </button>
        <div id="notifDropdown" class="notif-dropdown" style="display:none; position:absolute; right:0; top:45px; background:white; color:#333; width:285px; max-height:320px; overflow-y:auto; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.18); border:1px solid #e2e8f0; z-index:99999;">
          <!-- Rendered dynamically -->
        </div>
      </div>
      <a href="#" id="signOutBtn" onclick="window.handleSignOut(event)">Sign Out (${escapeHtml(currentUser.fullName.split(' ')[0])})</a>
    `;
  } else {
    userLinks = `
      <a href="registration.html">Register</a>
      <a href="signin.html">Sign In</a>
    `;
  }

  if (navContainer) {
    navContainer.innerHTML = baseLinks + userLinks;
  }
  if (mobileContainer) {
    mobileContainer.innerHTML = baseLinks + userLinks;
  }
}

window.toggleNotifications = function(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('notifDropdown');
  if (!dropdown) return;
  const shown = dropdown.style.display === 'block';
  
  // Close any other dropdowns first
  dropdown.style.display = shown ? 'none' : 'block';

  if (!shown) {
    const currentUser = JSON.parse(localStorage.getItem('kissan_current_user') || 'null');
    if (!currentUser) return;
    const key = 'kissan_notifications_' + currentUser.mobile;
    const notifications = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (notifications.length === 0) {
      dropdown.innerHTML = '<div style="padding:20px; text-align:center; color:#888; font-size:0.9rem;">No notifications.</div>';
    } else {
      let html = '<div style="padding:10px 14px; font-weight:700; border-bottom:1px solid #edf2f7; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#2f855a;"><span>Notifications</span><button onclick="window.clearNotifs(event)" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-size:0.8rem; font-weight:600;">Clear All</button></div>';
      notifications.slice().reverse().forEach((n) => {
        const bg = n.unread ? '#f0fff4' : '#fff';
        html += `
          <div style="padding:12px 14px; border-bottom:1px solid #edf2f7; background:${bg}; border-left: 4px solid ${n.unread ? '#38a169' : 'transparent'}; font-size:0.82rem; line-height:1.45; text-align:left;">
            <div style="font-weight:700; color:#2d3748; margin-bottom:2px;">${escapeHtml(n.title)}</div>
            <div style="color:#4a5568; margin-bottom:4px;">${escapeHtml(n.message)}</div>
            <div style="font-size:0.72rem; color:#a0aec0;">${new Date(n.timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit', month:'short', day:'numeric'})}</div>
          </div>
        `;
      });
      dropdown.innerHTML = html;
    }

    // Mark all as read
    const updated = notifications.map(n => ({ ...n, unread: false }));
    localStorage.setItem(key, JSON.stringify(updated));

    // Clear badge count
    const badge = document.querySelector('.notif-badge');
    if (badge) {
      badge.style.display = 'none';
    }
  }
};

window.clearNotifs = function(e) {
  e.stopPropagation();
  const currentUser = JSON.parse(localStorage.getItem('kissan_current_user') || 'null');
  if (!currentUser) return;
  const key = 'kissan_notifications_' + currentUser.mobile;
  localStorage.setItem(key, JSON.stringify([]));
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) {
    dropdown.innerHTML = '<div style="padding:20px; text-align:center; color:#888; font-size:0.9rem;">No notifications.</div>';
  }
  const badge = document.querySelector('.notif-badge');
  if (badge) {
    badge.style.display = 'none';
  }
};

window.handleSignOut = function(e) {
  e.preventDefault();
  window.customConfirm('Are you sure you want to sign out?', () => {
    localStorage.removeItem('kissan_current_user');
    window.location.href = 'index.html';
  });
};

function highlightActiveLink() {
  let currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPath === '') currentPath = 'index.html';

  const links = document.querySelectorAll('.main-nav a, .mobile-menu a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (ch) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}
