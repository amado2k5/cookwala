// Sample recovery: what to do after a refusal, a pause, a failure or a dropped connection.
//
// The rules, in order of precedence:
// 1. Never retry around safety. A refusal for an allergen block, a recall, a mandate, a local
//    safety limit, an envelope or a hash mismatch is final for that request; nothing is relaxed.
// 2. A refusal about the device (missing capability, equipment or sensor; busy) may go to another device.
// 3. A refusal for a missing person may be retried only with a person actually present.
// 4. needs_human goes to a person; nobody answering means stop, never "carry on".
// 5. A failure or an unplanned stop after heat started means discard the food, report the incident
//    anonymously, and do not resume.
// 6. A dropped connection is retried with the same Idempotency-Key; stop is retried until it lands.

export const FINAL_REFUSALS = new Set(['allergen_block', 'recipe_recalled', 'mandate_scope', 'not_authorized', 'safety_limit', 'envelope_out_of_range',
  'recipe_hash_mismatch', 'unsupported_version', 'x-gate-error']);
export const DEVICE_REFUSALS = new Set(['missing_capability', 'missing_equipment', 'missing_sensor_no_fallback', 'busy']);

export const TRY_NEXT_DEVICE = 'try_next_device';
export const ASK_PRESENCE = 'ask_presence';
export const GIVE_UP = 'give_up';
export const ASK_HUMAN = 'ask_human';
export const RESUME = 'resume';
export const STOP = 'stop';
export const DISCARD_AND_REPORT = 'discard_and_report';
export const RETRY = 'retry';

export class RecoveryAction {
  constructor(kind, reason = null, detail = null, { waitS = 0, extra = {} } = {}) {
    Object.assign(this, { kind, reason, detail, waitS, extra });
  }

  asDict() {
    const d = { action: this.kind };
    for (const k of ['reason', 'detail']) if (this[k]) d[k] = this[k];
    if (this.waitS) d.waitS = this.waitS;
    Object.assign(d, this.extra);
    return d;
  }
}

export class RecoveryPolicy {
  constructor({ maxTransportRetries = 4, backoffS = 0.5, maxTicks = 500 } = {}) {
    this.maxTransportRetries = maxTransportRetries;
    this.backoffS = backoffS;
    this.maxTicks = maxTicks;
  }

  onRefusal(refusal, humanPresent, devicesLeft) {
    const reason = (refusal || {}).reason ?? null;
    if (reason === null || FINAL_REFUSALS.has(reason)) return new RecoveryAction(GIVE_UP, reason, 'final for this request; nothing is relaxed or substituted');
    if (reason === 'needs_human_present') {
      return humanPresent ? new RecoveryAction(GIVE_UP, reason, 'a person is needed and none is present')
        : new RecoveryAction(ASK_PRESENCE, reason, 'ask a person to be present, then retry the same device');
    }
    if (DEVICE_REFUSALS.has(reason) && devicesLeft) return new RecoveryAction(TRY_NEXT_DEVICE, reason, 'another device may have the capability');
    return new RecoveryAction(GIVE_UP, reason, 'no other device can take it');
  }

  async onNeedsHuman(status, human) {
    const why = (status.humanNeeded || {}).why ?? 'a person is needed';
    if (human !== null && human !== undefined && (await human.attend(status.id, why))) return new RecoveryAction(RESUME, 'needs_human', why);
    return new RecoveryAction(STOP, 'needs_human', `nobody answered: ${why}`);
  }

  /** After a final state: decide what happens to the food and whether to report. */
  onEnd(status, log) {
    const state = status.state;
    const l = log || {};
    const events = l.safetyEvents && l.safetyEvents.length ? l.safetyEvents : null;
    const heated = Boolean(l['x-heatStarted'] || events);
    if (state === 'failed' || (state === 'stopped' && events)) {
      return new RecoveryAction(DISCARD_AND_REPORT, state, heated ? 'cooking ended early after heat started: discard, do not serve; report anonymously'
        : 'ended before heat: ingredients may be kept if they stayed chilled; report anonymously', { extra: { discard: heated } });
    }
    if (state === 'stopped' && heated) {
      return new RecoveryAction(DISCARD_AND_REPORT, state, 'stopped after heat started: discard, do not serve', { extra: { discard: true, report: false } });
    }
    return null;
  }

  onTransportError(attempt) {
    if (attempt >= this.maxTransportRetries) return new RecoveryAction(GIVE_UP, 'unreachable', `gave up after ${attempt} attempts`);
    return new RecoveryAction(RETRY, 'unreachable', 'same Idempotency-Key, so a request that already landed is not repeated', { waitS: this.backoffS * 2 ** attempt });
  }

  onStall(status) {
    return new RecoveryAction(STOP, 'stalled', `no final state after ${this.maxTicks} polls in ${status.state}`);
  }
}
