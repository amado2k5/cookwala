package ai.cookwala.samples;

import java.util.LinkedHashMap;
import java.util.Map;

/** Recipes served by the reference hub's /v1/tools/recipes (file stems) and /v1/tools/recipes/{stem}. */
public class HubCatalog extends BundleCatalog {
    public HubCatalog(HubClient client) {
        super(fetch(client));
    }

    private static Map<String, Object> fetch(HubClient client) {
        Map<String, Object> out = new LinkedHashMap<>();
        for (Object s : Py.arr(Py.asMap(client.call("GET", "/v1/tools/recipes")), "recipes")) {
            String stem = Py.pyStr(s);
            out.put(stem, client.call("GET", "/v1/tools/recipes/" + stem));
        }
        return out;
    }
}
