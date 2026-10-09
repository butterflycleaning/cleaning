/* Shared estimate engine used by the quote calculator and booking flow. */
(function () {
  const C = window.HIB;
  const r5 = n => Math.round(n / 5) * 5;
  const fmt = n => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

  function defaults(serviceId) {
    return { service: serviceId || 'standard', beds: 2, baths: 1, sqft: '1000', extras: {},
             officeSqft: 2000, restrooms: 2, windows: 10, sides: 'both', freq: 'none' };
  }

  function estimate(s) {
    const svc = C.services.find(x => x.id === s.service);
    if (!svc) return null;
    const lines = []; let sub = 0;
    const add = (label, amt) => { if (amt > 0) { lines.push({ label, amount: amt }); sub += amt; } };

    if (svc.model === 'home') {
      const band = C.home.sqftBands.find(b => b.id === s.sqft) || C.home.sqftBands[0];
      const base = C.home.base + C.home.perBed * s.beds + C.home.perBath * s.baths + band.add;
      add(`${svc.name} · ${s.beds} bed, ${s.baths} bath`, r5(base * svc.mult));
      C.extras.forEach(x => {
        const q = Number(s.extras[x.id] || 0);
        if (q > 0) add(x.qty ? `${x.label} × ${q}` : x.label, x.price * q);
      });
    } else if (svc.model === 'office') {
      add(`${svc.name} · ${Number(s.officeSqft).toLocaleString()} sq ft`, r5(s.officeSqft * C.office.perSqft));
      add(`Restrooms × ${s.restrooms}`, s.restrooms * C.office.perRestroom);
    } else if (svc.model === 'windows') {
      const per = s.sides === 'both' ? C.windows.perBothSides : C.windows.perOneSide;
      add(`Windows × ${s.windows} (${s.sides === 'both' ? 'inside & outside' : 'one side'})`, s.windows * per);
    }

    const raw = sub;
    const minApplied = raw < C.minimum;
    const subtotal = minApplied ? C.minimum : raw;
    const rec = svc.recurring ? C.recurring[s.freq] : C.recurring.none;
    const discount = rec ? rec.discount : 0;
    return { svc, lines, raw, minApplied, subtotal, discount, total: subtotal - discount };
  }

  window.HIBPricing = { estimate, defaults, fmt };
})();
