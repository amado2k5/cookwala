package ai.cookwala.samples;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The Core 0.2 API over HTTP with {@link HttpClient}, no other dependencies.
 *
 * <p>Network failures and 502/503/504 are retried with exponential backoff, and every retry sends the same
 * Idempotency-Key, so a POST that reached the executor before the connection dropped is not executed twice.
 * A bearer token, when given, goes on every request.
 */
public class HubClient implements ExecutorClient {
    private final String base;
    private final String token;
    private final Duration timeout;
    private final int retries;
    private final double backoffS;
    private final double pollS;
    private final String name;
    private final HttpClient http;
    private volatile Map<String, List<String>> lastHeaders = Map.of();

    public HubClient(String baseUrl, String token, double timeoutS, int retries, double backoffS, double pollS, String name) {
        String b = baseUrl == null ? "http://localhost:7878" : baseUrl;
        while (b.endsWith("/")) b = b.substring(0, b.length() - 1);
        this.base = b;
        this.token = token;
        this.timeout = Duration.ofMillis((long) (timeoutS * 1000));
        this.retries = retries;
        this.backoffS = backoffS;
        this.pollS = pollS;
        this.name = name != null ? name : this.base;
        this.http = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).connectTimeout(this.timeout).build();
    }

    /** Defaults: 30 s timeout, 4 retries, 0.5 s backoff, 0.5 s poll. */
    public HubClient(String baseUrl, String token) { this(baseUrl, token, 30, 4, 0.5, 0.5, null); }

    public HubClient(String baseUrl, String token, String name) { this(baseUrl, token, 30, 4, 0.5, 0.5, name); }

    public String baseUrl() { return base; }

    public Map<String, List<String>> lastHeaders() { return lastHeaders; }

    /** One call with retries; returns the parsed JSON body (null when empty) or throws {@link CookwalaProblem}. */
    public Object call(String method, String path, Object body, Map<String, String> headers) {
        byte[] data = body == null ? null : Json.write(body).getBytes(StandardCharsets.UTF_8);
        for (int attempt = 0; ; attempt++) {
            HttpRequest.Builder rb = HttpRequest.newBuilder(URI.create(base + path)).timeout(timeout)
                    .header("Accept", "application/vnd.cookwala+json, application/json, application/problem+json");
            if (data != null) rb.header("Content-Type", "application/vnd.cookwala+json");
            if (token != null && !token.isEmpty()) rb.header("Authorization", "Bearer " + token);
            if (headers != null) headers.forEach(rb::header);
            rb.method(method, data == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofByteArray(data));
            HttpResponse<byte[]> r;
            try {
                r = http.send(rb.build(), HttpResponse.BodyHandlers.ofByteArray());
            } catch (IOException e) {
                if (attempt >= retries) {
                    throw new CookwalaProblem(0, Py.map("title", "unreachable", "detail", String.valueOf(e.getMessage() != null ? e.getMessage() : e)));
                }
                sleep(backoffS * Math.pow(2, attempt));
                continue;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new CookwalaProblem(0, Py.map("title", "unreachable", "detail", "interrupted"));
            }
            String raw = new String(r.body(), StandardCharsets.UTF_8);
            if (r.statusCode() >= 400) {
                Map<String, Object> payload;
                try {
                    Object p = Json.parse(raw);
                    payload = p instanceof Map ? Py.asMap(p) : new LinkedHashMap<>();
                } catch (IllegalArgumentException e) {
                    payload = Py.map("title", "http-error", "detail", raw);
                }
                int code = r.statusCode();
                if ((code == 502 || code == 503 || code == 504) && attempt < retries) {
                    sleep(backoffS * Math.pow(2, attempt));
                    continue;
                }
                throw new CookwalaProblem(code, payload);
            }
            lastHeaders = r.headers().map();
            return raw.isEmpty() ? null : Json.parse(raw);
        }
    }

    public Object call(String method, String path) { return call(method, path, null, null); }

    private static void sleep(double seconds) {
        try {
            Thread.sleep((long) (seconds * 1000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static Map<String, Object> obj(Object o) {
        Map<String, Object> m = Py.asMap(o);
        if (m == null) throw new CookwalaProblem(0, Py.map("title", "unexpected-response", "detail", "expected a JSON object"));
        return m;
    }

    @Override public String name() { return name; }
    @Override public Map<String, Object> capabilities() { return obj(call("GET", "/v1/capabilities")); }
    @Override public Map<String, Object> safetyLimits() { return obj(call("GET", "/v1/safety-limits")); }

    @Override
    public List<Map<String, Object>> recalls() {
        List<Map<String, Object>> out = new ArrayList<>();
        Object r = call("GET", "/v1/recalls");
        if (r instanceof List) for (Object o : (List<?>) r) if (Py.asMap(o) != null) out.add(Py.asMap(o));
        return out;
    }

    @Override
    public Map<String, Object> startExecution(Map<String, Object> request, String idempotencyKey, boolean humanPresent) {
        String key = Py.truthy(idempotencyKey) ? idempotencyKey : Py.truthy(request.get("idempotencyKey")) ? Py.pyStr(request.get("idempotencyKey")) : ExecutorClient.newKey("ex");
        Map<String, Object> body = new LinkedHashMap<>(request);
        body.put("x-hub-human-present", humanPresent); // reference-hub extension; real hubs sense presence
        return obj(call("POST", "/v1/executions", body, Map.of("Idempotency-Key", key)));
    }

    @Override public Map<String, Object> getExecution(String executionId) { return obj(call("GET", "/v1/executions/" + executionId)); }

    @Override
    public Map<String, Object> stopExecution(String executionId, String reason) {
        return obj(call("POST", "/v1/executions/" + executionId + "/stop", Py.map("reason", reason), null));
    }

    @Override
    public Map<String, Object> resumeExecution(String executionId, Object seq) {
        Map<String, String> h = new LinkedHashMap<>();
        h.put("Idempotency-Key", ExecutorClient.newKey("resume"));
        h.put("If-Match", "\"" + Py.pyStr(seq) + "\"");
        return obj(call("POST", "/v1/executions/" + executionId + "/resume", new LinkedHashMap<>(), h));
    }

    @Override public Map<String, Object> executionLog(String executionId) { return obj(call("GET", "/v1/executions/" + executionId + "/log")); }

    @Override
    public Map<String, Object> reportIncident(Map<String, Object> doc) {
        return obj(call("POST", "/v1/incidents", doc, Map.of("Idempotency-Key", ExecutorClient.newKey("inc"))));
    }

    /** Reference-hub tool (not Core): the dry run the hub would do, without starting anything. */
    @Override
    public Map<String, Object> dryRun(Map<String, Object> recipe, boolean humanPresent) {
        return obj(call("POST", "/v1/tools/dryrun", Py.map("recipe", recipe, "device", capabilities(), "humanPresent", humanPresent), null));
    }

    /** A real executor runs on its own clock; the client only waits and polls. */
    @Override public void advance() { sleep(pollS); }
}
