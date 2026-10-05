package ai.cookwala.samples;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class VectorsTest {
    @Test
    void canonical() {
        List<Object> vectors = Py.arr(Bundle.expected(), "canonical");
        assertFalse(vectors.isEmpty());
        for (Object o : vectors) {
            Map<String, Object> v = Py.asMap(o);
            assertEquals(v.get("text"), Jcs.canonical(v.get("value")), Json.write(v));
        }
    }

    @Test
    void ecmascriptNumbers() {
        String[][] cases = {{"0", "0"}, {"-0.0", "0"}, {"1.0", "1"}, {"0.1", "0.1"}, {"1e21", "1e+21"}, {"1e-7", "1e-7"}, {"1e300", "1e+300"},
                {"5e-324", "5e-324"}, {"123456789012", "123456789012"}, {"-1.5", "-1.5"}, {"1e20", "100000000000000000000"},
                {"0.000001", "0.000001"}, {"1.7976931348623157e308", "1.7976931348623157e+308"}, {"2e-7", "2e-7"}, {"1.2345e-7", "1.2345e-7"},
                {"0.3", "0.3"}, {"2.0E-3", "0.002"}, {"9007199254740993.0", "9007199254740992"}, {"4.35", "4.35"}, {"1.1", "1.1"},
                // Java 17's Double.toString is not always shortest (JDK-4511638); these must still be:
                {"2.0E-3", "0.002"}, {"1.0E23", "1e+23"}, {"2.82879384806159E17", "282879384806159000"}, {"1.9400994884341945E25", "1.9400994884341945e+25"},
                {"5.0E-324", "5e-324"}, {"4.9E-324", "5e-324"}};
        for (String[] c : cases) assertEquals(c[1], Jcs.canonical(Double.parseDouble(c[0])), c[0]);
        assertThrows(IllegalArgumentException.class, () -> Jcs.canonical(Double.NaN));
    }

    @Test
    void stringsAndKeys() {
        assertEquals("{\"\\r\":1,\"a\":2,\"\u00e9\":3,\"\u20ac\":4,\"\ud83d\ude00\":5}",
                Jcs.canonical(Py.map("\ud83d\ude00", 5L, "\u20ac", 4L, "\u00e9", 3L, "a", 2L, "\r", 1L)));
        assertEquals("\"\\u0001\\u001f\\b\\f\"", Jcs.canonical("\u0001\u001f\b\f"));
    }

    @Test
    void hashes() {
        Map<String, Object> h = Py.obj(Bundle.expected(), "hashes");
        assertEquals(4, h.size());
        for (Map.Entry<String, Object> e : h.entrySet()) assertEquals(e.getValue(), Jcs.docHash(Bundle.recipe(e.getKey())), e.getKey());
        Map<String, Object> r = new java.util.LinkedHashMap<>(Bundle.recipe("koshari"));
        r.put("hash", "sha256:whatever");
        r.put("signature", Py.map("x", 1L));
        assertEquals(h.get("koshari"), Jcs.docHash(r)); // hash and signature are excluded
    }

    @Test
    void dryRuns() {
        List<Object> runs = Py.arr(Bundle.expected(), "dryRuns");
        assertEquals(32, runs.size());
        for (Object o : runs) {
            Map<String, Object> e = Py.asMap(o);
            Map<String, Object> got = Simulator.dryRun(Bundle.recipe((String) e.get("recipe")), Bundle.device((String) e.get("device")),
                    (Boolean) e.get("humanPresent"), true, Bundle.safetyLimits(), Bundle.now());
            String where = Json.write(e);
            assertEquals(e.get("state"), got.get("state"), where);
            assertEquals(e.get("reason"), Py.obj(got, "refusal").get("reason"), where);
            if (e.get("node") != null) assertEquals(e.get("node"), Py.obj(got, "refusal").get("node"), where);
            List<Object> plan = new ArrayList<>();
            for (Object p : Py.arr(got, "plan")) {
                Map<String, Object> pm = Py.asMap(p);
                plan.add(List.of(pm.get("node"), pm.get("by"), pm.get("verifiedBy")));
            }
            assertEquals(e.get("plan"), plan, where);
        }
    }

    @Test
    void ladderAndSensors() {
        assertEquals("time", Simulator.ladderChoice("cw.op.unknown", java.util.Set.of(), true, false));
        var sensors = Simulator.trustedSensors(Bundle.device("demo-hob-robot"), Bundle.now());
        assertFalse(sensors.isEmpty());
    }
}
