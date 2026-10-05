package ai.cookwala.samples;

import static ai.cookwala.samples.TestData.requestFor;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import org.junit.jupiter.api.Test;

class SimulatorTest {
    @Test
    void lifecycleIdempotencyIfMatchStop() {
        SimulatedExecutor ex = SimulatedExecutor.fromBundle("demo-hob-robot");
        Map<String, Object> req = requestFor("lentil-soup");
        Map<String, Object> st = ex.startExecution(req, "key-0000001", true);
        assertEquals("accepted", st.get("state"));
        assertEquals(st.get("id"), ex.startExecution(req, "key-0000001", true).get("id")); // replay
        assertEquals(409, assertThrows(CookwalaProblem.class, () -> ex.startExecution(req, "key-0000002", true)).status());
        String id = (String) st.get("id");
        assertEquals(412, assertThrows(CookwalaProblem.class, () -> ex.resumeExecution(id, 99)).status());
        assertEquals(428, assertThrows(CookwalaProblem.class, () -> ex.resumeExecution(id, null)).status());
        assertEquals(404, assertThrows(CookwalaProblem.class, () -> ex.executionLog(id)).status());
        ex.tick();
        ex.tick();
        assertEquals("running", ex.getExecution(id).get("state"));
        ex.stopExecution(id, "requested");
        ex.tick();
        assertEquals("stopped", ex.getExecution(id).get("state"));
        assertEquals("aborted_safe", ex.executionLog(id).get("outcome"));
        assertEquals("stopped", ex.stopExecution(id, "again").get("state")); // stop is never refused
        assertEquals(404, assertThrows(CookwalaProblem.class, () -> ex.getExecution("nope")).status());
    }

    @Test
    void stopBeforeAnythingStarted() {
        SimulatedExecutor ex = SimulatedExecutor.fromBundle("demo-hob-robot");
        String id = (String) ex.startExecution(requestFor("lentil-soup"), "key-0000077", true).get("id");
        Map<String, Object> st = ex.stopExecution(id, "requested");
        assertEquals("stopped", st.get("state"));
        assertEquals(1L, st.get("seq"));
        assertEquals("aborted_safe", ex.executionLog(id).get("outcome"));
        assertEquals("stopped", ex.stopExecution(id, "again").get("state")); // final: just the status
        assertEquals(1L, ex.getExecution(id).get("seq"));
    }

    @Test
    void badRequests() {
        SimulatedExecutor ex = SimulatedExecutor.fromBundle("demo-hob-robot");
        assertEquals(400, assertThrows(CookwalaProblem.class, () -> ex.startExecution(requestFor("lentil-soup"), "short", true)).status());
        Map<String, Object> req = requestFor("lentil-soup");
        req.remove("recipeHash");
        assertEquals(400, assertThrows(CookwalaProblem.class, () -> ex.startExecution(req, "key-0000009", true)).status());
        CookwalaProblem p = assertThrows(CookwalaProblem.class, () -> ex.startExecution(requestFor("lentil-soup", "core", "0.3.0"), "key-0000010", true));
        assertEquals("unsupported_version", p.refusal());
        assertEquals(400, assertThrows(CookwalaProblem.class, () -> ex.reportIncident(Py.map("core", "0.2.0"))).status());
    }

    @Test
    void refusesBeforeHeat() {
        SimulatedExecutor ex = SimulatedExecutor.fromBundle("demo-oven");
        assertEquals("missing_capability", Py.obj(ex.startExecution(requestFor("lentil-soup"), "key-0000003", false), "refusal").get("reason"));
    }

    @Test
    void prechecksInOrder() {
        SimulatedExecutor ex = SimulatedExecutor.fromBundle("demo-hob-robot", new SimulatedExecutor.Options().busy(1));
        assertEquals("recipe_hash_mismatch", Py.obj(ex.startExecution(requestFor("lentil-soup", "id", "a", "recipeHash", "sha256:00"), "key-a-000001", true), "refusal").get("reason"));
        assertEquals("allergen_block", Py.obj(ex.startExecution(requestFor("shakshuka", "id", "b", "allergenBlocks", Py.list("eggs")), "key-b-000001", true), "refusal").get("reason"));
        assertEquals("mandate_scope", Py.obj(ex.startExecution(requestFor("lentil-soup", "id", "c", "mandate", Mandates.make("p", "a", null, "2026-01-01T00:00:00Z", null)),
                "key-c-000001", true), "refusal").get("reason"));
        assertEquals("busy", Py.obj(ex.startExecution(requestFor("lentil-soup", "id", "d"), "key-d-000001", true), "refusal").get("reason"));
        assertEquals("accepted", ex.startExecution(requestFor("lentil-soup", "id", "e"), "key-e-000001", true).get("state"));
        SimulatedExecutor rc = SimulatedExecutor.fromBundle("demo-hob-robot", new SimulatedExecutor.Options().recalls(java.util.List.of(
                Py.map("id", "rc-9", "targets", Py.list(Py.map("ref", "cw:cookwala.ai:example-lentil-soup", "allRevisions", true))))));
        assertEquals("recipe_recalled", Py.obj(rc.startExecution(requestFor("lentil-soup"), "key-f-000001", true), "refusal").get("reason"));
    }

    private static Map<String, Object> runToEnd(SimulatedExecutor ex, String key) {
        Map<String, Object> st = ex.startExecution(requestFor(key), "key-" + key + "-run", true);
        for (int i = 0; i < 200 && !Simulator.FINAL.contains(ex.getExecution((String) st.get("id")).get("state")); i++) {
            Map<String, Object> cur = ex.getExecution((String) st.get("id"));
            if ("needs_human".equals(cur.get("state"))) ex.resumeExecution((String) cur.get("id"), "\"" + cur.get("seq") + "\"");
            ex.tick();
        }
        return ex.getExecution((String) st.get("id"));
    }

    @Test
    void faults() {
        SimulatedExecutor hot = SimulatedExecutor.fromBundle("demo-hob-robot", new SimulatedExecutor.Options().faults(Map.of("example-koshari#n14", "overheat")));
        Map<String, Object> st = runToEnd(hot, "koshari");
        assertEquals("stopped", st.get("state"));
        Map<String, Object> log = hot.executionLog((String) st.get("id"));
        assertEquals("aborted_safe", log.get("outcome"));
        assertEquals("oil.max_temp", Py.asMap(Py.arr(log, "safetyEvents").get(0)).get("limit"));

        SimulatedExecutor sensor = SimulatedExecutor.fromBundle("demo-hob-robot", new SimulatedExecutor.Options().faults(Map.of("example-shakshuka#n7", "sensor_fault")));
        st = runToEnd(sensor, "shakshuka");
        assertEquals("failed", st.get("state"));
        assertEquals("sensor_fault", Py.obj(st, "x-sim-fault").get("kind"));

        SimulatedExecutor ok = SimulatedExecutor.fromBundle("demo-hob-robot", new SimulatedExecutor.Options().faults(Map.of("n7", "timeout")));
        st = runToEnd(ok, "lentil-soup");
        assertEquals("completed", st.get("state"));
        Map<String, Object> l = ok.executionLog((String) st.get("id"));
        assertEquals("served", l.get("outcome"));
        assertTrue(!Py.arr(l, "humanInterventions").isEmpty());
        assertEquals(Boolean.TRUE, l.get("x-heatStarted"));
    }
}
