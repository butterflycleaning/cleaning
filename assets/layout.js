/* Injects shared header/footer, brand SVGs and mobile menu. */
(function () {
  const B = window.HIB.business;
  const sparkle = '<svg class="sparkle" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.8 6.2 3.5 9.3 12 12-8.5 2.7-11.2 5.8-12 12-.8-6.2-3.5-9.3-12-12 8.5-2.7 11.2-5.8 12-12z"/></svg>';

  // Five-petal bloom, drawn with rotated ellipses
  function bloom(size, petal, center) {
    let p = '';
    for (let i = 0; i < 5; i++) p += `<ellipse cx="50" cy="26" rx="14" ry="22" fill="${petal}" transform="rotate(${i * 72} 50 50)"/>`;
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${p}<circle cx="50" cy="50" r="11" fill="${center}"/></svg>`;
  }
  window.HIBArt = { sparkle, bloom };

  const page = location.pathname.split('/').pop() || 'index.html';
  const link = (href, text, cls) => `<a href="${href}" ${page === href ? 'aria-current="page"' : ''} ${cls ? `class="${cls}"` : ''}>${text}</a>`;

  const header = document.getElementById('site-header');
  if (header) header.outerHTML = `
  <a class="skip" href="#main">Skip to content</a>
  <header class="site"><div class="wrap">
    <a class="brand" href="index.html">${bloom(34, '#f2a1ba', '#f6d36b')}<span>${B.name}</span></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="main" id="nav" aria-label="Main">
      ${link('index.html', 'Home')}${link('services.html', 'Services')}${link('quote.html', 'Instant Quote')}${link('book.html', 'Book Now', 'btn')}
    </nav>
  </div></header>`;

  const footer = document.getElementById('site-footer');
  if (footer) footer.outerHTML = `
  <footer class="site"><div class="wrap">
    <div class="cols">
      <div><h3>${B.name} ${sparkle.replace('class="sparkle"', 'class="sparkle" style="fill:#fff"')}</h3>
        <p>${B.tagline}.<br>Serving all of ${B.area}.</p>
        <p><a href="mailto:${B.email}">${B.email}</a></p></div>
      <div><h3>Explore</h3><ul>
        <li><a href="services.html">Services</a></li><li><a href="quote.html">Instant Quote</a></li><li><a href="book.html">Book Now</a></li></ul></div>
      <div><h3>Legal</h3><ul>
        <li><a href="terms.html">Terms of Service</a></li><li><a href="privacy.html">Privacy Policy</a></li></ul></div>
    </div>
    <small>© ${new Date().getFullYear()} ${B.name}. All rights reserved.</small>
  </div></footer>`;

  document.addEventListener('click', e => {
    const b = e.target.closest('.menu-btn'); if (!b) return;
    const open = document.getElementById('nav').classList.toggle('open');
    b.setAttribute('aria-expanded', open);
  });

  // Fill any [data-art] placeholders (hero illustration, etc.)
  document.querySelectorAll('[data-bloom]').forEach(el => {
    const [size, p, c] = el.dataset.bloom.split(',');
    el.innerHTML = bloom(size, p, c);
  });
})();
