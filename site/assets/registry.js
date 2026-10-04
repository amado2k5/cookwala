/* Registry and directory browser: reads the static /v1 files. Empty-state honest. */
(function () {
  var $ = function (s) { return document.querySelector(s); }; var AR = document.documentElement.lang === 'ar';
  var entries = [];
  function td(tr, text, mono) { var c = document.createElement('td'); if (mono) c.style.fontFamily = 'var(--mono)'; if (text instanceof Node) c.append(text); else c.textContent = text; tr.append(c); return c; }
  function renderReg() {
    var tb = $('#regTable tbody'); if (!tb) return; tb.textContent = '';
    var kind = $('#regKind').value; var q = ($('#regQ').value || '').toLowerCase();
    var rows = entries.filter(function (e) { return (!kind || e.kind === kind) && (!q || (e.name + ' ' + (e.tags || []).join(' ') + ' ' + (e.description || '')).toLowerCase().indexOf(q) !== -1); });
    if (!rows.length) { var tr = document.createElement('tr'); td(tr, AR ? 'لا توجد مدخلات بعد لهذا النوع. عندما ينشر أحد تحت فضاء أسماء مُثبت الملكية، سيظهر هنا.' : 'No entries yet for this kind. When someone publishes under a proven namespace, it appears here.').colSpan = 6; tb.append(tr); return; }
    rows.forEach(function (e) { var tr = document.createElement('tr'); var a = document.createElement('a'); a.href = e.url; a.textContent = e.name; a.rel = 'noopener'; td(tr, a, true); td(tr, e.kind.replace(/_/g, ' ')); td(tr, e.version || '—', true); td(tr, e.status); td(tr, e.verification ? e.verification.method.replace(/_/g, ' ') + ' · ' + e.verification.by : '—'); td(tr, e.description || ''); tb.append(tr); });
  }
  fetch('/v1/registry.json').then(function (r) { return r.json(); }).then(function (d) { entries = d.entries || []; renderReg(); var n = $('#regNote'); if (n && d.generatedAt) n.append(' ' + (AR ? 'أُنشئ ' : 'Generated ') + d.generatedAt.slice(0, 10) + '.'); }).catch(function () { var tb = $('#regTable tbody'); if (tb) tb.textContent = ''; });
  ['#regKind', '#regQ'].forEach(function (s) { var e = $(s); if (e) e.addEventListener('input', renderReg); });
  var f = $('#regForm'); if (f) f.addEventListener('submit', function (e) { e.preventDefault(); });
  fetch('/v1/directory.json').then(function (r) { return r.json(); }).then(function (d) {
    var tb = $('#dirTable tbody'); if (!tb) return; tb.textContent = '';
    (d.entries || []).forEach(function (e) { var tr = document.createElement('tr'); var a = document.createElement('a'); a.href = e.url || '#'; a.textContent = e.name; a.rel = 'noopener'; td(tr, a); td(tr, e.roles.map(function (r) { return r.replace(/_/g, ' '); }).join(', ')); td(tr, e.country); td(tr, e.verification ? e.verification.method.replace(/_/g, ' ') : '—'); td(tr, (e.conformance || []).length ? (e.conformance.length + (AR ? ' تقرير' : ' report(s)')) : (AR ? 'لا تقارير' : 'no reports')); tb.append(tr); });
  }).catch(function () {});
  var cards = $('#recipeCards');
  if (cards) {
    var ids = ['shakshuka', 'koshari', 'lentil-soup', 'molokhia', 'kofta-oven', 'rice-vermicelli', 'ful-medames', 'salata-baladi', 'basbousa'];
    Promise.all(ids.map(function (id) { return fetch('/v1/recipes/' + id + '.cookwala.json').then(function (r) { return r.json(); }).catch(function () { return null; }); })).then(function (rs) {
      cards.textContent = '';
      rs.forEach(function (r, i) { if (!r) return; var a = document.createElement('a'); a.className = 'card'; a.href = '/v1/recipes/' + ids[i] + '.cookwala.json';
        var h = document.createElement('h3'); h.textContent = (AR && r.dish.names.ar ? r.dish.names.ar + ' · ' : '') + r.dish.names.en; var p = document.createElement('p'); p.textContent = (r.text[AR ? 'ar' : 'en'] || r.text.en).intro || '';
        var m = document.createElement('p'); m.className = 'note'; m.textContent = r.process.nodes.length + (AR ? ' خطوة · ' : ' steps · ') + r.yield.servings + (AR ? ' حصة · ' : ' servings · ') + r.verification.level + ' · ' + ((r.safety.allergens.eu14 || []).length ? (AR ? 'مسببات حساسية: ' : 'allergens: ') + r.safety.allergens.eu14.join(', ') : (AR ? 'بلا مسببات حساسية معلنة' : 'no declared allergens'));
        var g = document.createElement('span'); g.className = 'go'; g.textContent = 'JSON →'; a.append(h, p, m, g); cards.append(a); });
    });
  }
})();
