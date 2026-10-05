/* Recipe index: client-side search over the compact per-language index (/v1/index/<lang>/search.json),
   plus English and Arabic titles so a name can be typed in any script. No network beyond /v1 files. */
(function () {
  var $ = function (s) { return document.querySelector(s); }; var cards = $('#rcards'); if (!cards) return;
  var lang = document.documentElement.lang; var q = $('#rq'), lvl = $('#rlevel'), course = $('#rcourse'), coll = $('#rcoll'), count = $('#rcount'), more = $('#rmore');
  var items = [], shown = 0, PAGE = 48, titles = {};
  function href(id) { return lang === 'en' ? '/recipes/' + id + '/' : lang === 'ar' ? '/ar/recipes/' + id + '/' : '/' + lang + '/recipes/view/?id=' + encodeURIComponent(id); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFKD').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'); }
  function filtered() {
    var s = norm(q.value.trim());
    return items.filter(function (r) {
      if (lvl.value && r.l !== lvl.value) return false; if (course.value && r.c !== course.value) return false; if (coll.value && r.k !== coll.value) return false;
      if (!s) return true; var t = titles[r.id] || {}; return norm(r.t).indexOf(s) >= 0 || norm(t.en).indexOf(s) >= 0 || norm(t.ar).indexOf(s) >= 0 || r.id.indexOf(s) >= 0;
    });
  }
  function render(reset) {
    var list = filtered(); if (reset) { cards.textContent = ''; shown = 0; }
    var tpl = (count.getAttribute('data-tpl') || '{n}');
    count.textContent = tpl.replace('{n}', list.length);
    list.slice(shown, shown + PAGE).forEach(function (r) {
      var a = document.createElement('a'); a.className = 'card rcard'; a.href = href(r.id);
      var h = document.createElement('h3'); h.textContent = r.t || r.id; a.append(h);
      var m = document.createElement('p'); m.className = 'meta'; m.innerHTML = '<span class="lvl">' + r.l + '</span> · ' + (r.c || '') + ' · ' + (r.k || ''); a.append(m); cards.append(a);
    });
    shown = Math.min(shown + PAGE, list.length); more.hidden = shown >= list.length;
  }
  function fill(sel, values) { values.sort().forEach(function (v) { var o = document.createElement('option'); o.value = v; o.textContent = v; sel.append(o); }); }
  Promise.all(['/v1/index/' + lang + '/search.json', '/v1/index/en/search.json', '/v1/index/ar/search.json'].map(function (u) { return fetch(u).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); })).then(function (res) {
    items = res[0].length ? res[0] : res[1];
    res[1].forEach(function (r) { titles[r.id] = titles[r.id] || {}; titles[r.id].en = r.t; }); res[2].forEach(function (r) { titles[r.id] = titles[r.id] || {}; titles[r.id].ar = r.t; });
    fill(course, Array.from(new Set(items.map(function (r) { return r.c; }).filter(Boolean)))); fill(coll, Array.from(new Set(items.map(function (r) { return r.k; }).filter(Boolean))));
    count.setAttribute('data-tpl', count.textContent || '{n}'); render(true);
    var p = new URLSearchParams(location.search).get('q'); if (p) { q.value = p; render(true); }
  });
  [q, lvl, course, coll].forEach(function (el) { el.addEventListener('input', function () { render(true); }); });
  more.addEventListener('click', function () { render(false); });
  $('#recipeSearch').addEventListener('submit', function (e) { e.preventDefault(); render(true); });
})();
