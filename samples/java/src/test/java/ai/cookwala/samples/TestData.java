package ai.cookwala.samples;

import java.util.Map;

/** Shared helpers for the tests. */
final class TestData {
    private TestData() {}

    /** An ExecuteRequest for a bundled recipe, like the Python tests' request_for; extra entries override. */
    static Map<String, Object> requestFor(String key, Object... overrides) {
        Map<String, Object> r = Bundle.recipe(key);
        Map<String, Object> req = Py.map("core", "0.2.0", "kind", "ExecuteRequest", "id", "ex-" + key, "recipe", Bundle.globalRef(r),
                "recipeHash", Jcs.docHash(r), "requestedBy", "person:p-1", "idempotencyKey", "key-" + key + "-0001");
        for (int i = 0; i + 1 < overrides.length; i += 2) req.put((String) overrides[i], overrides[i + 1]);
        return req;
    }
}
