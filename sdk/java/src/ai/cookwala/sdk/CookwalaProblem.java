package ai.cookwala.sdk;

import java.util.Map;

/**
 * A hub answered with a Problem ({@code application/problem+json}) or another non-2xx status.
 *
 * <p>Carries the HTTP status, the Problem's {@code title} and {@code detail}, the {@code refusal} when the device
 * refused (a reason code or a {@code {reason, node, detail}} object, see Core 0.2 section 3) and the whole body.
 * A refusal is a result, not a crash: scenario runners catch this and keep going.
 */
public class CookwalaProblem extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public final int status;
    public final String title;
    public final String detail;
    public final Object refusal;
    public final Object body;

    public CookwalaProblem(int status, Object body) {
        super(message(status, body));
        this.status = status;
        this.body = body;
        Map<?, ?> m = body instanceof Map ? (Map<?, ?>) body : null;
        this.title = m != null && m.get("title") != null ? String.valueOf(m.get("title")) : "problem";
        this.detail = m != null && m.get("detail") != null ? String.valueOf(m.get("detail")) : null;
        this.refusal = m != null ? m.get("refusal") : null;
    }

    private static String message(int status, Object body) {
        Map<?, ?> m = body instanceof Map ? (Map<?, ?>) body : null;
        String title = m != null && m.get("title") != null ? String.valueOf(m.get("title")) : "problem";
        String detail = m != null && m.get("detail") != null ? String.valueOf(m.get("detail")) : "";
        return (status + " " + title + ": " + detail).trim();
    }
}
