using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Nodes;

namespace Cookwala.Samples
{
    /// <summary>What to do next: one of the <see cref="RecoveryPolicy"/> action kinds, with why.</summary>
    public class RecoveryAction
    {
        public const string TryNextDevice = "try_next_device", AskPresence = "ask_presence", GiveUp = "give_up", AskHuman = "ask_human",
                            Resume = "resume", Stop = "stop", DiscardAndReport = "discard_and_report", Retry = "retry";

        public string Kind { get; }
        public string? Reason { get; }
        public string? Detail { get; }
        public double WaitS { get; }
        public JsonObject Extra { get; }

        public RecoveryAction(string kind, string? reason = null, string? detail = null, double waitS = 0, JsonObject? extra = null)
        {
            Kind = kind; Reason = reason; Detail = detail; WaitS = waitS;
            Extra = extra ?? new JsonObject();
        }

        /// <summary>True when Extra[key] is truthy, or the default when the key is absent.</summary>
        public bool Flag(string key, bool dflt = false) => Extra.ContainsKey(key) ? J.Truthy(Extra[key]) : dflt;

        public JsonObject AsDict()
        {
            var d = new JsonObject { ["action"] = Kind };
            if (!string.IsNullOrEmpty(Reason)) d["reason"] = Reason;
            if (!string.IsNullOrEmpty(Detail)) d["detail"] = Detail;
            if (WaitS != 0) d["waitS"] = WaitS;
            foreach (var kv in Extra) d[kv.Key] = kv.Value?.DeepClone();
            return d;
        }
    }

    /// <summary>
    /// What to do after a refusal, a pause, a failure or a dropped connection. In order of precedence:
    /// 1. Never retry around safety: an allergen block, a recall, a mandate, a local safety limit, an envelope or a hash
    ///    mismatch is final for that request; nothing is relaxed.
    /// 2. A refusal about the device (missing capability, equipment or sensor; busy) may go to another device.
    /// 3. A refusal for a missing person may be retried only with a person actually present.
    /// 4. needs_human goes to a person; nobody answering means stop, never "carry on".
    /// 5. A failure or an unplanned stop after heat started means discard the food, report anonymously, do not resume.
    /// 6. A dropped connection is retried with the same Idempotency-Key; stop is retried until it lands.
    /// </summary>
    public class RecoveryPolicy
    {
        public static readonly ISet<string> FinalRefusals = new HashSet<string>
        {
            "allergen_block", "recipe_recalled", "mandate_scope", "not_authorized", "safety_limit", "envelope_out_of_range",
            "recipe_hash_mismatch", "unsupported_version", "x-gate-error",
        };

        public static readonly ISet<string> DeviceRefusals = new HashSet<string> { "missing_capability", "missing_equipment", "missing_sensor_no_fallback", "busy" };

        public int MaxTransportRetries { get; }
        public double BackoffS { get; }
        public int MaxTicks { get; }

        public RecoveryPolicy(int maxTransportRetries = 4, double backoffS = 0.5, int maxTicks = 500)
        {
            MaxTransportRetries = maxTransportRetries; BackoffS = backoffS; MaxTicks = maxTicks;
        }

        public RecoveryAction OnRefusal(JsonObject? refusal, bool humanPresent, bool devicesLeft)
        {
            var reason = J.S(refusal, "reason");
            if (reason == null || FinalRefusals.Contains(reason))
                return new RecoveryAction(RecoveryAction.GiveUp, reason, "final for this request; nothing is relaxed or substituted");
            if (reason == "needs_human_present")
                return humanPresent ? new RecoveryAction(RecoveryAction.GiveUp, reason, "a person is needed and none is present")
                                    : new RecoveryAction(RecoveryAction.AskPresence, reason, "ask a person to be present, then retry the same device");
            if (DeviceRefusals.Contains(reason) && devicesLeft)
                return new RecoveryAction(RecoveryAction.TryNextDevice, reason, "another device may have the capability");
            return new RecoveryAction(RecoveryAction.GiveUp, reason, "no other device can take it");
        }

        public RecoveryAction OnNeedsHuman(JsonObject status, IHuman? human)
        {
            var why = J.S(J.O(status, "humanNeeded"), "why") ?? "a person is needed";
            if (human != null && human.Attend(J.PyStr(J.Get(status, "id")), why)) return new RecoveryAction(RecoveryAction.Resume, "needs_human", why);
            return new RecoveryAction(RecoveryAction.Stop, "needs_human", $"nobody answered: {why}");
        }

        /// <summary>After a final state: decide what happens to the food and whether to report.</summary>
        public RecoveryAction? OnEnd(JsonObject status, JsonObject? log)
        {
            var state = J.S(status, "state");
            var safety = J.Truthy(J.Get(log, "safetyEvents"));
            var heated = J.Truthy(J.Get(log, "x-heatStarted")) || safety;
            if (state == "failed" || (state == "stopped" && safety))
                return new RecoveryAction(RecoveryAction.DiscardAndReport, state,
                    heated ? "cooking ended early after heat started: discard, do not serve; report anonymously"
                           : "ended before heat: ingredients may be kept if they stayed chilled; report anonymously",
                    extra: new JsonObject { ["discard"] = heated });
            if (state == "stopped" && heated)
                return new RecoveryAction(RecoveryAction.DiscardAndReport, state, "stopped after heat started: discard, do not serve",
                    extra: new JsonObject { ["discard"] = true, ["report"] = false });
            return null;
        }

        public RecoveryAction OnTransportError(int attempt)
        {
            if (attempt >= MaxTransportRetries) return new RecoveryAction(RecoveryAction.GiveUp, "unreachable", $"gave up after {attempt} attempts");
            return new RecoveryAction(RecoveryAction.Retry, "unreachable", "same Idempotency-Key, so a request that already landed is not repeated",
                waitS: BackoffS * Math.Pow(2, attempt));
        }

        public RecoveryAction OnStall(JsonObject status) =>
            new RecoveryAction(RecoveryAction.Stop, "stalled", $"no final state after {MaxTicks} polls in {J.S(status, "state")}");
    }
}
