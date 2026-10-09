(function () {
  const C = window.HIB, P = window.HIBPricing, U = window.HIBUI;
  let s = P.defaults('standard');
  try { const saved = JSON.parse(sessionStorage.getItem('hib-state') || 'null');
        if (saved && new URLSearchParams(location.search).has('resume')) s = Object.assign(s, saved); } catch (e) {}
  const info = { date: '', time: '', altDate: '', name: '', email: '', phone: '', address: '', city: '', zip: '', notes: '', agree: false };

  const $ = id => document.getElementById(id);
  const steps = [...document.querySelectorAll('.step')];
  const names = ['Choose a service', 'Home details', 'Date & time', 'Your details', 'Review & send'];
  let cur = 0;

  // Step 1 — service
  $('svcList').innerHTML = ['Residential', 'Commercial'].map(g => `<h3 style="margin-top:14px">${g}</h3>` +
    C.services.filter(x => x.group === g).map(x => `<label class="opt"><input type="radio" name="svc" value="${x.id}" ${x.id === s.service ? 'checked' : ''}><b>${x.name}</b><br><span class="note">${x.blurb}</span></label>`).join('')).join('');
  $('svcList').addEventListener('change', e => { if (e.target.name === 'svc') s = P.defaults(e.target.value); });

  // Step 3 — date min = tomorrow
  const t = new Date(); t.setDate(t.getDate() + 1);
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  $('date').min = $('altDate').min = iso(t);

  function showStep(n) {
    cur = n;
    steps.forEach((el, i) => el.classList.toggle('active', i === n));
    document.querySelectorAll('.progress span').forEach((p, i) => p.classList.toggle('on', i <= n));
    $('stepname').textContent = `Step ${n + 1} of ${steps.length} · ${names[n]}`;
    $('back').style.visibility = n === 0 ? 'hidden' : 'visible';
    $('next').style.display = n === steps.length - 1 ? 'none' : '';
    $('submit').style.display = n === steps.length - 1 ? '' : 'none';
    if (n === 1) { U.renderDetails($('details'), s, () => U.renderSummary($('summary'), s)); U.renderSummary($('summary'), s); }
    if (n === 4) renderReview();
    $('summaryCol').style.display = n >= 1 ? '' : 'none';
    if (n >= 2) U.renderSummary($('summary'), s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function collect() { ['date', 'time', 'altDate', 'name', 'email', 'phone', 'address', 'city', 'zip', 'notes'].forEach(k => info[k] = $(k).value.trim()); info.agree = $('agree').checked; }

  function validate(n) {
    collect(); const set = (id, m) => { $(id + 'Err').textContent = m || ''; return !m; };
    if (n === 2) {
      let ok = set('date', info.date ? '' : 'Please choose a preferred date.');
      ok = set('time', info.time ? '' : 'Please choose an arrival window.') && ok;
      return ok;
    }
    if (n === 3) {
      let ok = true;
      ok = set('name', info.name ? '' : 'Please enter your name.') && ok;
      ok = set('email', /^\S+@\S+\.\S+$/.test(info.email) ? '' : 'Enter a valid email — confirmations are sent here.') && ok;
      ok = set('address', info.address ? '' : 'Street address is required.') && ok;
      ok = set('city', info.city ? '' : 'City is required.') && ok;
      ok = set('zip', /^(0[12]\d{3}|05501|05544)$/.test(info.zip) ? '' : 'Enter a Massachusetts ZIP code (e.g. 02139).') && ok;
      return ok;
    }
    if (n === 4) return set('agree', info.agree ? '' : 'Please accept the terms to continue.');
    return true;
  }

  function renderReview() {
    collect(); const e = P.estimate(s);
    $('review').innerHTML = `<table style="width:100%;border-collapse:collapse">
      ${[['Service', e.svc.name], ['Preferred date', info.date], ['Arrival window', info.time], ['Backup date', info.altDate || '—'],
         ['Name', info.name], ['Email', info.email], ['Phone', info.phone || '—'], ['Address', `${info.address}, ${info.city}, MA ${info.zip}`], ['Notes', info.notes || '—'],
         ['Estimated total', P.fmt(e.total)]].map(([k, v]) => `<tr><td style="padding:6px 0;color:var(--muted);width:40%">${k}</td><td></td><td style="padding:6px 0"><b>${esc(v)}</b></td></tr>`).join('')}</table>`;
  }
  const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function bodyText() {
    const e = P.estimate(s);
    const lines = e.lines.map(l => `  - ${l.label}: ${P.fmt(l.amount)}`).join('\n');
    return `NEW BOOKING REQUEST — ${C.business.name}\n\nService: ${e.svc.name}\n${lines}\n` +
      (e.minApplied ? `  - Minimum job price applied: ${P.fmt(e.subtotal)}\n` : '') +
      (e.discount ? `  - ${C.recurring[s.freq].label} discount: -${P.fmt(e.discount)}\n` : '') +
      `Estimated total: ${P.fmt(e.total)}\n\nPreferred date: ${info.date}\nArrival window: ${info.time}\nBackup date: ${info.altDate || '-'}\n\n` +
      `Name: ${info.name}\nEmail: ${info.email}\nPhone: ${info.phone || '-'}\nAddress: ${info.address}, ${info.city}, MA ${info.zip}\nNotes: ${info.notes || '-'}\n\n` +
      `Customer accepted Terms of Service, including the ${P.fmt(C.cancelFee)} cancellation fee.`;
  }

  async function submit() {
    if (!validate(4)) return;
    const e = P.estimate(s), body = bodyText(), subject = `Booking request: ${e.svc.name} — ${info.name}`;
    $('submit').disabled = true;
    let delivered = false;
    if (C.formEndpoint) {
      try {
        const r = await fetch(C.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ subject, message: body, email: info.email, name: info.name }) });
        delivered = r.ok;
      } catch (err) {}
      if (!delivered) { $('submit').disabled = false; $('sendErr').textContent = 'Something went wrong sending your request. Please try again or email us directly.'; return; }
    } else {
      location.href = `mailto:${C.business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    $('flow').style.display = 'none';
    const venmo = `https://venmo.com/u/${C.business.venmo}`;
    $('done').style.display = 'block';
    $('done').innerHTML = `<h2>${delivered ? 'Request received!' : 'Almost done — send the email'}</h2>
      ${delivered ? `<p>Thanks, ${esc(info.name)}. We'll confirm your booking and final price by email at <b>${esc(info.email)}</b>.</p>`
      : `<p>Your email app should have opened with your booking details. <b>Press Send</b> to submit your request. If nothing opened, email the details to <a href="mailto:${C.business.email}">${C.business.email}</a>.</p>`}
      <div class="callout"><b>Paying</b><br>We accept Venmo: <a href="${venmo}" target="_blank" rel="noopener">@${C.business.venmo}</a>.
      Please wait for our confirmation of your final price before sending payment. Include your name and service date in the Venmo note.</div>
      <p class="note">Cancelling a confirmed booking carries a ${P.fmt(C.cancelFee)} fee. See our <a href="terms.html">Terms</a>.</p>
      <a class="btn" href="index.html">Back to home</a>`;
  }

  $('next').addEventListener('click', () => { if (validate(cur)) showStep(cur + 1); });
  $('back').addEventListener('click', () => showStep(cur - 1));
  $('submit').addEventListener('click', submit);
  $('cancelFee').textContent = P.fmt(C.cancelFee);
  showStep(new URLSearchParams(location.search).has('resume') ? 1 : 0);
})();
