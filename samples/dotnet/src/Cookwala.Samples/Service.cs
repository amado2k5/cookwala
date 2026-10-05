using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;

namespace Cookwala.Samples
{
    /// <summary>Package version and the Core version it speaks.</summary>
    public static class Samples
    {
        public const string Version = "0.2.0";
    }

    /// <summary>
    /// The samples as a small HTTP service: one framework-free handler, used by every deployment target.
    /// <list type="table">
    /// <item><term>GET /health</term><description>liveness</description></item>
    /// <item><term>GET /v1/samples</term><description>what is bundled (recipes, devices) and the endpoints</description></item>
    /// <item><term>POST /v1/samples/gates</term><description>the gate pipeline: {recipe, device?, humanPresent?, allergenBlocks?, requestedBy?, mandate?}</description></item>
    /// <item><term>POST /v1/samples/plan</term><description>planner agent and device ranking: {order: {dish, servings?, allergenBlocks?}, humanPresent?}</description></item>
    /// <item><term>POST /v1/samples/run</term><description>orchestrate jobs on the simulated kitchen: {jobs?: [{id, order, humanPresent}], faults?}</description></item>
    /// <item><term>GET /v1/samples/demo?format=</term><description>the demo report (json | markdown | junit | csv)</description></item>
    /// </list>
    /// Everything runs on simulated devices from the bundle. The service never calls another host, so it can run as a
    /// public function without becoming a proxy to anyone's kitchen.
    /// </summary>
    public static class Service
    {
        public const int MaxBody = 256 * 1024;
        public const int MaxJobs = 20;

        public static readonly IReadOnlyDictionary<string, string> Types = new Dictionary<string, string>
        {
            ["json"] = "application/json", ["markdown"] = "text/markdown; charset=utf-8", ["md"] = "text/markdown; charset=utf-8",
            ["junit"] = "application/xml", ["csv"] = "text/csv; charset=utf-8",
        };

        public static readonly ISet<string> FaultKinds = new HashSet<string> { "sensor_fault", "timeout", "overheat" };

        private static (int, string, string) Json(int status, JsonNode body) => (status, "application/json", J.Dumps(body));

        private static (int, string, string) Problem(int status, string title, string? detail = null)
        {
            var body = new JsonObject { ["type"] = $"https://cookwala.ai/errors/{title}", ["title"] = title };
            if (!string.IsNullOrEmpty(detail)) body["detail"] = detail;
            return (status, "application/problem+json", J.Dumps(body));
        }

        private static (int, string, string) Report(Reporter rep, string fmt)
        {
            if (!Types.ContainsKey(fmt)) return Problem(400, "invalid-request", $"format must be one of {J.PyList(J.Sorted(Types.Keys))}");
            return (200, Types[fmt], rep.Render(fmt));
        }

        private static List<Job> ParseJobs(JsonNode? raw)
        {
            if (raw is not JsonArray a || a.Count < 1 || a.Count > MaxJobs) throw new ArgumentException($"jobs must be a list of 1..{MaxJobs}");
            var outList = new List<Job>();
            for (var i = 0; i < a.Count; i++)
            {
                var j = a[i] as JsonObject;
                var order = J.O(j, "order");
                if (j == null || order == null || J.S(order, "dish") == null) throw new ArgumentException($"jobs[{i}] needs order.dish");
                var id = J.Has(j, "id") ? J.PyStr(j["id"]) : $"job-{i + 1}";
                outList.Add(new Job(id.Length > 64 ? id.Substring(0, 64) : id, order: (JsonObject)order.DeepClone(), humanPresent: J.Truthy(J.Get(j, "humanPresent"))));
            }
            return outList;
        }

        private static PlannerAgent ServicePlanner(IHuman human) =>
            new PlannerAgent("agent:planner-svc", Mandates.Make("household:h-svc/person:p-1", "agent:planner-svc"), new BundleCatalog(), human);

        /// <summary>Run jobs on the simulated kitchen with a planner and a person who says yes. Returns a Reporter.</summary>
        public static Reporter RunJobs(IEnumerable<Job> jobs, IDictionary<string, string>? faults = null)
        {
            var human = new ScriptedHuman(present: true);
            var planner = ServicePlanner(human);
            var orch = new Orchestrator(Scenarios.Kitchen(faults ?? new Dictionary<string, string>()), planner: planner, human: human, recalls: new List<JsonObject>());
            return new Reporter(jobs.Select(orch.Run).ToList(), title: "Cookwala samples run");
        }

        /// <summary>Handle one request: returns (status, content type, body text). <paramref name="body"/> is the parsed JSON body or null.</summary>
        public static (int Status, string ContentType, string Body) Handle(string method, string path, IDictionary<string, string>? query = null, JsonNode? body = null)
        {
            var q = query ?? new Dictionary<string, string>();
            var fmt = (q.TryGetValue("format", out var f) && !string.IsNullOrEmpty(f) ? f : "json").ToLowerInvariant();
            try
            {
                if (method == "GET" && (path == "/health" || path == "/healthz" || path == "/"))
                    return Json(200, new JsonObject { ["ok"] = true, ["service"] = "cookwala-samples", ["version"] = Samples.Version, ["core"] = Bundle.Core });
                if (method == "GET" && path == "/v1/samples")
                {
                    var recipes = new JsonObject();
                    foreach (var kv in Bundle.Recipes)
                        recipes[kv.Key] = new JsonObject { ["ref"] = Bundle.GlobalRef((JsonObject)kv.Value!), ["hash"] = Jcs.DocHash(kv.Value) };
                    return Json(200, new JsonObject
                    {
                        ["version"] = Samples.Version, ["recipes"] = recipes, ["devices"] = J.StrArray(J.Sorted(Bundle.Devices.Select(kv => kv.Key))),
                        ["endpoints"] = J.StrArray(new[] { "/v1/samples/gates", "/v1/samples/plan", "/v1/samples/run", "/v1/samples/demo" }),
                        ["note"] = "simulated devices; nothing is cooked",
                    });
                }
                if (method == "GET" && path == "/v1/samples/demo") return Report(Scenarios.Demo(), fmt);
                if (method != "POST") return Problem(404, "not-found");
                if (!J.Truthy(body)) body = new JsonObject();
                if (body is not JsonObject b) return Problem(400, "invalid-request", "body must be a JSON object");
                if (path == "/v1/samples/gates")
                {
                    var recipe = new BundleCatalog().Get(J.Has(b, "recipe") ? J.PyStr(b["recipe"]) : "");
                    if (recipe == null) return Problem(400, "invalid-request", $"recipe must be one of {J.PyList(J.Sorted(Bundle.Recipes.Select(kv => kv.Key)))}");
                    var wantDevice = J.Truthy(J.Get(b, "device"));
                    var device = wantDevice ? J.O(Bundle.Devices, J.PyStr(b["device"])) : null;
                    if (wantDevice && device == null) return Problem(400, "invalid-request", $"device must be one of {J.PyList(J.Sorted(Bundle.Devices.Select(kv => kv.Key)))}");
                    var blocks = J.Get(b, "allergenBlocks");
                    if (blocks != null && blocks is not JsonArray) throw new ArgumentException("allergenBlocks must be a list");
                    var req = new JsonObject
                    {
                        ["core"] = "0.2.0", ["kind"] = "ExecuteRequest", ["id"] = "gates-check", ["recipe"] = Bundle.GlobalRef(recipe),
                        ["recipeHash"] = J.Has(b, "recipeHash") ? J.Clone(b["recipeHash"]) : Jcs.DocHash(recipe),
                        ["requestedBy"] = J.Has(b, "requestedBy") ? J.PyStr(b["requestedBy"]) : "person:p-1", ["idempotencyKey"] = "gates-check-0001",
                        ["allergenBlocks"] = J.Clone(blocks) ?? new JsonArray(),
                    };
                    if (J.O(b, "mandate") is JsonObject m) req["mandate"] = m.DeepClone();
                    var d = GatePipeline.Default().Run(new GateContext(req, recipe, device, J.Truthy(J.Get(b, "humanPresent"))));
                    return Json(200, d.AsDict());
                }
                if (path == "/v1/samples/plan")
                {
                    var order = J.O(b, "order");
                    if (order == null || J.S(order, "dish") == null) return Problem(400, "invalid-request", "order.dish is required");
                    var human = new ScriptedHuman(present: J.Truthy(J.Get(b, "humanPresent")), confirm: J.Truthy(J.Get(b, "confirm")));
                    var planner = ServicePlanner(human);
                    var p = planner.Propose((JsonObject)order.DeepClone());
                    var outObj = p.AsDict();
                    if (p.Ok)
                    {
                        var orch = new Orchestrator(Scenarios.Kitchen(), planner: planner);
                        var ranking = new JsonArray();
                        foreach (var (n, dr) in orch.Rank(p.Recipe!, human.Present))
                        {
                            var row = new JsonObject { ["device"] = n, ["state"] = J.S(dr, "state") };
                            if (J.Truthy(J.Get(dr, "refusal"))) row["reason"] = J.Clone(J.Get(J.O(dr, "refusal"), "reason"));
                            row["humanSteps"] = J.Items(dr, "plan").Count(s => J.S(s, "verifiedBy") == "human");
                            ranking.Add(row);
                        }
                        outObj["ranking"] = ranking;
                    }
                    return Json(200, outObj);
                }
                if (path == "/v1/samples/run")
                {
                    var jobs = b.ContainsKey("jobs") ? ParseJobs(b["jobs"]) : null;
                    var faultsNode = J.Has(b, "faults") ? b["faults"] : new JsonObject();
                    var faults = new Dictionary<string, string>();
                    var faultsOk = faultsNode is JsonObject fo;
                    if (faultsOk)
                        foreach (var kv in (JsonObject)faultsNode!)
                        {
                            var v = J.Str(kv.Value);
                            if (v == null || !FaultKinds.Contains(v)) { faultsOk = false; break; }
                            faults[kv.Key] = v;
                        }
                    if (!faultsOk) return Problem(400, "invalid-request", $"faults maps \"recipe-id#node\" to one of {J.PyList(J.Sorted(FaultKinds))}");
                    return Report(jobs == null ? Scenarios.Demo() : RunJobs(jobs, faults), fmt);
                }
                return Problem(404, "not-found");
            }
            catch (Exception e) when (e is ArgumentException || e is KeyNotFoundException || e is InvalidOperationException || e is InvalidCastException ||
                                      e is FormatException || e is JsonException)
            {
                return Problem(400, "invalid-request", $"{e.GetType().Name}: {e.Message}");
            }
        }

        /// <summary>Adapters call this: <paramref name="url"/> may carry <c>?format=</c>; <paramref name="rawBody"/> is the request body.</summary>
        public static (int Status, string ContentType, string Body) HandleRaw(string method, string url, byte[]? rawBody = null)
        {
            var qpos = url.IndexOf('?');
            var path = qpos >= 0 ? url.Substring(0, qpos) : url;
            var query = new Dictionary<string, string>();
            if (qpos >= 0)
            {
                foreach (var part in url.Substring(qpos + 1).Split('&', StringSplitOptions.RemoveEmptyEntries))
                {
                    var eq = part.IndexOf('=');
                    if (eq <= 0 || eq == part.Length - 1) continue; // parse_qs drops blank values
                    string Dec(string s) => Uri.UnescapeDataString(s.Replace('+', ' '));
                    query[Dec(part.Substring(0, eq))] = Dec(part.Substring(eq + 1));
                }
            }
            if (rawBody != null && rawBody.Length > MaxBody) return Problem(413, "too-large", $"body over {MaxBody} bytes");
            JsonNode? body = null;
            if (rawBody != null && rawBody.Length > 0)
            {
                try
                {
                    body = JsonNode.Parse(rawBody);
                }
                catch (JsonException e)
                {
                    return Problem(400, "invalid-request", $"body is not JSON: {e.Message}");
                }
            }
            path = path.TrimEnd('/');
            return Handle(method.ToUpperInvariant(), path.Length > 0 ? path : "/", query, body);
        }

        /// <summary>Same as <see cref="HandleRaw(string, string, byte[])"/> with a text body.</summary>
        public static (int Status, string ContentType, string Body) HandleRaw(string method, string url, string rawBody) =>
            HandleRaw(method, url, Encoding.UTF8.GetBytes(rawBody));

        /// <summary>Serve on <paramref name="bind"/>:<paramref name="port"/> with HttpListener until cancelled (Ctrl+C in the CLI).</summary>
        public static async Task ServeAsync(int port = 8080, string bind = "127.0.0.1", CancellationToken cancel = default)
        {
            var host = bind == "0.0.0.0" || bind == "*" || bind == "::" ? "+" : bind;
            using var listener = new HttpListener();
            listener.Prefixes.Add($"http://{host}:{port}/");
            // HttpListener matches the Host header: answer "localhost" too when bound to the loopback address.
            if (bind == "127.0.0.1") listener.Prefixes.Add($"http://localhost:{port}/");
            if (bind == "localhost") listener.Prefixes.Add($"http://127.0.0.1:{port}/");
            listener.Start();
            Console.WriteLine($"cookwala-samples {Samples.Version} on http://{bind}:{port}  (simulated devices; GET /v1/samples)");
            using var reg = cancel.Register(() => { try { listener.Stop(); } catch (ObjectDisposedException) { } });
            while (!cancel.IsCancellationRequested)
            {
                HttpListenerContext ctx;
                try
                {
                    ctx = await listener.GetContextAsync().ConfigureAwait(false);
                }
                catch (Exception) when (cancel.IsCancellationRequested)
                {
                    break;
                }
                catch (HttpListenerException)
                {
                    break;
                }
                _ = Task.Run(() => Answer(ctx));
            }
        }

        private static void Answer(HttpListenerContext ctx)
        {
            try
            {
                using var ms = new MemoryStream();
                var buf = new byte[8192];
                int n;
                while (ms.Length <= MaxBody && (n = ctx.Request.InputStream.Read(buf, 0, buf.Length)) > 0) ms.Write(buf, 0, n);
                var (status, ctype, text) = HandleRaw(ctx.Request.HttpMethod, ctx.Request.RawUrl ?? "/", ms.ToArray());
                var data = Encoding.UTF8.GetBytes(text);
                ctx.Response.StatusCode = status;
                ctx.Response.ContentType = ctype;
                ctx.Response.ContentLength64 = data.Length;
                ctx.Response.Headers["Server"] = $"cookwala-samples/{Samples.Version}";
                ctx.Response.OutputStream.Write(data, 0, data.Length);
                ctx.Response.OutputStream.Close();
            }
            catch (Exception)
            {
                try { ctx.Response.Abort(); } catch (Exception) { }
            }
        }

        /// <summary>Serve until the process is stopped.</summary>
        public static void Serve(int port = 8080, string bind = "127.0.0.1") => ServeAsync(port, bind).GetAwaiter().GetResult();
    }
}
