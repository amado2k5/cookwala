// World-scale, five-year model (2027–2031, quarterly). Fourth scale after home → city → country.
// Each world region mixes the city-calibrated per-person rates (../country/calibration.js) for
// urban / suburban / rural homes, then applies regional factors: household waste and supply-chain
// loss levels, cooking fuel mix, car dependence, refrigeration, price level, grid carbon intensity
// and population growth. Every scenario is compared with the same world without robots or the protocol.
import { CALIBRATION, SHARES } from '../country/calibration.js?v=0.3.0';

export const START_YEAR = 2027;
export const QUARTERS = Array.from({ length: 20 }, (_, q) => `${START_YEAR + Math.floor(q / 4)} Q${(q % 4) + 1}`);
const DAYS_Q = 365.25 / 4;
const EF = { gasKwh: 0.2, cityGrid: 0.45 }; // the city simulator's factors (kgCO2e/kWh)

// Sources for the regional factors (rounded, illustrative): UN WPP 2024 (population, growth),
// UN WUP (urban share), FAO SOFI 2024 (undernourishment), FAO SOFA 2019 (loss harvest→retail by region),
// UNEP Food Waste Index 2024 (household waste), IEA/WHO tracking SDG7 (clean cooking), Ember (grid intensity).
export const REGIONS = [
  { id: 'na', name: 'North America', pop: 383e6, growth: 0.005, urban: 0.83, hungry: 0.01, waste: 0.9, loss: 1.14, gas: 0.45, elecCook: 1.6, car: 1.8, cold: 1.3, price: 1.5, grid: 0.37, many: 0.45, few: 0.12, coverage: 0.85, at: [-100, 47],
    note: 'Car-dependent shopping, mostly electric stoves, high incomes' },
  { id: 'lac', name: 'Latin America & Caribbean', pop: 665e6, growth: 0.006, urban: 0.82, hungry: 0.06, waste: 0.95, loss: 0.87, gas: 0.9, elecCook: 0.7, car: 0.8, cold: 0.9, price: 0.8, grid: 0.2, many: 0.18, few: 0.03, coverage: 0.6, at: [-60, -12],
    note: 'Highly urban, LPG cooking, clean (hydro) electricity' },
  { id: 'eu', name: 'Europe', pop: 545e6, growth: 0, urban: 0.76, hungry: 0.01, waste: 0.85, loss: 1.14, gas: 0.55, elecCook: 1.5, car: 0.9, cold: 1.1, price: 1.3, grid: 0.25, many: 0.4, few: 0.1, coverage: 0.85, at: [12, 50] },
  { id: 'eeca', name: 'Eastern Europe & Central Asia', pop: 289e6, growth: 0.001, urban: 0.66, hungry: 0.03, waste: 0.95, loss: 1.3, gas: 1.1, elecCook: 0.8, car: 0.8, cold: 0.9, price: 0.7, grid: 0.45, many: 0.15, few: 0.03, coverage: 0.5, at: [72, 58],
    note: 'Gas cooking, long cold chains, high losses in Central Asia' },
  { id: 'mena', name: 'Middle East & North Africa', pop: 610e6, growth: 0.014, urban: 0.68, hungry: 0.09, waste: 1.15, loss: 0.78, gas: 1.1, elecCook: 0.7, car: 1.0, cold: 1.1, price: 0.75, grid: 0.55, many: 0.2, few: 0.04, coverage: 0.6, at: [33, 26],
    note: 'Heat spoils food; high household waste; conflict-driven hunger (Yemen, Sudan, Syria)' },
  { id: 'ssa', name: 'Sub-Saharan Africa', pop: 1260e6, growth: 0.025, urban: 0.45, hungry: 0.23, waste: 1.05, loss: 1.0, gas: 0.15, elecCook: 0.3, car: 0.4, cold: 0.35, price: 0.55, grid: 0.45, many: 0.03, few: 0.005, coverage: 0.45, at: [20, -5],
    note: '~80 % cook with wood or charcoal; half lack electricity; fastest population growth' },
  { id: 'sa', name: 'South Asia', pop: 2006e6, growth: 0.009, urban: 0.38, hungry: 0.135, waste: 0.8, loss: 1.5, gas: 0.55, elecCook: 0.4, car: 0.4, cold: 0.5, price: 0.45, grid: 0.68, many: 0.07, few: 0.01, coverage: 0.55, at: [78, 21],
    note: 'Highest losses between farm and shop; coal-heavy grid; the most hungry people' },
  { id: 'ea', name: 'East Asia', pop: 1630e6, growth: -0.003, urban: 0.68, hungry: 0.02, waste: 0.95, loss: 0.57, gas: 0.7, elecCook: 1.0, car: 0.7, cold: 1.0, price: 0.9, grid: 0.55, many: 0.45, few: 0.1, coverage: 0.75, at: [108, 36],
    note: 'Big robot makers; efficient supply chains; coal-heavy grid in China' },
  { id: 'sea', name: 'Southeast Asia', pop: 700e6, growth: 0.007, urban: 0.53, hungry: 0.05, waste: 1.0, loss: 0.57, gas: 0.65, elecCook: 0.7, car: 0.6, cold: 0.8, price: 0.6, grid: 0.55, many: 0.15, few: 0.03, coverage: 0.6, at: [112, 2] },
  { id: 'oc', name: 'Oceania', pop: 47e6, growth: 0.01, urban: 0.69, hungry: 0.07, waste: 0.8, loss: 0.42, gas: 0.45, elecCook: 1.5, car: 1.5, cold: 1.2, price: 1.4, grid: 0.5, many: 0.4, few: 0.1, coverage: 0.8, at: [138, -26] }
];

/** Countries (by Natural Earth name, as in world-atlas 110m) → region id. */
export const COUNTRY_REGION = (() => {
  const g = {
    na: 'Canada|United States of America|Greenland',
    lac: 'Mexico|Guatemala|Belize|Honduras|El Salvador|Nicaragua|Costa Rica|Panama|Cuba|Haiti|Dominican Rep.|Jamaica|Puerto Rico|Bahamas|Trinidad and Tobago|Colombia|Venezuela|Guyana|Suriname|Ecuador|Peru|Brazil|Bolivia|Paraguay|Chile|Argentina|Uruguay|Falkland Is.',
    eu: 'Norway|France|Sweden|Poland|Austria|Hungary|Romania|Lithuania|Latvia|Estonia|Germany|Bulgaria|Greece|Albania|Croatia|Switzerland|Luxembourg|Belgium|Netherlands|Portugal|Spain|Ireland|Italy|Denmark|United Kingdom|Iceland|Slovenia|Finland|Slovakia|Czechia|Cyprus|N. Cyprus|Bosnia and Herz.|Macedonia|Serbia|Montenegro|Kosovo',
    eeca: 'Russia|Belarus|Ukraine|Moldova|Kazakhstan|Uzbekistan|Tajikistan|Kyrgyzstan|Turkmenistan|Armenia|Azerbaijan|Georgia',
    mena: 'W. Sahara|Morocco|Algeria|Tunisia|Libya|Egypt|Sudan|Israel|Lebanon|Palestine|Jordan|Syria|Iraq|Iran|Turkey|Saudi Arabia|Yemen|Oman|United Arab Emirates|Qatar|Kuwait',
    ssa: "Tanzania|Dem. Rep. Congo|Somalia|Somaliland|Kenya|Chad|South Africa|Lesotho|Zimbabwe|Botswana|Namibia|Senegal|Mali|Mauritania|Benin|Niger|Nigeria|Cameroon|Togo|Ghana|Côte d'Ivoire|Guinea|Guinea-Bissau|Liberia|Sierra Leone|Burkina Faso|Central African Rep.|Congo|Gabon|Eq. Guinea|Zambia|Malawi|Mozambique|eSwatini|Angola|Burundi|Madagascar|Gambia|Eritrea|Ethiopia|Djibouti|Uganda|Rwanda|S. Sudan",
    sa: 'India|Bangladesh|Bhutan|Nepal|Pakistan|Afghanistan|Sri Lanka',
    ea: 'China|Taiwan|Japan|North Korea|South Korea|Mongolia',
    sea: 'Indonesia|Timor-Leste|Cambodia|Thailand|Laos|Myanmar|Vietnam|Philippines|Malaysia|Brunei',
    oc: 'Australia|New Zealand|Papua New Guinea|Fiji|Vanuatu|New Caledonia|Solomon Is.'
  };
  const m = {};
  for (const [r, names] of Object.entries(g)) for (const n of names.split('|')) m[n] = r;
  return m;
})();

export const SCENARIOS = [
  { id: 'none-off', robots: 'none', protocol: false, label: 'No robots, no protocol', short: 'No robots', baseline: true },
  { id: 'few-off', robots: 'few', protocol: false, label: 'Few robots (wealthy homes only), no protocol', short: 'Few robots' },
  { id: 'none-on', robots: 'none', protocol: true, label: 'No robots, protocol only (stores, farms, relief, apps)', short: 'Protocol, no robots' },
  { id: 'few-on', robots: 'few', protocol: true, label: 'Few robots + protocol', short: 'Few robots + protocol' },
  { id: 'many-off', robots: 'many', protocol: false, label: 'Many robots alone (no protocol)', short: 'Robots alone' },
  { id: 'many-on', robots: 'many', protocol: true, label: 'Many robots + Cookwala protocol', short: 'Robots + protocol' }
];
export const scenarioId = (robots, protocol) => `${robots}-${protocol ? 'on' : 'off'}`;

export const METRICS = [
  { id: 'householdWaste', label: 'Household food waste', unit: 'Mt', scale: 1e-9, good: 'down' },
  { id: 'preHomeLoss', label: 'Food lost before homes (farm, wholesale, stores)', unit: 'Mt', scale: 1e-9, good: 'down' },
  { id: 'foodWasted', label: 'All food lost or wasted', unit: 'Mt', scale: 1e-9, good: 'down' },
  { id: 'garbage', label: 'Garbage collected', unit: 'Mt', scale: 1e-9, good: 'down' },
  { id: 'gasM3', label: 'Natural gas & LPG for cooking', unit: 'billion m³', scale: 1e-9, good: 'down' },
  { id: 'energyKwh', label: 'Total energy (cooking, robots, transport, cold chain)', unit: 'TWh', scale: 1e-9, good: 'down' },
  { id: 'robotKwh', label: 'Robot electricity', unit: 'TWh', scale: 1e-9, good: 'neutral' },
  { id: 'fuelL', label: 'Vehicle fuel for food', unit: 'billion L', scale: 1e-9, good: 'down' },
  { id: 'co2', label: 'Greenhouse gases (food transport, cooking, cold chain, wasted food)', unit: 'Mt CO2e', scale: 1e-9, good: 'down' },
  { id: 'spend', label: 'Household food spend (price-level adjusted)', unit: '$ billion', scale: 1e-9, good: 'down' },
  { id: 'mealsRescued', label: 'Meals rescued from surplus', unit: 'billion meals', scale: 1e-9, good: 'up' },
  { id: 'hungerCovered', label: 'Hungry people whose meals rescue could cover (average over 5 years)', unit: 'million people', scale: 1e-6, good: 'up', avg: true },
  { id: 'humanHours', label: 'Cooking & shopping time', unit: 'billion hours', scale: 1e-9, good: 'down' }
];
const KEYS = METRICS.map((m) => m.id).concat(['farmLoss', 'wholesaleDiscard', 'retailDiscard', 'packaging', 'cookKwh', 'coldKwh', 'people', 'hungry']);
const zero = () => Object.fromEntries(KEYS.map((k) => [k, 0]));

function interp(rows, share) {
  const s = Math.max(0, Math.min(1, share));
  const i = SHARES.findIndex((x) => x >= s);
  if (i <= 0) return rows[0];
  const a = rows[i - 1]; const b = rows[i]; const t = (s - a.share) / (b.share - a.share);
  const out = {};
  for (const k of Object.keys(a)) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}
const logistic = (q, mid, k) => 1 / (1 + Math.exp(-(q - mid) / k));
const sCurve = (q, mid, k, last = 19) => (logistic(q, mid, k) - logistic(0, mid, k)) / (logistic(last, mid, k) - logistic(0, mid, k));

/** Robot-cook share of homes in quarter q (S-curve from 1/12 of the 2031 target to the target). */
export function adoptionAt(region, robots, q) {
  const target = robots === 'many' ? region.many : robots === 'few' ? region.few : 0;
  return target / 12 + (target - target / 12) * sCurve(q, 9.5, 3);
}
/** Share of the region's food system (stores, farms, logistics, relief, robots, apps) on the protocol. */
export function coverageAt(region, protocol, q) {
  return protocol ? 0.03 + (region.coverage - 0.03) * sCurve(q, 6, 2) : 0;
}

function rates(arch, share, coverage) {
  const a = interp(CALIBRATION[arch].noEco, share); const b = interp(CALIBRATION[arch].eco, share);
  const r = {};
  for (const k of Object.keys(a)) r[k] = a[k] * (1 - coverage) + b[k] * coverage;
  return r;
}

function quarterValues(reg, robots, protocol, q) {
  const share = adoptionAt(reg, robots, q); const cov = coverageAt(reg, protocol, q);
  const people = reg.pop * Math.pow(1 + reg.growth, q / 4 + 0.125);
  const grid = reg.grid * Math.pow(0.98, q / 4); // grids decarbonise ~2 %/yr
  const mix = [['urban', reg.urban * 0.6, 1.1], ['suburban', reg.urban * 0.4, 1], ['rural', 1 - reg.urban, 0.5]];
  const v = zero();
  for (const [arch, part, adopt] of mix) {
    const r = rates(arch, share * adopt, cov);
    const n = people * part * DAYS_Q;
    const hw = r.householdWaste * reg.waste; const farm = r.farmLoss * reg.loss; const whole = r.wholesaleDiscard * reg.loss; const retail = r.retailDiscard * reg.loss;
    v.householdWaste += hw * n; v.farmLoss += farm * n; v.wholesaleDiscard += whole * n; v.retailDiscard += retail * n;
    v.packaging += r.packaging * n;
    const gasKwh = r.gasKwh * reg.gas; const cookElec = r.cookElecKwh * reg.elecCook; const cold = r.coldKwh * reg.cold;
    const fuelKwh = (r.energyKwh - r.gasKwh - r.cookElecKwh - r.robotKwh - r.coldKwh) * reg.car;
    v.gasM3 += r.gasM3 * reg.gas * n; v.robotKwh += r.robotKwh * n; v.coldKwh += cold * n; v.cookKwh += (gasKwh + cookElec) * n;
    v.energyKwh += (gasKwh + cookElec + r.robotKwh + fuelKwh + cold) * n;
    v.fuelL += r.fuelL * reg.car * n;
    const vehicleCo2 = r.co2 - r.wasteCo2 - (r.gasKwh * EF.gasKwh + (r.cookElecKwh + r.robotKwh + r.coldKwh) * EF.cityGrid);
    const wasteBase = r.householdWaste + r.farmLoss + r.wholesaleDiscard + r.retailDiscard;
    const wasteCo2 = wasteBase ? r.wasteCo2 * (hw + farm + whole + retail) / wasteBase : 0;
    v.co2 += (vehicleCo2 * reg.car + gasKwh * EF.gasKwh + (cookElec + r.robotKwh + cold) * grid + wasteCo2) * n;
    v.spend += r.spend * reg.price * n;
    v.mealsRescued += r.mealsRescued * reg.loss * n;
    v.humanHours += r.humanHours * (r.homesPerPerson || 0.3) * n;
  }
  v.preHomeLoss = v.farmLoss + v.wholesaleDiscard + v.retailDiscard;
  v.foodWasted = v.preHomeLoss + v.householdWaste;
  v.garbage = v.householdWaste + v.packaging + v.wholesaleDiscard + v.retailDiscard;
  v.people = people; v.hungry = people * reg.hungry;
  // rescued meals help hungry people only where they are: capped by the region's hungry population (3 meals a day)
  v.hungerCovered = Math.min(v.hungry, v.mealsRescued / (3 * DAYS_Q));
  return { v, share, cov };
}

/** Runs one scenario over 20 quarters. Totals sum flows; `people`, `hungry`, `hungerCovered` are averaged. */
export function simulateWorld({ robots = 'many', protocol = true, regions = REGIONS } = {}) {
  const avg = new Set(['people', 'hungry', 'hungerCovered']);
  const world = { quarters: QUARTERS.map(() => zero()), total: zero() };
  const out = { robots, protocol, regions: [], world };
  for (const reg of regions) {
    const R = { id: reg.id, name: reg.name, cfg: reg, quarters: [], total: zero(), share: [], coverage: [] };
    QUARTERS.forEach((_, q) => {
      const { v, share, cov } = quarterValues(reg, robots, protocol, q);
      R.quarters.push(v); R.share.push(share); R.coverage.push(cov);
      for (const k of KEYS) {
        const add = avg.has(k) ? v[k] / QUARTERS.length : v[k];
        R.total[k] += add; world.total[k] += add; world.quarters[q][k] += v[k];
      }
    });
    out.regions.push(R);
  }
  return out;
}

/** All six robot × protocol combinations. */
export function simulateAll(regions = REGIONS) {
  return Object.fromEntries(SCENARIOS.map((s) => [s.id, simulateWorld({ robots: s.robots, protocol: s.protocol, regions })]));
}
