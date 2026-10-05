package ai.cookwala.samples;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * The dry run: a port of tools/cookwala_ref.py {@code dry_run}, {@code check_node_params}, {@code ladder_choice} and
 * {@code trusted_sensors} working from the bundled vocabulary. The tests check it gives the reference answer for every
 * bundled recipe and device. Nothing runs: it answers "can this device cook every step, and how is each step verified?".
 */
public final class Simulator {
    private Simulator() {}

    /** Final execution states. */
    public static final Set<String> FINAL = Set.of("refused", "stopped", "completed", "failed");

    /** Legal state transitions (Core 0.2). */
    public static final Map<String, Set<String>> TRANSITIONS;

    static {
        Map<String, Set<String>> t = new LinkedHashMap<>();
        t.put("accepted", Set.of("preparing", "refused", "stopped"));
        t.put("preparing", Set.of("running", "needs_human", "stopping", "failed"));
        t.put("running", Set.of("paused", "needs_human", "stopping", "completed", "failed"));
        t.put("paused", Set.of("running", "stopping"));
        t.put("needs_human", Set.of("running", "stopping", "failed"));
        t.put("stopping", Set.of("stopped"));
        TRANSITIONS = Collections.unmodifiableMap(t);
    }

    public static boolean transitionAllowed(String from, String to) {
        return TRANSITIONS.getOrDefault(from, Set.of()).contains(to);
    }

    /** Sensors that may satisfy a ladder rung (RFC-0011): state ok and calibration not expired. {@code now} null = the wall clock. */
    public static Set<String> trustedSensors(Map<String, Object> capabilities, String now) {
        Instant t = now == null ? Instant.now() : Py.time(now);
        Set<String> out = new HashSet<>();
        for (Object o : Py.arr(Py.obj(capabilities, "capabilities"), "sensors")) {
            Map<String, Object> s = Py.asMap(o);
            if (s == null) continue;
            if (!"ok".equals(Py.str(s, "state", "ok"))) continue;
            String vu = Py.str(Py.obj(s, "calibration"), "validUntil");
            if (Py.truthy(vu) && t.isAfter(Py.time(vu))) continue;
            out.add(Py.str(s, "sensor"));
            for (Object c : Py.arr(s, "visionCues")) out.add(Py.pyStr(c));
        }
        return out;
    }

    /** The first rung of the operation's sensor ladder this device can use, or null. */
    public static String ladderChoice(String opId, Set<String> sensors, boolean allowModel, boolean humanPresent, Map<String, Object> ops) {
        Map<String, Object> env = Py.obj(Py.obj(ops == null ? Bundle.ops() : ops, opId), "envelope");
        Object ladder = env.containsKey("sensorLadder") ? env.get("sensorLadder") : List.of("time");
        for (Object r : Py.asList(ladder) == null ? List.of() : Py.asList(ladder)) {
            String rung = Py.pyStr(r);
            if (rung.equals("model") && allowModel) return "model";
            if (rung.equals("time")) return "time";
            if (rung.equals("human") && humanPresent) return "human";
            if (sensors.contains(rung)) return rung;
        }
        return null;
    }

    public static String ladderChoice(String opId, Set<String> sensors, boolean allowModel, boolean humanPresent) {
        return ladderChoice(opId, sensors, allowModel, humanPresent, null);
    }

    /** {reason, detail} when a step's numbers break the envelope or a local limit, else null. */
    public static String[] checkNodeParams(String opId, Map<String, Object> node, Map<String, Object> limits, Map<String, Object> ops, Map<String, Object> heatBands) {
        if (ops == null) ops = Bundle.ops();
        if (heatBands == null) heatBands = Bundle.heatBands();
        Map<String, Object> env = Py.obj(Py.obj(ops, opId), "envelope");
        Map<String, Object> params = Py.obj(node, "params");
        List<Object[]> temps = new ArrayList<>();
        for (String k : new String[] {"tempC", "oilTempC"}) if (params.containsKey(k)) temps.add(new Object[] {k, params.get(k)});
        Object tgt = Py.truthy(params.get("target")) ? params.get("target") : node.get("target");
        Map<String, Object> tm = Py.asMap(tgt);
        if (tm != null && tm.containsKey("value")) {
            String unit = Py.str(tm, "unit", "degC");
            if (unit.equals("degC") || unit.equals("C")) temps.add(new Object[] {"target", tm.get("value")});
        }
        for (Object[] kt : temps) if (!Py.finite(kt[1])) return new String[] {"envelope_out_of_range", kt[0] + " is not a finite number"};
        Map<String, Object> band = Py.asMap(env.get("tempC"));
        if (Py.truthy(band)) {
            double lo = Py.num(band.get("min")), hi = Py.num(band.get("max"));
            for (Object[] kt : temps) {
                double t = Py.num(kt[1]);
                if (t < lo || t > hi) {
                    return new String[] {"envelope_out_of_range", kt[0] + " " + Py.fmtG(kt[1]) + " °C is outside the " + opId + " envelope "
                            + Py.pyStr(band.get("min")) + "–" + Py.pyStr(band.get("max")) + " °C"};
                }
            }
            Object heat = params.get("heat");
            if ("pan_surface".equals(env.get("medium")) && heat instanceof String && heatBands.containsKey(heat)) {
                Map<String, Object> hb = Py.obj(heatBands, (String) heat);
                if (Py.num(hb.get("max")) < lo || Py.num(hb.get("min")) > hi) {
                    return new String[] {"envelope_out_of_range", "heat level " + heat + " (pan " + Py.pyStr(hb.get("min")) + "–" + Py.pyStr(hb.get("max"))
                            + " °C) cannot hold the " + opId + " envelope " + Py.pyStr(band.get("min")) + "–" + Py.pyStr(band.get("max")) + " °C"};
                }
            }
        }
        Object pk = params.get("pressureKPa");
        if (pk != null) {
            if (!Py.finite(pk)) return new String[] {"envelope_out_of_range", "pressureKPa is not a finite number"};
            Map<String, Object> pb = Py.asMap(env.get("pressureKPa"));
            if (Py.truthy(pb) && (Py.num(pk) < Py.num(pb.get("min")) || Py.num(pk) > Py.num(pb.get("max")))) {
                return new String[] {"envelope_out_of_range", "pressure " + Py.fmtG(pk) + " kPa is outside the " + opId + " envelope "
                        + Py.pyStr(pb.get("min")) + "–" + Py.pyStr(pb.get("max")) + " kPa"};
            }
        }
        for (Object lo : Py.arr(limits, "limits")) {
            Map<String, Object> lim = Py.asMap(lo);
            if (lim == null) continue;
            Map<String, Object> applies = Py.obj(lim, "appliesTo");
            List<Object> aOps = Py.arr(applies, "ops");
            if (!aOps.isEmpty() && !aOps.contains(opId)) continue;
            if (Py.truthy(applies.get("medium")) && !Py.eq(applies.get("medium"), env.get("medium"))) continue;
            if (aOps.isEmpty() && !Py.truthy(applies.get("medium"))) continue;
            if ("max_temp".equals(lim.get("kind")) && "degC".equals(lim.get("unit"))) {
                for (Object[] kt : temps) {
                    if (Py.num(kt[1]) > Py.num(lim.get("max"))) {
                        return new String[] {"safety_limit", kt[0] + " " + Py.fmtG(kt[1]) + " °C exceeds local limit " + Py.pyStr(lim.get("id")) + " ("
                                + Py.pyStr(lim.get("max")) + " °C)"};
                    }
                }
            }
            if ("pressure".equals(lim.get("kind")) && pk != null) {
                double max = lim.containsKey("max") ? Py.num(lim.get("max")) : Double.POSITIVE_INFINITY;
                if (Py.num(pk) > max) {
                    return new String[] {"safety_limit", "pressure " + Py.fmtG(pk) + " kPa exceeds local limit " + Py.pyStr(lim.get("id")) + " ("
                            + Py.pyStr(lim.get("max")) + " kPa)"};
                }
            }
        }
        return null;
    }

    public static String[] checkNodeParams(String opId, Map<String, Object> node, Map<String, Object> limits) {
        return checkNodeParams(opId, node, limits, null, null);
    }

    /**
     * Can this device cook every step? {@code {state: accepted|refused, plan: [...], refusal?}}. Nothing runs.
     *
     * @param now ISO 8601 instant used for sensor calibration; null = the wall clock
     */
    public static Map<String, Object> dryRun(Map<String, Object> recipe, Map<String, Object> capabilities, boolean humanPresent, boolean allowModel,
                                             Map<String, Object> limits, String now) {
        Map<String, Object> ops = Bundle.ops();
        Map<String, Object> caps = Py.obj(capabilities, "capabilities");
        Set<String> can = new HashSet<>();
        for (Object o : Py.arr(caps, "ops")) {
            String op = Py.str(Py.asMap(o), "op");
            if (!Boolean.FALSE.equals(Py.obj(ops, op).getOrDefault("executable", Boolean.TRUE))) can.add(op);
        }
        Set<String> sensors = trustedSensors(capabilities, now);
        List<Object> plan = new ArrayList<>();
        for (Object no : Py.arr(Py.obj(recipe, "process"), "nodes")) {
            Map<String, Object> node = Py.asMap(no);
            String op = Py.str(node, "op");
            String id = Py.str(node, "id");
            Map<String, Object> assignment = Py.obj(node, "assignment");
            List<Object> assign = assignment.containsKey("allowed") ? Py.arr(assignment, "allowed") : List.of("any");
            if (!can.contains(op)) {
                if (humanPresent && (assign.contains("human") || assign.contains("any"))) {
                    plan.add(Py.map("node", id, "op", op, "by", "human", "verifiedBy", "human"));
                    continue;
                }
                return refused("missing_capability", id, "device cannot perform " + op + " and no person is present to do it", plan);
            }
            String[] bad = checkNodeParams(op, node, limits, ops, null);
            if (bad != null) return refused(bad[0], id, bad[1], plan);
            Map<String, Object> env = Py.obj(Py.obj(ops, op), "envelope");
            if (!env.isEmpty() && !Py.truthy(env.getOrDefault("unattended", Boolean.TRUE)) && !humanPresent) {
                return refused("needs_human_present", id, op + " may not run unattended", plan);
            }
            String rung = !env.isEmpty() ? ladderChoice(op, sensors, allowModel, humanPresent, ops) : "time";
            if (rung == null) return refused("missing_sensor_no_fallback", id, "no way to verify " + op + " on this device", plan);
            String verifiedBy = (rung.startsWith("cw.") || rung.startsWith("x-")) ? "sensor" : rung;
            plan.add(Py.map("node", id, "op", op, "by", "device", "verifiedBy", verifiedBy, "rung", rung));
        }
        return Py.map("state", "accepted", "plan", plan);
    }

    public static Map<String, Object> dryRun(Map<String, Object> recipe, Map<String, Object> capabilities, boolean humanPresent) {
        return dryRun(recipe, capabilities, humanPresent, true, null, null);
    }

    private static Map<String, Object> refused(String reason, String node, String detail, List<Object> plan) {
        return Py.map("state", "refused", "refusal", Py.map("reason", reason, "node", node, "detail", detail), "plan", plan);
    }

    static final List<String> FAULT_KINDS = Arrays.asList("sensor_fault", "timeout", "overheat");
}
