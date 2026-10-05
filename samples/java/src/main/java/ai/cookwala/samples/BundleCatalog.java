package ai.cookwala.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeSet;

/** Recipes from the bundled snapshot (four example recipes from the Cookwala repository). */
public class BundleCatalog {
    protected final Map<String, Object> recipes;

    public BundleCatalog(Map<String, Object> recipes) {
        this.recipes = recipes != null ? recipes : Bundle.recipes();
    }

    public BundleCatalog() { this(null); }

    /** Recipe keys, sorted. */
    public List<String> list() { return new ArrayList<>(new TreeSet<>(recipes.keySet())); }

    /** A recipe by key, document id or global reference; null when absent. */
    public Map<String, Object> get(String key) {
        for (Map.Entry<String, Object> e : recipes.entrySet()) {
            Map<String, Object> doc = Py.asMap(e.getValue());
            if (doc == null) continue;
            if (key.equals(e.getKey()) || key.equals(doc.get("id")) || key.equals(Bundle.globalRef(doc))) return doc;
        }
        return null;
    }

    /** Match a dish by key, id or English name. The text is a lookup key, never an instruction. */
    public List<Map<String, Object>> find(String text) {
        String t = text.strip().toLowerCase(Locale.ROOT);
        List<Map<String, Object>> hits = new ArrayList<>();
        for (Map.Entry<String, Object> e : recipes.entrySet()) {
            Map<String, Object> d = Py.asMap(e.getValue());
            if (d == null) continue;
            String en = Py.str(Py.obj(Py.obj(d, "dish"), "names"), "en", "").toLowerCase(Locale.ROOT);
            if (e.getKey().contains(t) || Py.str(d, "id", "").contains(t) || en.contains(t)) hits.add(d);
        }
        return hits;
    }

    /** {global reference, sha256 hash}. */
    public String[] refAndHash(Map<String, Object> doc) {
        return new String[] {Bundle.globalRef(doc), Jcs.docHash(doc)};
    }
}
