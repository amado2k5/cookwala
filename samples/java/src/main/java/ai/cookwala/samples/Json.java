package ai.cookwala.samples;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * A small, strict JSON (RFC 8259) parser and writer with no dependencies.
 *
 * <p>Parsing gives {@code Map<String,Object>} (insertion-ordered {@link LinkedHashMap}), {@code List<Object>}
 * ({@link ArrayList}), {@code String}, {@code Long} (integers without fraction or exponent that fit),
 * {@code Double} (everything else), {@code Boolean} and {@code null}.
 *
 * <p>Writing formats doubles the way Python's {@code json} module does (shortest round-trip digits,
 * {@code 1.0}, {@code 1e-07}, {@code 1e+21}) and leaves non-ASCII text unescaped, so reports read the same in
 * every port. {@link #write} is compact; {@link #pretty} indents.
 */
public final class Json {
    private Json() {}

    /** Thrown for text that is not JSON. */
    public static final class JsonException extends IllegalArgumentException {
        public JsonException(String message) { super(message); }
    }

    // ------------------------------------------------------------------ parse

    /** Parse one JSON value; trailing non-whitespace is an error. */
    public static Object parse(String text) {
        if (text == null) throw new JsonException("no JSON text");
        Parser p = new Parser(text);
        p.ws();
        Object v = p.value(0);
        p.ws();
        if (p.i != text.length()) throw p.err("trailing characters");
        return v;
    }

    /** Parse a JSON object. */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseObject(String text) {
        Object v = parse(text);
        if (!(v instanceof Map)) throw new JsonException("expected a JSON object");
        return (Map<String, Object>) v;
    }

    /** A deep copy of a parsed JSON value (maps and lists are copied; scalars are immutable). */
    @SuppressWarnings("unchecked")
    public static <T> T copy(T value) {
        if (value instanceof Map) {
            Map<String, Object> out = new LinkedHashMap<>();
            for (Map.Entry<String, Object> e : ((Map<String, Object>) value).entrySet()) out.put(e.getKey(), copy(e.getValue()));
            return (T) out;
        }
        if (value instanceof List) {
            List<Object> out = new ArrayList<>();
            for (Object o : (List<Object>) value) out.add(copy(o));
            return (T) out;
        }
        return value;
    }

    private static final class Parser {
        private static final int MAX_DEPTH = 512;
        final String s;
        int i;

        Parser(String s) { this.s = s; }

        JsonException err(String what) { return new JsonException(what + " at offset " + i); }

        void ws() {
            while (i < s.length()) {
                char c = s.charAt(i);
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r') i++; else break;
            }
        }

        Object value(int depth) {
            if (depth > MAX_DEPTH) throw err("nesting too deep");
            if (i >= s.length()) throw err("unexpected end of input");
            char c = s.charAt(i);
            switch (c) {
                case '{': return object(depth);
                case '[': return array(depth);
                case '"': return string();
                case 't': return literal("true", Boolean.TRUE);
                case 'f': return literal("false", Boolean.FALSE);
                case 'n': return literal("null", null);
                default:
                    if (c == '-' || (c >= '0' && c <= '9')) return number();
                    throw err("unexpected character '" + c + "'");
            }
        }

        Object literal(String word, Object v) {
            if (!s.startsWith(word, i)) throw err("invalid literal");
            i += word.length();
            return v;
        }

        Map<String, Object> object(int depth) {
            Map<String, Object> m = new LinkedHashMap<>();
            i++;
            ws();
            if (i < s.length() && s.charAt(i) == '}') { i++; return m; }
            while (true) {
                ws();
                if (i >= s.length() || s.charAt(i) != '"') throw err("expected a string key");
                String k = string();
                ws();
                if (i >= s.length() || s.charAt(i) != ':') throw err("expected ':'");
                i++;
                ws();
                m.put(k, value(depth + 1));
                ws();
                if (i >= s.length()) throw err("unterminated object");
                char c = s.charAt(i++);
                if (c == '}') return m;
                if (c != ',') { i--; throw err("expected ',' or '}'"); }
            }
        }

        List<Object> array(int depth) {
            List<Object> l = new ArrayList<>();
            i++;
            ws();
            if (i < s.length() && s.charAt(i) == ']') { i++; return l; }
            while (true) {
                ws();
                l.add(value(depth + 1));
                ws();
                if (i >= s.length()) throw err("unterminated array");
                char c = s.charAt(i++);
                if (c == ']') return l;
                if (c != ',') { i--; throw err("expected ',' or ']'"); }
            }
        }

        String string() {
            i++; // opening quote
            StringBuilder b = new StringBuilder();
            while (true) {
                if (i >= s.length()) throw err("unterminated string");
                char c = s.charAt(i++);
                if (c == '"') return b.toString();
                if (c < 0x20) { i--; throw err("control character in string"); }
                if (c != '\\') { b.append(c); continue; }
                if (i >= s.length()) throw err("unterminated escape");
                char e = s.charAt(i++);
                switch (e) {
                    case '"': b.append('"'); break;
                    case '\\': b.append('\\'); break;
                    case '/': b.append('/'); break;
                    case 'b': b.append('\b'); break;
                    case 'f': b.append('\f'); break;
                    case 'n': b.append('\n'); break;
                    case 'r': b.append('\r'); break;
                    case 't': b.append('\t'); break;
                    case 'u':
                        if (i + 4 > s.length()) throw err("short \\u escape");
                        int cp = 0;
                        for (int k = 0; k < 4; k++) {
                            int d = Character.digit(s.charAt(i++), 16);
                            if (d < 0) throw err("bad \\u escape");
                            cp = cp * 16 + d;
                        }
                        b.append((char) cp); // surrogate pairs arrive as two escapes and join naturally
                        break;
                    default:
                        i--;
                        throw err("bad escape '\\" + e + "'");
                }
            }
        }

        Object number() {
            int start = i;
            if (s.charAt(i) == '-') i++;
            if (i >= s.length()) throw err("bad number");
            if (s.charAt(i) == '0') i++;
            else if (s.charAt(i) >= '1' && s.charAt(i) <= '9') while (i < s.length() && Character.isDigit(s.charAt(i))) i++;
            else throw err("bad number");
            boolean integral = true;
            if (i < s.length() && s.charAt(i) == '.') {
                integral = false;
                i++;
                int d = i;
                while (i < s.length() && s.charAt(i) >= '0' && s.charAt(i) <= '9') i++;
                if (i == d) throw err("bad fraction");
            }
            if (i < s.length() && (s.charAt(i) == 'e' || s.charAt(i) == 'E')) {
                integral = false;
                i++;
                if (i < s.length() && (s.charAt(i) == '+' || s.charAt(i) == '-')) i++;
                int d = i;
                while (i < s.length() && s.charAt(i) >= '0' && s.charAt(i) <= '9') i++;
                if (i == d) throw err("bad exponent");
            }
            String t = s.substring(start, i);
            if (integral) {
                try {
                    return Long.parseLong(t);
                } catch (NumberFormatException tooBig) {
                    return new BigInteger(t).doubleValue();
                }
            }
            return Double.parseDouble(t);
        }
    }

    // ------------------------------------------------------------------ write

    /** Compact JSON (no spaces). */
    public static String write(Object value) {
        StringBuilder b = new StringBuilder();
        writeTo(b, value, -1, 0);
        return b.toString();
    }

    /** Indented JSON, the same layout as Python's {@code json.dumps(v, indent=n)}. */
    public static String pretty(Object value, int indent) {
        StringBuilder b = new StringBuilder();
        writeTo(b, value, Math.max(0, indent), 0);
        return b.toString();
    }

    private static void newline(StringBuilder b, int indent, int level) {
        b.append('\n');
        for (int k = 0; k < indent * level; k++) b.append(' ');
    }

    @SuppressWarnings("unchecked")
    private static void writeTo(StringBuilder b, Object v, int indent, int level) {
        if (v == null) { b.append("null"); return; }
        if (v instanceof String) { quote(b, (String) v); return; }
        if (v instanceof Boolean) { b.append(((Boolean) v) ? "true" : "false"); return; }
        if (v instanceof Number) { b.append(number((Number) v)); return; }
        if (v instanceof Map) {
            Map<Object, Object> m = (Map<Object, Object>) v;
            if (m.isEmpty()) { b.append("{}"); return; }
            b.append('{');
            boolean first = true;
            for (Map.Entry<Object, Object> e : m.entrySet()) {
                if (!first) b.append(',');
                first = false;
                if (indent >= 0) newline(b, indent, level + 1);
                quote(b, String.valueOf(e.getKey()));
                b.append(indent >= 0 ? ": " : ":");
                writeTo(b, e.getValue(), indent, level + 1);
            }
            if (indent >= 0) newline(b, indent, level);
            b.append('}');
            return;
        }
        if (v instanceof Iterable) {
            Iterator<Object> it = ((Iterable<Object>) v).iterator();
            if (!it.hasNext()) { b.append("[]"); return; }
            b.append('[');
            boolean first = true;
            while (it.hasNext()) {
                if (!first) b.append(',');
                first = false;
                if (indent >= 0) newline(b, indent, level + 1);
                writeTo(b, it.next(), indent, level + 1);
            }
            if (indent >= 0) newline(b, indent, level);
            b.append(']');
            return;
        }
        if (v instanceof Object[]) { writeTo(b, java.util.Arrays.asList((Object[]) v), indent, level); return; }
        quote(b, v.toString());
    }

    static void quote(StringBuilder b, String s) {
        b.append('"');
        for (int k = 0; k < s.length(); k++) {
            char c = s.charAt(k);
            switch (c) {
                case '"': b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n"); break;
                case '\r': b.append("\\r"); break;
                case '\t': b.append("\\t"); break;
                case '\b': b.append("\\b"); break;
                case '\f': b.append("\\f"); break;
                default:
                    if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
                    else b.append(c);
            }
        }
        b.append('"');
    }

    /** A number as Python's json module writes it. */
    static String number(Number n) {
        if (n instanceof Long || n instanceof Integer || n instanceof Short || n instanceof Byte || n instanceof BigInteger) return n.toString();
        if (n instanceof BigDecimal) return pyFloat(n.doubleValue());
        return pyFloat(n.doubleValue());
    }

    // ------------------------------------------------------------------ number formatting shared with Jcs

    /** Shortest decimal digits that round-trip to d (d finite, non-zero, positive), as {digits, n}: value = 0.digits x 10^n. */
    static Object[] shortestDigits(double d) {
        BigDecimal exact = new BigDecimal(d);
        for (int p = 1; p <= 17; p++) {
            BigDecimal r = exact.round(new MathContext(p, RoundingMode.HALF_EVEN));
            BigDecimal best = null;
            if (Double.parseDouble(r.toString()) == d) best = r;
            else {
                // At a power of two the round-trip interval is lopsided: a neighbour may round-trip when the closest does not.
                BigDecimal ulp = r.ulp();
                for (BigDecimal c : new BigDecimal[] {r.subtract(ulp), r.add(ulp)}) {
                    if (c.signum() > 0 && c.precision() <= p && Double.parseDouble(c.toString()) == d) {
                        if (best == null || c.subtract(exact).abs().compareTo(best.subtract(exact).abs()) < 0) best = c;
                    }
                }
            }
            if (best != null) {
                BigDecimal st = best.stripTrailingZeros();
                String digits = st.unscaledValue().toString();
                int n = digits.length() - st.scale();
                return new Object[] {digits, n};
            }
        }
        // Not reached for finite doubles: 17 significant digits always round-trip.
        BigDecimal st = exact.round(new MathContext(17, RoundingMode.HALF_EVEN)).stripTrailingZeros();
        String digits = st.unscaledValue().toString();
        return new Object[] {digits, digits.length() - st.scale()};
    }

    private static String zeros(int k) {
        return k <= 0 ? "" : "0".repeat(k);
    }

    /** Python repr(float): shortest round-trip, scientific when the exponent is below -4 or at least 16. */
    static String pyFloat(double d) {
        if (Double.isNaN(d)) return "NaN";
        if (Double.isInfinite(d)) return d > 0 ? "Infinity" : "-Infinity";
        if (d == 0) return (1 / d < 0) ? "-0.0" : "0.0";
        String sign = d < 0 ? "-" : "";
        Object[] sd = shortestDigits(Math.abs(d));
        String s = (String) sd[0];
        int n = (Integer) sd[1];
        int k = s.length();
        int x = n - 1;
        if (x >= -4 && x < 16) {
            if (n <= 0) return sign + "0." + zeros(-n) + s;
            if (n >= k) return sign + s + zeros(n - k) + ".0";
            return sign + s.substring(0, n) + "." + s.substring(n);
        }
        String mant = k == 1 ? s : s.charAt(0) + "." + s.substring(1);
        int ax = Math.abs(x);
        return sign + mant + "e" + (x < 0 ? "-" : "+") + (ax < 10 ? "0" + ax : String.valueOf(ax));
    }

    /** ECMAScript Number.prototype.toString for a finite double (RFC 8785 section 3.2.2.3). */
    static String esNumber(double d) {
        if (d == 0) return "0";
        String sign = d < 0 ? "-" : "";
        Object[] sd = shortestDigits(Math.abs(d));
        String s = (String) sd[0];
        int n = (Integer) sd[1];
        int k = s.length();
        if (k <= n && n <= 21) return sign + s + zeros(n - k);
        if (0 < n && n <= 21) return sign + s.substring(0, n) + "." + s.substring(n);
        if (-6 < n && n <= 0) return sign + "0." + zeros(-n) + s;
        int e = n - 1;
        String mant = k == 1 ? s : s.charAt(0) + "." + s.substring(1);
        return sign + mant + "e" + (e < 0 ? "-" : "+") + Math.abs(e);
    }
}
