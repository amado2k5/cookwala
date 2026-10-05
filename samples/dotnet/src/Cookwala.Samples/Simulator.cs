using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json.Nodes;

namespace Cookwala.Samples
{
    /// <summary>
    /// The dry run (a port of tools/cookwala_ref.py <c>dry_run</c>, <c>check_node_params</c>, <c>ladder_choice</c> and
    /// <c>trusted_sensors</c>) working from the bundled vocabulary, plus the execution state machine.
    /// </summary>
    public static class Simulator
    {
        /// <summary>Final execution states.</summary>
        public static readonly ISet<string> Final = new HashSet<string> { "refused", "stopped", "completed", "failed" };

        /// <summary>Legal state transitions (Core section 4).</summary>
        public static readonly IReadOnlyDictionary<string, string[]> Transitions = new Dictionary<string, string[]>
        {
            ["accepted"] = new[] { "preparing", "refused", "stopped" },
            ["preparing"] = new[] { "running", "needs_human", "stopping", "failed" },
            ["running"] = new[] { "paused", "needs_human", "stopping", "completed", "failed" },
            ["paused"] = new[] { "running", "stopping" },
            ["needs_human"] = new[] { "running", "stopping", "failed" },
            ["stopping"] = new[] { "stopped" },
        };

        /// <summary>True when <paramref name="from"/> → <paramref name="to"/> is a legal transition.</summary>
        public static bool TransitionAllowed(string from, string to) => Transitions.TryGetValue(from, out var t) && t.Contains(to);

        /// <summary>An ISO 8601 instant ("2026-10-05T00:00:00Z").</summary>
        public static DateTimeOffset Time(string s) => DateTimeOffset.Parse(s, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal);

        /// <summary>The instant as <c>yyyy-MM-ddTHH:mm:ssZ</c>.</summary>
        public static string Iso(DateTimeOffset t) => t.UtcDateTime.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture);

        private static bool Finite(JsonNode? x) => J.Num(x) is double d && double.IsFinite(d);

        /// <summary>Sensors that may satisfy a ladder rung (RFC-0011): state ok and calibration not expired.</summary>
        public static HashSet<string> TrustedSensors(JsonObject capabilities, string? now = null)
        {
            var t = now != null ? Time(now) : DateTimeOffset.UtcNow;
            var outSet = new HashSet<string>(StringComparer.Ordinal);
            foreach (var s in J.Items(J.O(capabilities, "capabilities"), "sensors"))
            {
                if ((J.S(s, "state") ?? "ok") != "ok") continue;
                var vu = J.S(J.O(s, "calibration"), "validUntil");
                if (!string.IsNullOrEmpty(vu) && t > Time(vu)) continue;
                if (J.S(s, "sensor") is string name) outSet.Add(name);
                foreach (var c in J.Strings(s, "visionCues")) outSet.Add(c);
            }
            return outSet;
        }

        /// <summary>The first rung of the operation's sensor ladder this device can use, or null.</summary>
        public static string? LadderChoice(string opId, ISet<string> sensors, bool allowModel = true, bool humanPresent = false, JsonObject? ops = null)
        {
            var env = J.O(J.O(ops ?? Bundle.Ops, opId), "envelope");
            var ladder = J.Has(env, "sensorLadder") ? J.Strings(env, "sensorLadder") : new List<string> { "time" };
            foreach (var rung in ladder)
            {
                if (rung == "model" && allowModel) return "model";
                if (rung == "time") return "time";
                if (rung == "human" && humanPresent) return "human";
                if (sensors.Contains(rung)) return rung;
            }
            return null;
        }

        /// <summary>(reason, detail) when a step's numbers break the envelope or a local limit, else null.</summary>
        public static (string Reason, string Detail)? CheckNodeParams(string opId, JsonObject node, JsonObject? limits = null, JsonObject? ops = null, JsonObject? heatBands = null)
        {
            ops ??= Bundle.Ops;
            heatBands ??= Bundle.HeatBands;
            var env = J.O(J.O(ops, opId), "envelope") ?? new JsonObject();
            var prm = J.Truthy(J.Get(node, "params")) ? J.O(node, "params") ?? new JsonObject() : new JsonObject();
            var temps = new List<(string Key, JsonNode? Value)>();
            foreach (var k in new[] { "tempC", "oilTempC" })
                if (prm.ContainsKey(k)) temps.Add((k, prm[k]));
            var tgt = J.Truthy(J.Get(prm, "target")) ? J.Get(prm, "target") : J.Get(node, "target");
            if (tgt is JsonObject to && to.ContainsKey("value"))
            {
                var unit = J.Has(to, "unit") ? J.S(to, "unit") : "degC";
                if (unit == "degC" || unit == "C") temps.Add(("target", to["value"]));
            }
            foreach (var (key, t) in temps)
                if (!Finite(t)) return ("envelope_out_of_range", $"{key} is not a finite number");
            var band = J.O(env, "tempC");
            if (J.Truthy(band))
            {
                double bmin = J.Num(band!["min"]) ?? double.NegativeInfinity, bmax = J.Num(band["max"]) ?? double.PositiveInfinity;
                foreach (var (key, tn) in temps)
                {
                    var t = J.Num(tn)!.Value;
                    if (t < bmin || t > bmax)
                        return ("envelope_out_of_range", $"{key} {J.PyG(t)} °C is outside the {opId} envelope {J.PyNum(band["min"])}–{J.PyNum(band["max"])} °C");
                }
                var heat = J.S(prm, "heat");
                if (J.S(env, "medium") == "pan_surface" && heat != null && J.O(heatBands, heat) is JsonObject hb)
                {
                    if (J.Num(hb["max"]) < bmin || J.Num(hb["min"]) > bmax)
                        return ("envelope_out_of_range", $"heat level {heat} (pan {J.PyNum(hb["min"])}–{J.PyNum(hb["max"])} °C) cannot hold the {opId} envelope {J.PyNum(band["min"])}–{J.PyNum(band["max"])} °C");
                }
            }
            var pkNode = J.Get(prm, "pressureKPa");
            double? pk = null;
            if (pkNode != null)
            {
                if (!Finite(pkNode)) return ("envelope_out_of_range", "pressureKPa is not a finite number");
                pk = J.Num(pkNode);
                var pb = J.O(env, "pressureKPa");
                if (J.Truthy(pb) && (pk < J.Num(pb!["min"]) || pk > J.Num(pb["max"])))
                    return ("envelope_out_of_range", $"pressure {J.PyG(pk!.Value)} kPa is outside the {opId} envelope {J.PyNum(pb["min"])}–{J.PyNum(pb["max"])} kPa");
            }
            foreach (var lim in J.Items(limits, "limits"))
            {
                var applies = J.O(lim, "appliesTo") ?? new JsonObject();
                var aops = J.Get(applies, "ops");
                var amedium = J.Get(applies, "medium");
                if (J.Truthy(aops) && !J.Strings(applies, "ops").Contains(opId)) continue;
                if (J.Truthy(amedium) && J.S(applies, "medium") != J.S(env, "medium")) continue;
                if (!J.Truthy(aops) && !J.Truthy(amedium)) continue;
                if (J.S(lim, "kind") == "max_temp" && J.S(lim, "unit") == "degC")
                {
                    foreach (var (key, tn) in temps)
                    {
                        var t = J.Num(tn)!.Value;
                        if (t > J.Num(J.Get(lim, "max")))
                            return ("safety_limit", $"{key} {J.PyG(t)} °C exceeds local limit {J.S(lim, "id")} ({J.PyNum(J.Get(lim, "max"))} °C)");
                    }
                }
                if (J.S(lim, "kind") == "pressure" && pk != null && pk > (J.Num(J.Get(lim, "max")) ?? double.PositiveInfinity))
                    return ("safety_limit", $"pressure {J.PyG(pk.Value)} kPa exceeds local limit {J.S(lim, "id")} ({J.PyNum(J.Get(lim, "max"))} kPa)");
            }
            return null;
        }

        private static JsonObject Refusal(string reason, string node, string detail) =>
            new JsonObject { ["reason"] = reason, ["node"] = node, ["detail"] = detail };

        /// <summary>
        /// Can this device cook every step? <c>{state: accepted|refused, plan: [...], refusal?}</c>. Nothing runs.
        /// </summary>
        public static JsonObject DryRun(JsonObject recipe, JsonObject capabilities, bool humanPresent = false, bool allowModel = true, JsonObject? limits = null, string? now = null)
        {
            var ops = Bundle.Ops;
            var caps = J.O(capabilities, "capabilities");
            var can = new HashSet<string>(StringComparer.Ordinal);
            foreach (var o in J.Items(caps, "ops"))
            {
                var op = J.S(o, "op");
                if (op == null) continue;
                var exe = J.Get(J.O(ops, op), "executable");
                if (J.Kind(exe) != System.Text.Json.JsonValueKind.False) can.Add(op);
            }
            var sensors = TrustedSensors(capabilities, now);
            var plan = new JsonArray();
            foreach (var nodeN in J.Items(J.O(recipe, "process"), "nodes"))
            {
                var node = (JsonObject)nodeN!;
                var op = J.S(node, "op")!;
                var id = J.S(node, "id")!;
                var assign = J.Has(J.O(node, "assignment"), "allowed") ? J.Strings(J.O(node, "assignment"), "allowed") : new List<string> { "any" };
                if (!can.Contains(op))
                {
                    if (humanPresent && (assign.Contains("human") || assign.Contains("any")))
                    {
                        plan.Add(new JsonObject { ["node"] = id, ["op"] = op, ["by"] = "human", ["verifiedBy"] = "human" });
                        continue;
                    }
                    return new JsonObject { ["state"] = "refused", ["refusal"] = Refusal("missing_capability", id, $"device cannot perform {op} and no person is present to do it"), ["plan"] = plan };
                }
                var bad = CheckNodeParams(op, node, limits, ops);
                if (bad != null)
                    return new JsonObject { ["state"] = "refused", ["refusal"] = Refusal(bad.Value.Reason, id, bad.Value.Detail), ["plan"] = plan };
                var env = J.O(J.O(ops, op), "envelope");
                var hasEnv = J.Truthy(env);
                if (hasEnv && (J.Has(env, "unattended") && !J.Truthy(J.Get(env, "unattended"))) && !humanPresent)
                    return new JsonObject { ["state"] = "refused", ["refusal"] = Refusal("needs_human_present", id, $"{op} may not run unattended"), ["plan"] = plan };
                var rung = hasEnv ? LadderChoice(op, sensors, allowModel, humanPresent, ops) : "time";
                if (rung == null)
                    return new JsonObject { ["state"] = "refused", ["refusal"] = Refusal("missing_sensor_no_fallback", id, $"no way to verify {op} on this device"), ["plan"] = plan };
                var verifiedBy = rung.StartsWith("cw.", StringComparison.Ordinal) || rung.StartsWith("x-", StringComparison.Ordinal) ? "sensor" : rung;
                plan.Add(new JsonObject { ["node"] = id, ["op"] = op, ["by"] = "device", ["verifiedBy"] = verifiedBy, ["rung"] = rung });
            }
            return new JsonObject { ["state"] = "accepted", ["plan"] = plan };
        }
    }

    /// <summary>
    /// One simulated device behind the Core API, in process, so every sample runs offline. Not a safety case:
    /// a test bed for the samples. Executions advance one transition per <see cref="Tick"/>, deterministically.
    /// Faults (keyed <c>recipe-id#node</c> or <c>node</c>): <c>sensor_fault</c> fails the execution when the step starts,
    /// <c>timeout</c> pauses it in needs_human, <c>overheat</c> fires a local safety limit (cut heat, stop).
    /// No request field can change a limit.
    /// </summary>
    public class SimulatedExecutor
    {
        private sealed class Execution
        {
            public JsonObject Status = new JsonObject();
            public bool Final;
            public JsonObject? Req;
            public JsonObject? Recipe;
            public JsonArray Plan = new JsonArray();
            public int Step = -1;
            public JsonArray Steps = new JsonArray();
            public JsonArray Safety = new JsonArray();
            public JsonArray Human = new JsonArray();
            public DateTimeOffset StartedAt;
            public bool Heated;
            public string? StopReason;
            public JsonObject? Log;
        }

        public JsonObject Caps { get; }
        public JsonObject Limits { get; }
        public JsonObject RecipeDocs { get; }
        public List<JsonObject> RecallDocs { get; }
        /// <summary>'node' or 'recipe-id#node' → sensor_fault | timeout | overheat.</summary>
        public Dictionary<string, string> Faults { get; }
        public DateTimeOffset Now { get; private set; }
        public TimeSpan ClockStep { get; }
        /// <summary>Refuse the next <c>Busy</c> starts with reason busy (another pot is on this device).</summary>
        public int Busy { get; set; }
        public List<JsonObject> Incidents { get; } = new List<JsonObject>();

        private readonly Dictionary<string, Execution> executions = new Dictionary<string, Execution>();
        private readonly Dictionary<string, string> idem = new Dictionary<string, string>();

        public SimulatedExecutor(JsonObject capabilities, JsonObject? limits = null, JsonObject? recipes = null, IEnumerable<JsonObject>? recalls = null,
                                 IDictionary<string, string>? faults = null, string? now = null, int clockStepS = 60, int busy = 0)
        {
            Caps = capabilities;
            Limits = limits ?? Bundle.SafetyLimits;
            RecipeDocs = recipes ?? Bundle.Recipes;
            RecallDocs = recalls?.ToList() ?? new List<JsonObject>();
            Faults = new Dictionary<string, string>(faults ?? new Dictionary<string, string>());
            Now = Simulator.Time(now ?? Bundle.Now);
            ClockStep = TimeSpan.FromSeconds(clockStepS);
            Busy = busy;
        }

        /// <summary>A simulated executor for one bundled device.</summary>
        public static SimulatedExecutor FromBundle(string device, IDictionary<string, string>? faults = null, int busy = 0, IEnumerable<JsonObject>? recalls = null) =>
            new SimulatedExecutor((JsonObject)Bundle.Devices[device]!, faults: faults, busy: busy, recalls: recalls);

        // ---- Core API
        public JsonObject Capabilities() => Caps;
        public JsonObject SafetyLimits() => Limits;
        public JsonArray Recalls() => new JsonArray(RecallDocs.Select(r => (JsonNode?)r.DeepClone()).ToArray());

        private static JsonObject Copy(JsonObject o) => (JsonObject)o.DeepClone();

        public JsonObject StartExecution(JsonObject req, string? idempotencyKey, bool humanPresent = false)
        {
            if (string.IsNullOrEmpty(idempotencyKey) || idempotencyKey.Length < 8)
                throw CookwalaProblem.Make(400, "missing-idempotency-key", "Idempotency-Key header (8..128 chars) is required on every POST");
            if (idem.TryGetValue(idempotencyKey, out var prior)) return Copy(executions[prior].Status);
            foreach (var k in new[] { "core", "kind", "id", "recipe", "recipeHash", "requestedBy", "idempotencyKey" })
                if (!req.ContainsKey(k)) throw CookwalaProblem.Make(400, "invalid-request", $"missing {k}");
            if (!J.PyStr(req["core"]).StartsWith("0.2.", StringComparison.Ordinal)) throw CookwalaProblem.Make(400, "unsupported-version", refusal: "unsupported_version");
            var id = J.PyStr(req["id"]);
            if (executions.ContainsKey(id)) throw CookwalaProblem.Make(409, "conflict", "execution id already exists");
            var st = new JsonObject
            {
                ["core"] = "0.2.0", ["kind"] = "ExecutionStatus", ["id"] = id, ["seq"] = 0, ["state"] = "accepted", ["request"] = id, ["updatedAt"] = Simulator.Iso(Now),
            };
            idem[idempotencyKey] = id;
            var recipe = Bundle.RecipeByRef(RecipeDocs, J.PyStr(req["recipe"]));
            var refusal = Precheck(req, recipe);
            if (refusal == null && Busy > 0)
            {
                Busy--;
                refusal = new JsonObject { ["reason"] = "busy", ["detail"] = "this device is cooking something else" };
            }
            JsonObject? dry = null;
            if (refusal == null)
            {
                dry = Simulator.DryRun(recipe!, Caps, humanPresent, true, Limits, Simulator.Iso(Now));
                refusal = J.Clone(J.O(dry, "refusal"));
            }
            if (refusal != null)
            {
                st["state"] = "refused";
                st["refusal"] = refusal;
                executions[id] = new Execution { Status = st, Final = true };
                return Copy(st);
            }
            var plan = (JsonArray)dry!["plan"]!;
            st["x-sim-plan"] = plan.DeepClone();
            executions[id] = new Execution { Status = st, Req = (JsonObject)req.DeepClone(), Recipe = recipe, Plan = plan, StartedAt = Now };
            return Copy(st);
        }

        private JsonObject? Precheck(JsonObject req, JsonObject? recipe)
        {
            if (recipe == null) return new JsonObject { ["reason"] = "missing_capability", ["detail"] = "recipe not found in this executor's catalog" };
            var h = Jcs.DocHash(recipe);
            if (h != J.S(req, "recipeHash")) return new JsonObject { ["reason"] = "recipe_hash_mismatch", ["detail"] = $"this executor holds {h}" };
            foreach (var rc in RecallDocs)
                foreach (var t in J.Items(rc, "targets"))
                    if (Bundle.RefMatches(recipe, J.S(t, "ref") ?? "") && (J.Truthy(J.Get(t, "allRevisions")) || J.Same(J.Get(t, "revision"), J.Get(recipe, "revision"))))
                        return new JsonObject { ["reason"] = "recipe_recalled", ["detail"] = $"recall {J.PyStr(J.Get(rc, "id"))} is in force" };
            var mandate = J.O(req, "mandate");
            if (J.Truthy(mandate) && !J.Strings(mandate, "scopes").Contains("start_cooking"))
                return new JsonObject { ["reason"] = "mandate_scope", ["detail"] = "the agent mandate lacks start_cooking" };
            if (J.Truthy(mandate) && J.S(mandate, "expires") is string exp && exp.Length > 0 && Simulator.Time(exp) <= Now)
                return new JsonObject { ["reason"] = "mandate_scope", ["detail"] = "the agent mandate has expired" };
            var blocks = J.Strings(req, "allergenBlocks").Distinct().Where(Bundle.RecipeAllergens(recipe).Contains).ToList();
            if (blocks.Count > 0)
                return new JsonObject { ["reason"] = "allergen_block", ["detail"] = $"recipe contains blocked allergen(s): {J.PyList(J.Sorted(blocks))}" };
            return null;
        }

        private Execution GetEx(string executionId) =>
            executions.TryGetValue(executionId, out var ex) ? ex : throw CookwalaProblem.Make(404, "not-found");

        public JsonObject GetExecution(string executionId) => Copy(GetEx(executionId).Status);

        /// <summary>Never refused once the caller reaches the executor (Core 6.2); no If-Match, no token.</summary>
        public JsonObject StopExecution(string executionId, string reason = "requested")
        {
            var ex = GetEx(executionId);
            var state = J.S(ex.Status, "state")!;
            if (state == "accepted") // nothing has started: accepted -> stopped directly (the only legal path)
            {
                ex.StopReason = reason;
                Set(ex, "stopped");
                Finish(ex, "aborted_safe");
            }
            else if (!Simulator.Final.Contains(state) && state != "stopping")
            {
                Set(ex, "stopping");
                ex.StopReason = reason;
            }
            return Copy(ex.Status);
        }

        /// <summary>Resume a paused or needs_human execution. <paramref name="seq"/> is the If-Match value (412 on mismatch, 428 when missing).</summary>
        public JsonObject ResumeExecution(string executionId, string? seq)
        {
            var ex = GetEx(executionId);
            var st = ex.Status;
            if (seq == null) throw CookwalaProblem.Make(428, "if-match-required");
            if (seq.Trim('"') != J.PyStr(st["seq"])) throw CookwalaProblem.Make(412, "precondition-failed", $"seq is {J.PyStr(st["seq"])}");
            var state = J.S(st, "state");
            if (state == "paused" || state == "needs_human")
            {
                ex.Human.Add(new JsonObject { ["kind"] = "confirm", ["minutes"] = 1 });
                st.Remove("humanNeeded");
                Set(ex, "running");
            }
            return Copy(st);
        }

        /// <summary>Resume with a numeric sequence.</summary>
        public JsonObject ResumeExecution(string executionId, long seq) => ResumeExecution(executionId, seq.ToString(CultureInfo.InvariantCulture));

        public JsonObject ExecutionLog(string executionId)
        {
            var ex = GetEx(executionId);
            if (!ex.Final || ex.Log == null) throw CookwalaProblem.Make(404, "not-found", "the log exists once the execution has ended");
            return Copy(ex.Log);
        }

        public JsonObject ReportIncident(JsonObject doc)
        {
            foreach (var k in new[] { "core", "kind", "id", "date", "category", "severity", "description" })
                if (!doc.ContainsKey(k)) throw CookwalaProblem.Make(400, "invalid-request", $"not a valid IncidentReport: missing {k}");
            Incidents.Add(Copy(doc));
            return new JsonObject { ["received"] = true };
        }

        // ---- the clock

        /// <summary>Advance every running execution by one transition and the clock by one step.</summary>
        public void Tick()
        {
            Now += ClockStep;
            foreach (var ex in executions.Values)
                if (!ex.Final) Advance(ex);
        }

        private void Set(Execution ex, string state)
        {
            var st = ex.Status;
            var cur = J.S(st, "state")!;
            if (!Simulator.TransitionAllowed(cur, state)) throw new InvalidOperationException($"{cur} -> {state}");
            st["seq"] = J.Long(st["seq"]) + 1;
            st["state"] = state;
            st["updatedAt"] = Simulator.Iso(Now);
        }

        private void Advance(Execution ex)
        {
            var state = J.S(ex.Status, "state");
            if (state == "stopping") { Set(ex, "stopped"); Finish(ex, "aborted_safe"); return; }
            if (state == "accepted") { Set(ex, "preparing"); return; }
            if (state == "preparing") { Set(ex, "running"); Enter(ex, 0); return; }
            if (state != "running") return;
            Close(ex);
            if (ex.Step + 1 >= ex.Plan.Count) { Set(ex, "completed"); Finish(ex, "served"); }
            else Enter(ex, ex.Step + 1);
        }

        private void Enter(Execution ex, int i)
        {
            ex.Step = i;
            var p = (JsonObject)ex.Plan[i]!;
            var st = ex.Status;
            string node = J.S(p, "node")!, op = J.S(p, "op")!;
            st["step"] = new JsonObject { ["node"] = node, ["op"] = op, ["startedAt"] = Simulator.Iso(Now), ["progress"] = 0, ["verifiedBy"] = J.S(p, "verifiedBy") };
            var env = J.O(J.O(Bundle.Ops, op), "envelope") ?? new JsonObject();
            if ((J.Num(J.Get(J.O(env, "tempC"), "max")) ?? 0) > 60) ex.Heated = true; // a hot step started; chilling does not count
            Faults.TryGetValue($"{J.S(ex.Recipe, "id")}#{node}", out var fault);
            if (fault == null) Faults.TryGetValue(node, out fault);
            if (fault == "sensor_fault")
            {
                st["x-sim-fault"] = new JsonObject { ["node"] = node, ["kind"] = "sensor_fault", ["detail"] = $"the sensor for {op} stopped reporting" };
                Set(ex, "failed"); Finish(ex, "failed"); return;
            }
            if (fault == "overheat")
            {
                var lim = LimitFor(op, env);
                var action = J.S(lim, "action") ?? "cut_heat";
                ex.Safety.Add(new JsonObject { ["limit"] = J.S(lim, "id"), ["action"] = action, ["node"] = node, ["at"] = Simulator.Iso(Now) });
                st["x-sim-fault"] = new JsonObject { ["node"] = node, ["kind"] = "overheat", ["detail"] = $"local safety limit {J.S(lim, "id")} fired ({action}) during {op}" };
                Set(ex, "stopping"); ex.StopReason = "safety_limit"; return;
            }
            if (fault == "timeout")
            {
                Set(ex, "needs_human"); st["humanNeeded"] = new JsonObject { ["why"] = $"{op} reached its maxTime; onTimeout asks a person" }; return;
            }
            if (J.S(p, "by") == "human")
            {
                Set(ex, "needs_human"); st["humanNeeded"] = new JsonObject { ["why"] = $"a person performs {op}" };
            }
            else if (J.S(p, "verifiedBy") == "human")
            {
                Set(ex, "needs_human"); st["humanNeeded"] = new JsonObject { ["why"] = $"a person confirms {op} is done" };
            }
            else st.Remove("humanNeeded");
        }

        private JsonObject LimitFor(string op, JsonObject env)
        {
            foreach (var limN in J.Items(Limits, "limits"))
            {
                var lim = (JsonObject)limN!;
                var a = J.O(lim, "appliesTo") ?? new JsonObject();
                if (J.S(lim, "kind") == "max_temp" && (J.Strings(a, "ops").Contains(op) || (J.Truthy(J.Get(a, "medium")) && J.S(a, "medium") == J.S(env, "medium"))))
                    return lim;
            }
            return new JsonObject { ["id"] = "x-sim.max_temp", ["action"] = "cut_heat" };
        }

        private void Close(Execution ex)
        {
            var p = (JsonObject)ex.Plan[ex.Step]!;
            ex.Steps.Add(new JsonObject { ["node"] = J.S(p, "node"), ["op"] = J.S(p, "op"), ["verifiedBy"] = J.S(p, "verifiedBy"), ["envelopeOk"] = true, ["endedAt"] = Simulator.Iso(Now) });
            if (ex.Status["step"] is JsonObject step) step["progress"] = 1;
        }

        private void Finish(Execution ex, string outcome)
        {
            ex.Final = true;
            if (ex.Req == null) return;
            var req = ex.Req;
            var actor = J.O(Caps, "actor");
            var servings = req.ContainsKey("servings") ? J.Clone(req["servings"]) : J.Clone(J.Get(J.O(ex.Recipe, "yield"), "servings")) ?? JsonValue.Create(1);
            ex.Log = new JsonObject
            {
                ["core"] = "0.2.0", ["kind"] = "ExecutionLog", ["id"] = $"log-{J.PyStr(req["id"])}", ["recipe"] = J.Clone(req["recipe"]), ["recipeHash"] = J.Clone(req["recipeHash"]),
                ["device"] = new JsonObject
                {
                    ["vendor"] = J.S(actor, "vendor") ?? "simulated", ["model"] = J.S(actor, "model") ?? "simulated", ["firmware"] = "samples-sim-0.1",
                    ["safetyLimits"] = $"{J.PyStr(J.Get(Limits, "id"))}@{J.PyStr(J.Get(Limits, "version"))}",
                },
                ["startedAt"] = Simulator.Iso(ex.StartedAt), ["endedAt"] = Simulator.Iso(Now), ["outcome"] = outcome,
                ["servings"] = servings, ["steps"] = ex.Steps.DeepClone(),
                ["safetyEvents"] = ex.Safety.DeepClone(), ["humanInterventions"] = ex.Human.DeepClone(), ["x-heatStarted"] = ex.Heated,
                ["consent"] = new JsonObject { ["dataset"] = "none", ["withdrawable"] = true },
                ["privacy"] = new JsonObject { ["personalData"] = "none", ["timePrecision"] = "day" },
            };
        }
    }
}
