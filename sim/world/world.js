import { simulateAll, REGIONS, COUNTRY_REGION, SCENARIOS, METRICS, QUARTERS, START_YEAR, scenarioId, adoptionAt, coverageAt } from './engine.js?v=0.4.0';

const $ = (s) => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const fmt = (v, d = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const el = (name, attrs, parent, text) => { const n = document.createElementNS(SVGNS, name); for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v); if (text != null) n.textContent = text; if (parent) parent.append(n); return n; };
const M = (id) => METRICS.find((m) => m.id === id);
const ALL = QUARTERS.length; // slider value meaning "all five years"
const state = { cfg: JSON.parse(JSON.stringify(REGIONS)), all: null, robots: 'many', protocol: true, metric: 'foodWasted', q: ALL, playing: false, timer: null, topo: null };
const sel = () => state.all[scenarioId(state.robots, state.protocol)];
const base = () => state.all['none-off'];
const SC = (id) => SCENARIOS.find((s) => s.id === id);
const COLORS = { 'many-off': 'var(--alone)', 'many-on': 'var(--proto)', 'few-off': 'var(--few)', 'few-on': 'var(--few)', 'none-on': 'var(--few)', 'none-off': 'var(--base)' };

// ---------- values ----------
const pick = (R, q = state.q) => (q === ALL ? R.total : R.quarters[q]);
const regionOf = (run, id) => run.regions.find((r) => r.id === id);
function change(sR, bR, metricId, q = state.q) {
  const s = pick(sR, q)[metricId]; const b = pick(bR, q)[metricId];
  return { s, b, pct: b ? ((s - b) / b) * 100 : null };
}
function improvement(sR, bR, metricId, q) {
  const c = change(sR, bR, metricId, q); if (c.pct == null) return null;
  return M(metricId).good === 'up' ? c.pct : -c.pct;
}
const pctOf = (s, b) => (b ? ((s - b) / b) * 100 : null);
const signed = (p, d = 1) => (p == null ? '—' : `${p > 0 ? '+' : p < 0 ? '−' : ''}${fmt(Math.abs(p), d)} %`);
const CLASSES = [
  { max: -5, color: 'var(--div-worse-2)', label: 'worse >5 %' }, { max: -1, color: 'var(--div-worse-1)', label: 'worse 1–5 %' },
  { max: 1, color: 'var(--div-mid)', label: 'about the same' }, { max: 3, color: 'var(--div-better-1)', label: 'better 1–3 %' },
  { max: 6, color: 'var(--div-better-2)', label: 'better 3–6 %' }, { max: 10, color: 'var(--div-better-3)', label: 'better 6–10 %' },
  { max: Infinity, color: 'var(--div-better-4)', label: 'better >10 %' }
];
const colorFor = (imp) => (imp == null ? 'var(--div-mid)' : CLASSES.find((c) => imp <= c.max).color);
const periodLabel = (q = state.q) => (q === ALL ? '2027–2031' : QUARTERS[q]);

// ---------- tooltip ----------
function showTip(e, title, rows) {
  const t = $('#tip'); t.hidden = false; t.innerHTML = '';
  const h = document.createElement('div'); h.className = 'muted'; h.textContent = title; t.append(h);
  for (const [name, val, color] of rows) {
    const r = document.createElement('div'); r.className = 'row'; if (color) r.style.setProperty('--c', color);
    const i = document.createElement('i'); if (!color) i.style.visibility = 'hidden';
    const b = document.createElement('b'); b.textContent = val; const s = document.createElement('span'); s.className = 'muted'; s.textContent = name;
    r.append(i, b, s); t.append(r);
  }
  t.style.left = `${Math.min(window.innerWidth - t.offsetWidth - 8, e.clientX + 14)}px`; t.style.top = `${Math.min(window.innerHeight - t.offsetHeight - 8, e.clientY + 14)}px`;
}
const hideTip = () => { $('#tip').hidden = true; };
function regionTip(e, id) {
  const sR = regionOf(sel(), id); const bR = regionOf(base(), id); const mt = M(state.metric); const c = change(sR, bR, state.metric);
  const q = state.q === ALL ? ALL - 1 : state.q; const imp = improvement(sR, bR, state.metric);
  showTip(e, `${sR.name} · ${periodLabel()}`, [
    [SC(scenarioId(state.robots, state.protocol)).short, `${fmt(c.s * mt.scale, 1)} ${mt.unit}`, COLORS[scenarioId(state.robots, state.protocol)]],
    ['no robots, no protocol', `${fmt(c.b * mt.scale, 1)} ${mt.unit}`, 'var(--base)'],
    ['change', imp == null ? '—' : `${imp >= 0 ? 'better' : 'worse'} ${fmt(Math.abs(imp), 1)} %`, null],
    [`robot homes (${QUARTERS[q]})`, `${fmt(sR.share[q] * 100, 1)} %`, null],
    ['food system on the protocol', `${fmt(sR.coverage[q] * 100, 0)} %`, null],
    ['hungry people', `${fmt(pick(bR).hungry / 1e6, 0)} M`, null]
  ]);
}

// ---------- controls ----------
function init() {
  const ms = $('#metric');
  for (const m of METRICS.filter((x) => x.good === 'down')) ms.append(new Option(m.label, m.id));
  ms.value = state.metric;
  ms.addEventListener('change', () => { state.metric = ms.value; renderPeriod(); });
  document.querySelectorAll('[data-robots]').forEach((b) => b.addEventListener('click', () => { state.robots = b.dataset.robots; renderAll(); }));
  document.querySelectorAll('[data-protocol]').forEach((b) => b.addEventListener('click', () => { state.protocol = b.dataset.protocol === 'on'; renderAll(); }));
  $('#quarter').addEventListener('input', (e) => { state.q = Number(e.target.value); renderPeriod(); });
  $('#play').addEventListener('click', () => (state.playing ? stop() : play()));
  $('#editToggle').addEventListener('click', (e) => { const ed = $('#editor'); ed.hidden = !ed.hidden; e.currentTarget.setAttribute('aria-expanded', String(!ed.hidden)); e.currentTarget.textContent = ed.hidden ? 'Edit regions ▾' : 'Edit regions ▴'; });
  try { const saved = JSON.parse(localStorage.getItem('cookwala-world') || 'null'); if (saved) { state.robots = saved.robots || state.robots; state.protocol = saved.protocol ?? state.protocol; } } catch { /* storage unavailable */ }
  renderEditor(); renderMethod(); run(); loadMap();
}
function run() { state.all = simulateAll(state.cfg); renderAll(); }
function renderAll() {
  document.querySelectorAll('[data-robots]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.robots === state.robots)));
  document.querySelectorAll('[data-protocol]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.protocol === 'on') === state.protocol)));
  try { localStorage.setItem('cookwala-world', JSON.stringify({ robots: state.robots, protocol: state.protocol })); } catch { /* storage unavailable */ }
  const id = scenarioId(state.robots, state.protocol);
  const notes = {
    'none-off': 'This is the reference world: households cook as today, without robots or the protocol. Pick robots or the protocol to see what changes.',
    'few-off': 'Robot cooks reach mainly wealthy homes (12 % in North America, under 1 % in Sub-Saharan Africa by 2031). No protocol.',
    'none-on': 'No robot cooks at all, but stores, farms, logistics, relief programs and people\'s apps use the protocol.',
    'few-on': 'Robot cooks mainly in wealthy homes; the food system everywhere uses the protocol.',
    'many-off': 'Robot cooks spread fast (45 % of homes in North America and East Asia, 3 % in Sub-Saharan Africa by 2031) but each works through its vendor\'s app: robots alone.',
    'many-on': 'The same robots, plus the Cookwala protocol across robots, stores, farms, logistics and relief programs.'
  };
  $('#scenarioNote').innerHTML = `<b>${SC(id).label}.</b> ${notes[id]}`;
  renderPeriod(); renderFutures(); renderCompare(); renderKpis(); renderInsights(); renderCharts(); renderRegions();
}
function renderEditor() {
  const ed = $('#editor');
  ed.innerHTML = '<h2>Regional assumptions for 2031</h2><p class="muted small">Robot-cook homes by the end of 2031 in the <b>Many</b> and <b>Few</b> scenarios (S-curve from 1/12 of the target in 2027; rural homes adopt at half the rate), and the share of the food system on the protocol when it is on (reached by about 2029).</p>';
  const t = document.createElement('table'); t.className = 'data editor-table';
  t.innerHTML = '<thead><tr><th>Region</th><th>Many robots %</th><th>Few robots %</th><th>Protocol coverage %</th><th>Note</th></tr></thead>';
  const tb = document.createElement('tbody');
  state.cfg.forEach((r) => {
    const tr = document.createElement('tr');
    const td = (child) => { const c = document.createElement('td'); if (typeof child === 'string') c.textContent = child; else c.append(child); tr.append(c); };
    td(r.name);
    for (const k of ['many', 'few', 'coverage']) {
      const inp = document.createElement('input'); inp.type = 'number'; inp.min = 0; inp.max = 100; inp.step = 0.5; inp.value = +(r[k] * 100).toFixed(1); inp.setAttribute('aria-label', `${r.name} ${k}`);
      inp.addEventListener('change', () => { r[k] = Math.max(0, Math.min(100, Number(inp.value))) / 100; run(); });
      td(inp);
    }
    td(r.note || '');
    tb.append(tr);
  });
  t.append(tb); ed.append(t);
  const reset = document.createElement('button'); reset.textContent = 'Reset to defaults';
  reset.addEventListener('click', () => { state.cfg = JSON.parse(JSON.stringify(REGIONS)); renderEditor(); run(); });
  ed.append(reset);
}
function play() { state.playing = true; $('#play').textContent = '⏸'; if (state.q >= ALL) state.q = -1; state.timer = setInterval(() => { state.q += 1; $('#quarter').value = state.q; renderPeriod(); if (state.q >= ALL) stop(); }, 700); }
function stop() { state.playing = false; clearInterval(state.timer); $('#play').textContent = '▶'; }
function renderPeriod() { $('#quarterLabel').textContent = periodLabel(); renderMap(); renderRegBars(); }

// ---------- map (Equal Earth projection of Natural Earth 110m) ----------
const EE = { A1: 1.340264, A2: -0.081106, A3: 0.000893, A4: 0.003796, M: Math.sqrt(3) / 2, k: 173.8, cx: 480, cy: 232 };
function project([lon, lat]) {
  const l = (lon * Math.PI) / 180; const t = Math.asin(EE.M * Math.sin((lat * Math.PI) / 180)); const t2 = t * t; const t6 = t2 * t2 * t2;
  const x = (l * Math.cos(t)) / (EE.M * (EE.A1 + 3 * EE.A2 * t2 + t6 * (7 * EE.A3 + 9 * EE.A4 * t2)));
  const y = t * (EE.A1 + EE.A2 * t2 + t6 * (EE.A3 + EE.A4 * t2));
  return [EE.cx + x * EE.k, EE.cy - y * EE.k];
}
function topoPaths(topo) {
  const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
  const arcs = topo.arcs.map((arc) => { let x = 0; let y = 0; return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const ring = (idx) => { const pts = []; idx.forEach((i, n) => { const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse(); pts.push(...(n ? a.slice(1) : a)); }); return pts; };
  // rings crossing the antimeridian (Russia, Fiji) are unwrapped and drawn twice, ±360°; the globe outline clips them
  const path = (pts) => `M${pts.map((p) => project(p).map((v) => v.toFixed(1)).join(' ')).join('L')}Z`;
  const d = (rings) => rings.map((r) => {
    const pts = ring(r); const un = [pts[0]];
    for (let i = 1; i < pts.length; i++) { let lon = pts[i][0]; const prev = un[i - 1][0]; while (lon - prev > 180) lon -= 360; while (lon - prev < -180) lon += 360; un.push([lon, pts[i][1]]); }
    const lo = Math.min(...un.map((p) => p[0])); const hi = Math.max(...un.map((p) => p[0]));
    if (lo >= -180 && hi <= 180) return path(pts);
    const shift = hi > 180 ? -360 : 360;
    return path(un) + path(un.map(([x, y]) => [x + shift, y]));
  }).join('');
  return topo.objects.countries.geometries.map((g) => ({ name: g.properties.name, d: g.type === 'Polygon' ? d(g.arcs) : g.type === 'MultiPolygon' ? g.arcs.map(d).join('') : '' }));
}
async function loadMap() {
  try { state.topo = topoPaths(await (await fetch('countries-110m.json')).json()); } catch { state.topo = []; }
  renderMap();
}
function renderMap() {
  const svg = $('#map'); if (!state.all) return; svg.innerHTML = '';
  const mt = M(state.metric);
  $('#mapTitle').textContent = `${mt.label}: change vs no-robot world · ${periodLabel()}`;
  const groups = {};
  for (const r of state.cfg) {
    const imp = improvement(regionOf(sel(), r.id), regionOf(base(), r.id), state.metric);
    const g = el('g', { 'data-region': r.id, fill: colorFor(imp), tabindex: 0, role: 'img', 'aria-label': `${r.name}: ${imp == null ? 'no change' : `${imp >= 0 ? 'better' : 'worse'} ${fmt(Math.abs(imp), 1)} %`}` }, svg);
    g.addEventListener('pointermove', (e) => { g.classList.add('region-hover'); regionTip(e, r.id); });
    g.addEventListener('pointerleave', () => { g.classList.remove('region-hover'); hideTip(); });
    g.addEventListener('focus', () => { const b = g.getBoundingClientRect(); regionTip({ clientX: b.left + b.width / 2, clientY: b.top + b.height / 2 }, r.id); });
    g.addEventListener('blur', hideTip);
    groups[r.id] = g;
  }
  const outline = [];
  for (let lat = -90; lat <= 90; lat += 5) outline.push([180, lat]);
  for (let lat = 90; lat >= -90; lat -= 5) outline.push([-180, lat]);
  const defs = el('defs', {}, svg); const cp = el('clipPath', { id: 'globe' }, defs);
  const od = `M${outline.map((p) => project(p).map((v) => v.toFixed(1)).join(' ')).join('L')}Z`;
  el('path', { d: od }, cp);
  svg.insertBefore(el('path', { class: 'sphere', d: od }), svg.firstChild);
  Object.values(groups).forEach((g) => g.setAttribute('clip-path', 'url(#globe)'));
  const other = el('g', { 'clip-path': 'url(#globe)' }, svg);
  for (const c of state.topo || []) {
    if (c.name === 'Antarctica') continue;
    const rid = COUNTRY_REGION[c.name];
    el('path', { class: rid ? 'country' : 'country other', d: c.d }, rid ? groups[rid] : other);
  }
  for (const r of state.cfg) {
    const [x, y] = project(r.at);
    const imp = improvement(regionOf(sel(), r.id), regionOf(base(), r.id), state.metric);
    el('text', { class: 'rlabel', x, y }, svg, r.name);
    el('text', { class: 'rval', x, y: y + 13 }, svg, imp == null || Math.abs(imp) < 0.05 ? '±0 %' : `${imp > 0 ? '−' : '+'}${fmt(Math.abs(imp), 1)} %`);
  }
  if (!state.topo) el('text', { x: 480, y: 220, 'text-anchor': 'middle', class: 'rval' }, svg, 'Loading map…');
  $('#mapLegend').innerHTML = CLASSES.map((c) => `<span><i style="background:${c.color}"></i>${c.label}</span>`).join('') + '<span class="muted">· labels show the change in the metric (− = less)</span>';
}
function renderRegBars() {
  const box = $('#regBars'); box.innerHTML = '';
  const mt = M(state.metric);
  $('#regTitle').textContent = `Regions: ${mt.label.toLowerCase()} · ${periodLabel()}`;
  const rows = state.cfg.map((r) => { const sR = regionOf(sel(), r.id); const bR = regionOf(base(), r.id); return { r, imp: improvement(sR, bR, state.metric) ?? 0, c: change(sR, bR, state.metric) }; });
  const max = Math.max(3, ...rows.map((x) => Math.abs(x.imp)));
  for (const { r, imp, c } of rows) {
    const row = document.createElement('div'); row.className = 'prov-row';
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = r.name;
    const sm = document.createElement('small'); sm.textContent = `${fmt(Math.abs(c.b - c.s) * mt.scale, 1)} ${mt.unit} ${c.b >= c.s ? 'saved' : 'more'}`; nm.append(sm);
    const track = document.createElement('div'); track.className = 'track'; track.innerHTML = '<span class="zero"></span>';
    const bar = document.createElement('span'); bar.className = 'bar'; const w = (Math.abs(imp) / max) * 50;
    bar.style.width = `${w}%`; bar.style.left = imp >= 0 ? '50%' : `${50 - w}%`; bar.style.background = imp >= 0 ? 'var(--div-better-3)' : 'var(--div-worse-2)';
    track.append(bar);
    const val = document.createElement('div'); val.className = `val ${imp < -0.5 ? 'worse' : 'better'}`; val.textContent = Math.abs(imp) < 0.05 ? '0.0 %' : `${imp >= 0 ? '−' : '+'}${fmt(Math.abs(imp), 1)} %`;
    row.append(nm, track, val);
    row.addEventListener('pointermove', (e) => regionTip(e, r.id)); row.addEventListener('pointerleave', hideTip);
    box.append(row);
  }
  const note = document.createElement('p'); note.className = 'muted small'; note.textContent = 'Bar to the right = better than the same region without robots or the protocol; to the left (red) = worse.';
  box.append(note);
}

// ---------- three futures ----------
function renderFutures() {
  const B = base().world.total; const box = $('#futures'); box.innerHTML = '';
  const cards = [
    ['many-off', 'Robots alone'], ['many-on', 'Robots + Cookwala protocol'],
    ['few-off', 'Few robots, no protocol'], ['none-on', 'No robots, protocol only']
  ];
  for (const [id, title] of cards) {
    const T = state.all[id].world.total;
    const saved = B.foodWasted - T.foodWasted;
    const div = document.createElement('button'); div.type = 'button'; div.className = 'future'; div.style.setProperty('--c', COLORS[id]); div.style.textAlign = 'left';
    div.setAttribute('aria-pressed', String(id === scenarioId(state.robots, state.protocol)));
    div.innerHTML = `<h3>${title}</h3>
      <p>Food lost or wasted: <b>${signed(pctOf(T.foodWasted, B.foodWasted))}</b> (${fmt(Math.abs(saved) * 1e-9, 0)} Mt ${saved >= 0 ? 'saved' : 'more'})</p>
      <p>Lost before homes: <b>${signed(pctOf(T.preHomeLoss, B.preHomeLoss))}</b> · at home: <b>${signed(pctOf(T.householdWaste, B.householdWaste))}</b></p>
      <p>Greenhouse gases: <b>${signed(pctOf(T.co2, B.co2))}</b> (${fmt(Math.abs(B.co2 - T.co2) * 1e-9, 0)} Mt CO2e)</p>
      <p>Hungry people rescue could feed: <b>${fmt(T.hungerCovered / 1e6, 1)} M</b></p>
      <p>Robot electricity: <b>${fmt(T.robotKwh * 1e-9, 0)} TWh</b></p>`;
    div.addEventListener('click', () => { const s = SC(id); state.robots = s.robots; state.protocol = s.protocol; renderAll(); });
    box.append(div);
  }
}
function renderCompare() {
  const t = $('#compare'); t.innerHTML = '';
  const cur = scenarioId(state.robots, state.protocol);
  const order = ['none-off', 'few-off', 'many-off', 'none-on', 'few-on', 'many-on'];
  const thead = document.createElement('thead'); const tr = document.createElement('tr');
  ['Five years, whole world', ...order.map((id) => SC(id).short), 'Protocol effect (robots + protocol vs robots alone)'].forEach((h, i) => { const th = document.createElement('th'); th.textContent = h; if (i) th.className = 'num'; if (order[i - 1] === cur) th.classList.add('sel'); tr.append(th); });
  thead.append(tr); t.append(thead);
  const tb = document.createElement('tbody');
  for (const mt of METRICS) {
    const row = document.createElement('tr');
    const vals = order.map((id) => state.all[id].world.total[mt.id]);
    const alone = state.all['many-off'].world.total[mt.id]; const proto = state.all['many-on'].world.total[mt.id];
    const ch = pctOf(proto, alone);
    const better = ch == null ? proto > 0 : mt.good === 'up' ? ch > 0 : mt.good === 'down' ? ch < 0 : null;
    const cells = [`${mt.label} (${mt.unit})`, ...vals.map((v) => fmt(v * mt.scale, v * mt.scale < 100 ? 1 : 0)), ch == null ? (proto > 0 ? 'only with protocol' : '—') : signed(ch)];
    cells.forEach((v, i) => { const td = document.createElement('td'); td.textContent = v; if (i) td.className = 'num'; if (order[i - 1] === cur) td.classList.add('sel'); if (i === cells.length - 1 && better != null && (ch == null || Math.abs(ch) >= 0.3)) td.classList.add(better ? 'good' : 'bad'); row.append(td); });
    tb.append(row);
  }
  t.append(tb);
}

// ---------- KPIs & insights ----------
function renderKpis() {
  const id = scenarioId(state.robots, state.protocol); const S = sel().world.total; const B = base().world.total;
  $('#kpiNote').textContent = `(${SC(id).short} vs no robots, no protocol)`;
  const box = $('#kpis'); box.innerHTML = '';
  for (const mt of METRICS) {
    const div = document.createElement('div'); div.className = 'kpi';
    const nm = document.createElement('div'); nm.className = 'name'; nm.textContent = mt.avg ? mt.label : `${mt.label} (5 years)`;
    const vals = document.createElement('div'); vals.className = 'vals';
    for (const [lab, v, col] of [[SC(id).short.toLowerCase(), S[mt.id], COLORS[id]], ['no robots', B[mt.id], 'var(--base)']]) {
      const s = document.createElement('span'); s.className = 'v'; s.style.setProperty('--c', col); s.innerHTML = '<i class="sw"></i>';
      s.append(fmt(v * mt.scale, v * mt.scale < 100 ? 1 : 0));
      const sm = document.createElement('small'); sm.textContent = ` ${mt.unit} ${lab}`; s.append(sm); vals.append(s);
    }
    const dl = document.createElement('div'); dl.className = 'delta';
    if (mt.id === 'robotKwh') dl.textContent = S.robotKwh ? `+${fmt(S.robotKwh * 1e-9, 0)} TWh added by robots` : 'no robots';
    else if (mt.id === 'mealsRescued') dl.textContent = S.mealsRescued ? `≈ ${fmt(S.mealsRescued / (3 * 365.25 * 5) / 1e6, 0)} million people's meals for five years (where the surplus is)` : 'no rescue without the protocol';
    else if (mt.id === 'hungerCovered') dl.textContent = `${fmt((S.hungerCovered / B.hungry) * 100, 1)} % of the ${fmt(B.hungry / 1e6, 0)} M hungry people`;
    else { const d = pctOf(S[mt.id], B[mt.id]); dl.textContent = `${signed(d)} (${fmt(Math.abs(B[mt.id] - S[mt.id]) * mt.scale, 1)} ${mt.unit} ${d > 0 ? 'more' : 'saved'})`; }
    div.append(nm, vals, dl); box.append(div);
  }
}
function renderInsights() {
  const T = (id) => state.all[id].world.total; const B = T('none-off');
  const p = (id, k) => pctOf(T(id)[k], B[k]);
  const reg = (id, rid) => regionOf(state.all[id], rid).total;
  const savedMt = (B.foodWasted - T('many-on').foodWasted) * 1e-9;
  const peopleFed = (savedMt * 1e9) / (365.25 * 5) / 1e6; // at ~1 kg of food per person per day
  const hungry = B.hungry;
  const hungerShare = (rid) => reg('none-off', rid).hungry / hungry;
  const cover = (rid) => reg('many-on', rid).hungerCovered / reg('none-off', rid).hungry;
  const lossAlone = state.cfg.map((r) => ({ r, d: pctOf(reg('many-off', r.id).preHomeLoss, reg('none-off', r.id).preHomeLoss) })).sort((a, b) => b.d - a.d);
  const co2Proto = state.cfg.map((r) => ({ r, d: pctOf(reg('many-on', r.id).co2, reg('none-off', r.id).co2) })).sort((a, b) => a.d - b.d);
  const items = [
    `<b>Robots alone help homes but hurt the supply chain.</b> Household food waste ${signed(p('many-off', 'householdWaste'))}, but food lost before it reaches homes ${signed(p('many-off', 'preHomeLoss'))} (worst in ${lossAlone[0].r.name}, ${signed(lossAlone[0].d)}): vendors' apps order in lumps, stores and farms can't see the plans and keep bigger safety stocks (the bullwhip effect). All food lost or wasted ${signed(p('many-off', 'foodWasted'))}, and no surplus reaches anyone hungry.`,
    `<b>The same robots with the protocol cut waste at every stage:</b> food lost before homes ${signed(p('many-on', 'preHomeLoss'))}, at home ${signed(p('many-on', 'householdWaste'))}, all food lost or wasted ${signed(p('many-on', 'foodWasted'))}: ${fmt(savedMt, 0)} Mt over five years, about the yearly food of ${fmt(peopleFed, 0)} million people (at ~1 kg a day). Greenhouse gases ${signed(p('many-on', 'co2'))} vs ${signed(p('many-off', 'co2'))} with robots alone.`,
    `<b>Countries with few or no robots still gain from the protocol.</b> With no robots at all, the protocol in stores, farms, logistics, relief programs and people's apps cuts losses before homes ${signed(p('none-on', 'preHomeLoss'))} and rescues ${fmt(T('none-on').mealsRescued * 1e-9, 0)} billion meals. With few robots and no protocol, almost nothing changes (food lost or wasted ${signed(p('few-off', 'foodWasted'))}).`,
    `<b>Hunger is where robots are not.</b> ${fmt(hungerShare('ssa') * 100 + hungerShare('sa') * 100, 0)} % of the world's ${fmt(hungry / 1e6, 0)} million hungry people live in Sub-Saharan Africa and South Asia, which get ${fmt(state.cfg.find((r) => r.id === 'ssa').many * 100, 0)} % and ${fmt(state.cfg.find((r) => r.id === 'sa').many * 100, 0)} % robot homes by 2031 even in the <i>Many</i> scenario, and where less of the food system joins the protocol. Rescued surplus covers the meals of about ${fmt(T('many-on').hungerCovered / 1e6, 0)} million hungry people (${fmt((T('many-on').hungerCovered / hungry) * 100, 1)} %) with robots + protocol, and ${fmt(T('none-on').hungerCovered / 1e6, 0)} million with the protocol and no robots (robots prevent surplus, so less is left to rescue). That is ${fmt(cover('ssa') * 100, 1)} % of the hungry in Sub-Saharan Africa and ${fmt(cover('sa') * 100, 1)} % in South Asia, against ${fmt(cover('na') * 100, 0)} % in North America. Ending hunger needs the relief layer to move food and money across regions, plus production and policy.`,
    `<b>Energy and climate depend on the grid.</b> Many robots add ${fmt(T('many-on').robotKwh * 1e-9, 0)} TWh of electricity over five years. Total energy for food ${signed(p('many-on', 'energyKwh'))} with the protocol vs ${signed(p('many-off', 'energyKwh'))} alone; natural gas and LPG ${signed(p('many-on', 'gasM3'))}. The biggest CO2 cut with the protocol is in ${co2Proto[0].r.name} (${signed(co2Proto[0].d)}), the smallest in ${co2Proto[co2Proto.length - 1].r.name} (${signed(co2Proto[co2Proto.length - 1].d)}), where few homes have robots and much cooking is on wood or charcoal (not modelled).`,
    `<b>Time:</b> many robots free ${fmt((B.humanHours - T('many-on').humanHours) * 1e-9, 0)} billion hours of cooking and shopping over five years, mostly in North America, Europe and East Asia. The protocol doesn't change that number. It changes what happens to the food.`
  ];
  $('#insights').innerHTML = items.map((t) => `<li>${t}</li>`).join('');
}

// ---------- charts ----------
function chartCard(title, desc) {
  const card = document.createElement('div'); card.className = 'chart';
  const h = document.createElement('h3'); h.textContent = title;
  const p = document.createElement('p'); p.className = 'desc'; p.textContent = desc;
  const btn = document.createElement('button'); btn.className = 'tbl-toggle'; btn.textContent = 'Table';
  card.append(h, p, btn); $('#charts').append(card); return { card, btn };
}
function legend(card, items) {
  const l = document.createElement('div'); l.className = 'legend';
  for (const [n, c, dash] of items) { const s = document.createElement('span'); const i = document.createElement('i'); i.style.setProperty('--c', c); if (dash) i.style.background = `repeating-linear-gradient(90deg, ${c} 0 4px, transparent 4px 7px)`; s.append(i, n); l.append(s); }
  card.append(l);
}
function addTable(card, btn, head, rows) {
  const t = document.createElement('table'); t.className = 'data'; t.hidden = true;
  const tr = document.createElement('tr'); head.forEach((h) => { const th = document.createElement('th'); th.textContent = h; tr.append(th); });
  const thead = document.createElement('thead'); thead.append(tr); t.append(thead);
  const tb = document.createElement('tbody');
  rows.forEach((r) => { const row = document.createElement('tr'); r.forEach((v, i) => { const td = document.createElement('td'); td.textContent = v; if (i) td.className = 'num'; row.append(td); }); tb.append(row); });
  t.append(tb); card.append(t);
  btn.addEventListener('click', () => { t.hidden = !t.hidden; btn.textContent = t.hidden ? 'Table' : 'Chart only'; });
}
function lines(card, series, unit, digits, { labelsAtEnd = true, highlightOnHover = false } = {}) {
  const N = series[0].values.length; const W = 600; const H = 220; const m = { l: 52, r: labelsAtEnd ? 130 : 16, t: 10, b: 24 };
  const all = series.flatMap((s) => s.values); let lo = Math.min(...all); let hi = Math.max(...all);
  if (lo >= 0 && lo / Math.max(hi, 1e-9) < 0.6) lo = 0;
  const pad = (hi - lo) * 0.1 || 1; hi += pad; if (lo !== 0) lo -= pad;
  const x = (i) => m.l + (i / (N - 1)) * (W - m.l - m.r); const y = (v) => H - m.b - ((v - lo) / (hi - lo)) * (H - m.t - m.b);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
  for (let k = 0; k <= 4; k++) { const v = lo + ((hi - lo) * k) / 4; el('line', { class: k ? 'gridline' : 'baseline', x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, svg); el('text', { class: 'axis', x: m.l - 6, y: y(v) + 3, 'text-anchor': 'end' }, svg, fmt(v, digits)); }
  for (let yr = 0; yr < 5; yr++) el('text', { class: 'axis', x: x(yr * 4 + 1.5), y: H - 7, 'text-anchor': 'middle' }, svg, String(START_YEAR + yr));
  // end labels, nudged apart so they don't collide
  const ends = series.map((s, k) => ({ k, y: y(s.values[N - 1]) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 12) ends[i].y = ends[i - 1].y + 12;
  const paths = series.map((s, k) => {
    const p = el('path', { class: `series${s.dash ? ' dash' : ''}`, d: s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' '), stroke: s.color }, svg);
    if (labelsAtEnd) el('text', { class: 'endlbl', x: W - m.r + 6, y: ends.find((e) => e.k === k).y + 4 }, svg, `${s.name} ${fmt(s.values[N - 1], digits)}`);
    return p;
  });
  const xh = el('line', { class: 'xhair', x1: 0, x2: 0, y1: m.t, y2: H - m.b, opacity: 0 }, svg);
  const hit = el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent' }, svg);
  hit.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(N - 1, Math.round(((px - m.l) / (W - m.l - m.r)) * (N - 1))));
    xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('opacity', 1);
    showTip(e, QUARTERS[i], series.map((s) => [s.name, `${fmt(s.values[i], digits)} ${unit}`, s.color]));
    if (highlightOnHover) {
      const py = ((e.clientY - r.top) / r.height) * H;
      let best = 0; let bd = Infinity; series.forEach((s, k) => { const d = Math.abs(y(s.values[i]) - py); if (d < bd) { bd = d; best = k; } });
      paths.forEach((p, k) => { p.setAttribute('stroke', k === best ? 'var(--series-1)' : series[k].color); p.style.strokeWidth = k === best ? 3 : 2; });
    }
  });
  hit.addEventListener('pointerleave', () => { xh.setAttribute('opacity', 0); hideTip(); if (highlightOnHover) paths.forEach((p, k) => { p.setAttribute('stroke', series[k].color); p.style.strokeWidth = 2; }); });
  card.append(svg);
}
function scenarioChart(metricId, desc) {
  const mt = M(metricId); const { card, btn } = chartCard(`${mt.label} per quarter`, desc);
  const fewId = scenarioId('few', state.protocol);
  const defs = [['many-on', 'Robots + protocol'], ['many-off', 'Robots alone'], [fewId, SC(fewId).short], ['none-off', 'No robots', true]];
  legend(card, defs.map(([id, n, dash]) => [n, COLORS[id], dash]));
  const series = defs.map(([id, n, dash]) => ({ name: n, color: COLORS[id], dash, values: state.all[id].world.quarters.map((v) => v[metricId] * mt.scale) }));
  lines(card, series, mt.unit, 1);
  addTable(card, btn, ['Quarter', ...defs.map((d) => `${d[1]} (${mt.unit})`)], QUARTERS.map((qq, i) => [qq, ...series.map((s) => fmt(s.values[i], 2))]));
}
function renderCharts() {
  $('#charts').innerHTML = '';
  scenarioChart('preHomeLoss', 'Megatonnes per quarter, the whole world. Robots alone push losses up the supply chain; with the protocol they fall.');
  scenarioChart('householdWaste', 'Megatonnes per quarter. Robots plan, portion and store food; the protocol adds little at home.');
  scenarioChart('co2', 'Megatonnes CO2e per quarter from food transport, cooking, refrigeration and wasted food. Grids get ~2 % cleaner a year in every scenario.');
  scenarioChart('energyKwh', 'TWh per quarter: cooking (gas, LPG, electric), robots, transport fuel and refrigeration.');
  scenarioChart('hungerCovered', 'Million hungry people whose meals rescued surplus could cover, counted only within their own region.');
  // adoption by region
  const { card, btn } = chartCard(`Robot-cook homes by region (${state.robots === 'none' ? 'no robots' : state.robots === 'few' ? 'Few' : 'Many'})`, 'Share of homes with robot cooks (S-curve rollouts). Hover to highlight a region.');
  const series = state.cfg.map((r) => ({ name: r.name, color: 'var(--text-secondary)', values: QUARTERS.map((_, q) => adoptionAt(r, state.robots, q) * 100) }));
  lines(card, series, '%', 0, { highlightOnHover: true });
  addTable(card, btn, ['Region', ...QUARTERS], series.map((s) => [s.name, ...s.values.map((v) => `${fmt(v, 1)} %`)]));
}
function renderRegions() {
  const t = $('#regions'); const S = sel(); const Bw = base();
  const head = ['Region', 'People 2031 (M)', 'Urban', 'Hungry (M)', 'Robot homes 2031', 'Protocol coverage 2031', 'Food lost or wasted', 'Lost before homes', 'Household waste', 'Natural gas & LPG', 'Total energy', 'CO2e', 'Hungry covered by rescue (M)'];
  t.innerHTML = ''; const thead = document.createElement('thead'); const tr = document.createElement('tr'); head.forEach((h) => { const th = document.createElement('th'); th.textContent = h; tr.append(th); }); thead.append(tr); t.append(thead);
  const tb = document.createElement('tbody');
  for (const r of state.cfg) {
    const sR = regionOf(S, r.id); const bR = regionOf(Bw, r.id); const row = document.createElement('tr');
    const cells = [r.name, fmt(sR.quarters[ALL - 1].people / 1e6, 0), `${fmt(r.urban * 100, 0)} %`, fmt(bR.total.hungry / 1e6, 0), `${fmt(sR.share[ALL - 1] * 100, 1)} %`, `${fmt(coverageAt(r, state.protocol, ALL - 1) * 100, 0)} %`];
    for (const k of ['foodWasted', 'preHomeLoss', 'householdWaste', 'gasM3', 'energyKwh', 'co2']) cells.push(signed(pctOf(sR.total[k], bR.total[k])));
    cells.push(fmt(sR.total.hungerCovered / 1e6, 1));
    cells.forEach((v, i) => { const td = document.createElement('td'); td.textContent = v; if (i) td.className = 'num'; if (i >= 6 && i < 12 && v.startsWith('+')) td.classList.add('worse'); row.append(td); });
    tb.append(row);
  }
  t.append(tb);
}
function renderMethod() {
  const rows = REGIONS.map((r) => `<tr><td>${r.name}</td><td class="num">${fmt(r.pop / 1e6, 0)}</td><td class="num">${fmt(r.growth * 100, 1)} %</td><td class="num">${fmt(r.urban * 100, 0)} %</td><td class="num">${fmt(r.hungry * 100, 1)} %</td><td class="num">×${r.waste}</td><td class="num">×${r.loss}</td><td class="num">×${r.gas}</td><td class="num">×${r.car}</td><td class="num">${r.grid}</td></tr>`).join('');
  $('#method').innerHTML = `<p><b>Four linked scales.</b> The home simulator tests the protocol in one kitchen. The city simulator models homes, stores, wholesale, farms, vehicles and garbage for a month (calibrated to UNEP's ~0.22 kg of household food waste per person a day and FAO's ~13 % loss before retail). The country model turns city runs into per-person rates for urban, suburban and rural homes at 0–100 % robot adoption, with and without the protocol. This world model applies those rates to ten regions, quarter by quarter, and adjusts each region by the factors below.</p>
  <div class="table-wrap"><table class="data"><thead><tr><th>Region</th><th>People 2027 (M)</th><th>Growth / yr</th><th>Urban</th><th>Undernourished</th><th>Household waste</th><th>Loss before retail</th><th>Gas/LPG cooking</th><th>Car dependence</th><th>Grid kgCO2e/kWh</th></tr></thead><tbody>${rows}</tbody></table></div>
  <ul>
    <li><b>Robots:</b> share of homes on an S-curve from 2027 to the 2031 target; rural homes adopt at half the rate, city centres slightly faster. Robots need reliable electricity and income, so Sub-Saharan Africa and South Asia stay low even in the <i>Many</i> scenario.</li>
    <li><b>Protocol:</b> the share of a region's food system (stores, farms, logistics, relief programs, robots, apps) using it rises from 3 % in 2027 to its coverage by about 2029. Rates blend linearly between the city simulator's protocol-off and protocol-on results.</li>
    <li><b>Hunger:</b> rescued surplus counts only toward hungry people in the same region, at three meals a day. The "yearly food of N people" comparison assumes ~1 kg of food per person a day, and food saved in one place doesn't automatically reach people elsewhere.</li>
    <li><b>Sources (rounded):</b> UN World Population Prospects 2024; UN World Urbanization Prospects; FAO SOFI 2024 (undernourishment); FAO SOFA 2019 (loss by region); UNEP Food Waste Index 2024; IEA / WHO clean-cooking tracking; Ember grid-intensity data. Grids get ~2 % cleaner a year.</li>
  </ul>
  <p class="muted small">Illustrative model, not a forecast. Not included: wood and charcoal cooking (and the health benefits of clean cooking), robot manufacturing and costs, restaurants and food service, trade between regions, prices responding to demand, rebound effects, conflict and climate shocks. Regional factors are rounded from the sources above and should be refined with country data.</p>`;
}

init();
