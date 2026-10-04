/* SMS food-rescue walkthrough: a browser port of parse_sms (tools/cookwala_ref.py) plus a tiny gateway that turns
   messages into Humanitarian Profile documents and rule findings. Nothing is sent anywhere. */
(function () {
  var $ = function (s) { return document.querySelector(s); }; var form = $('#smsForm'); if (!form) return;
  var AR = document.documentElement.lang === 'ar';
  var STORAGE = { A: 'ambient', C: 'chilled', F: 'frozen', H: 'hot_held' };
  var REASONS = { TEMP: 'temp_out_of_range', DATE: 'past_use_by', PACK: 'packaging_damaged', ALLERG: 'allergen_unlabelled', QTY: 'quantity_mismatch', PEST: 'pests_or_contamination', SPACE: 'no_capacity', TRANSPORT: 'no_transport', LATE: 'arrived_late', OTHER: 'other' };
  var CLASSES = [[['YOGURT', 'YOGHURT', 'MILK', 'CHEESE', 'LABNEH', 'CREAM', 'BUTTER', 'ZABADI'], 'dairy'], [['CHICKEN', 'POULTRY', 'TURKEY'], 'poultry'], [['MEAT', 'BEEF', 'LAMB', 'KOFTA', 'MINCE', 'LIVER'], 'meat'], [['FISH', 'SHRIMP', 'PRAWN', 'TUNA', 'SARDINE'], 'fish'], [['EGG', 'EGGS'], 'egg'], [['COOKED', 'HOT', 'MEALS', 'MEAL', 'TRAYS', 'SOUP', 'STEW', 'KOSHARI'], 'cooked_food'], [['RICE'], 'cooked_rice']];
  var CHILL = ['dairy', 'poultry', 'meat', 'fish', 'egg', 'cooked_food', 'cooked_rice'];
  function foodClasses(item) { var w = item.toUpperCase().split(/\s+/); var out = CLASSES.filter(function (c) { return c[0].some(function (k) { return w.indexOf(k) >= 0; }); }).map(function (c) { return c[1]; }); if (out.indexOf('cooked_rice') >= 0 && out.indexOf('cooked_food') < 0 && !w.some(function (x) { return ['COOKED', 'HOT', 'TRAYS', 'MEALS', 'MEAL'].indexOf(x) >= 0; })) out.splice(out.indexOf('cooked_rice'), 1); return out; }
  function digits(s) { return s.replace(/[\u0660-\u0669]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x0660 + 48); }).replace(/[\u06F0-\u06F9]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x06F0 + 48); }); }
  function parse(text) {
    if (!text || !text.trim()) return { ok: false, error: 'empty' };
    var toks = digits(text).trim().toUpperCase().split(/\s+/); var cmd = toks[0];
    var kg = function (t) { var m = /^(\d+(?:\.\d+)?)KG$/.exec(t); return m ? parseFloat(m[1]) : null; };
    var temp = function (t) { var m = /^T(-?\d+(?:\.\d+)?)C?$/.exec(t) || /^(-?\d+(?:\.\d+)?)C$/.exec(t); return m ? parseFloat(m[1]) : null; };
    var dm = function (t) { var m = /^(UB|BB|HV)(\d{2})(\d{2})$/.exec(t); if (!m) return null; var d = +m[2], mo = +m[3]; if (d < 1 || d > 31 || mo < 1 || mo > 12) return 'bad'; var dmv = (d < 10 ? '0' : '') + d + '-' + (mo < 10 ? '0' : '') + mo; if (m[1] === 'HV') return { harvested: dmv }; return { kind: m[1] === 'UB' ? 'use_by' : 'best_before', dayMonth: dmv }; };
    if (cmd === 'HELP') return { ok: true, command: 'HELP' };
    if (cmd === 'CANCEL') return toks.length === 2 ? { ok: true, command: 'CANCEL', id: toks[1] } : { ok: false, error: 'usage' };
    if (cmd === 'OFFER' || cmd === 'FARM') {
      if (toks.length < 4 || kg(toks[1]) === null) return { ok: false, error: 'usage' };
      var storage = null, t = null, d = null, hv = null, words = [];
      for (var i = 2; i < toks.length; i++) { var tok = toks[i]; if (STORAGE[tok] && storage === null) { storage = STORAGE[tok]; continue; } if (temp(tok) !== null && t === null) { t = temp(tok); continue; } var x = dm(tok); if (x === 'bad') return { ok: false, error: 'bad_date' }; if (x && x.harvested) { hv = x.harvested; continue; } if (x) { d = x; continue; } words.push(tok); }
      if (storage === null || !words.length) return { ok: false, error: 'usage' };
      var out = { ok: true, command: 'OFFER', kg: kg(toks[1]), item: words.join(' ').toLowerCase(), storage: storage }; if (cmd === 'FARM') out.origin = 'farm'; if (t !== null) out.tempC = t; if (d) out.dateMark = d; if (hv) out.harvested = hv; var fc = foodClasses(out.item); if (fc.length) out.foodClasses = fc; return out;
    }
    if (cmd === 'CLAIM') { if (toks.length !== 3) return { ok: false, error: 'usage' }; if (toks[2] === 'ALL') return { ok: true, command: 'CLAIM', offer: toks[1], all: true }; var k = toks[2].endsWith('KG') ? kg(toks[2]) : (/^\d+(\.\d+)?$/.test(toks[2]) ? parseFloat(toks[2]) : null); return k === null ? { ok: false, error: 'usage' } : { ok: true, command: 'CLAIM', offer: toks[1], kg: k }; }
    if (cmd === 'HAND') {
      if (toks.length < 3) return { ok: false, error: 'usage' }; var o = { ok: true, command: 'HAND', offer: toks[1] };
      if (!/^\d+(\.\d+)?$/.test(toks[2])) return { ok: false, error: 'usage' }; o.kgAccepted = parseFloat(toks[2]); var rest = toks.slice(3);
      if (rest[0] === 'REJ') { if (rest.length < 3 || !/^\d+(\.\d+)?$/.test(rest[1])) return { ok: false, error: 'usage' }; o.kgRejected = parseFloat(rest[1]); o.reason = REASONS[rest[2]] || 'other'; o.reasonCode = rest[2]; rest = rest.slice(3); }
      rest.forEach(function (tok) { if (temp(tok) !== null) o.tempC = temp(tok); }); return o;
    }
    if (cmd === 'DIST') { var m = /^DIST (\d+) MEALS (\d+) PEOPLE (\d+(?:\.\d+)?)KG$/.exec(toks.join(' ')); return m ? { ok: true, command: 'DIST', meals: +m[1], people: +m[2], kg: parseFloat(m[3]) } : { ok: false, error: 'usage' }; }
    if (cmd === 'MENU') { if (toks.length < 3) return { ok: false, error: 'usage' }; var r = { ok: true, command: 'MENU', distribution: toks[1], perMeal: {} }; var map = { KCAL: 'energyKcal', SODIUM: 'sodiumMg', FV: 'fruitVegG', PROTEIN: 'proteinG' }; for (var j = 2; j < toks.length; j++) { var mm = /^(KCAL|SODIUM|FV|PROTEIN)(\d+(?:\.\d+)?)$/.exec(toks[j]); if (!mm) return { ok: false, error: 'usage' }; r.perMeal[map[mm[1]]] = parseFloat(mm[2]); } return r; }
    return { ok: false, error: 'unknown_command' };
  }
  // ---- a tiny gateway: state per session, documents, rule findings (who-codex-basic subset)
  var state = { offers: {}, n: 0, docs: [] }; var today = new Date().toISOString().slice(0, 10);
  function id(p) { state.n += 1; return p + '-' + state.n.toString(36).toUpperCase().padStart(3, '0'); }
  function findings(storage, tempC, atHandover, classes) {
    var f = []; var controlled = storage === 'chilled' || storage === 'frozen' || storage === 'hot_held';
    if (atHandover && controlled && tempC === undefined) { f.push('safety.temp_not_recorded'); return f; }
    if (!atHandover && storage === 'ambient' && (classes || []).some(function (c) { return CHILL.indexOf(c) >= 0; })) f.push('safety.storage_class_mismatch');
    if (storage === 'chilled' && tempC !== undefined && tempC > 5) f.push('safety.chilled_max'); if (storage === 'hot_held' && tempC !== undefined && tempC < 60) f.push('safety.hot_hold_min'); if (storage === 'frozen' && tempC !== undefined && tempC > -18) f.push('safety.frozen_max'); return f; }
  function reply(cmd) {
    if (!cmd.ok) return [AR ? 'لم أفهم. أرسل HELP.' : 'Not understood. Send HELP.', null];
    if (cmd.command === 'HELP') return ['Examples: OFFER 36KG YOGURT C T4 UB0511 / FARM 120KG TOMATO A HV0411 / CLAIM OF1 ALL / HAND OF1 36 T4.6 / HAND OF1 30 REJ 6 PACK T4.6 / DIST 410 MEALS 410 PEOPLE 96KG / CANCEL OF1', null];
    if (cmd.command === 'OFFER') {
      var f = findings(cmd.storage, cmd.tempC, false, cmd.foodClasses);
      if (f.length) return [(AR ? 'مرفوض قبل العرض: ' : 'REFUSED before listing: ') + f.join(', ') + (f.indexOf('safety.hot_hold_min') >= 0 ? (AR ? ' (الطعام الساخن تحت 60 درجة لا يُعرض)' : ' (hot food below 60 °C cannot be offered)') : f.indexOf('safety.storage_class_mismatch') >= 0 ? (AR ? ' (هذا الصنف يحتاج تبريدًا: أرسل C أو F أو H مع الحرارة)' : ' (this item needs temperature control: send C, F or H with a temperature)') : ''), null];
      var oid = id('OF'); var item = { lineId: '1', name: cmd.item, kg: cmd.kg, storage: cmd.storage, allergens: [] }; if (cmd.origin) item.origin = cmd.origin; if (cmd.foodClasses) item.foodClasses = cmd.foodClasses; if (cmd.dateMark) item.dateMark = { kind: cmd.dateMark.kind, date: today.slice(0, 4) + '-' + cmd.dateMark.dayMonth.split('-').reverse().join('-') }; if (cmd.harvested) item.harvestedAt = today.slice(0, 4) + '-' + cmd.harvested.split('-').reverse().join('-');
      var hours = cmd.storage === 'hot_held' ? ((cmd.foodClasses || []).indexOf('cooked_rice') >= 0 ? 1 : 2) : 14;
      var doc = { profile: '0.2.0', kind: 'Offer', id: oid, donor: 'did:web:donor.example', createdAt: new Date().toISOString(), items: [item], window: { from: new Date().toISOString(), to: new Date(Date.now() + hours * 3600e3).toISOString() }, site: { country: 'EG', admin1: 'Cairo', siteName: 'Loading bay' }, state: 'offered', version: 1 };
      if (cmd.tempC !== undefined) doc.readings = [{ at: doc.createdAt, tempC: cmd.tempC, method: 'probe', lineId: '1' }];
      state.offers[oid] = doc; state.docs.push(doc);
      return [(AR ? 'عرض ' : 'OFFER ') + oid + (AR ? ' مفتوح ' + hours + ' ساعة' : ' open for ' + hours + ' h') + (cmd.origin ? (AR ? ' · المصدر: مزرعة' : ' · origin: farm') : ''), doc];
    }
    var off = cmd.offer && state.offers[cmd.offer];
    if (cmd.command === 'CLAIM') { if (!off) return [(AR ? 'لا يوجد عرض ' : 'No offer ') + cmd.offer, null]; if (off.state !== 'offered') return [(AR ? 'العرض ليس متاحًا: ' : 'Offer is not open: ') + off.state, null]; off.state = 'claimed'; off.version += 1; var c = { profile: '0.2.0', kind: 'Claim', id: id('CL'), offer: off.id, claimant: 'did:web:foodbank.example', claimantRole: 'food_bank', claimedAt: new Date().toISOString(), lines: [{ lineId: '1', kg: cmd.all ? off.items[0].kg : cmd.kg }], pickupBy: new Date(Date.now() + 2 * 3600e3).toISOString(), vehicle: off.items[0].storage === 'chilled' ? 'refrigerated' : 'ambient' }; state.docs.push(c); return [(AR ? 'تم الحجز ' : 'CLAIMED ') + off.id + (AR ? ' الاستلام خلال ساعتين' : ' pickup within 2 h'), c]; }
    if (cmd.command === 'HAND') { if (!off) return [(AR ? 'لا يوجد عرض ' : 'No offer ') + cmd.offer, null]; var f2 = findings(off.items[0].storage, cmd.tempC, true); if (f2.indexOf('safety.temp_not_recorded') >= 0) return [(AR ? 'لم يُسجَّل: هذا الصنف يحتاج قياس حرارة. أعد الإرسال مع T<درجة>، مثل HAND ' + off.id + ' ' + cmd.kgAccepted + ' T4.6' : 'NOT RECORDED: this line needs a temperature. Resend with T<°C>, e.g. HAND ' + off.id + ' ' + cmd.kgAccepted + ' T4.6'), null]; var blocked = f2.length > 0; var h = { profile: '0.2.0', kind: 'Handover', id: id('HO'), offer: off.id, leg: 1, from: off.donor, to: 'did:web:foodbank.example', at: new Date().toISOString(), lines: [{ lineId: '1', kgAccepted: blocked ? 0 : cmd.kgAccepted }], outcome: blocked ? 'rejected' : cmd.kgRejected ? (cmd.kgAccepted ? 'partly_accepted' : 'rejected') : 'accepted', checkedBy: 'trained_staff', rulePack: 'who-codex-basic@0.1.0', findings: f2 }; if (cmd.tempC !== undefined) h.readings = [{ at: h.at, tempC: cmd.tempC, method: 'probe', lineId: '1' }]; if (blocked) { h.lines[0].kgRejected = (cmd.kgAccepted || 0) + (cmd.kgRejected || 0); h.lines[0].reason = 'temp_out_of_range'; } else if (cmd.kgRejected) { h.lines[0].kgRejected = cmd.kgRejected; h.lines[0].reason = cmd.reason; } off.state = h.lines[0].kgAccepted ? 'collected' : 'rejected'; off.version += 1; state.docs.push(h); return [(AR ? 'استلام ' : 'HAND ') + off.id + ': ' + h.lines[0].kgAccepted + ' kg ' + (AR ? 'مقبول' : 'accepted') + (h.lines[0].kgRejected ? ', ' + h.lines[0].kgRejected + ' kg ' + (AR ? 'مرفوض' : 'rejected') + ' (' + h.lines[0].reason + ')' : '') + (f2.length ? ' · ' + (AR ? 'حظر: ' : 'BLOCK: ') + f2.join(', ') : ''), h]; }
    if (cmd.command === 'DIST') { var d = { profile: '0.2.0', kind: 'Distribution', id: id('DI'), org: 'did:web:kitchen.example', orgRole: 'community_kitchen', site: { country: 'EG', admin1: 'Cairo', siteName: 'Community kitchen' }, date: today, form: 'hot_meals', meals: cmd.meals, people: { total: cmd.people < 10 ? '<10' : cmd.people }, kgUsed: cmd.kg, rulePack: 'who-codex-basic@0.1.0', findings: [], safetyIncidents: 0 }; state.docs.push(d); state.lastDist = d; return [(AR ? 'توزيع ' : 'DIST ') + d.id + ': ' + cmd.meals + (AR ? ' وجبة اليوم' : ' meals today'), d]; }
    if (cmd.command === 'MENU') { var dd = state.docs.filter(function (x) { return x.kind === 'Distribution' && x.id === cmd.distribution; })[0] || state.lastDist; if (!dd) return [AR ? 'لا يوجد توزيع بعد' : 'No distribution yet', null]; dd.menu = { perMeal: cmd.perMeal }; var ff = []; if (cmd.perMeal.sodiumMg > 800) ff.push('nutrition.sodium_per_meal'); if (cmd.perMeal.fruitVegG !== undefined && cmd.perMeal.fruitVegG < 80) ff.push('school.fruit_veg_per_meal'); dd.findings = ff; return [(AR ? 'القائمة مسجلة لـ ' : 'MENU recorded for ') + dd.id + (ff.length ? ' · ' + (AR ? 'تحذير: ' : 'warn: ') + ff.join(', ') : ' · ' + (AR ? 'لا ملاحظات' : 'no findings')), dd]; }
    if (cmd.command === 'CANCEL') { if (!off) return [(AR ? 'لا يوجد عرض ' : 'No offer ') + cmd.id, null]; off.state = 'withdrawn'; off.version += 1; return [(AR ? 'أُلغي ' : 'CANCELLED ') + off.id, off]; }
    return ['?', null];
  }
  function summary() { var kg = 0, rej = 0, meals = 0, blocks = 0, h = 0; state.docs.forEach(function (d) { if (d.kind === 'Handover') { h++; d.lines.forEach(function (l) { kg += l.kgAccepted || 0; rej += l.kgRejected || 0; }); blocks += (d.findings || []).filter(function (f) { return f.indexOf('safety.') === 0; }).length; } if (d.kind === 'Distribution') meals += d.meals; }); return { kgRescued: { value: kg, method: h ? 'measured' : 'not_recorded', source: 'sum of Handover.lines.kgAccepted', n: h }, kgRejected: { value: rej, method: h ? 'measured' : 'not_recorded' }, mealsServed: { value: meals, method: 'measured', source: 'sum of Distribution.meals' }, safetyBlockFindings: { value: blocks, method: 'measured' } }; }
  var phone = $('#smsPhone'), docs = $('#smsDocs'), input = $('#smsInput'), sum = $('#smsSummary');
  function bubble(text, cls) { var d = document.createElement('div'); d.className = 'msg ' + cls; d.textContent = text; phone.append(d); phone.scrollTop = phone.scrollHeight; }
  function send(text) { bubble(text, 'out'); var r = reply(parse(text)); bubble(r[0], 'in'); if (r[1]) { var pre = document.createElement('pre'); pre.className = 'code'; pre.textContent = JSON.stringify(r[1], null, 1); docs.prepend(pre); while (docs.children.length > 3) docs.removeChild(docs.lastChild); } if (sum) sum.textContent = JSON.stringify(summary(), null, 1); }
  form.addEventListener('submit', function (e) { e.preventDefault(); if (input.value.trim()) { send(input.value.trim()); input.value = ''; input.focus(); } });
  document.querySelectorAll('[data-sms]').forEach(function (b) { b.addEventListener('click', function () { send(b.getAttribute('data-sms')); }); });
  bubble(AR ? 'بوابة الرسائل جاهزة. أرسل HELP أو جرّب الأزرار.' : 'Gateway ready. Send HELP or try the buttons.', 'in');
})();
