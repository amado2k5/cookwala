package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** What a planner proposes: an ExecuteRequest and its recipe, or a reason it will not. */
public class Proposal {
    public final boolean ok;
    public final Map<String, Object> request;
    public final Map<String, Object> recipe;
    public final String reason;
    public final String detail;
    public final List<String> notes;

    public Proposal(boolean ok, Map<String, Object> request, Map<String, Object> recipe, String reason, String detail, List<String> notes) {
        this.ok = ok;
        this.request = request;
        this.recipe = recipe;
        this.reason = reason;
        this.detail = detail;
        this.notes = notes == null ? new ArrayList<>() : notes;
    }

    static Proposal no(String reason, String detail) { return new Proposal(false, null, null, reason, detail, null); }

    static Proposal no(Map<String, Object> recipe, String reason, String detail) { return new Proposal(false, null, recipe, reason, detail, null); }

    public Map<String, Object> asMap() {
        return Py.map("ok", ok, "request", request, "recipe", recipe == null ? null : recipe.get("id"), "reason", reason, "detail", detail,
                "notes", new ArrayList<Object>(notes));
    }
}
