package ai.cookwala.samples;

import static ai.cookwala.samples.TestData.requestFor;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import org.junit.jupiter.api.Test;

class RecoveryTest {
    @Test
    void policy() {
        RecoveryPolicy p = new RecoveryPolicy();
        for (String reason : new String[] {"allergen_block", "recipe_recalled", "safety_limit", "mandate_scope", "envelope_out_of_range"}) {
            assertEquals("give_up", p.onRefusal(Py.map("reason", reason), true, true).kind, reason);
        }
        assertEquals("try_next_device", p.onRefusal(Py.map("reason", "busy"), false, true).kind);
        assertEquals("give_up", p.onRefusal(Py.map("reason", "busy"), false, false).kind);
        assertEquals("ask_presence", p.onRefusal(Py.map("reason", "needs_human_present"), false, true).kind);
        assertEquals("give_up", p.onRefusal(Py.map("reason", "needs_human_present"), true, true).kind);
        assertEquals("give_up", p.onRefusal(null, true, true).kind);
        assertEquals("retry", p.onTransportError(1).kind);
        assertEquals(1.0, p.onTransportError(1).waitS);
        assertEquals("give_up", p.onTransportError(9).kind);
        assertEquals("resume", p.onNeedsHuman(Py.map("id", "e", "humanNeeded", Py.map("why", "w")), new ScriptedHuman()).kind);
        assertEquals("stop", p.onNeedsHuman(Py.map("id", "e"), null).kind);
    }

    @Test
    void onEnd() {
        RecoveryPolicy p = new RecoveryPolicy();
        assertNull(p.onEnd(Py.map("state", "completed"), Py.map("x-heatStarted", true)));
        RecoveryAction failedHot = p.onEnd(Py.map("state", "failed"), Py.map("x-heatStarted", true));
        assertEquals("discard_and_report", failedHot.kind);
        assertEquals(true, failedHot.extra.get("discard"));
        assertEquals(false, p.onEnd(Py.map("state", "failed"), Py.map("x-heatStarted", false)).extra.get("discard"));
        RecoveryAction stoppedHot = p.onEnd(Py.map("state", "stopped"), Py.map("x-heatStarted", true));
        assertEquals(false, stoppedHot.extra.get("report"));
        assertNull(p.onEnd(Py.map("state", "stopped"), null));
        Map<String, Object> d = stoppedHot.asMap();
        assertEquals(java.util.List.of("action", "reason", "detail", "discard", "report"), java.util.List.copyOf(d.keySet()));
    }

    @Test
    void nobodyAnswersMeansStop() {
        Orchestrator orch = new Orchestrator(Map.of("hob", LocalClient.forDevice("demo-hob-robot",
                new SimulatedExecutor.Options().faults(Map.of("example-lentil-soup#n5", "timeout")))), null, new ScriptedHuman(true, true, false), null);
        RunRecord r = orch.run(Job.ofRequest("j", requestFor("lentil-soup"), Bundle.recipe("lentil-soup"), true));
        assertEquals("stopped", r.outcome);
        assertEquals("discard", r.disposition);
        assertTrue(r.recovery.stream().anyMatch(a -> "stop".equals(a.get("action"))));
    }

    @Test
    void transportErrorsRetryThenGiveUp() {
        ExecutorClient dead = new HubClient("http://127.0.0.1:9", null, 1, 0, 0, 0, "dead");
        java.util.List<Double> waits = new java.util.ArrayList<>();
        Orchestrator orch = new Orchestrator(Map.of("dead", dead), null, null, null, null, new java.util.ArrayList<>(), waits::add);
        RunRecord r = orch.run(Job.ofRequest("j", requestFor("lentil-soup"), Bundle.recipe("lentil-soup"), true));
        // the dry run fails (unreachable), so the device ranks as busy and nothing is started
        assertEquals("refused", r.outcome);
        assertEquals("busy", r.refusal.get("reason"));
        assertTrue(waits.isEmpty());
    }
}
