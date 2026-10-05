package ai.cookwala.samples;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AgentsTest {
    private static PlannerAgent planner(Human human, List<String> scopes, String expires, List<String> confirmBefore) {
        return new PlannerAgent("agent:p", Mandates.make("household:h/person:p", "agent:p", scopes, expires, confirmBefore), new BundleCatalog(), human);
    }

    private static PlannerAgent planner(Human human) { return planner(human, null, null, null); }

    @Test
    void neverSubstitutesAroundABlock() {
        Proposal p = planner(new ScriptedHuman()).propose(Py.map("dish", "shakshuka", "allergenBlocks", Py.list("eggs")));
        assertFalse(p.ok);
        assertEquals("allergen_block", p.reason);
        assertEquals("example-shakshuka", p.recipe.get("id"));
    }

    @Test
    void alternativeNeedsConfirmation() {
        Proposal yes = planner(new ScriptedHuman(true, true, true)).propose(Py.map("dish", "shakshuka", "allergenBlocks", Py.list("eggs"), "alternatives", true));
        assertTrue(yes.ok);
        assertNotEquals("example-shakshuka", yes.recipe.get("id"));
        assertEquals(List.of("eggs"), yes.request.get("allergenBlocks"));
        assertEquals(1, yes.notes.size());
        Proposal no = planner(new ScriptedHuman(true, false, true)).propose(Py.map("dish", "shakshuka", "allergenBlocks", Py.list("eggs"), "alternatives", true));
        assertFalse(no.ok);
        assertEquals("not_authorized", no.reason);
    }

    @Test
    void alwaysConfirmIrreversible() {
        assertFalse(planner(null, null, null, List.of()).propose(Py.map("dish", "lentil", "triggers", Py.list("irreversible"))).ok);
        assertTrue(planner(new ScriptedHuman(), null, null, List.of()).propose(Py.map("dish", "lentil", "triggers", Py.list("irreversible"))).ok);
    }

    @Test
    void mandateLimitsTheAgent() {
        assertEquals("mandate_scope", planner(null, List.of("plan_meals"), null, null).propose(Py.map("dish", "lentil")).reason);
        assertEquals("mandate_scope", planner(null, null, "2026-01-01T00:00:00Z", null).propose(Py.map("dish", "lentil")).reason);
        assertEquals("missing_capability", planner(null).propose(Py.map("dish", "pizza")).reason);
    }

    @Test
    void requestShape() {
        Proposal p = planner(null).propose(Py.map("dish", "lentil", "servings", 6L));
        assertTrue(p.ok);
        Map<String, Object> r = p.request;
        assertEquals(List.of("core", "kind", "id", "recipe", "recipeHash", "requestedBy", "idempotencyKey", "mandate", "servings"), List.copyOf(r.keySet()));
        assertTrue(((String) r.get("id")).matches("p-0001-[0-9a-f]{6}"), (String) r.get("id"));
        assertEquals(Bundle.expected().get("hashes") instanceof Map ? Py.obj(Bundle.expected(), "hashes").get("lentil-soup") : null, r.get("recipeHash"));
        assertEquals("cw:cookwala.ai:example-lentil-soup", r.get("recipe"));
    }

    @Test
    void monitor() {
        MonitorAgent m = new MonitorAgent();
        m.observe(Py.map("id", "e", "seq", 0L, "state", "accepted"));
        m.observe(Py.map("id", "e", "seq", 3L, "state", "running"));
        assertTrue(m.anomalies.isEmpty());
        m.observe(Py.map("id", "e", "seq", 4L, "state", "accepted"));
        assertEquals("illegal_transition", m.anomalies.get(0).get("kind"));
        m.observe(Py.map("id", "e", "seq", 1L, "state", "running"));
        assertEquals("seq_regressed", m.anomalies.get(m.anomalies.size() - 1).get("kind"));
        m.observe(Py.map("id", "f", "seq", 0L, "state", "running", "step", Py.map("op", "cw.op.deep_fry"), "x-hub-mediumTempC", 500.0));
        assertEquals("above_envelope", m.anomalies.get(m.anomalies.size() - 1).get("kind"));
        assertEquals(List.of("accepted", "running", "accepted", "running"), m.transitions("e", null));
    }

    @Test
    void scriptedHumanLogs() {
        ScriptedHuman h = new ScriptedHuman(false, true, true);
        assertFalse(h.attend("e", "why"));
        assertTrue(h.confirm("x", "y"));
        assertEquals(2, h.log.size());
    }
}
