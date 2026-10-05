package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** The pipeline's answer: allowed or not, and every gate's result up to the first refusal. */
public class GateDecision {
    public final boolean allowed;
    public final List<GateResult> results;

    public GateDecision(boolean allowed, List<GateResult> results) {
        this.allowed = allowed;
        this.results = results;
    }

    /** {reason, detail, gate, node?} of the first refusal, or null. */
    public Map<String, Object> refusal() {
        for (GateResult r : results) {
            if (!r.ok) {
                Map<String, Object> m = Py.map("reason", r.reason, "detail", r.detail, "gate", r.gate);
                if (Py.truthy(r.node)) m.put("node", r.node);
                return m;
            }
        }
        return null;
    }

    public List<Map<String, Object>> findings() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (GateResult r : results) out.addAll(r.findings);
        return out;
    }

    public Map<String, Object> asMap() {
        List<Object> rs = new ArrayList<>();
        for (GateResult r : results) rs.add(r.asMap());
        return Py.map("allowed", allowed, "refusal", refusal(), "findings", findings(), "results", rs);
    }
}
