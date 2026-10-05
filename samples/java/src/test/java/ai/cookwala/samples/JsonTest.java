package ai.cookwala.samples;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class JsonTest {
    @Test
    void parsesTypes() {
        Map<String, Object> m = Json.parseObject("{\"b\":1,\"a\":[1.5,true,null,\"x\\u00e9\\ud83d\\ude00\\n\"],\"c\":-0,\"d\":1e2,\"e\":99999999999999999999}");
        assertEquals(List.of("b", "a", "c", "d", "e"), List.copyOf(m.keySet())); // insertion order
        assertEquals(1L, m.get("b"));
        assertEquals(Py.list(1.5, true, null, "x\u00e9\ud83d\ude00\n"), m.get("a"));
        assertInstanceOf(Long.class, m.get("c"));
        assertEquals(100.0, m.get("d"));
        assertInstanceOf(Double.class, m.get("e"));
    }

    @Test
    void rejectsBadInput() {
        for (String bad : new String[] {"{nope", "", "[1,]", "{\"a\":1,}", "01", "1.", "\"\u0001\"", "[1] x", "tru", "{\"a\" 1}", "\"\\x\""}) {
            assertThrows(IllegalArgumentException.class, () -> Json.parse(bad), bad);
        }
    }

    @Test
    void writesLikePython() {
        assertEquals("{\"a\":[1,1.0,0.5,1e-07,1e+16,1234567890123456.0,null,true],\"b\":{},\"c\":[],\"s\":\"\u00e9\\n\\u0001\"}",
                Json.write(Py.map("a", Py.list(1L, 1.0, 0.5, 1e-7, 1e16, 1234567890123456.0, null, true), "b", Py.map(), "c", Py.list(), "s", "\u00e9\n\u0001")));
        assertEquals("{\n \"a\": [\n  1,\n  {}\n ],\n \"b\": \"x\"\n}", Json.pretty(Py.map("a", Py.list(1L, Py.map()), "b", "x"), 1));
        Object round = Json.parse(Json.write(Bundle.load()));
        assertEquals(Bundle.load(), round);
    }

    @Test
    void pythonFormatting() {
        assertEquals("260", Py.fmtG(260L));
        assertEquals("1.23457e+06", Py.fmtG(1234567L));
        assertEquals("0.0001", Py.fmtG(0.0001));
        assertEquals("1e-05", Py.fmtG(0.00001));
        assertEquals("212.5", Py.fmtG(212.5));
        assertEquals("['eggs', 'milk']", Py.pyRepr(List.of("eggs", "milk")));
        assertEquals("\"it's\"", Py.pyRepr("it's"));
    }
}
