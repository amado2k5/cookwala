using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;

namespace Cookwala.Samples
{
    /// <summary>
    /// The interface orchestrators, agents and recovery use: the Core 0.2 API plus a dry run and a clock step.
    /// <see cref="HubClient"/> speaks HTTP, <see cref="LocalClient"/> drives a <see cref="SimulatedExecutor"/> in process,
    /// so a sample written offline runs unchanged against a real hub.
    /// </summary>
    public interface IExecutorClient
    {
        string Name { get; }
        Task<JsonObject> CapabilitiesAsync();
        Task<JsonObject> SafetyLimitsAsync();
        Task<JsonArray> RecallsAsync();
        Task<JsonObject> StartExecutionAsync(JsonObject request, string? idempotencyKey = null, bool? humanPresent = null);
        Task<JsonObject> GetExecutionAsync(string executionId);
        Task<JsonObject> StopExecutionAsync(string executionId, string reason = "requested");
        Task<JsonObject> ResumeExecutionAsync(string executionId, long seq);
        Task<JsonObject> ExecutionLogAsync(string executionId);
        Task<JsonNode?> ReportIncidentAsync(JsonObject doc);
        /// <summary>The dry run the executor would do, without starting anything.</summary>
        Task<JsonObject> DryRunAsync(JsonObject recipe, bool humanPresent = false);
        /// <summary>Let time pass: one simulator tick, or one poll interval against a real executor.</summary>
        Task AdvanceAsync();
    }

    /// <summary>Random keys for Idempotency-Key headers and request ids.</summary>
    public static class Keys
    {
        /// <summary><c>prefix-</c> and 20 random hex digits.</summary>
        public static string New(string prefix = "cw") => $"{prefix}-{Convert.ToHexString(RandomNumberGenerator.GetBytes(10)).ToLowerInvariant()}";
    }

    /// <summary>
    /// Core 0.2 API over HTTP (HttpClient, System.Text.Json). Network retries reuse the same Idempotency-Key, so a POST
    /// that reached the executor before the connection dropped is not executed twice. 502/503/504 are retried with backoff.
    /// </summary>
    public class HubClient : IExecutorClient
    {
        private static readonly HttpClient Shared = new HttpClient { Timeout = System.Threading.Timeout.InfiniteTimeSpan };
        private readonly HttpClient http;

        public string BaseUrl { get; }
        public string? Token { get; }
        public TimeSpan Timeout { get; }
        public int Retries { get; }
        public TimeSpan Backoff { get; }
        public TimeSpan Poll { get; }
        public string Name { get; }
        /// <summary>Headers of the last successful response.</summary>
        public IDictionary<string, string> LastHeaders { get; private set; } = new Dictionary<string, string>();

        public HubClient(string baseUrl = "http://localhost:7878", string? token = null, double timeoutS = 30, int retries = 4, double backoffS = 0.5,
                         double pollS = 0.5, string? name = null, HttpClient? httpClient = null)
        {
            BaseUrl = baseUrl.TrimEnd('/');
            Token = token;
            Timeout = TimeSpan.FromSeconds(timeoutS);
            Retries = retries;
            Backoff = TimeSpan.FromSeconds(backoffS);
            Poll = TimeSpan.FromSeconds(pollS);
            Name = name ?? BaseUrl;
            http = httpClient ?? Shared;
        }

        /// <summary>One call with retries; returns the parsed body (null when empty) or throws <see cref="CookwalaProblem"/>.</summary>
        public async Task<JsonNode?> CallAsync(string method, string path, JsonNode? body = null, IDictionary<string, string>? headers = null)
        {
            var data = body != null ? body.ToJsonString() : null;
            for (var attempt = 0; ; attempt++)
            {
                using var req = new HttpRequestMessage(new HttpMethod(method), BaseUrl + path);
                req.Headers.TryAddWithoutValidation("Accept", "application/vnd.cookwala+json, application/json, application/problem+json");
                if (data != null)
                {
                    req.Content = new StringContent(data, Encoding.UTF8);
                    req.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.cookwala+json");
                }
                if (!string.IsNullOrEmpty(Token)) req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", Token);
                foreach (var kv in headers ?? new Dictionary<string, string>()) req.Headers.TryAddWithoutValidation(kv.Key, kv.Value);
                HttpResponseMessage resp;
                string raw;
                try
                {
                    using var cts = new CancellationTokenSource(Timeout);
                    resp = await http.SendAsync(req, cts.Token).ConfigureAwait(false);
                    raw = await resp.Content.ReadAsStringAsync(cts.Token).ConfigureAwait(false);
                }
                catch (Exception e) when (e is HttpRequestException || e is OperationCanceledException || e is System.IO.IOException)
                {
                    if (attempt >= Retries) throw new CookwalaProblem(0, new JsonObject { ["title"] = "unreachable", ["detail"] = e.Message });
                    await Task.Delay(Wait(attempt)).ConfigureAwait(false);
                    continue;
                }
                using (resp)
                {
                    var code = (int)resp.StatusCode;
                    if (resp.IsSuccessStatusCode)
                    {
                        LastHeaders = resp.Headers.Concat(resp.Content.Headers).ToDictionary(h => h.Key, h => string.Join(", ", h.Value));
                        return raw.Length > 0 ? JsonNode.Parse(raw) : null;
                    }
                    JsonNode? payload;
                    try { payload = JsonNode.Parse(raw); }
                    catch (JsonException) { payload = new JsonObject { ["title"] = "http-error", ["detail"] = raw }; }
                    if ((code == 502 || code == 503 || code == 504) && attempt < Retries)
                    {
                        await Task.Delay(Wait(attempt)).ConfigureAwait(false);
                        continue;
                    }
                    throw new CookwalaProblem(code, payload);
                }
            }
        }

        private TimeSpan Wait(int attempt) => TimeSpan.FromTicks(Backoff.Ticks * (1L << Math.Min(attempt, 20)));

        private async Task<JsonObject> Obj(string method, string path, JsonNode? body = null, IDictionary<string, string>? headers = null) =>
            await CallAsync(method, path, body, headers).ConfigureAwait(false) as JsonObject ?? new JsonObject();

        public Task<JsonObject> CapabilitiesAsync() => Obj("GET", "/v1/capabilities");
        public Task<JsonObject> SafetyLimitsAsync() => Obj("GET", "/v1/safety-limits");

        public async Task<JsonArray> RecallsAsync()
        {
            var r = await CallAsync("GET", "/v1/recalls").ConfigureAwait(false);
            var a = r as JsonArray ?? J.A(r, "recalls");
            return a != null ? (JsonArray)a.DeepClone() : new JsonArray();
        }

        public Task<JsonObject> StartExecutionAsync(JsonObject request, string? idempotencyKey = null, bool? humanPresent = null)
        {
            var key = idempotencyKey ?? J.S(request, "idempotencyKey") ?? Keys.New("ex");
            var body = (JsonObject)request.DeepClone();
            if (humanPresent.HasValue) body["x-hub-human-present"] = humanPresent.Value; // reference-hub extension; real hubs sense presence
            return Obj("POST", "/v1/executions", body, new Dictionary<string, string> { ["Idempotency-Key"] = key });
        }

        public Task<JsonObject> GetExecutionAsync(string executionId) => Obj("GET", $"/v1/executions/{executionId}");

        public Task<JsonObject> StopExecutionAsync(string executionId, string reason = "requested") =>
            Obj("POST", $"/v1/executions/{executionId}/stop", new JsonObject { ["reason"] = reason });

        public Task<JsonObject> ResumeExecutionAsync(string executionId, long seq) =>
            Obj("POST", $"/v1/executions/{executionId}/resume", new JsonObject(),
                new Dictionary<string, string> { ["Idempotency-Key"] = Keys.New("resume"), ["If-Match"] = $"\"{seq.ToString(CultureInfo.InvariantCulture)}\"" });

        public Task<JsonObject> ExecutionLogAsync(string executionId) => Obj("GET", $"/v1/executions/{executionId}/log");

        public Task<JsonNode?> ReportIncidentAsync(JsonObject doc) =>
            CallAsync("POST", "/v1/incidents", doc.DeepClone(), new Dictionary<string, string> { ["Idempotency-Key"] = Keys.New("inc") });

        /// <summary>Reference-hub tool (not Core): the dry run the hub would do, without starting anything.</summary>
        public async Task<JsonObject> DryRunAsync(JsonObject recipe, bool humanPresent = false)
        {
            var device = await CapabilitiesAsync().ConfigureAwait(false);
            return await Obj("POST", "/v1/tools/dryrun", new JsonObject { ["recipe"] = recipe.DeepClone(), ["device"] = device, ["humanPresent"] = humanPresent }).ConfigureAwait(false);
        }

        /// <summary>A real executor runs on its own clock; the client only waits and polls.</summary>
        public Task AdvanceAsync() => Task.Delay(Poll);
    }

    /// <summary>The same interface over an in-process <see cref="SimulatedExecutor"/>; every task completes synchronously.</summary>
    public class LocalClient : IExecutorClient
    {
        public SimulatedExecutor Executor { get; }
        public string Name { get; }

        public LocalClient(SimulatedExecutor executor, string? name = null)
        {
            Executor = executor;
            Name = name ?? J.S(J.O(executor.Caps, "actor"), "id") ?? "simulated";
        }

        /// <summary>A client for one bundled device.</summary>
        public static LocalClient ForDevice(string device, IDictionary<string, string>? faults = null, int busy = 0, IEnumerable<JsonObject>? recalls = null) =>
            new LocalClient(SimulatedExecutor.FromBundle(device, faults, busy, recalls), device);

        public Task<JsonObject> CapabilitiesAsync() => Task.FromResult(Executor.Capabilities());
        public Task<JsonObject> SafetyLimitsAsync() => Task.FromResult(Executor.SafetyLimits());
        public Task<JsonArray> RecallsAsync() => Task.FromResult(Executor.Recalls());

        public Task<JsonObject> StartExecutionAsync(JsonObject request, string? idempotencyKey = null, bool? humanPresent = null) =>
            Run(() => Executor.StartExecution(request, idempotencyKey ?? J.S(request, "idempotencyKey") ?? Keys.New("ex"), humanPresent ?? false));

        public Task<JsonObject> GetExecutionAsync(string executionId) => Run(() => Executor.GetExecution(executionId));
        public Task<JsonObject> StopExecutionAsync(string executionId, string reason = "requested") => Run(() => Executor.StopExecution(executionId, reason));
        public Task<JsonObject> ResumeExecutionAsync(string executionId, long seq) => Run(() => Executor.ResumeExecution(executionId, seq));
        public Task<JsonObject> ExecutionLogAsync(string executionId) => Run(() => Executor.ExecutionLog(executionId));
        public Task<JsonNode?> ReportIncidentAsync(JsonObject doc) => Run<JsonNode?>(() => Executor.ReportIncident(doc));

        public Task<JsonObject> DryRunAsync(JsonObject recipe, bool humanPresent = false) =>
            Task.FromResult(Simulator.DryRun(recipe, Executor.Caps, humanPresent, true, Executor.Limits, Simulator.Iso(Executor.Now)));

        public Task AdvanceAsync()
        {
            Executor.Tick();
            return Task.CompletedTask;
        }

        private static Task<T> Run<T>(Func<T> f)
        {
            try { return Task.FromResult(f()); }
            catch (Exception e) { return Task.FromException<T>(e); }
        }
    }

    /// <summary>Recipes from the bundled snapshot (four example recipes from the Cookwala repository).</summary>
    public class BundleCatalog
    {
        public JsonObject Recipes { get; }

        public BundleCatalog(JsonObject? recipes = null)
        {
            Recipes = recipes ?? Bundle.Recipes;
        }

        /// <summary>Recipe keys, sorted.</summary>
        public List<string> List() => J.Sorted(Recipes.Select(kv => kv.Key));

        /// <summary>A recipe by key, document id or global reference; null when unknown.</summary>
        public JsonObject? Get(string key)
        {
            foreach (var kv in Recipes)
                if (kv.Value is JsonObject doc && (key == kv.Key || key == J.S(doc, "id") || key == Bundle.GlobalRef(doc))) return doc;
            return null;
        }

        /// <summary>Match a dish by key, id or English name. The text is a lookup key, never an instruction.</summary>
        public List<JsonObject> Find(string text)
        {
            var t = text.Trim().ToLowerInvariant();
            return Recipes.Where(kv => kv.Value is JsonObject d && (kv.Key.Contains(t, StringComparison.Ordinal) || (J.S(d, "id") ?? "").Contains(t, StringComparison.Ordinal) ||
                                                                   (J.S(J.O(J.O(d, "dish"), "names"), "en") ?? "").ToLowerInvariant().Contains(t, StringComparison.Ordinal)))
                          .Select(kv => (JsonObject)kv.Value!).ToList();
        }

        /// <summary>(global reference, document hash).</summary>
        public (string Ref, string Hash) RefAndHash(JsonObject doc) => (Bundle.GlobalRef(doc), Jcs.DocHash(doc));
    }

    /// <summary>Recipes served by the reference hub's /v1/tools/recipes (file stems) and /v1/tools/recipes/{stem}.</summary>
    public class HubCatalog : BundleCatalog
    {
        private HubCatalog(JsonObject recipes) : base(recipes) { }

        /// <summary>Fetch every recipe the hub serves.</summary>
        public static async Task<HubCatalog> CreateAsync(HubClient client)
        {
            var stems = J.Strings(await client.CallAsync("GET", "/v1/tools/recipes").ConfigureAwait(false), "recipes");
            var recipes = new JsonObject();
            foreach (var s in stems) recipes[s] = await client.CallAsync("GET", $"/v1/tools/recipes/{s}").ConfigureAwait(false);
            return new HubCatalog(recipes);
        }
    }
}
