// The fifi.cooking bridge: shape a live fifi.cooking recipe file under the same rights rules the exporter
// (tools/export_fifi.py + tools/export_fifi.collections.json) applies. Pure.
// Collections with text "full" may show steps and notes; every other collection, and any id whose collection
// is not listed, shows structured facts only. The standard form of a recipe is the Cookwala document.
export const FIFI_ORIGIN = 'https://fifi.cooking';
export const FIFI_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

export function collectionOf(id, config) {
  for (const c of (config && config.collections) || []) if (c.export !== false && c.prefixes.some((p) => id.startsWith(p))) return c;
  return null;
}

export function shapeFifi(file, config, catalogEntry = null) {
  const r = (file && file.recipe) || {};
  const col = collectionOf(r.id || '', config);
  const full = !!col && col.text === 'full';
  const out = {
    id: r.id, title: r.title, titleEn: r.titleEn, chapter: r.chapter, category: r.category, cookingMethod: r.cookingMethod,
    prepTime: r.prepTime, cookTime: r.cookTime, servings: r.servings, difficulty: r.difficulty,
    ingredients: (r.masterIngredients || []).map((i) => ({ id: i.id, name: i.name, nameEn: i.nameEn, standardAmount: i.standardAmount, category: i.category })),
    estimate: file && file.estimate,
    credit: col ? { collection: col.id, source: col.sourceName, citation: col.citation, license: col.license } : { collection: null, license: 'unknown' },
    textPolicy: full ? 'full' : 'facts',
    inCatalog: !!catalogEntry, catalog: catalogEntry ? { hash: catalogEntry.hash, level: catalogEntry.level } : undefined,
    standardIsCookwala: 'This is raw fifi.cooking data in its legacy format. Use get_recipe for the Cookwala standard form; recipes missing from the catalog are exported by tools/export_fifi.py in the cookwala repository.',
    pageUrl: `${FIFI_ORIGIN}/recipe/${r.id}/`, dataUrl: `${FIFI_ORIGIN}/data/recipes/${r.id}.json`,
  };
  if (full) {
    out.steps = (r.uniqueInstructions || []).map((s) => ({ step: s.stepNumber, phase: s.phase, text: s.text }));
    out.culturalNotes = r.culturalNotes;
  } else {
    out.withheld = 'Step text is withheld for this collection until rights are confirmed in writing, matching the Cookwala catalog (text: facts).';
  }
  return out;
}

/** Search the fifi.cooking /data/search/<lang>.json map (id -> normalised text). All words must appear. */
export function searchFifiMap(map, query, limit = 10, offset = 0) {
  const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
  const hits = [];
  for (const [id, text] of Object.entries(map)) if (words.every((w) => text.includes(w))) hits.push(id);
  const lim = Math.min(Math.max(limit, 1), 50);
  return { total: hits.length, ids: hits.slice(offset, offset + lim), ...(offset + lim < hits.length ? { nextOffset: offset + lim } : {}) };
}
