package ai.cookwala.samples;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * One simulated device behind the Core 0.2 API, in process, so every sample runs offline. Not a safety case: a test bed.
 *
 * <p>Executions advance one transition per {@link #tick()}, deterministically, so samples and tests need no clock or
 * threads. Faults can be injected per step (keyed {@code recipe-id#node} or {@code node}): {@code sensor_fault} fails
 * the execution when the step starts, {@code timeout} pauses it in needs_human, {@code overheat} fires the first
 * matching local {@code max_temp} limit, which cuts heat and stops the execution. No request field can change a limit.
 */
public class SimulatedExecutor {
    private final Map<String, Object> caps;
    private final Map<String, Object> limits;
    private final Map<String, Object> recipes;
    private final List<Map<String, Object>> recallDocs;
    private final Map<String, String> faults;
    private final Duration clockStep;
    private final Map<String, Ex> executions = new LinkedHashMap<>();
    private final Map<String, String> idem = new LinkedHashMap<>();
    private final List<Map<String, Object>> incidents = new ArrayList<>();
    private Instant now;
    private int busy;

    /** Per-execution state. */
    private static final class Ex {
        Map<String, Object> status;
        boolean fin;
        Map<String, Object> req;
        Map<String, Object> recipe;
        List<Map<String, Object>> plan;
        int step = -1;
        List<Object> steps = new ArrayList<>();
        List<Object> safety = new ArrayList<>();
        List<Object> human = new ArrayList<>();
        Instant startedAt;
        boolean heated;
        String stopReason;
        Map<String, Object> log;
    }

    /** Options for a simulated executor; every field may be left null for the bundle default. */
    public static final class Options {
        public Map<String, Object> limits;
        public Map<String, Object> recipes;
        public List<Map<String, Object>> recalls;
        public Map<String, String> faults;
        public String now;
        public int clockStepS = 60;
        public int busy;

        public Options faults(Map<String, String> f) { this.faults = f; return this; }
        public Options busy(int n) { this.busy = n; return this; }
        public Options recalls(List<Map<String, Object>> r) { this.recalls = r; return this; }
        public Options limits(Map<String, Object> l) { this.limits = l; return this; }
        public Options recipes(Map<String, Object> r) { this.recipes = r; return this; }
        public Options now(String n) { this.now = n; return this; }
        public Options clockStepS(int s) { this.clockStepS = s; return this; }
    }

    public SimulatedExecutor(Map<String, Object> capabilities, Options o) {
        if (o == null) o = new Options();
        this.caps = capabilities;
        this.limits = Py.truthy(o.limits) ? o.limits : Bundle.safetyLimits();
        this.recipes = o.recipes != null ? o.recipes : Bundle.recipes();
        this.recallDocs = o.recalls == null ? new ArrayList<>() : new ArrayList<>(o.recalls);
        this.faults = o.faults == null ? new LinkedHashMap<>() : new LinkedHashMap<>(o.faults);
        this.now = Py.time(o.now != null ? o.now : Bundle.now());
        this.clockStep = Duration.ofSeconds(o.clockStepS);
        this.busy = o.busy;
    }

    public SimulatedExecutor(Map<String, Object> capabilities) { this(capabilities, null); }

    /** A simulated executor for one of the bundled devices. */
    public static SimulatedExecutor fromBundle(String device, Options o) {
        Map<String, Object> caps = Bundle.device(device);
        if (caps == null) throw new IllegalArgumentException("no bundled device " + device);
        return new SimulatedExecutor(caps, o);
    }

    public static SimulatedExecutor fromBundle(String device) { return fromBundle(device, null); }

    // ---- Core API
    public Map<String, Object> capabilities() { return caps; }
    public Map<String, Object> safetyLimits() { return limits; }
    public List<Map<String, Object>> recalls() { return new ArrayList<>(recallDocs); }
    public List<Map<String, Object>> incidents() { return incidents; }
    public Instant now() { return now; }
    public String nowIso() { return Py.iso(now); }

    public synchronized Map<String, Object> startExecution(Map<String, Object> req, String idempotencyKey, boolean humanPresent) {
        if (idempotencyKey == null || idempotencyKey.length() < 8) {
            throw CookwalaProblem.of(400, "missing-idempotency-key", "Idempotency-Key header (8..128 chars) is required on every POST");
        }
        if (idem.containsKey(idempotencyKey)) return new LinkedHashMap<>(executions.get(idem.get(idempotencyKey)).status);
        for (String k : new String[] {"core", "kind", "id", "recipe", "recipeHash", "requestedBy", "idempotencyKey"}) {
            if (!req.containsKey(k)) throw CookwalaProblem.of(400, "invalid-request", "missing " + k);
        }
        if (!Py.pyStr(req.get("core")).startsWith("0.2.")) throw CookwalaProblem.of(400, "unsupported-version", null, "unsupported_version");
        String id = Py.pyStr(req.get("id"));
        if (executions.containsKey(id)) throw CookwalaProblem.of(409, "conflict", "execution id already exists");
        Map<String, Object> st = Py.map("core", "0.2.0", "kind", "ExecutionStatus", "id", id, "seq", 0L, "state", "accepted", "request", id,
                "updatedAt", Py.iso(now));
        idem.put(idempotencyKey, id);
        Map<String, Object> recipe = Bundle.recipeByRef(recipes, Py.pyStr(req.get("recipe")));
        Map<String, Object> refusal = precheck(req, recipe);
        if (refusal == null && busy > 0) {
            busy--;
            refusal = Py.map("reason", "busy", "detail", "this device is cooking something else");
        }
        Map<String, Object> dry = null;
        if (refusal == null) {
            dry = Simulator.dryRun(recipe, caps, humanPresent, true, limits, Py.iso(now));
            refusal = Py.asMap(dry.get("refusal"));
        }
        if (refusal != null) {
            st.put("state", "refused");
            st.put("refusal", refusal);
            Ex ex = new Ex();
            ex.status = st;
            ex.fin = true;
            executions.put(id, ex);
            return new LinkedHashMap<>(st);
        }
        st.put("x-sim-plan", dry.get("plan"));
        Ex ex = new Ex();
        ex.status = st;
        ex.req = req;
        ex.recipe = recipe;
        ex.plan = new ArrayList<>();
        for (Object p : Py.arr(dry, "plan")) ex.plan.add(Py.asMap(p));
        ex.startedAt = now;
        executions.put(id, ex);
        return new LinkedHashMap<>(st);
    }

    private Map<String, Object> precheck(Map<String, Object> req, Map<String, Object> recipe) {
        if (recipe == null) return Py.map("reason", "missing_capability", "detail", "recipe not found in this executor's catalog");
        String h = Jcs.docHash(recipe);
        if (!h.equals(req.get("recipeHash"))) return Py.map("reason", "recipe_hash_mismatch", "detail", "this executor holds " + h);
        for (Map<String, Object> rc : recallDocs) {
            for (Object to : Py.arr(rc, "targets")) {
                Map<String, Object> t = Py.asMap(to);
                if (t == null) continue;
                if (Bundle.recipeByRef(Py.map("r", recipe), Py.str(t, "ref", "")) != null
                        && (Py.truthy(t.get("allRevisions")) || Py.eq(t.get("revision"), recipe.get("revision")))) {
                    return Py.map("reason", "recipe_recalled", "detail", "recall " + Py.pyStr(rc.get("id")) + " is in force");
                }
            }
        }
        Map<String, Object> mandate = Py.asMap(req.get("mandate"));
        if (Py.truthy(mandate) && !Py.arr(mandate, "scopes").contains("start_cooking")) {
            return Py.map("reason", "mandate_scope", "detail", "the agent mandate lacks start_cooking");
        }
        if (Py.truthy(mandate) && Py.truthy(mandate.get("expires")) && !Py.time(Py.str(mandate, "expires")).isAfter(now)) {
            return Py.map("reason", "mandate_scope", "detail", "the agent mandate has expired");
        }
        Set<String> blocks = new TreeSet<>();
        for (Object a : Py.arr(req, "allergenBlocks")) blocks.add(Py.pyStr(a));
        blocks.retainAll(Bundle.recipeAllergens(recipe));
        if (!blocks.isEmpty()) {
            return Py.map("reason", "allergen_block", "detail", "recipe contains blocked allergen(s): " + Py.pyRepr(new ArrayList<>(blocks)));
        }
        return null;
    }

    private Ex get(String executionId) {
        Ex ex = executions.get(executionId);
        if (ex == null) throw CookwalaProblem.of(404, "not-found");
        return ex;
    }

    public synchronized Map<String, Object> getExecution(String executionId) {
        return new LinkedHashMap<>(get(executionId).status);
    }

    /** Never refused once the caller reaches the executor (Core 6.2); no If-Match, no token. */
    public synchronized Map<String, Object> stopExecution(String executionId, String reason) {
        Ex ex = get(executionId);
        String state = (String) ex.status.get("state");
        if (state.equals("accepted")) { // nothing has started: accepted -> stopped directly (the only legal path)
            ex.stopReason = reason;
            set(ex, "stopped");
            finish(ex, "aborted_safe");
        } else if (!Simulator.FINAL.contains(state) && !state.equals("stopping")) {
            set(ex, "stopping");
            ex.stopReason = reason;
        }
        return new LinkedHashMap<>(ex.status);
    }

    /** Resume a paused or needs_human execution; {@code seq} is the If-Match value (412 on mismatch, 428 when null). */
    public synchronized Map<String, Object> resumeExecution(String executionId, Object seq) {
        Ex ex = get(executionId);
        Map<String, Object> st = ex.status;
        if (seq == null) throw CookwalaProblem.of(428, "if-match-required");
        String given = Py.pyStr(seq).replaceAll("^\"+|\"+$", "");
        if (!given.equals(Py.pyStr(st.get("seq")))) throw CookwalaProblem.of(412, "precondition-failed", "seq is " + st.get("seq"));
        String state = (String) st.get("state");
        if (state.equals("paused") || state.equals("needs_human")) {
            ex.human.add(Py.map("kind", "confirm", "minutes", 1L));
            st.remove("humanNeeded");
            set(ex, "running");
        }
        return new LinkedHashMap<>(st);
    }

    /** The ExecutionLog; 404 until the execution has ended. */
    public synchronized Map<String, Object> executionLog(String executionId) {
        Ex ex = get(executionId);
        if (!ex.fin || ex.log == null) throw CookwalaProblem.of(404, "not-found", "the log exists once the execution has ended");
        return ex.log;
    }

    public synchronized Map<String, Object> reportIncident(Map<String, Object> doc) {
        for (String k : new String[] {"core", "kind", "id", "date", "category", "severity", "description"}) {
            if (!doc.containsKey(k)) throw CookwalaProblem.of(400, "invalid-request", "not a valid IncidentReport: missing " + k);
        }
        incidents.add(doc);
        return Py.map("received", true);
    }

    // ---- the clock

    /** Advance every running execution by one transition and the clock by one step. */
    public synchronized void tick() {
        now = now.plus(clockStep);
        for (Ex ex : executions.values()) if (!ex.fin) advance(ex);
    }

    private void set(Ex ex, String state) {
        Map<String, Object> st = ex.status;
        String from = (String) st.get("state");
        if (!Simulator.transitionAllowed(from, state)) throw new IllegalStateException(from + " -> " + state);
        st.put("seq", ((Number) st.get("seq")).longValue() + 1);
        st.put("state", state);
        st.put("updatedAt", Py.iso(now));
    }

    private void advance(Ex ex) {
        String state = (String) ex.status.get("state");
        switch (state) {
            case "stopping": set(ex, "stopped"); finish(ex, "aborted_safe"); return;
            case "accepted": set(ex, "preparing"); return;
            case "preparing": set(ex, "running"); enter(ex, 0); return;
            case "running": break;
            default: return;
        }
        close(ex);
        if (ex.step + 1 >= ex.plan.size()) {
            set(ex, "completed");
            finish(ex, "served");
        } else {
            enter(ex, ex.step + 1);
        }
    }

    private void enter(Ex ex, int i) {
        ex.step = i;
        Map<String, Object> p = ex.plan.get(i);
        Map<String, Object> st = ex.status;
        String op = (String) p.get("op"), node = (String) p.get("node");
        st.put("step", Py.map("node", node, "op", op, "startedAt", Py.iso(now), "progress", 0L, "verifiedBy", p.get("verifiedBy")));
        Map<String, Object> env = Py.obj(Py.obj(Bundle.ops(), op), "envelope");
        Object max = Py.obj(env, "tempC").getOrDefault("max", 0L);
        if (Py.num(max) > 60) ex.heated = true; // a hot step started; chilling does not count
        String fault = faults.get(ex.recipe.get("id") + "#" + node);
        if (!Py.truthy(fault)) fault = faults.get(node);
        if ("sensor_fault".equals(fault)) {
            st.put("x-sim-fault", Py.map("node", node, "kind", "sensor_fault", "detail", "the sensor for " + op + " stopped reporting"));
            set(ex, "failed");
            finish(ex, "failed");
            return;
        }
        if ("overheat".equals(fault)) {
            Map<String, Object> lim = limitFor(op, env);
            String action = Py.str(lim, "action", "cut_heat");
            ex.safety.add(Py.map("limit", lim.get("id"), "action", action, "node", node, "at", Py.iso(now)));
            st.put("x-sim-fault", Py.map("node", node, "kind", "overheat", "detail",
                    "local safety limit " + Py.pyStr(lim.get("id")) + " fired (" + action + ") during " + op));
            set(ex, "stopping");
            ex.stopReason = "safety_limit";
            return;
        }
        if ("timeout".equals(fault)) {
            set(ex, "needs_human");
            st.put("humanNeeded", Py.map("why", op + " reached its maxTime; onTimeout asks a person"));
            return;
        }
        if ("human".equals(p.get("by"))) {
            set(ex, "needs_human");
            st.put("humanNeeded", Py.map("why", "a person performs " + op));
        } else if ("human".equals(p.get("verifiedBy"))) {
            set(ex, "needs_human");
            st.put("humanNeeded", Py.map("why", "a person confirms " + op + " is done"));
        } else {
            st.remove("humanNeeded");
        }
    }

    private Map<String, Object> limitFor(String op, Map<String, Object> env) {
        for (Object lo : Py.arr(limits, "limits")) {
            Map<String, Object> lim = Py.asMap(lo);
            if (lim == null) continue;
            Map<String, Object> a = Py.obj(lim, "appliesTo");
            if ("max_temp".equals(lim.get("kind"))
                    && (Py.arr(a, "ops").contains(op) || (Py.truthy(a.get("medium")) && Py.eq(a.get("medium"), env.get("medium"))))) {
                return lim;
            }
        }
        return Py.map("id", "x-sim.max_temp", "action", "cut_heat");
    }

    @SuppressWarnings("unchecked")
    private void close(Ex ex) {
        Map<String, Object> p = ex.plan.get(ex.step);
        ex.steps.add(Py.map("node", p.get("node"), "op", p.get("op"), "verifiedBy", p.get("verifiedBy"), "envelopeOk", true, "endedAt", Py.iso(now)));
        ((Map<String, Object>) ex.status.get("step")).put("progress", 1L);
    }

    private void finish(Ex ex, String outcome) {
        ex.fin = true;
        if (ex.req == null) return;
        Map<String, Object> req = ex.req;
        Map<String, Object> actor = Py.obj(caps, "actor");
        Object servings = req.containsKey("servings") ? req.get("servings") : Py.obj(ex.recipe, "yield").getOrDefault("servings", 1L);
        Map<String, Object> log = new LinkedHashMap<>();
        log.put("core", "0.2.0");
        log.put("kind", "ExecutionLog");
        log.put("id", "log-" + req.get("id"));
        log.put("recipe", req.get("recipe"));
        log.put("recipeHash", req.get("recipeHash"));
        log.put("device", Py.map("vendor", actor.getOrDefault("vendor", "simulated"), "model", actor.getOrDefault("model", "simulated"),
                "firmware", "samples-sim-0.1", "safetyLimits", Py.pyStr(limits.get("id")) + "@" + Py.pyStr(limits.get("version"))));
        log.put("startedAt", Py.iso(ex.startedAt));
        log.put("endedAt", Py.iso(now));
        log.put("outcome", outcome);
        log.put("servings", servings);
        log.put("steps", ex.steps);
        log.put("safetyEvents", ex.safety);
        log.put("humanInterventions", ex.human);
        log.put("x-heatStarted", ex.heated);
        log.put("consent", Py.map("dataset", "none", "withdrawable", true));
        log.put("privacy", Py.map("personalData", "none", "timePrecision", "day"));
        ex.log = log;
    }
}
