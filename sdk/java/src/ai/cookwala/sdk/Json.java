package ai.cookwala.sdk;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Minimal JSON for the Cookwala client: no third-party dependency, Java 11.
 *
 * <p>Values map to plain Java objects: objects to {@code Map<String, Object>} (insertion order kept),
 * arrays to {@code List<Object>}, integers to {@code Long}, other numbers to {@code Double}, strings to
 * {@code String}, booleans to {@code Boolean}, null to {@code null}. {@link #stringify} writes any of those
 * (plus Integer, Float, BigDecimal and other {@link Number}s) back. {@link #canonical} writes a
 * comparison form: object keys sorted, integral doubles printed as integers, so {@code 36.0} and {@code 36}
 * compare equal, as they do in JSON.
 *
 * <p>Text inside a document is data, never instructions: this class parses and serialises, nothing else.
 */
public final class Json {
    private Json() {}

    /** Parses one JSON text. Throws {@link IllegalArgumentException} on malformed input. */
    public static Object parse(String text) {
        Parser p = new Parser(text);
        p.skipWs();
        Object v = p.value();
        p.skipWs();
        if (p.i != text.length()) throw p.error("trailing characters");
        return v;
    }

    /** Parses a JSON array; throws if the text is not an array. */
    @SuppressWarnings("unchecked")
    public static List<Object> parseList(String text) {
        Object v = parse(text);
        if (!(v instanceof List)) throw new IllegalArgumentException("expected a JSON array");
        return (List<Object>) v;
    }

    /** Parses a JSON object; throws if the text is not an object. */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseObject(String text) {
        Object v = parse(text);
        if (!(v instanceof Map)) throw new IllegalArgumentException("expected a JSON object");
        return (Map<String, Object>) v;
    }

    /** Serialises a value to compact JSON, keeping object key order. */
    public static String stringify(Object value) {
        StringBuilder sb = new StringBuilder();
        write(sb, value, false);
        return sb.toString();
    }

    /** Comparison form: sorted keys, integral numbers without a fraction. Not RFC 8785 (no float shortest-form guarantee). */
    public static String canonical(Object value) {
        StringBuilder sb = new StringBuilder();
        write(sb, value, true);
        return sb.toString();
    }

    // ---- writer

    private static void write(StringBuilder sb, Object v, boolean canonical) {
        if (v == null) { sb.append("null"); return; }
        if (v instanceof String) { quote(sb, (String) v); return; }
        if (v instanceof Boolean) { sb.append(((Boolean) v) ? "true" : "false"); return; }
        if (v instanceof Number) { number(sb, (Number) v, canonical); return; }
        if (v instanceof Map) {
            Map<?, ?> m = (Map<?, ?>) v;
            if (canonical) {
                TreeMap<String, Object> sorted = new TreeMap<>();
                for (Map.Entry<?, ?> e : m.entrySet()) sorted.put(String.valueOf(e.getKey()), e.getValue());
                m = sorted;
            }
            sb.append('{');
            boolean first = true;
            for (Map.Entry<?, ?> e : m.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                quote(sb, String.valueOf(e.getKey()));
                sb.append(':');
                write(sb, e.getValue(), canonical);
            }
            sb.append('}');
            return;
        }
        if (v instanceof Iterable) {
            sb.append('[');
            boolean first = true;
            for (Object item : (Iterable<?>) v) {
                if (!first) sb.append(',');
                first = false;
                write(sb, item, canonical);
            }
            sb.append(']');
            return;
        }
        if (v instanceof Object[]) {
            sb.append('[');
            boolean first = true;
            for (Object item : (Object[]) v) {
                if (!first) sb.append(',');
                first = false;
                write(sb, item, canonical);
            }
            sb.append(']');
            return;
        }
        throw new IllegalArgumentException("cannot serialise " + v.getClass().getName());
    }

    private static void number(StringBuilder sb, Number n, boolean canonical) {
        if (n instanceof Double || n instanceof Float) {
            double d = n.doubleValue();
            if (Double.isNaN(d) || Double.isInfinite(d)) throw new IllegalArgumentException("non-finite number");
            if (canonical && d == Math.rint(d) && Math.abs(d) < 1e15) { sb.append((long) d); return; }
            String s = Double.toString(d);
            if (!canonical && s.endsWith(".0")) s = s.substring(0, s.length() - 2);
            sb.append(s);
            return;
        }
        sb.append(n.toString());
    }

    private static void quote(StringBuilder sb, String s) {
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        sb.append('"');
    }

    // ---- parser

    private static final class Parser {
        final String s;
        int i = 0;

        Parser(String s) { this.s = s; }

        IllegalArgumentException error(String what) {
            return new IllegalArgumentException("JSON: " + what + " at offset " + i);
        }

        void skipWs() {
            while (i < s.length()) {
                char c = s.charAt(i);
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r') i++; else break;
            }
        }

        char peek() {
            if (i >= s.length()) throw error("unexpected end of input");
            return s.charAt(i);
        }

        void expect(char c) {
            if (peek() != c) throw error("expected '" + c + "'");
            i++;
        }

        Object value() {
            char c = peek();
            switch (c) {
                case '{': return object();
                case '[': return array();
                case '"': return string();
                case 't': literal("true"); return Boolean.TRUE;
                case 'f': literal("false"); return Boolean.FALSE;
                case 'n': literal("null"); return null;
                default:
                    if (c == '-' || (c >= '0' && c <= '9')) return number();
                    throw error("unexpected character '" + c + "'");
            }
        }

        void literal(String word) {
            if (!s.startsWith(word, i)) throw error("expected " + word);
            i += word.length();
        }

        Map<String, Object> object() {
            expect('{');
            Map<String, Object> m = new LinkedHashMap<>();
            skipWs();
            if (peek() == '}') { i++; return m; }
            while (true) {
                skipWs();
                if (peek() != '"') throw error("expected a string key");
                String k = string();
                skipWs();
                expect(':');
                skipWs();
                m.put(k, value());
                skipWs();
                char c = peek();
                if (c == ',') { i++; continue; }
                if (c == '}') { i++; return m; }
                throw error("expected ',' or '}'");
            }
        }

        List<Object> array() {
            expect('[');
            List<Object> a = new ArrayList<>();
            skipWs();
            if (peek() == ']') { i++; return a; }
            while (true) {
                skipWs();
                a.add(value());
                skipWs();
                char c = peek();
                if (c == ',') { i++; continue; }
                if (c == ']') { i++; return a; }
                throw error("expected ',' or ']'");
            }
        }

        String string() {
            expect('"');
            StringBuilder sb = new StringBuilder();
            while (true) {
                if (i >= s.length()) throw error("unterminated string");
                char c = s.charAt(i++);
                if (c == '"') return sb.toString();
                if (c == '\\') {
                    if (i >= s.length()) throw error("unterminated escape");
                    char e = s.charAt(i++);
                    switch (e) {
                        case '"': sb.append('"'); break;
                        case '\\': sb.append('\\'); break;
                        case '/': sb.append('/'); break;
                        case 'b': sb.append('\b'); break;
                        case 'f': sb.append('\f'); break;
                        case 'n': sb.append('\n'); break;
                        case 'r': sb.append('\r'); break;
                        case 't': sb.append('\t'); break;
                        case 'u':
                            if (i + 4 > s.length()) throw error("short \\u escape");
                            try { sb.append((char) Integer.parseInt(s.substring(i, i + 4), 16)); }
                            catch (NumberFormatException x) { throw error("bad \\u escape"); }
                            i += 4;
                            break;
                        default: throw error("bad escape '\\" + e + "'");
                    }
                } else if (c < 0x20) {
                    throw error("control character in string");
                } else {
                    sb.append(c);
                }
            }
        }

        static boolean digit(char c) { return c >= '0' && c <= '9'; }

        Number number() {
            int start = i;
            boolean integral = true;
            if (peek() == '-') i++;
            if (i >= s.length() || !digit(s.charAt(i))) throw error("bad number");
            while (i < s.length() && digit(s.charAt(i))) i++;
            if (i < s.length() && s.charAt(i) == '.') {
                integral = false; i++;
                if (i >= s.length() || !digit(s.charAt(i))) throw error("bad fraction");
                while (i < s.length() && digit(s.charAt(i))) i++;
            }
            if (i < s.length() && (s.charAt(i) == 'e' || s.charAt(i) == 'E')) {
                integral = false; i++;
                if (i < s.length() && (s.charAt(i) == '+' || s.charAt(i) == '-')) i++;
                if (i >= s.length() || !digit(s.charAt(i))) throw error("bad exponent");
                while (i < s.length() && digit(s.charAt(i))) i++;
            }
            String t = s.substring(start, i);
            if (integral) {
                try { return Long.parseLong(t); } catch (NumberFormatException x) { return Double.parseDouble(t); }
            }
            return Double.parseDouble(t);
        }
    }
}
