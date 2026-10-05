package ai.cookwala.samples;

import java.util.Map;
import java.util.TreeSet;

/** Anonymous IncidentReports (Core 6.9): a date and no names, ids, addresses or exact times. */
public final class Reporting {
    private Reporting() {}

    /** Fault kind → incident category. */
    public static final Map<String, String> CATEGORY = Map.of("sensor_fault", "cw.incident.sensor_failure", "overheat", "cw.incident.overheat",
            "timeout", "cw.incident.running_late");

    /** An IncidentReport for a run that ended early. The id is random: an incident must not link back to a job, a household or a device. */
    public static Map<String, Object> incidentFrom(RunRecord rec, String date) {
        Map<String, Object> st = rec.status == null ? Map.of() : rec.status;
        Map<String, Object> fault = Py.obj(st, "x-sim-fault");
        Map<String, Object> log = rec.log == null ? Map.of() : rec.log;
        if (date == null) {
            String src = Py.truthy(log.get("endedAt")) ? Py.pyStr(log.get("endedAt")) : Py.truthy(st.get("updatedAt")) ? Py.pyStr(st.get("updatedAt")) : "1970-01-01";
            date = src.length() > 10 ? src.substring(0, 10) : src;
        }
        Map<String, Object> step = Py.obj(st, "step");
        String kind = Py.str(fault, "kind");
        String category = kind != null && CATEGORY.containsKey(kind) ? CATEGORY.get(kind)
                : ("failed".equals(rec.outcome) ? "cw.incident.equipment_failure" : "cw.incident.overheat");
        boolean safety = Py.truthy(log.get("safetyEvents"));
        Map<String, Object> doc = Py.map("core", "0.2.0", "kind", "IncidentReport", "id", "inc-" + date + "-" + Py.tokenHex(4), "date", date,
                "category", category, "severity", safety ? "medium" : "low", "outcome", "near_miss",
                "description", "Execution ended " + Py.str(st, "state", rec.outcome) + " during " + Py.str(step, "op", "an unknown step") + "; "
                        + (Py.truthy(log.get("x-heatStarted")) ? "food discarded, no injury." : "no heat had started, no injury."),
                "contributingFactors", Py.list("sensor_fault".equals(kind) ? "sensor_fault" : "other"));
        if (Py.truthy(step.get("op"))) doc.put("op", step.get("op"));
        Map<String, Object> dev = Py.obj(log, "device");
        if (Py.truthy(dev.get("model"))) doc.put("deviceModel", dev.get("model"));
        if (safety) {
            TreeSet<String> fired = new TreeSet<>();
            for (Object e : Py.arr(log, "safetyEvents")) fired.add(Py.str(Py.asMap(e), "limit"));
            doc.put("safetyLimitsFired", new java.util.ArrayList<Object>(fired));
        }
        return doc;
    }

    public static Map<String, Object> incidentFrom(RunRecord rec) { return incidentFrom(rec, null); }
}
