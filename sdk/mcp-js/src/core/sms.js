// Humanitarian Profile SMS grammar (docs/HUMANITARIAN-PROFILE.md 8.3, RFC-0003). Port of cookwala_ref.parse_sms.
const STORAGE = { A: 'ambient', C: 'chilled', F: 'frozen', H: 'hot_held' };
const REASONS = { TEMP: 'temp_out_of_range', DATE: 'past_use_by', PACK: 'packaging_damaged', ALLERG: 'allergen_unlabelled', QTY: 'quantity_mismatch', PEST: 'pests_or_contamination', SPACE: 'no_capacity', TRANSPORT: 'no_transport', LATE: 'arrived_late', OTHER: 'other' };
const CLASSES = [
  [['YOGURT', 'YOGHURT', 'MILK', 'CHEESE', 'LABNEH', 'CREAM', 'BUTTER', 'ZABADI'], 'dairy'],
  [['CHICKEN', 'POULTRY', 'TURKEY'], 'poultry'],
  [['MEAT', 'BEEF', 'LAMB', 'KOFTA', 'MINCE', 'LIVER'], 'meat'],
  [['FISH', 'SHRIMP', 'PRAWN', 'TUNA', 'SARDINE'], 'fish'],
  [['EGG', 'EGGS'], 'egg'],
  [['COOKED', 'HOT', 'MEALS', 'MEAL', 'TRAYS', 'SOUP', 'STEW', 'KOSHARI'], 'cooked_food'],
  [['RICE'], 'cooked_rice'],
];
const DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9', '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
const NUM = '\\d+(?:\\.\\d+)?';
const full = (re, s) => new RegExp(`^(?:${re})$`).exec(s);

function foodClasses(item) {
  const words = new Set(item.toUpperCase().split(/\s+/));
  const has = (keys) => keys.some((k) => words.has(k));
  const out = CLASSES.filter(([keys]) => has(keys)).map(([, c]) => c);
  if (out.includes('cooked_rice') && !out.includes('cooked_food') && !has(['COOKED', 'HOT', 'TRAYS', 'MEALS', 'MEAL'])) out.splice(out.indexOf('cooked_rice'), 1);
  return out;
}

export function parseSms(input) {
  if (typeof input !== 'string' || !input.trim()) return { ok: false, error: 'empty' };
  const text = [...input].map((c) => DIGITS[c] ?? c).join('');
  const toks = text.trim().toUpperCase().split(/\s+/);
  const cmd = toks[0];
  const kg = (t) => { const m = full(`(${NUM})KG`, t); return m ? parseFloat(m[1]) : null; };
  const temp = (t) => { const m = full('T(-?\\d+(?:\\.\\d+)?)C?', t) || full('(-?\\d+(?:\\.\\d+)?)C', t); return m ? parseFloat(m[1]) : null; };
  const datemark = (t) => {
    const m = full('(UB|BB|HV)(\\d{2})(\\d{2})', t);
    if (!m) return null;
    const day = +m[2], month = +m[3];
    if (!(day >= 1 && day <= 31 && month >= 1 && month <= 12)) return 'bad_date';
    const dm = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}`;
    if (m[1] === 'HV') return { harvested: dm };
    return { kind: m[1] === 'UB' ? 'use_by' : 'best_before', dayMonth: dm };
  };
  if (cmd === 'HELP') return { ok: true, command: 'HELP' };
  if (cmd === 'CANCEL') return toks.length !== 2 ? { ok: false, error: 'usage' } : { ok: true, command: 'CANCEL', id: toks[1] };
  if (cmd === 'OFFER' || cmd === 'FARM') {
    if (toks.length < 4 || kg(toks[1]) === null) return { ok: false, error: 'usage' };
    let storage = null, t = null, dm = null, hv = null; const words = [];
    for (const tok of toks.slice(2)) {
      if (STORAGE[tok] && storage === null) { storage = STORAGE[tok]; continue; }
      if (temp(tok) !== null && t === null) { t = temp(tok); continue; }
      const d = datemark(tok);
      if (d === 'bad_date') return { ok: false, error: 'bad_date' };
      if (d && d.harvested) { hv = d.harvested; continue; }
      if (d) { dm = d; continue; }
      words.push(tok);
    }
    if (storage === null || !words.length) return { ok: false, error: 'usage' };
    const out = { ok: true, command: 'OFFER', kg: kg(toks[1]), item: words.join(' ').toLowerCase(), storage };
    if (cmd === 'FARM') out.origin = 'farm';
    if (t !== null) out.tempC = t;
    if (dm) out.dateMark = dm;
    if (hv) out.harvested = hv;
    const cl = foodClasses(out.item);
    if (cl.length) out.foodClasses = cl;
    return out;
  }
  if (cmd === 'CLAIM') {
    if (toks.length !== 3) return { ok: false, error: 'usage' };
    if (toks[2] === 'ALL') return { ok: true, command: 'CLAIM', offer: toks[1], all: true };
    const k = toks[2].endsWith('KG') ? kg(toks[2]) : (full(NUM, toks[2]) ? parseFloat(toks[2]) : null);
    return k === null ? { ok: false, error: 'usage' } : { ok: true, command: 'CLAIM', offer: toks[1], kg: k };
  }
  if (cmd === 'HAND') {
    if (toks.length < 3 || !full(NUM, toks[2])) return { ok: false, error: 'usage' };
    const out = { ok: true, command: 'HAND', offer: toks[1], kgAccepted: parseFloat(toks[2]) };
    let rest = toks.slice(3);
    if (rest[0] === 'REJ') {
      const k = rest.length >= 2 && full(NUM, rest[1]) ? parseFloat(rest[1]) : null;
      if (k === null || rest.length < 3) return { ok: false, error: 'usage' };
      Object.assign(out, { kgRejected: k, reason: REASONS[rest[2]] || 'other', reasonCode: rest[2] });
      rest = rest.slice(3);
    }
    for (const tok of rest) if (temp(tok) !== null) out.tempC = temp(tok);
    return out;
  }
  if (cmd === 'DIST') {
    const m = full(`DIST (\\d+) MEALS (\\d+) PEOPLE (${NUM})KG`, toks.join(' '));
    return m ? { ok: true, command: 'DIST', meals: +m[1], people: +m[2], kg: parseFloat(m[3]) } : { ok: false, error: 'usage' };
  }
  if (cmd === 'MENU') {
    if (toks.length < 3) return { ok: false, error: 'usage' };
    const keys = { KCAL: 'energyKcal', SODIUM: 'sodiumMg', FV: 'fruitVegG', PROTEIN: 'proteinG' };
    const out = { ok: true, command: 'MENU', distribution: toks[1], perMeal: {} };
    for (const tok of toks.slice(2)) {
      const m = full(`(KCAL|SODIUM|FV|PROTEIN)(${NUM})`, tok);
      if (!m) return { ok: false, error: 'usage' };
      out.perMeal[keys[m[1]]] = parseFloat(m[2]);
    }
    return out;
  }
  return { ok: false, error: 'unknown_command' };
}
