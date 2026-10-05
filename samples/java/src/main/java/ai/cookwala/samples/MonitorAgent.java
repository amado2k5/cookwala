package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Watches status documents: legal state transitions (allowing states skipped between polls), a seq that never
 * decreases, and medium temperatures not above the operation envelope. Anomalies are reported, never "fixed": the
 * executor owns safety.
 */
public class MonitorAgent {
    private final Map<String, List<Map<String, Object>>> history = new LinkedHashMap<>();
    /** {execution, kind: seq_regressed|illegal_transition|above_envelope, detail}. */
    public final List<Map<String, Object>> anomalies = new ArrayList<>();
    private final Map<String, Object> ops = Bundle.ops();

    /** Record one status document. Executions are keyed by device and id: one request may be tried on several devices. */
    public Map<String, Object> observe(Map<String, Object> status, String device) {
        String id = Py.pyStr(status.get("id"));
        String key = device != null ? device + "/" + id : id;
        List<Map<String, Object>> h = history.computeIfAbsent(key, k -> new ArrayList<>());
        long seq = ((Number) status.get("seq")).longValue();
        String state = Py.pyStr(status.get("state"));
        if (!h.isEmpty()) {
            Map<String, Object> prev = h.get(h.size() - 1);
            long pseq = ((Number) prev.get("seq")).longValue();
            String pstate = (String) prev.get("state");
            if (seq < pseq) {
                anomalies.add(Py.map("execution", id, "kind", "seq_regressed", "detail", pseq + " -> " + seq));
            } else if (!state.equals(pstate) && !Simulator.transitionAllowed(pstate, state)) {
                // Polling can miss states in between; flag only transitions no path explains.
                if (!reachable(pstate, state, new HashSet<>())) {
                    anomalies.add(Py.map("execution", id, "kind", "illegal_transition", "detail", pstate + " -> " + state));
                }
            }
        }
        Object t = status.get("x-hub-mediumTempC");
        Map<String, Object> step = Py.obj(status, "step");
        Map<String, Object> band = Py.asMap(Py.obj(Py.obj(ops, Py.str(step, "op", "")), "envelope").get("tempC"));
        if (t != null && Py.truthy(band) && Py.num(t) > Py.num(band.get("max"))) {
            anomalies.add(Py.map("execution", id, "kind", "above_envelope",
                    "detail", Py.pyStr(step.get("op")) + " " + Py.pyStr(t) + " °C > " + Py.pyStr(band.get("max")) + " °C"));
        }
        if (h.isEmpty() || ((Number) h.get(h.size() - 1).get("seq")).longValue() != seq) h.add(Py.map("seq", seq, "state", state));
        return status;
    }

    public Map<String, Object> observe(Map<String, Object> status) { return observe(status, null); }

    private static boolean reachable(String a, String b, Set<String> seen) {
        for (String n : Simulator.TRANSITIONS.getOrDefault(a, Set.of())) {
            if (n.equals(b)) return true;
            if (seen.add(n) && reachable(n, b, seen)) return true;
        }
        return false;
    }

    /** The states seen for one execution, in order. */
    public List<String> transitions(String executionId, String device) {
        List<String> out = new ArrayList<>();
        for (Map<String, Object> e : history.getOrDefault(device != null ? device + "/" + executionId : executionId, List.of())) out.add((String) e.get("state"));
        return out;
    }
}
