/* Motion & delight layer: reveals, petals, cursor sparkles, tilt, magnetic buttons, count-up, confetti.
   Performance: one rAF loop, fixed particle pool, pauses when tab/section hidden, touch-safe. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = (s, r) => [...(r || document).querySelectorAll(s)];
  window.HIBFX = { burst() {}, confetti() {} };
  if (reduce) return;

  /* ---------- header + scroll progress ---------- */
  const bar = document.createElement('div'); bar.id = 'scrollbar'; document.body.prepend(bar);
  const hdr = document.querySelector('header.site');
  let sy = scrollY, sv = 0, ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (hdr) hdr.classList.toggle('scrolled', scrollY > 10);
    sv += (scrollY - sy) * 0.08; sy = scrollY; ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- split hero headline into rising words ---------- */
  $('[data-split]').forEach(h => {
    h.setAttribute('aria-label', h.textContent.trim());
    const frag = document.createDocumentFragment(); let i = 0;
    const mk = node => { const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span'); inner.className = 'wi'; inner.style.setProperty('--i', i++); inner.append(node); w.append(inner); return w; };
    [...h.childNodes].forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (!t.trim()) frag.append(' '); else frag.append(mk(document.createTextNode(t))); });
      else frag.append(mk(n.cloneNode(true)));
    });
    h.textContent = ''; h.append(frag);
  });

  /* ---------- scroll reveal ---------- */
  const sel = 'main h1:not(.hero h1), main h2, main .lead:not(.hero .lead), main .eyebrow:not(.hero .eyebrow), .steps .card, [data-services] .card, .disc .card, figure.card, main .split > .card, main .split > aside, section .wrap.narrow > .btn, .marquee + section .btn';
  const counts = new Map();
  const targets = $(sel).filter(el => !el.closest('.hero'));
  targets.forEach(el => {
    const p = el.parentElement, n = counts.get(p) || 0; counts.set(p, n + 1);
    el.dataset.reveal = ''; el.style.setProperty('--d', Math.min(n, 6));
  });
  $('.disc .big').forEach(e => e.dataset.count = '1');

  function countUp(el) {
    const m = el.textContent.match(/^(\D*)(\d+)(.*)$/); if (!m) return;
    const to = +m[2], t0 = performance.now(), dur = 1100;
    (function step(t) { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = m[1] + Math.round(to * e) + m[3]; if (k < 1) requestAnimationFrame(step); })(t0);
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
      if (e.target.dataset.count) countUp(e.target);
    }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(t => io.observe(t));
    $('[data-count]').forEach(t => { if (!t.hasAttribute('data-reveal')) io.observe(t); });
  } else targets.forEach(t => t.classList.add('in'));

  /* ---------- pointer-driven effects (desktop only) ---------- */
  const mouse = { x: -999, y: -999 };
  if (fine) {
    $('[data-services] .card, .steps .card, .disc .card, figure.card').forEach(c => c.dataset.tilt = '');
    $('[data-tilt]').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 9}deg) rotateY(${(x - 0.5) * 11}deg) translateY(-6px) scale(1.02)`;
        c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%');
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
    $('.btn').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', (e.clientX - r.left - r.width / 2) * 0.22 + 'px');
        b.style.setProperty('--my', (e.clientY - r.top - r.height / 2) * 0.3 + 'px'); });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
    const hero = document.querySelector('.hero');
    if (hero) hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect();
      hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3)); });
  }

  /* ---------- canvas: falling petals, cursor sparkles, click bursts, confetti ---------- */
  const cv = document.createElement('canvas'); cv.id = 'fx'; cv.setAttribute('aria-hidden', 'true'); document.body.append(cv);
  const ctx = cv.getContext('2d'); let W = 0, H = 0;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function resize() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  resize(); addEventListener('resize', resize);
  const COL = ['#f2a1ba', '#e8799c', '#ffffff', '#9fcfae', '#f6d36b', '#fbc7d6'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const mkPetal = (top) => ({ x: rnd(0, W), y: top ? -20 : rnd(-20, H), r: rnd(5, 11), vy: rnd(0.25, 0.7), ph: rnd(0, 6.28), sw: rnd(0.4, 1.2),
    rot: rnd(0, 6.28), vr: rnd(-0.02, 0.02), c: COL[(Math.random() * COL.length) | 0], a: rnd(0.35, 0.7), star: Math.random() < 0.18, dx: 0 });
  const petals = Array.from({ length: W < 700 ? 12 : 24 }, () => mkPetal(false));
  const bits = []; const MAXB = 160;
  function spawn(x, y, o) { if (bits.length >= MAXB) bits.shift(); bits.push(Object.assign({ x, y, vx: 0, vy: 0, g: 0, life: 0, max: 800, s: 8, c: COL[(Math.random() * COL.length) | 0], rot: rnd(0, 6.28), vr: 0, shape: 'star' }, o)); }

  function star(x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
    ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s); ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s);
    ctx.fill(); ctx.restore();
  }
  function petal(x, y, r, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, 0, r * 0.55, r, 0, 0, 6.283); ctx.fill(); ctx.restore(); }

  let last = performance.now(), run = true;
  document.addEventListener('visibilitychange', () => { run = !document.hidden; if (run) { last = performance.now(); requestAnimationFrame(loop); } });
  function loop(t) {
    if (!run) return;
    const dt = Math.min(2.5, (t - last) / 16.67); last = t; sv *= 0.94;
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.ph += 0.012 * dt; p.y += (p.vy + Math.max(-3, Math.min(5, sv * 0.35))) * dt;
      let wind = Math.sin(p.ph) * p.sw;
      const mx = p.x - mouse.x, my = p.y - mouse.y, d2 = mx * mx + my * my;
      if (d2 < 9000) { const d = Math.sqrt(d2) || 1; p.dx += (mx / d) * 0.9; }
      p.dx *= 0.93; p.x += (wind + p.dx) * dt; p.rot += p.vr * dt + wind * 0.004;
      if (p.y > H + 20) Object.assign(p, mkPetal(true)); if (p.x < -30) p.x = W + 20; if (p.x > W + 30) p.x = -20;
      ctx.globalAlpha = p.a; ctx.fillStyle = p.c; p.star ? star(p.x, p.y, p.r * 0.9, p.rot) : petal(p.x, p.y, p.r, p.rot);
    }
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i]; b.life += 16.67 * dt; if (b.life > b.max) { bits.splice(i, 1); continue; }
      b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
      const k = 1 - b.life / b.max; ctx.globalAlpha = Math.min(1, k * 1.6); ctx.fillStyle = b.c;
      b.shape === 'petal' ? petal(b.x, b.y, b.s * (0.5 + k * 0.5), b.rot) : star(b.x, b.y, b.s * (0.4 + k * 0.6), b.rot);
    }
    ctx.globalAlpha = 1; requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function burst(x, y, n) {
    for (let i = 0; i < (n || 16); i++) { const a = (i / (n || 16)) * 6.283 + rnd(-0.2, 0.2), v = rnd(2, 5.5);
      spawn(x, y, { vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, g: 0.09, max: rnd(600, 1100), s: rnd(5, 11), vr: rnd(-0.15, 0.15), shape: Math.random() < 0.4 ? 'petal' : 'star' }); }
  }
  function confetti() {
    for (let i = 0; i < 110; i++) spawn(rnd(0, W), rnd(-60, -10), { vx: rnd(-1, 1), vy: rnd(1.5, 4), g: 0.02, max: rnd(2200, 3600), s: rnd(6, 12), vr: rnd(-0.1, 0.1), shape: Math.random() < 0.6 ? 'petal' : 'star' });
    burst(W / 2, H * 0.35, 40);
  }
  window.HIBFX = { burst, confetti };

  if (fine) {
    let lx = 0, ly = 0;
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return; mouse.x = e.clientX; mouse.y = e.clientY;
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      if (dx * dx + dy * dy > 520) { lx = e.clientX; ly = e.clientY;
        spawn(e.clientX + rnd(-4, 4), e.clientY + rnd(-4, 4), { vx: rnd(-0.4, 0.4), vy: rnd(0.2, 0.9), g: 0.006, max: rnd(500, 850), s: rnd(4, 9), vr: rnd(-0.1, 0.1) }); }
    }, { passive: true });
    addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  }
  document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.btn,.opt,.check,nav a,.brand')) burst(e.clientX, e.clientY, 14); });
})();
