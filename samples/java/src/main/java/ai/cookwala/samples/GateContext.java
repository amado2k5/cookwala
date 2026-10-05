package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** What the gates look at: the request, the recipe it names, optionally a device, and the kitchen's situation. */
public class GateContext {
    /** Checks a mandate's signature: returns null when it verifies, else why not. */
    @FunctionalInterface
    public interface MandateVerifier {
        String verify(Map<String, Object> mandate);
    }

    public final Map<String, Object> request;
    public final Map<String, Object> recipe;
    /** Capabilities document of the target device, when one is chosen. */
    public final Map<String, Object> device;
    public final boolean humanPresent;
    /** ISO 8601; defaults to the bundle's pinned instant so results are reproducible. */
    public String now;
    public List<Map<String, Object>> recalls;
    public Map<String, Object> limits;
    /** Optional signature check, such as the SDK's verify. */
    public MandateVerifier verifyMandate;

    public GateContext(Map<String, Object> request, Map<String, Object> recipe, Map<String, Object> device, boolean humanPresent,
                       List<Map<String, Object>> recalls, String now, Map<String, Object> limits) {
        this.request = request;
        this.recipe = recipe;
        this.device = device;
        this.humanPresent = humanPresent;
        this.recalls = recalls == null ? new ArrayList<>() : recalls;
        this.now = Py.truthy(now) ? now : Bundle.now();
        this.limits = Py.truthy(limits) ? limits : Bundle.safetyLimits();
    }

    public GateContext(Map<String, Object> request, Map<String, Object> recipe, Map<String, Object> device, boolean humanPresent,
                       List<Map<String, Object>> recalls) {
        this(request, recipe, device, humanPresent, recalls, null, null);
    }

    public GateContext(Map<String, Object> request, Map<String, Object> recipe, Map<String, Object> device, boolean humanPresent) {
        this(request, recipe, device, humanPresent, null, null, null);
    }

    public GateContext(Map<String, Object> request, Map<String, Object> recipe) {
        this(request, recipe, null, false, null, null, null);
    }

    public GateContext withVerifier(MandateVerifier v) {
        this.verifyMandate = v;
        return this;
    }
}
