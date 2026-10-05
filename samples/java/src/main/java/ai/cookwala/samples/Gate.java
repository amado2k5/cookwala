package ai.cookwala.samples;

import java.util.List;

/**
 * A check a request must pass before it is sent to an executor. A gate looks at one thing and answers pass or refuse,
 * with a Core RefusalReason. Gates never relax a request, never substitute around an allergen block and never touch a
 * safety limit. The executor checks everything again; it is the authority (Core section 6).
 */
public abstract class Gate {
    /** The gate's name in results, such as {@code allergen}. */
    public abstract String name();

    /** Pass or refuse; an exception is a refusal too (the pipeline fails closed). */
    public abstract GateResult check(GateContext ctx) throws Exception;

    protected GateResult ok() { return new GateResult(name(), true, null, null, null, null); }

    protected GateResult ok(List<java.util.Map<String, Object>> findings) { return new GateResult(name(), true, null, null, null, findings); }

    protected GateResult refuse(String reason, String detail) { return new GateResult(name(), false, reason, detail, null, null); }

    protected GateResult refuse(String reason, String detail, String node) { return new GateResult(name(), false, reason, detail, node, null); }
}
