package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * AgentMandate documents (common.schema.json#/$defs/AgentMandate). Sign a mandate with the principal's key before use
 * (see the SDKs); executors verify the signature, the sample gates check scope and expiry.
 */
public final class Mandates {
    private Mandates() {}

    public static final List<String> DEFAULT_SCOPES = List.of("plan_meals", "start_cooking", "stop_cooking");
    public static final List<String> DEFAULT_CONFIRM_BEFORE = List.of("irreversible", "safety_override", "diet_or_allergen_change");
    public static final String DEFAULT_EXPIRES = "2026-12-31T23:59:00Z";

    /** A mandate; null arguments take the defaults. */
    public static Map<String, Object> make(String principal, String agent, List<String> scopes, String expires, List<String> confirmBefore) {
        return Py.map("principal", principal, "agent", agent,
                "agentInfo", Py.map("vendor", "cookwala-samples", "model", "rules", "version", "0.1.0"),
                "scopes", new ArrayList<Object>(scopes != null ? scopes : DEFAULT_SCOPES),
                "confirmBefore", new ArrayList<Object>(confirmBefore != null ? confirmBefore : DEFAULT_CONFIRM_BEFORE),
                "expires", expires != null ? expires : DEFAULT_EXPIRES);
    }

    public static Map<String, Object> make(String principal, String agent) {
        return make(principal, agent, null, null, null);
    }
}
