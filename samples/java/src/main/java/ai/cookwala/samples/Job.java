package ai.cookwala.samples;

import java.util.LinkedHashMap;
import java.util.Map;

/** One unit of work for the orchestrator: an order for the planner agent, or a ready ExecuteRequest with its recipe. */
public class Job {
    public final String id;
    /** For the planner agent: {dish, servings, allergenBlocks, ...}. */
    public final Map<String, Object> order;
    /** Or a ready ExecuteRequest ... */
    public final Map<String, Object> request;
    /** ... with the recipe it names. */
    public final Map<String, Object> recipe;
    public final boolean humanPresent;
    public final Map<String, Object> tags;

    public Job(String id, Map<String, Object> order, Map<String, Object> request, Map<String, Object> recipe, boolean humanPresent, Map<String, Object> tags) {
        this.id = id;
        this.order = order;
        this.request = request;
        this.recipe = recipe;
        this.humanPresent = humanPresent;
        this.tags = tags == null ? new LinkedHashMap<>() : tags;
    }

    /** A job the planner turns into a request. */
    public static Job ofOrder(String id, Map<String, Object> order, boolean humanPresent) {
        return new Job(id, order, null, null, humanPresent, null);
    }

    /** A job with a ready request. */
    public static Job ofRequest(String id, Map<String, Object> request, Map<String, Object> recipe, boolean humanPresent) {
        return new Job(id, null, request, recipe, humanPresent, null);
    }
}
