"""Sample recovery: what to do after a refusal, a pause, a failure or a dropped connection.

The rules, in order of precedence:
1. Never retry around safety. A refusal for an allergen block, a recall, a mandate, a local
   safety limit, an envelope or a hash mismatch is final for that request; nothing is relaxed.
2. A refusal about the device (missing capability, equipment or sensor; busy) may go to another device.
3. A refusal for a missing person may be retried only with a person actually present.
4. needs_human goes to a person; nobody answering means stop, never "carry on".
5. A failure or an unplanned stop after heat started means discard the food, report the incident
   anonymously, and do not resume.
6. A dropped connection is retried with the same Idempotency-Key; stop is retried until it lands.
"""
from dataclasses import dataclass, field

__all__ = ['RecoveryAction', 'RecoveryPolicy', 'FINAL_REFUSALS', 'DEVICE_REFUSALS']

FINAL_REFUSALS = {'allergen_block', 'recipe_recalled', 'mandate_scope', 'not_authorized', 'safety_limit', 'envelope_out_of_range',
                  'recipe_hash_mismatch', 'unsupported_version', 'x-gate-error'}
DEVICE_REFUSALS = {'missing_capability', 'missing_equipment', 'missing_sensor_no_fallback', 'busy'}

TRY_NEXT_DEVICE, ASK_PRESENCE, GIVE_UP, ASK_HUMAN, RESUME, STOP, DISCARD_AND_REPORT, RETRY = (
    'try_next_device', 'ask_presence', 'give_up', 'ask_human', 'resume', 'stop', 'discard_and_report', 'retry')


@dataclass
class RecoveryAction:
    kind: str
    reason: str = None
    detail: str = None
    wait_s: float = 0
    extra: dict = field(default_factory=dict)

    def as_dict(self):
        d = {'action': self.kind}
        for k in ('reason', 'detail'):
            if getattr(self, k): d[k] = getattr(self, k)
        if self.wait_s: d['waitS'] = self.wait_s
        d.update(self.extra)
        return d


class RecoveryPolicy:
    def __init__(self, max_transport_retries=4, backoff_s=0.5, max_ticks=500):
        self.max_transport_retries, self.backoff_s, self.max_ticks = max_transport_retries, backoff_s, max_ticks

    def on_refusal(self, refusal, human_present, devices_left):
        reason = (refusal or {}).get('reason')
        if reason in FINAL_REFUSALS or reason is None:
            return RecoveryAction(GIVE_UP, reason, 'final for this request; nothing is relaxed or substituted')
        if reason == 'needs_human_present':
            return RecoveryAction(GIVE_UP, reason, 'a person is needed and none is present') if human_present else \
                RecoveryAction(ASK_PRESENCE, reason, 'ask a person to be present, then retry the same device')
        if reason in DEVICE_REFUSALS and devices_left:
            return RecoveryAction(TRY_NEXT_DEVICE, reason, 'another device may have the capability')
        return RecoveryAction(GIVE_UP, reason, 'no other device can take it')

    def on_needs_human(self, status, human):
        why = (status.get('humanNeeded') or {}).get('why', 'a person is needed')
        if human is not None and human.attend(status['id'], why):
            return RecoveryAction(RESUME, 'needs_human', why)
        return RecoveryAction(STOP, 'needs_human', f'nobody answered: {why}')

    def on_end(self, status, log):
        """After a final state: decide what happens to the food and whether to report."""
        state = status['state']
        heated = bool((log or {}).get('x-heatStarted') or (log or {}).get('safetyEvents'))
        if state == 'failed' or (state == 'stopped' and (log or {}).get('safetyEvents')):
            return RecoveryAction(DISCARD_AND_REPORT, state, 'cooking ended early after heat started: discard, do not serve; report anonymously' if heated else
                                  'ended before heat: ingredients may be kept if they stayed chilled; report anonymously', extra={'discard': heated})
        if state == 'stopped' and heated:
            return RecoveryAction(DISCARD_AND_REPORT, state, 'stopped after heat started: discard, do not serve', extra={'discard': True, 'report': False})
        return None

    def on_transport_error(self, attempt):
        if attempt >= self.max_transport_retries:
            return RecoveryAction(GIVE_UP, 'unreachable', f'gave up after {attempt} attempts')
        return RecoveryAction(RETRY, 'unreachable', 'same Idempotency-Key, so a request that already landed is not repeated', wait_s=self.backoff_s * 2 ** attempt)

    def on_stall(self, status):
        return RecoveryAction(STOP, 'stalled', f"no final state after {self.max_ticks} polls in {status['state']}")
