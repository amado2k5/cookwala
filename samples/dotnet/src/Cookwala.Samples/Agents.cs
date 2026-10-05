using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json.Nodes;

namespace Cookwala.Samples
{
    /// <summary>AgentMandate documents (common.schema.json#/$defs/AgentMandate).</summary>
    public static class Mandates
    {
        public static readonly string[] DefaultScopes = { "plan_meals", "start_cooking", "stop_cooking" };
        public static readonly string[] DefaultConfirmBefore = { "irreversible", "safety_override", "diet_or_allergen_change" };

        /// <summary>
        /// An AgentMandate. Sign it with the principal's key before use (sdk: cookwala.sign); executors verify the
        /// signature, the sample gates check scope and expiry.
        /// </summary>
        public static JsonObject Make(string principal, string agent, IEnumerable<string>? scopes = null, string expires = "2026-12-31T23:59:00Z",
                                      IEnumerable<string>? confirmBefore = null, string vendor = "cookwala-samples", string model = "rules", string version = "0.1.0") =>
            new JsonObject
            {
                ["principal"] = principal, ["agent"] = agent,
                ["agentInfo"] = new JsonObject { ["vendor"] = vendor, ["model"] = model, ["version"] = version },
                ["scopes"] = J.StrArray(scopes ?? DefaultScopes), ["confirmBefore"] = J.StrArray(confirmBefore ?? DefaultConfirmBefore), ["expires"] = expires,
            };
    }

    /// <summary>A planner's answer: a ready ExecuteRequest, or why not.</summary>
    public class Proposal
    {
        public bool Ok { get; }
        public JsonObject? Request { get; }
        public JsonObject? Recipe { get; }
        public string? Reason { get; }
        public string? Detail { get; }
        public List<string> Notes { get; }

        public Proposal(bool ok, JsonObject? request = null, JsonObject? recipe = null, string? reason = null, string? detail = null, IEnumerable<string>? notes = null)
        {
            Ok = ok; Request = request; Recipe = recipe; Reason = reason; Detail = detail;
            Notes = notes?.ToList() ?? new List<string>();
        }

        public JsonObject AsDict() => new JsonObject
        {
            ["ok"] = Ok, ["request"] = J.Clone(Request), ["recipe"] = Recipe == null ? null : J.Clone(J.Get(Recipe, "id")),
            ["reason"] = Reason, ["detail"] = Detail, ["notes"] = J.StrArray(Notes),
        };
    }

    /// <summary>A person the agents and the orchestrator can ask.</summary>
    public interface IHuman
    {
        /// <summary>Whether a person is in the kitchen.</summary>
        bool Present { get; }
        /// <summary>Ask the person to confirm an item (a confirmBefore item, or presence).</summary>
        bool Confirm(string item, string detail);
        /// <summary>Ask the person to attend an execution that needs them.</summary>
        bool Attend(string executionId, string why);
    }

    /// <summary>
    /// Turns a structured order into an ExecuteRequest under a mandate. It does not read recipe text as instructions,
    /// never removes an allergen block or picks a dish that contains a blocked allergen without asking, and asks a person
    /// before anything its mandate lists in confirmBefore (always before irreversible and safety_override, Core 6.5).
    /// Plug a language model in front of it if you like; the model proposes an order, this code decides what is sent.
    /// </summary>
    public class PlannerAgent
    {
        /// <summary>Items a person always confirms, whatever the mandate says.</summary>
        public static readonly string[] AlwaysConfirm = { "irreversible", "safety_override" };

        public string Id { get; }
        public JsonObject Mandate { get; }
        public BundleCatalog Catalog { get; }
        public IHuman? Human { get; }
        public string Now { get; }
        public int Seq { get; private set; }

        public PlannerAgent(string agentId, JsonObject mandate, BundleCatalog catalog, IHuman? human = null, string? now = null)
        {
            Id = agentId; Mandate = mandate; Catalog = catalog; Human = human;
            Now = now ?? Bundle.Now;
        }

        private string? May(string scope)
        {
            if (!J.Strings(Mandate, "scopes").Contains(scope)) return $"mandate lacks {scope}";
            var exp = J.S(Mandate, "expires");
            if (!string.IsNullOrEmpty(exp) && Simulator.Time(exp) <= Simulator.Time(Now)) return "mandate expired";
            return null;
        }

        private bool ConfirmItem(string item, string detail)
        {
            if (!J.Strings(Mandate, "confirmBefore").Contains(item) && !AlwaysConfirm.Contains(item)) return true;
            return Human != null && Human.Confirm(item, detail);
        }

        private static List<string> Hit(IEnumerable<string> blocks, JsonObject recipe)
        {
            var present = Bundle.RecipeAllergens(recipe);
            return J.Sorted(blocks.Distinct().Where(present.Contains));
        }

        /// <summary>order: <c>{dish, servings?, allergenBlocks?, serveBy?, alternatives?: bool, triggers?: [confirmBefore items]}</c>.</summary>
        public virtual Proposal Propose(JsonObject order)
        {
            var why = May("plan_meals") ?? May("start_cooking");
            if (why != null) return new Proposal(false, reason: "mandate_scope", detail: why);
            var blocks = J.Strings(order, "allergenBlocks");
            var dish = J.S(order, "dish") ?? throw new KeyNotFoundException("dish");
            var hits = Catalog.Find(dish);
            if (hits.Count == 0) return new Proposal(false, reason: "missing_capability", detail: $"no recipe matches {J.PyRepr(dish)}");
            var notes = new List<string>();
            var safe = hits.Where(r => Hit(blocks, r).Count == 0).ToList();
            JsonObject recipe;
            if (safe.Count > 0)
            {
                recipe = safe[0];
            }
            else if (J.Truthy(J.Get(order, "alternatives")))
            {
                var alts = Catalog.List().Select(k => Catalog.Get(k)!).Where(d => Hit(blocks, d).Count == 0).ToList();
                if (alts.Count == 0) return new Proposal(false, reason: "allergen_block", detail: "every recipe in the catalog contains a blocked allergen");
                recipe = alts[0];
                var detail = $"{J.S(hits[0], "id")} contains {J.PyList(Hit(blocks, hits[0]))}; propose {J.S(recipe, "id")} instead";
                if (!ConfirmItem("diet_or_allergen_change", detail))
                    return new Proposal(false, reason: "not_authorized", detail: $"a person did not confirm: {detail}");
                notes.Add(detail);
            }
            else
            {
                // Never drop the block and never substitute an ingredient around it: send the request and let it be refused, or stop here.
                var r = hits[0];
                return new Proposal(false, recipe: r, reason: "allergen_block", detail: $"{J.S(r, "id")} contains blocked allergen(s) {J.PyList(Hit(blocks, r))}");
            }
            foreach (var item in J.Strings(order, "triggers"))
                if (!ConfirmItem(item, $"order {J.PyRepr(dish)} triggers {item}"))
                    return new Proposal(false, recipe: recipe, reason: "not_authorized", detail: $"a person did not confirm {item}");
            var (gref, h) = Catalog.RefAndHash(recipe);
            Seq++;
            var key = Keys.New("ex");
            var req = new JsonObject
            {
                ["core"] = "0.2.0", ["kind"] = "ExecuteRequest",
                ["id"] = $"{Id.Split(':').Last()}-{Seq.ToString("0000", CultureInfo.InvariantCulture)}-{key.Substring(key.Length - 6)}",
                ["recipe"] = gref, ["recipeHash"] = h, ["requestedBy"] = Id, ["idempotencyKey"] = key, ["mandate"] = Mandate.DeepClone(),
            };
            if (J.Truthy(J.Get(order, "servings"))) req["servings"] = J.Clone(order["servings"]);
            if (J.Truthy(J.Get(order, "serveBy"))) req["serveBy"] = J.Clone(order["serveBy"]);
            if (blocks.Count > 0) req["allergenBlocks"] = J.StrArray(blocks);
            return new Proposal(true, req, recipe, notes: notes);
        }
    }

    /// <summary>
    /// Watches status documents: legal state transitions (allowing states skipped between polls), a sequence that only
    /// goes up, and media temperatures inside the operation envelope. Anomalies are reported, never "fixed": the executor owns safety.
    /// </summary>
    public class MonitorAgent
    {
        private readonly Dictionary<string, List<(long Seq, string State)>> history = new Dictionary<string, List<(long, string)>>();
        public List<JsonObject> Anomalies { get; } = new List<JsonObject>();

        /// <summary>Record one status document. Executions are keyed by device and id: one request may be tried on several devices.</summary>
        public JsonObject Observe(JsonObject status, string? device = null)
        {
            var id = J.PyStr(J.Get(status, "id"));
            var key = device != null ? $"{device}/{id}" : id;
            if (!history.TryGetValue(key, out var h)) history[key] = h = new List<(long, string)>();
            var seq = J.Long(J.Get(status, "seq"));
            var state = J.S(status, "state") ?? "";
            if (h.Count > 0)
            {
                var prev = h[h.Count - 1];
                if (seq < prev.Seq)
                    Anomalies.Add(new JsonObject { ["execution"] = id, ["kind"] = "seq_regressed", ["detail"] = $"{prev.Seq} -> {seq}" });
                else if (state != prev.State && !Simulator.TransitionAllowed(prev.State, state) && !Reachable(prev.State, state))
                    // Polling can miss states in between; flag only transitions no path explains.
                    Anomalies.Add(new JsonObject { ["execution"] = id, ["kind"] = "illegal_transition", ["detail"] = $"{prev.State} -> {state}" });
            }
            var t = J.Num(J.Get(status, "x-hub-mediumTempC"));
            var step = J.O(status, "step");
            var op = J.S(step, "op");
            var band = op == null ? null : J.O(J.O(J.O(Bundle.Ops, op), "envelope"), "tempC");
            if (t != null && J.Truthy(band) && t > J.Num(band!["max"]))
                Anomalies.Add(new JsonObject { ["execution"] = id, ["kind"] = "above_envelope", ["detail"] = $"{op} {J.PyNum(J.Get(status, "x-hub-mediumTempC"))} °C > {J.PyNum(band["max"])} °C" });
            if (h.Count == 0 || h[h.Count - 1].Seq != seq) h.Add((seq, state));
            return status;
        }

        private static bool Reachable(string a, string b, HashSet<string>? seen = null)
        {
            seen ??= new HashSet<string>();
            if (!Simulator.Transitions.TryGetValue(a, out var next)) return false;
            foreach (var n in next)
            {
                if (n == b) return true;
                if (seen.Add(n) && Reachable(n, b, seen)) return true;
            }
            return false;
        }

        /// <summary>The states seen for one execution, in order.</summary>
        public List<string> Transitions(string executionId, string? device = null) =>
            history.TryGetValue(device != null ? $"{device}/{executionId}" : executionId, out var h) ? h.Select(x => x.State).ToList() : new List<string>();
    }

    /// <summary>A person for demos and tests: answers from a script, records every interaction.</summary>
    public class ScriptedHuman : IHuman
    {
        private readonly Func<string, string, bool> confirm;
        private readonly Func<string, string, bool> attend;

        public bool Present { get; }
        public List<JsonObject> Log { get; } = new List<JsonObject>();

        public ScriptedHuman(bool present = true, bool confirm = true, bool attend = true) : this(present, (_, _) => confirm, (_, _) => attend) { }

        public ScriptedHuman(bool present, Func<string, string, bool> confirm, Func<string, string, bool> attend)
        {
            Present = present;
            this.confirm = confirm;
            this.attend = attend;
        }

        public bool Confirm(string item, string detail)
        {
            var ok = confirm(item, detail);
            Log.Add(new JsonObject { ["kind"] = "confirm", ["item"] = item, ["detail"] = detail, ["answer"] = ok });
            return ok;
        }

        public bool Attend(string executionId, string why)
        {
            var ok = Present && attend(executionId, why);
            Log.Add(new JsonObject { ["kind"] = "attend", ["execution"] = executionId, ["why"] = why, ["answer"] = ok });
            return ok;
        }
    }

    /// <summary>Asks on the terminal.</summary>
    public class ConsoleHuman : ScriptedHuman
    {
        public ConsoleHuman(bool present = true) : base(present, Ask, Ask) { }

        private static bool Ask(string _, string detail)
        {
            Console.Write($"[person] {detail} - ok? [y/N] ");
            return (Console.ReadLine() ?? "").Trim().ToLowerInvariant().StartsWith("y", StringComparison.Ordinal);
        }
    }
}
