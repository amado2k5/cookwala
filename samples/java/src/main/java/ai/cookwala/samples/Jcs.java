package ai.cookwala.samples;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * RFC 8785 canonical JSON and the Cookwala document hash (the same output as tools/cookwala_ref.py).
 *
 * <p>Keys are sorted by UTF-16 code units ({@link String#compareTo} does exactly that), numbers use ECMAScript
 * formatting (integers without {@code .0}, shortest round-trip digits, {@code 1e+21}, {@code 1e-7}),
 * and characters below 0x20 other than b, f, n, r and t escapes are written as lower-case six-character u00XX escapes.
 * The shortest-digit search is BigDecimal based, so the output is the same on Java 17 as on Java 19+.
 */
public final class Jcs {
    private Jcs() {}

    /** RFC 8785 canonical JSON text of a parsed JSON value. */
    public static String canonical(Object value) {
        StringBuilder b = new StringBuilder();
        write(b, value);
        return b.toString();
    }

    @SuppressWarnings("unchecked")
    private static void write(StringBuilder b, Object v) {
        if (v == null) { b.append("null"); return; }
        if (v instanceof Boolean) { b.append(((Boolean) v) ? "true" : "false"); return; }
        if (v instanceof Number) { b.append(number((Number) v)); return; }
        if (v instanceof String) { string(b, (String) v); return; }
        if (v instanceof Map) {
            Map<Object, Object> m = (Map<Object, Object>) v;
            List<String> keys = new ArrayList<>();
            for (Object k : m.keySet()) {
                if (!(k instanceof String)) throw new IllegalArgumentException("JSON object keys must be strings");
                keys.add((String) k);
            }
            Collections.sort(keys); // String.compareTo compares UTF-16 code units, as RFC 8785 requires
            b.append('{');
            for (int i = 0; i < keys.size(); i++) {
                if (i > 0) b.append(',');
                string(b, keys.get(i));
                b.append(':');
                write(b, m.get(keys.get(i)));
            }
            b.append('}');
            return;
        }
        if (v instanceof List || v instanceof Set) {
            b.append('[');
            boolean first = true;
            for (Object o : (Iterable<Object>) v) {
                if (!first) b.append(',');
                first = false;
                write(b, o);
            }
            b.append(']');
            return;
        }
        if (v instanceof Object[]) { write(b, java.util.Arrays.asList((Object[]) v)); return; }
        throw new IllegalArgumentException("not JSON: " + v.getClass().getName());
    }

    static String number(Number n) {
        if (n instanceof Long || n instanceof Integer || n instanceof Short || n instanceof Byte || n instanceof BigInteger) return n.toString();
        double d = (n instanceof BigDecimal) ? n.doubleValue() : n.doubleValue();
        if (Double.isNaN(d) || Double.isInfinite(d)) throw new IllegalArgumentException("JCS forbids NaN and Infinity");
        return Json.esNumber(d);
    }

    private static void string(StringBuilder b, String s) {
        b.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\b': b.append("\\b"); break;
                case '\f': b.append("\\f"); break;
                case '\n': b.append("\\n"); break;
                case '\r': b.append("\\r"); break;
                case '\t': b.append("\\t"); break;
                default:
                    if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
                    else b.append(c);
            }
        }
        b.append('"');
    }

    /** {@code sha256:<hex>} of the canonical JSON of doc without its own {@code hash} and {@code signature}. */
    public static String docHash(Object doc) {
        return docHash(doc, "hash", "signature");
    }

    /** {@code sha256:<hex>} of the canonical JSON of doc without the given top-level keys. */
    @SuppressWarnings("unchecked")
    public static String docHash(Object doc, String... exclude) {
        Object body = doc;
        if (doc instanceof Map) {
            Map<String, Object> m = new LinkedHashMap<>((Map<String, Object>) doc);
            for (String k : exclude) m.remove(k);
            body = m;
        }
        try {
            byte[] h = MessageDigest.getInstance("SHA-256").digest(canonical(body).getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder("sha256:");
            for (byte x : h) hex.append(String.format("%02x", x & 0xff));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
