/* Recipe viewer for the machine-translated languages: loads the document and the language sidecar. */
(function () {
  var root = document.getElementById('recipeView'); if (!root) return;
  var lang = root.getAttribute('data-lang'); var id = new URLSearchParams(location.search).get('id'); if (!id || !/^[a-z0-9-]+$/.test(id)) return;
  var $ = function (s) { return document.getElementById(s); };
  Promise.all([fetch('/v1/recipes/' + id + '.cookwala.json').then(function (r) { return r.json(); }), fetch('/v1/recipes/' + id + '/text/' + lang + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })]).then(function (res) {
    var d = res[0], s = res[1] || {}; var names = d.dish.names || {};
    var title = s.title || names[lang] || names.en || id; $('rvTitle').textContent = title; document.title = title + ' · ' + document.title;
    $('rvMeta').textContent = (d.yield && d.yield.servings ? d.yield.servings + ' · ' : '') + (d.source && d.source.collection || '') + ' · ' + (d.license || '');
    var ings = s['x-ingredients'] || {};
    d.ingredients.forEach(function (i) { var li = document.createElement('li'); var n = document.createElement('span'); var e = ings[i.ref] || {}; n.textContent = e.name || (i.display && (i.display.en || i.display.ar)) || i.ref; var qv = document.createElement('span'); qv.className = 'qty'; qv.textContent = e.standardAmount || (i.display && (i.display.en || i.display.ar)) || ''; li.append(n, qv); $('rvIngs').append(li); });
    var steps = s.legacySteps || (d.text && ((d.text[lang] || d.text.en || d.text.ar) || {}).legacySteps) || [];
    steps.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; $('rvSteps').append(li); });
    var links = $('rvLinks'); var a = document.createElement('a'); a.className = 'btn'; a.href = '/v1/recipes/' + id + '.cookwala.json'; a.textContent = 'JSON'; links.append(a);
    if (d.legacy && d.legacy.pageUrl) { var b = document.createElement('a'); b.className = 'btn'; b.href = d.legacy.pageUrl; b.rel = 'noopener'; b.textContent = 'fifi.cooking'; links.append(b); }
    $('rvSource').textContent = (d.source && d.source.name || '') + '. ' + (d.source && d.source.citation || '');
    if (s.culturalNotes) { var p = document.createElement('p'); p.className = 'lead'; p.textContent = s.culturalNotes; root.append(p); }
  }).catch(function () { $('rvTitle').textContent = id; });
})();
