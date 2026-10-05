package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.DoubleConsumer;
import java.util.function.Supplier;

/**
 * One request, several devices, gates first, recovery throughout, a record at the end.
 *
 * <pre>
 * order -&gt; planner agent -&gt; gates (no device) -&gt; dry run on every device -&gt; best device
 *       -&gt; start (the executor checks again) -&gt; poll, monitor, ask people, recover -&gt; log -&gt; report
 * </pre>
 *
 * Ranking: accepted plans first, then the fewest human-verified steps, then the fewest time-verified steps, then the
 * device name. Orchestrators are optional in Cookwala: a household, a hub or a single device must work without one.
 */
public class Orchestrator {
    private final Map<String, ExecutorClient> devices;
    private final PlannerAgent planner;
    private final GatePipeline gates;
    private final RecoveryPolicy recovery;
    private final Human human;
    private final List<Map<String, Object>> recallDocs;
    private final DoubleConsumer sleep;
    public final MonitorAgent monitor = new MonitorAgent();

    /**
     * @param devices name → client, in order
     * @param gates   null = {@code GatePipeline.defaults().without("capability")} (each device is checked by dry run)
     * @param recalls null = ask every device for its recalls
     * @param sleep   seconds → wait; null = Thread.sleep
     */
    public Orchestrator(Map<String, ? extends ExecutorClient> devices, PlannerAgent planner, GatePipeline gates, RecoveryPolicy recovery, Human human,
                        List<Map<String, Object>> recalls, DoubleConsumer sleep) {
        this.devices = new LinkedHashMap<>(devices);
        this.planner = planner;
        this.gates = gates != null ? gates : GatePipeline.defaults().without("capability");
        this.recovery = recovery != null ? recovery : new RecoveryPolicy();
        this.human = human;
        this.recallDocs = recalls;
        this.sleep = sleep != null ? sleep : Orchestrator::sleepSeconds;
    }

    public Orchestrator(Map<String, ? extends ExecutorClient> devices, PlannerAgent planner, Human human, List<Map<String, Object>> recalls) {
        this(devices, planner, null, null, human, recalls, null);
    }

    public Orchestrator(Map<String, ? extends ExecutorClient> devices) {
        this(devices, null, null, null, null, null, null);
    }

    private static void sleepSeconds(double s) {
        try {
            Thread.sleep((long) (s * 1000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public List<Map<String, Object>> recalls() {
        if (recallDocs != null) return recallDocs;
        List<Map<String, Object>> out = new ArrayList<>();
        for (ExecutorClient c : devices.values()) {
            try {
                List<Map<String, Object>> r = c.recalls();
                if (r != null) out.addAll(r);
            } catch (CookwalaProblem ignored) {
                // a device that cannot answer has no recalls to add
            }
        }
        return out;
    }

    private <T> T retrying(RunRecord rec, Supplier<T> fn) {
        int attempt = 0;
        while (true) {
            try {
                return fn.get();
            } catch (CookwalaProblem p) {
                if (p.status() != 0) throw p;
                RecoveryAction act = recovery.onTransportError(attempt);
                rec.recovery.add(act.asMap());
                if (!act.kind.equals(RecoveryPolicy.RETRY)) throw p;
                sleep.accept(act.waitS);
                attempt++;
            }
        }
    }

    /** A device and its dry run. */
    public static final class Ranked {
        public final String device;
        public final Map<String, Object> dryRun;

        Ranked(String device, Map<String, Object> dryRun) {
            this.device = device;
            this.dryRun = dryRun;
        }
    }

    /** Dry-run the recipe on every device; accepted plans first, best first. */
    public List<Ranked> rank(Map<String, Object> recipe, boolean humanPresent) {
        final class Row {
            final boolean refused;
            final int people, timed;
            final String name;
            final Map<String, Object> dr;

            Row(boolean refused, int people, int timed, String name, Map<String, Object> dr) {
                this.refused = refused;
                this.people = people;
                this.timed = timed;
                this.name = name;
                this.dr = dr;
            }
        }
        List<Row> rows = new ArrayList<>();
        for (Map.Entry<String, ExecutorClient> e : devices.entrySet()) {
            Map<String, Object> dr;
            try {
                dr = e.getValue().dryRun(recipe, humanPresent);
            } catch (CookwalaProblem p) {
                dr = Py.map("state", "refused", "refusal", Py.map("reason", "busy", "detail", p.getMessage()), "plan", new ArrayList<>());
            }
            int people = 0, timed = 0;
            for (Object po : Py.arr(dr, "plan")) {
                Map<String, Object> p = Py.asMap(po);
                Object v = p == null ? null : p.get("verifiedBy");
                if ("human".equals(v)) people++;
                if ("time".equals(v)) timed++;
            }
            rows.add(new Row(!"accepted".equals(dr.get("state")), people, timed, e.getKey(), dr));
        }
        rows.sort(Comparator.<Row, Boolean>comparing(r -> r.refused).thenComparingInt(r -> r.people).thenComparingInt(r -> r.timed)
                .thenComparing(r -> r.name));
        List<Ranked> out = new ArrayList<>();
        for (Row r : rows) out.add(new Ranked(r.name, r.dr));
        return out;
    }

    /** Run one job to a final state (or a refusal) and return its record. */
    public RunRecord run(Job job) {
        RunRecord rec = new RunRecord(job.id, job.tags);
        Map<String, Object> request = job.request, recipe = job.recipe;
        if (job.order != null) {
            if (planner == null) throw new IllegalStateException("a job with an order needs a planner agent");
            Proposal prop = planner.propose(job.order);
            rec.notes.addAll(prop.notes);
            if (!prop.ok) return rec.refused(Py.map("reason", prop.reason, "detail", prop.detail, "gate", "planner"), prop.recipe);
            request = prop.request;
            recipe = prop.recipe;
        }
        rec.request = request;
        rec.recipe = recipe == null ? null : Py.str(recipe, "id");
        boolean humanPresent = job.humanPresent;

        GateDecision decision = gates.run(new GateContext(request, recipe, null, humanPresent, recalls()));
        if (!decision.allowed) {
            RecoveryAction act = recovery.onRefusal(decision.refusal(), humanPresent, false);
            rec.recovery.add(act.asMap());
            if (act.kind.equals(RecoveryPolicy.ASK_PRESENCE) && human != null && human.present()
                    && human.confirm("presence", "a step may not run unattended; can a person stay in the kitchen?")) {
                humanPresent = true;
                rec.human.add(Py.map("kind", "presence", "why", decision.refusal().get("detail")));
                decision = gates.run(new GateContext(request, recipe, null, true, recalls()));
            }
        }
        rec.gates = decision.asMap();
        rec.findings.addAll(decision.findings());
        if (!decision.allowed) return rec.refused(decision.refusal());

        List<Ranked> ranked = rank(recipe, humanPresent);
        final Map<String, Object> req = request;
        final boolean hp = humanPresent;
        for (int i = 0; i < ranked.size(); i++) {
            String name = ranked.get(i).device;
            Map<String, Object> dr = ranked.get(i).dryRun;
            ExecutorClient client = devices.get(name);
            Map<String, Object> attempt = Py.map("device", name, "dryRun", dr.get("state"));
            Map<String, Object> drRefusal = Py.asMap(dr.get("refusal"));
            if (Py.truthy(drRefusal)) attempt.put("reason", drRefusal.get("reason"));
            rec.attempts.add(attempt);
            boolean left = i + 1 < ranked.size();
            if (!"accepted".equals(dr.get("state"))) {
                RecoveryAction act = recovery.onRefusal(drRefusal, humanPresent, left);
                rec.recovery.add(act.asMap());
                if (act.kind.equals(RecoveryPolicy.TRY_NEXT_DEVICE)) continue;
                Map<String, Object> r = new LinkedHashMap<>(drRefusal == null ? Map.of() : drRefusal);
                r.put("device", name);
                return rec.refused(r);
            }
            Map<String, Object> st = retrying(rec, () -> client.startExecution(req, Py.pyStr(req.get("idempotencyKey")), hp));
            monitor.observe(st, name);
            if ("refused".equals(st.get("state"))) { // the executor is the authority; its refusal wins over our dry run
                attempt.put("executor", "refused");
                Map<String, Object> stRefusal = Py.asMap(st.get("refusal"));
                RecoveryAction act = recovery.onRefusal(stRefusal, humanPresent, left);
                rec.recovery.add(act.asMap());
                if (act.kind.equals(RecoveryPolicy.TRY_NEXT_DEVICE)) continue;
                Map<String, Object> r = new LinkedHashMap<>(stRefusal == null ? Map.of() : stRefusal);
                r.put("device", name);
                return rec.refused(r);
            }
            rec.device = name;
            return drive(rec, client, st, name);
        }
        return rec.refused(Py.map("reason", "missing_capability", "detail", "no device accepted the recipe"));
    }

    private RunRecord drive(RunRecord rec, ExecutorClient client, Map<String, Object> first, String name) {
        final String exId = Py.pyStr(first.get("id"));
        Map<String, Object> st = first;
        boolean ended = false;
        for (int t = 0; t < recovery.maxTicks; t++) {
            if (Simulator.FINAL.contains(st.get("state"))) {
                ended = true;
                break;
            }
            client.advance();
            st = monitor.observe(retrying(rec, () -> client.getExecution(exId)), name);
            if ("needs_human".equals(st.get("state"))) {
                RecoveryAction act = recovery.onNeedsHuman(st, human);
                rec.recovery.add(act.asMap());
                if (act.kind.equals(RecoveryPolicy.RESUME)) {
                    rec.human.add(Py.map("kind", "confirm", "why", act.detail));
                    st = monitor.observe(client.resumeExecution(exId, st.get("seq")), name);
                } else {
                    st = monitor.observe(retrying(rec, () -> client.stopExecution(exId, "no_person_answered")), name);
                }
            }
        }
        if (!ended) { // the same as Python's for/else: no break within maxTicks polls
            rec.recovery.add(recovery.onStall(st).asMap());
            retrying(rec, () -> client.stopExecution(exId, "stalled"));
            for (int k = 0; k < 20; k++) {
                client.advance();
                st = monitor.observe(client.getExecution(exId), name);
                if (Simulator.FINAL.contains(st.get("state"))) break;
            }
        }
        rec.transitions = monitor.transitions(exId, name);
        rec.status = st;
        try {
            rec.log = client.executionLog(exId);
        } catch (CookwalaProblem p) {
            rec.log = null;
        }
        RecoveryAction end = recovery.onEnd(st, rec.log);
        if (end != null) {
            rec.recovery.add(end.asMap());
            if (end.kind.equals(RecoveryPolicy.DISCARD_AND_REPORT) && Py.truthy(end.extra.getOrDefault("report", true))) {
                rec.incident = Reporting.incidentFrom(rec);
                try {
                    client.reportIncident(rec.incident);
                } catch (CookwalaProblem p) {
                    rec.notes.add("incident not accepted: " + p.getMessage());
                }
            }
        }
        List<Map<String, Object>> mine = new ArrayList<>();
        for (Map<String, Object> a : monitor.anomalies) if (exId.equals(a.get("execution"))) mine.add(a);
        rec.anomalies = mine;
        String state = Py.pyStr(st.get("state"));
        String disposition = end != null && Py.truthy(end.extra.get("discard")) ? "discard" : ("completed".equals(state) ? "served" : "not_served");
        return rec.finish(state, disposition);
    }

    public List<RunRecord> runAll(List<Job> jobs) {
        List<RunRecord> out = new ArrayList<>();
        for (Job j : jobs) out.add(run(j));
        return out;
    }
}
