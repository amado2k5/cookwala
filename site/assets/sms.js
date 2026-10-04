/* SMS food-rescue walkthrough: a browser port of parse_sms (tools/cookwala_ref.py) plus a tiny gateway that turns
   messages into Humanitarian Profile documents and rule findings. Nothing is sent anywhere. */
(function () {
  var $ = function (s) { return document.querySelector(s); }; var form = $('#smsForm'); if (!form) return;
  var AR = document.documentElement.lang === 'ar';
  var STORAGE = { A: 'ambient', C: 'chilled', F: 'frozen', H: 'hot_held' };
  function parse(text) {
    if (!text || !text.trim()) return { ok: false, error: 'empty' };
    var toks = text.trim().toUpperCase().split(/\s+/); var cmd = toks[0];
    var kg = function (t) { var m = /^(\d+(?:\.\d+)?)KG$/.exec(t); return m ? parseFloat(m[1]) : null; };
    var temp = function (t) { var m = /^T(-?\d+(?:\.\d+)?)C?$/.exec(t) || /^(-?\d+(?:\.\d+)?)C$/.exec(t); return m ? parseFloat(m[1]) : null; };
    var dm = function (t) { var m = /^(UB|BB)(\d{2})(\d{2})$/.exec(t); if (!m) return null; var d = +m[2], mo = +m[3]; if (d < 1 || d > 31 || mo < 1 || mo > 12) return 'bad'; return { kind: m[1] === 'UB' ? 'use_by' : 'best_before', dayMonth: (d < 10 ? '0' : '') + d + '-' + (mo < 10 ? '0' : '') + mo }; };
    if (cmd === 'HELP') return { ok: true, command: 'HELP' };
    if (cmd === 'CANCEL') return toks.length === 2 ? { ok: true, command: 'CANCEL', id: toks[1] } : { ok: false, error: 'usage' };
    if (cmd === 'OFFER' || cmd === 'FARM') {
      if (toks.length < 4 || kg(toks[1]) === null) return { ok: false, error: 'usage' };
      var storage = null, t = null, d = null, words = [];
      for (var i = 2; i < toks.length; i++) { var tok = toks[i]; if (STORAGE[tok] && storage === null) { storage = STORAGE[tok]; continue; } if (temp(tok) !== null && t === null) { t = temp(tok); continue; } var x = dm(tok); if (x === 'bad') return { ok: false, error: 'bad_date' }; if (x) { d = x; continue; } words.push(tok); }
      if (storage === null || !words.length) return { ok: false, error: 'usage' };
      var out = { ok: true, command: 'OFFER', kg: kg(toks[1]), item: words.join(' ').toLowerCase(), storage: storage }; if (cmd === 'FARM') out.origin = 'farm'; if (t !== null) out.tempC = t; if (d) out.dateMark = d; return out;
    }
    if (cmd === 'CLAIM') { if (toks.length !== 3) return { ok: false, error: 'usage' }; if (toks[2] === 'ALL') return { ok: true, command: 'CLAIM', offer: toks[1], all: true }; var k = toks[2].endsWith('KG') ? kg(toks[2]) : (/^\d+(\.\d+)?$/.test(toks[2]) ? parseFloat(toks[2]) : null); return k === null ? { ok: false, error: 'usage' } : { ok: true, command: 'CLAIM', offer: toks[1], kg: k }; }
    if (cmd === 'HAND') {
      if (toks.length < 3) return { ok: false, error: 'usage' }; var o = { ok: true, command: 'HAND', offer: toks[1] }; var rest;
      if (toks.length >= 6 && toks[2] === '0' && toks[3] === 'REJ') { if (!/^\d+(\.\d+)?$/.test(toks[4])) return { ok: false, error: 'usage' }; o.kgAccepted = 0; o.kgRejected = parseFloat(toks[4]); o.reason = toks[5]; rest = toks.slice(6); }
      else { if (!/^\d+(\.\d+)?$/.test(toks[2])) return { ok: false, error: 'usage' }; o.kgAccepted = parseFloat(toks[2]); rest = toks.slice(3); }
      rest.forEach(function (tok) { if (temp(tok) !== null) o.tempC = temp(tok); }); return o;
    }
    if (cmd === 'DIST') { var m = /^DIST (\d+) MEALS (\d+) PEOPLE (\d+(?:\.\d+)?)KG$/.exec(toks.join(' ')); return m ? { ok: true, command: 'DIST', meals: +m[1], people: +m[2], kg: parseFloat(m[3]) } : { ok: false, error: 'usage' }; }
    if (cmd === 'MENU') { if (toks.length < 3) return { ok: false, error: 'usage' }; var r = { ok: true, command: 'MENU', distribution: toks[1], perMeal: {} }; var map = { KCAL: 'energyKcal', SODIUM: 'sodiumMg', FV: 'fruitVegG', PROTEIN: 'proteinG' }; for (var j = 2; j < toks.length; j++) { var mm = /^(KCAL|SODIUM|FV|PROTEIN)(\d+(?:\.\d+)?)$/.exec(toks[j]); if (!mm) return { ok: false, error: 'usage' }; r.perMeal[map[mm[1]]] = parseFloat(mm[2]); } return r; }
    return { ok: false, error: 'unknown_command' };
  }
  // ---- a tiny gateway: state per session, documents, rule findings (who-codex-basic subset)
  var state = { offers: {}, n: 0, docs: [] }; var today = new Date().toISOString().slice(0, 10);
  function id(p) { state.n += 1; return p + '-' + state.n.toString(36).toUpperCase().padStart(3, '0'); }
  function findings(storage, tempC, cooked) { var f = []; if (storage === 'chilled' && tempC !== undefined && tempC > 5) f.push('safety.chilled_max'); if (storage === 'hot_held' && tempC !== undefined && tempC < 60) f.push('safety.hot_hold_min'); if (storage === 'frozen' && tempC !== undefined && tempC > -18) f.push('safety.frozen_max'); return f; }
  function reply(cmd) {
    if (!cmd.ok) return [AR ? 'لم أفهم. أرسل HELP.' : 'Not understood. Send HELP.', null];
    if (cmd.command === 'HELP') return ['OFFER <kg>KG <item> <A|C|F|H> [T<°C>] [UB|BBddmm] · FARM … · CLAIM <id> ALL|<kg> · HAND <id> <kg> [T<°C>] | HAND <id> 0 REJ <kg> <REASON> · DIST <meals> MEALS <people> PEOPLE <kg>KG · MENU <id> KCALn SODIUMn FVn · CANCEL <id>', null];
    if (cmd.command === 'OFFER') {
      var oid = id('OF'); var item = { lineId: '1', name: cmd.item, kg: cmd.kg, storage: cmd.storage, allergens: [] }; if (cmd.origin) item.origin = cmd.origin; if (cmd.dateMark) item.dateMark = { kind: cmd.dateMark.kind, date: today.slice(0, 4) + '-' + cmd.dateMark.dayMonth.split('-').reverse().join('-') };
      var doc = { profile: '0.2.0', kind: 'Offer', id: oid, donor: 'did:web:donor.example', createdAt: new Date().toISOString(), items: [item], window: { from: new Date().toISOString(), to: new Date(Date.now() + 14 * 3600e3).toISOString() }, site: { country: 'EG', admin1: 'Cairo', siteName: 'Loading bay' }, state: 'offered', version: 1 };
      if (cmd.tempC !== undefined) doc.readings = [{ at: doc.createdAt, tempC: cmd.tempC, method: 'probe', lineId: '1' }];
      var f = findings(cmd.storage, cmd.tempC); if (f.length) doc.findings = f; state.offers[oid] = doc; state.docs.push(doc);
      return [(AR ? 'عرض ' : 'OFFER ') + oid + (AR ? ' مفتوح 14 ساعة' : ' open for 14 h') + (f.length ? (AR ? ' · تحذير: ' : ' · finding: ') + f.join(', ') : ''), doc];
    }
    var off = cmd.offer && state.offers[cmd.offer];
    if (cmd.command === 'CLAIM') { if (!off) return [(AR ? 'لا يوجد عرض ' : 'No offer ') + cmd.offer, null]; if (off.state !== 'offered') return [(AR ? 'العرض ليس متاحًا: ' : 'Offer is not open: ') + off.state, null]; off.state = 'claimed'; off.version += 1; var c = { profile: '0.2.0', kind: 'Claim', id: id('CL'), offer: off.id, claimant: 'did:web:foodbank.example', claimantRole: 'food_bank', claimedAt: new Date().toISOString(), lines: [{ lineId: '1', kg: cmd.all ? off.items[0].kg : cmd.kg }], pickupBy: new Date(Date.now() + 2 * 3600e3).toISOString(), vehicle: off.items[0].storage === 'chilled' ? 'refrigerated' : 'ambient' }; state.docs.push(c); return [(AR ? 'تم الحجز ' : 'CLAIMED ') + off.id + (AR ? ' الاستلام خلال ساعتين' : ' pickup within 2 h'), c]; }
    if (cmd.command === 'HAND') { if (!off) return [(AR ? 'لا يوجد عرض ' : 'No offer ') + cmd.offer, null]; var f2 = findings(off.items[0].storage, cmd.tempC); var h = { profile: '0.2.0', kind: 'Handover', id: id('HO'), offer: off.id, leg: 1, from: off.donor, to: 'did:web:foodbank.example', at: new Date().toISOString(), readings: [{ at: new Date().toISOString(), tempC: cmd.tempC === undefined ? 0 : cmd.tempC, method: cmd.tempC === undefined ? 'not_measured' : 'probe', lineId: '1' }], lines: [{ lineId: '1', kgAccepted: cmd.kgAccepted }], outcome: cmd.kgRejected ? (cmd.kgAccepted ? 'partly_accepted' : 'rejected') : 'accepted', checkedBy: 'trained_staff', rulePack: 'who-codex-basic@0.1.0', findings: f2 }; if (cmd.kgRejected) { h.lines[0].kgRejected = cmd.kgRejected; h.lines[0].reason = { TEMP: 'temp_out_of_range', DATE: 'past_use_by', PACK: 'packaging_damaged' }[cmd.reason] || 'other'; } off.state = cmd.kgAccepted ? 'collected' : 'rejected'; off.version += 1; state.docs.push(h); return [(AR ? 'استلام ' : 'HAND ') + off.id + ': ' + cmd.kgAccepted + ' kg ' + (AR ? 'مقبول' : 'accepted') + (cmd.kgRejected ? ', ' + cmd.kgRejected + ' kg ' + (AR ? 'مرفوض' : 'rejected') : '') + (f2.length ? ' · ' + (AR ? 'حظر: ' : 'BLOCK: ') + f2.join(', ') : ''), h]; }
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
