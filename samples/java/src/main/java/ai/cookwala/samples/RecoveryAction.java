package ai.cookwala.samples;

import java.util.LinkedHashMap;
import java.util.Map;

/** What to do next: one of the {@code RecoveryPolicy} action kinds, with why. */
public class RecoveryAction {
    public final String kind;
    public final String reason;
    public final String detail;
    public final double waitS;
    public final Map<String, Object> extra;

    public RecoveryAction(String kind, String reason, String detail, double waitS, Map<String, Object> extra) {
        this.kind = kind;
        this.reason = reason;
        this.detail = detail;
        this.waitS = waitS;
        this.extra = extra == null ? new LinkedHashMap<>() : extra;
    }

    public RecoveryAction(String kind, String reason, String detail) { this(kind, reason, detail, 0, null); }

    public Map<String, Object> asMap() {
        Map<String, Object> d = Py.map("action", kind);
        if (Py.truthy(reason)) d.put("reason", reason);
        if (Py.truthy(detail)) d.put("detail", detail);
        if (waitS != 0) d.put("waitS", waitS);
        d.putAll(extra);
        return d;
    }
}
