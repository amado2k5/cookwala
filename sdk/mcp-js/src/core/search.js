// Search over index entries (the shards published at /v1/index/<lang>/<n>.json). Pure.
const MARKS = /[̀-ͯؐ-ًؚ-ٰٟۖ-ۭ]/g;

export function normalize(s) {
  return String(s ?? '').normalize('NFKD').replace(MARKS, '').toLowerCase()
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/**
 * entries: index entries for the requested language; alt: optional Map id -> alternate title (English)
 * so that an English query finds a recipe while browsing in Arabic, and the reverse.
 */
export function searchRecipes(entries, args = {}, alt = new Map()) {
  const words = normalize(args.query || '').split(' ').filter(Boolean);
  const allergenFree = new Set((args.allergen_free || []).map((a) => a.toLowerCase()));
  const tags = (args.tags || []).map(normalize);
  const cuisines = (args.cuisine || []).map((c) => c.toUpperCase());
  const out = [];
  for (const e of entries) {
    if (args.level && e.level !== args.level) continue;
    if (args.course && e.course !== args.course) continue;
    if (args.supervision && e.supervision !== args.supervision) continue;
    if (args.collection && e['x-collection'] !== args.collection) continue;
    if (cuisines.length && !cuisines.some((c) => (e.cuisine || []).includes(c))) continue;
    if (allergenFree.size && (e.allergens || []).some((a) => allergenFree.has(a.toLowerCase()))) continue;
    const etags = (e.tags || []).map(normalize);
    if (tags.length && !tags.every((t) => etags.some((x) => x.includes(t)))) continue;
    if (words.length) {
      const hay = normalize([e.id, e.title, alt.get(e.id), ...(e.tags || []), ...(e.cuisine || []), e.course, e['x-collection']].filter(Boolean).join(' '));
      if (!words.every((w) => hay.includes(w))) continue;
    }
    out.push(e);
  }
  // rank: title starts with the query, then title contains it, then the rest; V1 before V0
  const q = normalize(args.query || '');
  const rank = (e) => {
    const t = normalize(e.title);
    return (q && t === q ? 0 : q && t.startsWith(q) ? 1 : q && t.includes(q) ? 2 : 3) * 2 + (e.level === 'V0' ? 1 : 0);
  };
  out.sort((a, b) => rank(a) - rank(b));
  const total = out.length;
  const limit = Math.min(Math.max(args.limit ?? 10, 1), 50);
  const offset = Math.max(args.offset ?? 0, 0);
  const items = out.slice(offset, offset + limit).map((e) => ({
    id: e.id, title: e.title, cuisine: e.cuisine, course: e.course, level: e.level, servings: e.servings,
    allergens: e.allergens, supervision: e.supervision, collection: e['x-collection'], license: e['x-license'], hash: e.hash,
  }));
  return { total, items, ...(offset + limit < total ? { nextOffset: offset + limit } : {}) };
}
