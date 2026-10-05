package ai.cookwala.samples;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Small helpers for working with parsed JSON the way the Python reference does: lookups with defaults,
 * truthiness, number comparison, and Python's text formatting ({@code str}, {@code repr}, {@code :g}) so refusal
 * details read the same in every port.
 */
final class Py {
    private Py() {}

    private static final SecureRandom RANDOM = new SecureRandom();
    static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneOffset.UTC);

    // ---- building
    static Map<String, Object> map(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }

    static List<Object> list(Object... items) {
        List<Object> l = new ArrayList<>();
        Collections.addAll(l, items);
        return l;
    }

    // ---- reading
    @SuppressWarnings("unchecked")
    static Map<String, Object> asMap(Object o) {
        return o instanceof Map ? (Map<String, Object>) o : null;
    }

    @SuppressWarnings("unchecked")
    static List<Object> asList(Object o) {
        return o instanceof List ? (List<Object>) o : null;
    }

    /** m.get(k) as a map; an empty map when m is null or the value is absent or not a map. */
    static Map<String, Object> obj(Map<String, Object> m, String k) {
        Map<String, Object> v = m == null ? null : asMap(m.get(k));
        return v == null ? Collections.emptyMap() : v;
    }

    /** m.get(k) as a list; an empty list when absent or not a list. */
    static List<Object> arr(Map<String, Object> m, String k) {
        List<Object> v = m == null ? null : asList(m.get(k));
        return v == null ? Collections.emptyList() : v;
    }

    static String str(Map<String, Object> m, String k) {
        Object v = m == null ? null : m.get(k);
        return v == null ? null : v instanceof String ? (String) v : pyStr(v);
    }

    static String str(Map<String, Object> m, String k, String dflt) {
        String s = str(m, k);
        return s == null ? dflt : s;
    }

    static boolean truthy(Object o) {
        if (o == null) return false;
        if (o instanceof Boolean) return (Boolean) o;
        if (o instanceof Number) return ((Number) o).doubleValue() != 0;
        if (o instanceof String) return !((String) o).isEmpty();
        if (o instanceof Collection) return !((Collection<?>) o).isEmpty();
        if (o instanceof Map) return !((Map<?, ?>) o).isEmpty();
        return true;
    }

    static boolean isNumber(Object o) {
        return o instanceof Number && !(o instanceof Boolean);
    }

    static boolean finite(Object o) {
        return isNumber(o) && Double.isFinite(((Number) o).doubleValue());
    }

    static double num(Object o) {
        if (o instanceof Number) return ((Number) o).doubleValue();
        throw new ClassCastException("not a number: " + pyRepr(o));
    }

    /** Python equality: numbers compare by value (1 == 1.0). */
    static boolean eq(Object a, Object b) {
        if (isNumber(a) && isNumber(b)) return ((Number) a).doubleValue() == ((Number) b).doubleValue();
        return Objects.equals(a, b);
    }

    static boolean contains(Collection<?> c, Object x) {
        for (Object o : c) if (eq(o, x)) return true;
        return false;
    }

    // ---- time
    static Instant time(String s) {
        try {
            return Instant.parse(s);
        } catch (RuntimeException e1) {
            try {
                return OffsetDateTime.parse(s).toInstant();
            } catch (RuntimeException e2) {
                try {
                    return LocalDateTime.parse(s).toInstant(ZoneOffset.UTC);
                } catch (RuntimeException e3) {
                    return LocalDate.parse(s).atStartOfDay().toInstant(ZoneOffset.UTC);
                }
            }
        }
    }

    static String iso(Instant t) {
        return ISO.format(t);
    }

    // ---- randomness
    static String tokenHex(int bytes) {
        byte[] b = new byte[bytes];
        RANDOM.nextBytes(b);
        StringBuilder s = new StringBuilder();
        for (byte x : b) s.append(String.format("%02x", x & 0xff));
        return s.toString();
    }

    // ---- Python text formatting
    /** Python str(x). */
    static String pyStr(Object o) {
        if (o == null) return "None";
        if (o instanceof String) return (String) o;
        if (o instanceof Boolean) return ((Boolean) o) ? "True" : "False";
        if (o instanceof Double || o instanceof Float || o instanceof BigDecimal) {
            double d = ((Number) o).doubleValue();
            if (Double.isNaN(d)) return "nan";
            if (Double.isInfinite(d)) return d > 0 ? "inf" : "-inf";
            return Json.pyFloat(d);
        }
        if (o instanceof Number) return o.toString();
        return pyRepr(o);
    }

    /** Python repr(x) for JSON values. */
    @SuppressWarnings("unchecked")
    static String pyRepr(Object o) {
        if (o instanceof String) {
            String s = (String) o;
            char q = (s.indexOf('\'') >= 0 && s.indexOf('"') < 0) ? '"' : '\'';
            StringBuilder b = new StringBuilder().append(q);
            for (char c : s.toCharArray()) {
                if (c == '\\') b.append("\\\\");
                else if (c == q) b.append('\\').append(c);
                else if (c == '\n') b.append("\\n");
                else if (c == '\r') b.append("\\r");
                else if (c == '\t') b.append("\\t");
                else if (c < 0x20 || c == 0x7f) b.append(String.format("\\x%02x", (int) c));
                else b.append(c);
            }
            return b.append(q).toString();
        }
        if (o instanceof Collection) {
            StringBuilder b = new StringBuilder("[");
            boolean first = true;
            for (Object x : (Collection<Object>) o) {
                if (!first) b.append(", ");
                first = false;
                b.append(pyRepr(x));
            }
            return b.append(']').toString();
        }
        if (o instanceof Map) {
            StringBuilder b = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<Object, Object> e : ((Map<Object, Object>) o).entrySet()) {
                if (!first) b.append(", ");
                first = false;
                b.append(pyRepr(e.getKey())).append(": ").append(pyRepr(e.getValue()));
            }
            return b.append('}').toString();
        }
        return pyStr(o);
    }

    /** Python format(x, 'g'): six significant digits, trailing zeros removed. */
    static String fmtG(Object o) {
        double d = num(o);
        if (Double.isNaN(d)) return "nan";
        if (Double.isInfinite(d)) return d > 0 ? "inf" : "-inf";
        if (d == 0) return (1 / d < 0) ? "-0" : "0";
        BigDecimal r = new BigDecimal(d).round(new MathContext(6, RoundingMode.HALF_EVEN));
        int exp = r.precision() - r.scale() - 1;
        String sign = d < 0 ? "-" : "";
        BigDecimal a = r.abs();
        if (exp >= -4 && exp < 6) {
            String s = a.setScale(Math.max(0, 5 - exp), RoundingMode.HALF_EVEN).toPlainString();
            if (s.contains(".")) s = s.replaceAll("0+$", "").replaceAll("\\.$", "");
            return sign + s;
        }
        String digits = a.unscaledValue().toString();
        digits = (digits + "000000").substring(0, 6).replaceAll("0+$", "");
        String mant = digits.length() <= 1 ? (digits.isEmpty() ? "0" : digits) : digits.charAt(0) + "." + digits.substring(1);
        int ax = Math.abs(exp);
        return sign + mant + "e" + (exp < 0 ? "-" : "+") + (ax < 10 ? "0" + ax : String.valueOf(ax));
    }
}
