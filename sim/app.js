import { simulate, LANES, STAGES, TOGGLES, PRESETS } from './engine/sim.js?v=0.1.2';
import { simulateAlone } from './engine/alone.js?v=0.1.2';
import { ROOMS, SPOTS } from './engine/world.js?v=0.1.2';

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SVG = 'http://www.w3.org/2000/svg';
const ACTOR_LOOK = {
  robot: { emoji: '🤖', color: '#0f766e', lane: 'neo' }, arm: { emoji: '🦾', color: '#0e7490', lane: 'arm' },
  mom: { emoji: '👩', color: '#c2410c', lane: 'mom' }, dad: { emoji: '👨', color: '#9a3412', lane: 'dad' },
  sara: { emoji: '👧', color: '#be185d', lane: 'sara' }, adam: { emoji: '👦', color: '#7c3aed', lane: 'adam' },
  dog: { emoji: '🐕', color: '#a16207', lane: 'dog' }, courier: { emoji: '🛵', color: '#475569', lane: 'courier' }
};
const SHORT = (id = '') => id.replace('did:web:', '').replace('household:', '').replace('robots.example:', '').replace('.example', '').replace('#sim-key', '');

const state = { run: null, runs: null, protocol: true, i: 0, playing: false, timer: null, tab: 'mission' };

// ---------- setup ----------
function initControls() {
  const preset = $('#preset');
  for (const [id, p] of Object.entries(PRESETS)) preset.append(new Option(p.label, id));
  preset.append(new Option('Custom (choose faults)', 'custom'));
  preset.value = 'realistic';
  const faults = $('#faults');
  faults.innerHTML = TOGGLES.map((t) => `<label><input type="checkbox" value="${t.id}"><span>${esc(t.label)}<small>${esc(t.hint)}</small></span></label>`).join('');
  const syncChecks = () => {
    if (preset.value === 'custom') return;
    const on = PRESETS[preset.value].toggles;
    faults.querySelectorAll('input').forEach((c) => { c.checked = on.includes(c.value); });
  };
  preset.addEventListener('change', () => { syncChecks(); run(); });
  faults.addEventListener('change', () => { preset.value = 'custom'; });
  $('#toggleFaults').addEventListener('click', (e) => {
    faults.hidden = !faults.hidden;
    e.currentTarget.setAttribute('aria-expanded', String(!faults.hidden));
    e.currentTarget.textContent = faults.hidden ? 'Faults ▾' : 'Faults ▴';
  });
  syncChecks();
  $('#run').addEventListener('click', run);
  document.querySelectorAll('[data-proto]').forEach((b) => b.addEventListener('click', () => setProtocol(b.dataset.proto === 'on')));
  $('#play').addEventListener('click', togglePlay);
  $('#prev').addEventListener('click', () => go(state.i - 1));
  $('#next').addEventListener('click', () => go(state.i + 1));
  $('#first').addEventListener('click', () => go(0));
  $('#last').addEventListener('click', () => go(state.run.frames.length - 1));
  $('#scrub').addEventListener('input', (e) => go(Number(e.target.value)));
  $('#speed').addEventListener('change', () => { if (state.playing) { stop(); play(); } });
  document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('active', x === b));
    state.tab = b.dataset.tab; renderInspector();
  }));
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowRight') go(state.i + 1);
    if (e.key === 'ArrowLeft') go(state.i - 1);
  });
  $('#stages').innerHTML = STAGES.map((s) => `<span class="stage" data-stage="${s.id}">${esc(s.label)}</span>`).join('');
}

function run() {
  stop();
  const toggles = [...document.querySelectorAll('#faults input:checked')].map((c) => c.value);
  const seed = Number($('#seed').value) || 7;
  state.runs = { on: simulate({ seed, toggles }), off: simulateAlone({ seed, toggles }) };
  state.run = state.protocol ? state.runs.on : state.runs.off;
  $('#scrub').max = state.run.frames.length - 1;
  buildMap();
  buildLanes();
  renderCompare();
  go(0);
  try { localStorage.setItem('cookwala-sim', JSON.stringify({ preset: $('#preset').value, toggles, seed })); } catch { /* storage optional */ }
}

function setProtocol(v) {
  state.protocol = v;
  document.querySelectorAll('[data-proto]').forEach((b) => { const sel = (b.dataset.proto === 'on') === v; b.classList.toggle('on', sel); b.setAttribute('aria-pressed', String(sel)); });
  if (!state.runs) return;
  const t = state.run.frames[state.i].t;
  state.run = v ? state.runs.on : state.runs.off;
  $('#scrub').max = state.run.frames.length - 1;
  buildMap(); buildLanes();
  let best = 0; state.run.frames.forEach((f, i) => { if (f.t <= t) best = i; });
  go(best);
}
function renderCompare() {
  const a = state.runs.on.summary; const b = state.runs.off.summary;
  const rows = [
    ['Dinner served', a.servedAt, b.servedAt], ['Minutes late (target 19:30)', a.lateMin, b.lateMin],
    ['Cost (target ~$15)', `$${a.cost.toFixed(2)}${a.overBudget ? ' (approved by Mom)' : ''}`, `$${b.cost.toFixed(2)}${b.overBudget ? ' (nobody approved)' : ''}`],
    ['Times a human had to step in', `${a.humanInterventions} (${a.humanMinutes} min)`, `${b.humanInterventions} (${b.humanMinutes} min)`],
    ['Robot ran out of battery', a.ranOut ? 'yes (planned handoff)' : 'no', b.ranOut ? 'yes (unplanned)' : 'no'],
    ['Quality changes', `${a.deviations} (each approved & logged)`, `${b.deviations} (not logged)`],
    ['Food wasted after dinner', `${a.wasteG} g (storage plan)`, `${b.wasteG} g`],
    ['Shared, signed record', `${a.records} ledger entries · ${a.decisionsDocumented} decisions`, 'none'],
    ['Dad’s low-salt plate', 'yes', 'no'],
    ['Gaps found', `${a.problems} protocol findings`, `${b.problems} problems without the protocol`]
  ];
  const box = $('#compare');
  box.innerHTML = `<h2>Same evening, same faults: robot + protocol vs robot alone</h2><table class="data"><thead><tr><th></th><th>With the Cookwala protocol</th><th>Robot alone</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table>`;
  const humans = state.runs.off.frames[state.runs.off.frames.length - 1].humans || [];
  if (humans.length) box.innerHTML += `<p class="small muted">Without the protocol the family had to: ${humans.map((h) => `${esc(h.who)} ${esc(h.why)} (${h.minutes} min, ${h.at})`).join('; ')}.</p>`;
}

// ---------- playback ----------
function go(i) {
  if (!state.run) return;
  state.i = Math.max(0, Math.min(state.run.frames.length - 1, i));
  render();
  if (state.i >= state.run.frames.length - 1) stop();
}
function play() {
  state.playing = true;
  $('#play').textContent = '⏸'; $('#play').setAttribute('aria-label', 'Pause');
  if (state.i >= state.run.frames.length - 1) go(0);
  state.timer = setInterval(() => go(state.i + 1), Number($('#speed').value));
}
function stop() {
  state.playing = false; clearInterval(state.timer);
  const b = $('#play'); if (b) { b.textContent = '▶'; b.setAttribute('aria-label', 'Play'); }
}
function togglePlay() { state.playing ? stop() : play(); }

// ---------- render ----------
function render() {
  const f = state.run.frames[state.i];
  $('#clock').textContent = f.clock;
  $('#counter').textContent = `${state.i + 1} / ${state.run.frames.length}`;
  $('#scrub').value = state.i;
  const stageIdx = STAGES.findIndex((s) => s.id === f.stage);
  document.querySelectorAll('.stage').forEach((el, idx) => {
    el.classList.toggle('current', idx === stageIdx);
    el.classList.toggle('done', idx < stageIdx);
    if (idx === stageIdx) { const bar = $('#stages'); bar.scrollTo({ left: el.offsetLeft - bar.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' }); }
  });
  const lane = (id) => LANES.find((l) => l.id === id)?.label || id || '';
  $('#now').innerHTML = `<div class="who"><span class="kind ${f.kind}">${f.kind}</span>${esc(lane(f.actor))}${f.to ? ` → ${esc(lane(f.to))}` : ''} · ${f.clock} · stage: ${esc(STAGES[stageIdx]?.label)}</div>
    <h3>${esc(f.title)}</h3>${f.detail ? `<p>${esc(f.detail)}</p>` : ''}`;
  renderMap(f);
  renderLanes();
  renderStatus(f);
  renderInspector();
}

function renderStatus(f) {
  const w = f.world; const m = f.mission;
  let fc = f.costSoFar || 0;
  if (m) { const cost = m.budgets.find((b) => b.id === 'b-cost').status; fc = Math.max(cost.forecastAtCompletion?.amount || 0, (cost.spent?.amount || 0) + (cost.committed?.amount || 0)); }
  const batt = w.battery;
  const pills = [
    `<span class="pill ${batt <= 15 ? 'bad' : batt < 25 ? 'warn' : 'good'}">🔋 ${batt.toFixed(0)}%${w.docked ? (w.charging ? ' ⚡' : ' docked') : ''}</span>`,
    `<span class="pill ${fc >= 17 ? 'warn' : ''}">💵 $${fc.toFixed(2)} / $20</span>`,
    m ? `<span class="pill">Mission: ${esc(m.state)}</span>` : '<span class="pill warn">no Mission (robot alone)</span>',
    w.devices.power.state === 'off' ? '<span class="pill bad">⚡ power off</span>' : '',
    w.devices.smoke.state !== 'ok' ? '<span class="pill warn">⚠ smoke</span>' : ''
  ];
  $('#status').innerHTML = pills.join('');
}

// ---------- map ----------
function el(name, attrs = {}, parent) {
  const n = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.append(n);
  return n;
}
function buildMap() {
  const svg = $('#map');
  svg.innerHTML = '';
  for (const r of ROOMS) {
    el('rect', { class: 'room', x: r.x, y: r.y, width: r.w, height: r.h, rx: 0.08 }, svg);
    const t = el('text', { class: 'room-label', x: r.x + 0.15, y: r.y + 0.4 }, svg); t.textContent = r.name;
  }
  el('rect', { id: 'night', class: 'night', x: 0, y: 0, width: 5, height: 4, opacity: 0 }, svg);
  for (const [id, s] of Object.entries(SPOTS)) {
    if (!s.label) continue;
    el('circle', { class: 'spot', cx: s.x, cy: s.y, r: 0.07 }, svg);
    const t = el('text', { class: 'spot-label', x: s.x + 0.12, y: s.y + 0.32 }, svg); t.textContent = s.label;
  }
  el('g', { id: 'devices' }, svg);
  const actors = el('g', { id: 'actors' }, svg);
  for (const [id, look] of Object.entries(ACTOR_LOOK)) {
    const g = el('g', { class: 'actor', id: `a-${id}` }, actors);
    el('circle', { r: 0.34, fill: look.color, opacity: 0.18 }, g);
    const e = el('text', {}, g); e.textContent = look.emoji;
    const n = el('text', { class: 'name', y: 0.55 }, g); n.textContent = state.run.frames[0].world.actors[id].name.split(' ')[0];
  }
  el('g', { id: 'speech' }, svg);
}
function renderMap(f) {
  const w = f.world;
  const lightsOff = w.devices.lights.state !== 'on' && f.t > 60;
  $('#night').setAttribute('opacity', lightsOff || w.devices.power.state === 'off' ? 1 : 0);
  for (const id of Object.keys(ACTOR_LOOK)) {
    const a = w.actors[id]; const g = $(`#a-${id}`);
    g.style.transform = `translate(${a.at.x}px, ${a.at.y}px)`;
    g.style.display = a.hidden ? 'none' : '';
  }
  const dev = $('#devices'); dev.innerHTML = '';
  const icon = (x, y, txt, title) => { const t = el('text', { x, y }, el('g', { class: 'device' }, dev)); t.textContent = txt; const tt = el('title', {}, t.parentNode); tt.textContent = title; };
  const hobOn = /high|medium|low|on/.test(`${w.devices.hob.zone1} ${w.devices.hob.zone2}`) && w.devices.power.state === 'on';
  if (hobOn) icon(1.0, 0.25, '🔥', `Hob: zone1 ${w.devices.hob.zone1}, zone2 ${w.devices.hob.zone2}`);
  if (w.devices.gas.state !== 'off') icon(0.45, 0.25, '🔵', 'Gas burner');
  if (w.devices.lights.state === 'on' && w.devices.power.state === 'on') icon(4.6, 0.3, '💡', 'Kitchen lights on');
  if (w.devices.smoke.state !== 'ok') icon(2.5, 0.25, '🚨', `Smoke detector: ${w.devices.smoke.state}`);
  if (w.charging) icon(6.5, 4.15, '⚡', 'Dock charging');
  if (w.sink.dishes > 0) icon(2.9, 0.25, '🍽️', `${w.sink.dishes} dishes in sink`);
  if (w.devices.power.state === 'off') icon(13.4, 0.4, '🔌', 'Power cut');
  const v = w.devices.vacuum; icon(v.at.x, v.at.y, '🧹', `Robot vacuum: ${v.state}`);
  // speech bubble for current actor
  const sp = $('#speech'); sp.innerHTML = '';
  const actorKey = Object.entries(ACTOR_LOOK).find(([, l]) => l.lane === f.actor)?.[0];
  if (actorKey && !w.actors[actorKey].hidden) {
    const a = w.actors[actorKey];
    const text = f.title.length > 46 ? `${f.title.slice(0, 44)}…` : f.title;
    const width = Math.min(6, 0.13 * text.length + 0.3);
    const x = Math.min(Math.max(a.at.x - width / 2, 0), 14 - width); const y = Math.max(a.at.y - 1.05, 0.05);
    el('rect', { class: 'speech-bg', x, y, width, height: 0.42, rx: 0.12 }, sp);
    const t = el('text', { class: 'speech', x: x + 0.15, y: y + 0.28 }, sp); t.textContent = text;
  }
}

// ---------- swimlanes ----------
function buildLanes() {
  const head = `<tr><th class="time">Time</th><th class="what">What</th>${LANES.map((l) => `<th title="${esc(l.label)}">${esc(l.label)}</th>`).join('')}</tr>`;
  const rows = state.run.frames.map((f, i) => {
    const from = LANES.findIndex((l) => l.id === f.actor);
    const to = f.to ? LANES.findIndex((l) => l.id === f.to) : -1;
    const cells = LANES.map((l, c) => {
      let inner = '<span class="lane-line"></span>';
      if (c === from) inner += `<span class="dot c-${f.kind}" title="${esc(f.title)}"></span>`;
      if (to >= 0 && to !== from) {
        const lo = Math.min(from, to); const hi = Math.max(from, to);
        if (c > lo && c < hi) inner += `<span class="bar c-${f.kind}" style="left:0;right:0"></span>`;
        if (c === from) inner += `<span class="bar c-${f.kind}" style="${to > from ? 'left:50%;right:0' : 'left:0;right:50%'}"></span>`;
        if (c === to) inner += `<span class="bar c-${f.kind}" style="${to > from ? 'left:0;right:50%' : 'left:50%;right:0'}"></span><span class="tip" style="${to > from ? 'left:calc(50% - 8px)' : 'left:calc(50% + 1px)'};background:none" class="c-${f.kind}">${to > from ? '▶' : '◀'}</span>`;
      }
      return `<td>${inner}</td>`;
    }).join('');
    return `<tr data-i="${i}"><td class="time">${f.clock}</td><td class="what" title="${esc(f.title)}">${esc(f.title)}</td>${cells}</tr>`;
  }).join('');
  $('#lanes').innerHTML = `<table><thead>${head}</thead><tbody>${rows}</tbody></table>`;
  $('#lanes tbody').addEventListener('click', (e) => { const tr = e.target.closest('tr'); if (tr) go(Number(tr.dataset.i)); });
}
function renderLanes() {
  const rows = document.querySelectorAll('#lanes tbody tr');
  rows.forEach((tr, i) => { tr.classList.toggle('future', i > state.i); tr.classList.toggle('current', i === state.i); });
  const cur = rows[state.i];
  if (cur) {
    const box = $('#lanes');
    const top = cur.offsetTop - box.clientHeight / 2;
    box.scrollTo({ top, behavior: state.playing ? 'smooth' : 'auto' });
  }
}

// ---------- inspector ----------
function renderInspector() {
  if (!state.run) return;
  const f = state.run.frames[state.i];
  if (f.noProtocol) { renderAloneInspector(f); return; }
  const prev = state.run.frames[state.i - 1];
  const findings = state.run.frames.slice(0, state.i + 1).filter((x) => x.kind === 'finding').map((x) => x.finding);
  $('#findingCount').textContent = findings.length;
  const body = $('#tabBody');
  const m = f.mission; const pm = prev?.mission;
  if (state.tab === 'mission') {
    const order = ['header', 'intent', 'mandate', 'context', 'routing', 'requirements', 'readiness', 'decisionRights', 'escalation', 'budgets', 'meters', 'roles', 'reconcileRules', 'contributions', 'assessments', 'reconciliations', 'decisions', 'degradations', 'adaptations', 'plan', 'execution', 'outcome', 'state', 'closure', 'ledger', 'x-sim'];
    body.innerHTML = `<p class="muted small">The live Mission document at ${f.clock}. Sections changed by this step are highlighted and opened. ${m.ledger.length} ledger entries.</p>` + order.filter((k) => k in m).map((k) => {
      const changed = pm && JSON.stringify(m[k]) !== JSON.stringify(pm[k]);
      const count = Array.isArray(m[k]) ? `<span class="tag">${m[k].length}</span>` : '';
      const val = k === 'x-sim' ? { ...m[k], findings: `${(m[k].findings || []).length} findings (see tab)` } : m[k];
      return `<details class="sec${changed ? ' changed' : ''}"${changed ? ' open' : ''}><summary>${esc(k)} ${count}${changed ? '<span class="tag">changed</span>' : ''}</summary><pre>${esc(JSON.stringify(val, null, 2))}</pre></details>`;
    }).join('');
  }
  if (state.tab === 'requirements') {
    body.innerHTML = `<table class="data"><thead><tr><th>Id</th><th>What</th><th>Criticality</th><th>Status</th><th>Satisfied by</th><th>Fallbacks (PACE)</th></tr></thead><tbody>${m.requirements.map((r) => {
      const was = pm?.requirements.find((x) => x.id === r.id);
      const pace = r.fallbacks ? Object.entries(r.fallbacks).map(([k, v]) => `${k}: ${v.action}`).join(' · ') : '';
      return `<tr class="${was && was.status !== r.status ? 'new' : ''}"><td>${esc(r.id)}</td><td>${esc(r.what)}</td><td class="crit-${r.criticality}">${esc(r.criticality)}</td><td>${esc(r.status)}</td><td>${esc(r.satisfiedBy || '')}</td><td class="muted">${esc(pace)}</td></tr>`;
    }).join('')}</tbody></table>`;
  }
  if (state.tab === 'budgets') {
    const g = (title, value, limit, marks = [], unit = '', note = '') => {
      const pct = Math.min(100, (value / limit) * 100);
      const color = pct >= 100 ? 'var(--k-failure)' : pct >= 80 ? 'var(--k-kernel)' : 'var(--k-action)';
      return `<div class="gauge"><strong>${esc(title)}</strong><div class="meter"><span style="width:${pct}%;background:${color}"></span>${marks.map((mk) => `<i style="left:${mk * 100}%" title="${Math.round(mk * 100)}%"></i>`).join('')}</div><div class="small">${esc(unit)}${value.toFixed(2)} of ${esc(unit)}${limit}${note ? ` · ${esc(note)}` : ''}</div></div>`;
    };
    const b = (id) => m.budgets.find((x) => x.id === id);
    const cost = b('b-cost').status;
    const fc = Math.max(cost.forecastAtCompletion?.amount || 0, (cost.spent?.amount || 0) + (cost.committed?.amount || 0));
    body.innerHTML = `<div class="gauges">
      ${g('Cost: spent', cost.spent?.amount || 0, 20, [0.75, 0.85], '$', `committed $${(cost.committed?.amount || 0).toFixed(2)}`)}
      ${g('Cost: forecast at completion', fc, 20, [0.75, 0.85], '$', `state ${cost.state}`)}
      ${g('Robot battery used (net)', Math.max(0, 58 - f.world.battery), 43, [], '', `now ${f.world.battery.toFixed(1)}%, reserve 15%`)}
      ${g('Grocer retries', b('b-retries').status.spent || 0, 2)}
      ${g('Provider calls', b('b-calls').status.spent || 0, 12)}
      <div class="gauge"><strong>Time</strong><div class="small">Plan 19:30 · limit 19:45 · ${esc(b('b-time').status.forecastAtCompletion ? `forecast ${b('b-time').status.forecastAtCompletion.slice(11, 16)}` : 'on plan')}</div></div>
    </div><h4>Meter entries</h4><table class="data"><thead><tr><th>At</th><th>Budget</th><th>Kind</th><th>Amount</th><th>Ref</th><th>By</th></tr></thead><tbody>${m.meters.map((x) => `<tr><td>${x.at.slice(11, 16)}</td><td>${esc(x.budget)}</td><td>${esc(x.kind)}</td><td>${esc(typeof x.amount === 'object' ? `$${x.amount.amount}` : x.amount)}</td><td>${esc(x.ref || '')}</td><td>${esc(SHORT(x.by))}</td></tr>`).join('')}</tbody></table>`;
  }
  if (state.tab === 'decisions') {
    const dec = [...m.decisions].reverse().map((d) => `<div class="card decision"><h4>${esc(d.class)} <span class="tag">${esc(d.basis)}</span></h4><p><strong>${esc(d.choice)}</strong></p><p class="small muted">by ${esc(SHORT(d.by))} · ${d.at.slice(11, 16)}${d.rationale ? ` · ${esc(d.rationale)}` : ''}</p>${d.options ? `<p class="small">Options: ${d.options.map(esc).join(' | ')}</p>` : ''}</div>`).join('');
    const as = m.assessments.map((a) => `<div class="card assessment"><h4>${esc(a.topic)} <span class="tag">${esc(a.stance || '')}</span></h4><p><strong>${esc(a.value)}${esc(a.unit || '')}</strong> (p10 ${a.distribution?.p10} · p90 ${a.distribution?.p90}) — ${esc(a.method)}</p><p class="small muted">by ${esc(SHORT(a.by))}${a.reason ? ` · ${esc(a.reason)}` : ''}</p></div>`).join('');
    const rc = m.reconciliations.map((r) => `<div class="card decision"><h4>Reconciled: ${esc(r.topic)}</h4><p>Value ${esc(r.result.value)}${esc(r.result.unit || '')}, decision value (safety bias) <strong>${esc(r.result.decisionValue)}</strong></p><p class="small muted">${esc(r.strategy)}${r.conflict?.detected ? ` · conflict spread ${r.conflict.spread}` : ''}</p></div>`).join('');
    const ad = m.adaptations.map((a) => `<div class="card"><h4>Adaptation ${esc(a.id)}: ${esc(a.strategy)}</h4><p>${a.actions.map(esc).join('; ')}</p><p class="small muted">quality ${esc(a.deviation?.quality)} · ${esc(a.safety || '')}</p></div>`).join('');
    body.innerHTML = `<h4>Decisions</h4><div class="cards">${dec || '<p class="muted">None yet.</p>'}</div><h4>Assessments &amp; reconciliation</h4><div class="cards">${as}${rc}</div>${ad ? `<h4>Adaptations</h4><div class="cards">${ad}</div>` : ''}`;
  }
  if (state.tab === 'ledger') {
    const prevLen = pm?.ledger.length || 0;
    body.innerHTML = `<p class="muted small">Append-only, SHA-256 hash-chained, signed (simulated keys). Each entry's <code>prev</code> is the hash of the previous entry.</p><table class="data"><thead><tr><th>#</th><th>Time</th><th>Actor</th><th>Action</th><th>Ref</th><th>Why</th><th>prev</th></tr></thead><tbody>${m.ledger.map((e, i) => `<tr class="${i >= prevLen ? 'new' : ''}"><td>${e.seq}</td><td>${e.at.slice(11, 19)}</td><td>${esc(SHORT(e.actor))}</td><td>${esc(e.action)}</td><td>${esc(e.ref || '')}</td><td>${esc(e.why || '')}</td><td class="muted">${esc(e.prev.slice(0, 15))}…</td></tr>`).reverse().join('')}</tbody></table>`;
  }
  if (state.tab === 'findings') {
    const total = state.run.findings.length;
    body.innerHTML = `<p class="muted small">Gaps and ambiguities the simulation hit in the protocol (${findings.length} so far of ${total} in this run). Each points to the spec location to improve.</p><div class="cards">${findings.map((x) => `<div class="card finding"><h4>${esc(x.id)} · ${esc(x.title)}</h4><p>${esc(x.detail)}</p><p class="small muted">${esc(x.specRef)}</p></div>`).join('') || '<p class="muted">None yet — play further.</p>'}</div>`;
  }
}

function renderAloneInspector(f) {
  const body = $('#tabBody'); $('#findingCount').textContent = f.problems.length;
  const t = state.tab;
  if (t === 'mission') body.innerHTML = `<p><b>No Mission document exists.</b> Without the protocol the request, constraints and decisions live only inside NEO and its vendor's cloud. Nobody else can read, check, or sign them. NEO's private log so far:</p><table class="data"><tbody>${f.privateLog.map((l) => `<tr><td>${l.at}</td><td>${esc(l.text)}</td></tr>`).join('') || '<tr><td>empty</td></tr>'}</tbody></table>`;
  if (t === 'requirements') body.innerHTML = '<p>Not tracked. There are no requirements with criticality, no fallbacks (PACE), no definition of ready. The allergy is a setting in the vendor app; Dad\'s diet isn\'t represented at all.</p>';
  if (t === 'budgets') body.innerHTML = `<p>No budgets or thresholds. Cost so far: <b>$${f.costSoFar.toFixed(2)}</b> (Mom asked for ~$15). Battery: <b>${f.world.battery.toFixed(1)} %</b> (reserve 15 %). Nothing warns anyone before a limit is crossed.</p>`;
  if (t === 'decisions') body.innerHTML = '<p>No documented decisions, no estimates from independent providers, no reconciliation. The robot decides privately or asks a human.</p>' + (f.humans.length ? `<h4>Human interventions so far</h4><ul>${f.humans.map((h) => `<li>${h.at}: ${esc(h.who)} had to ${esc(h.why)} (${h.minutes} min)</li>`).join('')}</ul>` : '');
  if (t === 'ledger') body.innerHTML = '<p>No shared, signed ledger. Nobody (family, grocer, insurer, the robot maker) can verify who did what, when or why.</p>';
  if (t === 'findings') body.innerHTML = `<p class="muted small">What went wrong because there was no protocol (${f.problems.length} so far).</p><div class="cards">${f.problems.map((p) => `<div class="card finding"><h4>${esc(p.id)} · ${esc(p.title)}</h4><p>${esc(p.detail)}</p><p class="small muted">${esc(p.at)}</p></div>`).join('') || '<p class="muted">None yet.</p>'}</div>`;
}

initControls();
try {
  const saved = JSON.parse(localStorage.getItem('cookwala-sim') || 'null');
  if (saved) {
    $('#seed').value = saved.seed;
    $('#preset').value = saved.preset;
    document.querySelectorAll('#faults input').forEach((c) => { c.checked = saved.toggles.includes(c.value); });
  }
} catch { /* ignore */ }
run();
