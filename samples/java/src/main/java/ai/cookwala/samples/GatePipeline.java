package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Runs gates in order and fails closed: the first refusal stops it, and a gate that throws refuses with {@code x-gate-error}. */
public class GatePipeline {
    private final List<Gate> gates;

    public GatePipeline(List<? extends Gate> gates) {
        this.gates = new ArrayList<>(gates);
    }

    /** Order: cheap and final first (version, hash, recall, mandate, allergens), then untrusted text, the recipe's numbers, then the device. */
    public static GatePipeline defaults() {
        return new GatePipeline(Arrays.asList(new Gates.CoreVersionGate(), new Gates.RecipeHashGate(), new Gates.RecallGate(), new Gates.MandateGate(),
                new Gates.AllergenGate(), new Gates.UntrustedTextGate(), new Gates.EnvelopeGate(), new Gates.AttendanceGate(), new Gates.CapabilityGate()));
    }

    /** A copy without the named gates (the orchestrator drops {@code capability}: it checks each device itself). */
    public GatePipeline without(String... names) {
        List<String> drop = Arrays.asList(names);
        List<Gate> keep = new ArrayList<>();
        for (Gate g : gates) if (!drop.contains(g.name())) keep.add(g);
        return new GatePipeline(keep);
    }

    public List<Gate> gates() { return gates; }

    public GateDecision run(GateContext ctx) {
        List<GateResult> results = new ArrayList<>();
        for (Gate g : gates) {
            GateResult r;
            try {
                r = g.check(ctx);
            } catch (Exception e) { // fail closed: a gate that cannot decide refuses
                r = new GateResult(g.name(), false, "x-gate-error", e.getClass().getSimpleName() + ": " + e.getMessage(), null, null);
            }
            results.add(r);
            if (!r.ok) return new GateDecision(false, results);
        }
        return new GateDecision(true, results);
    }
}
