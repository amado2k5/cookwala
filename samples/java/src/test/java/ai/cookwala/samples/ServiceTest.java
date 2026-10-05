package ai.cookwala.samples;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.sun.net.httpserver.HttpServer;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ServiceTest {
    @Test
    void endpoints() {
        Service.Response h = Service.handle("GET", "/health", null, null);
        assertEquals(200, h.status);
        assertEquals("0.2.0", Json.parseObject(h.body).get("core"));
        Service.Response s = Service.handle("GET", "/v1/samples", null, null);
        assertEquals(List.of("demo-hob-robot", "demo-hob-robot-basic", "demo-oven", "robot-arm"), Json.parseObject(s.body).get("devices"));

        Service.Response g = Service.handle("POST", "/v1/samples/gates", Map.of(), Py.map("recipe", "shakshuka", "allergenBlocks", Py.list("eggs")));
        assertEquals("allergen_block", Py.obj(Json.parseObject(g.body), "refusal").get("reason"));

        Service.Response p = Service.handle("POST", "/v1/samples/plan", Map.of(), Py.map("order", Py.map("dish", "koshari"), "humanPresent", true));
        Map<String, Object> pj = Json.parseObject(p.body);
        assertEquals(true, pj.get("ok"));
        assertEquals(4, Py.arr(pj, "ranking").size());

        Service.Response r = Service.handle("POST", "/v1/samples/run", Map.of("format", "markdown"),
                Py.map("jobs", Py.list(Py.map("order", Py.map("dish", "lentil"), "humanPresent", true))));
        assertEquals(200, r.status);
        assertTrue(r.body.contains("completed"));
        assertTrue(r.contentType.startsWith("text/markdown"));

        Service.Response csv = Service.handleRaw("GET", "/v1/samples/demo?format=csv", (byte[]) null);
        assertEquals(200, csv.status);
        assertTrue(csv.contentType.startsWith("text/csv"));
        assertEquals(200, Service.handleRaw("GET", "/health/", (byte[]) null).status);
        assertEquals(404, Service.handle("GET", "/nope", null, null).status);
        assertEquals(404, Service.handle("POST", "/v1/nope", null, Py.map()).status);
    }

    @Test
    void badInput() {
        assertEquals(400, Service.handleRaw("POST", "/v1/samples/run", "{nope").status);
        List<Object> thirty = new java.util.ArrayList<>();
        for (int i = 0; i < 30; i++) thirty.add(Py.map());
        assertEquals(400, Service.handle("POST", "/v1/samples/run", Map.of(), Py.map("jobs", thirty)).status);
        assertEquals(400, Service.handle("POST", "/v1/samples/run", Map.of(), Py.map("jobs", Py.list(Py.map("order", Py.map("dish", "x"))),
                "faults", Py.map("a#n1", "explode"))).status);
        assertEquals(400, Service.handle("POST", "/v1/samples/gates", Map.of(), Py.map("recipe", "../etc/passwd")).status);
        assertEquals(400, Service.handle("POST", "/v1/samples/gates", Map.of(), Py.map("recipe", "koshari", "device", "toaster")).status);
        assertEquals(413, Service.handleRaw("POST", "/v1/samples/gates", "x".repeat(300000)).status);
        assertEquals(400, Service.handle("GET", "/v1/samples/demo", Map.of("format", "pdf"), null).status);
        assertEquals(400, Service.handle("POST", "/v1/samples/plan", Map.of(), Py.map("order", Py.map())).status);
        assertEquals(400, Service.handleRaw("POST", "/v1/samples/run", "[1]").status);
        Service.Response p = Service.handle("POST", "/v1/samples/gates", Map.of(), Py.map("recipe", "x"));
        assertEquals("application/problem+json", p.contentType);
        assertEquals("invalid-request", Json.parseObject(p.body).get("title"));
    }

    @Test
    void overHttp() throws Exception {
        HttpServer srv = Service.start(0, "127.0.0.1");
        try {
            int port = srv.getAddress().getPort();
            HttpClient c = HttpClient.newBuilder().proxy(HttpClient.Builder.NO_PROXY).build();
            HttpResponse<String> r = c.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/v1/samples/gates"))
                    .POST(HttpRequest.BodyPublishers.ofString("{\"recipe\":\"koshari\",\"device\":\"demo-hob-robot-basic\",\"humanPresent\":true}")).build(),
                    HttpResponse.BodyHandlers.ofString());
            assertEquals(200, r.statusCode());
            assertEquals("missing_sensor_no_fallback", Py.obj(Json.parseObject(r.body()), "refusal").get("reason"));
            HttpResponse<String> d = c.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/v1/samples/demo?format=junit")).build(),
                    HttpResponse.BodyHandlers.ofString());
            assertEquals(200, d.statusCode());
            assertTrue(d.headers().firstValue("Content-Type").orElse("").startsWith("application/xml"));
        } finally {
            srv.stop(0);
        }
    }
}
