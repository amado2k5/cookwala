// Pure query engine over the compact query index (/v1/query/recipes.json, built by tools/build_query_index.py).
// No I/O. Used by the REST API (src/api.js). Everything here is read-only.

const COUNTRY = { egypt: 'EG', egyptian: 'EG', mexico: 'MX', mexican: 'MX', japan: 'JP', japanese: 'JP', morocco: 'MA', moroccan: 'MA', china: 'CN', chinese: 'CN', france: 'FR', french: 'FR', vietnam: 'VN', vietnamese: 'VN' };

export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const words = (s) => norm(s).split(/[^a-z0-9؀-ۿ]+/).filter(Boolean);
export const list = (v) => (v === undefined || v === null || v === '' ? [] : Array.isArray(v) ? v : String(v).split(',')).map((x) => String(x).trim()).filter(Boolean);
const num = (v) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v));

function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** How well one query word matches a list of words: 0 = no match. */
function wordScore(q, ws) {
  let best = 0;
  for (const w of ws) {
    if (w === q) return 3;
    if (best < 2 && q.length >= 3 && w.startsWith(q)) best = 2;
    else if (best < 1.5 && q.length >= 5 && lev(q, w, q.length >= 8 ? 2 : 1) <= (q.length >= 8 ? 2 : 1)) best = 1.5;
  }
  return best;
}

const cache = new WeakMap();
function prep(r) {
  let p = cache.get(r);
  if (!p) {
    p = { title: words(r.t + ' ' + (r.ta || '')), tags: words((r.tg || []).join(' ')), ing: (r.ig || []).map((i) => i.replace(/_/g, ' ')).flatMap(words), ingRaw: (r.ig || []).map(norm) };
    cache.set(r, p);
  }
  return p;
}

export function relevance(r, qWords) {
  if (!qWords.length) return 0;
  const p = prep(r); let total = 0;
  for (const q of qWords) {
    const t = wordScore(q, p.title); const g = wordScore(q, p.tags) * 0.5; const i = wordScore(q, p.ing) * 0.4;
    const s = Math.max(t, g, i);
    if (!s) return -1;
    total += s + (t ? 1 : 0);
  }
  return total;
}

const stem = (w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const stems = (s) => norm(s).split(/[^a-z0-9]+/).filter(Boolean).map(stem);
/** Whole-word match (so "rice" never matches "licorice"): every word of the term appears among the ingredient's words. */
export const ingMatches = (ref, term) => { const t = stems(term); const have = new Set(stems(ref)); return t.length > 0 && t.every((w) => have.has(w)); };
const hasIng = (r, term) => (r.ig || []).some((i) => ingMatches(i, term));

export const FIELDS = {
  kcal: 'kcal', protein: 'pr', fat: 'fa', carbs: 'ca', fiber: 'fi', sugar: 'su', sodium: 'na', time: 'mn', cost: 'cps', ingredients: 'ni', steps: 'ns', servings: 'sv',
};
const protDensity = (r) => (r.kcal > 0 && r.pr !== undefined ? (r.pr * 4) / r.kcal : undefined);

/** Filters from query-string-like params. Unknown params are ignored; the applied ones are echoed back. */
export function filterRecipes(items, a) {
  const f = {}; const keep = [];
  const cu = list(a.cuisine).map((c) => COUNTRY[norm(c)] || c.toUpperCase());
  const set = (k, v) => { if (v !== undefined && !(Array.isArray(v) && !v.length)) f[k] = v; };
  set('cuisine', cu); set('course', list(a.course).map(norm)); set('tag', list(a.tag).map(norm)); set('method', list(a.method).map(norm)); set('style', list(a.style).map(norm));
  set('operation', list(a.operation).map(norm)); set('equipment', list(a.equipment).map(norm)); set('diet', list(a.diet).map(norm)); set('allergen_free', list(a.allergen_free).map(norm));
  set('ingredient', list(a.ingredient)); set('exclude_ingredient', list(a.exclude_ingredient)); set('level', list(a.level).map((x) => x.toUpperCase())); set('difficulty', list(a.difficulty).map(norm));
  set('collection', list(a.collection).map(norm)); set('cost_tier', list(a.cost_tier).map(norm));
  for (const [name] of Object.entries(FIELDS)) { set(name + '_min', num(a[name + '_min'])); set(name + '_max', num(a[name + '_max'])); }
  set('protein_density_min', num(a.protein_density_min));
  if (a.has_image !== undefined && a.has_image !== '') f.has_image = a.has_image === true || a.has_image === 'true';
  const qWords = words(a.q || '');
  const stext = list(a.exclude_text).map(norm);
  for (const r of items) {
    if (f.cuisine && !r.cu.some((c) => f.cuisine.includes(c))) continue;
    if (f.course && !f.course.includes(norm(r.co))) continue;
    if (f.tag && !f.tag.every((t) => (r.tg || []).some((x) => norm(x) === t))) continue;
    if (f.method && !f.method.some((m) => (r.me || []).includes(m))) continue;
    if (f.style && !f.style.includes(r.st)) continue;
    if (f.operation && !f.operation.every((o) => (r.op || []).includes(o))) continue;
    if (f.equipment && !f.equipment.every((e) => (r.eq || []).some((x) => x.includes(e)))) continue;
    if (f.diet && !f.diet.every((d) => (r.di || []).includes(d))) continue;
    if (f.allergen_free && f.allergen_free.some((x) => (r.al || []).includes(x))) continue;
    if (f.ingredient && !f.ingredient.every((i) => hasIng(r, i))) continue;
    if (f.exclude_ingredient && f.exclude_ingredient.some((i) => hasIng(r, i))) continue;
    if (f.level && !f.level.includes(r.lv)) continue;
    if (f.difficulty && !f.difficulty.includes(r.df)) continue;
    if (f.collection && !f.collection.includes(norm(r.k))) continue;
    if (f.cost_tier && !f.cost_tier.includes(r.ct)) continue;
    if (f.has_image !== undefined && !!r.img !== f.has_image) continue;
    if (stext.length && stext.some((x) => norm(r.t).includes(x))) continue;
    let bad = false;
    for (const [name, key] of Object.entries(FIELDS)) {
      const lo = f[name + '_min']; const hi = f[name + '_max']; const v = r[key];
      if ((lo !== undefined || hi !== undefined) && v === undefined) { bad = true; break; } // unknown value never passes a numeric filter
      if (lo !== undefined && v < lo) { bad = true; break; }
      if (hi !== undefined && v > hi) { bad = true; break; }
    }
    if (bad) continue;
    if (f.protein_density_min !== undefined && !(protDensity(r) >= f.protein_density_min)) continue;
    let score = 0;
    if (qWords.length) { score = relevance(r, qWords); if (score < 0) continue; }
    keep.push({ r, score });
  }
  if (qWords.length) f.q = a.q;
  return { matches: keep, applied: f };
}

const SORTS = {
  kcal: (r) => r.kcal, protein: (r) => r.pr, fat: (r) => r.fa, carbs: (r) => r.ca, fiber: (r) => r.fi, sugar: (r) => r.su, sodium: (r) => r.na,
  cost: (r) => r.cps, time: (r) => r.mn, ingredients: (r) => r.ni, steps: (r) => r.ns, protein_density: protDensity, name: (r) => norm(r.t),
};

export function sortRecipes(matches, sort, seed) {
  const s = String(sort || '');
  if (!s || s === 'relevance') return matches.sort((x, y) => y.score - x.score || x.r.ni - y.r.ni || (x.r.t < y.r.t ? -1 : 1));
  if (s === 'random') {
    let h = seed ? [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) : (Math.random() * 2 ** 31) >>> 0;
    const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 2 ** 32; };
    return matches.map((m) => [rnd(), m]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  }
  const desc = s.startsWith('-'); const key = SORTS[desc ? s.slice(1) : s];
  if (!key) return matches;
  return matches.sort((x, y) => {
    const a = key(x.r); const b = key(y.r);
    if (a === undefined && b === undefined) return 0;
    if (a === undefined) return 1; if (b === undefined) return -1; // unknown values always last
    return (a < b ? -1 : a > b ? 1 : 0) * (desc ? -1 : 1) || (x.r.t < y.r.t ? -1 : 1);
  });
}

const r1 = (v) => (v === undefined ? undefined : Math.round(v * 10) / 10);

/** The row the API returns for a recipe. */
export function row(r, detail = 'brief') {
  const o = {
    id: r.id, title: r.t, title_ar: r.ta, cuisine: r.cu, course: r.co, difficulty: r.df, level: r.lv, servings: r.sv, time_min: r.mn,
    kcal_per_serving: r.kcal, protein_g: r.pr, fat_g: r.fa, carbs_g: r.ca, cost_per_serving: r.cps, cost_tier: r.ct, style: r.st, methods: r.me,
    diet_inferred: r.di, allergens: r.al, n_ingredients: r.ni, n_steps: r.ns, page: `https://cookwala.ai/recipes/${r.id}/`,
  };
  if (detail === 'full') Object.assign(o, { fiber_g: r.fi, sugar_g: r.su, sodium_mg: r.na, ingredients: r.ig, operations: r.op, equipment: r.eq, may_contain: r.am, collection: r.k, tags: r.tg, cost_total: r.cost, cost_buckets: r.cb, currency: r.cur, protein_density: r1(protDensity(r)) });
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && !(Array.isArray(v) && !v.length)));
}

export function search(items, a) {
  const { matches, applied } = filterRecipes(items, a);
  const sort = a.sort || (a.q ? 'relevance' : 'name');
  sortRecipes(matches, sort, a.seed);
  const limit = Math.min(Math.max(num(a.limit) ?? 10, 1), 25); const offset = Math.max(num(a.offset) ?? 0, 0);
  return { total: matches.length, limit, offset, sort, applied_filters: applied, items: matches.slice(offset, offset + limit).map((m) => row(m.r, a.detail === 'full' ? 'full' : 'brief')) };
}

/** "What can I cook with what I have": rank by share of (non-staple) ingredients covered. */
export function pantry(items, staples, a) {
  const have = list(a.have).map(norm); const stap = new Set(staples);
  const maxMissing = num(a.max_missing) ?? 3; const minHave = num(a.min_have) ?? 1;
  const { matches, applied } = filterRecipes(items, { ...a, have: undefined });
  const out = [];
  for (const { r } of matches) {
    const need = (r.ig || []).filter((i) => !stap.has(i));
    if (!need.length) continue;
    const covered = need.filter((i) => have.some((h) => ingMatches(i, h) || ingMatches(h, i)));
    const missing = need.filter((i) => !covered.includes(i));
    if (covered.length < minHave || missing.length > maxMissing) continue;
    out.push({ ...row(r), have_count: covered.length, missing_count: missing.length, missing: missing.map((m) => m.replace(/_/g, ' ')), coverage: r1(covered.length / need.length) });
  }
  out.sort((x, y) => x.missing_count - y.missing_count || y.have_count - x.have_count || (x.title < y.title ? -1 : 1));
  const limit = Math.min(Math.max(num(a.limit) ?? 10, 1), 25);
  return { total: out.length, applied_filters: applied, have, max_missing: maxMissing, note: 'Staples such as salt, water, oil, sugar and pepper are not counted as missing.', items: out.slice(0, limit) };
}

export function similar(items, staples, id, limit = 8) {
  const base = items.find((r) => r.id === id); if (!base) return null;
  const stap = new Set(staples); const set = (r) => new Set((r.ig || []).filter((i) => !stap.has(i)));
  const b = set(base); const out = [];
  for (const r of items) {
    if (r.id === id) continue;
    const s = set(r); let inter = 0; for (const x of s) if (b.has(x)) inter++;
    const union = b.size + s.size - inter; let score = union ? inter / union : 0;
    if (r.co === base.co) score += 0.1; if (r.cu.some((c) => base.cu.includes(c))) score += 0.05;
    const mi = (r.me || []).filter((m) => (base.me || []).includes(m)).length; score += 0.05 * mi;
    if (score > 0.12) out.push({ score, r });
  }
  out.sort((x, y) => y.score - x.score);
  return { of: row(base), items: out.slice(0, Math.min(limit, 25)).map((x) => ({ ...row(x.r), similarity: r1(x.score) })) };
}

export function compare(items, ids) {
  const picked = ids.map((id) => items.find((r) => r.id === id)).filter(Boolean);
  const keys = ['kcal_per_serving', 'protein_g', 'fat_g', 'carbs_g', 'cost_per_serving', 'time_min', 'n_ingredients', 'n_steps'];
  const rows = picked.map((r) => row(r, 'full'));
  const best = {};
  for (const k of keys) {
    const vals = rows.filter((x) => x[k] !== undefined);
    if (vals.length > 1) best[k] = { lowest: vals.reduce((a, b) => (b[k] < a[k] ? b : a)).id, highest: vals.reduce((a, b) => (b[k] > a[k] ? b : a)).id };
  }
  return { missing: ids.filter((id) => !picked.some((r) => r.id === id)), items: rows, best };
}

export function ingredientProfile(items, staples, name) {
  const hits = items.filter((r) => hasIng(r, name)); if (!hits.length) return { name, count: 0 };
  const stap = new Set(staples); const co = new Map(); const cu = new Map(); const course = new Map(); let kc = 0, kn = 0;
  for (const r of hits) {
    for (const i of r.ig || []) if (!stap.has(i) && !ingMatches(i, name)) co.set(i, (co.get(i) || 0) + 1);
    for (const c of r.cu) cu.set(c, (cu.get(c) || 0) + 1); course.set(r.co, (course.get(r.co) || 0) + 1);
    if (r.kcal !== undefined) { kc += r.kcal; kn++; }
  }
  const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
  return { name, count: hits.length, avg_kcal_per_serving: kn ? Math.round(kc / kn) : undefined, cuisines: Object.fromEntries(top(cu, 8)), courses: Object.fromEntries(top(course, 8)),
    often_with: top(co, 15).map(([i, n]) => ({ ingredient: i.replace(/_/g, ' '), recipes: n })), examples: hits.slice(0, 5).map((r) => row(r)) };
}

const AGG = { cuisine: (r) => r.cu, course: (r) => [r.co], method: (r) => r.me || [], style: (r) => [r.st], difficulty: (r) => [r.df || 'unknown'], collection: (r) => [r.k], tag: (r) => r.tg || [], level: (r) => [r.lv], cost_tier: (r) => [r.ct || 'unknown'], diet: (r) => r.di || [], allergen: (r) => r.al || [] };
export function aggregate(items, a) {
  const by = AGG[a.group_by]; if (!by) return { error: 'bad_group_by', allowed: Object.keys(AGG) };
  const metric = FIELDS[a.metric] ? a.metric : 'kcal'; const key = FIELDS[metric] || 'kcal';
  const { matches, applied } = filterRecipes(items, a);
  const g = new Map();
  for (const { r } of matches) for (const k of by(r)) {
    const e = g.get(k) || { group: k, recipes: 0, n: 0, sum: 0, min: Infinity, max: -Infinity };
    e.recipes++; const v = r[key]; if (v !== undefined) { e.n++; e.sum += v; e.min = Math.min(e.min, v); e.max = Math.max(e.max, v); }
    g.set(k, e);
  }
  const rows = [...g.values()].map((e) => ({ group: e.group, recipes: e.recipes, with_data: e.n, avg: e.n ? r1(e.sum / e.n) : undefined, min: e.n ? e.min : undefined, max: e.n ? e.max : undefined }));
  rows.sort((x, y) => (a.order === 'asc' ? (x.avg ?? Infinity) - (y.avg ?? Infinity) : a.order === 'desc' ? (y.avg ?? -Infinity) - (x.avg ?? -Infinity) : y.recipes - x.recipes));
  return { group_by: a.group_by, metric, applied_filters: applied, groups: rows.slice(0, Math.min(num(a.limit) ?? 30, 60)) };
}

/** A simple day plan within a calorie target. Estimates only. */
export function mealPlan(items, a) {
  const target = num(a.kcal) ?? 2000; const meals = Math.min(Math.max(num(a.meals) ?? 3, 1), 5);
  const share = meals === 1 ? [1] : meals === 2 ? [0.45, 0.55] : meals === 3 ? [0.25, 0.4, 0.35] : meals === 4 ? [0.2, 0.3, 0.3, 0.2] : [0.15, 0.2, 0.3, 0.1, 0.25];
  const { matches } = filterRecipes(items.filter((r) => r.kcal !== undefined && r.sv), { ...a, kcal: undefined });
  const pool = sortRecipes(matches, 'random', a.seed || 'plan').map((m) => m.r);
  const used = new Set(); const plan = []; let total = 0;
  const names = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  share.forEach((s, i) => {
    const want = target * s; let best = null; let bd = Infinity;
    for (const r of pool) {
      if (used.has(r.id)) continue;
      const d = Math.abs(r.kcal - want); if (d < bd) { bd = d; best = r; if (d < want * 0.05) break; }
    }
    if (best) { used.add(best.id); total += best.kcal; plan.push({ meal: meals === 3 ? names[i] : `meal ${i + 1}`, target_kcal: Math.round(want), ...row(best) }); }
  });
  return { target_kcal: target, planned_kcal: Math.round(total), items: plan, note: 'One serving of each dish. Nutrition values are modelled estimates, not measured; this is not dietary or medical advice.', applied_filters: Object.fromEntries(Object.entries(a).filter(([k]) => !['kcal', 'meals', 'seed'].includes(k))) };
}

/** Scale and merge ingredient lines from full recipe documents. */
export function shoppingList(docs, servingsMap = {}) {
  const lines = new Map(); const loose = [];
  for (const d of docs) {
    const base = d.yield && d.yield.servings; const want = servingsMap[d.id] || servingsMap['*']; const k = base && want ? want / base : 1;
    for (const i of d.ingredients || []) {
      const q = i.qty;
      if (q && typeof q.value === 'number' && q.unit) {
        const key = `${i.ref}|${q.unit}`; const e = lines.get(key) || { ingredient: i.ref.replace(/_/g, ' '), unit: q.unit, quantity: 0, recipes: [] };
        e.quantity = r1(e.quantity + q.value * k) ?? 0; if (!e.recipes.includes(d.id)) e.recipes.push(d.id); lines.set(key, e);
      } else loose.push({ ingredient: i.ref.replace(/_/g, ' '), as_written: i.display && (i.display.en || Object.values(i.display)[0]), recipe: d.id });
    }
  }
  return { items: [...lines.values()].sort((a, b) => (a.ingredient < b.ingredient ? -1 : 1)), no_quantity: loose, note: 'Quantities are parsed from the source text where possible; check amounts marked as written.' };
}

export function scaleIngredients(doc, servings) {
  const base = doc.yield && doc.yield.servings; const k = base && servings ? servings / base : 1;
  return (doc.ingredients || []).map((i) => ({ ingredient: i.ref.replace(/_/g, ' '), id: i.ingredientId, quantity: i.qty && typeof i.qty.value === 'number' ? r1(i.qty.value * k) : undefined, unit: i.qty && i.qty.unit, as_written: i.display && (i.display.en || Object.values(i.display)[0]) }));
}
