/* Home-page dry run: several recipes, device presets, a device builder, shareable URL state, live stats.
   Uses CookwalaDryRun (assets/dryrun.js, the browser port of tools/cookwala_ref.py). No network beyond /v1 files. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var LANG = document.documentElement.lang || 'en';
  var T_AR = { accepted: 'مقبول', refused: 'مرفوض', device: 'الجهاز', person: 'شخص', refusedW: 'مرفوض', notReached: 'لم تُصَل', sensor: 'حساس', model: 'تقدير مسجَّل', time: 'الوقت فقط', human: 'شخص', personNearby: 'شخص قريب', loading: 'جارٍ تحميل الوصفة والمفردات…', fail: 'تعذّر تحميل بيانات العرض. جرّب الأمر cookwala dryrun.', can: function (d, n, dev) { return 'يستطيع ' + d + ' طهي هذا: ' + n + ' خطوة بالجهاز من أصل ' + dev + '.'; }, watch: function (w) { return ' يجب أن يراقب شخص ' + w + ' من خطوات الجهاز لأن لا شيء فيه يستطيع التحقق منها.'; }, est: function (e) { return ' ' + e + ' خطوة تعتمد على تقديرات مسجَّلة.'; }, before: 'قبل أن يسخن أي شيء: ', step: 'الخطوة', reason: 'السبب', ops: 'العمليات', sensors: 'الحساسات', cues: 'إشارات الرؤية', copied: 'تم النسخ', copy: 'نسخ', custom: 'جهاز مخصّص — ابنِه بالأسفل' };
  var T_EN = { accepted: 'ACCEPTED', refused: 'REFUSED', device: 'Device', person: 'Person', refusedW: 'Refused', notReached: 'not reached', sensor: 'Sensor', model: 'Estimate (logged)', time: 'Time only', human: 'Person', personNearby: 'person nearby', loading: 'Loading the recipe and the operation vocabulary…', fail: 'The demo could not load its data. Try the command-line dry run in the quickstart.', can: function (d, n, dev) { return 'The ' + d + ' can cook this: ' + n + ' of ' + dev + ' steps by the device, the rest by a person.'; }, watch: function (w) { return ' A person must watch ' + w + ' of the device\'s steps, because nothing on it can check them.'; }, est: function (e) { return ' ' + e + ' steps rely on logged estimates.'; }, before: 'Before anything heats up: ', step: 'step', reason: 'reason', ops: 'Operations', sensors: 'Sensors', cues: 'Vision cues', copied: 'Copied', copy: 'Copy', custom: 'Custom device — build it below' };
  var T_FR = { accepted: 'ACCEPTÉ', refused: 'REFUSÉ', device: 'Appareil', person: 'Personne', refusedW: 'Refusé', notReached: 'non atteint', sensor: 'Capteur', model: 'Estimation (enregistrée)', time: 'Temps uniquement', human: 'Personne', personNearby: 'personne à proximité', loading: 'Chargement de la recette et du vocabulaire opérationnel…', fail: 'La démo n\'a pas pu charger ses données. Essayez la commande cookwala dryrun du quickstart.', can: function (d, n, dev) { return 'L\'appareil ' + d + ' peut préparer ceci : ' + n + ' sur ' + dev + ' étapes par l\'appareil, le reste par une personne.'; }, watch: function (w) { return ' Une personne doit surveiller ' + w + ' des étapes de l\'appareil, car rien ne peut les vérifier.'; }, est: function (e) { return ' ' + e + ' étapes reposent sur des estimations enregistrées.'; }, before: 'Avant que tout ne chauffe : ', step: 'étape', reason: 'raison', ops: 'Opérations', sensors: 'Capteurs', cues: 'Indices visuels', copied: 'Copié', copy: 'Copier', custom: 'Appareil personnalisé — construisez-le ci-dessous' };
  var T_DE = { accepted: 'AKZEPTIERT', refused: 'ABGELEHNT', device: 'Gerät', person: 'Person', refusedW: 'Abgelehnt', notReached: 'nicht erreicht', sensor: 'Sensor', model: 'Schätzung (protokolliert)', time: 'Nur Zeit', human: 'Person', personNearby: 'Person in der Nähe', loading: 'Rezept und Betriebsvokabular werden geladen…', fail: 'Die Demo konnte ihre Daten nicht laden. Versuchen Sie die Befehlszeile cookwala dryrun im Quickstart.', can: function (d, n, dev) { return 'Das Gerät ' + d + ' kann dies kochen: ' + n + ' von ' + dev + ' Schritten durch das Gerät, der Rest von einer Person.'; }, watch: function (w) { return ' Eine Person muss ' + w + ' der Gerätezeile überwachen, da nichts davon überprüft werden kann.'; }, est: function (e) { return ' ' + e + ' Schritte basieren auf protokollierten Schätzungen.'; }, before: 'Bevor etwas erhitzt wird: ', step: 'Schritt', reason: 'Grund', ops: 'Operationen', sensors: 'Sensoren', cues: 'Sehhinweise', copied: 'Kopiert', copy: 'Kopieren', custom: 'Benutzerdefiniertes Gerät — bauen Sie es unten' };
  var T_ES = { accepted: 'ACEPTADO', refused: 'RECHAZADO', device: 'Dispositivo', person: 'Persona', refusedW: 'Rechazado', notReached: 'no alcanzado', sensor: 'Sensor', model: 'Estimación (registrada)', time: 'Solo tiempo', human: 'Persona', personNearby: 'persona cercana', loading: 'Cargando receta y vocabulario de operaciones…', fail: 'La demostración no pudo cargar sus datos. Intente el comando cookwala dryrun en el inicio rápido.', can: function (d, n, dev) { return 'El dispositivo ' + d + ' puede cocinar esto: ' + n + ' de ' + dev + ' pasos por el dispositivo, el resto por una persona.'; }, watch: function (w) { return ' Una persona debe vigilar ' + w + ' de los pasos del dispositivo, porque nada puede verificarlos.'; }, est: function (e) { return ' ' + e + ' pasos se basan en estimaciones registradas.'; }, before: 'Antes de que nada se caliente: ', step: 'paso', reason: 'motivo', ops: 'Operaciones', sensors: 'Sensores', cues: 'Señales visuales', copied: 'Copiado', copy: 'Copiar', custom: 'Dispositivo personalizado — constrúyalo abajo' };
  var T_PT = { accepted: 'ACEITO', refused: 'RECUSADO', device: 'Dispositivo', person: 'Pessoa', refusedW: 'Recusado', notReached: 'não alcançado', sensor: 'Sensor', model: 'Estimativa (registrada)', time: 'Apenas tempo', human: 'Pessoa', personNearby: 'pessoa próxima', loading: 'Carregando receita e vocabulário operacional…', fail: 'A demonstração não conseguiu carregar seus dados. Tente o comando cookwala dryrun no início rápido.', can: function (d, n, dev) { return 'O dispositivo ' + d + ' pode cozinhar isto: ' + n + ' de ' + dev + ' passos pelo dispositivo, o resto por uma pessoa.'; }, watch: function (w) { return ' Uma pessoa deve vigiar ' + w + ' dos passos do dispositivo, porque nada pode verificá-los.'; }, est: function (e) { return ' ' + e + ' passos dependem de estimativas registradas.'; }, before: 'Antes de qualquer coisa esquentar: ', step: 'passo', reason: 'motivo', ops: 'Operações', sensors: 'Sensores', cues: 'Pistas visuais', copied: 'Copiado', copy: 'Copiar', custom: 'Dispositivo personalizado — construa abaixo' };
  var T_IT = { accepted: 'ACCETTATO', refused: 'RIFIUTATO', device: 'Dispositivo', person: 'Persona', refusedW: 'Rifiutato', notReached: 'non raggiunto', sensor: 'Sensore', model: 'Stima (registrata)', time: 'Solo tempo', human: 'Persona', personNearby: 'persona vicina', loading: 'Caricamento ricetta e vocabolario operazionale…', fail: 'La demo non ha potuto caricare i suoi dati. Prova il comando cookwala dryrun nella guida rapida.', can: function (d, n, dev) { return 'Il dispositivo ' + d + ' può cucinare questo: ' + n + ' di ' + dev + ' passaggi dal dispositivo, il resto da una persona.'; }, watch: function (w) { return ' Una persona deve sorvegliare ' + w + ' dei passaggi del dispositivo, perché nulla può verificarli.'; }, est: function (e) { return ' ' + e + ' passaggi si basano su stime registrate.'; }, before: 'Prima che nulla si riscaldi: ', step: 'passaggio', reason: 'motivo', ops: 'Operazioni', sensors: 'Sensori', cues: 'Indizi visivi', copied: 'Copiato', copy: 'Copia', custom: 'Dispositivo personalizzato — costruiscilo qui sotto' };
  var T = LANG === 'ar' ? T_AR : LANG === 'fr' ? T_FR : LANG === 'de' ? T_DE : LANG === 'es' ? T_ES : LANG === 'pt' ? T_PT : LANG === 'it' ? T_IT : T_EN;
  var AR = LANG === 'ar';

  var RECIPES_EN = [['shakshuka', 'Shakshuka'], ['koshari', 'Koshari'], ['lentil-soup', 'Lentil soup'], ['molokhia', 'Molokhia with chicken'], ['kofta-oven', 'Oven kofta'], ['rice-vermicelli', 'Rice with vermicelli'], ['ful-medames', 'Ful medames'], ['salata-baladi', 'Salata baladi'], ['basbousa', 'Basbousa']];
  var RECIPES_AR = [['shakshuka', 'شكشوكة'], ['koshari', 'كشري'], ['lentil-soup', 'شوربة عدس'], ['molokhia', 'ملوخية'], ['kofta-oven', 'كفتة'], ['rice-vermicelli', 'رز بالشعرية'], ['ful-medames', 'فول'], ['salata-baladi', 'سلطة'], ['basbousa', 'بسبوسة']];
  var RECIPES_FR = [['shakshuka', 'Shakshuka'], ['koshari', 'Koshari'], ['lentil-soup', 'Soupe de lentilles'], ['molokhia', 'Molokhia au poulet'], ['kofta-oven', 'Kofta au four'], ['rice-vermicelli', 'Riz aux vermicelles'], ['ful-medames', 'Ful medames'], ['salata-baladi', 'Salata baladi'], ['basbousa', 'Basbousa']];
  var RECIPES_DE = [['shakshuka', 'Shakshuka'], ['koshari', 'Koshari'], ['lentil-soup', 'Linsensuppe'], ['molokhia', 'Molokhia mit Hähnchen'], ['kofta-oven', 'Kofta im Ofen'], ['rice-vermicelli', 'Reis mit Fadennudeln'], ['ful-medames', 'Ful medames'], ['salata-baladi', 'Salata baladi'], ['basbousa', 'Basbousa']];
  var RECIPES_ES = [['shakshuka', 'Shakshuka'], ['koshari', 'Koshari'], ['lentil-soup', 'Sopa de lentejas'], ['molokhia', 'Molokhia con pollo'], ['kofta-oven', 'Kofta al horno'], ['rice-vermicelli', 'Arroz con fideos'], ['ful-medames', 'Ful medames'], ['salata-baladi', 'Salata baladi'], ['basbousa', 'Basbousa']];
  var RECIPES_PT = [['shakshuka', 'Shakshuka'], ['koshari', 'Koshari'], ['lentil-soup', 'Sopa de lentilhas'], ['molokhia', 'Molokhia com frango'], ['kofta-oven', 'Kofta ao forno'], ['rice-vermicelli', 'Arroz com macarrão fino'], ['ful-medames', 'Ful medames'], ['salata-baladi', 'Salata baladi'], ['basbousa', 'Basbousa']];
  var RECIPES_IT = [['shakshuka', 'Shakshuka'], ['koshari', 'Koshari'], ['lentil-soup', 'Zuppa di lenticchie'], ['molokhia', 'Molokhia con pollo'], ['kofta-oven', 'Kofta al forno'], ['rice-vermicelli', 'Riso con vermicelli'], ['ful-medames', 'Ful medames'], ['salata-baladi', 'Salata baladi'], ['basbousa', 'Basbousa']];
  var RECIPES = LANG === 'ar' ? RECIPES_AR : LANG === 'fr' ? RECIPES_FR : LANG === 'de' ? RECIPES_DE : LANG === 'es' ? RECIPES_ES : LANG === 'pt' ? RECIPES_PT : LANG === 'it' ? RECIPES_IT : RECIPES_EN;
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
  var recipe = null, ops = null, ar = AR, custom = null, touched = false;

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
  function getHumanLevel() { var radios = document.querySelectorAll('input[name="humanLevel"]'); for (var i = 0; i < radios.length; i++) if (radios[i].checked) return radios[i].value; return 'kitchen'; }
  function render() {
    if (!recipe || !ops) return;
    var dev = currentDevice(); var level = getHumanLevel(); var humanPresent = level === 'nearby' || level === 'kitchen'; var res = CookwalaDryRun.dryRun(recipe, caps(dev), ops, humanPresent, $('#dModel').checked);
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
    var q = new URLSearchParams({ r: $('#dRecipe').value, d: $('#dDevice').value, h: getHumanLevel(), m: $('#dModel').checked ? 1 : 0 });
    if ($('#dDevice').value === 'custom' && custom) q.set('c', custom.ops.map(function (o) { return o.replace('cw.op.', ''); }).join(',') + '|' + custom.sensors.map(function (s) { return s.replace('cw.sense.', ''); }).join(',') + '|' + custom.cues.map(function (s) { return s.replace('cw.sense.', ''); }).join(','));
    var url = location.origin + location.pathname + '?' + q.toString() + '#demo'; $('#shareUrl').value = url;
    if ((touched || location.search) && history.replaceState) history.replaceState(null, '', '?' + q.toString() + location.hash);
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
    body.addEventListener('change', function (e) { var c = e.target; if (!c.dataset.key) return; var arr = custom[c.dataset.key]; var i = arr.indexOf(c.value); if (c.checked && i === -1) arr.push(c.value); if (!c.checked && i !== -1) arr.splice(i, 1); $('#dDevice').value = 'custom'; touched = true; render(); });
  }

  function runPreset() {
    touched = true;
    selR.value = 'koshari'; selD.value = 'hob_robot_basic';
    var rb = document.querySelector('input[name="humanLevel"][value="kitchen"]'); if (rb) rb.checked = true;
    $('#dModel').checked = true;
    $('#verdict').textContent = T.loading;
    loadRecipe('koshari').then(function () { var v = $('#verdict'); if (v.scrollIntoView) v.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  }

  var params = new URLSearchParams(location.search);
  var selR = $('#dRecipe'); RECIPES.forEach(function (r) { var o = document.createElement('option'); o.value = r[0]; o.textContent = r[1]; selR.append(o); });
  var selD = $('#dDevice'); Object.keys(DEVICES).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = DEVICES[k].name; selD.append(o); });
  var oc = document.createElement('option'); oc.value = 'custom'; oc.textContent = T.custom; selD.append(oc);
  custom = { name: T.custom, ops: HEAT.concat(PREP).slice(), sensors: ['cw.sense.liquid_temp'], cues: ['cw.sense.vision', 'cw.sense.translucent'] };
  if (params.get('c')) { var parts = params.get('c').split('|'); custom.ops = parts[0] ? parts[0].split(',').map(function (x) { return 'cw.op.' + x; }) : []; custom.sensors = parts[1] ? parts[1].split(',').map(function (x) { return 'cw.sense.' + x; }) : []; custom.cues = parts[2] ? parts[2].split(',').map(function (x) { return 'cw.sense.' + x; }) : []; }
  if (params.get('r') && RECIPES.some(function (r) { return r[0] === params.get('r'); })) selR.value = params.get('r');
  if (params.get('d') && (DEVICES[params.get('d')] || params.get('d') === 'custom')) selD.value = params.get('d');
  if (params.has('h')) { var hLevel = params.get('h'); if (['none', 'house', 'nearby', 'kitchen'].indexOf(hLevel) !== -1) { var rb = document.querySelector('input[name="humanLevel"][value="' + hLevel + '"]'); if (rb) rb.checked = true; } }
  if (params.has('m')) $('#dModel').checked = params.get('m') === '1';
  buildBuilder();
  selR.addEventListener('change', function () { touched = true; $('#verdict').textContent = T.loading; loadRecipe(selR.value); });
  selD.addEventListener('change', function () { touched = true; if (selD.value === 'custom') { var b = $('#builder'); if (b) { b.open = true; if (b.scrollIntoView) b.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } } render(); });
  ['#dModel'].forEach(function (s) { $(s).addEventListener('change', function () { touched = true; render(); }); });
  var humanRadios = document.querySelectorAll('input[name="humanLevel"]'); for (var i = 0; i < humanRadios.length; i++) { humanRadios[i].addEventListener('change', function () { touched = true; render(); }); }
  var dPreset = $('#dPreset'); if (dPreset) dPreset.addEventListener('click', runPreset);
  var heroTry = document.getElementById('heroTry'); if (heroTry) heroTry.addEventListener('click', runPreset);
  $('#demoForm').addEventListener('submit', function (e) { e.preventDefault(); });
  $('#copyShare').addEventListener('click', function () { navigator.clipboard.writeText($('#shareUrl').value).then(function () { $('#copyShare').textContent = T.copied; setTimeout(function () { $('#copyShare').textContent = T.copy; }, 1500); }); });
  fetch('/v1/vocab/ops.json').then(function (r) { return r.json(); }).then(function (v) { ops = Object.fromEntries(v.entries.map(function (e) { return [e.id, e]; })); return loadRecipe(selR.value); })
    .catch(function () { $('#verdict').textContent = T.fail; });
  // the proof strip is rendered at build time (tools/build_site.py stats_html)
})();
