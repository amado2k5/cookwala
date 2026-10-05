/* Home-page dry run: several recipes, device presets, a device builder, shareable URL state, live stats.
   Uses CookwalaDryRun (assets/dryrun.js, the browser port of tools/cookwala_ref.py). No network beyond /v1 files. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var AR = document.documentElement.lang === 'ar';
  var T = AR ? { accepted: 'مقبول', refused: 'مرفوض', device: 'الجهاز', person: 'شخص', refusedW: 'مرفوض', notReached: 'لم تُصَل', sensor: 'حساس', model: 'تقدير مسجَّل', time: 'الوقت فقط', human: 'شخص', personNearby: 'شخص قريب', loading: 'جارٍ تحميل الوصفة والمفردات…', fail: 'تعذّر تحميل بيانات العرض. جرّب الأمر cookwala dryrun.',
    can: function (d, n, dev) { return 'يستطيع ' + d + ' طهي هذا: ' + n + ' خطوة بالجهاز من أصل ' + dev + '.'; }, watch: function (w) { return ' يجب أن يراقب شخص ' + w + ' من خطوات الجهاز لأن لا شيء فيه يستطيع التحقق منها.'; }, est: function (e) { return ' ' + e + ' خطوة تعتمد على تقديرات مسجَّلة.'; }, before: 'قبل أن يسخن أي شيء: ', step: 'الخطوة', reason: 'السبب', ops: 'العمليات', sensors: 'الحساسات', cues: 'إشارات الرؤية', copied: 'تم النسخ', copy: 'نسخ', custom: 'جهاز مخصّص' }
    : { accepted: 'ACCEPTED', refused: 'REFUSED', device: 'Device', person: 'Person', refusedW: 'Refused', notReached: 'not reached', sensor: 'Sensor', model: 'Estimate (logged)', time: 'Time only', human: 'Person', personNearby: 'person nearby', loading: 'Loading the recipe and the operation vocabulary…', fail: 'The demo could not load its data. Try the command-line dry run in the quickstart.',
    can: function (d, n, dev) { return 'The ' + d + ' can cook this: ' + n + ' of ' + dev + ' steps by the device, the rest by a person.'; }, watch: function (w) { return ' A person must watch ' + w + ' of the device\'s steps, because nothing on it can check them.'; }, est: function (e) { return ' ' + e + ' steps rely on logged estimates.'; }, before: 'Before anything heats up: ', step: 'step', reason: 'reason', ops: 'Operations', sensors: 'Sensors', cues: 'Vision cues', copied: 'Copied', copy: 'Copy', custom: 'Custom device' };

  var RECIPES = [['shakshuka', 'Shakshuka · شكشوكة'], ['koshari', 'Koshari · كشري'], ['lentil-soup', 'Lentil soup · شوربة عدس'], ['molokhia', 'Molokhia with chicken · ملوخية'], ['kofta-oven', 'Oven kofta · كفتة'], ['rice-vermicelli', 'Rice with vermicelli · رز بالشعرية'], ['ful-medames', 'Ful medames · فول'], ['salata-baladi', 'Salata baladi · سلطة'], ['basbousa', 'Basbousa · بسبوسة']];
  var HEAT = ['cw.op.heat', 'cw.op.saute', 'cw.op.simmer', 'cw.op.boil', 'cw.op.toast', 'cw.op.bake', 'cw.op.roast', 'cw.op.melt', 'cw.op.reduce', 'cw.op.hold', 'cw.op.cool', 'cw.op.chill'];
  var PREP = ['cw.op.cut', 'cw.op.grate', 'cw.op.crush', 'cw.op.mix', 'cw.op.whisk', 'cw.op.form', 'cw.op.form_wells', 'cw.op.crack', 'cw.op.transfer', 'cw.op.wash', 'cw.op.drain', 'cw.op.layer', 'cw.op.season', 'cw.op.garnish', 'cw.op.serve', 'cw.op.rest', 'cw.op.blend', 'cw.op.wait'];
  var ALL_OPS = HEAT.concat(PREP, ['cw.op.deep_fry']);
  var SENSORS = ['cw.sense.pan_surface_temp', 'cw.sense.liquid_temp', 'cw.sense.oil_temp', 'cw.sense.oven_temp', 'cw.sense.core_temp', 'cw.sense.boil_detect', 'cw.sense.color_vision', 'cw.sense.bubble_vision'];
  var CUES = ['cw.sense.vision', 'cw.sense.translucent', 'cw.sense.egg_whites_set', 'cw.sense.color_golden', 'cw.sense.color_golden_brown', 'cw.sense.lentils_soft', 'cw.sense.liquid_absorbed', 'cw.sense.sauce_coats_spoon', 'cw.sense.fragrant_no_browning', 'cw.sense.oil_shimmer', 'cw.sense.boil_detect', 'cw.sense.fully_melted', 'cw.sense.molokhia_dispersed', 'cw.sense.pasta_al_dente', 'cw.sense.lentils_tender_whole', 'cw.sense.syrup_light_coat'];
  var DEVICES = {
    hob_robot: { name: AR ? 'روبوت مطبخ بموقد وترمومترات' : 'Kitchen robot with hob and thermometers', ops: HEAT.concat(PREP), sensors: ['cw.sense.pan_surface_temp', 'cw.sense.liquid_temp', 'cw.sense.core_temp', 'cw.sense.boil_detect'], cues: CUES },
    hob_robot_basic: { name: AR ? 'روبوت مطبخ بموقد، بلا ترمومترات' : 'Kitchen robot with hob, no thermometers', ops: HEAT.concat(PREP, ['cw.op.deep_fry']), sensors: [], cues: ['cw.sense.vision', 'cw.sense.translucent', 'cw.sense.color_golden', 'cw.sense.color_golden_brown'] },
    fryer_robot: { name: AR ? 'روبوت مطبخ مع ترمومتر زيت' : 'Kitchen robot with an oil thermometer', ops: HEAT.concat(PREP, ['cw.op.deep_fry']), sensors: ['cw.sense.pan_surface_temp', 'cw.sense.liquid_temp', 'cw.sense.oil_temp', 'cw.sense.core_temp', 'cw.sense.boil_detect'], cues: CUES },
    arm: { name: AR ? 'ذراع آلي على الرفّ (يقطع ويخلط وينقل)' : 'Counter robot arm (cuts, cracks, mixes, moves)', ops: ['cw.op.cut', 'cw.op.crack', 'cw.op.transfer', 'cw.op.mix', 'cw.op.whisk', 'cw.op.wash', 'cw.op.drain', 'cw.op.crush', 'cw.op.grate', 'cw.op.layer', 'cw.op.garnish', 'cw.op.form'], sensors: [], cues: ['cw.sense.vision', 'cw.sense.translucent', 'cw.sense.egg_whites_set'] },
    oven: { name: AR ? 'فرن ذكي بمجسّ داخلي' : 'Smart oven with a core probe', ops: ['cw.op.bake', 'cw.op.roast', 'cw.op.heat', 'cw.op.rest'], sensors: ['cw.sense.oven_temp', 'cw.sense.core_temp'], cues: [] }
  };
  var RUNG = { sensor: T.sensor, model: T.model, time: T.time, human: T.human };
  var recipe = null, ops = null, ar = AR, custom = null;

  function caps(d) { return { capabilities: { ops: d.ops.map(function (o) { return { op: o }; }), sensors: d.sensors.map(function (s) { return { sensor: s }; }).concat([{ sensor: 'cw.sense.vision', visionCues: d.cues }]) } }; }
  function stepText(node) {
    var txt = recipe.text && recipe.text[ar ? 'ar' : 'en'] && recipe.text[ar ? 'ar' : 'en'].steps && recipe.text[ar ? 'ar' : 'en'].steps[node.id];
    if (txt) return txt;
    var verb = CookwalaDryRun.opLabel(node.op); return verb.charAt(0).toUpperCase() + verb.slice(1) + (node.inputs && node.inputs.length ? ' ' + node.inputs.join(', ').replace(/_/g, ' ') : '');
  }
  function band(env) { if (!env || !env.tempC) return env && env.unattended === false ? T.personNearby : '—'; return env.medium.replace('_', ' ') + ' ' + env.tempC.min + '–' + env.tempC.max + ' °C'; }
  function cell(row, text, cls) { var td = document.createElement('td'); if (cls) td.className = cls; if (text instanceof Node) td.append(text); else td.textContent = text; row.append(td); }
  function pill(text, cls) { var s = document.createElement('span'); s.className = 'pill ' + cls; s.textContent = text; return s; }

  function currentDevice() { var k = $('#dDevice').value; return k === 'custom' ? custom : DEVICES[k]; }
  function render() {
    if (!recipe || !ops) return;
    var dev = currentDevice(); var res = CookwalaDryRun.dryRun(recipe, caps(dev), ops, $('#dHuman').checked, $('#dModel').checked);
    var v = $('#verdict'); v.className = 'verdict ' + (res.state === 'accepted' ? 'ok' : 'bad'); v.textContent = '';
    var tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = res.state === 'accepted' ? T.accepted : T.refused; v.append(tag);
    if (res.state === 'accepted') {
      var d = res.plan.filter(function (p) { return p.by === 'device'; }).length, watched = res.plan.filter(function (p) { return p.by === 'device' && p.verifiedBy === 'human'; }).length, est = res.plan.filter(function (p) { return p.verifiedBy === 'model'; }).length;
      v.append(T.can(dev.name.toLowerCase(), d, res.plan.length) + (watched ? T.watch(watched) : '') + (est ? T.est(est) : ''));
    } else {
      v.append(T.before + res.refusal.detail + ' (' + T.step + ' ' + res.refusal.node + ', ' + T.reason + ' ' + res.refusal.reason + ').');
    }
    var tb = $('#steps tbody'); tb.textContent = ''; var planned = new Map(res.plan.map(function (p) { return [p.node.id, p]; }));
    recipe.process.nodes.forEach(function (node) {
      var tr = document.createElement('tr'); var p = planned.get(node.id); var env = (ops[node.op] || {}).envelope; var refusedHere = res.state === 'refused' && res.refusal.node === node.id;
      if (refusedHere) tr.className = 'refused'; else if (!p) tr.className = 'pending';
      cell(tr, stepText(node)); cell(tr, node.op.replace('cw.op.', ''), 'op'); cell(tr, band(env), 'band');
      if (p) { cell(tr, pill(p.by === 'device' ? T.device : T.person, p.by)); cell(tr, RUNG[p.verifiedBy] + (p.rung && p.verifiedBy === 'sensor' ? ' · ' + p.rung.replace('cw.sense.', '') : '')); }
      else if (refusedHere) { cell(tr, pill(T.refusedW, 'no')); cell(tr, res.refusal.reason.replace(/_/g, ' ')); }
      else { cell(tr, '—'); cell(tr, T.notReached); }
      tb.append(tr);
    });
    share();
  }
  function share() {
    var q = new URLSearchParams({ r: $('#dRecipe').value, d: $('#dDevice').value, h: $('#dHuman').checked ? 1 : 0, m: $('#dModel').checked ? 1 : 0 });
    if ($('#dDevice').value === 'custom' && custom) q.set('c', custom.ops.map(function (o) { return o.replace('cw.op.', ''); }).join(',') + '|' + custom.sensors.map(function (s) { return s.replace('cw.sense.', ''); }).join(',') + '|' + custom.cues.map(function (s) { return s.replace('cw.sense.', ''); }).join(','));
    var url = location.origin + location.pathname + '?' + q.toString() + '#demo'; $('#shareUrl').value = url;
    if (history.replaceState) history.replaceState(null, '', '?' + q.toString() + location.hash);
  }
  function loadRecipe(id) {
    return fetch('/v1/recipes/' + id + '.cookwala.json').then(function (r) { return r.json(); }).then(function (r) { recipe = r; render(); });
  }
  function buildBuilder() {
    var body = $('#builderBody'); if (!body) return;
    function group(legend, items, prefix, key) {
      var fs = document.createElement('fieldset'); var lg = document.createElement('legend'); lg.textContent = legend; fs.append(lg);
      items.forEach(function (it) { var l = document.createElement('label'); var c = document.createElement('input'); c.type = 'checkbox'; c.value = it; c.dataset.key = key; c.checked = custom[key].indexOf(it) !== -1; l.append(c, document.createTextNode(it.replace(prefix, ''))); fs.append(l); });
      body.append(fs);
    }
    body.textContent = ''; group(T.ops, ALL_OPS, 'cw.op.', 'ops'); group(T.sensors, SENSORS, 'cw.sense.', 'sensors'); group(T.cues, CUES, 'cw.sense.', 'cues');
    body.addEventListener('change', function (e) { var c = e.target; if (!c.dataset.key) return; var arr = custom[c.dataset.key]; var i = arr.indexOf(c.value); if (c.checked && i === -1) arr.push(c.value); if (!c.checked && i !== -1) arr.splice(i, 1); $('#dDevice').value = 'custom'; render(); });
  }

  var params = new URLSearchParams(location.search);
  var selR = $('#dRecipe'); RECIPES.forEach(function (r) { var o = document.createElement('option'); o.value = r[0]; o.textContent = r[1]; selR.append(o); });
  var selD = $('#dDevice'); Object.keys(DEVICES).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = DEVICES[k].name; selD.append(o); });
  var oc = document.createElement('option'); oc.value = 'custom'; oc.textContent = T.custom; selD.append(oc);
  custom = { name: T.custom, ops: HEAT.concat(PREP).slice(), sensors: ['cw.sense.liquid_temp'], cues: ['cw.sense.vision', 'cw.sense.translucent'] };
  if (params.get('c')) { var parts = params.get('c').split('|'); custom.ops = parts[0] ? parts[0].split(',').map(function (x) { return 'cw.op.' + x; }) : []; custom.sensors = parts[1] ? parts[1].split(',').map(function (x) { return 'cw.sense.' + x; }) : []; custom.cues = parts[2] ? parts[2].split(',').map(function (x) { return 'cw.sense.' + x; }) : []; }
  if (params.get('r') && RECIPES.some(function (r) { return r[0] === params.get('r'); })) selR.value = params.get('r');
  if (params.get('d') && (DEVICES[params.get('d')] || params.get('d') === 'custom')) selD.value = params.get('d');
  if (params.has('h')) $('#dHuman').checked = params.get('h') === '1';
  if (params.has('m')) $('#dModel').checked = params.get('m') === '1';
  buildBuilder();
  selR.addEventListener('change', function () { $('#verdict').textContent = T.loading; loadRecipe(selR.value); });
  ['#dDevice', '#dHuman', '#dModel'].forEach(function (s) { $(s).addEventListener('change', render); });
  $('#demoForm').addEventListener('submit', function (e) { e.preventDefault(); });
  $('#copyShare').addEventListener('click', function () { navigator.clipboard.writeText($('#shareUrl').value).then(function () { $('#copyShare').textContent = T.copied; setTimeout(function () { $('#copyShare').textContent = T.copy; }, 1500); }); });
  fetch('/v1/vocab/ops.json').then(function (r) { return r.json(); }).then(function (v) { ops = Object.fromEntries(v.entries.map(function (e) { return [e.id, e]; })); return loadRecipe(selR.value); })
    .catch(function () { $('#verdict').textContent = T.fail; });
  // the proof strip is rendered at build time (tools/build_site.py stats_html)
})();
