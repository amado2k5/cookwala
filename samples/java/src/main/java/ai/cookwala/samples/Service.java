package ai.cookwala.samples;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.concurrent.Executors;

/**
 * The samples as a small HTTP service: one framework-free handler.
 *
 * <pre>
 * GET  /health                  liveness
 * GET  /v1/samples              what is bundled (recipes, devices) and the endpoints
 * POST /v1/samples/gates        run the gate pipeline: {recipe, device?, humanPresent?, allergenBlocks?, requestedBy?, mandate?}
 * POST /v1/samples/plan         planner agent + device ranking: {order: {dish, servings?, allergenBlocks?}, humanPresent?}
 * POST /v1/samples/run          orchestrate jobs on the simulated kitchen: {jobs?: [{id, order, humanPresent}], faults?}
 * GET  /v1/samples/demo?format= the demo report (json | markdown | junit | csv)
 * </pre>
 *
 * Everything runs on simulated devices from the bundle. The service never calls another host, so it can run as a
 * public function without becoming a proxy to anyone's kitchen.
 */
public final class Service {
    private Service() {}

    public static final String VERSION = "0.1.0";
    public static final int MAX_BODY = 256 * 1024;
    public static final int MAX_JOBS = 20;
    static final Map<String, String> TYPES = new TreeMap<>(Map.of("json", "application/json", "markdown", "text/markdown; charset=utf-8",
            "md", "text/markdown; charset=utf-8", "junit", "application/xml", "csv", "text/csv; charset=utf-8"));

    /** Run jobs on the simulated kitchen with a planner and a person who says yes. */
    public static Reporter runJobs(List<Job> jobs, Map<String, String> faults) {
        ScriptedHuman human = new ScriptedHuman(true);
        PlannerAgent planner = new PlannerAgent("agent:planner-svc", Mandates.make("household:h-svc/person:p-1", "agent:planner-svc"), new BundleCatalog(), human);
        Orchestrator orch = new Orchestrator(Scenarios.kitchen(faults), planner, human, new ArrayList<>());
        return new Reporter(orch.runAll(jobs), "Cookwala samples run");
    }

    /** An HTTP response: status, content type and body text. */
    public static final class Response {
        public final int status;
        public final String contentType;
        public final String body;

        public Response(int status, String contentType, String body) {
            this.status = status;
            this.contentType = contentType;
            this.body = body;
        }

        public int status() { return status; }
        public String contentType() { return contentType; }
        public String body() { return body; }

        @Override public String toString() { return status + " " + contentType + "\n" + body; }
    }

    private static Response json(int status, Object body) {
        return new Response(status, "application/json", Json.write(body));
    }

    private static Response problem(int status, String title, String detail) {
        Map<String, Object> b = Py.map("type", "https://cookwala.ai/errors/" + title, "title", title);
        if (Py.truthy(detail)) b.put("detail", detail);
        return new Response(status, "application/problem+json", Json.write(b));
    }

    private static Response report(Reporter rep, String fmt) {
        if (!TYPES.containsKey(fmt)) return problem(400, "invalid-request", "format must be one of " + Py.pyRepr(new ArrayList<>(TYPES.keySet())));
        return new Response(200, TYPES.get(fmt), rep.render(fmt));
    }

    private static List<Job> jobs(Object raw) {
        List<Object> l = Py.asList(raw);
        if (l == null || l.size() < 1 || l.size() > MAX_JOBS) throw new IllegalArgumentException("jobs must be a list of 1.." + MAX_JOBS);
        List<Job> out = new ArrayList<>();
        for (int i = 0; i < l.size(); i++) {
            Map<String, Object> j = Py.asMap(l.get(i));
            if (j == null || Py.asMap(j.get("order")) == null || !(Py.asMap(j.get("order")).get("dish") instanceof String)) {
                throw new IllegalArgumentException("jobs[" + i + "] needs order.dish");
            }
            String id = j.containsKey("id") ? Py.pyStr(j.get("id")) : "job-" + (i + 1);
            if (id.length() > 64) id = id.substring(0, 64);
            out.add(Job.ofOrder(id, Py.asMap(j.get("order")), Py.truthy(j.getOrDefault("humanPresent", false))));
        }
        return out;
    }

    private static List<Object> sortedKeys(Map<String, Object> m) {
        return new ArrayList<>(new TreeSet<>(m.keySet()));
    }

    /** Handle one request. {@code body} is parsed JSON (or null); query values are already decoded. */
    public static Response handle(String method, String path, Map<String, String> query, Object body) {
        Map<String, String> q = query == null ? Map.of() : query;
        String fmt = (Py.truthy(q.get("format")) ? q.get("format") : "json").toLowerCase(java.util.Locale.ROOT);
        try {
            if (method.equals("GET") && (path.equals("/health") || path.equals("/healthz") || path.equals("/"))) {
                return json(200, Py.map("ok", true, "service", "cookwala-samples", "version", VERSION, "core", Bundle.core()));
            }
            if (method.equals("GET") && path.equals("/v1/samples")) {
                Map<String, Object> recipes = new LinkedHashMap<>();
                for (Map.Entry<String, Object> e : Bundle.recipes().entrySet()) {
                    Map<String, Object> r = Py.asMap(e.getValue());
                    recipes.put(e.getKey(), Py.map("ref", Bundle.globalRef(r), "hash", Jcs.docHash(r)));
                }
                return json(200, Py.map("version", VERSION, "recipes", recipes, "devices", sortedKeys(Bundle.devices()),
                        "endpoints", Py.list("/v1/samples/gates", "/v1/samples/plan", "/v1/samples/run", "/v1/samples/demo"),
                        "note", "simulated devices; nothing is cooked"));
            }
            if (method.equals("GET") && path.equals("/v1/samples/demo")) return report(Scenarios.demo(), fmt);
            if (!method.equals("POST")) return problem(404, "not-found", null);
            Object bo = Py.truthy(body) ? body : new LinkedHashMap<String, Object>();
            Map<String, Object> b = Py.asMap(bo);
            if (b == null) return problem(400, "invalid-request", "body must be a JSON object");
            if (path.equals("/v1/samples/gates")) {
                Map<String, Object> recipe = new BundleCatalog().get(b.containsKey("recipe") ? Py.pyStr(b.get("recipe")) : "");
                if (recipe == null) return problem(400, "invalid-request", "recipe must be one of " + Py.pyRepr(sortedKeys(Bundle.recipes())));
                Map<String, Object> device = Py.truthy(b.get("device")) ? Py.asMap(Bundle.devices().get(b.get("device"))) : null;
                if (Py.truthy(b.get("device")) && device == null) return problem(400, "invalid-request", "device must be one of " + Py.pyRepr(sortedKeys(Bundle.devices())));
                List<Object> blocks = b.containsKey("allergenBlocks") ? Py.asList(b.get("allergenBlocks")) : new ArrayList<>();
                if (blocks == null) throw new IllegalArgumentException("allergenBlocks must be a list");
                Map<String, Object> req = Py.map("core", "0.2.0", "kind", "ExecuteRequest", "id", "gates-check", "recipe", Bundle.globalRef(recipe),
                        "recipeHash", b.containsKey("recipeHash") ? b.get("recipeHash") : Jcs.docHash(recipe),
                        "requestedBy", b.containsKey("requestedBy") ? Py.pyStr(b.get("requestedBy")) : "person:p-1",
                        "idempotencyKey", "gates-check-0001", "allergenBlocks", new ArrayList<>(blocks));
                if (Py.asMap(b.get("mandate")) != null) req.put("mandate", b.get("mandate"));
                GateDecision d = GatePipeline.defaults().run(new GateContext(req, recipe, device, Py.truthy(b.get("humanPresent"))));
                return json(200, d.asMap());
            }
            if (path.equals("/v1/samples/plan")) {
                Map<String, Object> order = Py.asMap(b.get("order"));
                if (order == null || !(order.get("dish") instanceof String)) return problem(400, "invalid-request", "order.dish is required");
                ScriptedHuman human = new ScriptedHuman(Py.truthy(b.get("humanPresent")), Py.truthy(b.get("confirm")), true);
                PlannerAgent planner = new PlannerAgent("agent:planner-svc", Mandates.make("household:h-svc/person:p-1", "agent:planner-svc"), new BundleCatalog(), human);
                Proposal p = planner.propose(order);
                Map<String, Object> out = p.asMap();
                if (p.ok) {
                    Orchestrator orch = new Orchestrator(Scenarios.kitchen(), planner, null, null);
                    List<Object> ranking = new ArrayList<>();
                    for (Orchestrator.Ranked r : orch.rank(p.recipe, human.present())) {
                        Map<String, Object> row = Py.map("device", r.device, "state", r.dryRun.get("state"));
                        Map<String, Object> refusal = Py.asMap(r.dryRun.get("refusal"));
                        if (Py.truthy(refusal)) row.put("reason", refusal.get("reason"));
                        long humanSteps = 0;
                        for (Object s : Py.arr(r.dryRun, "plan")) if ("human".equals(Py.asMap(s).get("verifiedBy"))) humanSteps++;
                        row.put("humanSteps", humanSteps);
                        ranking.add(row);
                    }
                    out.put("ranking", ranking);
                }
                return json(200, out);
            }
            if (path.equals("/v1/samples/run")) {
                List<Job> js = b.containsKey("jobs") ? jobs(b.get("jobs")) : null;
                Object fo = b.containsKey("faults") ? b.get("faults") : new LinkedHashMap<String, Object>();
                Map<String, Object> fm = Py.asMap(fo);
                boolean bad = fm == null;
                Map<String, String> faults = new LinkedHashMap<>();
                if (fm != null) {
                    for (Map.Entry<String, Object> e : fm.entrySet()) {
                        if (!(e.getValue() instanceof String) || !Simulator.FAULT_KINDS.contains(e.getValue())) bad = true;
                        else faults.put(e.getKey(), (String) e.getValue());
                    }
                }
                if (bad) return problem(400, "invalid-request", "faults maps \"recipe-id#node\" to one of " + Py.pyRepr(new ArrayList<>(new TreeSet<>(Simulator.FAULT_KINDS))));
                if (js == null) return report(Scenarios.demo(), fmt);
                return report(runJobs(js, faults), fmt);
            }
            return problem(404, "not-found", null);
        } catch (IllegalArgumentException | ClassCastException | NullPointerException | IndexOutOfBoundsException e) {
            return problem(400, "invalid-request", e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }

    /** Adapters call this: the url may carry ?format=, the body is raw bytes (or null). */
    public static Response handleRaw(String method, String url, byte[] rawBody) {
        URI u;
        try {
            u = URI.create(url.startsWith("/") ? url : "/" + url);
        } catch (IllegalArgumentException e) {
            return problem(400, "invalid-request", "bad url");
        }
        Map<String, String> query = new LinkedHashMap<>();
        String rq = u.getRawQuery();
        if (rq != null) {
            for (String kv : rq.split("&")) {
                if (kv.isEmpty()) continue;
                int eq = kv.indexOf('=');
                if (eq < 0) continue; // parse_qs drops blank values
                String v = URLDecoder.decode(kv.substring(eq + 1), StandardCharsets.UTF_8);
                if (v.isEmpty()) continue;
                query.put(URLDecoder.decode(kv.substring(0, eq), StandardCharsets.UTF_8), v);
            }
        }
        if (rawBody != null && rawBody.length > MAX_BODY) return problem(413, "too-large", "body over " + MAX_BODY + " bytes");
        Object body = null;
        if (rawBody != null && rawBody.length > 0) {
            try {
                body = Json.parse(new String(rawBody, StandardCharsets.UTF_8));
            } catch (IllegalArgumentException e) {
                return problem(400, "invalid-request", "body is not JSON: " + e.getMessage());
            }
        }
        String path = u.getPath() == null ? "/" : u.getPath();
        while (path.endsWith("/") && path.length() > 0) path = path.substring(0, path.length() - 1);
        if (path.isEmpty()) path = "/";
        return handle(method.toUpperCase(java.util.Locale.ROOT), path, query, body);
    }

    public static Response handleRaw(String method, String url, String rawBody) {
        return handleRaw(method, url, rawBody == null ? null : rawBody.getBytes(StandardCharsets.UTF_8));
    }

    private static void exchange(HttpExchange ex) throws IOException {
        try {
            byte[] raw;
            try (InputStream in = ex.getRequestBody()) {
                raw = in.readNBytes(MAX_BODY + 1);
            }
            String m = ex.getRequestMethod();
            Response r = (m.equals("GET") || m.equals("POST")) ? handleRaw(m, ex.getRequestURI().toString(), raw)
                    : problem(501, "not-implemented", "GET and POST only");
            byte[] data = r.body.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().set("Content-Type", r.contentType);
            ex.getResponseHeaders().set("Server", "cookwala-samples/" + VERSION);
            ex.sendResponseHeaders(r.status, data.length == 0 ? -1 : data.length);
            if (data.length > 0) {
                try (OutputStream os = ex.getResponseBody()) {
                    os.write(data);
                }
            }
        } finally {
            ex.close();
        }
    }

    /** Start the service (non-blocking) and return the server; stop it with {@code server.stop(0)}. */
    public static HttpServer start(int port, String bind) throws IOException {
        HttpServer srv = HttpServer.create(new InetSocketAddress(bind, port), 0);
        srv.createContext("/", Service::exchange);
        srv.setExecutor(Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r, "cookwala-samples-http");
            t.setDaemon(true);
            return t;
        }));
        srv.start();
        return srv;
    }

    /** Serve until the process is stopped. */
    public static void serve(int port, String bind) throws IOException, InterruptedException {
        HttpServer srv = start(port, bind);
        System.out.println("cookwala-samples " + VERSION + " on http://" + bind + ":" + srv.getAddress().getPort() + "  (simulated devices; GET /v1/samples)");
        System.out.flush();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> srv.stop(0)));
        Thread.currentThread().join();
    }
}
