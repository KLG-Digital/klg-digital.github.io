// ===================== SURFACE LUNAIRE =====================
// Mode clair uniquement — ciel étoilé + surface lunaire avec cratères.
// En mode sombre, stars.js prend le relais.

(function () {

  if (document.documentElement.getAttribute('data-theme') !== 'light') return;

  const canvas = document.createElement('canvas');
  canvas.id = 'starCanvas';
  document.body.insertAdjacentElement('afterbegin', canvas);
  const ctx = canvas.getContext('2d');

  const initialSeed = Math.floor(Math.random() * 0xffffffff);
  let seed = initialSeed;
  function rand() {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  }
  function resetSeed() { seed = initialSeed; }

  // Données générées une seule fois
  let stars  = [];
  let placed = [];
  let isMobile = false;

  // ── Générer étoiles et cratères (une fois au chargement/resize) ──
  function generateData() {
    resetSeed();

    const W = window.innerWidth;
    const H = window.innerHeight;
    isMobile = W < 768;

    // Étoiles — positions fixes
    stars = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        sx: rand() * W,
        sy: rand() * H * 0.9,
        sr: rand() * 1.2 + 0.2,
        sa: rand() * 0.7 + 0.3,
        purple: rand() < 0.12
      });
    }

    // Cratères — positions fixes
    const sizes = isMobile
      ? [[5,60,100],[12,25,55],[25,10,22],[40,4,9],[60,1.5,3.5]]
      : [[3,40,70],[8,18,38],[15,7,16],[25,3,6],[35,1,2.5]];

    placed = [];
    sizes.forEach(([count, minR, maxR]) => {
      for (let i = 0; i < count; i++) {
        const r      = minR + rand() * (maxR - minR);
        const margin = r * 1.6;
        for (let attempt = 0; attempt < 30; attempt++) {
          const x = margin + rand() * (W - margin * 2);
          const y = margin + rand() * (H - margin * 2);
          let ok = true;
          for (const c of placed) {
            const dx = x - c.x, dy = y - c.y;
            if (Math.sqrt(dx*dx + dy*dy) < r*1.5 + c.r*1.5) { ok = false; break; }
          }
          if (ok) {
            const N = 120, erosionAmp = r * 0.04;
            const freq = 6 + Math.floor(rand() * 3);
            const phase1 = rand() * Math.PI * 2;
            const phase2 = rand() * Math.PI * 2;
            const offsets = [];
            for (let i = 0; i < N; i++) {
              const a = (i / N) * Math.PI * 2;
              offsets.push(
                Math.sin(a * freq       + phase1) * erosionAmp * 0.6 +
                Math.sin(a * freq * 2.1 + phase2) * erosionAmp * 0.4
              );
            }
            placed.push({ x, y, r, offsets, N });
            break;
          }
        }
      }
    });
  }

  // ── Dessiner le canvas (appelé à chaque frame scroll) ────────────
  function draw(scrollY) {
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    // Horizon monte avec le scroll
    const baseHorizon = H * 0.25;
    const horizonY    = Math.max(-H, baseHorizon - scrollY * 1.5);
    const curveDrop   = H * 0.05;

    // Fond noir
    ctx.fillStyle = '#07071a';
    ctx.fillRect(0, 0, W, H);

    // Étoiles fixes dans le ciel
    stars.forEach(({ sx, sy, sr, sa, purple }) => {
      if (sy > horizonY - 20) return; // cacher si sous l'horizon
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = purple ? `rgba(168,85,247,${sa})` : `rgba(255,255,255,${sa})`;
      ctx.fill();
    });

    // Surface lunaire
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, horizonY + curveDrop);
    ctx.bezierCurveTo(W*0.25, horizonY-curveDrop*0.2, W*0.75, horizonY-curveDrop*0.2, W, horizonY+curveDrop);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = '#c8c8d0';
    ctx.fill();
    ctx.restore();

    // Ligne d'horizon
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, horizonY + curveDrop);
    ctx.bezierCurveTo(W*0.25, horizonY-curveDrop*0.2, W*0.75, horizonY-curveDrop*0.2, W, horizonY+curveDrop);
    ctx.strokeStyle = 'rgba(168,85,247,0.3)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.restore();

    // Clip cratères sous l'horizon
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, horizonY + curveDrop);
    ctx.bezierCurveTo(W*0.25, horizonY-curveDrop*0.2, W*0.75, horizonY-curveDrop*0.2, W, horizonY+curveDrop);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.clip();

    placed.forEach(({ x, y, r, offsets, N }) => {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const a  = (i / N) * Math.PI * 2;
        const pr = r + offsets[i];
        i === 0 ? ctx.moveTo(x+Math.cos(a)*pr, y+Math.sin(a)*pr)
                : ctx.lineTo(x+Math.cos(a)*pr, y+Math.sin(a)*pr);
      }
      ctx.closePath();
      ctx.clip();
      ctx.beginPath();
      ctx.arc(x, y, r * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(155,153,168,0.75)';
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();

    // ── Drapeau suisse — ancré sur la surface ────────────
    const fw  = isMobile ? 28 : 40;
    const fh  = fw;
    const fpx = W * 0.82;
    const ph  = isMobile ? 60 : 85;
    // Ancré à une position fixe sur la surface, pas à l'horizon
    const flagSurfaceY = horizonY + 80;
    const fpy = flagSurfaceY - ph - fh;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fpx, fpy);
    ctx.lineTo(fpx, fpy + ph);
    ctx.strokeStyle = 'rgba(110,108,125,0.95)';
    ctx.lineWidth   = isMobile ? 2 : 2.5;
    ctx.stroke();
    ctx.restore();

    const wave = fw * 0.08;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fpx, fpy);
    ctx.bezierCurveTo(fpx+fw*0.33,fpy-wave,      fpx+fw*0.66,fpy+wave*0.5, fpx+fw,     fpy);
    ctx.bezierCurveTo(fpx+fw+wave,fpy+fh*0.33,   fpx+fw+wave*0.5,fpy+fh*0.66, fpx+fw,  fpy+fh);
    ctx.bezierCurveTo(fpx+fw*0.66,fpy+fh+wave*0.5, fpx+fw*0.33,fpy+fh-wave, fpx,       fpy+fh);
    ctx.closePath();
    ctx.fillStyle = '#E8001C';
    ctx.fill();

    const armW = fw*0.58, armH = fw*0.18;
    const fcx = fpx+fw*0.48, fcy = fpy+fh*0.50;
    ctx.fillStyle = 'white';
    ctx.fillRect(fcx-armW/2, fcy-armH/2, armW, armH);
    ctx.fillRect(fcx-armH/2, fcy-armW/2, armH, armW);
    ctx.restore();
  }

  // ── Init ─────────────────────────────────────────────
  generateData();

  let lastScroll = -1;
  function loop() {
    const scroll = window.scrollY;
    if (scroll !== lastScroll) {
      lastScroll = scroll;
      draw(scroll);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    generateData();
    draw(window.scrollY);
  }, { passive: true });

  loop();

})();
// ===========================================================