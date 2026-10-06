// Operation envelopes: trace check, sensor ladder, executor-side parameter check.
// Ports of tools/cookwala_ref.py (check_envelope, ladder_choice, check_node_params, trusted_sensors).
// `vocab` is {ops: {id: entry}, heatBands: {level: [min, max]}} built by opsIndex().

const finite = (x) => typeof x === 'number' && Number.isFinite(x);
const g = (n) => String(Number(n.toPrecision(12)));

export function opsIndex(opsDoc, unitsDoc) {
  const ops = Object.fromEntries(((opsDoc && opsDoc.entries) || []).map((e) => [e.id, e]));
  const heatBands = {};
  for (const e of (unitsDoc && unitsDoc.entries) || []) {
    if (e.surfaceTempC) heatBands[e.id.split('.').pop()] = [e.surfaceTempC.min, e.surfaceTempC.max];
  }
  return { ops, heatBands };
}

export function checkEnvelope(vocab, opId, readings, target = null, altitudeM = 0) {
  const op = vocab.ops[opId];
  if (!op) return { error: 'unknown_op' };
  const env = op.envelope;
  if (!env || !env.tempC) return { envelopeOk: true, targetOk: null, reason: 'no_thermal_envelope' };
  let lo = env.tempC.min, hi = env.tempC.max;
  if (env.medium === 'water' || env.medium === 'steam') { const s = altitudeM / 300; lo -= s; hi -= s; }
  if (target) {
    if (target.value < lo || target.value > hi) return { envelopeOk: false, targetOk: false, reason: 'target_outside_envelope' };
  }
  const temps = readings.map((r) => r.tempC);
  const firstIn = temps.findIndex((t) => t >= lo && t <= hi);
  if (firstIn < 0) return { envelopeOk: false, targetOk: target ? false : null, reason: 'never_reached_envelope' };
  const steady = temps.slice(firstIn);
  const envOk = steady.every((t) => t >= lo && t <= hi);
  let tgtOk = null;
  if (target) {
    const tol = target.tolerance ?? 0;
    const hit = steady.findIndex((t) => Math.abs(t - target.value) <= tol);
    tgtOk = hit >= 0 && steady.slice(hit).every((t) => Math.abs(t - target.value) <= tol);
  }
  const reason = envOk && (tgtOk === null || tgtOk === true) ? 'ok' : !envOk ? 'left_envelope' : 'missed_target';
  return { envelopeOk: envOk, targetOk: tgtOk, reason };
}

export function trustedSensors(capabilities, now) {
  const t = now ? new Date(now) : new Date();
  const out = new Set();
  for (const s of ((capabilities.capabilities || {}).sensors) || []) {
    if ((s.state || 'ok') !== 'ok') continue;
    const vu = s.calibration && s.calibration.validUntil;
    if (vu && t > new Date(vu)) continue;
    out.add(s.sensor);
    (s.visionCues || []).forEach((c) => out.add(c));
  }
  return out;
}

export function ladderChoice(vocab, opId, sensors, allowModel = true, humanPresent = false) {
  const env = (vocab.ops[opId] || {}).envelope || {};
  for (const rung of env.sensorLadder || ['time']) {
    if (rung === 'model' && allowModel) return 'model';
    if (rung === 'time') return 'time';
    if (rung === 'human' && humanPresent) return 'human';
    if (sensors.has(rung)) return rung;
  }
  return null;
}

export function checkNodeParams(vocab, opId, node, limits = null) {
  const env = (vocab.ops[opId] || {}).envelope || {};
  const params = node.params || {};
  const temps = [];
  for (const k of ['tempC', 'oilTempC']) if (k in params) temps.push([k, params[k]]);
  const tgt = params.target || node.target;
  if (tgt && typeof tgt === 'object' && 'value' in tgt && ['degC', 'C', undefined].includes(tgt.unit)) temps.push(['target', tgt.value]);
  for (const [k, t] of temps) if (!finite(t)) return ['envelope_out_of_range', `${k} is not a finite number`];
  const band = env.tempC;
  if (band) {
    for (const [k, t] of temps) {
      if (t < band.min || t > band.max) return ['envelope_out_of_range', `${k} ${g(t)} °C is outside the ${opId} envelope ${band.min}–${band.max} °C`];
    }
    const heat = params.heat;
    if (env.medium === 'pan_surface' && typeof heat === 'string') {
      const hb = vocab.heatBands[heat];
      if (hb && (hb[1] < band.min || hb[0] > band.max)) return ['envelope_out_of_range', `heat level ${heat} (pan ${hb[0]}–${hb[1]} °C) cannot hold the ${opId} envelope ${band.min}–${band.max} °C`];
    }
  }
  const pk = params.pressureKPa;
  if (pk !== undefined && pk !== null) {
    if (!finite(pk)) return ['envelope_out_of_range', 'pressureKPa is not a finite number'];
    const pb = env.pressureKPa;
    if (pb && (pk < pb.min || pk > pb.max)) return ['envelope_out_of_range', `pressure ${g(pk)} kPa is outside the ${opId} envelope ${pb.min}–${pb.max} kPa`];
  }
  for (const lim of (limits && limits.limits) || []) {
    const a = lim.appliesTo || {};
    if (a.ops && a.ops.length && !a.ops.includes(opId)) continue;
    if (a.medium && a.medium !== env.medium) continue;
    if (!(a.ops && a.ops.length) && !a.medium) continue;
    if (lim.kind === 'max_temp' && lim.unit === 'degC') {
      for (const [k, t] of temps) if (t > lim.max) return ['safety_limit', `${k} ${g(t)} °C exceeds local limit ${lim.id} (${lim.max} °C)`];
    }
    if (lim.kind === 'pressure' && pk !== undefined && pk !== null && pk > (lim.max ?? Infinity)) return ['safety_limit', `pressure ${g(pk)} kPa exceeds local limit ${lim.id} (${lim.max} kPa)`];
  }
  return null;
}
