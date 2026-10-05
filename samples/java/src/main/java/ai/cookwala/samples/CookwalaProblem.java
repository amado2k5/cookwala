package ai.cookwala.samples;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * A problem document (application/problem+json) as an exception, the same shape as the SDKs.
 * Status 0 means the executor could not be reached.
 */
public class CookwalaProblem extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private final int status;
    private final String title;
    private final String detail;
    private final String refusal;
    private final Map<String, Object> body;

    public CookwalaProblem(int status, Map<String, Object> body) {
        super(message(status, body));
        this.status = status;
        this.body = body == null ? new LinkedHashMap<>() : body;
        this.title = Py.str(this.body, "title", "problem");
        this.detail = Py.str(this.body, "detail");
        this.refusal = Py.str(this.body, "refusal");
    }

    private static String message(int status, Map<String, Object> body) {
        String title = Py.str(body, "title", "problem");
        String detail = Py.str(body, "detail");
        return (status + " " + title + ": " + (Py.truthy(detail) ? detail : "")).strip();
    }

    /** A problem with the type https://cookwala.ai/errors/{title}. */
    public static CookwalaProblem of(int status, String title, String detail, String refusal) {
        Map<String, Object> b = Py.map("type", "https://cookwala.ai/errors/" + title, "title", title);
        if (Py.truthy(detail)) b.put("detail", detail);
        if (Py.truthy(refusal)) b.put("refusal", refusal);
        return new CookwalaProblem(status, b);
    }

    public static CookwalaProblem of(int status, String title, String detail) { return of(status, title, detail, null); }
    public static CookwalaProblem of(int status, String title) { return of(status, title, null, null); }

    public int status() { return status; }
    public String title() { return title; }
    public String detail() { return detail; }
    public String refusal() { return refusal; }
    public Map<String, Object> body() { return body; }
}
