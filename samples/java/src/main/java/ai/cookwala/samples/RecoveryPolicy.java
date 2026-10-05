package ai.cookwala.samples;

import java.util.Map;
import java.util.Set;

/**
 * What to do after a refusal, a pause, a failure or a dropped connection. The rules, in order of precedence:
 * <ol>
 * <li>Never retry around safety. A refusal for an allergen block, a recall, a mandate, a local safety limit, an envelope
 * or a hash mismatch is final for that request; nothing is relaxed.</li>
 * <li>A refusal about the device (missing capability, equipment or sensor; busy) may go to another device.</li>
 * <li>A refusal for a missing person may be retried only with a person actually present.</li>
 * <li>needs_human goes to a person; nobody answering means stop, never "carry on".</li>
 * <li>A failure or an unplanned stop after heat started means discard the food, report the incident anonymously, and
 * do not resume.</li>
 * <li>A dropped connection is retried with the same Idempotency-Key.</li>
 * </ol>
 */
public class RecoveryPolicy {
    public static final String TRY_NEXT_DEVICE = "try_next_device", ASK_PRESENCE = "ask_presence", GIVE_UP = "give_up", ASK_HUMAN = "ask_human",
            RESUME = "resume", STOP = "stop", DISCARD_AND_REPORT = "discard_and_report", RETRY = "retry";

    public static final Set<String> FINAL_REFUSALS = Set.of("allergen_block", "recipe_recalled", "mandate_scope", "not_authorized", "safety_limit",
            "envelope_out_of_range", "recipe_hash_mismatch", "unsupported_version", "x-gate-error");
    public static final Set<String> DEVICE_REFUSALS = Set.of("missing_capability", "missing_equipment", "missing_sensor_no_fallback", "busy");

    public final int maxTransportRetries;
    public final double backoffS;
    public final int maxTicks;

    public RecoveryPolicy(int maxTransportRetries, double backoffS, int maxTicks) {
        this.maxTransportRetries = maxTransportRetries;
        this.backoffS = backoffS;
        this.maxTicks = maxTicks;
    }

    /** 4 transport retries, 0.5 s backoff, 500 polls. */
    public RecoveryPolicy() { this(4, 0.5, 500); }

    public RecoveryAction onRefusal(Map<String, Object> refusal, boolean humanPresent, boolean devicesLeft) {
        String reason = refusal == null ? null : Py.str(refusal, "reason");
        if (reason == null || FINAL_REFUSALS.contains(reason)) {
            return new RecoveryAction(GIVE_UP, reason, "final for this request; nothing is relaxed or substituted");
        }
        if (reason.equals("needs_human_present")) {
            return humanPresent ? new RecoveryAction(GIVE_UP, reason, "a person is needed and none is present")
                    : new RecoveryAction(ASK_PRESENCE, reason, "ask a person to be present, then retry the same device");
        }
        if (DEVICE_REFUSALS.contains(reason) && devicesLeft) return new RecoveryAction(TRY_NEXT_DEVICE, reason, "another device may have the capability");
        return new RecoveryAction(GIVE_UP, reason, "no other device can take it");
    }

    public RecoveryAction onNeedsHuman(Map<String, Object> status, Human human) {
        String why = Py.str(Py.obj(status, "humanNeeded"), "why", "a person is needed");
        if (human != null && human.attend(Py.pyStr(status.get("id")), why)) return new RecoveryAction(RESUME, "needs_human", why);
        return new RecoveryAction(STOP, "needs_human", "nobody answered: " + why);
    }

    /** After a final state: what happens to the food and whether to report. Null when nothing is needed. */
    public RecoveryAction onEnd(Map<String, Object> status, Map<String, Object> log) {
        String state = Py.pyStr(status.get("state"));
        Map<String, Object> l = log == null ? Map.of() : log;
        boolean safetyEvents = Py.truthy(l.get("safetyEvents"));
        boolean heated = Py.truthy(l.get("x-heatStarted")) || safetyEvents;
        if (state.equals("failed") || (state.equals("stopped") && safetyEvents)) {
            return new RecoveryAction(DISCARD_AND_REPORT, state, heated ? "cooking ended early after heat started: discard, do not serve; report anonymously"
                    : "ended before heat: ingredients may be kept if they stayed chilled; report anonymously", 0, Py.map("discard", heated));
        }
        if (state.equals("stopped") && heated) {
            return new RecoveryAction(DISCARD_AND_REPORT, state, "stopped after heat started: discard, do not serve", 0, Py.map("discard", true, "report", false));
        }
        return null;
    }

    public RecoveryAction onTransportError(int attempt) {
        if (attempt >= maxTransportRetries) return new RecoveryAction(GIVE_UP, "unreachable", "gave up after " + attempt + " attempts");
        return new RecoveryAction(RETRY, "unreachable", "same Idempotency-Key, so a request that already landed is not repeated", backoffS * Math.pow(2, attempt), null);
    }

    public RecoveryAction onStall(Map<String, Object> status) {
        return new RecoveryAction(STOP, "stalled", "no final state after " + maxTicks + " polls in " + Py.pyStr(status.get("state")));
    }
}
