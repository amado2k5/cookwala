package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** A summary across runs and four renderings: JSON for machines, Markdown for people, JUnit XML for CI, CSV for spreadsheets. */
public class Reporter {
    public final List<RunRecord> records;
    public final String title;

    public Reporter(List<RunRecord> records, String title) {
        this.records = records == null ? new ArrayList<>() : new ArrayList<>(records);
        this.title = title == null ? "Cookwala sample run" : title;
    }

    public Reporter() { this(null, null); }

    public RunRecord add(RunRecord rec) {
        records.add(rec);
        return rec;
    }

    private static void inc(Map<String, Object> m, String k) {
        m.put(k, ((Number) m.getOrDefault(k, 0L)).longValue() + 1);
    }

    public Map<String, Object> summary() {
        Map<String, Object> outcomes = new LinkedHashMap<>(), refusals = new LinkedHashMap<>(), actions = new LinkedHashMap<>();
        long human = 0, incidents = 0, untrusted = 0, anomalies = 0, served = 0, discarded = 0;
        for (RunRecord r : records) {
            inc(outcomes, r.outcome);
            if (Py.truthy(r.refusal)) inc(refusals, Py.pyStr(r.refusal.get("reason")));
            for (Map<String, Object> a : r.recovery) inc(actions, Py.pyStr(a.get("action")));
            human += r.human.size();
            if (Py.truthy(r.incident)) incidents++;
            anomalies += r.anomalies.size();
            for (Map<String, Object> f : r.findings) if ("cw.incident.untrusted_instruction".equals(f.get("incident"))) untrusted++;
            if ("served".equals(r.disposition)) served++;
            if ("discard".equals(r.disposition)) discarded++;
        }
        return Py.map("runs", (long) records.size(), "outcomes", outcomes, "refusals", refusals, "recoveryActions", actions, "humanInterventions", human,
                "incidents", incidents, "untrustedTextFindings", untrusted, "anomalies", anomalies, "served", served, "discarded", discarded);
    }

    /** {report, summary, runs}, indented by one space like the Python reference. */
    public String toJson() {
        List<Object> runs = new ArrayList<>();
        for (RunRecord r : records) runs.add(r.asMap());
        return Json.pretty(Py.map("report", title, "summary", summary(), "runs", runs), 1);
    }

    public String toMarkdown() {
        Map<String, Object> s = summary();
        StringBuilder out = new StringBuilder();
        List<String> parts = new ArrayList<>();
        for (Map.Entry<String, Object> e : new TreeMap<>(Py.obj(s, "outcomes")).entrySet()) parts.add(e.getValue() + " " + e.getKey());
        out.append("# ").append(title).append("\n\n");
        out.append(s.get("runs")).append(" runs: ").append(String.join(", ", parts)).append(". Served ").append(s.get("served")).append(", discarded ")
                .append(s.get("discarded")).append(", incidents reported ").append(s.get("incidents")).append(", people asked ")
                .append(s.get("humanInterventions")).append(" times.\n\n");
        out.append("| Job | Recipe | Device | Outcome | Why | Recovery | Food |\n|---|---|---|---|---|---|---|\n");
        for (RunRecord r : records) {
            String why;
            if (Py.truthy(r.refusal)) why = Py.pyStr(r.refusal.get("reason")) + ": " + (r.refusal.containsKey("detail") ? Py.pyStr(r.refusal.get("detail")) : "");
            else why = Py.str(Py.obj(r.status, "x-sim-fault"), "detail", "");
            why = why.replace("|", "/");
            List<String> acts = new ArrayList<>();
            for (Map<String, Object> a : r.recovery) acts.add(Py.pyStr(a.get("action")));
            out.append("| ").append(r.job).append(" | ").append(Py.truthy(r.recipe) ? r.recipe : "-").append(" | ").append(Py.truthy(r.device) ? r.device : "-")
                    .append(" | ").append(r.outcome).append(" | ").append(why.isEmpty() ? "-" : why).append(" | ")
                    .append(acts.isEmpty() ? "-" : String.join(", ", acts)).append(" | ").append(Py.truthy(r.disposition) ? r.disposition : "-").append(" |\n");
        }
        if (Py.truthy(s.get("untrustedTextFindings"))) {
            out.append("\nUntrusted text: ").append(s.get("untrustedTextFindings"))
                    .append(" instruction-like strings were found, ignored and logged (cw.incident.untrusted_instruction).\n");
        }
        if (Py.truthy(s.get("anomalies"))) out.append("\nMonitor anomalies: ").append(s.get("anomalies")).append(".\n");
        out.append("\nSimulated devices; nothing was cooked. The executor is the authority on every refusal.\n");
        return out.toString();
    }

    /** One testcase per run: failed runs are failures, refused runs are skipped. */
    public String toJunit() {
        Map<String, Object> s = summary();
        long fails = records.stream().filter(r -> "failed".equals(r.outcome)).count();
        List<String> cases = new ArrayList<>();
        for (RunRecord r : records) {
            String name = quoteattr((r.job + " " + (r.recipe == null ? "" : r.recipe)).strip());
            StringBuilder body = new StringBuilder();
            if ("failed".equals(r.outcome)) {
                body.append("<failure message=").append(quoteattr(Py.str(Py.obj(r.status, "x-sim-fault"), "detail", "failed"))).append("/>");
            } else if ("refused".equals(r.outcome)) {
                body.append("<skipped message=").append(quoteattr(Py.pyStr(r.refusal.get("reason")) + ": "
                        + (r.refusal.containsKey("detail") ? Py.pyStr(r.refusal.get("detail")) : ""))).append("/>");
            }
            Map<String, Object> brief = new LinkedHashMap<>();
            for (Map.Entry<String, Object> e : r.asMap().entrySet()) {
                if (List.of("job", "outcome", "device", "refusal", "recovery", "transitions", "disposition", "findings").contains(e.getKey())) {
                    brief.put(e.getKey(), e.getValue());
                }
            }
            body.append("<system-out>").append(escape(Json.write(brief))).append("</system-out>");
            cases.add("  <testcase classname=\"cookwala.samples\" name=" + name + ">" + body + "</testcase>");
        }
        long skipped = ((Number) Py.obj(s, "outcomes").getOrDefault("refused", 0L)).longValue();
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<testsuite name=" + quoteattr(title) + " tests=\"" + s.get("runs") + "\" failures=\"" + fails
                + "\" skipped=\"" + skipped + "\">\n" + String.join("\n", cases) + "\n</testsuite>\n";
    }

    public String toCsv() {
        StringBuilder b = new StringBuilder();
        row(b, List.of("job", "recipe", "device", "outcome", "refusal", "recovery", "disposition", "human", "incident"));
        for (RunRecord r : records) {
            List<String> acts = new ArrayList<>();
            for (Map<String, Object> a : r.recovery) acts.add(Py.pyStr(a.get("action")));
            row(b, List.of(r.job, nz(r.recipe), nz(r.device), r.outcome, Py.str(r.refusal, "reason", ""), String.join(" ", acts), nz(r.disposition),
                    String.valueOf(r.human.size()), Py.str(r.incident, "category", "")));
        }
        return b.toString();
    }

    /** json | markdown | md | junit | csv */
    public String render(String fmt) {
        switch (fmt) {
            case "json": return toJson();
            case "markdown": case "md": return toMarkdown();
            case "junit": return toJunit();
            case "csv": return toCsv();
            default: throw new IllegalArgumentException("format must be one of csv, json, junit, markdown, md");
        }
    }

    private static String nz(String s) { return s == null ? "" : s; }

    /** RFC 4180 row with CRLF, quoting like Python's csv module (QUOTE_MINIMAL). */
    private static void row(StringBuilder b, List<String> fields) {
        for (int i = 0; i < fields.size(); i++) {
            if (i > 0) b.append(',');
            String f = fields.get(i);
            if (f.contains(",") || f.contains("\"") || f.contains("\n") || f.contains("\r")) b.append('"').append(f.replace("\"", "\"\"")).append('"');
            else b.append(f);
        }
        b.append("\r\n");
    }

    /** xml.sax.saxutils.escape */
    static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    /** xml.sax.saxutils.quoteattr */
    static String quoteattr(String s) {
        String d = escape(s).replace("\n", "&#10;").replace("\r", "&#13;").replace("\t", "&#9;");
        if (d.contains("\"")) {
            if (d.contains("'")) return "\"" + d.replace("\"", "&quot;") + "\"";
            return "'" + d + "'";
        }
        return "\"" + d + "\"";
    }
}
