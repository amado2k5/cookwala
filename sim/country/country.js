import { simulateCountry, COUNTRY_PRESETS, METRICS, MONTHS, SEASONS, adoptionAt } from './engine.js?v=0.3.1';
import { CALIBRATION } from './calibration.js?v=0.3.0';

const $ = (s) => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const fmt = (v, d = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const state = { cfg: COUNTRY_PRESETS.mixed.make(), res: null, metric: 'householdWaste', month: 12, playing: false, timer: null, protoMode: 'planned' };
const withProtocol = (cfg, mode) => { const c = JSON.parse(JSON.stringify(cfg)); if (mode === 'off') c.provinces.forEach((p) => { p.protocolFrom = null; }); if (mode === 'all') c.provinces.forEach((p) => { p.protocolFrom = 0; }); return c; };
const M = (id) => METRICS.find((m) => m.id === id);
const el = (name, attrs, parent, text) => { const n = document.createElementNS(SVGNS, name); for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v); if (text != null) n.textContent = text; if (parent) parent.append(n); return n; };

// ---------- values & colour ----------
const pick = (place, m = state.month) => (m === 12 ? place.annual : place.monthly[m]);
function change(place, metricId, m) {
  const v = pick(place, m); const s = v.scenario[metricId]; const b = v.baseline[metricId];
  return { s, b, pct: b ? ((s - b) / b) * 100 : null };
}
/** Positive = better (less waste/energy/emissions, or more meals rescued). */
function improvement(place, metricId, m) {
  const c = change(place, metricId, m); const mt = M(metricId);
  if (c.pct == null) return null;
  return mt.good === 'up' ? c.pct : -c.pct;
}
const CLASSES = [
  { max: -10, color: 'var(--div-worse-2)', label: 'worse >10 %' }, { max: -2, color: 'var(--div-worse-1)', label: 'worse 2–10 %' },
  { max: 2, color: 'var(--div-mid)', label: 'about the same' }, { max: 10, color: 'var(--div-better-1)', label: 'better 2–10 %' },
  { max: 20, color: 'var(--div-better-2)', label: 'better 10–20 %' }, { max: 30, color: 'var(--div-better-3)', label: 'better 20–30 %' },
  { max: Infinity, color: 'var(--div-better-4)', label: 'better >30 %' }
];
const colorFor = (imp) => (imp == null ? 'var(--div-mid)' : CLASSES.find((c) => imp <= c.max).color);

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
  t.style.left = `${Math.min(window.innerWidth - t.offsetWidth - 8, e.clientX + 14)}px`; t.style.top = `${e.clientY + 14}px`;
}
const hideTip = () => { $('#tip').hidden = true; };
function placeTip(e, place, prov) {
  const mt = M(state.metric); const c = change(place, state.metric);
  const m = state.month === 12 ? 11 : state.month;
  const adoption = prov ? adoptionAt(prov.cfg, m) : null;
  const proto = prov ? (prov.protocolFrom == null ? 'no protocol' : m >= prov.protocolFrom ? `protocol since ${MONTHS[prov.protocolFrom]}` : `protocol from ${MONTHS[prov.protocolFrom]}`) : '';
  const imp = improvement(place, state.metric);
  showTip(e, `${place.name}${state.month === 12 ? ' · whole year' : ` · ${MONTHS[state.month]}`}`, [
    ['with rollout', `${fmt(c.s * mt.scale, 2)} ${mt.unit}`, 'var(--with)'],
    ['without robots/protocol', `${fmt(c.b * mt.scale, 2)} ${mt.unit}`, 'var(--without)'],
    ['change', imp == null ? '—' : `${imp >= 0 ? 'better' : 'worse'} ${fmt(Math.abs(imp), 1)} %`, null],
    [`robot homes (${MONTHS[m]})`, adoption == null ? '' : `${fmt(adoption * 100, 0)} %`, null],
    ['', proto, null]
  ]);
}

// ---------- controls ----------
function init() {
  const ps = $('#preset');
  for (const [id, p] of Object.entries(COUNTRY_PRESETS)) ps.append(new Option(p.label, id));
  ps.append(new Option('Custom', 'custom'));
  ps.addEventListener('change', () => { if (ps.value !== 'custom') { state.cfg = COUNTRY_PRESETS[ps.value].make(); renderEditor(); run(); } });
  const ms = $('#metric');
  for (const m of METRICS.filter((x) => x.good !== 'neutral' && x.id !== 'mealsRescued')) ms.append(new Option(m.label, m.id));
  ms.addEventListener('change', () => { state.metric = ms.value; renderMap(); renderProvBars(); });
  $('#protoMode').addEventListener('change', (e) => { state.protoMode = e.target.value; run(); });
  $('#month').addEventListener('input', (e) => { state.month = Number(e.target.value); renderMonth(); });
  $('#play').addEventListener('click', () => (state.playing ? stop() : play()));
  $('#editToggle').addEventListener('click', (e) => { const ed = $('#editor'); ed.hidden = !ed.hidden; e.currentTarget.setAttribute('aria-expanded', String(!ed.hidden)); e.currentTarget.textContent = ed.hidden ? 'Edit provinces ▾' : 'Edit provinces ▴'; });
  renderEditor();
  renderMethod();
  run();
}
function renderEditor() {
  const ed = $('#editor');
  ed.innerHTML = '<h2>Province rollout</h2><p class="muted small">Robot-cook homes in January → December (S-curve in between), and the month the protocol ecosystem (demand signals, consolidated delivery, surplus rescue, energy-saver modes) starts.</p>';
  const t = document.createElement('table'); t.className = 'data editor-table';
  t.innerHTML = '<thead><tr><th>Province</th><th>Robot homes Jan %</th><th>Robot homes Dec %</th><th>Protocol from</th><th>Note</th></tr></thead>';
  const tb = document.createElement('tbody');
  state.cfg.provinces.forEach((p, i) => {
    const tr = document.createElement('tr');
    const td = (child) => { const c = document.createElement('td'); if (typeof child === 'string') c.textContent = child; else c.append(child); tr.append(c); };
    td(p.name);
    for (const j of [0, 1]) { const inp = document.createElement('input'); inp.type = 'number'; inp.min = 0; inp.max = 100; inp.value = Math.round(p.adoption[j] * 100); inp.addEventListener('change', () => { p.adoption[j] = Math.max(0, Math.min(100, Number(inp.value))) / 100; $('#preset').value = 'custom'; run(); }); td(inp); }
    const sel = document.createElement('select'); sel.append(new Option('never', '')); MONTHS.forEach((mn, k) => sel.append(new Option(mn, String(k))));
    sel.value = p.protocolFrom == null ? '' : String(p.protocolFrom);
    sel.addEventListener('change', () => { p.protocolFrom = sel.value === '' ? null : Number(sel.value); $('#preset').value = 'custom'; run(); });
    td(sel); td(p.note || '');
    tb.append(tr);
  });
  t.append(tb); ed.append(t);
}
function run() {
  const eff = withProtocol(state.cfg, state.protoMode);
  state.res = simulateCountry({ country: eff });
  state.res.provinces.forEach((p, i) => { p.cfg = eff.provinces[i]; });
  renderMonth(); renderKpis(); renderInsights(); renderCharts(); renderRegions(); renderProtoImpact();
}
function renderProtoImpact() {
  const runs = [['Robots alone (protocol off)', simulateCountry({ country: withProtocol(state.cfg, 'off') })], ['Robots + protocol as planned', simulateCountry({ country: withProtocol(state.cfg, 'planned') })], ['Robots + protocol everywhere', simulateCountry({ country: withProtocol(state.cfg, 'all') })]];
  const base = runs[0][1].annual.baseline;
  const t = $('#protoImpact'); t.innerHTML = '';
  const head = ['Whole year', 'No robots, no protocol', ...runs.map((r) => r[0]), 'Protocol effect (planned vs robots alone)'];
  const thead = document.createElement('thead'); const tr = document.createElement('tr');
  head.forEach((h, i) => { const th = document.createElement('th'); th.textContent = h; if (i) th.className = 'num'; tr.append(th); }); thead.append(tr); t.append(thead);
  const tb = document.createElement('tbody');
  for (const mt of METRICS) {
    const row = document.createElement('tr');
    const vals = [base[mt.id], ...runs.map((r) => r[1].annual.scenario[mt.id])];
    const alone = vals[1]; const planned = vals[2];
    const ch = alone ? ((planned - alone) / alone) * 100 : null;
    const better = ch == null ? planned > 0 : mt.good === 'up' ? ch > 0 : mt.good === 'down' ? ch < 0 : null;
    const cells = [`${mt.label} (${mt.unit})`, ...vals.map((v) => fmt(v * mt.scale, v * mt.scale < 100 ? 1 : 0)), ch == null ? (planned > 0 ? 'only with protocol' : '—') : `${ch > 0 ? '+' : ''}${fmt(ch, 1)} %`];
    cells.forEach((v, i) => { const td = document.createElement('td'); td.textContent = v; if (i) td.className = 'num'; if (i === cells.length - 1 && better != null && (ch == null || Math.abs(ch) >= 0.5)) td.classList.add(better ? 'good' : 'bad'); row.append(td); });
    tb.append(row);
  }
  t.append(tb);
}
function play() { state.playing = true; $('#play').textContent = '⏸'; if (state.month >= 12) state.month = -1; state.timer = setInterval(() => { state.month += 1; $('#month').value = state.month; renderMonth(); if (state.month >= 12) stop(); }, 900); }
function stop() { state.playing = false; clearInterval(state.timer); $('#play').textContent = '▶'; }
function renderMonth() {
  $('#monthLabel').textContent = state.month === 12 ? 'Whole year' : MONTHS[state.month];
  renderMap(); renderProvBars();
}

// ---------- map ----------
function centroid(path) {
  const pts = path.match(/-?\d+(\.\d+)?/g).map(Number); let x = 0; let y = 0;
  for (let i = 0; i < pts.length; i += 2) { x += pts[i]; y += pts[i + 1]; }
  return [x / (pts.length / 2), y / (pts.length / 2)];
}
function renderMap() {
  const svg = $('#map'); svg.innerHTML = '';
  const mt = M(state.metric);
  $('#mapTitle').textContent = `${mt.label}: change vs no-robot baseline · ${state.month === 12 ? 'whole year' : MONTHS[state.month]}`;
  for (const p of state.res.provinces) {
    const imp = improvement(p, state.metric);
    const poly = el('path', { class: 'prov', d: p.shape, fill: colorFor(imp), tabindex: 0, role: 'img', 'aria-label': `${p.name}: ${imp == null ? 'no change' : `${imp >= 0 ? 'better' : 'worse'} ${fmt(Math.abs(imp), 1)} %`}` }, svg);
    poly.addEventListener('pointermove', (e) => placeTip(e, p, p));
    poly.addEventListener('focus', (e) => { const r = poly.getBoundingClientRect(); placeTip({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, p, p); });
    poly.addEventListener('pointerleave', hideTip); poly.addEventListener('blur', hideTip);
  }
  for (const p of state.res.provinces) {
    const [cx, cy] = p.cfg.label || centroid(p.shape);
    for (const r of p.regions) {
      const rad = 4 + Math.sqrt(r.pop / 1e6) * 5;
      const imp = improvement(r, state.metric);
      const c = el('circle', { class: 'reg', cx: r.x, cy: r.y, r: rad, fill: colorFor(imp) }, svg);
      c.addEventListener('pointermove', (e) => placeTip(e, r, p)); c.addEventListener('pointerleave', hideTip);
      const right = r.x > 420; const big = rad > 12;
      el('text', { class: 'reg-label', x: big ? r.x : right ? r.x - rad - 3 : r.x + rad + 3, y: big ? r.y + rad + 11 : r.y + 3, 'text-anchor': big ? 'middle' : right ? 'end' : 'start' }, svg, r.name);
    }
    const lbl = el('text', { class: 'prov-label', x: cx, y: cy, 'text-anchor': 'middle' }, svg, p.name);
    lbl.setAttribute('pointer-events', 'none');
    const m = state.month === 12 ? 11 : state.month;
    el('text', { class: 'proto', x: cx, y: cy + 12, 'text-anchor': 'middle' }, svg, p.protocolFrom == null ? 'no protocol' : m >= p.protocolFrom ? '● protocol on' : `protocol from ${MONTHS[p.protocolFrom]}`);
  }
  $('#mapLegend').innerHTML = CLASSES.map((c) => `<span><i style="background:${c.color}"></i>${c.label}</span>`).join('') + '<span class="muted">· circles = cities & regions (size = population)</span>';
}
function renderProvBars() {
  const box = $('#provBars'); box.innerHTML = '';
  const mt = M(state.metric);
  $('#provTitle').textContent = `Provinces: ${mt.label.toLowerCase()} ${state.month === 12 ? '(whole year)' : `(${MONTHS[state.month]})`}`;
  const rows = state.res.provinces.map((p) => ({ p, imp: improvement(p, state.metric) ?? 0, c: change(p, state.metric) }));
  const max = Math.max(5, ...rows.map((r) => Math.abs(r.imp)));
  for (const { p, imp, c } of rows) {
    const row = document.createElement('div'); row.className = 'prov-row';
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = p.name;
    const sm = document.createElement('small'); sm.textContent = `${fmt(Math.abs(c.b - c.s) * mt.scale, 1)} ${mt.unit} ${c.b >= c.s ? 'saved' : 'more'}`; nm.append(sm);
    const track = document.createElement('div'); track.className = 'track'; track.innerHTML = '<span class="zero"></span>';
    const bar = document.createElement('span'); bar.className = 'bar';
    const w = (Math.abs(imp) / max) * 50;
    bar.style.width = `${w}%`; bar.style.left = imp >= 0 ? '50%' : `${50 - w}%`; bar.style.background = imp >= 0 ? 'var(--div-better-3)' : 'var(--div-worse-2)';
    track.append(bar);
    const val = document.createElement('div'); val.className = `val ${imp < -0.5 ? 'worse' : 'better'}`; val.textContent = Math.abs(imp) < 0.05 ? '0.0 %' : `${imp >= 0 ? '−' : '+'}${fmt(Math.abs(imp), 1)} %`;
    val.title = imp >= 0 ? 'better than without robots' : 'worse than without robots';
    row.append(nm, track, val);
    row.addEventListener('pointermove', (e) => placeTip(e, p, p)); row.addEventListener('pointerleave', hideTip);
    box.append(row);
  }
  const note = document.createElement('p'); note.className = 'muted small'; note.textContent = 'Bar to the right = better than the same province without robots or the protocol; to the left (red) = worse.';
  box.append(note);
}

// ---------- KPIs & insights ----------
function renderKpis() {
  const S = state.res.annual.scenario; const B = state.res.annual.baseline;
  const box = $('#kpis'); box.innerHTML = '';
  for (const mt of METRICS) {
    const div = document.createElement('div'); div.className = 'kpi';
    const nm = document.createElement('div'); nm.className = 'name'; nm.textContent = `${mt.label} (year)`;
    const vals = document.createElement('div'); vals.className = 'vals';
    for (const [lab, v, col] of [['with rollout', S[mt.id], 'var(--with)'], ['without', B[mt.id], 'var(--without)']]) {
      const s = document.createElement('span'); s.className = 'v'; s.style.setProperty('--c', col); s.innerHTML = '<i class="sw"></i>';
      s.append(fmt(v * mt.scale, v * mt.scale < 100 ? 1 : 0));
      const sm = document.createElement('small'); sm.textContent = ` ${mt.unit} ${lab}`; s.append(sm); vals.append(s);
    }
    const dl = document.createElement('div'); dl.className = 'delta';
    if (mt.id === 'robotKwh') dl.textContent = `+${fmt(S[mt.id] * mt.scale, 0)} GWh added by robots`;
    else if (mt.id === 'mealsRescued') dl.textContent = `${fmt((S.mealsRescued / state.res.mealsNeededFoodInsecure) * 100, 1)} % of the meals the ${fmt(state.res.foodInsecure / 1e6, 1)} M food-insecure people need`;
    else { const d = ((S[mt.id] - B[mt.id]) / B[mt.id]) * 100; dl.textContent = `${d > 0 ? '+' : '−'}${fmt(Math.abs(d), 1)} % (${fmt(Math.abs(B[mt.id] - S[mt.id]) * mt.scale, 1)} ${mt.unit} ${d > 0 ? 'more' : 'saved'})`; }
    div.append(nm, vals, dl); box.append(div);
  }
}
function renderInsights() {
  const R = state.res; const S = R.annual.scenario; const B = R.annual.baseline;
  const pct = (k) => ((S[k] - B[k]) / B[k]) * 100;
  const prov = R.provinces.map((p) => ({ p, hw: -((p.annual.scenario.householdWaste - p.annual.baseline.householdWaste) / p.annual.baseline.householdWaste) * 100, loss: -((p.annual.scenario.preHomeLoss - p.annual.baseline.preHomeLoss) / p.annual.baseline.preHomeLoss) * 100, en: -((p.annual.scenario.energyKwh - p.annual.baseline.energyKwh) / p.annual.baseline.energyKwh) * 100 }));
  const best = [...prov].sort((a, b) => b.loss - a.loss)[0];
  const worse = prov.filter((x) => x.loss < -1);
  const regs = R.provinces.flatMap((p) => p.regions.map((r) => ({ r, p })));
  const archEnergy = (arch) => { const xs = regs.filter((x) => x.r.arch === arch && x.p.cfg.protocolFrom != null); if (!xs.length) return null; const s = xs.reduce((a, x) => a + x.r.annual.scenario.energyKwh, 0); const b = xs.reduce((a, x) => a + x.r.annual.baseline.energyKwh, 0); return ((s - b) / b) * 100; };
  const items = [
    `<b>Nationally:</b> household food waste ${fmt(pct('householdWaste'), 1)} %, food lost before reaching homes ${fmt(pct('preHomeLoss'), 1)} %, garbage ${fmt(pct('garbage'), 1)} %, greenhouse gases ${fmt(pct('co2'), 1)} % over the year: ${fmt((B.householdWaste + B.preHomeLoss - S.householdWaste - S.preHomeLoss) / 1e6, 0)} kt of food that wasn't wasted.`,
    `<b>Best province:</b> ${best.p.name} (${best.p.note}) cut food lost before homes by ${fmt(best.loss, 1)} % and household waste by ${fmt(best.hw, 1)} %.`,
    worse.length ? `<b>Warning:</b> ${worse.map((x) => `${x.p.name} lost ${fmt(-x.loss, 1)} % <i>more</i> food before it reached homes`).join('; ')}: robots selling without the protocol make stores and farms face lumpier demand (bullwhip) and keep bigger safety stocks. Homes improved, the supply chain got worse.` : '<b>No province got worse</b> upstream: everywhere robots are used, the protocol carries their plans to stores and farms.',
    (() => { const ur = archEnergy('urban'); const ru = archEnergy('rural'); return ur != null && ru != null ? `<b>Energy depends on geography:</b> where the protocol runs, rural regions saved ${fmt(-ru, 1)} % energy (long car trips replaced by consolidated deliveries) while cities saved ${fmt(-ur, 1)} % (short trips; the robots' own electricity offsets stove savings). Natural gas for cooking ${fmt(pct('gasM3'), 1)} %, total energy ${fmt(pct('energyKwh'), 1)} %, with ${fmt(S.robotKwh / 1e6, 0)} GWh of robot electricity added.` : ''; })(),
    `<b>Seasons:</b> the protocol's biggest monthly gains come in summer heat, the harvest glut (demand shaping) and December holidays, when traditional homes and stores waste most.`,
    S.mealsRescued > 0 ? `<b>Hunger:</b> ${fmt(S.mealsRescued / 1e6, 1)} million meals of store surplus were rescued for community kitchens: ${fmt((S.mealsRescued / R.mealsNeededFoodInsecure) * 100, 1)} % of what the country's ${fmt(R.foodInsecure / 1e6, 1)} million food-insecure people need in a year. A real but partial contribution; ending hunger also needs funding, production and policy.` : '',
    `<b>People's time:</b> ${fmt((B.humanHours - S.humanHours) / 1e6, 0)} million hours of cooking and shopping freed in a year; households spent ${fmt((B.spend - S.spend) / 1e6, 0)} million $ less on food (robot costs not included).`,
    `<b>Western Desert</b> (no adoption) is the control: identical to its baseline, as it should be.`
  ].filter(Boolean);
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
  for (const [n, c] of items) { const s = document.createElement('span'); const i = document.createElement('i'); i.style.setProperty('--c', c); s.append(i, n); l.append(s); }
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
function lines(card, series, unit, digits, labelsAtEnd = true, highlightOnHover = false) {
  const W = 600; const H = 210; const m = { l: 48, r: labelsAtEnd ? 120 : 16, t: 10, b: 24 };
  const all = series.flatMap((s) => s.values); let lo = Math.min(...all); let hi = Math.max(...all);
  if (lo >= 0 && lo / Math.max(hi, 1e-9) < 0.6) lo = 0;
  const pad = (hi - lo) * 0.1 || 1; hi += pad; if (lo !== 0) lo -= pad;
  const x = (i) => m.l + (i / 11) * (W - m.l - m.r); const y = (v) => H - m.b - ((v - lo) / (hi - lo)) * (H - m.t - m.b);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
  for (let k = 0; k <= 4; k++) { const v = lo + ((hi - lo) * k) / 4; el('line', { class: k ? 'gridline' : 'baseline', x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, svg); el('text', { class: 'axis', x: m.l - 6, y: y(v) + 3, 'text-anchor': 'end' }, svg, fmt(v, digits)); }
  MONTHS.forEach((mn, i) => { if (i % 2 === 0 || i === 11) el('text', { class: 'axis', x: x(i), y: H - 7, 'text-anchor': 'middle' }, svg, mn); });
  const paths = series.map((s) => {
    const p = el('path', { class: 'series', d: s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' '), stroke: s.color }, svg);
    if (labelsAtEnd) el('text', { class: 'endlbl', x: W - m.r + 6, y: y(s.values[11]) + (s.dy || 3) }, svg, `${s.name} ${fmt(s.values[11], digits)}`);
    return p;
  });
  const xh = el('line', { class: 'xhair', x1: 0, x2: 0, y1: m.t, y2: H - m.b, opacity: 0 }, svg);
  const hit = el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent' }, svg);
  hit.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(11, Math.round(((px - m.l) / (W - m.l - m.r)) * 11)));
    xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('opacity', 1);
    showTip(e, MONTHS[i], series.map((s) => [s.name, `${fmt(s.values[i], digits)} ${unit}`, s.color]));
    if (highlightOnHover) {
      const py = ((e.clientY - r.top) / r.height) * H;
      let best = 0; let bd = Infinity; series.forEach((s, k) => { const d = Math.abs(y(s.values[i]) - py); if (d < bd) { bd = d; best = k; } });
      paths.forEach((p, k) => { p.setAttribute('stroke', k === best ? 'var(--series-1)' : series[k].color); p.style.strokeWidth = k === best ? 3 : 2; });
    }
  });
  hit.addEventListener('pointerleave', () => { xh.setAttribute('opacity', 0); hideTip(); if (highlightOnHover) paths.forEach((p, k) => { p.setAttribute('stroke', series[k].color); p.style.strokeWidth = 2; }); });
  card.append(svg);
}
function monthChart(metricId, desc) {
  const mt = M(metricId); const { card, btn } = chartCard(mt.label, desc);
  legend(card, [['With rollout', 'var(--with)'], ['Without robots or protocol', 'var(--without)']]);
  const S = state.res.monthly.map((x) => x.scenario[metricId] * mt.scale); const B = state.res.monthly.map((x) => x.baseline[metricId] * mt.scale);
  const d = S[11] < B[11];
  lines(card, [{ name: 'With', values: S, color: 'var(--with)', dy: d ? 12 : -4 }, { name: 'Without', values: B, color: 'var(--without)', dy: d ? -4 : 12 }], mt.unit, 1);
  addTable(card, btn, ['Month', `With (${mt.unit})`, `Without (${mt.unit})`, 'Change'], MONTHS.map((mn, i) => [mn, fmt(S[i], 2), fmt(B[i], 2), `${fmt(((S[i] - B[i]) / B[i]) * 100, 1)} %`]));
}
function renderCharts() {
  $('#charts').innerHTML = '';
  monthChart('householdWaste', 'Kilotonnes per month, the whole country. Holiday and summer spikes are smaller with planning homes.');
  monthChart('preHomeLoss', 'Farm, wholesale and store losses, kilotonnes per month. Note the harvest glut in Sep–Oct.');
  monthChart('gasM3', 'Million m³ of natural gas for cooking per month (winter and holiday cooking peaks).');
  monthChart('energyKwh', 'GWh per month: cooking (gas + electric), robots, transport fuel, refrigeration.');
  monthChart('co2', 'Kilotonnes CO2e per month from transport, cooking and wasted food.');
  monthChart('foodVkm', 'Million vehicle-km per month: shopping cars, delivery vans, supply & garbage trucks.');
  // adoption curves
  const { card, btn } = chartCard('Robot-cook homes by province', 'Share of homes with robot cooks through the year (S-curve rollouts). Hover to highlight a province.');
  const series = state.res.provinces.map((p) => ({ name: p.name, values: MONTHS.map((_, m) => adoptionAt(p.cfg, m) * 100), color: 'var(--text-secondary)' }));
  lines(card, series, '%', 0, true, true);
  addTable(card, btn, ['Province', ...MONTHS], series.map((s) => [s.name, ...s.values.map((v) => `${fmt(v, 0)} %`)]));
}
function renderRegions() {
  const t = $('#regions');
  const head = ['Province', 'City / region', 'Type', 'People (M)', 'Robot homes Dec', 'Protocol', 'Household waste', 'Lost before homes', 'Natural gas', 'Total energy', 'CO2e', 'Garbage'];
  t.innerHTML = ''; const thead = document.createElement('thead'); const tr = document.createElement('tr'); head.forEach((h) => { const th = document.createElement('th'); th.textContent = h; tr.append(th); }); thead.append(tr); t.append(thead);
  const tb = document.createElement('tbody');
  for (const p of state.res.provinces) for (const r of p.regions) {
    const row = document.createElement('tr');
    const cells = [p.name, r.name, r.arch, fmt(r.pop / 1e6, 1), `${fmt(adoptionAt(p.cfg, 11) * 100, 0)} %`, p.protocolFrom == null ? 'never' : `from ${MONTHS[p.protocolFrom]}`];
    for (const k of ['householdWaste', 'preHomeLoss', 'gasM3', 'energyKwh', 'co2', 'garbage']) { const c = change(r, k, 12); cells.push(c.pct == null ? '—' : `${c.pct > 0 ? '+' : ''}${fmt(c.pct, 1)} %`); }
    cells.forEach((v, i) => { const td = document.createElement('td'); td.textContent = v; if (i >= 3) td.className = 'num'; if (i >= 6 && v.startsWith('+') && v !== '+0.0 %') td.classList.add('worse'); row.append(td); });
    tb.append(row);
  }
  t.append(tb);
}
function renderMethod() {
  const box = $('#method');
  const rate = (arch, eco, share, k) => CALIBRATION[arch][eco][[0, 0.25, 0.5, 0.75, 1].indexOf(share)][k];
  const archRows = ['urban', 'suburban', 'rural'].map((a) => `<tr><td>${a}</td><td class="num">${fmt(rate(a, 'noEco', 0, 'householdWaste') * 1000, 0)} → ${fmt(rate(a, 'eco', 1, 'householdWaste') * 1000, 0)} g</td><td class="num">${fmt(rate(a, 'noEco', 0, 'energyKwh'), 2)} → ${fmt(rate(a, 'eco', 1, 'energyKwh'), 2)} (${fmt(rate(a, 'noEco', 1, 'energyKwh'), 2)} without protocol)</td><td class="num">${fmt(rate(a, 'noEco', 0, 'foodVkm'), 2)} → ${fmt(rate(a, 'eco', 1, 'foodVkm'), 2)}</td></tr>`).join('');
  box.innerHTML = `<p><b>Three linked scales.</b> The home simulator tests the protocol in one kitchen. The city simulator models individual homes, stores, wholesale, farms, vehicles and garbage for a month, calibrated to UNEP and FAO averages. This country model runs the city simulator for urban, suburban and rural settings at 0–100 % robot homes, with and without the protocol (2 seeds each), and uses the resulting per-person rates for every city and region, month by month.</p>
  <table class="data"><thead><tr><th>Setting</th><th>Household waste per person-day (none → all robots + protocol)</th><th>Energy kWh per person-day</th><th>Food vehicle-km per person-day</th></tr></thead><tbody>${archRows}</tbody></table>
  <h4>Seasons</h4><ul>${SEASONS.map((s) => `<li><b>${s.k}:</b> ${s.v}</li>`).join('')}</ul>
  <p class="muted small">Illustrative model, not a forecast. Rates are interpolated linearly between calibrated adoption levels. It doesn't include robot costs, food service, cross-region trade, prices responding to demand, or rebound effects. Food-insecurity shares per region are illustrative inputs.</p>`;
}

init();
