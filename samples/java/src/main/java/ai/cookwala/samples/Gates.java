package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;

/**
 * The sample gates, in the order {@link GatePipeline#defaults()} runs them: core-version, recipe-hash, recall, mandate,
 * allergen, untrusted-text, envelope, attendance, capability.
 */
public final class Gates {
    private Gates() {}

    /** The request speaks Core 0.2.x. */
    public static class CoreVersionGate extends Gate {
        @Override public String name() { return "core-version"; }

        @Override
        public GateResult check(GateContext ctx) {
            String v = ctx.request.containsKey("core") ? Py.pyStr(ctx.request.get("core")) : "";
            return v.startsWith("0.2.") ? ok() : refuse("unsupported_version", "core " + (v.isEmpty() ? "missing" : v) + "; this sample speaks 0.2.x");
        }
    }

    /** The request names exactly one revision; the recipe in hand must be that revision. */
    public static class RecipeHashGate extends Gate {
        @Override public String name() { return "recipe-hash"; }

        @Override
        public GateResult check(GateContext ctx) {
            if (ctx.recipe == null) return refuse("missing_capability", "recipe " + Py.pyStr(ctx.request.get("recipe")) + " is not in the catalog");
            String h = Jcs.docHash(ctx.recipe);
            return h.equals(ctx.request.get("recipeHash")) ? ok() : refuse("recipe_hash_mismatch", "catalog holds " + h);
        }
    }

    /** A recall in force for this recipe refuses. */
    public static class RecallGate extends Gate {
        @Override public String name() { return "recall"; }

        @Override
        public GateResult check(GateContext ctx) {
            for (Map<String, Object> rc : ctx.recalls) {
                for (Object to : Py.arr(rc, "targets")) {
                    Map<String, Object> t = Py.asMap(to);
                    if (t == null || ctx.recipe == null) continue;
                    if (Bundle.recipeByRef(Py.map("r", ctx.recipe), Py.str(t, "ref", "")) != null
                            && (Py.truthy(t.get("allRevisions")) || Py.eq(t.get("revision"), ctx.recipe.get("revision")))) {
                        return refuse("recipe_recalled", "recall " + Py.pyStr(rc.get("id")) + " (" + Py.str(rc, "reason", "unspecified") + ") is in force");
                    }
                }
            }
            return ok();
        }
    }

    /** An agent acts only under a mandate: right agent, start_cooking scope, not expired, signature checked if a verifier is given. */
    public static class MandateGate extends Gate {
        @Override public String name() { return "mandate"; }

        @Override
        public GateResult check(GateContext ctx) {
            Map<String, Object> req = ctx.request;
            Object mo = req.get("mandate");
            String by = req.containsKey("requestedBy") ? Py.pyStr(req.get("requestedBy")) : "";
            if (mo == null) return by.startsWith("agent:") ? refuse("not_authorized", by + " is an agent and sent no mandate") : ok();
            Map<String, Object> m = Py.asMap(mo);
            if (m == null) throw new IllegalArgumentException("mandate must be an object");
            if (Py.truthy(m.get("agent")) && !m.get("agent").equals(by)) {
                return refuse("not_authorized", "mandate is for " + Py.pyStr(m.get("agent")) + ", request is from " + by);
            }
            if (!Py.arr(m, "scopes").contains("start_cooking")) return refuse("mandate_scope", "the mandate lacks start_cooking");
            if (Py.truthy(m.get("expires")) && !Py.time(Py.str(m, "expires")).isAfter(Py.time(ctx.now))) {
                return refuse("mandate_scope", "the mandate expired at " + Py.pyStr(m.get("expires")));
            }
            if (ctx.verifyMandate != null) {
                String why = ctx.verifyMandate.verify(m);
                if (why != null) return refuse("not_authorized", "mandate signature: " + why);
            }
            return ok();
        }
    }

    /** Any blocked allergen in the recipe refuses; there are no substitutions around a block (Core 6.7). */
    public static class AllergenGate extends Gate {
        @Override public String name() { return "allergen"; }

        @Override
        public GateResult check(GateContext ctx) {
            Set<String> blocks = new TreeSet<>();
            for (Object a : Py.arr(ctx.request, "allergenBlocks")) blocks.add(Py.pyStr(a));
            blocks.retainAll(Bundle.recipeAllergens(ctx.recipe));
            return blocks.isEmpty() ? ok() : refuse("allergen_block", "recipe contains blocked allergen(s): " + Py.pyRepr(new ArrayList<>(blocks)));
        }
    }

    /** Every step's numbers sit inside the operation envelope and under the local safety limits. */
    public static class EnvelopeGate extends Gate {
        @Override public String name() { return "envelope"; }

        @Override
        public GateResult check(GateContext ctx) {
            for (Object no : Py.arr(Py.obj(ctx.recipe, "process"), "nodes")) {
                Map<String, Object> node = Py.asMap(no);
                String[] bad = Simulator.checkNodeParams(Py.str(node, "op"), node, ctx.limits);
                if (bad != null) return refuse(bad[0], bad[1], Py.str(node, "id"));
            }
            return ok();
        }
    }

    /** Operations whose envelope says {@code unattended: false} need a person present. */
    public static class AttendanceGate extends Gate {
        @Override public String name() { return "attendance"; }

        @Override
        public GateResult check(GateContext ctx) {
            Map<String, Object> ops = Bundle.ops();
            for (Object no : Py.arr(Py.obj(ctx.recipe, "process"), "nodes")) {
                Map<String, Object> node = Py.asMap(no);
                Map<String, Object> env = Py.obj(Py.obj(ops, Py.str(node, "op")), "envelope");
                if (!env.isEmpty() && Boolean.FALSE.equals(env.getOrDefault("unattended", Boolean.TRUE)) && !ctx.humanPresent) {
                    return refuse("needs_human_present", Py.str(node, "op") + " may not run unattended", Py.str(node, "id"));
                }
            }
            return ok();
        }
    }

    /** Instruction-like text that must never be obeyed. */
    public static final List<String> INSTRUCTION_PATTERNS = List.of(
            "ignore (all |any )?(previous|prior|above) (instructions|rules)",
            "disregard (the )?(rules|instructions|limits)",
            "(raise|increase|disable|bypass|override) (the )?(safety|temperature|heat) ?(limit|limits|check|checks)?",
            "you are (now )?(an?|the) ",
            "system prompt",
            "act as ",
            "skip (the )?(allergen|safety)",
            "without (a )?(person|human|supervision)");

    /** Free text is data, never an instruction (Core 6.4). This gate never obeys and never refuses: it logs a finding. */
    public static class UntrustedTextGate extends Gate {
        private final List<Pattern> rx = new ArrayList<>();

        public UntrustedTextGate(List<String> patterns) {
            for (String p : patterns) rx.add(Pattern.compile(p, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE));
        }

        public UntrustedTextGate() { this(INSTRUCTION_PATTERNS); }

        @Override public String name() { return "untrusted-text"; }

        private static void strings(Object v, String path, List<String[]> out) {
            if (v instanceof String) out.add(new String[] {path, (String) v});
            else if (v instanceof Map) for (Map.Entry<?, ?> e : ((Map<?, ?>) v).entrySet()) strings(e.getValue(), path + "/" + e.getKey(), out);
            else if (v instanceof List) {
                List<?> l = (List<?>) v;
                for (int i = 0; i < l.size(); i++) strings(l.get(i), path + "/" + i, out);
            }
        }

        @Override
        public GateResult check(GateContext ctx) {
            List<Map<String, Object>> findings = new ArrayList<>();
            Object[][] docs = {{"request", ctx.request}, {"recipe", ctx.recipe == null ? Map.of() : ctx.recipe}};
            for (Object[] wd : docs) {
                List<String[]> found = new ArrayList<>();
                strings(wd[1], "", found);
                for (String[] ps : found) {
                    for (Pattern p : rx) {
                        if (p.matcher(ps[1]).find()) {
                            findings.add(Py.map("incident", "cw.incident.untrusted_instruction", "where", wd[0] + ps[0], "action", "ignored_and_logged"));
                            break;
                        }
                    }
                }
            }
            return ok(findings);
        }
    }

    /** When a device is chosen: the dry run the executor will do, done early. */
    public static class CapabilityGate extends Gate {
        @Override public String name() { return "capability"; }

        @Override
        public GateResult check(GateContext ctx) {
            if (ctx.device == null || ctx.recipe == null) return ok();
            Map<String, Object> res = Simulator.dryRun(ctx.recipe, ctx.device, ctx.humanPresent, true, ctx.limits, ctx.now);
            if ("refused".equals(res.get("state"))) {
                Map<String, Object> r = Py.obj(res, "refusal");
                return refuse(Py.str(r, "reason"), Py.str(r, "detail"), Py.str(r, "node"));
            }
            return ok();
        }
    }
}
