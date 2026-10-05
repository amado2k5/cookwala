package ai.cookwala.samples;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;

/**
 * One interface over two transports: {@link HubClient} (HTTP, any Core 0.2 executor or hub) and {@link LocalClient}
 * (an in-process {@link SimulatedExecutor}). Orchestrators, agents and recovery only use these methods, so a sample
 * written offline runs unchanged against a real hub.
 */
public interface ExecutorClient {
    /** A name for reports. */
    String name();

    Map<String, Object> capabilities();

    Map<String, Object> safetyLimits();

    List<Map<String, Object>> recalls();

    /**
     * Start an execution. The executor is the authority: it checks everything again and may refuse.
     *
     * @param idempotencyKey reused on every retry, so a request that already landed is not executed twice
     * @param humanPresent   whether a person is in the kitchen (a simulator input; real hubs sense presence)
     */
    Map<String, Object> startExecution(Map<String, Object> request, String idempotencyKey, boolean humanPresent);

    Map<String, Object> getExecution(String executionId);

    /** Never refused once the executor is reached (Core 6.2). */
    Map<String, Object> stopExecution(String executionId, String reason);

    /** Resume with If-Match: the status seq the caller last saw. */
    Map<String, Object> resumeExecution(String executionId, Object seq);

    Map<String, Object> executionLog(String executionId);

    Map<String, Object> reportIncident(Map<String, Object> doc);

    /** The dry run this executor would do, without starting anything. */
    Map<String, Object> dryRun(Map<String, Object> recipe, boolean humanPresent);

    /** Let time pass: one simulator tick, or a short wait for a real executor. */
    void advance();

    /** A random key such as {@code ex-0123456789abcdef0123}. */
    static String newKey(String prefix) {
        byte[] b = new byte[10];
        Holder.RANDOM.nextBytes(b);
        StringBuilder s = new StringBuilder(prefix).append('-');
        for (byte x : b) s.append(String.format("%02x", x & 0xff));
        return s.toString();
    }

    /** Holds the shared random source. */
    final class Holder {
        private Holder() {}
        static final SecureRandom RANDOM = new SecureRandom();
    }
}
