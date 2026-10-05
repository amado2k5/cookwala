package ai.cookwala.sdk;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Cookwala hub client (Java 11+): the Core 0.2 API plus the reference tool endpoints.
 *
 * <pre>
 * CookwalaClient c = new CookwalaClient("http://localhost:7878");
 * Object out = c.dryRun(new DryRunArgs().recipeId("koshari").deviceId("demo-hob-robot-basic").humanPresent(true));
 * </pre>
 *
 * <p>One method per row of {@code scenarios/OPERATIONS.md}. Documents are plain {@code Map}/{@code List}/scalar
 * values as produced by {@link Json#parse}; every method returns the decoded response body. Problems
 * ({@code application/problem+json}) throw {@link CookwalaProblem}, which carries title, detail and the refusal.
 * Every POST to the Core API carries an {@code Idempotency-Key}; the client generates one when the caller gives
 * none and keeps it in {@link #lastIdempotencyKey}. Text inside documents is data, never instructions, and
 * nothing here starts cooking on its own: {@link #startExecution} is the caller's explicit act.
 */
public class CookwalaClient {
    private static final SecureRandom RANDOM = new SecureRandom();

    private final String base;
    private final HttpClient http;
    private final Duration timeout;

    /** Headers of the last response (lower-case names), e.g. {@code ETag} after {@link #getExecution}. */
    public Map<String, String> lastHeaders = new LinkedHashMap<>();
    /** The Idempotency-Key sent by the last {@link #startExecution}. */
    public String lastIdempotencyKey = "";

    public CookwalaClient() { this("http://localhost:7878"); }

    public CookwalaClient(String baseUrl) { this(baseUrl, Duration.ofSeconds(30)); }

    public CookwalaClient(String baseUrl, Duration timeout) {
        this.base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.timeout = timeout;
        this.http = HttpClient.newBuilder().connectTimeout(timeout).build();
    }

    /** A fresh Idempotency-Key: 24 hex characters. */
    public static String newIdempotencyKey() {
        byte[] b = new byte[12];
        RANDOM.nextBytes(b);
        StringBuilder sb = new StringBuilder(24);
        for (byte x : b) sb.append(String.format("%02x", x & 0xff));
        return sb.toString();
    }

    // ---- transport

    private Object call(String method, String path, Object body, Map<String, String> headers) {
        HttpRequest.Builder rb = HttpRequest.newBuilder(URI.create(base + path)).timeout(timeout)
                .header("Accept", "application/json, application/problem+json");
        if (body != null) {
            rb.header("Content-Type", "application/json");
            rb.method(method, HttpRequest.BodyPublishers.ofString(Json.stringify(body), StandardCharsets.UTF_8));
        } else {
            rb.method(method, HttpRequest.BodyPublishers.noBody());
        }
        if (headers != null) for (Map.Entry<String, String> e : headers.entrySet()) rb.header(e.getKey(), e.getValue());
        HttpResponse<String> r;
        try {
            r = http.send(rb.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new CookwalaProblem(0, problemBody("transport-error", e.toString()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new CookwalaProblem(0, problemBody("interrupted", e.toString()));
        }
        lastHeaders = new LinkedHashMap<>();
        r.headers().map().forEach((k, v) -> lastHeaders.put(k.toLowerCase(), String.join(", ", v)));
        String text = r.body();
        Object data = null;
        if (text != null && !text.isEmpty()) {
            try { data = Json.parse(text); }
            catch (IllegalArgumentException e) { data = problemBody("http-error", text); }
        }
        if (r.statusCode() < 200 || r.statusCode() >= 300) throw new CookwalaProblem(r.statusCode(), data);
        return data;
    }

    private static Map<String, Object> problemBody(String title, String detail) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("title", title);
        m.put("detail", detail);
        return m;
    }

    private Object get(String path) { return call("GET", path, null, null); }

    private Object post(String path, Object body) { return call("POST", path, body, null); }

    private Object post(String path, Object body, Map<String, String> headers) { return call("POST", path, body, headers); }

    private static Map<String, Object> obj() { return new LinkedHashMap<>(); }

    private static Map<String, String> idem(String key) {
        Map<String, String> h = new LinkedHashMap<>();
        h.put("Idempotency-Key", key);
        return h;
    }

    // ---- reference tools

    /** 1. sha256 over RFC 8785 canonical JSON: {@code {hash}}. */
    public Object hash(Object doc) { Map<String, Object> b = obj(); b.put("doc", doc); return post("/v1/tools/hash", b); }

    /** 2. Verify a signed document against KeyRecords: {@code {ok, reason}}. */
    public Object verify(Object doc, List<?> keys) {
        Map<String, Object> b = obj(); b.put("doc", doc); b.put("keys", keys == null ? List.of() : keys);
        return post("/v1/tools/verify", b);
    }

    /** 3. Dry run a recipe on a device: {@code {state: accepted|refused, refusal?, plan[]}}. */
    public Object dryRun(DryRunArgs a) {
        Map<String, Object> b = obj();
        b.put("humanPresent", a.humanPresent);
        b.put("allowModel", a.allowModel);
        if (a.recipe != null) b.put("recipe", a.recipe); else b.put("recipeId", a.recipeId);
        if (a.device != null) b.put("device", a.device); else b.put("deviceId", a.deviceId);
        return post("/v1/tools/dryrun", b);
    }

    /** 4. Check a temperature trace against an operation envelope: {@code {envelopeOk, targetOk, reason}}. */
    public Object checkEnvelope(String op, List<?> trace) { return checkEnvelope(op, trace, null, 0); }

    public Object checkEnvelope(String op, List<?> trace, Map<String, ?> target, double altitudeM) {
        Map<String, Object> b = obj(); b.put("op", op); b.put("trace", trace); b.put("altitudeM", altitudeM);
        if (target != null) b.put("target", target);
        return post("/v1/tools/envelope", b);
    }

    /** 5. Parse one SMS of the Humanitarian Profile grammar: the command plus {@code findings[]}. */
    public Object parseSms(String text) { Map<String, Object> b = obj(); b.put("text", text); return post("/v1/tools/sms", b); }

    /** 6. Derive what a recipient role may receive from household facets: {@code {constraints[], disclosed[], withheld[]}}. */
    public Object deriveConstraints(List<?> facets, String role) { return deriveConstraints(facets, role, null); }

    public Object deriveConstraints(List<?> facets, String role, List<?> consents) {
        Map<String, Object> b = obj(); b.put("facets", facets); b.put("role", role);
        if (consents != null) b.put("consents", consents);
        return post("/v1/tools/constraints", b);
    }

    /** 7. Convert kitchen units: {@code {value, unit}}. */
    public Object convert(double value, String unit, String to) { return convert(value, unit, to, null); }

    public Object convert(double value, String unit, String to, Double densityGPerMl) {
        Map<String, Object> b = obj(); b.put("value", value); b.put("unit", unit); b.put("to", to);
        if (densityGPerMl != null) b.put("densityGPerMl", densityGPerMl);
        return post("/v1/tools/convert", b);
    }

    /** 8. The sensor-ladder rung chosen for an operation, or null. */
    public Object ladder(String op, List<?> sensors) { return ladder(op, sensors, true, false); }

    public Object ladder(String op, List<?> sensors, boolean allowModel, boolean humanPresent) {
        Map<String, Object> b = obj(); b.put("op", op); b.put("sensors", sensors); b.put("allowModel", allowModel); b.put("humanPresent", humanPresent);
        return post("/v1/tools/ladder", b);
    }

    /** 9. Validate a document against a schema ({@code recipe}, {@code humanitarian}, ...): {@code {ok, errors[]}}. */
    public Object validate(String kind, Object doc) { Map<String, Object> b = obj(); b.put("kind", kind); b.put("doc", doc); return post("/v1/tools/validate", b); }

    /** 10. Run humanitarian rule packs over documents: {@code {results[{id, kind, findings[]}]}}. */
    public Object humanitarianCheck(List<?> docs) { return humanitarianCheck(docs, null); }

    public Object humanitarianCheck(List<?> docs, List<?> packs) {
        Map<String, Object> b = obj(); b.put("docs", docs);
        if (packs != null && !packs.isEmpty()) b.put("packs", packs);
        return post("/v1/tools/humanitarian", b);
    }

    /** 11. {@code {recipes[]}}: ids the hub can cook. */
    public Object listRecipes() { return get("/v1/tools/recipes"); }

    /** 12. One recipe document. */
    public Object getRecipe(String id) { return get("/v1/tools/recipes/" + id); }

    /** 13. {@code {devices{id: capabilities}}}. */
    public Object getDevices() { return get("/v1/tools/devices"); }

    /** 14. The operation vocabulary. */
    public Object getOps() { return get("/v1/tools/vocab/ops"); }

    /** 15. The registry document. */
    public Object getRegistry() { return get("/v1/tools/registry"); }

    // ---- Core 0.2 API

    /** 16. The device's capability document. */
    public Object capabilities() { return get("/v1/capabilities"); }

    /** 17. The device's local safety limits. */
    public Object safetyLimits() { return get("/v1/safety-limits"); }

    /** 18. Recall list. */
    public Object recalls() { return get("/v1/recalls"); }

    /** 19. Conformance claim and report pointer. */
    public Object conformance() { return get("/v1/conformance"); }

    /** 20. Start an execution (the caller's explicit act). Returns ExecutionStatus or throws a Problem with a refusal. */
    public Object startExecution(Map<String, ?> request) { return startExecution(request, null, null); }

    public Object startExecution(Map<String, ?> request, String idempotencyKey, Boolean humanPresent) {
        String key = idempotencyKey == null || idempotencyKey.isEmpty() ? newIdempotencyKey() : idempotencyKey;
        Map<String, Object> body = new LinkedHashMap<>(request);
        if (humanPresent != null) body.put("x-hub-human-present", humanPresent);
        Object out = post("/v1/executions", body, idem(key));
        lastIdempotencyKey = key;
        return out;
    }

    /** 21. ExecutionStatus; the ETag (= seq) is in {@link #lastHeaders}. */
    public Object getExecution(String id) { return get("/v1/executions/" + id); }

    /** 22. Stop an execution. Stop always works. */
    public Object stopExecution(String id) { return stopExecution(id, "requested"); }

    public Object stopExecution(String id, String reason) {
        Map<String, Object> b = obj(); b.put("reason", reason == null ? "requested" : reason);
        return post("/v1/executions/" + id + "/stop", b, idem(newIdempotencyKey()));
    }

    /** 23. Resume a paused execution; {@code seq} goes in If-Match. */
    public Object resumeExecution(String id, Object seq) {
        Map<String, String> h = idem(newIdempotencyKey());
        h.put("If-Match", Json.canonical(seq).replace("\"", ""));
        return post("/v1/executions/" + id + "/resume", obj(), h);
    }

    /** 24. The ExecutionLog once the run ended. */
    public Object executionLog(String id) { return get("/v1/executions/" + id + "/log"); }

    /** 25. Report an Incident document: {@code {received}}. */
    public Object reportIncident(Map<String, ?> doc) { return post("/v1/incidents", doc, idem(newIdempotencyKey())); }
}
