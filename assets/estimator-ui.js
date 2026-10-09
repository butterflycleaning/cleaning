/* Renders the service-details form + live price summary. Shared by quote.html and book.html. */
(function () {
  const C = window.HIB, P = window.HIBPricing;
  const opts = (arr, sel) => arr.map(([v, l]) => `<option value="${v}" ${String(v) === String(sel) ? 'selected' : ''}>${l}</option>`).join('');
  const range = (a, b, step = 1) => { const o = []; for (let i = a; i <= b + 1e-9; i += step) o.push([i, i]); return o; };

  function renderDetails(box, s, onChange) {
    const svc = C.services.find(x => x.id === s.service);
    let h = '';
    if (svc.model === 'home') {
      h += `<div class="two">
        <div><label for="beds">Bedrooms</label><select id="beds">${opts([[0, 'Studio'], ...range(1, 7)], s.beds)}</select></div>
        <div><label for="baths">Bathrooms</label><select id="baths">${opts(range(1, 6, .5), s.baths)}</select></div></div>
        <label for="sqft">Home size</label><select id="sqft">${opts(C.home.sqftBands.map(b => [b.id, b.label]), s.sqft)}</select>
        <label>Extras</label>${C.extras.map(x => x.qty
          ? `<div class="check"><span>${x.label}</span><input class="qty" type="number" min="0" max="60" data-x="${x.id}" value="${s.extras[x.id] || 0}" aria-label="${x.label} quantity"><span class="p" style="margin-left:8px">+$${x.price} ea</span></div>`
          : `<label class="check"><input type="checkbox" data-x="${x.id}" ${s.extras[x.id] ? 'checked' : ''}> ${x.label}<span class="p">+$${x.price}</span></label>`).join('')}`;
    } else if (svc.model === 'office') {
      h += `<div class="two"><div><label for="officeSqft">Approx. square feet</label><input id="officeSqft" type="number" min="200" max="100000" step="100" value="${s.officeSqft}"></div>
        <div><label for="restrooms">Restrooms</label><select id="restrooms">${opts(range(0, 12), s.restrooms)}</select></div></div>`;
    } else {
      h += `<div class="two"><div><label for="windows">Number of windows</label><input id="windows" type="number" min="1" max="500" value="${s.windows}"></div>
        <div><label for="sides">Sides</label><select id="sides">${opts([['both', 'Inside & outside'], ['one', 'One side only']], s.sides)}</select></div></div>`;
    }
    if (svc.recurring) {
      h += `<label for="freq">How often?</label><select id="freq">${opts(Object.entries(C.recurring).map(([k, v]) =>
        [k, v.label + (v.discount ? ` — save ${P.fmt(v.discount)} per visit` : '')]), s.freq)}</select>`;
    }
    box.innerHTML = h;

    box.addEventListener('input', e => {
      const t = e.target;
      if (t.dataset.x) { const x = C.extras.find(y => y.id === t.dataset.x);
        s.extras[t.dataset.x] = x.qty ? Math.max(0, parseInt(t.value) || 0) : (t.checked ? 1 : 0);
      } else if (['beds', 'baths', 'restrooms', 'officeSqft', 'windows'].includes(t.id)) s[t.id] = Math.max(0, parseFloat(t.value) || 0);
      else if (['sqft', 'sides', 'freq'].includes(t.id)) s[t.id] = t.value;
      onChange();
    });
  }

  function renderSummary(box, s) {
    const e = P.estimate(s);
    let rows = e.lines.map(l => `<tr><td>${l.label}</td><td>${P.fmt(l.amount)}</td></tr>`).join('');
    if (e.minApplied) rows += `<tr><td>Minimum job price applied</td><td>${P.fmt(e.subtotal)}</td></tr>`;
    if (e.discount) rows += `<tr class="disc-row"><td>${C.recurring[s.freq].label} discount</td><td>−${P.fmt(e.discount)}</td></tr>`;
    box.innerHTML = `<h3>Your estimate</h3><table>${rows}<tr class="total"><td>Estimated total</td><td><span class="amt">${P.fmt(e.total)}</span></td></tr></table>
      <p class="note" style="margin-top:12px">Estimate only. We confirm your final price by email before your visit. Minimum job price is ${P.fmt(C.minimum)}.</p>`;
    const amt = box.querySelector('.amt');
    if (amt && box.dataset.last && box.dataset.last !== String(e.total) && amt.animate)
      amt.animate([{ transform: 'scale(1.35)', color: '#d9577f' }, { transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.3,1.8,.5,1)' });
    box.dataset.last = String(e.total);
    return e;
  }

  window.HIBUI = { renderDetails, renderSummary };
})();
