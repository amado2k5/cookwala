package ai.cookwala.samples;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class OrchestrationTest {
    @Test
    void demoMatchesSpec() {
        Reporter rep = Scenarios.demo();
        Map<String, RunRecord> by = new LinkedHashMap<>();
        for (RunRecord r : rep.records) by.put(r.job, r);
        Map<String, String> outcomes = new LinkedHashMap<>();
        by.forEach((k, r) -> outcomes.put(k, r.outcome));
        assertEquals(Map.of("lentil-soup", "completed", "shakshuka", "refused", "salata", "completed", "koshari", "stopped", "shakshuka-2", "failed",
                "lentil-note", "completed"), outcomes);
        // SPEC.md demo table: device, recovery, food
        String[][] table = {
                {"lentil-soup", "demo-hob-robot-basic", "try_next_device,resume", "served"},
                {"shakshuka", null, "", "not_cooked"},
                {"salata", "demo-hob-robot", "ask_presence", "served"},
                {"koshari", "demo-hob-robot", "discard_and_report", "discard"},
                {"shakshuka-2", "demo-hob-robot", "discard_and_report", "discard"},
                {"lentil-note", "demo-hob-robot", "resume", "served"}};
        for (String[] row : table) {
            RunRecord r = by.get(row[0]);
            assertEquals(row[1], r.device, row[0]);
            assertEquals(row[2], String.join(",", r.recovery.stream().map(a -> (String) a.get("action")).toArray(String[]::new)), row[0]);
            assertEquals(row[3], r.disposition, row[0]);
        }
        assertEquals("allergen_block", by.get("shakshuka").refusal.get("reason"));
        assertEquals("planner", by.get("shakshuka").refusal.get("gate"));
        assertEquals("busy", by.get("lentil-soup").recovery.get(0).get("reason"));
        assertEquals(List.of("oil.max_temp"), by.get("koshari").incident.get("safetyLimitsFired"));
        assertEquals("cw.incident.overheat", by.get("koshari").incident.get("category"));
        assertEquals("cw.incident.sensor_failure", by.get("shakshuka-2").incident.get("category"));
        assertNull(by.get("lentil-note").incident);
        assertEquals(1, by.get("lentil-note").findings.size());
        assertEquals(1L, rep.summary().get("untrustedTextFindings"));
        assertEquals(0, rep.records.stream().mapToInt(r -> r.anomalies.size()).sum());
        for (RunRecord r : rep.records) {
            if (r.incident != null) {
                String text = Json.write(r.incident);
                assertFalse(text.contains(r.job), r.job); // anonymous
                assertFalse(text.contains("household"), r.job);
            }
        }
        assertEquals(List.of("accepted", "preparing", "running", "needs_human", "running", "completed"), by.get("lentil-soup").transitions);
    }

    @Test
    void rankingPrefersFewerPeople() {
        Map<String, ExecutorClient> devices = new LinkedHashMap<>();
        for (String d : Bundle.devices().keySet()) devices.put(d, LocalClient.forDevice(d));
        List<Orchestrator.Ranked> ranked = new Orchestrator(devices).rank(Bundle.recipe("koshari"), true);
        assertEquals(4, ranked.size());
        assertEquals("accepted", ranked.get(0).dryRun.get("state"));
        assertEquals("refused", ranked.get(ranked.size() - 1).dryRun.get("state"));
    }

    @Test
    void readyRequestJob() {
        Orchestrator orch = new Orchestrator(Scenarios.kitchen(), null, new ScriptedHuman(), new java.util.ArrayList<>());
        RunRecord r = orch.run(Job.ofRequest("j", TestData.requestFor("salata-baladi"), Bundle.recipe("salata-baladi"), true));
        assertEquals("completed", r.outcome);
        assertEquals("served", r.disposition);
    }
}
