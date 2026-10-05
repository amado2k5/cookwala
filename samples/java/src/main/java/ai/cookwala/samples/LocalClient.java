package ai.cookwala.samples;

import java.util.List;
import java.util.Map;

/** The {@link ExecutorClient} interface over an in-process {@link SimulatedExecutor}. */
public class LocalClient implements ExecutorClient {
    private final SimulatedExecutor ex;
    private final String name;

    public LocalClient(SimulatedExecutor executor, String name) {
        this.ex = executor;
        this.name = name != null ? name : Py.str(Py.obj(executor.capabilities(), "actor"), "id", "simulated");
    }

    public LocalClient(SimulatedExecutor executor) { this(executor, null); }

    /** A client for one bundled device, named after it. */
    public static LocalClient forDevice(String device, SimulatedExecutor.Options options) {
        return new LocalClient(SimulatedExecutor.fromBundle(device, options), device);
    }

    public static LocalClient forDevice(String device) { return forDevice(device, null); }

    public SimulatedExecutor executor() { return ex; }

    @Override public String name() { return name; }
    @Override public Map<String, Object> capabilities() { return ex.capabilities(); }
    @Override public Map<String, Object> safetyLimits() { return ex.safetyLimits(); }
    @Override public List<Map<String, Object>> recalls() { return ex.recalls(); }

    @Override
    public Map<String, Object> startExecution(Map<String, Object> request, String idempotencyKey, boolean humanPresent) {
        String key = Py.truthy(idempotencyKey) ? idempotencyKey : Py.truthy(request.get("idempotencyKey")) ? Py.pyStr(request.get("idempotencyKey")) : ExecutorClient.newKey("ex");
        return ex.startExecution(request, key, humanPresent);
    }

    @Override public Map<String, Object> getExecution(String executionId) { return ex.getExecution(executionId); }
    @Override public Map<String, Object> stopExecution(String executionId, String reason) { return ex.stopExecution(executionId, reason); }
    @Override public Map<String, Object> resumeExecution(String executionId, Object seq) { return ex.resumeExecution(executionId, seq); }
    @Override public Map<String, Object> executionLog(String executionId) { return ex.executionLog(executionId); }
    @Override public Map<String, Object> reportIncident(Map<String, Object> doc) { return ex.reportIncident(doc); }

    @Override
    public Map<String, Object> dryRun(Map<String, Object> recipe, boolean humanPresent) {
        return Simulator.dryRun(recipe, ex.capabilities(), humanPresent, true, ex.safetyLimits(), ex.nowIso());
    }

    @Override public void advance() { ex.tick(); }
}
