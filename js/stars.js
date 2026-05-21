// ===================== CANVAS ÉTOILES =====================
// Mode sombre uniquement — étoiles animées.
// En mode clair, moon.js prend le relais.

(function () {

  if (document.documentElement.getAttribute('data-theme') === 'light') return;

  const canvas = document.createElement('canvas');
  canvas.id = 'starCanvas';
  document.body.insertAdjacentElement('afterbegin', canvas);
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const STAR_COUNT = 180;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x:      Math.random() * window.innerWidth,
    y:      Math.random() * window.innerHeight,
    r:      Math.random() * 1.4 + 0.3,
    alpha:  Math.random(),
    speed:  Math.random() * 0.008 + 0.002,
    drift:  (Math.random() - 0.5) * 0.08,
    purple: Math.random() < 0.15,
  }));

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
      s.x += s.drift;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.purple
        ? `rgba(168, 85, 247, ${s.alpha})`
        : `rgba(255, 255, 255, ${s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();

})();
// ==================================================================