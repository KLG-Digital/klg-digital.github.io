// ===================== NAVBAR PARTAGÉE =====================
// Modifier ce fichier met à jour la navbar sur toutes les pages.
// Compatible Live Server, file://, et GitHub Pages.

(function () {

  // ── Calculer la racine du site ────────────────────────────
  // On remonte jusqu'au dossier qui contient index.html
  // Fonctionne depuis racine ET depuis pages/
  const path    = window.location.pathname;
  const inPages = path.includes('/pages/');
  const root    = inPages
    ? path.substring(0, path.indexOf('/pages/')) + '/'
    : path.substring(0, path.lastIndexOf('/') + 1);

  // ── Détecter la page courante ─────────────────────────────
  const currentPage = path.split('/').pop() || 'index.html';

  // ── Liens de navigation ───────────────────────────────────
  const links = [
    { label: 'Accueil',      href: root + 'index.html' },
    { label: 'Mon parcours', href: root + 'pages/parcours.html' },
    { label: 'Programmes',   href: root + 'pages/programmes.html' },
    { label: 'Services',     href: root + 'pages/services.html' },
    { label: 'À propos',     href: root + 'pages/apropos.html' },
    { label: 'Contact',      href: root + 'pages/contact.html' },
  ];

  // ── Logo et image ─────────────────────────────────────────
  const imgRoot = inPages ? '../' : '';

  // ── Générer le HTML de la navbar ──────────────────────────
  const navHTML = `
    <nav class="navbar">
      <a href="${root}index.html" class="logo">
        <img src="${imgRoot}images/KLG-Digital-blanc.png" alt="KLG Digital" class="logo-img">
      </a>
      <button class="menu-toggle" aria-label="Ouvrir le menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul class="nav-links">
        ${links.map(link => {
          const isActive = link.href.endsWith(currentPage);
          return `<li><a href="${link.href}"${isActive ? ' class="active"' : ''}>${link.label}</a></li>`;
        }).join('\n        ')}
      </ul>
    </nav>
  `;

  // ── Injecter la navbar au début du body ───────────────────
  document.body.insertAdjacentHTML('afterbegin', navHTML);

  // ── Hamburger mobile ──────────────────────────────────────
  const toggle   = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-menu');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-menu');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });

})();
// ===========================================================