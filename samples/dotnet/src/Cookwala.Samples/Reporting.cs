using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;

namespace Cookwala.Samples
{
    /// <summary>A record of one run: what was asked, what the gates and devices said, what recovery did, what happened to the food.</summary>
    public class RunRecord
    {
        public string Job { get; set; }
        /// <summary>pending | completed | refused | stopped | failed</summary>
        public string Outcome { get; set; } = "pending";
        public string? Recipe { get; set; }
        public string? Device { get; set; }
        public JsonObject? Request { get; set; }
        public JsonObject? Refusal { get; set; }
        public JsonObject? Gates { get; set; }
        public List<JsonObject> Attempts { get; } = new List<JsonObject>();
        public List<JsonObject> Recovery { get; } = new List<JsonObject>();
        public List<JsonObject> Human { get; } = new List<JsonObject>();
        public List<JsonObject> Findings { get; } = new List<JsonObject>();
        public List<string> Transitions { get; set; } = new List<string>();
        public List<JsonObject> Anomalies { get; set; } = new List<JsonObject>();
        public List<string> Notes { get; } = new List<string>();
        public JsonObject? Status { get; set; }
        public JsonObject? Log { get; set; }
        public JsonObject? Incident { get; set; }
        /// <summary>served | discard | not_served | not_cooked</summary>
        public string? Disposition { get; set; }
        public Dictionary<string, string> Tags { get; set; } = new Dictionary<string, string>();

        public RunRecord(string job, IDictionary<string, string>? tags = null)
        {
            Job = job;
            if (tags != null) Tags = new Dictionary<string, string>(tags);
        }

        public RunRecord Refused(JsonObject refusal, JsonObject? recipe = null)
        {
            Refusal = refusal;
            if (recipe != null && Recipe == null) Recipe = J.S(recipe, "id");
            return Finish("refused", "not_cooked");
        }

        public RunRecord Finish(string outcome, string? disposition = null)
        {
            Outcome = outcome;
            Disposition = disposition;
            return this;
        }

        private static JsonArray Arr(IEnumerable<JsonObject> items) => new JsonArray(items.Select(i => (JsonNode?)i.DeepClone()).ToArray());

        /// <summary>The record as JSON, with the same field names and order as the Python reference; empty fields left out.</summary>
        public JsonObject AsDict()
        {
            var d = new JsonObject();
            void Put(string k, JsonNode? v)
            {
                if (v == null) return;
                if (v is JsonArray a && a.Count == 0) return;
                if (v is JsonObject o && o.Count == 0) return;
                d[k] = v;
            }
            Put("job", Job);
            Put("outcome", Outcome);
            Put("recipe", Recipe);
            Put("device", Device);
            Put("refusal", J.Clone(Refusal));
            Put("gates", J.Clone(Gates));
            Put("attempts", Arr(Attempts));
            Put("recovery", Arr(Recovery));
            Put("human", Arr(Human));
            Put("findings", Arr(Findings));
            Put("transitions", J.StrArray(Transitions));
            Put("anomalies", Arr(Anomalies));
            Put("notes", J.StrArray(Notes));
            Put("status", J.Clone(Status));
            Put("log", J.Clone(Log));
            Put("incident", J.Clone(Incident));
            Put("disposition", Disposition);
            var tags = new JsonObject();
            foreach (var kv in Tags) tags[kv.Key] = kv.Value;
            Put("tags", tags);
            if (J.Truthy(Request))
            {
                d["requestId"] = J.Clone(J.Get(Request, "id"));
                d["requestedBy"] = J.Clone(J.Get(Request, "requestedBy"));
            }
            return d;
        }
    }

    /// <summary>Anonymous IncidentReports (Core 6.9): a date and no names, ids, addresses or exact times.</summary>
    public static class Incidents
    {
        public static readonly IReadOnlyDictionary<string, string> Category = new Dictionary<string, string>
        {
            ["sensor_fault"] = "cw.incident.sensor_failure", ["overheat"] = "cw.incident.overheat", ["timeout"] = "cw.incident.running_late",
        };

        /// <summary>An anonymous IncidentReport from a run record; the id is random so it cannot link back to a job, household or device.</summary>
        public static JsonObject IncidentFrom(RunRecord rec, string? date = null)
        {
            var st = rec.Status ?? new JsonObject();
            var fault = J.O(st, "x-sim-fault") ?? new JsonObject();
            var log = rec.Log ?? new JsonObject();
            var src = J.S(log, "endedAt") ?? J.S(st, "updatedAt") ?? "1970-01-01";
            date ??= src.Length > 10 ? src.Substring(0, 10) : src;
            var step = J.O(st, "step") ?? new JsonObject();
            var kind = J.S(fault, "kind");
            var category = kind != null && Category.TryGetValue(kind, out var c) ? c : rec.Outcome == "failed" ? "cw.incident.equipment_failure" : "cw.incident.overheat";
            var safety = J.Truthy(J.Get(log, "safetyEvents"));
            var doc = new JsonObject
            {
                ["core"] = "0.2.0", ["kind"] = "IncidentReport", ["id"] = $"inc-{date}-{Convert.ToHexString(RandomNumberGenerator.GetBytes(4)).ToLowerInvariant()}",
                ["date"] = date, ["category"] = category, ["severity"] = safety ? "medium" : "low", ["outcome"] = "near_miss",
                ["description"] = $"Execution ended {J.S(st, "state") ?? rec.Outcome} during {J.S(step, "op") ?? "an unknown step"}; " +
                                  (J.Truthy(J.Get(log, "x-heatStarted")) ? "food discarded, no injury." : "no heat had started, no injury."),
                ["contributingFactors"] = J.StrArray(new[] { kind == "sensor_fault" ? "sensor_fault" : "other" }),
            };
            if (J.Truthy(J.Get(step, "op"))) doc["op"] = J.S(step, "op");
            var dev = J.O(log, "device");
            if (J.Truthy(J.Get(dev, "model"))) doc["deviceModel"] = J.Clone(J.Get(dev, "model"));
            if (safety) doc["safetyLimitsFired"] = J.StrArray(J.Sorted(J.Items(log, "safetyEvents").Select(e => J.S(e, "limit") ?? "").Distinct()));
            return doc;
        }
    }

    /// <summary>A record per run, a summary across runs, and four renderings: JSON, Markdown, JUnit XML, CSV.</summary>
    public class Reporter
    {
        public List<RunRecord> Records { get; }
        public string Title { get; }

        public Reporter(IEnumerable<RunRecord>? records = null, string title = "Cookwala sample run")
        {
            Records = records?.ToList() ?? new List<RunRecord>();
            Title = title;
        }

        public RunRecord Add(RunRecord rec)
        {
            Records.Add(rec);
            return rec;
        }

        private static void Inc(JsonObject o, string key) => o[key] = J.Long(J.Get(o, key)) + 1;

        public JsonObject Summary()
        {
            var outcomes = new JsonObject();
            var refusals = new JsonObject();
            var actions = new JsonObject();
            int human = 0, incidents = 0, untrusted = 0, anomalies = 0, served = 0, discarded = 0;
            foreach (var r in Records)
            {
                Inc(outcomes, r.Outcome);
                if (J.Truthy(r.Refusal)) Inc(refusals, J.PyStr(J.Get(r.Refusal, "reason")));
                foreach (var a in r.Recovery) Inc(actions, J.S(a, "action")!);
                human += r.Human.Count;
                incidents += J.Truthy(r.Incident) ? 1 : 0;
                anomalies += r.Anomalies.Count;
                untrusted += r.Findings.Count(f => J.S(f, "incident") == "cw.incident.untrusted_instruction");
                served += r.Disposition == "served" ? 1 : 0;
                discarded += r.Disposition == "discard" ? 1 : 0;
            }
            return new JsonObject
            {
                ["runs"] = Records.Count, ["outcomes"] = outcomes, ["refusals"] = refusals, ["recoveryActions"] = actions, ["humanInterventions"] = human,
                ["incidents"] = incidents, ["untrustedTextFindings"] = untrusted, ["anomalies"] = anomalies, ["served"] = served, ["discarded"] = discarded,
            };
        }

        /// <summary>JSON for machines: <c>{report, summary, runs}</c>, indented one space like the Python reference.</summary>
        public string ToJson(int indent = 1) => J.Dumps(new JsonObject
        {
            ["report"] = Title, ["summary"] = Summary(), ["runs"] = new JsonArray(Records.Select(r => (JsonNode?)r.AsDict()).ToArray()),
        }, indent);

        private static string Why(RunRecord r) =>
            J.Truthy(r.Refusal) ? $"{J.PyStr(J.Get(r.Refusal, "reason"))}: {(J.Has(r.Refusal, "detail") ? J.PyStr(r.Refusal!["detail"]) : "")}"
                                : J.S(J.O(r.Status, "x-sim-fault"), "detail") ?? "";

        /// <summary>Markdown for people.</summary>
        public string ToMarkdown()
        {
            var s = Summary();
            var outcomes = ((JsonObject)s["outcomes"]!).Select(kv => kv.Key).ToList();
            outcomes.Sort(string.CompareOrdinal);
            var lines = new List<string>
            {
                $"# {Title}", "",
                $"{J.PyNum(s["runs"])} runs: " + string.Join(", ", outcomes.Select(k => $"{J.PyNum(s["outcomes"]![k])} {k}")) +
                $". Served {J.PyNum(s["served"])}, discarded {J.PyNum(s["discarded"])}, incidents reported {J.PyNum(s["incidents"])}, people asked {J.PyNum(s["humanInterventions"])} times.", "",
                "| Job | Recipe | Device | Outcome | Why | Recovery | Food |", "|---|---|---|---|---|---|---|",
            };
            foreach (var r in Records)
            {
                var why = Why(r).Replace("|", "/");
                var rec = string.Join(", ", r.Recovery.Select(a => J.S(a, "action")));
                lines.Add($"| {r.Job} | {Or(r.Recipe)} | {Or(r.Device)} | {r.Outcome} | {Or(why)} | {Or(rec)} | {Or(r.Disposition)} |");
            }
            var untrusted = J.Long(s["untrustedTextFindings"]);
            if (untrusted > 0)
                lines.AddRange(new[] { "", $"Untrusted text: {untrusted} instruction-like strings were found, ignored and logged (cw.incident.untrusted_instruction)." });
            var anomalies = J.Long(s["anomalies"]);
            if (anomalies > 0) lines.AddRange(new[] { "", $"Monitor anomalies: {anomalies}." });
            lines.AddRange(new[] { "", "Simulated devices; nothing was cooked. The executor is the authority on every refusal." });
            return string.Join("\n", lines) + "\n";
        }

        private static string Or(string? s) => string.IsNullOrEmpty(s) ? "-" : s;

        /// <summary>XML text escape (&amp; &lt; &gt;), as Python's xml.sax.saxutils.escape.</summary>
        public static string XmlEscape(string s) => s.Replace("&", "&amp;").Replace(">", "&gt;").Replace("<", "&lt;");

        /// <summary>A quoted XML attribute value, as Python's xml.sax.saxutils.quoteattr.</summary>
        public static string QuoteAttr(string s)
        {
            s = XmlEscape(s).Replace("\n", "&#10;").Replace("\r", "&#13;").Replace("\t", "&#9;");
            if (s.Contains('"'))
            {
                if (s.Contains('\'')) return "\"" + s.Replace("\"", "&quot;") + "\"";
                return "'" + s + "'";
            }
            return "\"" + s + "\"";
        }

        /// <summary>JUnit XML so a CI system shows each run as a test case (failed → failure, refused → skipped).</summary>
        public string ToJunit()
        {
            var s = Summary();
            var fails = Records.Count(r => r.Outcome == "failed");
            var cases = new List<string>();
            var keep = new HashSet<string> { "job", "outcome", "device", "refusal", "recovery", "transitions", "disposition", "findings" };
            foreach (var r in Records)
            {
                var name = QuoteAttr($"{r.Job} {r.Recipe ?? ""}".Trim());
                var body = "";
                if (r.Outcome == "failed")
                    body = $"<failure message={QuoteAttr(J.S(J.O(r.Status, "x-sim-fault"), "detail") ?? "failed")}/>";
                else if (r.Outcome == "refused")
                    body = $"<skipped message={QuoteAttr(J.PyStr(J.Get(r.Refusal, "reason")) + ": " + (J.Has(r.Refusal, "detail") ? J.PyStr(r.Refusal!["detail"]) : ""))}/>";
                var brief = new JsonObject();
                foreach (var kv in r.AsDict())
                    if (keep.Contains(kv.Key)) brief[kv.Key] = kv.Value?.DeepClone();
                body += $"<system-out>{XmlEscape(J.Dumps(brief))}</system-out>";
                cases.Add($"  <testcase classname=\"cookwala.samples\" name={name}>{body}</testcase>");
            }
            var refused = J.Long(J.Get(s["outcomes"], "refused"));
            return $"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<testsuite name={QuoteAttr(Title)} tests=\"{J.PyNum(s["runs"])}\" failures=\"{fails}\" " +
                   $"skipped=\"{refused}\">\n" + string.Join("\n", cases) + "\n</testsuite>\n";
        }

        private static string CsvField(string v) =>
            v.IndexOfAny(new[] { ',', '"', '\r', '\n' }) >= 0 ? "\"" + v.Replace("\"", "\"\"") + "\"" : v;

        /// <summary>CSV for spreadsheets (RFC 4180, CRLF line ends, as Python's csv module writes).</summary>
        public string ToCsv()
        {
            var sb = new StringBuilder();
            void Row(params string[] cells) => sb.Append(string.Join(",", cells.Select(CsvField))).Append("\r\n");
            Row("job", "recipe", "device", "outcome", "refusal", "recovery", "disposition", "human", "incident");
            foreach (var r in Records)
                Row(r.Job, r.Recipe ?? "", r.Device ?? "", r.Outcome, J.S(r.Refusal, "reason") ?? "", string.Join(" ", r.Recovery.Select(a => J.S(a, "action"))),
                    r.Disposition ?? "", r.Human.Count.ToString(CultureInfo.InvariantCulture), J.S(r.Incident, "category") ?? "");
            return sb.ToString();
        }

        /// <summary>Formats: json, markdown (md), junit, csv.</summary>
        public static readonly IReadOnlyList<string> Formats = new[] { "json", "markdown", "md", "junit", "csv" };

        /// <summary>Render in one of <see cref="Formats"/>; throws <see cref="KeyNotFoundException"/> otherwise.</summary>
        public string Render(string fmt) => fmt switch
        {
            "json" => ToJson(),
            "markdown" or "md" => ToMarkdown(),
            "junit" => ToJunit(),
            "csv" => ToCsv(),
            _ => throw new KeyNotFoundException(fmt),
        };
    }
}
