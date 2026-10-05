package ai.cookwala.samples;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.io.File;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/** Drives the reference hub (hub/cookwala_hub.py) when this runs inside the Cookwala repository with python3; skipped otherwise. */
class ReferenceHubTest {
    private static Process hub;
    private static int port;

    private static Path repo() {
        for (Path p = Paths.get("").toAbsolutePath(); p != null; p = p.getParent()) {
            if (Files.exists(p.resolve("hub/cookwala_hub.py")) && Files.exists(p.resolve("tools/cookwala_ref.py"))) return p;
        }
        return null;
    }

    @BeforeAll
    static void start() throws Exception {
        Path repo = repo();
        if (repo == null || "true".equals(System.getProperty("cookwala.skipHub"))) return;
        try (ServerSocket s = new ServerSocket(0)) {
            port = s.getLocalPort();
        }
        try {
            hub = new ProcessBuilder("python3", repo.resolve("hub/cookwala_hub.py").toString(), "--port", String.valueOf(port), "--speed", "2000",
                    "--token", "test-token").redirectErrorStream(true).redirectOutput(new File(System.getProperty("java.io.tmpdir"), "cookwala-hub-test.log")).start();
        } catch (java.io.IOException noPython) {
            hub = null;
            return;
        }
        for (int i = 0; i < 100; i++) {
            try (Socket probe = new Socket("127.0.0.1", port)) {
                probe.getPort();
                return;
            } catch (java.io.IOException e) {
                if (!hub.isAlive()) { hub = null; return; }
                Thread.sleep(100);
            }
        }
    }

    @AfterAll
    static void stop() throws Exception {
        if (hub != null) {
            hub.destroy();
            hub.waitFor(5, TimeUnit.SECONDS);
        }
    }

    @Test
    void demoAgainstHub() {
        assumeTrue(hub != null && hub.isAlive(), "needs the Cookwala repository and python3");
        Reporter rep = Scenarios.demo("http://127.0.0.1:" + port, "test-token", null, null);
        Map<String, String> outcomes = new LinkedHashMap<>();
        for (RunRecord r : rep.records) outcomes.put(r.job, r.outcome);
        assertEquals(Map.of("shakshuka", "refused", "salata", "completed", "lentil-note", "completed"), outcomes, rep.toMarkdown());
    }

    @Test
    void wrongTokenIsAProblem() {
        assumeTrue(hub != null && hub.isAlive(), "needs the Cookwala repository and python3");
        CookwalaProblem p = assertThrows(CookwalaProblem.class, () -> new HubClient("http://127.0.0.1:" + port, "wrong", 30, 0, 0.1, 0.1, null).capabilities());
        assertEquals(401, p.status());
    }
}
