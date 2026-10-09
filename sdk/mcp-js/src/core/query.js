// Pure query engine over the compact query index (/v1/query/recipes.json, built by tools/build_query_index.py).
// No I/O. Used by the REST API (src/api.js). Everything here is read-only.

const COUNTRY_NAMES = {"EG": ["egypt", "egyptian"], "MX": ["mexico", "mexican"], "JP": ["japan", "japanese"], "MA": ["morocco", "moroccan"], "CN": ["china", "chinese"], "FR": ["france", "french"], "VN": ["vietnam", "vietnamese"], "IN": ["india", "indian"], "ID": ["indonesia", "indonesian"], "KR": ["korea", "south korea", "korean"], "IR": ["iran", "iranian", "persian"], "IT": ["italy", "italian"], "ES": ["spain", "spanish"], "GR": ["greece", "greek"], "ET": ["ethiopia", "ethiopian"], "DZ": ["algeria", "algerian"], "LY": ["libya", "libyan"], "TN": ["tunisia", "tunisian"], "LB": ["lebanon", "lebanese"], "SY": ["syria", "syrian"], "JO": ["jordan", "jordanian"], "PS": ["palestine", "palestinian"], "IQ": ["iraq", "iraqi"], "SA": ["saudi arabia", "saudi"], "TR": ["turkey", "turkish"], "CY": ["cyprus", "cypriot"], "SD": ["sudan", "sudanese"], "YE": ["yemen", "yemeni"], "US": ["usa", "united states", "american"], "GB": ["uk", "united kingdom", "british", "england", "english"], "DE": ["germany", "german"], "TH": ["thailand", "thai"], "PT": ["portugal", "portuguese"], "BR": ["brazil", "brazilian"], "PE": ["peru", "peruvian"]};
export const COUNTRY = Object.fromEntries(Object.entries(COUNTRY_NAMES).flatMap(([c, ns]) => ns.map((n) => [n, c])));
export const COUNTRY_LABEL = Object.fromEntries(Object.entries(COUNTRY_NAMES).map(([c, ns]) => [c, ns[0].replace(/\b\w/g, (m) => m.toUpperCase())]));

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
    p = { title: words(r.t + ' ' + (r.ta || '') + ' ' + (r.tl || '')), tags: words((r.tg || []).join(' ')), ing: (r.ig || []).map((i) => i.replace(/_/g, ' ')).flatMap(words), ingRaw: (r.ig || []).map(norm) };
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
/** A category is a book category (tag) such as "Eastern Desserts" or a course such as "dessert"; words match, plural or not. */
const catMatch = (r, c) => { const w = stems(c); if (!w.length) return false; return [r.co, ...(r.tg || [])].some((t) => { const ts = new Set(stems(t)); return w.every((x) => ts.has(x)); }); };
const hasIng = (r, term) => (r.ig || []).some((i) => ingMatches(i, term));

/** Allergens in one recipe: the declared list plus anything the ingredient names reveal. "none_found" needs both to be empty. */
export function allergenInfo(r) {
  const declared = [...new Set(r.al || [])]; const found = [...new Set(r.ax || [])]; const contains = [...new Set([...declared, ...found])].sort();
  // r.as: the status fifi.cooking published (none_found, check_labels, not_assessed); without it, none_found needs both screens empty
  const status = contains.length ? 'contains' : (r.as && r.as !== 'contains' ? r.as : 'none_found');
  const note = status === 'contains' ? 'Allergens come from the recipe\'s analysis of its ingredients and steps; they may be incomplete.'
    : status === 'check_labels' ? 'No allergen was named, but a bought or compound item (stock, sauce, spice mix...) may hide one: check the labels.'
    : status === 'not_assessed' ? 'This recipe has not been assessed for allergens yet.'
    : 'No allergen was found in the ingredients or steps. This is not a guarantee: allergen data is incomplete for some recipes, so check the ingredient list and the packaged items you use.';
  return { status, contains, may_contain: r.am && r.am.length ? r.am : undefined, declared, also_found_in_ingredient_names: found.length ? found : undefined, source: r.as ? 'fifi.cooking analysis' : 'declared list plus ingredient-name check', note };
}
export const DIABETIC_RULE = { friendly: 'sugar 5 g or less and carbohydrate 30 g or less per serving, carbohydrate at most 40% of the energy, 12 servings or fewer', not_friendly: 'sugar over 15 g or carbohydrate over 60 g per serving', otherwise: 'borderline' };
/** An estimate from modelled per-serving nutrition, or a published diabetic_friendly claim. Never a medical statement. */
export function diabeticInfo(r) {
  const note = 'Estimate from modelled nutrition per serving, not medical advice. Portion size, how a body responds, and medication vary: people with diabetes should check with their clinician or dietitian.';
  if (r.dk && (r.dc || []).includes('diabetic_friendly') && !(r.dx || []).includes('diabetic_friendly')) return { status: 'friendly', basis: 'published', reasons: ['The recipe carries a diabetic_friendly claim.'], per_serving: { carbs_g: r.ca, sugar_g: r.su, fiber_g: r.fi, kcal: r.kcal }, rule: DIABETIC_RULE, note };
  if (r.dsx && r.dsx !== 'unknown') return { status: r.dsx, basis: 'fifi.cooking estimate', reasons: ['The status comes from fifi.cooking\'s estimate of the recipe (see rule).'], per_serving: { carbs_g: r.ca, sugar_g: r.su, fiber_g: r.fi, kcal: r.kcal }, rule: DIABETIC_RULE, note };
  if (r.ca === undefined || r.su === undefined) return { status: 'unknown', basis: 'no_nutrition_data', reasons: ['No carbohydrate and sugar estimate for this recipe.'], note };
  const per = { carbs_g: r.ca, sugar_g: r.su, fiber_g: r.fi, kcal: r.kcal };
  let status = 'borderline'; let why;
  if (r.su > 15 || r.ca > 60) { status = 'not_friendly'; why = `${r.su > 15 ? `sugar ${r.su} g is over 15 g` : `carbohydrate ${r.ca} g is over 60 g`} per serving`; }
  else if (r.su <= 5 && r.ca <= 30 && r.kcal > 0 && (r.ca * 4) / r.kcal <= 0.4 && r.sv > 0 && r.sv <= 12) { status = 'friendly'; why = `sugar ${r.su} g and carbohydrate ${r.ca} g per serving are within the limits`; }
  else why = `sugar ${r.su} g and carbohydrate ${r.ca} g per serving sit between the limits`;
  return { status, basis: 'nutrition_estimate', reasons: [why], per_serving: per, rule: DIABETIC_RULE, note };
}
export const DIET_INFO = {
  vegetarian: { label: 'Vegetarian', basis: 'published, else inferred', definition: 'Reviewed claim where the recipe has one, otherwise an ingredient screen: no meat, poultry, fish, seafood, gelatin, animal rennet or meat stock found in the ingredient names or title. Dairy, eggs and honey allowed.' },
  vegan: { label: 'Vegan', basis: 'inferred', definition: 'Vegetarian and no dairy, eggs or honey found in the ingredient names.' },
  pescatarian: { label: 'Pescatarian', basis: 'inferred', definition: 'No meat or poultry found; fish and seafood allowed.' },
  halal_ingredients: { label: 'Halal by ingredients (reviewed claim, NOT certified halal)', basis: 'published', definition: 'The recipe carries a reviewed halal claim (rule set fifi-diet-1): no pork, alcohol or other hidden non-halal ingredient found. Recipes without the claim were withheld on doubt or not assessed, so they are not listed. It cannot show that meat is halal-slaughtered or that utensils are clean: meat and poultry still need halal-certified sources.', caveat: 'Never present this as halal certification.' },
  pork_free: { label: 'Pork-free', basis: 'inferred', definition: 'No pork, bacon, ham, lard or similar found.' },
  alcohol_free: { label: 'Alcohol-free', basis: 'inferred', definition: 'No wine, beer, spirits, liqueur, mirin or sake found (wine vinegar counts as alcohol here, to be cautious).' },
  kosher_meat: { label: 'Kosher-style, meat (NOT certified kosher)', basis: 'inferred', definition: 'Reviewed kosher claim of type meat (rule set fifi-diet-1): ingredients kosher-compatible, contains meat or poultry. Recipes without the claim are not listed. Needs kosher-slaughtered meat and supervision.', caveat: 'Never present this as kosher certification.' },
  kosher_dairy: { label: 'Kosher-style, dairy (NOT certified kosher)', basis: 'inferred', definition: 'Reviewed kosher claim of type dairy: ingredients kosher-compatible, contains dairy and no meat. Cheese and processed items may need a hechsher.', caveat: 'Never present this as kosher certification.' },
  kosher_pareve: { label: 'Kosher-style, pareve (NOT certified kosher)', basis: 'inferred', definition: 'Reviewed kosher claim of type pareve: ingredients kosher-compatible, neither meat nor dairy. Processed items may need a hechsher.', caveat: 'Never present this as kosher certification.' },
  kosher_any: { label: 'Kosher-style, any type (NOT certified kosher)', basis: 'inferred', definition: 'Any recipe with a reviewed kosher claim (meat, dairy or pareve).', caveat: 'Never present this as kosher certification.' },
  gluten_free: { label: 'Gluten-free (screen, not a guarantee)', basis: 'published status, else declared allergens plus ingredient names', definition: 'fifi.cooking\'s gluten status is free: no wheat, barley, rye, oats, flour, bread, pasta, semolina, couscous or similar found in the ingredients or steps, and nothing bought or compound that could hide gluten. Recipes without a status use the allergen and ingredient-name screen. Cross-contact is not assessed.', caveat: 'Not suitable as coeliac advice; check labels.' },
  nut_free: { label: 'Nut-free (inferred)', basis: 'declared allergens plus ingredient names', definition: 'No declared nut or peanut allergen and no nuts found in the ingredient names. Seeds such as sesame are separate.', caveat: 'Check labels; allergen data is incomplete for some recipes.' },
  shellfish_free: { label: 'Shellfish-free (inferred)', basis: 'declared allergens plus ingredient names', definition: 'No crustaceans or molluscs found.' },
  no_allergens: { label: 'No allergens found (not a guarantee)', basis: 'declared allergens plus ingredient names', definition: 'The recipe was reviewed and no major allergen (milk, eggs, gluten, nuts, peanuts, sesame, soy, fish, shellfish, celery, mustard, lupin, sulphites) was found in its ingredients or steps, and no bought or compound item could hide one. Recipes needing label checks are not listed.', caveat: 'Not a guarantee: always read labels and ask about cross-contact.' },
  diabetic_friendly: { label: 'Diabetic-friendly (estimate, not medical advice)', basis: 'published claim, else modelled nutrition', definition: 'A diabetic_friendly claim, or per serving sugar 5 g or less, carbohydrate 30 g or less, carbohydrate at most 40% of the energy and 12 servings or fewer in the modelled nutrition estimate. Recipes over 15 g sugar or 60 g carbohydrate are not_friendly; the rest are borderline; recipes with no nutrition are unknown.', caveat: 'Modelled estimate, not medical advice; individual response and portions vary. Check with a clinician or dietitian.' },
  dairy_free: { label: 'Dairy-free', basis: 'inferred', definition: 'No milk, butter, ghee, cheese, yogurt or cream found.' },
  lactose_free: { label: 'Lactose-free (no milk found; not a guarantee)', basis: 'published status, else inferred', definition: 'fifi.cooking\'s lactose status is free: no milk product in the ingredients or steps and nothing bought or compound that could hide one. Butter, ghee and hard aged cheese give low_or_possible, not free. Recipes without a status use the dairy screen.', caveat: 'Not medical advice; people with lactose intolerance or a milk allergy should read labels.' },
  egg_free: { label: 'Egg-free', basis: 'inferred', definition: 'No eggs or mayonnaise found.' },
};
const DIET_ALIASES = { 'lactose free': 'lactose_free', 'lactose-free': 'lactose_free', 'no lactose': 'lactose_free', 'no allergens': 'no_allergens', 'allergen free': 'no_allergens', 'allergen-free': 'no_allergens', allergen_free: 'no_allergens', 'allergy safe': 'no_allergens', 'free from allergens': 'no_allergens', diabetic: 'diabetic_friendly', 'diabetic friendly': 'diabetic_friendly', 'diabetic-friendly': 'diabetic_friendly', diabetes: 'diabetic_friendly', 'safe for diabetics': 'diabetic_friendly', 'low sugar': 'diabetic_friendly', halal: 'halal_ingredients', 'halal friendly': 'halal_ingredients', 'halal-friendly': 'halal_ingredients', halal_friendly: 'halal_ingredients', kosher: 'kosher_any', kosher_style: 'kosher_any', 'kosher meat': 'kosher_meat', 'kosher dairy': 'kosher_dairy', pareve: 'kosher_pareve', parve: 'kosher_pareve', 'kosher pareve': 'kosher_pareve', veg: 'vegetarian', veggie: 'vegetarian', 'gluten free': 'gluten_free', 'gluten-free': 'gluten_free', coeliac: 'gluten_free', celiac: 'gluten_free', 'nut free': 'nut_free', 'nut-free': 'nut_free', 'dairy free': 'dairy_free', 'egg free': 'egg_free', 'pork free': 'pork_free', 'alcohol free': 'alcohol_free', 'shellfish free': 'shellfish_free', 'no pork': 'pork_free', 'no alcohol': 'alcohol_free' };
export const normDiet = (d) => { const k = norm(d).trim(); const u = k.replace(/\s+/g, '_'); return DIET_INFO[u] ? u : (DIET_ALIASES[k] || DIET_ALIASES[u] || u); };
// published claim (safety.dietary[] in the recipe) that corresponds to an inferred category
const PUBLISHED = { halal_ingredients: 'halal', kosher_any: 'kosher', kosher_meat: 'kosher', kosher_dairy: 'kosher', kosher_pareve: 'kosher', vegetarian: 'vegetarian', vegan: 'vegan', gluten_free: 'gluten_free', dairy_free: 'dairy_free', lactose_free: 'lactose_free', nut_free: 'nut_free' };
const inferredOk = (r, d) => (d === 'kosher_any' ? (r.di || []).some((x) => x.startsWith('kosher_')) : (r.di || []).includes(d));
/** A recipe with a published classification is judged by its published claims; others by the ingredient screen. */
const RELIGIOUS = new Set(['halal_ingredients', 'kosher_any', 'kosher_meat', 'kosher_dairy', 'kosher_pareve']);
export const dietOk = (r, d) => {
  const claim = PUBLISHED[d];
  const held = (c) => (r.dx || []).includes(c); // a claim the recipe's own title or ingredients contradict is held back (see /api/diets/review)
  const has = (c) => (r.dc || []).includes(c) && !held(c);
  if (RELIGIOUS.has(d)) {
    // halal and kosher come only from the reviewed claims: a recipe without one was withheld on doubt, which is not the same as "fine"
    if (!r.dk || !has(claim)) return false;
    if (d === 'kosher_meat' || d === 'kosher_dairy' || d === 'kosher_pareve') return r.dkt ? 'kosher_' + r.dkt === d : inferredOk(r, d); // the kosher type is in the claim's note
    return true;
  }
  if (r.dk && (d === 'vegetarian' || d === 'vegan')) return has(d) || (d === 'vegetarian' && has('vegan')); // a vegan claim implies vegetarian
  // gluten and lactose carry a published status for every fifi.cooking recipe: it is authoritative, so a screen never overrules it
  if (d === 'gluten_free' && r.gx) return r.gx === 'free';
  if (d === 'lactose_free' && r.lx) return r.lx === 'free';
  if (claim && has(claim)) return true; // gluten_free, nut_free, dairy_free: a published claim counts, otherwise the screen decides
  if (d === 'no_allergens') return allergenInfo(r).status === 'none_found';
  if (d === 'diabetic_friendly') return diabeticInfo(r).status === 'friendly';
  return inferredOk(r, d);
};
export const METHOD_ALIASES = {
  bake: 'bake', baking: 'bake', baked: 'bake', oven: 'bake', fry: 'fry', frying: 'fry', fried: 'fry', 'pan-fry': 'fry', 'pan fry': 'fry', 'pan-frying': 'fry', saute: 'fry', sauteing: 'fry',
  deep_fry: 'deep_fry', 'deep-fry': 'deep_fry', 'deep fry': 'deep_fry', 'deep frying': 'deep_fry', 'deep-frying': 'deep_fry', deepfry: 'deep_fry',
  roast: 'roast', roasting: 'roast', roasted: 'roast', grill: 'grill', grilling: 'grill', grilled: 'grill', bbq: 'grill', barbecue: 'grill', broil: 'grill',
  boil: 'boil', boiling: 'boil', boiled: 'boil', poach: 'boil', poaching: 'boil', simmer: 'simmer', simmering: 'simmer', stew: 'simmer', stewing: 'simmer', braise: 'simmer', braising: 'simmer', 'slow cook': 'simmer', 'slow cooking': 'simmer',
  steam: 'steam', steaming: 'steam', steamed: 'steam', toast: 'toast', toasting: 'toast', chill: 'chill', chilling: 'chill', refrigerate: 'chill', freeze: 'freeze', freezing: 'freeze', frozen: 'freeze',
  marinate: 'marinate', marinating: 'marinate', marinade: 'marinate', ferment: 'ferment', fermenting: 'ferment', 'no cook': 'no_cook', 'no-cook': 'no_cook', no_cook: 'no_cook', raw: 'no_cook', 'no heat': 'no_cook',
};
export const METHOD_LABELS = { bake: 'Baking', fry: 'Frying (pan and shallow)', deep_fry: 'Deep frying', roast: 'Roasting', grill: 'Grilling', boil: 'Boiling and poaching', simmer: 'Simmering, stewing and braising', steam: 'Steaming', toast: 'Toasting', chill: 'Chilling', freeze: 'Freezing', marinate: 'Marinating', ferment: 'Fermenting', no_cook: 'No cooking (no heat at all)' };
// book categories (tags) that name the same method, so "baking" also returns recipes the source filed under Baking
const METHOD_TAGS = { bake: ['baking'], fry: ['frying', 'pan-frying'], grill: ['grilling'], boil: ['boiling'], simmer: ['slow simmering', 'slow simmering (tasbeek)'], deep_fry: [], roast: [], steam: [], toast: [], chill: [], freeze: [], marinate: [], ferment: [] };
export const normMethod = (m) => METHOD_ALIASES[norm(m).trim().replace(/_/g, ' ')] || METHOD_ALIASES[norm(m).trim()] || null;
export const methodMatches = (r, m) => (m === 'no_cook' ? r.st === 'no_cook' : (r.me || []).includes(m) || (METHOD_TAGS[m] || []).some((t) => (r.tg || []).some((x) => norm(x) === t)));

export const FIELDS = {
  kcal: 'kcal', protein: 'pr', fat: 'fa', carbs: 'ca', fiber: 'fi', sugar: 'su', sodium: 'na', time: 'mn', active: 'ac', passive: 'pt', total_kcal: 'tk', total_protein: 'tp', cost: 'cps', ingredients: 'ni', steps: 'ns', servings: 'sv',
};
const protDensity = (r) => (r.kcal > 0 && r.pr !== undefined ? (r.pr * 4) / r.kcal : undefined);

/** Filters from query-string-like params. Unknown params are ignored; the applied ones are echoed back. */
const ALIAS = { prep_time_max: 'active_max', prep_time_min: 'active_min', cook_time_max: 'passive_max', cook_time_min: 'passive_min', serves: 'servings_min', serves_max: 'servings_max', total_calories_max: 'total_kcal_max', total_calories_min: 'total_kcal_min' };
export function filterRecipes(items, a0) {
  const a = { ...a0 }; for (const [from, to] of Object.entries(ALIAS)) if (a[from] !== undefined && a[from] !== '' && a[to] === undefined) a[to] = a[from];
  const f = {}; const keep = [];
  if (a.basis !== undefined && a.basis !== '') f.basis = String(a.basis).toLowerCase();
  const cu = [...list(a.cuisine), ...list(a.country)].map((c) => COUNTRY[norm(c)] || c.toUpperCase());
  const set = (k, v) => { if (v !== undefined && !(Array.isArray(v) && !v.length)) f[k] = v; };
  set('cuisine', cu); set('course', list(a.course).map(norm)); set('tag', list(a.tag).map(norm)); const meth = list(a.method).map((m) => normMethod(m) || norm(m)); set('method', meth); set('style', list(a.style).map(norm));
  set('operation', list(a.operation).map(norm)); set('equipment', list(a.equipment).map(norm)); set('diet', (() => { const dl = list(a.diet).map(normDiet); for (const d of ['no_allergens', 'diabetic_friendly']) if ((a[d] === true || a[d] === 'true') && !dl.includes(d)) dl.push(d); return dl; })()); set('allergen_free', list(a.allergen_free).map(norm));
  set('ingredient', list(a.ingredient)); set('ingredient_any', list(a.ingredient_any)); set('category', list(a.category));
  if (a.servings_exact !== undefined && a.servings_exact !== '') f.servings_exact = num(a.servings_exact);
  if (a.kids_age !== undefined && a.kids_age !== '') { const ka = kidsAge(a.kids_age); if (ka) { f.kids_age = ka; f.kids = true; } }
  for (const k of ['has_protein', 'has_nutrition', 'has_video', 'kids', 'has_notes', 'kid_friendly']) if (a[k] !== undefined && a[k] !== '') f[k] = a[k] === true || a[k] === 'true'; set('exclude_ingredient', list(a.exclude_ingredient)); set('level', list(a.level).map((x) => x.toUpperCase())); set('difficulty', list(a.difficulty).map(norm));
  set('collection', list(a.collection).map(norm)); set('site', list(a.site).map(norm)); set('cost_tier', list(a.cost_tier).map(norm));
  for (const [name] of Object.entries(FIELDS)) { set(name + '_min', num(a[name + '_min'])); set(name + '_max', num(a[name + '_max'])); }
  set('protein_density_min', num(a.protein_density_min));
  if (a.has_image !== undefined && a.has_image !== '') f.has_image = a.has_image === true || a.has_image === 'true';
  const qWords = words(a.q || '');
  const stext = list(a.exclude_text).map(norm);
  for (const r of items) {
    if (f.cuisine && !r.cu.some((c) => f.cuisine.includes(c))) continue;
    if (f.course && !f.course.includes(norm(r.co))) continue;
    if (f.tag && !f.tag.every((t) => (r.tg || []).some((x) => norm(x) === t))) continue;
    if (f.method && !f.method.some((m) => methodMatches(r, m))) continue;
    if (f.style && !f.style.includes(r.st)) continue;
    if (f.operation && !f.operation.every((o) => (r.op || []).includes(o))) continue;
    if (f.equipment && !f.equipment.every((e) => (r.eq || []).some((x) => x.includes(e)))) continue;
    if (f.basis === 'published' && f.diet && !r.dk) continue; // strict mode: only recipes classified by their publisher
    if (f.diet && !f.diet.every((d) => dietOk(r, d))) continue;
    if (f.allergen_free && f.allergen_free.some((x) => (r.al || []).includes(x))) continue;
    if (f.ingredient && !f.ingredient.every((i) => hasIng(r, i))) continue;
    if (f.ingredient_any && !f.ingredient_any.some((i) => hasIng(r, i))) continue;
    if (f.category && !f.category.some((c) => catMatch(r, c))) continue;
    if (f.servings_exact !== undefined && r.sv !== f.servings_exact) continue;
    if (f.has_nutrition !== undefined && (r.kcal !== undefined) !== f.has_nutrition) continue;
    if ((f.kids ?? f.kid_friendly) !== undefined && !!r.kd !== (f.kids ?? f.kid_friendly)) continue;
    if (f.kids_age && r.ka !== f.kids_age) continue;
    if (f.has_notes !== undefined && !!r.hn !== f.has_notes) continue;
    if (f.has_video !== undefined && !!r.vid !== f.has_video) continue;
    if (f.has_protein !== undefined && (f.has_protein ? !(r.pr > 0) : r.pr !== 0)) continue;
    if (f.exclude_ingredient && f.exclude_ingredient.some((i) => hasIng(r, i))) continue;
    if (f.level && !f.level.includes(r.lv)) continue;
    if (f.difficulty && !f.difficulty.includes(r.df)) continue;
    if (f.collection && !f.collection.includes(norm(r.k))) continue;
    if (f.site && !f.site.some((x) => norm(r.sn || '') === x)) continue;
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
  cost: (r) => r.cps, time: (r) => r.mn, ingredients: (r) => r.ni, steps: (r) => r.ns, protein_density: protDensity, total_kcal: (r) => r.tk, total_protein: (r) => r.tp, prep_time: (r) => r.ac, cook_time: (r) => r.pt, name: (r) => norm(r.t),
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

/** '3-5', '6 to 8', '9+', or an age in years (7) -> the age band the Cooking with Kids recipes use: '3-5', '6-8' or '9+'. */
export function kidsAge(v) {
  const t = String(v).trim().toLowerCase();
  if (['3-5', '6-8', '9+'].includes(t)) return t;
  const m = t.match(/\d+/g);
  if (!m) return undefined;
  const n = Number(m[0]);
  return n >= 9 ? '9+' : n >= 6 ? '6-8' : n >= 2 ? '3-5' : undefined;
}

/** The row the API returns for a recipe. */
export function row(r, detail = 'brief') {
  const o = {
    id: r.id, title: r.tl || r.t, title_en: r.tl && r.tl !== r.t ? r.t : undefined, title_ar: r.ta, kids_recipe: r.k === 'kids' ? true : undefined, kids_age: r.ka, grown_up_help: r.kh, cuisine: r.cu, course: r.co, difficulty: r.df, level: r.lv, servings: r.sv, time_min: r.mn, prep_min: r.ac, cook_min: r.pt,
    kcal_per_serving: r.kcal, protein_g: r.pr, total_kcal: r.tk, total_protein_g: r.tp, fat_g: r.fa, carbs_g: r.ca, cost_per_serving: r.cps, cost_tier: r.ct, style: r.st, methods: r.me,
    allergen_status: allergenInfo(r).status, gluten_status: r.gx, lactose_status: r.lx, diabetic_friendly: diabeticInfo(r).status, diet_inferred: r.di, diet_basis: r.dk ? 'published' : 'inferred', kosher_type: r.dk && (r.dc || []).includes('kosher') ? r.dkt : undefined, diet_review: r.dx ? { held_back_claims: r.dx, reason: 'The published claim conflicts with the recipe title or ingredient names; excluded from diet results until reviewed.' } : undefined, dietary_claims: r.dk ? (r.dc || []).map((c) => ({ claim: c, basis: (r.dcc || []).includes(c) ? 'certified' : 'ingredients', ruleset: r.drs && r.drs[c], note: r.dcn && r.dcn[c], certification_ids: r.dcr && r.dcr[c] })) : undefined, allergens: r.al, n_ingredients: r.ni, n_steps: r.ns, has_video: r.vid ? true : undefined, kid_friendly_inferred: r.kd ? true : undefined, has_background_notes: r.hn ? true : undefined, page: `https://cookwala.ai/recipes/${r.id}/`,
  };
  if (detail === 'full') Object.assign(o, { fiber_g: r.fi, sugar_g: r.su, sodium_mg: r.na, ingredients: r.ig, operations: r.op, equipment: r.eq, may_contain: r.am, collection: r.k, tags: r.tg, kid_cautions: r.kc, allergen_info: allergenInfo(r), diabetic: diabeticInfo(r), gluten_status: r.gx, lactose_status: r.lx, cost_total: r.cost, cost_buckets: r.cb, currency: r.cur, protein_density: r1(protDensity(r)) });
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && !(Array.isArray(v) && !v.length)));
}

export function search(items, a) {
  const { matches, applied } = filterRecipes(items, a);
  const sort = a.sort || (a.q ? 'relevance' : 'name');
  sortRecipes(matches, sort, a.seed);
  if (applied.kids === true && !a.sort) matches.sort((x, y) => (y.r.k === 'kids') - (x.r.k === 'kids'));  // the Cooking with Kids recipes come before the inferred ones
  const limit = Math.min(Math.max(num(a.limit) ?? 10, 1), 25); const offset = Math.max(num(a.offset) ?? 0, 0);
  const next = offset + limit < matches.length ? offset + limit : undefined;
  return { total: matches.length, limit, offset, next_offset: next, sort, applied_filters: applied, items: matches.slice(offset, offset + limit).map((m) => row(m.r, a.detail === 'full' ? 'full' : 'brief')) };
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

export const LANG_ALIASES = { arabic: 'ar', bengali: 'bn', czech: 'cs', german: 'de', deutsch: 'de', greek: 'el', english: 'en', spanish: 'es', espanol: 'es', persian: 'fa', farsi: 'fa', french: 'fr', francais: 'fr', hebrew: 'he', hindi: 'hi', indonesian: 'id', italian: 'it', japanese: 'ja', korean: 'ko', kurdish: 'ku', kurmanji: 'ku', dutch: 'nl', polish: 'pl', pashto: 'ps', portuguese: 'pt', russian: 'ru', albanian: 'sq', swedish: 'sv', swahili: 'sw', telugu: 'te', turkish: 'tr', urdu: 'ur', vietnamese: 'vi', chinese: 'zh', mandarin: 'zh' };

/** "ar", "AR", "ar-EG", "zh_CN", "Arabic" -> "ar"; null when it is none of those. */
export function normLang(v) {
  if (!v) return 'en';
  const s = norm(String(v)).trim();
  if (LANG_ALIASES[s]) return LANG_ALIASES[s];
  const m = /^([a-z]{2,3})(?:[-_][a-z0-9]+)*$/.exec(s);
  return m ? m[1] : null;
}

const localized = new WeakMap();
/** A copy of the index with titles in another language (cached per language). */
export function localizeItems(items, lang, names) {
  let per = localized.get(items); if (!per) { per = new Map(); localized.set(items, per); }
  if (!per.has(lang)) per.set(lang, items.map((r) => (names[r.id] && names[r.id] !== r.t ? { ...r, tl: names[r.id] } : r)));
  return per.get(lang);
}

/** Every method with how many recipes use it. */
export function methodCounts(items) {
  return Object.keys(METHOD_LABELS).map((m) => ({ method: m, label: METHOD_LABELS[m], recipes: items.filter((r) => methodMatches(r, m)).length,
    also_called: Object.entries(METHOD_ALIASES).filter(([k, v]) => v === m && k !== m && !k.includes('_')).map(([k]) => k).slice(0, 6) }));
}

/** Which collections (and, for the world collection, which source sites) does a name like "fatma haty" mean? */
export function resolveSource(sources, q) {
  const want = stems(q).filter((w) => !['the', 'by', 'from', 'of', 'and', 'recipe', 'recipes', 'channel', 'book'].includes(w)); if (!want.length) return { ids: [], sites: [] };
  const hit = (words, w) => words.some((x) => x === w || (w.length >= 4 && x.length >= 4 && lev(w, x, 1) <= 1));
  const ids = []; const sites = [];
  for (const [id, s] of Object.entries(sources || {})) {
    const idWords = stems(id);
    const words = [...idWords, ...stems(s.name || ''), ...(s.aliases || []).flatMap(stems)];
    if (want.every((w) => hit(words, w))) ids.push(id);
    else for (const site of Object.keys(s.sites || {})) { if (want.every((w) => hit(stems(site), w))) sites.push(site); }
  }
  // a name that matches a collection exactly beats looser matches ("fatma haty" must not pull in other Fatmas)
  const exact = ids.filter((id) => { const s = sources[id]; return [s.name, ...(s.aliases || []), id].some((n) => norm(n) === norm(q)); });
  return { ids: exact.length ? exact : ids, sites };
}

/** Ingredient names with how many recipes use them: for "what ingredients do you know that start with len...". */
export function ingredientList(items, staples, q, limit = 20) {
  const c = new Map(); const want = stems(q || '');
  for (const r of items) for (const i of new Set(r.ig || [])) { if (i.length > 40) continue; c.set(i, (c.get(i) || 0) + 1); }
  const stap = new Set(staples);
  const out = [...c.entries()].filter(([i]) => !want.length || want.every((w) => stems(i).some((x) => x === w || x.startsWith(w)))).sort((a, b) => b[1] - a[1]).slice(0, Math.min(limit, 50));
  return out.map(([i, n]) => ({ ingredient: i.replace(/_/g, ' '), recipes: n, staple: stap.has(i) || undefined }));
}

export function dietCounts(items) {
  const classified = items.filter((r) => r.dk);
  return Object.entries(DIET_INFO).map(([id, i]) => ({ id, ...i, recipes: items.filter((r) => dietOk(r, id)).length,
    published_claims: PUBLISHED[id] ? classified.filter((r) => (r.dc || []).includes(PUBLISHED[id])).length : undefined,
    certified_claims: PUBLISHED[id] ? items.filter((r) => (r.dcc || []).includes(PUBLISHED[id])).length : undefined, certified: false }));
}
export function dietCoverage(items) {
  const c = items.filter((r) => r.dk);
  return { recipes: items.length, classified_by_publisher: c.length, unclassified_screened_by_ingredients: items.length - c.length, held_back_for_review: items.filter((r) => r.dx).length };
}
