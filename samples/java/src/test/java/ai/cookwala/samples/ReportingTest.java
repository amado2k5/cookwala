package ai.cookwala.samples;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import javax.xml.parsers.DocumentBuilderFactory;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Element;

class ReportingTest {
    @Test
    void renderings() throws Exception {
        Reporter rep = Scenarios.demo();
        Map<String, Object> j = Json.parseObject(rep.toJson());
        assertEquals(6L, Py.obj(j, "summary").get("runs"));
        assertEquals("Cookwala samples demo (offline, simulated kitchen)", j.get("report"));
        Map<String, Object> run0 = Py.asMap(Py.arr(j, "runs").get(0));
        assertTrue(run0.containsKey("requestId") && run0.containsKey("requestedBy") && !run0.containsKey("request"));

        Element x = DocumentBuilderFactory.newInstance().newDocumentBuilder()
                .parse(new ByteArrayInputStream(rep.toJunit().getBytes(StandardCharsets.UTF_8))).getDocumentElement();
        assertEquals("testsuite", x.getTagName());
        assertEquals("6", x.getAttribute("tests"));
        assertEquals("1", x.getAttribute("failures"));
        assertEquals("1", x.getAttribute("skipped"));
        assertEquals(6, x.getElementsByTagName("testcase").getLength());

        String csv = rep.toCsv();
        assertEquals(7, csv.strip().split("\r\n").length);
        assertTrue(csv.startsWith("job,recipe,device,outcome,refusal,recovery,disposition,human,incident\r\n"));
        assertTrue(csv.contains("koshari,example-koshari,demo-hob-robot,stopped,,discard_and_report,discard,0,cw.incident.overheat\r\n"));

        String md = rep.toMarkdown();
        assertTrue(md.contains("| koshari |"));
        assertTrue(md.contains("6 runs: 3 completed, 1 failed, 1 refused, 1 stopped. Served 3, discarded 2, incidents reported 2, people asked 3 times."));
        assertTrue(md.contains("allergen_block: example-shakshuka contains blocked allergen(s) ['eggs']"));
        assertEquals(md, rep.render("md"));

        assertEquals(0L, new Reporter().summary().get("runs"));
    }

    @Test
    void incidentIsAnonymous() {
        RunRecord r = new RunRecord("my-secret-job");
        r.status = Py.map("state", "failed", "updatedAt", "2026-10-05T01:02:03Z", "step", Py.map("op", "cw.op.simmer"),
                "x-sim-fault", Py.map("kind", "sensor_fault"));
        r.log = Py.map("endedAt", "2026-10-05T01:02:03Z", "x-heatStarted", true, "device", Py.map("model", "M"));
        Map<String, Object> inc = Reporting.incidentFrom(r);
        assertEquals("2026-10-05", inc.get("date"));
        assertTrue(((String) inc.get("id")).matches("inc-2026-10-05-[0-9a-f]{8}"));
        assertEquals("cw.incident.sensor_failure", inc.get("category"));
        assertEquals("low", inc.get("severity"));
        assertEquals("Execution ended failed during cw.op.simmer; food discarded, no injury.", inc.get("description"));
        assertEquals("M", inc.get("deviceModel"));
        assertTrue(!Json.write(inc).contains("01:02:03"));
    }

    @Test
    void xmlQuoting() {
        assertEquals("\"a &amp; b\"", Reporter.quoteattr("a & b"));
        assertEquals("'say \"hi\"'", Reporter.quoteattr("say \"hi\""));
        assertEquals("\"it's &quot;x&quot;\"", Reporter.quoteattr("it's \"x\""));
    }
}
