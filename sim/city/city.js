import { simulateCities, ASSUMPTIONS, CITY_PRESETS } from './engine.js?v=0.2.2';

const $ = (s) => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const fmt = (v, d = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const COLOR = { A: 'var(--series-1)', B: 'var(--series-2)' };

const PRESETS = CITY_PRESETS;

const state = { cfg: PRESETS.default.make(), res: null, day: 30, playing: false, timer: null };

// ---------------- controls ----------------
function initControls() {
  const sel = $('#preset');
  for (const [id, p] of Object.entries(PRESETS)) sel.append(new Option(p.label, id));
  sel.append(new Option('Custom', 'custom'));
  sel.addEventListener('change', () => { if (sel.value !== 'custom') { state.cfg = PRESETS[sel.value].make(); renderCityControls(); run(); } });
  $('#run').addEventListener('click', run);
  $('#day').addEventListener('input', (e) => { state.day = Number(e.target.value); renderDay(); });
  $('#play').addEventListener('click', () => (state.playing ? stop() : play()));
  renderCityControls();
  const tbl = $('#assumptions');
  tbl.innerHTML = '<thead><tr><th>What</th><th>Value</th><th>Source</th></tr></thead>';
  const tb = document.createElement('tbody');
  for (const a of ASSUMPTIONS) {
    const tr = document.createElement('tr');
    for (const [i, v] of [a.k, a.v, a.src].entries()) {
      const td = document.createElement('td');
      if (i === 2 && a.url) { const link = document.createElement('a'); link.href = a.url; link.textContent = v; td.append(link); } else td.textContent = v;
      tr.append(td);
    }
    tb.append(tr);
  }
  tbl.append(tb);
}
const FEATURES = ['demandSignals', 'consolidated', 'rescue', 'bulkPackaging', 'energySaver'];
function renderCityControls() {
  const box = $('#cityControls'); box.innerHTML = '';
  for (const c of state.cfg) {
    const avg = Math.round(c.communities.reduce((s, m) => s + m.robotShare * m.homes, 0) / c.communities.reduce((s, m) => s + m.homes, 0) * 100);
    const card = document.createElement('div'); card.className = 'city-card'; card.style.setProperty('--c', COLOR[c.id]);
    const protoOn = ['demandSignals', 'consolidated', 'rescue', 'bulkPackaging', 'energySaver'].every((k) => c[k]); const protoAny = ['demandSignals', 'consolidated', 'rescue', 'bulkPackaging', 'energySaver'].some((k) => c[k]);
    card.innerHTML = `<h3></h3>
      <div class="row proto-switch" role="group" aria-label="Cookwala protocol">Cookwala protocol
        <button type="button" data-proto="on" class="seg ${protoOn ? 'on' : ''}" aria-pressed="${protoOn}">On</button><button type="button" data-proto="off" class="seg ${!protoAny ? 'on' : ''}" aria-pressed="${!protoAny}">Off · robots alone</button></div>
      <div class="row">Robot-cook homes <input type="range" min="0" max="100" value="${avg}" data-k="share"> <b data-out>${avg}%</b></div>
      ${[['demandSignals', 'Demand signals to stores & farms'], ['consolidated', 'Consolidated delivery slots'], ['rescue', 'Surplus rescue to community kitchen'], ['bulkPackaging', 'Reusable / bulk packaging'], ['energySaver', 'Energy-saver cooking mode in robot homes']].map(([k, l]) => `<label class="row"><input type="checkbox" data-k="${k}" ${c[k] ? 'checked' : ''}> ${l}</label>`).join('')}`;
    card.querySelector('h3').textContent = c.name;
    card.querySelectorAll('[data-proto]').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.proto === 'on';
      for (const k of FEATURES) c[k] = v;
      $('#preset').value = 'custom';
      renderCityControls(); run();
    }));
    card.addEventListener('input', (e) => {
      const k = e.target.dataset.k; if (!k) return;
      $('#preset').value = 'custom';
      if (k === 'share') {
        const v = Number(e.target.value) / 100;
        card.querySelector('[data-out]').textContent = `${e.target.value}%`;
        c.communities.forEach((m) => { m.robotShare = v; });
      } else c[k] = e.target.checked;
    });
    box.append(card);
  }
}

function run() {
  stop();
  state.res = simulateCities({ seed: Number($('#seed').value) || 11, days: 30, cities: state.cfg });
  state.day = 30; $('#day').value = 30;
  buildMaps(); renderDay(); renderKpis(); renderInsights(); renderCharts(); renderProtocolImpact();
}
function play() {
  state.playing = true; $('#play').textContent = '⏸'; $('#play').setAttribute('aria-label', 'Pause');
  if (state.day >= 30) state.day = 0;
  state.timer = setInterval(() => { state.day += 1; $('#day').value = state.day; renderDay(); if (state.day >= 30) stop(); }, 650);
}
function stop() { state.playing = false; clearInterval(state.timer); $('#play').textContent = '▶'; $('#play').setAttribute('aria-label', 'Play'); }

// ---------------- maps ----------------
const FARMS = [['🥬', 'Vegetable farms'], ['🍎', 'Orchards'], ['🌾', 'Grain farms'], ['🐄', 'Cattle & dairy'], ['🐔', 'Poultry'], ['🐟', 'Fisheries']];
function el(name, attrs, parent, text) {
  const n = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  if (parent) parent.append(n);
  return n;
}
function buildMaps() {
  const box = $('#maps'); box.innerHTML = '';
  for (const c of state.res.cities) {
    const card = document.createElement('div'); card.className = 'map-card'; card.style.setProperty('--c', COLOR[c.id]);
    const h = document.createElement('h3'); h.innerHTML = '<span class="key"></span>'; h.append(`${c.name} · ${fmt(c.people)} people · ${fmt(c.robotHomes)} of ${fmt(c.homes)} homes have robot cooks`);
    const p = document.createElement('p'); p.textContent = c.note;
    card.append(h, p);
    const svg = el('svg', { viewBox: '0 0 560 300', role: 'img', 'aria-label': `${c.name} food system map` });
    el('rect', { class: 'land', x: 0, y: 0, width: 560, height: 300, rx: 10 }, svg);
    const flows = el('g', { id: `flows-${c.id}` }, svg);
    FARMS.forEach(([ico, name], i) => { const y = 32 + i * 46; el('text', { class: 'ico', x: 34, y }, svg, ico); el('text', { class: 'lbl', x: 52, y: y + 4 }, svg, name); });
    el('text', { class: 'ico', x: 210, y: 150 }, svg, '🏭'); el('text', { class: 'lbl b', x: 190, y: 176 }, svg, 'Wholesale');
    c.communities.forEach((m, i) => {
      const y0 = 10 + i * 96;
      el('rect', { x: 300, y: y0, width: 250, height: 88, rx: 8, fill: 'none', stroke: 'var(--line)' }, svg);
      el('text', { class: 'lbl b', x: 308, y: y0 + 14 }, svg, `${m.name} (${m.income} income, ${m.distKm} km to shops)`);
      el('text', { class: 'ico', x: 320, y: y0 + 38 }, svg, '🏬'); el('text', { class: 'ico', x: 320, y: y0 + 64 }, svg, '🏪');
      const dots = 40; const robots = Math.round((m.robotHomes / m.homes) * dots);
      for (let k = 0; k < dots; k++) {
        const col = k % 10; const row = Math.floor(k / 10);
        el('circle', { class: 'home', cx: 352 + col * 14, cy: y0 + 27 + row * 13, r: 4.6, fill: k < robots ? 'var(--series-3)' : 'var(--neutral)' }, svg);
      }
      el('circle', { class: 'bin', id: `bin-${c.id}-${i}`, cx: 528, cy: y0 + 46, r: 4 }, svg);
    });
    el('text', { class: 'ico', x: 210, y: 270, id: `trucks-${c.id}` }, svg, '');
    el('text', { class: 'lbl', x: 150, y: 292, id: `trucklbl-${c.id}` }, svg, '');
    el('text', { class: 'ico', x: 210, y: 60, id: `rescue-${c.id}` }, svg, '');
    el('text', { class: 'lbl', x: 150, y: 84, id: `rescuelbl-${c.id}` }, svg, '');
    card.append(svg);
    const stats = document.createElement('div'); stats.className = 'daystats'; stats.id = `stats-${c.id}`;
    card.append(stats);
    const legend = document.createElement('p');
    legend.innerHTML = '<span class="key" style="--c:var(--series-3);display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--series-3)"></span> robot-cook home &nbsp; <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--neutral)"></span> traditional home · lines: blue = supply trucks, bottom line in each neighbourhood = car shopping trips, right line = delivery vans (width = vehicle-km that day) · grey circle = household waste that day';
    card.append(legend);
    box.append(card);
  }
}
function renderDay() {
  $('#dayLabel').textContent = `Day ${state.day}`;
  const idx = Math.max(0, state.day - 1);
  const max = (k) => Math.max(...state.res.cities.map((c) => Math.max(...c.series.map((s) => s[k]))), 1);
  const mTruck = max('truckKm'); const mCar = max('carKm'); const mVan = max('vanKm'); const mHw = max('householdWaste');
  for (const c of state.res.cities) {
    const d = c.series[idx];
    const g = $(`#flows-${c.id}`); g.innerHTML = '';
    const w = (v, m) => (state.day === 0 ? 0 : 1 + 9 * (v / m));
    FARMS.forEach((_, i) => el('path', { class: 'flow', d: `M70 ${32 + i * 46} C130 ${32 + i * 46}, 150 150, 196 150`, stroke: 'var(--stage-2)', 'stroke-width': w(d.truckKm * 0.6, mTruck) / 2.2 }, g));
    c.communities.forEach((m, i) => {
      const y0 = 10 + i * 96;
      el('path', { class: 'flow', d: `M226 150 C260 150, 270 ${y0 + 38}, 308 ${y0 + 38}`, stroke: 'var(--stage-3)', 'stroke-width': w(d.truckKm * 0.4, mTruck) / 1.4 }, g);
      el('path', { class: 'flow', d: `M348 ${y0 + 80} L 488 ${y0 + 80}`, stroke: COLOR[c.id], 'stroke-width': w(d.carKm / 3, mCar / 3) }, g);
      el('path', { class: 'flow', d: `M500 ${y0 + 24} L 500 ${y0 + 72}`, stroke: 'var(--series-3)', 'stroke-width': w(d.vanKm / 3, mVan / 3) }, g);
      const bin = $(`#bin-${c.id}-${i}`); bin.setAttribute('r', 4 + 14 * (d.householdWaste / 3 / (mHw / 3)));
    });
    $(`#trucks-${c.id}`).textContent = '🚛'.repeat(Math.min(6, d.garbageTrucks));
    $(`#trucklbl-${c.id}`).textContent = `garbage: ${fmt(d.garbage)} kg, ${d.garbageTrucks} truck run(s)`;
    $(`#rescue-${c.id}`).textContent = d.rescued > 0 ? '🍲' : '';
    $(`#rescuelbl-${c.id}`).textContent = d.rescued > 0 ? `${fmt(d.mealsRescued)} meals rescued` : '';
    const stats = $(`#stats-${c.id}`);
    const items = [
      ['Household food waste', `${fmt(d.householdWaste)} kg`], ['Store & wholesale discards', `${fmt(d.retailDiscard + d.wholesaleDiscard)} kg`],
      ['Farm losses', `${fmt(d.farmLoss)} kg`], ['Food vehicle-km', fmt(d.foodVkm)], ['Peak speed', `${fmt(d.peakSpeed, 1)} km/h`],
      ['Deliveries', `${fmt(d.deliveries)} · ${fmt(d.deliveryMin)} min`], ['Car shopping trips', fmt(d.bigShops + d.topUps)], ['Stockouts', `${fmt(d.attempts ? (d.stockouts / d.attempts) * 100 : 0, 1)} %`], ['Natural gas (cooking)', `${fmt(d.gasM3)} m³`], ['Total energy', `${fmt(d.energyKwh / 1000, 2)} MWh`]
    ];
    stats.innerHTML = '';
    for (const [k, v] of items) { const s = document.createElement('div'); s.className = 'daystat'; const b = document.createElement('b'); b.textContent = v; s.append(b, k); stats.append(s); }
  }
}

// ---------------- protocol impact: robots alone vs robots + protocol ----------------
function renderProtocolImpact() {
  const seed = Number($('#seed').value) || 11;
  const force = (v) => state.cfg.map((c) => { const x = JSON.parse(JSON.stringify(c)); for (const k of FEATURES) x[k] = v; return x; });
  const on = simulateCities({ seed, days: 30, cities: force(true) });
  const off = simulateCities({ seed, days: 30, cities: force(false) });
  const rows = [
    ['Household food waste per person', 'hwPP', 'kg', 2, 'down'], ['Food lost before homes', 'chain', 't', 1, 'down'], ['Total garbage collected', 'garbage', 't', 1, 'down'],
    ['Packaging waste', 'packaging', 't', 1, 'down'], ['Food-related vehicle-km', 'vkm', 'km', 0, 'down'], ['Car shopping trips', 'trips', '', 0, 'down'],
    ['Average delivery time', 'delivMin', 'min', 0, 'down'], ['Natural gas for cooking', 'gasM3', 'm³', 0, 'down'], ['Total energy', 'energyMwh', 'MWh', 1, 'down'],
    ['Greenhouse gases', 'co2', 't CO2e', 1, 'down'], ['Food spend per person', 'spendPP', '$', 0, 'down'], ['Store stockouts', 'stockout', '%', 2, 'down'],
    ['Meals rescued for low-income homes', 'meals', '', 0, 'up']
  ];
  const box = $('#protocolImpact'); box.innerHTML = '';
  on.cities.forEach((cOn, i) => {
    const cOff = off.cities[i]; const a = monthly(cOff); const b = monthly(cOn);
    const wrap = document.createElement('div'); wrap.className = 'impact-city'; wrap.style.setProperty('--c', COLOR[cOn.id]);
    const h = document.createElement('h3'); h.textContent = `${cOn.name}: ${cOn.robotHomes} robot-cook homes either way`; wrap.append(h);
    const t = document.createElement('table'); t.className = 'data';
    t.innerHTML = '<thead><tr><th>This month</th><th class="num">Robots alone (protocol off)</th><th class="num">Robots + protocol</th><th class="num">Protocol effect</th></tr></thead>';
    const tb = document.createElement('tbody');
    for (const [name, k, unit, d, good] of rows) {
      const tr = document.createElement('tr');
      const tiny = Math.abs(a[k]) < 0.05 && Math.abs(b[k]) < 0.05 && unit === '%';
      const ch = a[k] && !tiny ? ((b[k] - a[k]) / a[k]) * 100 : null;
      const better = ch == null ? b[k] > 0 : (good === 'down' ? ch < 0 : ch > 0);
      const cells = [name, `${unit === '$' ? '$' : ''}${fmt(a[k], d)} ${unit !== '$' ? unit : ''}`, `${unit === '$' ? '$' : ''}${fmt(b[k], d)} ${unit !== '$' ? unit : ''}`,
        ch == null ? (tiny ? '≈ 0' : b[k] > 0 ? 'only with protocol' : '—') : `${ch > 0 ? '+' : ''}${fmt(ch, 1)} %`];
      cells.forEach((v, j) => { const td = document.createElement('td'); td.textContent = v; if (j) td.className = 'num'; if (j === 3 && Math.abs(ch ?? 1) >= 0.5) td.classList.add(better ? 'good' : 'bad'); tr.append(td); });
      tb.append(tr);
    }
    t.append(tb); wrap.append(t); box.append(wrap);
  });
}

// ---------------- KPIs & insights ----------------
function monthly(c) {
  const T = c.totals; const P = c.people; const S = c.series;
  const deliv = S.reduce((s, d) => s + d.deliveries, 0);
  return {
    hwPP: T.householdWaste / P, ediblePP: (T.householdWaste - T.inedibleWaste) / P, chain: (T.farmLoss + T.wholesaleDiscard + T.retailDiscard) / 1000,
    retail: T.retailDiscard / 1000, wholesale: T.wholesaleDiscard / 1000, farm: T.farmLoss / 1000,
    garbage: T.garbage / 1000, packaging: T.packaging / 1000, vkm: T.foodVkm, speed: T.peakSpeed / S.length,
    delivMin: deliv ? S.reduce((s, d) => s + d.deliveryMin * d.deliveries, 0) / deliv : 0, deliveries: deliv,
    spendPP: T.spend / P, co2: T.co2 / 1000, meals: T.mealsRescued, stockout: T.attempts ? (T.stockouts / T.attempts) * 100 : 0,
    hoursPerHome: T.humanHours / c.homes, trips: T.bigShops + T.topUps,
    gasM3: T.gasM3, cookElec: T.cookElecKwh, robotKwh: T.robotKwh, fuelL: T.fuelL, coldKwh: T.coldKwh, energyMwh: T.energyKwh / 1000,
    fuelKwh: T.fuelKwh, gasKwh: T.gasKwh, energyPP: T.energyKwh / P
  };
}
function renderKpis() {
  const [A, B] = state.res.cities; const a = monthly(A); const b = monthly(B);
  const rows = [
    ['Household food waste per person', 'hwPP', 'kg', 1], ['…of which edible (avoidable)', 'ediblePP', 'kg', 1], ['Loss before homes (farm + wholesale + retail)', 'chain', 't', 1],
    ['Total garbage collected', 'garbage', 't', 1], ['Packaging waste', 'packaging', 't', 1], ['Food-related vehicle-km', 'vkm', 'km', 0],
    ['Car shopping trips', 'trips', '', 0], ['Average delivery time', 'delivMin', 'min', 0], ['Average peak traffic speed', 'speed', 'km/h', 1],
    ['Food spend per person', 'spendPP', '$', 0], ['Greenhouse gases (transport, cooking, wasted food)', 'co2', 't CO2e', 1], ['Meals rescued for low-income homes', 'meals', '', 0],
    ['Store stockouts (share of purchases)', 'stockout', '%', 1], ['Cooking & shopping hours per home', 'hoursPerHome', 'h', 0],
    ['Natural gas for cooking', 'gasM3', 'm³', 0], ['Electricity for cooking (stoves)', 'cookElec', 'kWh', 0], ['Robot electricity', 'robotKwh', 'kWh', 0],
    ['Vehicle fuel (gasoline + diesel)', 'fuelL', 'L', 0], ['Refrigeration in stores & wholesale', 'coldKwh', 'kWh', 0], ['Total energy (cooking, robots, transport, cold chain)', 'energyMwh', 'MWh', 1]
  ];
  const box = $('#kpis'); box.innerHTML = '';
  for (const [name, k, unit, d] of rows) {
    const div = document.createElement('div'); div.className = 'kpi';
    const delta = b[k] ? ((a[k] - b[k]) / b[k]) * 100 : null;
    const nm = document.createElement('div'); nm.className = 'name'; nm.textContent = `${name} (month)`;
    const vals = document.createElement('div'); vals.className = 'vals';
    for (const [c, v] of [[A, a[k]], [B, b[k]]]) {
      const s = document.createElement('span'); s.className = 'v'; s.style.setProperty('--c', COLOR[c.id]);
      s.innerHTML = '<i class="sw"></i>';
      s.append(`${unit === '$' ? '$' : ''}${fmt(v, d)}`);
      const sm = document.createElement('small'); sm.textContent = ` ${unit !== '$' ? unit : ''} ${c.name}`; s.append(sm);
      vals.append(s);
    }
    const dl = document.createElement('div'); dl.className = 'delta';
    dl.textContent = delta == null ? (a[k] ? 'only in Nilebridge' : '—') : `${delta > 0 ? '+' : ''}${fmt(delta, 0)} % vs Harborfield`;
    div.append(nm, vals, dl); box.append(div);
  }
}
function renderInsights() {
  const [A, B] = state.res.cities; const a = monthly(A); const b = monthly(B);
  const pct = (x, y) => `${fmt(Math.abs(((x - y) / y) * 100), 0)} %`;
  const homeA = A.communities.map((m) => m); const robot = homeA.filter((m) => m.robotHomes).map((m) => m.robot.wasteKgPerPersonMonth);
  const trad = homeA.map((m) => m.trad.wasteKgPerPersonMonth);
  const avg = (xs) => xs.reduce((s, v) => s + v, 0) / Math.max(1, xs.length);
  const items = [
    `<b>Homes:</b> inside the same city, robot-cook homes threw away ${fmt(avg(robot), 1)} kg of food per person this month vs ${fmt(avg(trad), 1)} kg in traditional homes (−${pct(avg(robot), avg(trad))}). Peels, bones and shells don't disappear, but planned buying, exact portions, use-first and freezer planning cut the edible part sharply.`,
    `<b>Supply chain:</b> ${a.chain < b.chain ? `Nilebridge lost ${pct(a.chain, b.chain)} less food before it reached homes` : `Losses before homes were not lower in Nilebridge`} (${fmt(a.chain, 1)} t vs ${fmt(b.chain, 1)} t). Stores, wholesale and farms ordered against the robot homes' planned demand instead of guessing with large safety stocks.`,
    `<b>Garbage:</b> ${fmt(a.garbage, 1)} t collected in Nilebridge vs ${fmt(b.garbage, 1)} t (${a.garbage < b.garbage ? '−' : '+'}${pct(a.garbage, b.garbage)}), including ${fmt(b.packaging - a.packaging, 1)} t less packaging.`,
    `<b>Traffic:</b> food-related vehicle-km fell ${pct(a.vkm, b.vkm)} (${fmt(b.trips - a.trips)} fewer car shopping trips; ${a.deliveries > b.deliveries ? 'more' : 'fewer'} but consolidated deliveries). Peak speed barely moved (${fmt(a.speed, 1)} vs ${fmt(b.speed, 1)} km/h) because food trips are a small share of rush-hour traffic: an honest limit of what food logistics alone can do.`,
    `<b>Delivery:</b> average delivery time ${fmt(a.delivMin)} min vs ${fmt(b.delivMin)} min. Consolidated slots are planned around meal plans, so orders arrive before they're needed instead of being rushed one by one.`,
    `<b>Money:</b> food spend per person ${fmt(a.spendPP)} $ vs ${fmt(b.spendPP)} $ per month (${a.spendPP < b.spendPP ? '−' : '+'}${pct(a.spendPP, b.spendPP)}): less food bought to be thrown away, fewer convenience-store premiums, cheaper shared delivery slots (robot hardware not included).`,
    a.meals > 0 ? `<b>Hunger:</b> ${fmt(a.meals)} meals' worth of food that stores would have discarded went to the Riverside community kitchen instead.` : '<b>Hunger:</b> without surplus rescue, end-of-life food from stores went to the bin.',
    `<b>Climate:</b> ${fmt(a.co2, 1)} t CO2e vs ${fmt(b.co2, 1)} t (${a.co2 < b.co2 ? '−' : '+'}${pct(a.co2, b.co2)}), mostly from not producing, moving and dumping food nobody eats.`,
    `<b>Energy & gas:</b> natural gas for cooking ${fmt(a.gasM3)} m³ vs ${fmt(b.gasM3)} m³ (${a.gasM3 < b.gasM3 ? '−' : '+'}${pct(a.gasM3, b.gasM3)}); robot homes cook with less heat (energy-saver methods), but their robots add ${fmt(a.robotKwh)} kWh of electricity. Across the whole chain (cooking, robots, transport fuel, refrigeration) the city used ${fmt(a.energyMwh, 1)} MWh vs ${fmt(b.energyMwh, 1)} MWh (${a.energyMwh < b.energyMwh ? '−' : '+'}${pct(a.energyMwh, b.energyMwh)}): savings come mostly from fewer car trips and smaller chilled inventories, not from the kitchen.`,
    `<b>Time:</b> ${fmt(b.hoursPerHome - a.hoursPerHome)} fewer hours of cooking and shopping per home this month on average.`
  ];
  const cA = state.cfg[0];
  const robotHeavy = A.robotHomes / A.homes > 0.25;
  if (robotHeavy && !cA.demandSignals) items.splice(1, 1, `<b>Supply chain (warning):</b> with robot homes but no demand signals, losses before homes were ${fmt(a.chain, 1)} t vs ${fmt(b.chain, 1)} t. Robots ordering every few days look like erratic demand to stores that can't see their plans (a bullwhip effect), so stores keep large safety stocks. The protocol's demand signals are what turn home planning into less waste upstream.`);
  if (!robotHeavy && cA.demandSignals) items.push('<b>Protocol without robots:</b> demand signals only cover the few homes that plan with Cookwala, so upstream gains are small; most of the benefit here comes from surplus rescue and consolidated deliveries. Plans (robot or guided-human) are the fuel the protocol runs on.');
  const ul = $('#insights'); ul.innerHTML = items.map((t) => `<li>${t}</li>`).join('');
}

// ---------------- charts ----------------
const tip = () => $('#tip');
function showTip(e, title, rows) {
  const t = tip(); t.hidden = false; t.innerHTML = '';
  const h = document.createElement('div'); h.textContent = title; h.className = 'muted'; t.append(h);
  for (const [name, val, color] of rows) {
    const r = document.createElement('div'); r.className = 'row'; r.style.setProperty('--c', color);
    const i = document.createElement('i'); const b = document.createElement('b'); b.textContent = val; const s = document.createElement('span'); s.className = 'muted'; s.textContent = name;
    r.append(i, b, s); t.append(r);
  }
  const x = Math.min(window.innerWidth - t.offsetWidth - 8, e.clientX + 14); t.style.left = `${x}px`; t.style.top = `${e.clientY + 14}px`;
}
function hideTip() { tip().hidden = true; }

function chartCard(title, desc) {
  const card = document.createElement('div'); card.className = 'chart';
  const h = document.createElement('h3'); h.textContent = title;
  const p = document.createElement('p'); p.className = 'desc'; p.textContent = desc;
  const btn = document.createElement('button'); btn.className = 'tbl-toggle'; btn.textContent = 'Table';
  card.append(h, p, btn);
  $('#charts').append(card);
  return { card, btn };
}
function legend(card, items, box) {
  const l = document.createElement('div'); l.className = 'legend';
  for (const [name, color] of items) { const s = document.createElement('span'); const i = document.createElement('i'); if (box) i.className = 'box'; i.style.setProperty('--c', color); s.append(i, name); l.append(s); }
  card.append(l);
}
function lineChart(title, desc, key, unit, digits, transform = (v) => v) {
  const { card, btn } = chartCard(title, desc);
  const cities = state.res.cities;
  legend(card, cities.map((c) => [c.name, COLOR[c.id]]));
  const W = 600; const H = 210; const m = { l: 44, r: 92, t: 10, b: 26 };
  const data = cities.map((c) => c.series.map((d) => transform(d[key], c)));
  const all = data.flat();
  let lo = Math.min(...all); let hi = Math.max(...all);
  const zeroBased = lo >= 0 && lo / Math.max(hi, 1e-9) < 0.6;
  if (zeroBased) lo = 0;
  const pad = (hi - lo) * 0.1 || 1; hi += pad; if (!zeroBased) lo -= pad;
  const x = (i) => m.l + (i / 29) * (W - m.l - m.r);
  const y = (v) => H - m.b - ((v - lo) / (hi - lo)) * (H - m.t - m.b);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': title });
  for (let k = 0; k <= 4; k++) {
    const v = lo + ((hi - lo) * k) / 4; const yy = y(v);
    el('line', { class: k === 0 ? 'baseline' : 'gridline', x1: m.l, x2: W - m.r, y1: yy, y2: yy }, svg);
    el('text', { class: 'axis', x: m.l - 6, y: yy + 3, 'text-anchor': 'end' }, svg, fmt(v, digits));
  }
  for (const dday of [1, 8, 15, 22, 30]) el('text', { class: 'axis', x: x(dday - 1), y: H - 8, 'text-anchor': 'middle' }, svg, `day ${dday}`);
  data.forEach((vals, ci) => {
    el('path', { class: 'series', d: vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' '), stroke: COLOR[cities[ci].id] }, svg);
    const last = vals[vals.length - 1];
    el('text', { class: 'endlbl', x: W - m.r + 6, y: y(last) + (ci === 0 ? -4 : 12) }, svg, `${cities[ci].name} ${fmt(last, digits)}`);
  });
  const xh = el('line', { class: 'xhair', x1: 0, x2: 0, y1: m.t, y2: H - m.b, opacity: 0 }, svg);
  const hit = el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent' }, svg);
  hit.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(29, Math.round(((px - m.l) / (W - m.l - m.r)) * 29)));
    xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('opacity', 1);
    showTip(e, `Day ${i + 1}`, cities.map((c, ci) => [c.name, `${fmt(data[ci][i], digits)} ${unit}`, COLOR[c.id]]));
  });
  hit.addEventListener('pointerleave', () => { xh.setAttribute('opacity', 0); hideTip(); });
  card.append(svg);
  addTable(card, btn, ['Day', ...cities.map((c) => `${c.name} (${unit})`)], data[0].map((_, i) => [i + 1, ...data.map((d) => fmt(d[i], digits))]));
}
function addTable(card, btn, head, rows) {
  const t = document.createElement('table'); t.className = 'data'; t.hidden = true;
  const thead = document.createElement('thead'); const tr = document.createElement('tr');
  head.forEach((h) => { const th = document.createElement('th'); th.textContent = h; tr.append(th); }); thead.append(tr); t.append(thead);
  const tb = document.createElement('tbody');
  rows.forEach((r) => { const row = document.createElement('tr'); r.forEach((v, i) => { const td = document.createElement('td'); td.textContent = v; if (i) td.className = 'num'; row.append(td); }); tb.append(row); });
  t.append(tb); card.append(t);
  btn.addEventListener('click', () => { t.hidden = !t.hidden; btn.textContent = t.hidden ? 'Table' : 'Chart only'; });
}
function lossChart() {
  const { card, btn } = chartCard('Where food is lost', 'Tonnes lost or wasted this month at each stage, from farm to home.');
  const stages = [['farm', 'Farms (unsold & handling)', 'var(--stage-1)'], ['wholesale', 'Wholesale', 'var(--stage-2)'], ['retail', 'Stores', 'var(--stage-3)'], ['household', 'Homes', 'var(--stage-4)']];
  legend(card, stages.map(([, n, c]) => [n, c]), true);
  const cities = state.res.cities; const W = 600; const H = 120; const m = { l: 92, r: 60, t: 8, b: 8 };
  const totals = cities.map((c) => stages.reduce((s, [k]) => s + c.lossByStage[k], 0) / 1000);
  const max = Math.max(...totals);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Food lost by stage' });
  cities.forEach((c, ci) => {
    const y0 = m.t + ci * 54; let x0 = m.l;
    el('text', { class: 'axis', x: m.l - 8, y: y0 + 20, 'text-anchor': 'end' }, svg, c.name);
    for (const [k, n, col] of stages) {
      const v = c.lossByStage[k] / 1000; const w = (v / max) * (W - m.l - m.r);
      const r = el('rect', { x: x0, y: y0 + 6, width: Math.max(0, w - 2), height: 26, rx: 4, fill: col }, svg);
      r.addEventListener('pointermove', (e) => showTip(e, `${c.name} · ${n}`, [[n, `${fmt(v, 1)} t`, col]]));
      r.addEventListener('pointerleave', hideTip);
      x0 += w;
    }
    el('text', { class: 'endlbl', x: x0 + 6, y: y0 + 24 }, svg, `${fmt(totals[ci], 1)} t`);
  });
  card.append(svg);
  addTable(card, btn, ['City', ...stages.map(([, n]) => `${n} (t)`), 'Total (t)'], cities.map((c, ci) => [c.name, ...stages.map(([k]) => fmt(c.lossByStage[k] / 1000, 1)), fmt(totals[ci], 1)]));
}
function homesChart() {
  const { card, btn } = chartCard('Robot-cook homes vs traditional homes', 'Household food waste per person this month, by community (kg). Communities with almost no robot homes show only the traditional bar.');
  legend(card, [['Robot-cook homes', 'var(--series-3)'], ['Traditional homes', 'var(--neutral)']], true);
  const rows = state.res.cities.flatMap((c) => c.communities.map((m) => ({ city: c.name, ...m })));
  const W = 600; const rowH = 34; const m = { l: 150, r: 50, t: 6 };
  const H = m.t + rows.length * rowH + 4;
  const max = Math.max(...rows.flatMap((r) => [r.robot.wasteKgPerPersonMonth, r.trad.wasteKgPerPersonMonth]));
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Household waste robot vs traditional homes' });
  rows.forEach((r, i) => {
    const y0 = m.t + i * rowH;
    el('text', { class: 'axis', x: m.l - 8, y: y0 + 18, 'text-anchor': 'end' }, svg, `${r.name} (${r.city})`);
    const bars = [];
    if (r.robotHomes >= 5) bars.push(['Robot-cook homes', r.robot.wasteKgPerPersonMonth, 'var(--series-3)']);
    bars.push(['Traditional homes', r.trad.wasteKgPerPersonMonth, 'var(--neutral)']);
    bars.forEach(([n, v, col], j) => {
      const w = (v / max) * (W - m.l - m.r); const yy = y0 + 4 + j * 14;
      const rect = el('rect', { x: m.l, y: yy, width: Math.max(2, w), height: 12, rx: 4, fill: col }, svg);
      rect.addEventListener('pointermove', (e) => showTip(e, `${r.name} · ${n}`, [[n, `${fmt(v, 1)} kg/person`, col]]));
      rect.addEventListener('pointerleave', hideTip);
      el('text', { class: 'axis', x: m.l + w + 5, y: yy + 10 }, svg, fmt(v, 1));
    });
  });
  card.append(svg);
  addTable(card, btn, ['Community', 'Robot homes', 'Robot kg/person', 'Traditional kg/person'], rows.map((r) => [`${r.name} (${r.city})`, `${r.robotHomes} / ${r.homes}`, r.robotHomes ? fmt(r.robot.wasteKgPerPersonMonth, 1) : '—', fmt(r.trad.wasteKgPerPersonMonth, 1)]));
}
function groupedBars(title, desc, rows, unit, digits) {
  const { card, btn } = chartCard(title, desc);
  const cities = state.res.cities;
  legend(card, cities.map((c) => [c.name, COLOR[c.id]]), true);
  const W = 600; const rowH = 38; const m = { l: 190, r: 70, t: 6 };
  const H = m.t + rows.length * rowH + 4;
  const max = Math.max(...rows.flatMap((r) => r.values));
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': title });
  rows.forEach((r, i) => {
    const y0 = m.t + i * rowH;
    el('text', { class: 'axis', x: m.l - 8, y: y0 + 19, 'text-anchor': 'end' }, svg, r.label);
    r.values.forEach((v, j) => {
      const w = (v / max) * (W - m.l - m.r); const yy = y0 + 4 + j * 15;
      const rect = el('rect', { x: m.l, y: yy, width: Math.max(2, w), height: 13, rx: 4, fill: COLOR[cities[j].id] }, svg);
      rect.addEventListener('pointermove', (e) => showTip(e, r.label, [[cities[j].name, `${fmt(v, digits)} ${unit}`, COLOR[cities[j].id]]]));
      rect.addEventListener('pointerleave', hideTip);
      el('text', { class: 'axis', x: m.l + w + 5, y: yy + 10 }, svg, fmt(v, digits));
    });
  });
  card.append(svg);
  addTable(card, btn, ['Use', ...cities.map((c) => `${c.name} (${unit})`)], rows.map((r) => [r.label, ...r.values.map((v) => fmt(v, digits))]));
}
function energyChart() {
  const [A, B] = state.res.cities.map(monthly);
  groupedBars('Energy by use', 'MWh this month. Gas converted at 10.5 kWh per m³; fuel at its energy content.', [
    { label: 'Cooking: natural gas', values: [A.gasKwh / 1000, B.gasKwh / 1000] },
    { label: 'Cooking: electric stoves', values: [A.cookElec / 1000, B.cookElec / 1000] },
    { label: 'Robot electricity', values: [A.robotKwh / 1000, B.robotKwh / 1000] },
    { label: 'Transport fuel', values: [A.fuelKwh / 1000, B.fuelKwh / 1000] },
    { label: 'Store & wholesale refrigeration', values: [A.coldKwh / 1000, B.coldKwh / 1000] }
  ], 'MWh', 2);
}
function homesEnergyChart() {
  const { card, btn } = chartCard('Home cooking energy: robot vs traditional', 'kWh per person this month: stove energy (gas + electric) and, for robot homes, the robot’s own electricity.');
  legend(card, [['Robot homes: stove', 'var(--series-3)'], ['Robot homes: robot electricity', 'var(--stage-3)'], ['Traditional homes: stove', 'var(--neutral)']], true);
  const rows = state.res.cities.flatMap((c) => c.communities.filter((m) => m.robotHomes >= 5).map((m) => ({ city: c.name, ...m })));
  const W = 600; const rowH = 34; const ml = 150; const mr = 50;
  const H = 6 + rows.length * rowH + 4;
  const max = Math.max(...rows.flatMap((r) => [r.robot.cookKwhPerPersonMonth, r.trad.stoveKwhPerPersonMonth]));
  const sx = (v) => (v / max) * (W - ml - mr);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Home cooking energy robot vs traditional' });
  rows.forEach((r, i) => {
    const y0 = 6 + i * rowH;
    el('text', { class: 'axis', x: ml - 8, y: y0 + 18, 'text-anchor': 'end' }, svg, `${r.name} (${r.city})`);
    const stoveW = sx(r.robot.stoveKwhPerPersonMonth); const robW = sx(r.robot.robotKwhPerPersonMonth);
    const a = el('rect', { x: ml, y: y0 + 4, width: Math.max(2, stoveW - 2), height: 12, rx: 4, fill: 'var(--series-3)' }, svg);
    const b = el('rect', { x: ml + stoveW, y: y0 + 4, width: Math.max(2, robW), height: 12, rx: 4, fill: 'var(--stage-3)' }, svg);
    el('text', { class: 'axis', x: ml + stoveW + robW + 5, y: y0 + 14 }, svg, fmt(r.robot.cookKwhPerPersonMonth, 1));
    const tw = sx(r.trad.stoveKwhPerPersonMonth);
    const c = el('rect', { x: ml, y: y0 + 18, width: Math.max(2, tw), height: 12, rx: 4, fill: 'var(--neutral)' }, svg);
    el('text', { class: 'axis', x: ml + tw + 5, y: y0 + 28 }, svg, fmt(r.trad.stoveKwhPerPersonMonth, 1));
    for (const [rect, n, v, col] of [[a, 'Robot homes: stove', r.robot.stoveKwhPerPersonMonth, 'var(--series-3)'], [b, 'Robot homes: robot electricity', r.robot.robotKwhPerPersonMonth, 'var(--stage-3)'], [c, 'Traditional homes: stove', r.trad.stoveKwhPerPersonMonth, 'var(--neutral)']]) {
      rect.addEventListener('pointermove', (e) => showTip(e, `${r.name} (${r.city})`, [[n, `${fmt(v, 1)} kWh/person`, col]]));
      rect.addEventListener('pointerleave', hideTip);
    }
  });
  card.append(svg);
  addTable(card, btn, ['Community', 'Robot: stove kWh', 'Robot: robot kWh', 'Robot: gas m³', 'Traditional: stove kWh', 'Traditional: gas m³'], rows.map((r) => [`${r.name} (${r.city})`, fmt(r.robot.stoveKwhPerPersonMonth, 1), fmt(r.robot.robotKwhPerPersonMonth, 1), fmt(r.robot.gasM3PerPersonMonth, 2), fmt(r.trad.stoveKwhPerPersonMonth, 1), fmt(r.trad.gasM3PerPersonMonth, 2)]));
}
function renderCharts() {
  $('#charts').innerHTML = '';
  lineChart('Household food waste', 'Kilograms per person per day, incl. inedible parts.', 'householdWaste', 'kg/person', 3, (v, c) => v / c.people);
  lineChart('Garbage collected', 'Food waste, packaging and store/wholesale discards picked up, tonnes per day.', 'garbage', 't', 2, (v) => v / 1000);
  lineChart('Food-related traffic', 'Vehicle-km per day: shopping cars, delivery vans, supply and garbage trucks.', 'foodVkm', 'km', 0);
  lineChart('Peak traffic speed', 'Average rush-hour speed, km/h (BPR congestion model).', 'peakSpeed', 'km/h', 2);
  lineChart('Delivery time', 'Average minutes from dispatch to door per delivery.', 'deliveryMin', 'min', 0);
  lineChart('Food spend', 'Dollars per person per day, incl. delivery fees.', 'spend', '$', 2, (v, c) => v / c.people);
  lineChart('Natural gas for cooking', 'Cubic metres per day across all gas-stove homes.', 'gasM3', 'm³', 0);
  lineChart('Total energy', 'MWh per day: cooking (gas + electric), robots, transport fuel, refrigeration.', 'energyKwh', 'MWh', 2, (v) => v / 1000);
  energyChart();
  lossChart();
  homesChart();
  homesEnergyChart();
}

initControls();
run();
