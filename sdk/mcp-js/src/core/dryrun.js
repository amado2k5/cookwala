// Core 0.2 dry run: can this device cook this recipe? Nothing is executed.
// Port of tools/cookwala_ref.py dry_run; same result shape (state, refusal, plan).
import { checkNodeParams, ladderChoice, trustedSensors } from './envelope.js';

export function dryRun(vocab, recipe, capabilities, { humanPresent = false, allowModel = true, limits = null, now = null } = {}) {
  const caps = capabilities.capabilities || {};
  const ops = new Set((caps.ops || []).map((o) => o.op).filter((id) => ((vocab.ops[id] || {}).executable) !== false));
  const sensors = trustedSensors(capabilities, now);
  const plan = [];
  for (const node of ((recipe.process || {}).nodes) || []) {
    const op = node.op;
    const allowed = ((node.assignment || {}).allowed) || ['any'];
    if (!ops.has(op)) {
      if (humanPresent && (allowed.includes('human') || allowed.includes('any'))) { plan.push({ node: node.id, op, by: 'human', verifiedBy: 'human' }); continue; }
      return { state: 'refused', refusal: { reason: 'missing_capability', node: node.id, detail: `device cannot perform ${op} and no person is present to do it` }, plan };
    }
    const bad = checkNodeParams(vocab, op, node, limits);
    if (bad) return { state: 'refused', refusal: { reason: bad[0], node: node.id, detail: bad[1] }, plan };
    const env = (vocab.ops[op] || {}).envelope || {};
    const hasEnv = Object.keys(env).length > 0;
    if (hasEnv && env.unattended === false && !humanPresent) {
      return { state: 'refused', refusal: { reason: 'needs_human_present', node: node.id, detail: `${op} may not run unattended` }, plan };
    }
    const rung = hasEnv ? ladderChoice(vocab, op, sensors, allowModel, humanPresent) : 'time';
    if (rung === null) return { state: 'refused', refusal: { reason: 'missing_sensor_no_fallback', node: node.id, detail: `no way to verify ${op} on this device` }, plan };
    plan.push({ node: node.id, op, by: 'device', verifiedBy: /^(cw\.|x-)/.test(rung) ? 'sensor' : rung, rung });
  }
  return { state: 'accepted', plan };
}
