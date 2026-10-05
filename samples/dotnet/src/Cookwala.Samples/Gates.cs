using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Cookwala.Samples
{
    /// <summary>What a gate looks at: the request, the recipe it names, the device (when chosen) and the kitchen.</summary>
    public class GateContext
    {
        public JsonObject Request { get; }
        public JsonObject? Recipe { get; }
        /// <summary>Capabilities document of the target device, when one is chosen.</summary>
        public JsonObject? Device { get; }
        public bool HumanPresent { get; }
        /// <summary>ISO 8601; defaults to the bundle's pinned instant so results are reproducible.</summary>
        public string Now { get; }
        public List<JsonObject> Recalls { get; }
        public JsonObject Limits { get; }
        /// <summary>Optional mandate signature check: returns (ok, why).</summary>
        public Func<JsonObject, (bool Ok, string? Why)>? VerifyMandate { get; }

        public GateContext(JsonObject request, JsonObject? recipe = null, JsonObject? device = null, bool humanPresent = false, string? now = null,
                           IEnumerable<JsonObject>? recalls = null, JsonObject? limits = null, Func<JsonObject, (bool, string?)>? verifyMandate = null)
        {
            Request = request;
            Recipe = recipe;
            Device = device;
            HumanPresent = humanPresent;
            Now = now ?? Bundle.Now;
            Recalls = recalls?.ToList() ?? new List<JsonObject>();
            Limits = limits ?? Bundle.SafetyLimits;
            VerifyMandate = verifyMandate;
        }
    }

    /// <summary>One gate's answer: pass, or refuse with a Core RefusalReason.</summary>
    public class GateResult
    {
        public string Gate { get; }
        public bool Ok { get; }
        public string? Reason { get; }
        public string? Detail { get; }
        public string? Node { get; }
        public List<JsonObject> Findings { get; }

        public GateResult(string gate, bool ok, string? reason = null, string? detail = null, string? node = null, IEnumerable<JsonObject>? findings = null)
        {
            Gate = gate; Ok = ok; Reason = reason; Detail = detail; Node = node;
            Findings = findings?.ToList() ?? new List<JsonObject>();
        }

        public JsonObject AsDict()
        {
            var d = new JsonObject { ["gate"] = Gate, ["ok"] = Ok };
            if (!string.IsNullOrEmpty(Reason)) d["reason"] = Reason;
            if (!string.IsNullOrEmpty(Detail)) d["detail"] = Detail;
            if (!string.IsNullOrEmpty(Node)) d["node"] = Node;
            if (Findings.Count > 0) d["findings"] = new JsonArray(Findings.Select(f => (JsonNode?)f.DeepClone()).ToArray());
            return d;
        }
    }

    /// <summary>The pipeline's answer: allowed, or the first refusal; findings from every gate that ran.</summary>
    public class GateDecision
    {
        public bool Allowed { get; }
        public List<GateResult> Results { get; }

        public GateDecision(bool allowed, List<GateResult> results)
        {
            Allowed = allowed;
            Results = results;
        }

        /// <summary><c>{reason, detail, gate, node?}</c> of the first refusal, or null.</summary>
        public JsonObject? Refusal
        {
            get
            {
                var bad = Results.FirstOrDefault(r => !r.Ok);
                if (bad == null) return null;
                var d = new JsonObject { ["reason"] = bad.Reason, ["detail"] = bad.Detail, ["gate"] = bad.Gate };
                if (!string.IsNullOrEmpty(bad.Node)) d["node"] = bad.Node;
                return d;
            }
        }

        public List<JsonObject> Findings => Results.SelectMany(r => r.Findings).ToList();

        public JsonObject AsDict() => new JsonObject
        {
            ["allowed"] = Allowed, ["refusal"] = Refusal,
            ["findings"] = new JsonArray(Findings.Select(f => (JsonNode?)f.DeepClone()).ToArray()),
            ["results"] = new JsonArray(Results.Select(r => (JsonNode?)r.AsDict()).ToArray()),
        };
    }

    /// <summary>
    /// A check a request must pass before it is sent to an executor. A gate looks at one thing and answers pass or refuse.
    /// Gates never relax a request, never substitute around an allergen block and never touch a safety limit.
    /// The executor checks everything again; it is the authority (Core section 6).
    /// </summary>
    public abstract class Gate
    {
        public abstract string Name { get; }
        public abstract GateResult Check(GateContext ctx);
        protected GateResult Pass(IEnumerable<JsonObject>? findings = null) => new GateResult(Name, true, findings: findings);
        protected GateResult Refuse(string reason, string detail, string? node = null) => new GateResult(Name, false, reason, detail, node);
    }

    public class CoreVersionGate : Gate
    {
        public override string Name => "core-version";

        public override GateResult Check(GateContext ctx)
        {
            var v = J.Has(ctx.Request, "core") ? J.PyStr(ctx.Request["core"]) : "";
            return v.StartsWith("0.2.", StringComparison.Ordinal) ? Pass() : Refuse("unsupported_version", $"core {(v.Length > 0 ? v : "missing")}; this sample speaks 0.2.x");
        }
    }

    /// <summary>The request names exactly one revision; the recipe in hand must be that revision.</summary>
    public class RecipeHashGate : Gate
    {
        public override string Name => "recipe-hash";

        public override GateResult Check(GateContext ctx)
        {
            if (ctx.Recipe == null) return Refuse("missing_capability", $"recipe {J.PyStr(J.Get(ctx.Request, "recipe"))} is not in the catalog");
            var h = Jcs.DocHash(ctx.Recipe);
            return h == J.S(ctx.Request, "recipeHash") ? Pass() : Refuse("recipe_hash_mismatch", $"catalog holds {h}");
        }
    }

    public class RecallGate : Gate
    {
        public override string Name => "recall";

        public override GateResult Check(GateContext ctx)
        {
            foreach (var rc in ctx.Recalls)
                foreach (var t in J.Items(rc, "targets"))
                    if (ctx.Recipe != null && Bundle.RefMatches(ctx.Recipe, J.S(t, "ref") ?? "") &&
                        (J.Truthy(J.Get(t, "allRevisions")) || J.Same(J.Get(t, "revision"), J.Get(ctx.Recipe, "revision"))))
                        return Refuse("recipe_recalled", $"recall {J.PyStr(J.Get(rc, "id"))} ({J.S(rc, "reason") ?? "unspecified"}) is in force");
            return Pass();
        }
    }

    /// <summary>An agent acts only under a mandate: right agent, start_cooking scope, not expired, signature checked if a verifier is given.</summary>
    public class MandateGate : Gate
    {
        public override string Name => "mandate";

        public override GateResult Check(GateContext ctx)
        {
            var req = ctx.Request;
            var m = J.O(req, "mandate");
            var by = J.Has(req, "requestedBy") ? J.PyStr(req["requestedBy"]) : "";
            if (m == null)
                return by.StartsWith("agent:", StringComparison.Ordinal) ? Refuse("not_authorized", $"{by} is an agent and sent no mandate") : Pass();
            var agent = J.S(m, "agent");
            if (!string.IsNullOrEmpty(agent) && agent != by) return Refuse("not_authorized", $"mandate is for {agent}, request is from {by}");
            if (!J.Strings(m, "scopes").Contains("start_cooking")) return Refuse("mandate_scope", "the mandate lacks start_cooking");
            var exp = J.S(m, "expires");
            if (!string.IsNullOrEmpty(exp) && Simulator.Time(exp) <= Simulator.Time(ctx.Now)) return Refuse("mandate_scope", $"the mandate expired at {exp}");
            if (ctx.VerifyMandate != null)
            {
                var (ok, why) = ctx.VerifyMandate(m);
                if (!ok) return Refuse("not_authorized", $"mandate signature: {why}");
            }
            return Pass();
        }
    }

    /// <summary>Any blocked allergen in the recipe refuses; there are no substitutions around a block (Core 6.7).</summary>
    public class AllergenGate : Gate
    {
        public override string Name => "allergen";

        public override GateResult Check(GateContext ctx)
        {
            var present = Bundle.RecipeAllergens(ctx.Recipe);
            var blocks = J.Strings(ctx.Request, "allergenBlocks").Distinct().Where(present.Contains).ToList();
            return blocks.Count > 0 ? Refuse("allergen_block", $"recipe contains blocked allergen(s): {J.PyList(J.Sorted(blocks))}") : Pass();
        }
    }

    /// <summary>Every step's numbers sit inside the operation envelope and under the local safety limits.</summary>
    public class EnvelopeGate : Gate
    {
        public override string Name => "envelope";

        public override GateResult Check(GateContext ctx)
        {
            foreach (var n in J.Items(J.O(ctx.Recipe, "process"), "nodes"))
            {
                var node = (JsonObject)n!;
                var bad = Simulator.CheckNodeParams(J.S(node, "op")!, node, ctx.Limits);
                if (bad != null) return Refuse(bad.Value.Reason, bad.Value.Detail, J.S(node, "id"));
            }
            return Pass();
        }
    }

    /// <summary>Operations whose envelope says unattended:false need a person present.</summary>
    public class AttendanceGate : Gate
    {
        public override string Name => "attendance";

        public override GateResult Check(GateContext ctx)
        {
            foreach (var node in J.Items(J.O(ctx.Recipe, "process"), "nodes"))
            {
                var op = J.S(node, "op")!;
                var env = J.O(J.O(Bundle.Ops, op), "envelope");
                if (J.Truthy(env) && J.Kind(J.Get(env, "unattended")) == System.Text.Json.JsonValueKind.False && !ctx.HumanPresent)
                    return Refuse("needs_human_present", $"{op} may not run unattended", J.S(node, "id"));
            }
            return Pass();
        }
    }

    /// <summary>Free text is data, never an instruction (Core 6.4). This gate never obeys and never refuses: it logs a finding.</summary>
    public class UntrustedTextGate : Gate
    {
        /// <summary>Instruction-like phrases (case-insensitive).</summary>
        public static readonly string[] InstructionPatterns =
        {
            @"ignore (all |any )?(previous|prior|above) (instructions|rules)", @"disregard (the )?(rules|instructions|limits)",
            @"(raise|increase|disable|bypass|override) (the )?(safety|temperature|heat) ?(limit|limits|check|checks)?",
            @"you are (now )?(an?|the) ", @"system prompt", @"act as ", @"skip (the )?(allergen|safety)", @"without (a )?(person|human|supervision)",
        };

        private readonly List<Regex> rx;

        public UntrustedTextGate(IEnumerable<string>? patterns = null)
        {
            rx = (patterns ?? InstructionPatterns).Select(p => new Regex(p, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)).ToList();
        }

        public override string Name => "untrusted-text";

        private static IEnumerable<(string Path, string Text)> Strings(JsonNode? v, string path)
        {
            switch (v)
            {
                case JsonObject o:
                    foreach (var kv in o)
                        foreach (var x in Strings(kv.Value, $"{path}/{kv.Key}")) yield return x;
                    break;
                case JsonArray a:
                    for (var i = 0; i < a.Count; i++)
                        foreach (var x in Strings(a[i], $"{path}/{i}")) yield return x;
                    break;
                default:
                    if (J.Str(v) is string s) yield return (path, s);
                    break;
            }
        }

        public override GateResult Check(GateContext ctx)
        {
            var findings = new List<JsonObject>();
            foreach (var (where, doc) in new (string, JsonNode?)[] { ("request", ctx.Request), ("recipe", ctx.Recipe ?? new JsonObject()) })
                foreach (var (path, s) in Strings(doc, ""))
                    if (rx.Any(r => r.IsMatch(s)))
                        findings.Add(new JsonObject { ["incident"] = "cw.incident.untrusted_instruction", ["where"] = $"{where}{path}", ["action"] = "ignored_and_logged" });
            return Pass(findings);
        }
    }

    /// <summary>When a device is chosen: the dry run the executor will do, done early.</summary>
    public class CapabilityGate : Gate
    {
        public override string Name => "capability";

        public override GateResult Check(GateContext ctx)
        {
            if (ctx.Device == null || ctx.Recipe == null) return Pass();
            var res = Simulator.DryRun(ctx.Recipe, ctx.Device, ctx.HumanPresent, true, ctx.Limits, ctx.Now);
            if (J.S(res, "state") == "refused")
            {
                var r = J.O(res, "refusal");
                return Refuse(J.S(r, "reason")!, J.S(r, "detail")!, J.S(r, "node"));
            }
            return Pass();
        }
    }

    /// <summary>Runs gates in order and fails closed: the first refusal stops it, and a gate that throws refuses with <c>x-gate-error</c>.</summary>
    public class GatePipeline
    {
        public List<Gate> Gates { get; }

        public GatePipeline(IEnumerable<Gate> gates)
        {
            Gates = gates.ToList();
        }

        /// <summary>Order: cheap and final first (version, hash, recall, mandate, allergens), then the recipe's numbers, then the device.</summary>
        public static GatePipeline Default() => new GatePipeline(new Gate[]
        {
            new CoreVersionGate(), new RecipeHashGate(), new RecallGate(), new MandateGate(), new AllergenGate(), new UntrustedTextGate(),
            new EnvelopeGate(), new AttendanceGate(), new CapabilityGate(),
        });

        /// <summary>The same pipeline without the named gates.</summary>
        public GatePipeline Without(params string[] names) => new GatePipeline(Gates.Where(g => !names.Contains(g.Name)));

        public GateDecision Run(GateContext ctx)
        {
            var results = new List<GateResult>();
            foreach (var g in Gates)
            {
                GateResult r;
                try
                {
                    r = g.Check(ctx);
                }
                catch (Exception e) // fail closed: a gate that cannot decide refuses
                {
                    r = new GateResult(g.Name, false, "x-gate-error", $"{e.GetType().Name}: {e.Message}");
                }
                results.Add(r);
                if (!r.Ok) return new GateDecision(false, results);
            }
            return new GateDecision(true, results);
        }
    }
}
