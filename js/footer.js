// ===================== FOOTER PARTAGÉ =====================

(function () {

  const path    = window.location.pathname;
  const inPages = path.includes('/pages/');
  const root    = inPages
    ? path.substring(0, path.indexOf('/pages/')) + '/'
    : path.substring(0, path.lastIndexOf('/') + 1);

  const year = new Date().getFullYear();

  const footerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">
        <span class="footer-copy">© ${year} KLG Digital — Tous droits réservés</span>
        <div class="footer-links">
          <a href="mailto:kevin@klg-digital.ch">kevin@klg-digital.ch</a>
          <span class="footer-sep">·</span>
          <a href="${root}pages/privacy.html">Politique de confidentialité</a>
        </div>
      </div>
    </footer>
  `;

  document.body.insertAdjacentHTML('beforeend', footerHTML);

})();
// ==========================================================