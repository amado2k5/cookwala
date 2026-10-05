package ai.cookwala.sdk;

import java.util.List;
import java.util.Map;

/**
 * Tests for the minimal JSON class. No test framework: plain assertions, runnable with javac + java.
 *
 * <pre>
 * javac -d build/java-test sdk/java/src/ai/cookwala/sdk/*.java sdk/java/test/ai/cookwala/sdk/JsonTest.java
 * java -cp build/java-test ai.cookwala.sdk.JsonTest
 * </pre>
 */
public final class JsonTest {
    private static int passed = 0;

    private static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError("FAILED: " + what);
        passed++;
    }

    private static void roundTrip(String text) {
        check(Json.stringify(Json.parse(text)).equals(text), "round trip " + text);
    }

    private static void rejects(String text) {
        try { Json.parse(text); }
        catch (IllegalArgumentException e) { passed++; return; }
        throw new AssertionError("FAILED: should reject " + text);
    }

    public static void main(String[] args) {
        // scalars
        check(Json.parse("null") == null, "null");
        check(Json.parse("true").equals(Boolean.TRUE), "true");
        check(Json.parse("false").equals(Boolean.FALSE), "false");
        check(Json.parse("42").equals(42L), "integer is Long");
        check(Json.parse("-7").equals(-7L), "negative integer");
        check(Json.parse("4.6").equals(4.6), "fraction is Double");
        check(Json.parse("36.0").equals(36.0), "36.0 is Double");
        check(Json.parse("1e3").equals(1000.0), "exponent is Double");
        check(Json.parse("-2.5E-1").equals(-0.25), "negative exponent");
        check(Json.parse("123456789012345678901234567890") instanceof Double, "huge integer falls back to Double");
        check(Json.parse("\"koshari\"").equals("koshari"), "string");
        check(Json.parse("\"a\\\"b\\\\c\\/d\\n\\t\\u00e9\"").equals("a\"b\\c/d\n\t\u00e9"), "escapes");
        check(Json.parse("\"HAND A7K \u0663\u0660 T4.6\"").equals("HAND A7K \u0663\u0660 T4.6"), "non-ASCII passes through");
        check(Json.parse("  [ ]  ").equals(List.of()), "empty array with whitespace");
        check(Json.parse("{}").equals(Map.of()), "empty object");

        // structures and key order
        Object doc = Json.parse("{\"b\": [1, 2.5, \"x\", null, true], \"a\": {\"nested\": false}}");
        check(doc instanceof Map, "object is Map");
        Map<?, ?> m = (Map<?, ?>) doc;
        check(List.copyOf(m.keySet()).equals(List.of("b", "a")), "insertion order kept");
        check(((List<?>) m.get("b")).get(1).equals(2.5), "array element");
        check(((Map<?, ?>) m.get("a")).get("nested").equals(Boolean.FALSE), "nested object");
        check(Json.stringify(doc).equals("{\"b\":[1,2.5,\"x\",null,true],\"a\":{\"nested\":false}}"), "stringify compact, ordered");
        check(Json.canonical(doc).equals("{\"a\":{\"nested\":false},\"b\":[1,2.5,\"x\",null,true]}"), "canonical sorts keys");

        // numbers in canonical form
        check(Json.canonical(36.0).equals("36"), "integral double prints as integer");
        check(Json.canonical(36L).equals("36"), "long prints as integer");
        check(Json.canonical(Json.parse("36.0")).equals(Json.canonical(Json.parse("36"))), "36.0 == 36 in canonical form");
        check(Json.canonical(4.6).equals("4.6"), "fraction kept");
        check(Json.canonical(Integer.valueOf(9)).equals("9"), "Integer accepted");
        check(Json.stringify(0.1 + 0.2).equals("0.30000000000000004"), "double printed as Java shortest repr");

        // round trips
        roundTrip("{\"text\":\"OFFER 36KG YOGURT C 4C UB0511\"}");
        roundTrip("[\"\\\"quoted\\\"\",\"back\\\\slash\",\"new\\nline\",\"\\u0001\"]");
        roundTrip("{\"deep\":{\"deeper\":[[[]]],\"n\":-0.5}}");
        roundTrip("\"\"");

        // typed helpers
        check(Json.parseList("[1,2]").size() == 2, "parseList");
        check(Json.parseObject("{\"k\":1}").get("k").equals(1L), "parseObject");
        try { Json.parseList("{}"); throw new AssertionError("parseList should reject an object"); } catch (IllegalArgumentException e) { passed++; }

        // string escaping on output
        check(Json.stringify("a\"b\\c\n").equals("\"a\\\"b\\\\c\\n\""), "escaped output");
        check(Json.stringify(List.of("\u00e9", "\u0663")).equals("[\"\u00e9\",\"\u0663\"]"), "non-ASCII not escaped");

        // malformed input
        rejects("");
        rejects("{");
        rejects("[1,]");
        rejects("{\"a\" 1}");
        rejects("{a: 1}");
        rejects("\"unterminated");
        rejects("tru");
        rejects("01x");
        rejects("1.");
        rejects("-");
        rejects("[1] 2");
        rejects("\"bad \\q escape\"");
        rejects("\"control \u0001 char\"");
        rejects("\u0663"); // an Arabic-Indic digit is not a JSON digit

        System.out.println("JsonTest: " + passed + " checks passed");
    }
}
