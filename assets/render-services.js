/* Renders service cards from config (index preview + services page). */
(function () {
  const C = window.HIB, P = window.HIBPricing;
  function example(svc) {
    if (svc.model === 'home') {
      const e = P.estimate({ ...P.defaults(svc.id), freq: 'none' });
      return `Example: 2 bed / 1 bath, 1,000–1,500 sq ft ≈ <span class="price">${P.fmt(e.total)}</span>`;
    }
    if (svc.model === 'office') {
      const e = P.estimate({ ...P.defaults(svc.id) });
      return `Example: 2,000 sq ft, 2 restrooms ≈ <span class="price">${P.fmt(e.total)}</span>`;
    }
    const e = P.estimate({ ...P.defaults(svc.id) });
    return `Example: 10 windows, inside & outside ≈ <span class="price">${P.fmt(e.total)}</span>`;
  }
  document.querySelectorAll('[data-services]').forEach(el => {
    const mode = el.dataset.services; // 'full' | 'brief'
    const groups = ['Residential', 'Commercial'];
    el.innerHTML = groups.map(g => `
      <h2 style="margin-top:28px">${g}</h2>
      <div class="grid g3">${C.services.filter(s => s.group === g).map(s => `
        <article class="card"><span class="tag">${g}</span>
          <h3>${s.name}</h3><p>${s.blurb}</p>
          ${mode === 'full' ? `<ul>${s.includes.map(i => `<li>${i}</li>`).join('')}</ul><p class="note">${example(s)}</p>` : ''}
          <a href="quote.html?svc=${s.id}">Get a quote →</a>
        </article>`).join('')}</div>`).join('');
  });
  document.querySelectorAll('[data-min]').forEach(el => el.textContent = P.fmt(C.minimum));
})();
document.querySelectorAll('[data-marquee]').forEach(el => {
  const one = window.HIB.services.map(s => `<span>${s.name}</span>`).join('');
  el.innerHTML = `<div class="track">${one}${one}${one}${one}</div>`;
});
