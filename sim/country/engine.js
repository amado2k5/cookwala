// Country-scale, one-year model (macro scale). Uses per-person unit rates calibrated from the
// city simulator (calibration.js) for urban / suburban / rural archetypes, mixes them by each
// region's robot adoption and whether its province runs the protocol ecosystem, applies
// seasonality, and compares every region with its own no-robot, no-protocol baseline.
import { CALIBRATION, SHARES } from './calibration.js?v=0.3.0';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const SEASONS = [
  { k: 'Winter (Dec–Feb)', v: 'more hot meals: cooking energy +8 %' },
  { k: 'Festival month (Apr)', v: 'food bought +8 %; household waste +15 % in traditional homes, +5 % in planning homes' },
  { k: 'Summer heat (Jun–Aug)', v: 'spoilage: household & store waste +15 %, wholesale +10 %, refrigeration +20 % (planning homes feel half of the household effect)' },
  { k: 'Harvest glut (Sep–Oct)', v: 'farm losses +25 %; with the protocol, demand shaping (recipes that use what is abundant) cuts the glut effect by up to 60 % with adoption' },
  { k: 'Holidays (Dec)', v: 'food bought +12 %; household waste +25 % in traditional homes, +10 % in planning homes' }
];

export const DEFAULT_COUNTRY = {
  name: 'Meridia',
  provinces: [
    { id: 'cap', label: [355, 160], name: 'Capital District', shape: 'M300 150 L380 140 L410 200 L370 250 L300 240 Z', protocolFrom: 0, adoption: [0.2, 0.55], note: 'Early adopter: incentives + protocol from January',
      regions: [{ id: 'cap-c', name: 'Capital City', arch: 'urban', pop: 6.0e6, foodInsecure: 0.08, x: 350, y: 197 }, { id: 'cap-s', name: 'Capital suburbs', arch: 'suburban', pop: 2.5e6, foodInsecure: 0.06, x: 322, y: 232 }] },
    { id: 'nor', label: [315, 48], name: 'Northshore', shape: 'M150 40 L420 30 L470 120 L380 140 L300 150 L170 130 Z', protocolFrom: 2, adoption: [0.1, 0.45], note: 'Protocol from March',
      regions: [{ id: 'nor-c', name: 'Port Northshore', arch: 'urban', pop: 2.2e6, foodInsecure: 0.09, x: 395, y: 88 }, { id: 'nor-s', name: 'Lakeside towns', arch: 'suburban', pop: 1.3e6, foodInsecure: 0.07, x: 262, y: 108 }, { id: 'nor-r', name: 'North farmlands', arch: 'rural', pop: 0.9e6, foodInsecure: 0.1, x: 196, y: 76 }] },
    { id: 'cen', label: [212, 150], name: 'Central Plains', shape: 'M170 130 L300 150 L300 240 L250 300 L140 290 L120 200 Z', protocolFrom: 6, adoption: [0.03, 0.3], note: 'Farming heartland; protocol from July',
      regions: [{ id: 'cen-c', name: 'Midtown', arch: 'urban', pop: 1.0e6, foodInsecure: 0.1, x: 255, y: 212 }, { id: 'cen-s', name: 'Plains towns', arch: 'suburban', pop: 1.2e6, foodInsecure: 0.11, x: 196, y: 268 }, { id: 'cen-r', name: 'Plains villages', arch: 'rural', pop: 2.6e6, foodInsecure: 0.14, x: 158, y: 190 }] },
    { id: 'sou', label: [340, 282], name: 'Southern Coast', shape: 'M250 300 L300 240 L370 250 L440 300 L400 370 L270 370 Z', protocolFrom: null, adoption: [0.12, 0.4], note: 'Robots sold widely, but stores, farms and logistics never join the protocol',
      regions: [{ id: 'sou-c', name: 'Coast City', arch: 'urban', pop: 2.8e6, foodInsecure: 0.1, x: 335, y: 318 }, { id: 'sou-s', name: 'Coast suburbs', arch: 'suburban', pop: 1.9e6, foodInsecure: 0.08, x: 290, y: 352 }, { id: 'sou-r', name: 'Coastal villages', arch: 'rural', pop: 0.8e6, foodInsecure: 0.15, x: 405, y: 340 }] },
    { id: 'eas', label: [468, 148], name: 'Eastern Highlands', shape: 'M380 140 L470 120 L540 180 L520 290 L440 300 L370 250 L410 200 Z', protocolFrom: 0, adoption: [0.02, 0.15], note: 'Low income: relief program runs the protocol (rescue, consolidated delivery) from January; robots mainly in community kitchens',
      regions: [{ id: 'eas-c', name: 'Highland City', arch: 'urban', pop: 0.7e6, foodInsecure: 0.18, x: 455, y: 196 }, { id: 'eas-r', name: 'Highland valleys', arch: 'rural', pop: 2.1e6, foodInsecure: 0.27, x: 485, y: 258 }] },
    { id: 'wes', label: [92, 148], name: 'Western Desert', shape: 'M40 120 L170 130 L120 200 L140 290 L60 300 L20 200 Z', protocolFrom: null, adoption: [0, 0], note: 'No adoption (comparison)',
      regions: [{ id: 'wes-c', name: 'Oasis City', arch: 'urban', pop: 0.6e6, foodInsecure: 0.12, x: 92, y: 196 }, { id: 'wes-r', name: 'Desert settlements', arch: 'rural', pop: 0.9e6, foodInsecure: 0.2, x: 80, y: 258 }] }
  ]
};

const clone = (o) => JSON.parse(JSON.stringify(o));
export const COUNTRY_PRESETS = {
  mixed: { label: 'Mixed national rollout (default)', make: () => clone(DEFAULT_COUNTRY) },
  national: { label: 'Nationwide rollout with the protocol', make: () => { const c = clone(DEFAULT_COUNTRY); c.provinces.forEach((p) => { p.protocolFrom = 0; p.adoption = [Math.max(p.adoption[0], 0.05), 0.6]; }); return c; } },
  robotsNoProtocol: { label: 'Robots everywhere, no protocol anywhere', make: () => { const c = clone(DEFAULT_COUNTRY); c.provinces.forEach((p) => { p.protocolFrom = null; p.adoption = [Math.max(p.adoption[0], 0.05), 0.6]; }); return c; } },
  protocolNoRobots: { label: 'Protocol everywhere, very few robots', make: () => { const c = clone(DEFAULT_COUNTRY); c.provinces.forEach((p) => { p.protocolFrom = 0; p.adoption = [0.02, 0.05]; }); return c; } }
};

export const METRICS = [
  { id: 'householdWaste', label: 'Household food waste', unit: 'kt', scale: 1e-6, good: 'down' },
  { id: 'preHomeLoss', label: 'Food lost before homes (farm, wholesale, stores)', unit: 'kt', scale: 1e-6, good: 'down' },
  { id: 'garbage', label: 'Garbage collected', unit: 'kt', scale: 1e-6, good: 'down' },
  { id: 'gasM3', label: 'Natural gas for cooking', unit: 'million m³', scale: 1e-6, good: 'down' },
  { id: 'energyKwh', label: 'Total energy (cooking, robots, transport, cold chain)', unit: 'GWh', scale: 1e-6, good: 'down' },
  { id: 'robotKwh', label: 'Robot electricity', unit: 'GWh', scale: 1e-6, good: 'neutral' },
  { id: 'fuelL', label: 'Vehicle fuel', unit: 'million L', scale: 1e-6, good: 'down' },
  { id: 'foodVkm', label: 'Food-related vehicle-km', unit: 'million km', scale: 1e-6, good: 'down' },
  { id: 'co2', label: 'Greenhouse gases', unit: 'kt CO2e', scale: 1e-6, good: 'down' },
  { id: 'spend', label: 'Household food spend', unit: '$ million', scale: 1e-6, good: 'down' },
  { id: 'mealsRescued', label: 'Meals rescued from store surplus', unit: 'million meals', scale: 1e-6, good: 'up' },
  { id: 'humanHours', label: 'Cooking & shopping time', unit: 'million hours', scale: 1e-6, good: 'down' }
];

function interp(rows, share) {
  const s = Math.max(0, Math.min(1, share));
  let i = SHARES.findIndex((x) => x >= s);
  if (i <= 0) return rows[0];
  const a = rows[i - 1]; const b = rows[i]; const t = (s - a.share) / (b.share - a.share);
  const out = {};
  for (const k of Object.keys(a)) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}
/** Adoption follows an S-curve from the January share to the December target. */
export function adoptionAt(p, m) {
  const [a, b] = p.adoption;
  const x = (m - 5.5) / 1.6;
  const s = 1 / (1 + Math.exp(-x)); const s0 = 1 / (1 + Math.exp(5.5 / 1.6)); const s1 = 1 / (1 + Math.exp(-5.5 / 1.6));
  return a + (b - a) * ((s - s0) / (s1 - s0));
}

function monthValues(arch, share, eco, m, days, pop) {
  const r = interp(CALIBRATION[arch][eco ? 'eco' : 'noEco'], share);
  const mitig = (mult) => 1 + (mult - 1) * (1 - 0.5 * share);
  const heat = [5, 6, 7].includes(m); const harvest = [8, 9].includes(m); const winter = [11, 0, 1].includes(m);
  const festival = m === 3; const holiday = m === 11;
  let mHome = 1; let mBuy = 1;
  if (heat) mHome *= mitig(1.15);
  if (festival) { mHome *= 1 + (1.15 - 1) * (1 - share) + (1.05 - 1) * share; mBuy *= 1.08; }
  if (holiday) { mHome *= 1 + (1.25 - 1) * (1 - share) + (1.1 - 1) * share; mBuy *= 1.12; }
  const mRetail = heat ? 1.15 : 1; const mWhole = heat ? 1.1 : 1; const mCold = heat ? 1.2 : 1;
  const mFarm = harvest ? 1 + 0.25 * (eco ? 1 - 0.6 * share : 1) : 1;
  const mCook = (winter ? 1.08 : 1) * (festival ? 1.05 : 1) * (holiday ? 1.08 : 1);
  const n = pop * days;
  const v = {};
  v.householdWaste = r.householdWaste * mHome * n;
  v.farmLoss = r.farmLoss * mFarm * n;
  v.wholesaleDiscard = r.wholesaleDiscard * mWhole * n;
  v.retailDiscard = r.retailDiscard * mRetail * n;
  v.preHomeLoss = v.farmLoss + v.wholesaleDiscard + v.retailDiscard;
  v.packaging = r.packaging * mBuy * n;
  v.garbage = v.householdWaste + v.packaging + v.wholesaleDiscard + v.retailDiscard;
  v.gasM3 = r.gasM3 * mCook * n;
  const gasKwh = r.gasKwh * mCook * n; const cookElec = r.cookElecKwh * mCook * n; const robot = r.robotKwh * n;
  const fuelKwh = (r.energyKwh - r.gasKwh - r.cookElecKwh - r.robotKwh - r.coldKwh) * n;
  const cold = r.coldKwh * mCold * n;
  v.robotKwh = robot; v.coldKwh = cold; v.cookKwh = gasKwh + cookElec;
  v.energyKwh = gasKwh + cookElec + robot + fuelKwh + cold;
  v.fuelL = r.fuelL * n; v.foodVkm = r.foodVkm * n;
  const wasteBase = r.householdWaste + r.farmLoss + r.wholesaleDiscard + r.retailDiscard;
  const wasteMult = wasteBase ? (r.householdWaste * mHome + r.farmLoss * mFarm + r.wholesaleDiscard * mWhole + r.retailDiscard * mRetail) / wasteBase : 1;
  v.co2 = ((r.co2 - r.wasteCo2) * (1 + (mCook - 1) * 0.4) + r.wasteCo2 * wasteMult) * n;
  v.spend = r.spend * mBuy * n;
  v.mealsRescued = r.mealsRescued * mRetail * n;
  v.humanHours = r.humanHours * n * (r.homesPerPerson || 0.3);
  return v;
}

export function simulateCountry({ country = DEFAULT_COUNTRY } = {}) {
  const out = { name: country.name, months: MONTHS, provinces: [], monthly: [], annual: { scenario: {}, baseline: {} } };
  const keys = METRICS.map((m) => m.id).concat(['cookKwh', 'coldKwh', 'farmLoss', 'wholesaleDiscard', 'retailDiscard', 'packaging']);
  const zero = () => Object.fromEntries(keys.map((k) => [k, 0]));
  out.monthly = MONTHS.map(() => ({ scenario: zero(), baseline: zero() }));
  out.annual.scenario = zero(); out.annual.baseline = zero();
  let totalPop = 0; let insecure = 0;
  for (const p of country.provinces) {
    const prov = { id: p.id, name: p.name, shape: p.shape, note: p.note, protocolFrom: p.protocolFrom, adoption: p.adoption, regions: [], annual: { scenario: zero(), baseline: zero() }, monthly: MONTHS.map(() => ({ scenario: zero(), baseline: zero() })) };
    for (const r of p.regions) {
      totalPop += r.pop; insecure += r.pop * r.foodInsecure;
      const reg = { ...r, monthly: [], annual: { scenario: zero(), baseline: zero() }, adoptionByMonth: [], ecoByMonth: [] };
      for (let m = 0; m < 12; m++) {
        const share = adoptionAt(p, m); const eco = p.protocolFrom != null && m >= p.protocolFrom;
        const s = monthValues(r.arch, share, eco, m, DAYS[m], r.pop);
        const b = monthValues(r.arch, 0, false, m, DAYS[m], r.pop);
        reg.adoptionByMonth.push(share); reg.ecoByMonth.push(eco);
        reg.monthly.push({ scenario: s, baseline: b });
        for (const k of keys) {
          reg.annual.scenario[k] += s[k]; reg.annual.baseline[k] += b[k];
          prov.monthly[m].scenario[k] += s[k]; prov.monthly[m].baseline[k] += b[k];
          prov.annual.scenario[k] += s[k]; prov.annual.baseline[k] += b[k];
          out.monthly[m].scenario[k] += s[k]; out.monthly[m].baseline[k] += b[k];
          out.annual.scenario[k] += s[k]; out.annual.baseline[k] += b[k];
        }
      }
      prov.regions.push(reg);
    }
    out.provinces.push(prov);
  }
  out.population = totalPop; out.foodInsecure = insecure;
  // meals the food-insecure population needs in a year (3 a day) vs rescued
  out.mealsNeededFoodInsecure = insecure * 365 * 3;
  return out;
}
