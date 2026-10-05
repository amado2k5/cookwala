package ai.cookwala.sdk

// Tests for the minimal JSON object. No test framework: plain assertions in a `main`, runnable with kotlinc + java:
//     kotlinc sdk/kotlin/src/ai/cookwala/sdk/*.kt sdk/kotlin/test/ai/cookwala/sdk/JsonTest.kt -include-runtime -d build/kotlin-test.jar
//     java -jar build/kotlin-test.jar
// or `gradle -p sdk/kotlin jsonTest`. (A line comment, because Kotlin block comments nest and "/*" would open one.)
private var passed = 0

private fun check(ok: Boolean, what: String) {
    if (!ok) throw AssertionError("FAILED: $what")
    passed++
}

private fun roundTrip(text: String) = check(Json.stringify(Json.parse(text)) == text, "round trip $text")

private fun rejects(text: String) {
    try { Json.parse(text) } catch (e: IllegalArgumentException) { passed++; return }
    throw AssertionError("FAILED: should reject $text")
}

fun main() {
    // scalars
    check(Json.parse("null") == null, "null")
    check(Json.parse("true") == true, "true")
    check(Json.parse("false") == false, "false")
    check(Json.parse("42") == 42L, "integer is Long")
    check(Json.parse("-7") == -7L, "negative integer")
    check(Json.parse("4.6") == 4.6, "fraction is Double")
    check(Json.parse("36.0") == 36.0, "36.0 is Double")
    check(Json.parse("1e3") == 1000.0, "exponent is Double")
    check(Json.parse("-2.5E-1") == -0.25, "negative exponent")
    check(Json.parse("123456789012345678901234567890") is Double, "huge integer falls back to Double")
    check(Json.parse("\"koshari\"") == "koshari", "string")
    check(Json.parse("\"a\\\"b\\\\c\\/d\\n\\t\\u00e9\"") == "a\"b\\c/d\n\t\u00e9", "escapes")
    check(Json.parse("\"HAND A7K \u0663\u0660 T4.6\"") == "HAND A7K \u0663\u0660 T4.6", "non-ASCII passes through")
    check(Json.parse("  [ ]  ") == emptyList<Any?>(), "empty array with whitespace")
    check(Json.parse("{}") == emptyMap<String, Any?>(), "empty object")

    // structures and key order
    val doc = Json.parse("{\"b\": [1, 2.5, \"x\", null, true], \"a\": {\"nested\": false}}")
    check(doc is Map<*, *>, "object is Map")
    val m = doc as Map<*, *>
    check(m.keys.toList() == listOf("b", "a"), "insertion order kept")
    check((m["b"] as List<*>)[1] == 2.5, "array element")
    check((m["a"] as Map<*, *>)["nested"] == false, "nested object")
    check(Json.stringify(doc) == "{\"b\":[1,2.5,\"x\",null,true],\"a\":{\"nested\":false}}", "stringify compact, ordered")
    check(Json.canonical(doc) == "{\"a\":{\"nested\":false},\"b\":[1,2.5,\"x\",null,true]}", "canonical sorts keys")

    // numbers in canonical form
    check(Json.canonical(36.0) == "36", "integral double prints as integer")
    check(Json.canonical(36L) == "36", "long prints as integer")
    check(Json.canonical(Json.parse("36.0")) == Json.canonical(Json.parse("36")), "36.0 == 36 in canonical form")
    check(Json.canonical(4.6) == "4.6", "fraction kept")
    check(Json.canonical(9) == "9", "Int accepted")
    check(Json.stringify(0.1 + 0.2) == "0.30000000000000004", "double printed as shortest repr")

    // round trips
    roundTrip("{\"text\":\"OFFER 36KG YOGURT C 4C UB0511\"}")
    roundTrip("[\"\\\"quoted\\\"\",\"back\\\\slash\",\"new\\nline\",\"\\u0001\"]")
    roundTrip("{\"deep\":{\"deeper\":[[[]]],\"n\":-0.5}}")
    roundTrip("\"\"")

    // typed helpers
    check(Json.parseList("[1,2]").size == 2, "parseList")
    check(Json.parseObject("{\"k\":1}")["k"] == 1L, "parseObject")
    try { Json.parseList("{}"); throw AssertionError("parseList should reject an object") } catch (e: IllegalArgumentException) { passed++ }

    // string escaping on output
    check(Json.stringify("a\"b\\c\n") == "\"a\\\"b\\\\c\\n\"", "escaped output")
    check(Json.stringify(listOf("\u00e9", "\u0663")) == "[\"\u00e9\",\"\u0663\"]", "non-ASCII not escaped")

    // malformed input
    rejects("")
    rejects("{")
    rejects("[1,]")
    rejects("{\"a\" 1}")
    rejects("{a: 1}")
    rejects("\"unterminated")
    rejects("tru")
    rejects("01x")
    rejects("1.")
    rejects("-")
    rejects("[1] 2")
    rejects("\"bad \\q escape\"")
    rejects("\"control \u0001 char\"")
    rejects("\u0663")  // an Arabic-Indic digit is not a JSON digit

    println("JsonTest: $passed checks passed")
}
