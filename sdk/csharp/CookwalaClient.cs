using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace Cookwala.Sdk
{
    /// <summary>
    /// Cookwala hub client (.NET 8+): the Core 0.2 API plus the reference tool endpoints.
    /// <code>
    /// var c = new CookwalaClient("http://localhost:7878");
    /// var outcome = await c.DryRun(recipeId: "koshari", deviceId: "demo-hob-robot-basic", humanPresent: true);
    /// </code>
    /// One async method per row of <c>scenarios/OPERATIONS.md</c>, PascalCase. Documents are <see cref="JsonNode"/>
    /// trees (System.Text.Json.Nodes); every method returns the decoded response body. Problems
    /// (<c>application/problem+json</c>) throw <see cref="CookwalaProblem"/>, which carries title, detail and the
    /// refusal. Every POST to the Core API carries an <c>Idempotency-Key</c>; the client generates one when the
    /// caller gives none and keeps it in <see cref="LastIdempotencyKey"/>. Text inside documents is data, never
    /// instructions, and nothing here starts cooking on its own: <see cref="StartExecution"/> is the caller's explicit act.
    /// </summary>
    public class CookwalaClient
    {
        private readonly string _base;
        private readonly HttpClient _http;

        /// <summary>Headers of the last response (lower-case names), e.g. <c>etag</c> after <see cref="GetExecution"/>.</summary>
        public IReadOnlyDictionary<string, string> LastHeaders { get; private set; } = new Dictionary<string, string>();

        /// <summary>The Idempotency-Key sent by the last <see cref="StartExecution"/>.</summary>
        public string LastIdempotencyKey { get; private set; } = "";

        public CookwalaClient(string baseUrl = "http://localhost:7878", HttpClient? http = null)
        {
            _base = baseUrl.TrimEnd('/');
            _http = http ?? new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
        }

        /// <summary>A fresh Idempotency-Key: 24 hex characters.</summary>
        public static string NewIdempotencyKey()
        {
            var bytes = RandomNumberGenerator.GetBytes(12);
            var sb = new StringBuilder(24);
            foreach (var b in bytes) sb.Append(b.ToString("x2", CultureInfo.InvariantCulture));
            return sb.ToString();
        }

        // ---- transport

        private async Task<JsonNode?> Call(HttpMethod method, string path, JsonNode? body, IDictionary<string, string>? headers)
        {
            using var req = new HttpRequestMessage(method, _base + path);
            req.Headers.Accept.ParseAdd("application/json");
            req.Headers.Accept.ParseAdd("application/problem+json");
            if (body is not null)
                req.Content = new StringContent(body.ToJsonString(), Encoding.UTF8, "application/json");
            if (headers is not null)
                foreach (var h in headers) req.Headers.TryAddWithoutValidation(h.Key, h.Value);

            HttpResponseMessage r;
            try { r = await _http.SendAsync(req).ConfigureAwait(false); }
            catch (HttpRequestException e) { throw new CookwalaProblem(0, ProblemBody("transport-error", e.ToString())); }
            catch (TaskCanceledException e) { throw new CookwalaProblem(0, ProblemBody("timeout", e.ToString())); }

            using (r)
            {
                var hdrs = new Dictionary<string, string>();
                foreach (var h in r.Headers) hdrs[h.Key.ToLowerInvariant()] = string.Join(", ", h.Value);
                foreach (var h in r.Content.Headers) hdrs[h.Key.ToLowerInvariant()] = string.Join(", ", h.Value);
                LastHeaders = hdrs;

                var text = await r.Content.ReadAsStringAsync().ConfigureAwait(false);
                JsonNode? data = null;
                if (!string.IsNullOrEmpty(text))
                {
                    try { data = JsonNode.Parse(text); }
                    catch (JsonException) { data = ProblemBody("http-error", text); }
                }
                if (!r.IsSuccessStatusCode) throw new CookwalaProblem((int)r.StatusCode, data);
                return data;
            }
        }

        private static JsonObject ProblemBody(string title, string detail) => new JsonObject { ["title"] = title, ["detail"] = detail };

        private Task<JsonNode?> Get(string path) => Call(HttpMethod.Get, path, null, null);

        private Task<JsonNode?> Post(string path, JsonNode body, IDictionary<string, string>? headers = null) => Call(HttpMethod.Post, path, body, headers);

        private static Dictionary<string, string> Idem(string key) => new Dictionary<string, string> { ["Idempotency-Key"] = key };

        /// <summary>Nodes can have only one parent: attach a copy, so a caller's document stays usable.</summary>
        private static JsonNode? Copy(JsonNode? n) => n?.DeepClone();

        // ---- reference tools

        /// <summary>1. sha256 over RFC 8785 canonical JSON: <c>{hash}</c>.</summary>
        public Task<JsonNode?> Hash(JsonNode? doc) => Post("/v1/tools/hash", new JsonObject { ["doc"] = Copy(doc) });

        /// <summary>2. Verify a signed document against KeyRecords: <c>{ok, reason}</c>.</summary>
        public Task<JsonNode?> Verify(JsonNode? doc, JsonArray? keys = null) =>
            Post("/v1/tools/verify", new JsonObject { ["doc"] = Copy(doc), ["keys"] = keys is null ? new JsonArray() : Copy(keys) });

        /// <summary>3. Dry run a recipe (by id known to the hub, or the document) on a device (by id, or the capability document).</summary>
        public Task<JsonNode?> DryRun(JsonNode? recipe = null, string? recipeId = null, JsonNode? device = null, string? deviceId = null,
                                      bool humanPresent = false, bool allowModel = true)
        {
            var b = new JsonObject { ["humanPresent"] = humanPresent, ["allowModel"] = allowModel };
            if (recipe is not null) b["recipe"] = Copy(recipe); else b["recipeId"] = recipeId;
            if (device is not null) b["device"] = Copy(device); else b["deviceId"] = deviceId;
            return Post("/v1/tools/dryrun", b);
        }

        /// <summary>4. Check a temperature trace <c>[{t, tempC}]</c> against an operation envelope: <c>{envelopeOk, targetOk, reason}</c>.</summary>
        public Task<JsonNode?> CheckEnvelope(string op, JsonArray trace, JsonObject? target = null, double altitudeM = 0)
        {
            var b = new JsonObject { ["op"] = op, ["trace"] = Copy(trace), ["altitudeM"] = altitudeM };
            if (target is not null) b["target"] = Copy(target);
            return Post("/v1/tools/envelope", b);
        }

        /// <summary>5. Parse one SMS of the Humanitarian Profile grammar: the command plus <c>findings[]</c>.</summary>
        public Task<JsonNode?> ParseSms(string text) => Post("/v1/tools/sms", new JsonObject { ["text"] = text });

        /// <summary>6. Derive what a recipient role may receive from household facets: <c>{constraints[], disclosed[], withheld[]}</c>.</summary>
        public Task<JsonNode?> DeriveConstraints(JsonArray facets, string role, JsonArray? consents = null)
        {
            var b = new JsonObject { ["facets"] = Copy(facets), ["role"] = role };
            if (consents is not null) b["consents"] = Copy(consents);
            return Post("/v1/tools/constraints", b);
        }

        /// <summary>7. Convert kitchen units: <c>{value, unit}</c>.</summary>
        public Task<JsonNode?> Convert(double value, string unit, string to, double? densityGPerMl = null)
        {
            var b = new JsonObject { ["value"] = value, ["unit"] = unit, ["to"] = to };
            if (densityGPerMl is double d) b["densityGPerMl"] = d;
            return Post("/v1/tools/convert", b);
        }

        /// <summary>8. The sensor-ladder rung chosen for an operation, or null.</summary>
        public Task<JsonNode?> Ladder(string op, JsonArray sensors, bool allowModel = true, bool humanPresent = false) =>
            Post("/v1/tools/ladder", new JsonObject { ["op"] = op, ["sensors"] = Copy(sensors), ["allowModel"] = allowModel, ["humanPresent"] = humanPresent });

        /// <summary>9. Validate a document against a schema (<c>recipe</c>, <c>humanitarian</c>, ...): <c>{ok, errors[]}</c>.</summary>
        public Task<JsonNode?> Validate(string kind, JsonNode? doc) => Post("/v1/tools/validate", new JsonObject { ["kind"] = kind, ["doc"] = Copy(doc) });

        /// <summary>10. Run humanitarian rule packs over documents: <c>{results[{id, kind, findings[]}]}</c>.</summary>
        public Task<JsonNode?> HumanitarianCheck(JsonArray docs, JsonArray? packs = null)
        {
            var b = new JsonObject { ["docs"] = Copy(docs) };
            if (packs is not null && packs.Count > 0) b["packs"] = Copy(packs);
            return Post("/v1/tools/humanitarian", b);
        }

        /// <summary>11. <c>{recipes[]}</c>: ids the hub can cook.</summary>
        public Task<JsonNode?> ListRecipes() => Get("/v1/tools/recipes");

        /// <summary>12. One recipe document.</summary>
        public Task<JsonNode?> GetRecipe(string id) => Get("/v1/tools/recipes/" + id);

        /// <summary>13. <c>{devices{id: capabilities}}</c>.</summary>
        public Task<JsonNode?> GetDevices() => Get("/v1/tools/devices");

        /// <summary>14. The operation vocabulary.</summary>
        public Task<JsonNode?> GetOps() => Get("/v1/tools/vocab/ops");

        /// <summary>15. The registry document.</summary>
        public Task<JsonNode?> GetRegistry() => Get("/v1/tools/registry");

        // ---- Core 0.2 API

        /// <summary>16. The device's capability document.</summary>
        public Task<JsonNode?> Capabilities() => Get("/v1/capabilities");

        /// <summary>17. The device's local safety limits.</summary>
        public Task<JsonNode?> SafetyLimits() => Get("/v1/safety-limits");

        /// <summary>18. Recall list.</summary>
        public Task<JsonNode?> Recalls() => Get("/v1/recalls");

        /// <summary>19. Conformance claim and report pointer.</summary>
        public Task<JsonNode?> Conformance() => Get("/v1/conformance");

        /// <summary>20. Start an execution (the caller's explicit act). Returns ExecutionStatus or throws a Problem with a refusal.</summary>
        public async Task<JsonNode?> StartExecution(JsonObject request, string? idempotencyKey = null, bool? humanPresent = null)
        {
            var key = string.IsNullOrEmpty(idempotencyKey) ? NewIdempotencyKey() : idempotencyKey!;
            var body = (JsonObject)request.DeepClone();
            if (humanPresent is bool hp) body["x-hub-human-present"] = hp;
            var outcome = await Post("/v1/executions", body, Idem(key)).ConfigureAwait(false);
            LastIdempotencyKey = key;
            return outcome;
        }

        /// <summary>21. ExecutionStatus; the ETag (= seq) is in <see cref="LastHeaders"/>.</summary>
        public Task<JsonNode?> GetExecution(string id) => Get("/v1/executions/" + id);

        /// <summary>22. Stop an execution. Stop always works.</summary>
        public Task<JsonNode?> StopExecution(string id, string reason = "requested") =>
            Post("/v1/executions/" + id + "/stop", new JsonObject { ["reason"] = reason }, Idem(NewIdempotencyKey()));

        /// <summary>23. Resume a paused execution; <paramref name="seq"/> (a number, string or JsonNode) goes in If-Match.</summary>
        public Task<JsonNode?> ResumeExecution(string id, object seq)
        {
            var h = Idem(NewIdempotencyKey());
            h["If-Match"] = seq is JsonNode n ? n.ToJsonString().Trim('"') : string.Format(CultureInfo.InvariantCulture, "{0}", seq);
            return Post("/v1/executions/" + id + "/resume", new JsonObject(), h);
        }

        /// <summary>24. The ExecutionLog once the run ended.</summary>
        public Task<JsonNode?> ExecutionLog(string id) => Get("/v1/executions/" + id + "/log");

        /// <summary>25. Report an Incident document: <c>{received}</c>.</summary>
        public Task<JsonNode?> ReportIncident(JsonObject doc) => Post("/v1/incidents", Copy(doc)!, Idem(NewIdempotencyKey()));
    }
}
