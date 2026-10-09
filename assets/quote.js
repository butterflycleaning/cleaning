(function () {
  const C = window.HIB, P = window.HIBPricing, U = window.HIBUI;
  const q = new URLSearchParams(location.search).get('svc');
  const s = P.defaults(C.services.some(x => x.id === q) ? q : 'standard');

  const picker = document.getElementById('svc');
  picker.innerHTML = ['Residential', 'Commercial'].map(g => `<optgroup label="${g}">` +
    C.services.filter(x => x.group === g).map(x => `<option value="${x.id}">${x.name}</option>`).join('') + '</optgroup>').join('');
  picker.value = s.service;

  const details = document.getElementById('details'), sum = document.getElementById('summary'), book = document.getElementById('bookBtn');
  function draw() { U.renderDetails(details, s, update); update(); }
  function update() {
    U.renderSummary(sum, s);
    try { sessionStorage.setItem('hib-state', JSON.stringify(s)); } catch (e) {}
  }
  picker.addEventListener('change', () => { Object.assign(s, P.defaults(picker.value)); draw(); });
  book.addEventListener('click', () => { location.href = 'book.html?resume=1'; });
  draw();
})();
