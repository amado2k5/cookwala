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
  function dryRun(recipe, device, opsVocab, humanPresent, allowModel) {
    const caps = device.capabilities || {};
    const ops = new Set((caps.ops || []).map((o) => o.op));
    const sensors = new Set();
    (caps.sensors || []).forEach((s) => { sensors.add(s.sensor); (s.visionCues || []).forEach((c) => sensors.add(c)); });
    const plan = [];
    for (const node of (recipe.process && recipe.process.nodes) || []) {
      const env = (opsVocab[node.op] || {}).envelope;
      const allowed = (node.assignment && node.assignment.allowed) || ['any'];
      if (!ops.has(node.op)) {
        if (humanPresent && (allowed.includes('human') || allowed.includes('any'))) { plan.push({ node, by: 'human', verifiedBy: 'human', env }); continue; }
        return { state: 'refused', refusal: { reason: 'missing_capability', node: node.id, detail: `the device cannot ${opLabel(node.op)} and no person is present to do it` }, plan, at: node };
      }
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
  global.CookwalaDryRun = { dryRun, ladderChoice, opLabel };
})(window);
