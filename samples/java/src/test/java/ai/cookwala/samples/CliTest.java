package ai.cookwala.samples;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class CliTest {
    private static String[] last = new String[1];

    private static int run(String... args) {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        int code = Cli.run(args, new PrintStream(b, true, StandardCharsets.UTF_8));
        last[0] = b.toString(StandardCharsets.UTF_8);
        return code;
    }

    @Test
    void exitCodes() {
        assertEquals(2, run());
        assertEquals(0, run("--help"));
        assertEquals(2, run("bogus"));
        assertEquals(0, run("version"));
        assertTrue(last[0].startsWith("cookwala-samples 0.2.0 (Core 0.2.0)"));
        assertEquals(0, run("list"));
        assertTrue(last[0].contains("recipes: koshari, lentil-soup, salata-baladi, shakshuka"));
        assertEquals(0, run("demo", "--format", "csv"));
        assertEquals(7, last[0].strip().split("\r\n").length);
        assertEquals(2, run("demo", "--format", "pdf"));
        assertEquals(0, run("gates", "lentil-soup", "--human-present"));
        assertEquals(1, run("gates", "shakshuka", "--block", "eggs", "--human-present"));
        assertTrue(last[0].contains("\"reason\": \"allergen_block\""));
        assertEquals(2, run("gates"));
        assertEquals(0, run("plan", "koshari", "--servings", "6", "--human-present"));
        assertTrue(last[0].contains("\"servings\": 6.0"));
        assertEquals(1, run("plan", "shakshuka", "--block", "eggs"));
        assertEquals(0, run("run", "lentil", "--human-present", "--format", "json"));
        assertEquals(1, run("run", "koshari", "--human-present", "--fault", "example-koshari#n14=overheat", "--format", "json"));
        assertEquals(2, run("run", "koshari", "--fault", "n1=explode"));
        assertEquals(2, run("run", "koshari", "--fault", "noequals"));
        for (String f : new String[] {"csv", "markdown", "junit"}) {  // a run that did not complete exits 1 in every format
            assertEquals(1, run("run", "koshari", "--human-present", "--fault", "example-koshari#n14=overheat", "--format", f), f);
        }
        assertEquals(2, run("run"));
    }
}
