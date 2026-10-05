package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** One gate's answer. */
public class GateResult {
    public final String gate;
    public final boolean ok;
    public final String reason;
    public final String detail;
    public final String node;
    public final List<Map<String, Object>> findings;

    public GateResult(String gate, boolean ok, String reason, String detail, String node, List<Map<String, Object>> findings) {
        this.gate = gate;
        this.ok = ok;
        this.reason = reason;
        this.detail = detail;
        this.node = node;
        this.findings = findings == null ? new ArrayList<>() : findings;
    }

    public Map<String, Object> asMap() {
        Map<String, Object> d = Py.map("gate", gate, "ok", ok);
        if (Py.truthy(reason)) d.put("reason", reason);
        if (Py.truthy(detail)) d.put("detail", detail);
        if (Py.truthy(node)) d.put("node", node);
        if (!findings.isEmpty()) d.put("findings", findings);
        return d;
    }
}
