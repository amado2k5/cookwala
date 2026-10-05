package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * A planner that acts under a mandate: it turns a structured order into an ExecuteRequest.
 *
 * <p>It does not read recipe text as instructions, never removes an allergen block or picks a dish that contains a
 * blocked allergen without a person's {@code diet_or_allergen_change} confirmation, and asks a person before anything
 * its mandate lists in confirmBefore (always before {@code irreversible} and {@code safety_override}, Core 6.5). Plug a
 * language model in front of it if you like; the model proposes an order, this code decides what is sent.
 */
public class PlannerAgent {
    /** Always confirmed with a person, whatever the mandate says. */
    public static final List<String> ALWAYS_CONFIRM = List.of("irreversible", "safety_override");

    protected final String id;
    protected final Map<String, Object> mandate;
    protected final BundleCatalog catalog;
    protected final Human human;
    protected final String now;
    private int seq;

    public PlannerAgent(String agentId, Map<String, Object> mandate, BundleCatalog catalog, Human human, String now) {
        this.id = agentId;
        this.mandate = mandate;
        this.catalog = catalog;
        this.human = human;
        this.now = now != null ? now : Bundle.now();
    }

    public PlannerAgent(String agentId, Map<String, Object> mandate, BundleCatalog catalog, Human human) {
        this(agentId, mandate, catalog, human, null);
    }

    public String id() { return id; }

    private String may(String scope) {
        if (!Py.arr(mandate, "scopes").contains(scope)) return "mandate lacks " + scope;
        if (Py.truthy(mandate.get("expires")) && !Py.time(Py.str(mandate, "expires")).isAfter(Py.time(now))) return "mandate expired";
        return null;
    }

    private boolean confirm(String item, String detail) {
        if (!Py.arr(mandate, "confirmBefore").contains(item) && !ALWAYS_CONFIRM.contains(item)) return true;
        return human != null && human.confirm(item, detail);
    }

    private static Set<String> blocked(List<String> blocks, Map<String, Object> recipe) {
        Set<String> s = new TreeSet<>(blocks);
        s.retainAll(Bundle.recipeAllergens(recipe));
        return s;
    }

    /** order: {dish, servings?, allergenBlocks?, serveBy?, alternatives?: bool, triggers?: [confirmBefore items]}. */
    public Proposal propose(Map<String, Object> order) {
        String why = may("plan_meals");
        if (why == null) why = may("start_cooking");
        if (why != null) return Proposal.no("mandate_scope", why);
        List<String> blocks = new ArrayList<>();
        for (Object b : Py.arr(order, "allergenBlocks")) blocks.add(Py.pyStr(b));
        Object dishObj = order.get("dish");
        if (!(dishObj instanceof String)) throw new IllegalArgumentException("order.dish must be a string");
        String dish = (String) dishObj;
        List<Map<String, Object>> hits = catalog.find(dish);
        if (hits.isEmpty()) return Proposal.no("missing_capability", "no recipe matches " + Py.pyRepr(dish));
        List<String> notes = new ArrayList<>();
        Map<String, Object> recipe = null;
        for (Map<String, Object> r : hits) if (blocked(blocks, r).isEmpty()) { recipe = r; break; }
        if (recipe == null) {
            if (Py.truthy(order.get("alternatives"))) {
                for (String k : catalog.list()) {
                    Map<String, Object> d = catalog.get(k);
                    if (blocked(blocks, d).isEmpty()) { recipe = d; break; }
                }
                if (recipe == null) return Proposal.no("allergen_block", "every recipe in the catalog contains a blocked allergen");
                String detail = Py.pyStr(hits.get(0).get("id")) + " contains " + Py.pyRepr(new ArrayList<>(blocked(blocks, hits.get(0)))) + "; propose "
                        + Py.pyStr(recipe.get("id")) + " instead";
                if (!confirm("diet_or_allergen_change", detail)) return Proposal.no("not_authorized", "a person did not confirm: " + detail);
                notes.add(detail);
            } else {
                // Never drop the block and never substitute an ingredient around it: stop here.
                Map<String, Object> r = hits.get(0);
                return Proposal.no(r, "allergen_block", Py.pyStr(r.get("id")) + " contains blocked allergen(s) " + Py.pyRepr(new ArrayList<>(blocked(blocks, r))));
            }
        }
        for (Object t : Py.arr(order, "triggers")) {
            String item = Py.pyStr(t);
            if (!confirm(item, "order " + Py.pyRepr(dish) + " triggers " + item)) return Proposal.no(recipe, "not_authorized", "a person did not confirm " + item);
        }
        String[] rh = catalog.refAndHash(recipe);
        seq++;
        String key = ExecutorClient.newKey("ex");
        String[] idParts = id.split(":", -1);
        String reqId = idParts[idParts.length - 1] + "-" + String.format("%04d", seq) + "-" + key.substring(key.length() - 6);
        Map<String, Object> req = Py.map("core", "0.2.0", "kind", "ExecuteRequest", "id", reqId, "recipe", rh[0], "recipeHash", rh[1],
                "requestedBy", id, "idempotencyKey", key, "mandate", mandate);
        if (Py.truthy(order.get("servings"))) req.put("servings", order.get("servings"));
        if (Py.truthy(order.get("serveBy"))) req.put("serveBy", order.get("serveBy"));
        if (!blocks.isEmpty()) req.put("allergenBlocks", new ArrayList<Object>(blocks));
        return new Proposal(true, req, recipe, null, null, notes);
    }
}
