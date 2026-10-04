(function () {
  const $ = (s) => document.querySelector(s);
  // Device presets (capabilities documents, abbreviated). Real devices publish their own.
  const DEVICES = {
    hob_robot: { name: 'Kitchen robot with hob and thermometers', capabilities: {
      ops: ['cw.op.cut', 'cw.op.heat', 'cw.op.saute', 'cw.op.simmer', 'cw.op.season', 'cw.op.form_wells', 'cw.op.crack', 'cw.op.garnish', 'cw.op.serve'].map((op) => ({ op })),
      sensors: [{ sensor: 'cw.sense.pan_surface_temp' }, { sensor: 'cw.sense.liquid_temp' }, { sensor: 'cw.sense.vision', visionCues: ['cw.sense.translucent', 'cw.sense.egg_whites_set'] }] } },
    hob_robot_basic: { name: 'Kitchen robot with hob, no thermometers', capabilities: {
      ops: ['cw.op.cut', 'cw.op.heat', 'cw.op.saute', 'cw.op.simmer', 'cw.op.season', 'cw.op.form_wells', 'cw.op.crack', 'cw.op.garnish', 'cw.op.serve'].map((op) => ({ op })),
      sensors: [] } },
    arm: { name: 'Counter robot arm (cuts, cracks, moves)', capabilities: {
      ops: [{ op: 'cw.op.cut' }, { op: 'cw.op.crack' }, { op: 'cw.op.transfer' }],
      sensors: [{ sensor: 'cw.sense.vision', visionCues: ['cw.sense.translucent', 'cw.sense.egg_whites_set'] }] } },
    oven: { name: 'Smart oven with a core probe', capabilities: {
      ops: [{ op: 'cw.op.bake' }, { op: 'cw.op.roast' }, { op: 'cw.op.heat' }],
      sensors: [{ sensor: 'cw.sense.oven_temp' }, { sensor: 'cw.sense.core_temp' }] } }
  };
  const RUNG = { sensor: 'Sensor', model: 'Estimate (logged)', time: 'Time only', human: 'Person' };
  let recipe = null; let ops = null;

  function stepText(node) {
    const t = recipe.text && recipe.text.en && recipe.text.en.steps && recipe.text.en.steps[node.id];
    if (t) return t;
    const verb = CookwalaDryRun.opLabel(node.op);
    return verb.charAt(0).toUpperCase() + verb.slice(1) + (node.inputs && node.inputs.length ? ' ' + node.inputs.join(', ').replace(/_/g, ' ') : '');
  }
  function band(env) {
    if (!env || !env.tempC) return env && env.unattended === false ? 'person nearby' : '—';
    return `${env.medium.replace('_', ' ')} ${env.tempC.min}–${env.tempC.max} °C`;
  }
  function cell(row, text, cls) { const td = document.createElement('td'); if (cls) td.className = cls; if (text instanceof Node) td.append(text); else td.textContent = text; row.append(td); }
  function pill(text, cls) { const s = document.createElement('span'); s.className = `pill ${cls}`; s.textContent = text; return s; }

  function render() {
    if (!recipe || !ops) return;
    const dev = DEVICES[$('#dDevice').value];
    const res = CookwalaDryRun.dryRun(recipe, dev, ops, $('#dHuman').checked, $('#dModel').checked);
    const v = $('#verdict'); v.className = 'verdict ' + (res.state === 'accepted' ? 'ok' : 'bad'); v.textContent = '';
    const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = res.state === 'accepted' ? 'ACCEPTED' : 'REFUSED';
    v.append(tag);
    if (res.state === 'accepted') {
      const d = res.plan.filter((p) => p.by === 'device').length;
      const watched = res.plan.filter((p) => p.by === 'device' && p.verifiedBy === 'human').length;
      const est = res.plan.filter((p) => p.verifiedBy === 'model').length;
      v.append(`The ${dev.name.toLowerCase()} can cook this: ${d} of ${res.plan.length} steps by the device, ${res.plan.length - d} by a person.`
        + (watched ? ` A person must watch ${watched} of the device's steps, because nothing on it can check them.` : '')
        + (est ? ` ${est} steps rely on logged estimates.` : ''));
    } else {
      v.append(`Before anything heats up: ${res.refusal.detail} (step ${res.refusal.node}, reason ${res.refusal.reason}).`);
    }
    const tb = $('#steps tbody'); tb.textContent = '';
    const planned = new Map(res.plan.map((p) => [p.node.id, p]));
    for (const node of recipe.process.nodes) {
      const tr = document.createElement('tr'); const p = planned.get(node.id); const env = (ops[node.op] || {}).envelope;
      const refusedHere = res.state === 'refused' && res.refusal.node === node.id;
      if (refusedHere) tr.className = 'refused'; else if (!p) tr.className = 'pending';
      cell(tr, stepText(node)); cell(tr, node.op.replace('cw.op.', ''), 'op'); cell(tr, band(env), 'band');
      if (p) { cell(tr, pill(p.by === 'device' ? 'Device' : 'Person', p.by)); cell(tr, RUNG[p.verifiedBy] + (p.rung && p.verifiedBy === 'sensor' ? ` · ${p.rung.replace('cw.sense.', '')}` : '')); }
      else if (refusedHere) { cell(tr, pill('Refused', 'no')); cell(tr, res.refusal.reason.replace(/_/g, ' ')); }
      else { cell(tr, '—'); cell(tr, 'not reached'); }
      tb.append(tr);
    }
  }

  function stats() {
    fetch('/v1/stats.json').then((r) => r.ok ? r.json() : Promise.reject()).then((s) => {
      const box = $('#stats'); box.textContent = '';
      const order = ['opsWithEnvelopes', 'conformanceVectors', 'safetyLimits', 'agentSafetyTests', 'humanitarianRules', 'schemas', 'publishedRecipes', 'recipesInConversion'];
      for (const k of order) {
        const f = s.figures[k]; if (!f) continue;
        const d = document.createElement('div'); d.className = 'stat' + (f.kind === 'planned' ? ' planned' : '');
        const kk = document.createElement('span'); kk.className = 'k'; kk.textContent = f.kind;
        const vv = document.createElement('span'); vv.className = 'v'; vv.textContent = f.value.toLocaleString('en-US');
        const ll = document.createElement('span'); ll.className = 'l'; ll.textContent = f.label;
        d.append(kk, vv, ll); box.append(d);
      }
      $('#statsMeta').textContent = `Generated ${s.generatedAt.slice(0, 10)} from commit ${s.commit}. Core ${s.core}.`;
    }).catch(() => { $('#statsMeta').textContent = 'Live figures are unavailable right now; see the repository.'; });
  }

  const sel = $('#dDevice');
  for (const [k, d] of Object.entries(DEVICES)) { const o = document.createElement('option'); o.value = k; o.textContent = d.name; sel.append(o); }
  ['#dDevice', '#dHuman', '#dModel'].forEach((s) => $(s).addEventListener('change', render));
  $('#demoForm').addEventListener('submit', (e) => e.preventDefault());
  Promise.all([fetch('/v1/recipes/shakshuka.cookwala.json').then((r) => r.json()), fetch('/v1/vocab/ops.json').then((r) => r.json())])
    .then(([r, v]) => { recipe = r; ops = Object.fromEntries(v.entries.map((e) => [e.id, e])); render(); })
    .catch(() => { $('#verdict').textContent = 'The demo could not load its data. Try the command-line dry run in the quickstart.'; });
  stats();
})();
