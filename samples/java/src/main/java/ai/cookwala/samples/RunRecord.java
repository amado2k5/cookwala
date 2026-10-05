package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Everything one job did: the request, gates, attempts, recovery, people, transitions, the log and any incident. */
public class RunRecord {
    public String job;
    /** pending | completed | refused | stopped | failed */
    public String outcome = "pending";
    public String recipe;
    public String device;
    public Map<String, Object> request;
    public Map<String, Object> refusal;
    public Map<String, Object> gates;
    public List<Map<String, Object>> attempts = new ArrayList<>();
    public List<Map<String, Object>> recovery = new ArrayList<>();
    public List<Map<String, Object>> human = new ArrayList<>();
    public List<Map<String, Object>> findings = new ArrayList<>();
    public List<String> transitions = new ArrayList<>();
    public List<Map<String, Object>> anomalies = new ArrayList<>();
    public List<String> notes = new ArrayList<>();
    public Map<String, Object> status;
    public Map<String, Object> log;
    public Map<String, Object> incident;
    /** served | discard | not_served | not_cooked */
    public String disposition;
    public Map<String, Object> tags = new LinkedHashMap<>();

    public RunRecord(String job, Map<String, Object> tags) {
        this.job = job;
        if (tags != null) this.tags = new LinkedHashMap<>(tags);
    }

    public RunRecord(String job) { this(job, null); }

    public RunRecord refused(Map<String, Object> refusal, Map<String, Object> recipe) {
        this.refusal = refusal;
        if (recipe != null && this.recipe == null) this.recipe = Py.str(recipe, "id");
        return finish("refused", "not_cooked");
    }

    public RunRecord refused(Map<String, Object> refusal) { return refused(refusal, null); }

    public RunRecord finish(String outcome, String disposition) {
        this.outcome = outcome;
        this.disposition = disposition;
        return this;
    }

    private static void put(Map<String, Object> d, String k, Object v) {
        if (v == null) return;
        if (v instanceof List && ((List<?>) v).isEmpty()) return;
        if (v instanceof Map && ((Map<?, ?>) v).isEmpty()) return;
        d.put(k, v);
    }

    /** The record as JSON-ready data: empty fields left out, the request reduced to requestId and requestedBy. */
    public Map<String, Object> asMap() {
        Map<String, Object> d = new LinkedHashMap<>();
        put(d, "job", job);
        put(d, "outcome", outcome);
        put(d, "recipe", recipe);
        put(d, "device", device);
        put(d, "refusal", refusal);
        put(d, "gates", gates);
        put(d, "attempts", attempts);
        put(d, "recovery", recovery);
        put(d, "human", human);
        put(d, "findings", findings);
        put(d, "transitions", transitions);
        put(d, "anomalies", anomalies);
        put(d, "notes", notes);
        put(d, "status", status);
        put(d, "log", log);
        put(d, "incident", incident);
        put(d, "disposition", disposition);
        put(d, "tags", tags);
        if (Py.truthy(request)) {
            d.put("requestId", request.get("id"));
            d.put("requestedBy", request.get("requestedBy"));
        }
        return d;
    }
}
