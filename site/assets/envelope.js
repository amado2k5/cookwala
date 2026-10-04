/* Envelope explorer: drag a temperature trace through an operation's safe band. Same rules as tools/cookwala_ref.py check_envelope. */
(function () {
  var $ = function (s) { return document.querySelector(s); }; var svg = $('#envSvg'); if (!svg) return;
  var AR = document.documentElement.lang === 'ar';
  var T = AR ? { ok: 'داخل المظروف', left: 'خرج من المظروف', never: 'لم يصل إلى المظروف', target: 'الهدف لم يُحتفظ به', targetOut: 'هدف الوصفة خارج المظروف', noTherm: 'لا مظروف حراري لهذه العملية', medium: 'الوسط', band: 'النطاق', unatt: 'بلا مراقبة', yes: 'مسموح', no: 'شخص مطلوب', ladder: 'سلم الحساسات', note: function (lo, hi, alt) { return 'عند ' + alt + ' م تتحرك نطاقات الماء بمقدار −1 °م لكل 300 م: ' + lo.toFixed(1) + '–' + hi.toFixed(1) + ' °م.'; }, reason: 'السبب' }
    : { ok: 'inside the envelope', left: 'left the envelope', never: 'never reached the envelope', target: 'target not held', targetOut: 'recipe target outside the envelope', noTherm: 'no thermal envelope for this operation', medium: 'medium', band: 'band', unatt: 'unattended', yes: 'allowed', no: 'person required', ladder: 'sensor ladder', note: function (lo, hi, alt) { return 'At ' + alt + ' m, water bands shift by −1 °C per 300 m: ' + lo.toFixed(1) + '–' + hi.toFixed(1) + ' °C.'; }, reason: 'reason' };
  var ops = null; var pts = [[0, 22], [60, 70], [120, 90], [180, 94], [240, 95], [300, 93]]; var drag = null;
  var W = 640, H = 320, L = 44, R = 16, TOP = 16, B = 34; var TMAX = 260, TMIN = -20;
  function x(t) { return L + (t / 300) * (W - L - R); } function y(c) { return TOP + (1 - (c - TMIN) / (TMAX - TMIN)) * (H - TOP - B); } function yInv(py) { return TMIN + (1 - (py - TOP) / (H - TOP - B)) * (TMAX - TMIN); }
  function check(op, readings, target, alt) {
    var env = (ops[op] || {}).envelope; if (!env || !env.tempC) return { envelopeOk: true, targetOk: null, reason: 'no_thermal_envelope' };
    var lo = env.tempC.min, hi = env.tempC.max; if (env.medium === 'water' || env.medium === 'steam') { var sh = alt / 300; lo -= sh; hi -= sh; }
    if (target && (target.value < lo || target.value > hi)) return { envelopeOk: false, targetOk: false, reason: 'target_outside_envelope', lo: lo, hi: hi };
    var temps = readings.map(function (r) { return r[1]; }); var first = -1;
    for (var i = 0; i < temps.length; i++) { if (temps[i] >= lo && temps[i] <= hi) { first = i; break; } }
    if (first === -1) return { envelopeOk: false, targetOk: target ? false : null, reason: 'never_reached_envelope', lo: lo, hi: hi };
    var steady = temps.slice(first); var envOk = steady.every(function (t) { return t >= lo && t <= hi; }); var tgtOk = null;
    if (target) { var hits = []; steady.forEach(function (t, j) { if (Math.abs(t - target.value) <= target.tolerance) hits.push(j); }); tgtOk = hits.length > 0 && steady.slice(hits[0]).every(function (t) { return Math.abs(t - target.value) <= target.tolerance; }); }
    return { envelopeOk: envOk, targetOk: tgtOk, reason: envOk && (tgtOk === null || tgtOk) ? 'ok' : (!envOk ? 'left_envelope' : 'missed_target'), lo: lo, hi: hi };
  }
  function el(n, a) { var e = document.createElementNS('http://www.w3.org/2000/svg', n); Object.keys(a || {}).forEach(function (k) { e.setAttribute(k, a[k]); }); return e; }
  function render() {
    var op = $('#envOp').value; var alt = +$('#envAlt').value || 0; var useT = $('#envTarget').checked; var target = useT ? { value: +$('#envTargetV').value, tolerance: +$('#envTol').value } : null;
    var env = (ops[op] || {}).envelope || {}; var res = check(op, pts, target, alt);
    while (svg.lastChild && svg.lastChild.tagName !== 'desc') svg.removeChild(svg.lastChild);
    var cs = getComputedStyle(document.documentElement); var ink2 = cs.getPropertyValue('--ink-2').trim(), ember = cs.getPropertyValue('--ember').trim(), ok = cs.getPropertyValue('--ok').trim(), bad = cs.getPropertyValue('--bad').trim(), soft = cs.getPropertyValue('--ember-soft').trim();
    if (res.lo !== undefined) svg.append(el('rect', { x: L, y: y(res.hi), width: W - L - R, height: y(res.lo) - y(res.hi), fill: soft, opacity: 0.9 }));
    if (target) { svg.append(el('rect', { x: L, y: y(target.value + target.tolerance), width: W - L - R, height: y(target.value - target.tolerance) - y(target.value + target.tolerance), fill: 'none', stroke: ember, 'stroke-dasharray': '4 3' })); }
    [0, 50, 100, 150, 200, 250].forEach(function (c) { svg.append(el('line', { x1: L, x2: W - R, y1: y(c), y2: y(c), stroke: ink2, 'stroke-opacity': 0.25 })); var t = el('text', { x: L - 6, y: y(c) + 4, 'text-anchor': 'end', 'font-size': 11, fill: ink2 }); t.textContent = c + '°'; svg.append(t); });
    [0, 60, 120, 180, 240, 300].forEach(function (s) { var t = el('text', { x: x(s), y: H - 12, 'text-anchor': 'middle', 'font-size': 11, fill: ink2 }); t.textContent = s + 's'; svg.append(t); });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + x(p[0]).toFixed(1) + ' ' + y(p[1]).toFixed(1); }).join(' ');
    svg.append(el('path', { d: d, fill: 'none', stroke: res.envelopeOk && res.targetOk !== false ? ok : bad, 'stroke-width': 2.5 }));
    pts.forEach(function (p, i) { var c = el('circle', { cx: x(p[0]), cy: y(p[1]), r: 9, fill: ember, stroke: '#fff', 'stroke-width': 2, tabindex: 0, role: 'slider', 'aria-label': (AR ? 'النقطة ' : 'point ') + (i + 1) + ': ' + p[1] + ' °C', 'aria-valuenow': p[1], 'aria-valuemin': TMIN, 'aria-valuemax': TMAX, style: 'cursor:ns-resize' }); c.dataset.i = i; svg.append(c); });
    var v = $('#envVerdict'); var msg = { ok: T.ok, left_envelope: T.left, never_reached_envelope: T.never, missed_target: T.target, target_outside_envelope: T.targetOut, no_thermal_envelope: T.noTherm }[res.reason];
    v.className = 'verdict ' + (res.reason === 'ok' || res.reason === 'no_thermal_envelope' ? 'ok' : 'bad'); v.textContent = ''; var tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = res.reason === 'ok' ? 'OK' : (res.reason === 'no_thermal_envelope' ? '—' : (AR ? 'خطأ' : 'FAIL')); v.append(tag, msg + ' (' + T.reason + ': ' + res.reason + ')');
    var sheet = $('#envSheet'); sheet.textContent = '';
    [[T.medium, env.medium || '—'], [T.band, env.tempC ? env.tempC.min + '–' + env.tempC.max + ' °C' : '—'], [T.unatt, env.unattended === false ? T.no : (env.unattended === true ? T.yes : '—')], [T.ladder, (env.sensorLadder || ['time']).map(function (s) { return s.replace('cw.sense.', ''); }).join(' → ')]].forEach(function (r) { var dt = document.createElement('dt'); dt.textContent = r[0]; var dd = document.createElement('dd'); dd.textContent = r[1]; sheet.append(dt, dd); });
    $('#envNote').textContent = (res.lo !== undefined && alt) ? T.note(res.lo, res.hi, alt) : (env.note || '');
  }
  function pointer(e) { var r = svg.getBoundingClientRect(); var sy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top; return yInv(sy * (H / r.height)); }
  svg.addEventListener('pointerdown', function (e) { var t = e.target; if (t.tagName === 'circle') { drag = +t.dataset.i; svg.setPointerCapture(e.pointerId); } });
  svg.addEventListener('pointermove', function (e) { if (drag === null) return; pts[drag][1] = Math.round(Math.max(TMIN, Math.min(TMAX, pointer(e)))); render(); });
  svg.addEventListener('pointerup', function () { drag = null; }); svg.addEventListener('pointercancel', function () { drag = null; });
  svg.addEventListener('keydown', function (e) { var t = e.target; if (t.tagName !== 'circle') return; var i = +t.dataset.i; var step = e.shiftKey ? 10 : 1; if (e.key === 'ArrowUp') { pts[i][1] = Math.min(TMAX, pts[i][1] + step); } else if (e.key === 'ArrowDown') { pts[i][1] = Math.max(TMIN, pts[i][1] - step); } else return; e.preventDefault(); render(); svg.querySelectorAll('circle')[i].focus(); });
  ['#envOp', '#envAlt', '#envTarget', '#envTargetV', '#envTol'].forEach(function (s) { $(s).addEventListener('input', render); });
  $('#envForm').addEventListener('submit', function (e) { e.preventDefault(); });
  fetch('/v1/vocab/ops.json').then(function (r) { return r.json(); }).then(function (v) {
    ops = {}; var sel = $('#envOp');
    v.entries.forEach(function (e) { ops[e.id] = e; if (e.envelope && e.envelope.tempC) { var o = document.createElement('option'); o.value = e.id; o.textContent = (AR && e.label.ar ? e.label.ar : e.label.en) + ' (' + e.envelope.tempC.min + '–' + e.envelope.tempC.max + ' °C)'; sel.append(o); } });
    sel.value = 'cw.op.simmer'; render();
  });
})();
