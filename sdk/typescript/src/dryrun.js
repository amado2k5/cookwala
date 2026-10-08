/* Cookwala Core 0.2 dry run, browser port of tools/cookwala_ref.py (ladder_choice, dry_run).
   Pure functions; no network. Keep in step with the Python reference. */
(function (global) {
  function ladderChoice(env, sensors, allowModel, humanPresent) {
    const ladder = (env && env.sensorLadder) || ['time'];
    for (const rung of ladder) {
      if (rung === 'model' && allowModel) return 'model';
      if (rung === 'time') return 'time';
      if (rung === 'human' && humanPresent) return 'human';
      if (sensors.has(rung)) return rung;
    }
    return null;
  }
  const finite = (x) => typeof x === 'number' && Number.isFinite(x);
  // Executor-side numbers check (mirror of check_node_params). heatBands: {level: [min, max]} from vocab/units.json, optional.
  function checkNodeParams(opId, node, opsVocab, limits, heatBands) {
    const env = (opsVocab[opId] || {}).envelope || {};
    const params = node.params || {};
    const temps = [];
    for (const key of ['tempC', 'oilTempC']) if (key in params) temps.push([key, params[key]]);
    const tgt = params.target || node.target;
    if (tgt && typeof tgt === 'object' && 'value' in tgt && ['degC', 'C', undefined].includes(tgt.unit)) temps.push(['target', tgt.value]);
    for (const [key, t] of temps) if (!finite(t)) return ['envelope_out_of_range', `${key} is not a finite number`];
    const band = env.tempC;
    if (band) {
      for (const [key, t] of temps) if (t < band.min || t > band.max) return ['envelope_out_of_range', `${key} ${t} °C is outside the ${opLabel(opId)} envelope ${band.min}–${band.max} °C`];
      const hb = heatBands && env.medium === 'pan_surface' && typeof params.heat === 'string' ? heatBands[params.heat] : null;
      if (hb && (hb[1] < band.min || hb[0] > band.max)) return ['envelope_out_of_range', `heat level ${params.heat} cannot hold the ${opLabel(opId)} envelope ${band.min}–${band.max} °C`];
    }
    for (const lim of (limits && limits.limits) || []) {
      const a = lim.appliesTo || {};
      if (a.ops && !a.ops.includes(opId)) continue;
      if (a.medium && a.medium !== env.medium) continue;
      if (!a.ops && !a.medium) continue;
      if (lim.kind === 'max_temp' && lim.unit === 'degC') for (const [key, t] of temps) if (t > lim.max) return ['safety_limit', `${key} ${t} °C exceeds local limit ${lim.id} (${lim.max} °C)`];
    }
    return null;
  }
  // RFC-0011: only healthy sensors with unexpired calibration may satisfy a rung (mirror of trusted_sensors)
  const RFC3339 = /^\d{4}-\d{2}-\d{2}[Tt ]\d{2}:\d{2}:\d{2}(\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/;
  const parseTime = (s) => (typeof s === 'string' && RFC3339.test(s) ? Date.parse(s.toUpperCase().replace(' ', 'T')) : NaN);
  function trustedSensors(device, now) {
    const t = now ? parseTime(now) : Date.now();
    if (!Number.isFinite(t)) throw new RangeError('invalid_timestamp');
    const sensors = new Set();
    ((device.capabilities || {}).sensors || []).forEach((s) => {
      if ((s.state || 'ok') !== 'ok') return;
      const vu = s.calibration && s.calibration.validUntil;
      if (vu) { const u = parseTime(vu); if (!Number.isFinite(u) || t > u) return; } // unreadable calibration date: not trusted
      sensors.add(s.sensor); (s.visionCues || []).forEach((c) => sensors.add(c));
    });
    return sensors;
  }
  function dryRun(recipe, device, opsVocab, humanPresent, allowModel, limits, heatBands, now) {
    const caps = device.capabilities || {};
    const ops = new Set((caps.ops || []).map((o) => o.op).filter((id) => (opsVocab[id] || {}).executable !== false));
    const sensors = trustedSensors(device, now);
    const plan = [];
    for (const node of (recipe.process && recipe.process.nodes) || []) {
      const env = (opsVocab[node.op] || {}).envelope;
      const allowed = (node.assignment && node.assignment.allowed) || ['any'];
      if (!ops.has(node.op)) {
        if (humanPresent && (allowed.includes('human') || allowed.includes('any'))) { plan.push({ node, by: 'human', verifiedBy: 'human', env }); continue; }
        return { state: 'refused', refusal: { reason: 'missing_capability', node: node.id, detail: `the device cannot ${opLabel(node.op)} and no person is present to do it` }, plan, at: node };
      }
      const bad = checkNodeParams(node.op, node, opsVocab, limits, heatBands);
      if (bad) return { state: 'refused', refusal: { reason: bad[0], node: node.id, detail: bad[1] }, plan, at: node };
      if (env && env.unattended === false && !humanPresent) {
        return { state: 'refused', refusal: { reason: 'needs_human_present', node: node.id, detail: `${opLabel(node.op)} may not run unattended` }, plan, at: node };
      }
      const rung = env ? ladderChoice(env, sensors, allowModel, humanPresent) : 'time';
      if (rung === null) {
        return { state: 'refused', refusal: { reason: 'missing_sensor_no_fallback', node: node.id, detail: `nothing on this device can check that "${opLabel(node.op)}" is safe and done` }, plan, at: node };
      }
      plan.push({ node, by: 'device', verifiedBy: /^(cw|x-)/.test(rung) ? 'sensor' : rung, rung, env });
    }
    return { state: 'accepted', plan };
  }
  function opLabel(id) { return id.split('.').pop().replace(/_/g, ' '); }
  global.CookwalaDryRun = { dryRun, ladderChoice, checkNodeParams, trustedSensors, opLabel };
})(window);
