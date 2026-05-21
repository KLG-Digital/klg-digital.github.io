// ===================== THÈME SOMBRE / CLAIR =====================
// Mode sombre : étoiles animées (stars.js)
// Mode clair  : surface lunaire réaliste (moon.js)
// Bouton thème : fin des liens navbar desktop + dernier item menu mobile

(function () {

  const STORAGE_KEY = 'klg-theme';

  // ── Préférence système ou sauvegardée ──────────────────────
  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  // ── Appliquer le thème sur <html> ──────────────────────────
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // ── Chemin vers moon.js selon la page courante ─────────────
  function moonScriptPath() {
    return window.location.pathname.includes('/pages/')
      ? '../js/moon.js'
      : 'js/moon.js';
  }

  // ── Créer le canvas et charger moon.js dynamiquement ───────
  function createMoonCanvas() {
    let canvas = document.getElementById('starCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'starCanvas';
      document.body.insertAdjacentElement('afterbegin', canvas);
    }

    const script = document.createElement('script');
    script.src = moonScriptPath();
    script.onload = () => {
      if (typeof window.drawMoonSurface === 'function') {
        window.drawMoonSurface(canvas);
        window.addEventListener('resize', () => window.drawMoonSurface(canvas), { passive: true });
      }
    };
    document.head.appendChild(script);
  }

  // ── Bouton thème dans la navbar ────────────────────────────
  function injectToggleButton() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const theme = getPreferredTheme();

    // Bouton desktop — après les nav-links
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Changer de thème');
    btn.innerHTML = theme === 'dark'
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
      location.reload();
    });

    const navLinks = navbar.querySelector('.nav-links');
    if (navLinks) {
      navLinks.after(btn);
    } else {
      const menuToggle = navbar.querySelector('.menu-toggle');
      navbar.insertBefore(btn, menuToggle);
    }

    // Bouton mobile — dernier item du menu
    if (navLinks) {
      const li = document.createElement('li');
      li.className = 'theme-toggle-mobile';

      const mobileBtn = document.createElement('button');
      mobileBtn.className = 'theme-toggle-mobile-btn';
      mobileBtn.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i> Mode clair'
        : '<i class="fa-solid fa-moon"></i> Mode sombre';

      mobileBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
        location.reload();
      });

      li.appendChild(mobileBtn);
      navLinks.appendChild(li);
    }
  }

  // ── Point d'entrée ─────────────────────────────────────────
  const theme = getPreferredTheme();
  applyTheme(theme);

  document.addEventListener('DOMContentLoaded', () => {
    injectToggleButton();
    if (theme === 'light') {
      createMoonCanvas();
      initNavScroll();
    }
  });
  // ── Transition couleur navbar au scroll (mode clair) ───────
  function initNavScroll() {
    if (getPreferredTheme() !== 'light') return;

    const navbar   = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a, .navbar .logo');
    if (!navbar || !navLinks.length) return;

    // Hauteur de l'horizon : 25% de la fenêtre (comme dans moon.js)
    function getHorizonY() {
      const base = window.innerHeight * 0.25;
      return Math.max(-window.innerHeight, base - window.scrollY * 1.5);
    }

    function updateNavColor() {
      const scrollY  = window.scrollY;
      const horizonY = getHorizonY();
      const navH     = navbar.offsetHeight;

      // La navbar est dans le ciel si son bas est au-dessus de l'horizon
      const navBottom = scrollY + navH;
      const onSurface = navBottom > horizonY;

      const textColor = onSurface ? '#1a1a2e' : 'white';
      const navBg     = onSurface
        ? 'rgba(200,200,208,0.75)'
        : 'rgba(7,7,26,0.7)';

      navbar.style.background     = navBg;
      navbar.style.backdropFilter = 'blur(10px)';

      // Liens navbar
      navLinks.forEach(a => { a.style.color = textColor; });

      // Hamburger
      document.querySelectorAll('.menu-toggle span')
        .forEach(s => { s.style.background = textColor; });

      // Bouton thème
      const btn = document.querySelector('.theme-toggle');
      if (btn) btn.style.color = textColor;

      // Logo
      const logoImg = document.querySelector('.logo-img');
      if (logoImg) {
        const isPages = window.location.pathname.includes('/pages/');
        const base    = isPages ? '../images/' : 'images/';
        logoImg.src   = onSurface
          ? base + 'KLG-Digital-noir.png'
          : base + 'KLG-Digital-blanc.png';
      }

      // Titres et textes — blanc dans le ciel, foncé sur la surface
      document.querySelectorAll('h1, h2, .heading-tag, .subtitle, .profile-name, .profile-bio, .timeline-title, .timeline-desc, .service-name, .service-desc, .card-title, .card-desc, .cta-text, .cta-sub, .award-title, .lang-name, .skill-group-title, .hero-h1, .hero-desc, .profile-title, .last-updated, .privacy-section p, .privacy-section li, .privacy-section h2').forEach(el => {
        const rect    = el.getBoundingClientRect();
        const elMid   = rect.top + rect.height / 2;
        // Comparer position écran vs horizon écran (pas besoin d'ajouter scrollY)
        const onLunar = elMid > horizonY;
        el.style.color = onLunar ? '#1a1a2e' : '';
      });
    }

    updateNavColor();
    window.addEventListener('scroll', updateNavColor, { passive: true });
    window.addEventListener('resize', updateNavColor, { passive: true });
  }


  // Changement système sans override manuel
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
      location.reload();
    }
  });

})();
// ===============================================================