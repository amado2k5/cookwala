// Runs every preset scenario headlessly, writes final Missions + findings to sim/out/ for validation.
import { mkdirSync, writeFileSync } from 'node:fs';
import { simulate, PRESETS } from './engine/sim.js';

const out = new URL('./out/', import.meta.url);
mkdirSync(out, { recursive: true });
const allFindings = new Map();
for (const [id, preset] of Object.entries(PRESETS)) {
  const run = simulate({ seed: 7, toggles: preset.toggles });
  writeFileSync(new URL(`${id}.mission.json`, out), JSON.stringify(run.mission, null, 1));
  for (const f of run.findings) allFindings.set(f.id, f);
  const s = run.summary;
  console.log(`${id.padEnd(10)} served ${s.servedAt}  result ${s.result.padEnd(16)} battery ${s.battery.toFixed(1)}%  used ${s.actualNeed}%  frames ${s.frames}  ledger ${s.ledger}  findings ${run.findings.length}`);
}
writeFileSync(new URL('findings.json', out), JSON.stringify([...allFindings.values()].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true })), null, 1));
console.log(`unique findings: ${allFindings.size}`);

// ---- city simulation presets (one month each) ----
const { simulateCities, CITY_PRESETS } = await import('./city/engine.js');
const cityRows = [];
for (const [id, preset] of Object.entries(CITY_PRESETS)) {
  const r = simulateCities({ seed: 11, days: 30, cities: preset.make() });
  const m = (c) => ({ city: c.name, robotHomes: c.robotHomes, householdWasteKgPerPerson: +(c.totals.householdWaste / c.people).toFixed(2), lossBeforeHomesT: +((c.totals.farmLoss + c.totals.wholesaleDiscard + c.totals.retailDiscard) / 1000).toFixed(1), garbageT: +(c.totals.garbage / 1000).toFixed(1), foodVkm: Math.round(c.totals.foodVkm), spendPerPerson: +(c.totals.spend / c.people).toFixed(0), co2T: +(c.totals.co2 / 1000).toFixed(1), mealsRescued: Math.round(c.totals.mealsRescued), gasM3: Math.round(c.totals.gasM3), robotKwh: Math.round(c.totals.robotKwh), fuelL: Math.round(c.totals.fuelL), coldKwh: Math.round(c.totals.coldKwh), energyMWh: +(c.totals.energyKwh / 1000).toFixed(1) });
  for (const c of r.cities) cityRows.push({ preset: id, ...m(c) });
}
console.table(cityRows);
writeFileSync(new URL('city-results.json', out), JSON.stringify(cityRows, null, 1));

// ---- country simulation presets (one year each) ----
const { simulateCountry, COUNTRY_PRESETS, METRICS } = await import('./country/engine.js');
const countryRows = [];
for (const [id, preset] of Object.entries(COUNTRY_PRESETS)) {
  const r = simulateCountry({ country: preset.make() });
  const row = { preset: id };
  for (const m of METRICS) {
    const S = r.annual.scenario[m.id]; const B = r.annual.baseline[m.id];
    row[m.id] = B ? `${(((S - B) / B) * 100).toFixed(1)}%` : `${(S * m.scale).toFixed(1)} ${m.unit}`;
  }
  countryRows.push(row);
}
console.table(countryRows);
writeFileSync(new URL('country-results.json', out), JSON.stringify(countryRows, null, 1));

// ---- world simulation (five years, every robot × protocol combination) ----
const { simulateAll, SCENARIOS, METRICS: WORLD_METRICS } = await import('./world/engine.js');
const worldAll = simulateAll(); const WB = worldAll['none-off'].world.total;
const worldRows = SCENARIOS.map((s) => {
  const T = worldAll[s.id].world.total; const row = { scenario: s.short };
  for (const m of WORLD_METRICS) row[m.id] = WB[m.id] ? `${(((T[m.id] - WB[m.id]) / WB[m.id]) * 100).toFixed(1)}%` : `${(T[m.id] * m.scale).toFixed(1)} ${m.unit}`;
  return row;
});
console.table(worldRows);
writeFileSync(new URL('world-results.json', out), JSON.stringify(worldRows, null, 1));
