/* The MCP page playground: the shared pure core (/assets/mcp-core/, same files the npm package runs)
   against the live /v1/ files of this site. No other origin is contacted. */
(function () {
  var root = document.getElementById('mcpPg'); if (!root) return;
  var out = document.querySelector('#mcpOut code');
  var $ = function (id) { return document.getElementById(id); };
  var show = function (v) { out.textContent = typeof v === 'string' ? v : JSON.stringify(v, null, 1); };
  var get = function (p) { return fetch(p).then(function (r) { var t = r.headers.get('content-type') || ''; if (!r.ok || /text\/html/.test(t)) throw new Error(p + ' is not available'); return r.json(); }); };
  var core, vocab, index, presets;
  var NOTE = 'Dry run only. Starting an execution needs a hub, a mandate with start_cooking, and the device enforces its own safety limits.';
  function fill(sel, items) { sel.innerHTML = ''; items.forEach(function (i) { var o = document.createElement('option'); o.value = i[0]; o.textContent = i[1]; sel.appendChild(o); }); }
  function onSubmit(id, fn) { $(id).addEventListener('submit', function (e) { e.preventDefault(); show('Working…'); Promise.resolve().then(fn).then(show).catch(function (err) { show({ error: String(err && err.message || err) }); }); }); }

  Promise.all([import('/assets/mcp-core/index.js'), get('/v1/manifest.json'), get('/v1/vocab/ops.json'), get('/v1/vocab/units.json'), get('/v1/capabilities/index.json')]).then(function (r) {
    core = r[0]; vocab = core.opsIndex(r[2], r[3]); presets = r[4].presets;
    var shards = r[1].shards.filter(function (s) { return /^\/v1\/index\/en\/\d+\.json$/.test(s.path); });
    return Promise.all(shards.map(function (s) { return get(s.path); }));
  }).then(function (pages) {
    index = [].concat.apply([], pages.map(function (p) { return p.items; }));
    var v1 = index.filter(function (e) { return e.level !== 'V0'; });
    fill($('dRecipe'), v1.map(function (e) { return [e.id, e.title]; }));
    fill($('dDevice'), presets.map(function (p) { return [p.id, p.name]; }));
    fill($('eOp'), Object.keys(vocab.ops).filter(function (k) { return vocab.ops[k].envelope && vocab.ops[k].envelope.tempC; }).map(function (k) { return [k, k]; }));
    $('eOp').value = 'cw.op.simmer';
    root.dataset.ready = '1';
    show('Ready. ' + index.length + ' recipes in the English index. Pick a tool and run it.');
  }).catch(function (e) { show({ error: 'Could not load the catalog: ' + e.message }); });

  onSubmit('mcpSearch', function () { var a = { query: $('qS').value, limit: 8 }; if ($('qNoMilk').checked) a.allergen_free = ['milk']; return core.searchRecipes(index, a); });
  onSubmit('mcpDry', function () {
    return get('/v1/recipes/' + $('dRecipe').value + '.cookwala.json').then(function (doc) {
      return get('/v1/capabilities/' + $('dDevice').value + '.json').then(function (dev) {
        var res = core.dryRun(vocab, doc, dev, { humanPresent: $('dHuman').checked });
        res.note = NOTE; if (res.plan && res.plan.length > 4) res.plan = res.plan.slice(0, 4).concat(['… ' + (res.plan.length - 4) + ' more steps']);
        return res;
      });
    });
  });
  onSubmit('mcpEnv', function () {
    var rs = $('eRead').value.split(/[,\s]+/).filter(Boolean).map(function (x, i) { return { t: i * 60, tempC: Number(x) }; });
    if (!rs.length || rs.some(function (r) { return !isFinite(r.tempC); })) throw new Error('give numbers, for example 60, 94, 99');
    return core.checkEnvelope(vocab, $('eOp').value, rs, null, 0);
  });
  onSubmit('mcpSms', function () { return core.parseSms($('sText').value); });
  onSubmit('mcpGet', function () {
    var id = $('gId').value.trim(); if (!/^[a-z0-9][a-z0-9._-]{0,80}$/i.test(id)) throw new Error('bad id');
    return get('/v1/recipes/' + id + '.cookwala.json').then(function (doc) {
      return core.docHash(doc).then(function (h) { var lvl = doc.verification && doc.verification.level; return { id: id, hash: h, hashVerified: !!doc.hash && h === doc.hash, level: lvl, levelNote: core.LEVEL_NOTE[lvl], summary: core.recipeView(doc, 'summary') }; });
    });
  });
})();
