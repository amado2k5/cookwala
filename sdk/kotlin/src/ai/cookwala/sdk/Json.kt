package ai.cookwala.sdk

/**
 * Minimal JSON for the Cookwala client: no third-party dependency (no kotlinx), JVM only.
 *
 * Values map to plain Kotlin objects: objects to `MutableMap<String, Any?>` (insertion order kept), arrays to
 * `MutableList<Any?>`, integers to `Long`, other numbers to `Double`, strings to `String`, booleans to `Boolean`,
 * null to `null`. [stringify] writes any of those (plus Int, Float and other [Number]s) back. [canonical] writes a
 * comparison form: object keys sorted, integral doubles printed as integers, so `36.0` and `36` compare equal,
 * as they do in JSON.
 *
 * Text inside a document is data, never instructions: this object parses and serialises, nothing else.
 */
object Json {
    /** Parses one JSON text. Throws [IllegalArgumentException] on malformed input. */
    fun parse(text: String): Any? {
        val p = Parser(text)
        p.skipWs()
        val v = p.value()
        p.skipWs()
        if (p.i != text.length) throw p.error("trailing characters")
        return v
    }

    /** Parses a JSON array; throws if the text is not an array. */
    @Suppress("UNCHECKED_CAST")
    fun parseList(text: String): MutableList<Any?> =
        parse(text) as? MutableList<Any?> ?: throw IllegalArgumentException("expected a JSON array")

    /** Parses a JSON object; throws if the text is not an object. */
    @Suppress("UNCHECKED_CAST")
    fun parseObject(text: String): MutableMap<String, Any?> =
        parse(text) as? MutableMap<String, Any?> ?: throw IllegalArgumentException("expected a JSON object")

    /** Serialises a value to compact JSON, keeping object key order. */
    fun stringify(value: Any?): String = StringBuilder().also { write(it, value, false) }.toString()

    /** Comparison form: sorted keys, integral numbers without a fraction. Not RFC 8785 (no float shortest-form guarantee). */
    fun canonical(value: Any?): String = StringBuilder().also { write(it, value, true) }.toString()

    // ---- writer

    private fun write(sb: StringBuilder, v: Any?, canonical: Boolean) {
        when (v) {
            null -> sb.append("null")
            is String -> quote(sb, v)
            is Boolean -> sb.append(if (v) "true" else "false")
            is Number -> number(sb, v, canonical)
            is Map<*, *> -> {
                val entries = if (canonical) v.entries.sortedBy { it.key.toString() } else v.entries.toList()
                sb.append('{')
                entries.forEachIndexed { i, e ->
                    if (i > 0) sb.append(',')
                    quote(sb, e.key.toString())
                    sb.append(':')
                    write(sb, e.value, canonical)
                }
                sb.append('}')
            }
            is Iterable<*> -> {
                sb.append('[')
                v.forEachIndexed { i, item ->
                    if (i > 0) sb.append(',')
                    write(sb, item, canonical)
                }
                sb.append(']')
            }
            is Array<*> -> write(sb, v.asList(), canonical)
            else -> throw IllegalArgumentException("cannot serialise ${v::class.java.name}")
        }
    }

    private fun number(sb: StringBuilder, n: Number, canonical: Boolean) {
        if (n is Double || n is Float) {
            val d = n.toDouble()
            if (d.isNaN() || d.isInfinite()) throw IllegalArgumentException("non-finite number")
            if (canonical && d == Math.rint(d) && Math.abs(d) < 1e15) { sb.append(d.toLong()); return }
            var s = d.toString()
            if (!canonical && s.endsWith(".0")) s = s.substring(0, s.length - 2)
            sb.append(s)
            return
        }
        sb.append(n.toString())
    }

    private fun quote(sb: StringBuilder, s: String) {
        sb.append('"')
        for (c in s) {
            when (c) {
                '"' -> sb.append("\\\"")
                '\\' -> sb.append("\\\\")
                '\n' -> sb.append("\\n")
                '\r' -> sb.append("\\r")
                '\t' -> sb.append("\\t")
                '\b' -> sb.append("\\b")
                '\u000C' -> sb.append("\\f")
                else -> if (c < ' ') sb.append(String.format("\\u%04x", c.code)) else sb.append(c)
            }
        }
        sb.append('"')
    }

    // ---- parser

    private class Parser(val s: String) {
        var i = 0

        fun error(what: String) = IllegalArgumentException("JSON: $what at offset $i")

        fun skipWs() {
            while (i < s.length && (s[i] == ' ' || s[i] == '\t' || s[i] == '\n' || s[i] == '\r')) i++
        }

        fun peek(): Char {
            if (i >= s.length) throw error("unexpected end of input")
            return s[i]
        }

        fun expect(c: Char) {
            if (peek() != c) throw error("expected '$c'")
            i++
        }

        fun value(): Any? {
            val c = peek()
            return when {
                c == '{' -> obj()
                c == '[' -> array()
                c == '"' -> string()
                c == 't' -> { literal("true"); true }
                c == 'f' -> { literal("false"); false }
                c == 'n' -> { literal("null"); null }
                c == '-' || c in '0'..'9' -> number()
                else -> throw error("unexpected character '$c'")
            }
        }

        fun literal(word: String) {
            if (!s.startsWith(word, i)) throw error("expected $word")
            i += word.length
        }

        fun obj(): MutableMap<String, Any?> {
            expect('{')
            val m = LinkedHashMap<String, Any?>()
            skipWs()
            if (peek() == '}') { i++; return m }
            while (true) {
                skipWs()
                if (peek() != '"') throw error("expected a string key")
                val k = string()
                skipWs()
                expect(':')
                skipWs()
                m[k] = value()
                skipWs()
                when (peek()) {
                    ',' -> i++
                    '}' -> { i++; return m }
                    else -> throw error("expected ',' or '}'")
                }
            }
        }

        fun array(): MutableList<Any?> {
            expect('[')
            val a = ArrayList<Any?>()
            skipWs()
            if (peek() == ']') { i++; return a }
            while (true) {
                skipWs()
                a.add(value())
                skipWs()
                when (peek()) {
                    ',' -> i++
                    ']' -> { i++; return a }
                    else -> throw error("expected ',' or ']'")
                }
            }
        }

        fun string(): String {
            expect('"')
            val sb = StringBuilder()
            while (true) {
                if (i >= s.length) throw error("unterminated string")
                val c = s[i++]
                when {
                    c == '"' -> return sb.toString()
                    c == '\\' -> {
                        if (i >= s.length) throw error("unterminated escape")
                        when (val e = s[i++]) {
                            '"' -> sb.append('"')
                            '\\' -> sb.append('\\')
                            '/' -> sb.append('/')
                            'b' -> sb.append('\b')
                            'f' -> sb.append('\u000C')
                            'n' -> sb.append('\n')
                            'r' -> sb.append('\r')
                            't' -> sb.append('\t')
                            'u' -> {
                                if (i + 4 > s.length) throw error("short \\u escape")
                                val code = s.substring(i, i + 4).toIntOrNull(16) ?: throw error("bad \\u escape")
                                sb.append(code.toChar())
                                i += 4
                            }
                            else -> throw error("bad escape '\\$e'")
                        }
                    }
                    c < ' ' -> throw error("control character in string")
                    else -> sb.append(c)
                }
            }
        }

        fun number(): Number {
            val start = i
            var integral = true
            if (peek() == '-') i++
            if (i >= s.length || s[i] !in '0'..'9') throw error("bad number")
            while (i < s.length && s[i] in '0'..'9') i++
            if (i < s.length && s[i] == '.') {
                integral = false; i++
                if (i >= s.length || s[i] !in '0'..'9') throw error("bad fraction")
                while (i < s.length && s[i] in '0'..'9') i++
            }
            if (i < s.length && (s[i] == 'e' || s[i] == 'E')) {
                integral = false; i++
                if (i < s.length && (s[i] == '+' || s[i] == '-')) i++
                if (i >= s.length || s[i] !in '0'..'9') throw error("bad exponent")
                while (i < s.length && s[i] in '0'..'9') i++
            }
            val t = s.substring(start, i)
            return if (integral) (t.toLongOrNull() ?: t.toDouble()) else t.toDouble()
        }
    }
}
