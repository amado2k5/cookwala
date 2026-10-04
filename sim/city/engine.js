// Two-city, one-month food-system simulation: farms → wholesale → stores → homes → garbage,
// with traffic. Homes with Cookwala robot cooks vs traditional homes; cities with or without
// protocol-level supply-chain features (demand signals, consolidated delivery, surplus rescue).
// Deterministic for a seed. Every parameter is listed in ASSUMPTIONS and shown on the page.
import { rng, round } from '../engine/util.js?v=0.2.0';

export const PRODUCTS = [
  // perCap kg/person/day, price $/kg, shelf (days) at retail and at home, packaging kg per kg, embodied kgCO2e/kg
  { id: 'tomato', cooked: 0.7, inedible: 0.05, name: 'Tomatoes', cat: 'produce', source: 'vegetable farms', perCap: 0.09, price: 1.6, shelfRetail: 6, shelfHome: 6, pack: 0.03, co2: 1.1 },
  { id: 'greens', cooked: 0.4, inedible: 0.1, name: 'Leafy greens', cat: 'produce', source: 'vegetable farms', perCap: 0.04, price: 3.0, shelfRetail: 4, shelfHome: 4, pack: 0.06, co2: 1.0 },
  { id: 'onion', cooked: 1, inedible: 0.1, name: 'Onions', cat: 'produce', source: 'vegetable farms', perCap: 0.06, price: 1.0, shelfRetail: 20, shelfHome: 25, pack: 0.02, co2: 0.5 },
  { id: 'potato', cooked: 1, inedible: 0.1, name: 'Potatoes', cat: 'produce', source: 'vegetable farms', perCap: 0.10, price: 0.9, shelfRetail: 20, shelfHome: 21, pack: 0.02, co2: 0.4 },
  { id: 'fruit', cooked: 0, inedible: 0.18, name: 'Fruit', cat: 'produce', source: 'orchards', perCap: 0.15, price: 2.0, shelfRetail: 7, shelfHome: 7, pack: 0.03, co2: 0.8 },
  { id: 'rice', cooked: 1, inedible: 0, name: 'Rice', cat: 'staple', source: 'grain farms', perCap: 0.08, price: 1.8, shelfRetail: 180, shelfHome: 180, pack: 0.03, co2: 4.0 },
  { id: 'lentils', cooked: 1, inedible: 0, name: 'Lentils', cat: 'staple', source: 'grain farms', perCap: 0.03, price: 2.2, shelfRetail: 180, shelfHome: 180, pack: 0.03, co2: 1.0 },
  { id: 'bread', cooked: 0, inedible: 0.02, name: 'Bread', cat: 'staple', source: 'grain farms (bakery)', perCap: 0.10, price: 2.5, shelfRetail: 3, shelfHome: 4, pack: 0.04, co2: 1.3 },
  { id: 'milk', cooked: 0.1, inedible: 0, name: 'Milk & yogurt', cat: 'dairy', source: 'dairy cattle', perCap: 0.20, price: 1.2, shelfRetail: 8, shelfHome: 7, pack: 0.06, co2: 1.6 },
  { id: 'eggs', cooked: 1, inedible: 0.12, name: 'Eggs', cat: 'dairy', source: 'poultry farms', perCap: 0.04, price: 3.5, shelfRetail: 21, shelfHome: 25, pack: 0.08, co2: 4.5 },
  { id: 'chicken', cooked: 1, inedible: 0.18, name: 'Chicken', cat: 'protein', source: 'poultry farms', perCap: 0.06, price: 6.0, shelfRetail: 4, shelfHome: 3, pack: 0.08, co2: 6.0 },
  { id: 'beef', cooked: 1, inedible: 0.1, name: 'Beef & lamb', cat: 'protein', source: 'cattle ranches', perCap: 0.03, price: 12.0, shelfRetail: 5, shelfHome: 4, pack: 0.08, co2: 40.0 },
  { id: 'fish', cooked: 1, inedible: 0.3, name: 'Fish', cat: 'protein', source: 'fisheries', perCap: 0.03, price: 9.0, shelfRetail: 3, shelfHome: 2, pack: 0.08, co2: 5.0 }
];

export const ASSUMPTIONS = [
  { k: 'Traditional household food waste target', v: '≈79 kg/person/year (≈0.22 kg/day), incl. inedible parts (peels, bones, shells — same for every kitchen)', src: 'UNEP Food Waste Index 2024', url: 'https://www.unep.org/resources/publication/food-waste-index-report-2024' },
  { k: 'Retail food waste reference', v: '≈17 kg/person/year', src: 'UNEP Food Waste Index 2024', url: 'https://www.unep.org/resources/publication/food-waste-index-report-2024' },
  { k: 'Loss between harvest and retail', v: '≈13 %', src: 'FAO food loss estimate', url: 'https://www.fao.org/newsroom/detail/tackling-food-loss-and-waste-from-the-farm-to-the-table-and-beyond/en' },
  { k: 'Congestion model', v: 'BPR: time = free-flow × (1 + 0.15 (V/C)^4)', src: 'US Bureau of Public Roads', url: 'https://www.aequilibrae.com/develop/python/traffic_assignment/volume_delay_functions.html' },
  { k: 'Traditional home behaviour', v: 'weekly big shop (car) + top-ups; buys ~0–10 % over need on perishables and misjudges what is already at home by ±15 %; short-life items bought for ~shelf life + 1 day; cooks 10 % extra, 40 % of the extra wasted; 3.5 % plate waste; 10 % of the time uses the newest item first (older ones expire); freezes meat in 25 % of homes; 12 % of days someone eats out unplanned', src: 'Model assumption (calibrated to UNEP)' },
  { k: 'Robot home behaviour (Cookwala)', v: '7-day meal plan; orders every 3 days for planned need + 5 % buffer; cooks 4 % extra, repurposes 70 % of leftovers; 3 % plate waste; spoilage watch rescues 60 % of items about to expire (use-first / freeze); same unplanned eating-out as traditional homes', src: 'Model assumption (protocol capabilities: feed, store, personalize)' },
  { k: 'Store ordering', v: 'forecast = 7-day moving average × (1 + safety); safety 45 % perishables (35 % convenience +15 %); with demand signals, robot-home orders are known a day ahead and only the unknown share carries safety stock', src: 'Model assumption' },
  { k: 'Wholesale & farms', v: 'safety stock 25 % / 20 % without demand signals, falling toward 8 % / 6 % in proportion to the share of demand covered by robot-home plans; 5 % unavoidable handling loss', src: 'Model assumption (calibrated toward FAO ≈13 %)' },
  { k: 'Deliveries', v: 'individual van routes ≈6 orders; consolidated community slots ≈25 orders per route; fee $3 individual, $1 slot', src: 'Model assumption' },
  { k: 'Surplus rescue', v: 'stores pledge 70 % of produce, bread and dairy reaching the end of its sellable life (not raw meat/fish) to the low-income community kitchen instead of discarding it (0.45 kg = 1 meal)', src: 'Cookwala relief layer' },
  { k: 'Emission factors', v: 'car 0.19, van 0.27, truck 0.9, garbage truck 1.5 kgCO2e/km; electricity 0.45 and natural gas 0.2 kgCO2e/kWh; wasted food = its embodied CO2e', src: 'Rounded common factors (illustrative)' },
  { k: 'Stoves', v: '55 % gas, 35 % electric, 10 % induction in both cities; robot homes keep the stove they have', src: 'Model assumption' },
  { k: 'Cooking energy', v: '0.47 kWh of useful heat per kg of food cooked (raw fruit, bread and milk excluded); heat-to-pot efficiency gas 38 %, electric 72 %, induction 85 %; 1 m³ natural gas ≈ 10.5 kWh', src: 'Rounded planning values (efficiency ranges as in knowledge/energy.json)', url: 'https://www.energystar.gov/products/residential_induction_cooking_tops' },
  { k: 'Robot cooking', v: 'energy-saver mode (protocol operating modes): −15 % heat via lids, pressure cooking, residual heat, batching; without the protocol −5 %; robot itself 0.35 kWh/day; supervision 0.2 h/day vs 1.2 h human cooking', src: 'Model assumption' },
  { k: 'Transport fuel', v: 'car 7.5 L/100 km gasoline (8.9 kWh/L); van 11, truck 30, garbage truck 50 L/100 km diesel (10 kWh/L)', src: 'Rounded typical values' },
  { k: 'Refrigeration', v: 'stores & wholesale: 0.05 kWh per kg of chilled stock (greens, dairy, eggs, meat, fish) per day', src: 'Model assumption' },
  { k: 'Not included', v: 'robot purchase/subscription cost, restaurants & food service, school meals', src: '' }
];

export const DEFAULT_CITIES = [
  {
    id: 'A', name: 'Nilebridge', note: 'Cookwala ecosystem: high robot adoption + demand signals, consolidated delivery, surplus rescue',
    demandSignals: true, consolidated: true, rescue: true, bulkPackaging: true, energySaver: true,
    stoveMix: { gas: 0.55, electric: 0.35, induction: 0.1 },
    communities: [
      { id: 'A1', name: 'Downtown', homes: 420, income: 'mid', distKm: 0.8, robotShare: 0.5 },
      { id: 'A2', name: 'Green Hills', homes: 560, income: 'high', distKm: 3.0, robotShare: 0.45 },
      { id: 'A3', name: 'Riverside', homes: 520, income: 'low', distKm: 1.5, robotShare: 0.35, note: 'robots via a relief program' }
    ],
    roadCapacity: 9600, backgroundVkmPeak: 8600, farmKm: 40, wholesaleKm: 8
  },
  {
    id: 'B', name: 'Harborfield', note: 'Business as usual: few robot homes, no protocol in stores, farms or logistics',
    demandSignals: false, consolidated: false, rescue: false, bulkPackaging: false, energySaver: false,
    stoveMix: { gas: 0.55, electric: 0.35, induction: 0.1 },
    communities: [
      { id: 'B1', name: 'Old Town', homes: 420, income: 'mid', distKm: 0.8, robotShare: 0.1 },
      { id: 'B2', name: 'Seaview', homes: 560, income: 'high', distKm: 3.0, robotShare: 0.15 },
      { id: 'B3', name: 'Dockside', homes: 520, income: 'low', distKm: 1.5, robotShare: 0.02 }
    ],
    roadCapacity: 9600, backgroundVkmPeak: 8600, farmKm: 40, wholesaleKm: 8
  }
];

const clone = (o) => JSON.parse(JSON.stringify(o));
export const CITY_PRESETS = {
  default: { label: 'Cookwala city vs business as usual', make: () => clone(DEFAULT_CITIES) },
  robotsOnly: {
    label: 'Robots without the protocol ecosystem (Nilebridge)',
    make: () => { const c = clone(DEFAULT_CITIES); Object.assign(c[0], { demandSignals: false, consolidated: false, rescue: false, bulkPackaging: false, energySaver: false, note: 'Same robot homes, but stores, farms and logistics ignore their plans' }); return c; }
  },
  protocolOnly: {
    label: 'Protocol in stores & logistics, almost no robots (Nilebridge)',
    make: () => { const c = clone(DEFAULT_CITIES); c[0].communities.forEach((m) => { m.robotShare = 0.05; }); c[0].note = 'Demand signals, consolidated delivery and rescue on, but only 5 % robot homes'; return c; }
  },
  both: {
    label: 'Both cities adopt Cookwala',
    make: () => { const c = clone(DEFAULT_CITIES); Object.assign(c[1], { demandSignals: true, consolidated: true, rescue: true, bulkPackaging: true, energySaver: true, note: 'Adopts the Cookwala ecosystem too' }); c[1].communities.forEach((m, i) => { m.robotShare = c[0].communities[i].robotShare; }); return c; }
  }
};

const EF = { car: 0.19, van: 0.27, truck: 0.9, garbage: 1.5, kwh: 0.45, gasKwh: 0.2 };
// Energy model (planning estimates)
export const ENERGY = {
  usefulKwhPerKgCooked: 0.47,                           // heat that must reach the food per kg cooked
  efficiency: { gas: 0.38, electric: 0.72, induction: 0.85 }, // heat-to-pot efficiency by stove type
  gasKwhPerM3: 10.5,
  robotMethodFactor: { saver: 0.85, basic: 0.95 },     // lids, pressure cooking, residual heat, batching
  robotKwhPerDay: 0.35,                                 // robot manipulation + compute
  fuelLPerKm: { car: 0.075, van: 0.11, truck: 0.3, garbage: 0.5 }, // gasoline (car) / diesel
  fuelKwhPerL: { car: 8.9, van: 10.0, truck: 10.0, garbage: 10.0 },
  coldKwhPerKgDay: 0.05,                                 // commercial refrigeration per kg of chilled stock per day
  chilled: ['greens', 'milk', 'eggs', 'chicken', 'beef', 'fish']
};
const SHELF = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const perishable = (p) => p.shelfRetail <= 8;

function takeFifo(batches, qty, lifoShare, R) {
  // remove qty from batches (sorted by expiry asc); with lifoShare probability take newest first
  let need = qty;
  const order = R && R.chance(lifoShare) ? [...batches].reverse() : batches;
  for (const b of order) {
    if (need <= 0) break;
    const t = Math.min(b.q, need);
    b.q -= t; need -= t;
  }
  for (let i = batches.length - 1; i >= 0; i--) if (batches[i].q <= 1e-6) batches.splice(i, 1);
  return qty - need; // taken
}
const stock = (batches) => batches.reduce((s, b) => s + b.q, 0);

export function simulateCities({ seed = 11, days = 30, cities = DEFAULT_CITIES } = {}) {
  const R = rng(seed);
  const out = { days, products: PRODUCTS.map((p) => ({ id: p.id, name: p.name })), cities: [] };

  for (const cfg of cities) {
    // ---------- build the city ----------
    const city = { cfg, homes: [], stores: [], wholesale: {}, farm: {} };
    let hid = 0;
    for (const com of cfg.communities) {
      const sup = { id: `${com.id}-super`, kind: 'supermarket', community: com.id, inv: {}, hist: {}, known: {}, safety: 0.45 };
      const conv = { id: `${com.id}-conv`, kind: 'convenience', community: com.id, inv: {}, hist: {}, known: {}, safety: 0.6 };
      for (const s of [sup, conv]) for (const p of PRODUCTS) { s.inv[p.id] = []; s.hist[p.id] = []; s.known[p.id] = 0; }
      city.stores.push(sup, conv);
      for (let i = 0; i < com.homes; i++) {
        const size = [1, 2, 2, 3, 3, 3, 4, 4, 5, 6][Math.floor(R.next() * 10)];
        const robot = R.next() < com.robotShare;
        const home = {
          id: hid++, community: com.id, size, robot, income: com.income,
          shopDay: Math.floor(R.next() * 7), orderPhase: Math.floor(R.next() * 3),
          delivery: !robot && R.next() < 0.2, inv: {}, freezes: robot || R.next() < 0.25,
          stove: (() => { const x = R.next(); const m = cfg.stoveMix || { gas: 0.55, electric: 0.35 }; return x < m.gas ? 'gas' : x < m.gas + m.electric ? 'electric' : 'induction'; })()
        };
        for (const p of PRODUCTS) home.inv[p.id] = [];
        city.homes.push(home);
      }
    }
    for (const p of PRODUCTS) { city.wholesale[p.id] = []; city.farm[p.id] = { planned: 0 }; }
    // warm start: stores and wholesale hold ~3 days of stock; homes hold ~3 days of food
    const pop = city.homes.reduce((s, h) => s + h.size, 0);
    for (const s of city.stores) {
      const homesHere = city.homes.filter((h) => h.community === s.community);
      const people = homesHere.reduce((a, h) => a + h.size, 0) * (s.kind === 'supermarket' ? 0.85 : 0.15);
      for (const p of PRODUCTS) { const d = people * p.perCap; s.inv[p.id].push({ q: d * 3, exp: Math.min(p.shelfRetail, 3) }); s.hist[p.id] = Array(7).fill(d); }
    }
    for (const p of PRODUCTS) city.wholesale[p.id].push({ q: pop * p.perCap * 3, exp: Math.min(p.shelfRetail, 4) });
    for (const h of city.homes) for (const p of PRODUCTS) h.inv[p.id].push({ q: h.size * p.perCap * 3, exp: Math.min(p.shelfHome, 3 + Math.floor(R.next() * 3)) });

    const coverage = cfg.demandSignals ? city.homes.filter((h) => h.robot).reduce((t, h) => t + h.size, 0) / Math.max(1, city.homes.reduce((t, h) => t + h.size, 0)) : 0;
    const series = []; // per day
    const comStats = Object.fromEntries(cfg.communities.map((c) => [c.id, { robot: blank(), trad: blank() }])); // reset after warm-up
    const totals = blank();
    const lossByStage = { farm: 0, wholesale: 0, retail: 0, household: 0 };
    let produced = 0;

    const WARMUP = 7; // days simulated before measuring, so starting inventories don't distort the month
    let lastSpeed = 36;
    for (let d = 0; d < days + WARMUP; d++) {
      if (d === WARMUP) {
        for (const k of Object.keys(comStats)) comStats[k] = { robot: blank(), trad: blank() };
        for (const k of Object.keys(lossByStage)) lossByStage[k] = 0;
        produced = 0;
      }
      const day = blank();
      const dayFactor = d % 7 === 5 || d % 7 === 6 ? 1.1 : 1.0;
      const salesToday = Object.fromEntries(city.stores.map((s) => [s.id, Object.fromEntries(PRODUCTS.map((p) => [p.id, 0]))]));
      const store = (com, kind) => city.stores.find((s) => s.community === com && s.kind === kind);
      let vanOrders = { individual: {}, slot: {} };
      let carKm = 0; let topUps = 0; let bigShops = 0; let stockouts = 0; let attempts = 0; let substitutions = 0;

      // ---------- homes ----------
      for (const h of city.homes) {
        const com = cfg.communities.find((c) => c.id === h.community);
        const st = h.robot ? comStats[h.community].robot : comStats[h.community].trad;
        const guests = R.chance(0.03) ? 1.4 : 1.0;
        const away = R.chance(0.12) ? R.between(0.3, 0.7) : 1.0; // someone eats out / skips a meal (unplanned for both kinds of home)
        const need = Object.fromEntries(PRODUCTS.map((p) => [p.id, h.size * p.perCap * dayFactor * guests * away * R.between(0.85, 1.15)]));
        // --- purchasing ---
        let boughtKg = 0; let spend = 0;
        const buy = (s, pid, qty) => {
          if (qty <= 0) return 0;
          const got = takeFifo(s.inv[pid], qty, s.kind === 'convenience' ? 0.2 : 0.3, R);
          attempts += 1;
          if (got < qty * 0.95) { stockouts += 1; if (h.robot) substitutions += 1; }
          salesToday[s.id][pid] += got;
          if (got > 0) h.inv[pid].push({ q: got, exp: SHELF[pid].shelfHome * (h.freezes && (SHELF[pid].cat === 'protein' || pid === 'bread') ? (h.robot ? 10 : 6) : 1) });
          h.inv[pid].sort((a, b) => a.exp - b.exp);
          boughtKg += got; spend += got * SHELF[pid].price * (s.kind === 'convenience' ? 1.15 : 1);
          return got;
        };
        if (h.robot) {
          if (d % 3 === h.orderPhase) {
            const sup = store(h.community, 'supermarket');
            for (const p of PRODUCTS) {
              const horizon = perishable(p) ? 3.5 : 7;
              const want = h.size * p.perCap * horizon * 1.05 * dayFactor - stock(h.inv[p.id]);
              buy(sup, p.id, want);
            }
            if (cfg.consolidated) vanOrders.slot[h.community] = (vanOrders.slot[h.community] || 0) + 1;
            else vanOrders.individual[h.community] = (vanOrders.individual[h.community] || 0) + 1;
            spend += cfg.consolidated ? 1 : 3;
          }
        } else {
          if (d % 7 === h.shopDay) {
            const sup = store(h.community, 'supermarket');
            for (const p of PRODUCTS) {
              const over = perishable(p) ? R.between(1.0, 1.1) : 1.02;
              const perceived = stock(h.inv[p.id]) * R.between(0.85, 1.15);
              buy(sup, p.id, h.size * p.perCap * Math.min(7, p.shelfHome + 1) * over - perceived); // short-life items bought for a few days, topped up later
            }
            if (h.delivery) { vanOrders.individual[h.community] = (vanOrders.individual[h.community] || 0) + 1; spend += 3; }
            else { carKm += 2 * com.distKm; bigShops += 1; }
          }
        }
        // --- cooking & eating ---
        let short = false;
        let cookedKg = 0;
        for (const p of PRODUCTS) {
          const cookFactor = h.robot ? 1.04 : 1.1;
          const cookQty = need[p.id] * cookFactor;
          const got = takeFifo(h.inv[p.id], cookQty, h.robot ? 0 : 0.1, R);
          if (got < need[p.id] * 0.9) short = true;
          cookedKg += got * p.cooked;
          const eaten = Math.min(got, need[p.id]);
          const excess = got - eaten;
          const leftoverWaste = excess * (h.robot ? 0.3 : 0.4);
          const plateWaste = eaten * (h.robot ? 0.03 : 0.035);
          const inedible = eaten * p.inedible; // peels, bones, shells: same for every kitchen
          st.inedible += inedible; day.inedibleWaste += inedible;
          st.foodWaste += inedible; day.householdWaste += inedible;
          st.foodWaste += leftoverWaste + plateWaste; day.householdWaste += leftoverWaste + plateWaste;
          st.co2 += (leftoverWaste + plateWaste) * p.co2;
          day.wasteCo2 += (leftoverWaste + plateWaste) * p.co2;
        }
        // top-up trip for traditional homes when short
        if (short && !h.robot) {
          const conv = store(h.community, 'convenience');
          for (const p of PRODUCTS) if (stock(h.inv[p.id]) < need[p.id]) buy(conv, p.id, h.size * p.perCap * 3);
          topUps += 1;
          if (R.chance(0.5)) carKm += 2 * com.distKm * 0.4;
        }
        if (short && h.robot) day.robotShort += 1;
        // --- spoilage at home ---
        for (const p of PRODUCTS) {
          for (const b of h.inv[p.id]) b.exp -= 1;
          const expired = h.inv[p.id].filter((b) => b.exp <= 0);
          // robot homes: spoilage watch catches most items a day before expiry (use-first / freeze)
          const spoiled = expired.reduce((s, b) => s + b.q, 0) * (h.robot ? 0.4 : 1);
          h.inv[p.id] = h.inv[p.id].filter((b) => b.exp > 0);
          st.foodWaste += spoiled; day.householdWaste += spoiled; st.co2 += spoiled * p.co2; day.wasteCo2 += spoiled * p.co2;
        }
        const packaging = boughtKg * 0.045 * (h.robot && cfg.bulkPackaging ? 0.5 : 1);
        st.packaging += packaging; day.packaging += packaging;
        st.spend += spend; day.spend += spend;
        st.people += h.size / days; st.homes += 1 / days;
        const method = h.robot ? ENERGY.robotMethodFactor[cfg.energySaver ? 'saver' : 'basic'] : 1;
        const inputKwh = (cookedKg * ENERGY.usefulKwhPerKgCooked * method) / ENERGY.efficiency[h.stove];
        if (h.stove === 'gas') { day.gasKwh += inputKwh; st.gasKwh += inputKwh; } else { day.cookElecKwh += inputKwh; st.elecKwh += inputKwh; }
        if (h.robot) { day.robotKwh += ENERGY.robotKwhPerDay; st.robotKwh += ENERGY.robotKwhPerDay; }
        day.humanHours += h.robot ? 0.2 : 1.2 + (d % 7 === h.shopDay && !h.robot ? 1 : 0);
      }
      day.carKm = carKm; day.topUps = topUps; day.bigShops = bigShops; day.stockouts = stockouts; day.attempts = attempts; day.substitutions = substitutions;

      // ---------- delivery vans ----------
      let vanKm = 0; let deliveries = 0; let deliveryMin = 0;
      const speedNow = lastSpeed;
      for (const [comId, n] of Object.entries(vanOrders.individual)) {
        const com = cfg.communities.find((c) => c.id === comId);
        const routes = Math.ceil(n / 6);
        const km = routes * (2 * com.distKm + 4) + n * 0.6;
        vanKm += km; deliveries += n;
        deliveryMin += n * (((2 * com.distKm + 4) / speedNow) * 60 / 2 + 6 * 4 + 35);
      }
      for (const [comId, n] of Object.entries(vanOrders.slot)) {
        const com = cfg.communities.find((c) => c.id === comId);
        const routes = Math.ceil(n / 25);
        const km = routes * (2 * com.distKm + 4) + n * 0.4;
        vanKm += km; deliveries += n;
        deliveryMin += n * (((2 * com.distKm + 4) / speedNow) * 60 / 2 + 12 * 3 + 5);
      }
      day.vanKm = vanKm; day.deliveries = deliveries; day.deliveryMin = deliveries ? deliveryMin / deliveries : 0;

      // ---------- stores: spoilage, rescue, ordering ----------
      let retailOrders = Object.fromEntries(PRODUCTS.map((p) => [p.id, 0]));
      let storeTruckKm = 0;
      for (const s of city.stores) {
        let kgIn = 0;
        for (const p of PRODUCTS) {
          // age stock
          for (const b of s.inv[p.id]) b.exp -= 1;
          const expiredAll = s.inv[p.id].filter((b) => b.exp <= 0).reduce((a, b) => a + b.q, 0);
          s.inv[p.id] = s.inv[p.id].filter((b) => b.exp > 0);
          // surplus rescue: food at the end of its sellable life goes to the community kitchen instead of the bin
          const rescued = cfg.rescue && perishable(p) && p.cat !== 'protein' ? expiredAll * 0.7 : 0;
          const expired = expiredAll - rescued;
          day.rescued += rescued;
          day.retailDiscard += expired; day.wasteCo2 += expired * p.co2; lossByStage.retail += expired;
          // forecast & order
          s.hist[p.id].push(salesToday[s.id][p.id]); if (s.hist[p.id].length > 7) s.hist[p.id].shift();
          const avg = s.hist[p.id].reduce((a, b) => a + b, 0) / s.hist[p.id].length;
          let robotShare = 0;
          if (cfg.demandSignals && s.kind === 'supermarket') {
            const homesHere = city.homes.filter((h) => h.community === s.community);
            const people = homesHere.reduce((a, h) => a + h.size, 0);
            robotShare = homesHere.filter((h) => h.robot).reduce((a, h) => a + h.size, 0) / Math.max(1, people);
          }
          const safety = perishable(p) ? s.safety : 0.15;
          const cover = perishable(p) ? 2 : 6;
          const target = avg * cover * (robotShare * 1.03 + (1 - robotShare) * (1 + safety));
          const order = Math.max(0, target - stock(s.inv[p.id]));
          if (order > 0) {
            const got = takeFifo(city.wholesale[p.id], order, 0);
            if (got > 0) s.inv[p.id].push({ q: got, exp: p.shelfRetail });
            s.inv[p.id].sort((a, b) => a.exp - b.exp);
            retailOrders[p.id] += order; kgIn += got;
          }
        }
        storeTruckKm += Math.max(1, Math.ceil(kgIn / 3000)) * 2 * cfg.wholesaleKm;
      }

      // refrigeration: chilled stock held in stores (before wholesale step below adds its own)
      for (const st2 of city.stores) for (const pid of ENERGY.chilled) day.coldKwh += stock(st2.inv[pid]) * ENERGY.coldKwhPerKgDay;
      // ---------- wholesale & farms ----------
      let farmTruckKm = 0;
      for (const p of PRODUCTS) {
        for (const b of city.wholesale[p.id]) b.exp -= 1;
        const expired = city.wholesale[p.id].filter((b) => b.exp <= 0).reduce((a, b) => a + b.q, 0);
        city.wholesale[p.id] = city.wholesale[p.id].filter((b) => b.exp > 0);
        day.wholesaleDiscard += expired; day.wasteCo2 += expired * p.co2; lossByStage.wholesale += expired;
        const f = city.farm[p.id];
        f.hist = f.hist || Array(7).fill(retailOrders[p.id]);
        f.hist.push(retailOrders[p.id]); if (f.hist.length > 7) f.hist.shift();
        const avg = f.hist.reduce((a, b) => a + b, 0) / f.hist.length;
        // demand signals only remove uncertainty for the share of demand they actually cover
        const wsSafety = 0.25 - (0.25 - 0.08) * coverage;
        const farmSafety = 0.2 - (0.2 - 0.06) * coverage;
        const want = Math.max(0, avg * (perishable(p) ? 2 : 6) * (1 + wsSafety) - stock(city.wholesale[p.id]));
        // farms produce to plan (+ yield noise), ship what wholesale wants, the rest of perishables is lost
        const harvest = (want > 0 ? want : avg) * (1 + farmSafety) * R.between(0.92, 1.08);
        produced += harvest;
        const handling = harvest * 0.05;
        const shipped = Math.min(harvest - handling, want);
        const unsold = perishable(p) ? Math.max(0, harvest - handling - shipped) : 0;
        if (shipped > 0) city.wholesale[p.id].push({ q: shipped, exp: p.shelfRetail + 1 });
        city.wholesale[p.id].sort((a, b) => a.exp - b.exp);
        day.farmLoss += handling + unsold; day.wasteCo2 += (handling + unsold) * p.co2; lossByStage.farm += handling + unsold;
        farmTruckKm += Math.ceil(shipped / 8000) * 2 * cfg.farmKm;
      }
      for (const pid of ENERGY.chilled) day.coldKwh += stock(city.wholesale[pid]) * ENERGY.coldKwhPerKgDay;
      lossByStage.household += day.householdWaste;
      day.truckKm = storeTruckKm + farmTruckKm;

      // ---------- garbage ----------
      day.garbage = day.householdWaste + day.packaging + day.retailDiscard + day.wholesaleDiscard;
      day.garbageTrucks = Math.ceil(day.garbage / 8000);
      day.garbageKm = day.garbageTrucks * 30;

      // ---------- traffic (BPR) ----------
      const foodVkm = day.carKm + day.vanKm + day.truckKm + day.garbageKm;
      day.foodVkm = foodVkm;
      const peakV = cfg.backgroundVkmPeak + foodVkm * 0.35;
      const vc = peakV / cfg.roadCapacity;
      day.vc = vc;
      day.peakSpeed = 40 / (1 + 0.15 * vc ** 4);
      day.vehicleCo2 = day.carKm * EF.car + day.vanKm * EF.van + day.truckKm * EF.truck + day.garbageKm * EF.garbage;
      day.gasM3 = day.gasKwh / ENERGY.gasKwhPerM3;
      day.fuelL = day.carKm * ENERGY.fuelLPerKm.car + day.vanKm * ENERGY.fuelLPerKm.van + day.truckKm * ENERGY.fuelLPerKm.truck + day.garbageKm * ENERGY.fuelLPerKm.garbage;
      day.fuelKwh = day.carKm * ENERGY.fuelLPerKm.car * ENERGY.fuelKwhPerL.car + (day.fuelL - day.carKm * ENERGY.fuelLPerKm.car) * 10;
      day.cookKwh = day.gasKwh + day.cookElecKwh + day.robotKwh;
      day.energyKwh = day.cookKwh + day.fuelKwh + day.coldKwh;
      day.cookCo2 = day.gasKwh * EF.gasKwh + (day.cookElecKwh + day.robotKwh + day.coldKwh) * EF.kwh;
      day.co2 = day.vehicleCo2 + day.cookCo2 + day.wasteCo2;
      day.mealsRescued = day.rescued / 0.45;
      lastSpeed = day.peakSpeed;
      if (d < WARMUP) continue;
      day.d = d - WARMUP + 1;
      series.push(roundAll(day));
      for (const k of Object.keys(totals)) totals[k] += day[k] || 0;
    }
    const people = city.homes.reduce((s, h) => s + h.size, 0);
    const robotPeople = city.homes.filter((h) => h.robot).reduce((s, h) => s + h.size, 0);
    out.cities.push({
      id: cfg.id, name: cfg.name, note: cfg.note, flags: { demandSignals: cfg.demandSignals, consolidated: cfg.consolidated, rescue: cfg.rescue, bulkPackaging: cfg.bulkPackaging },
      homes: city.homes.length, people, robotHomes: city.homes.filter((h) => h.robot).length, robotPeople,
      communities: cfg.communities.map((c) => {
        const s = comStats[c.id];
        const homes = city.homes.filter((h) => h.community === c.id);
        return {
          id: c.id, name: c.name, income: c.income, distKm: c.distKm, homes: homes.length, robotHomes: homes.filter((h) => h.robot).length, note: c.note,
          robot: perPerson(s.robot, days), trad: perPerson(s.trad, days)
        };
      }),
      series, totals: roundAll(totals), lossByStage: roundAll(lossByStage), produced: round(produced, 0)
    });
  }
  return out;
}

function blank() {
  return {
    householdWaste: 0, packaging: 0, retailDiscard: 0, wholesaleDiscard: 0, farmLoss: 0, garbage: 0, garbageTrucks: 0, garbageKm: 0,
    rescued: 0, mealsRescued: 0, attempts: 0, substitutions: 0, spend: 0, carKm: 0, vanKm: 0, truckKm: 0, foodVkm: 0, deliveries: 0, deliveryMin: 0, topUps: 0, bigShops: 0,
    stockouts: 0, robotShort: 0, cookKwh: 0, gasKwh: 0, gasM3: 0, cookElecKwh: 0, robotKwh: 0, fuelL: 0, fuelKwh: 0, coldKwh: 0, energyKwh: 0, elecKwh: 0, robotKwhHome: 0, humanHours: 0, vehicleCo2: 0, cookCo2: 0, wasteCo2: 0, co2: 0, peakSpeed: 0, vc: 0,
    foodWaste: 0, inedible: 0, inedibleWaste: 0, people: 0, homes: 0
  };
}
function perPerson(s, days) {
  const p = Math.max(1e-9, s.people);
  return { people: Math.round(s.people), homes: Math.round(s.homes), gasM3PerPersonMonth: round(s.gasKwh / ENERGY.gasKwhPerM3 / p, 2), stoveKwhPerPersonMonth: round((s.gasKwh + s.elecKwh) / p, 1), robotKwhPerPersonMonth: round(s.robotKwh / p, 1), cookKwhPerPersonMonth: round((s.gasKwh + s.elecKwh + s.robotKwh) / p, 1), wasteKgPerPersonMonth: round(s.foodWaste / p, 2), inedibleKgPerPersonMonth: round(s.inedible / p, 2), edibleWasteKgPerPersonMonth: round((s.foodWaste - s.inedible) / p, 2), spendPerPersonMonth: round(s.spend / p, 2), packagingKgPerPersonMonth: round(s.packaging / p, 2), wasteCo2PerPersonMonth: round(s.co2 / p, 2), days };
}
function roundAll(o) { return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'number' ? round(v, 2) : v])); }
