package ai.cookwala.sdk;

/**
 * Arguments of {@link CookwalaClient#dryRun}: a recipe (by id known to the hub, or the full document), a device
 * (by id, or the full capability document), whether a person is present and whether model-based rungs may be used.
 *
 * <pre>
 * c.dryRun(new DryRunArgs().recipeId("koshari").deviceId("demo-hob-robot-basic").humanPresent(true));
 * </pre>
 */
public final class DryRunArgs {
    Object recipe;
    String recipeId;
    Object device;
    String deviceId;
    boolean humanPresent = false;
    boolean allowModel = true;

    public DryRunArgs recipe(Object recipeDocument) { this.recipe = recipeDocument; return this; }
    public DryRunArgs recipeId(String id) { this.recipeId = id; return this; }
    public DryRunArgs device(Object capabilityDocument) { this.device = capabilityDocument; return this; }
    public DryRunArgs deviceId(String id) { this.deviceId = id; return this; }
    public DryRunArgs humanPresent(boolean present) { this.humanPresent = present; return this; }
    public DryRunArgs allowModel(boolean allow) { this.allowModel = allow; return this; }
}
