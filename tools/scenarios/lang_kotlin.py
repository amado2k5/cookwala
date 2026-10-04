"""Kotlin renderer for scenarios: one compilable single-file program (top-level `fun main`) per scenario.

The sample uses sdk/kotlin (ai.cookwala.sdk): scenario arguments are JSON literals parsed at runtime with the
SDK's minimal JSON object (Json.parse / parseList / parseObject), files load from the repository root, `pick`
walks "a.b[0].length" paths and `expect` compares canonical JSON strings. kotlinc writes a runnable jar whose
Main-Class is the file facade (KotlinKt) because the sample is the only file with a `main`.
"""
import json

EXT = '.kt'
LABEL = 'Kotlin'
RUN = ('kotlinc sdk/kotlin/src/ai/cookwala/sdk/*.kt scenarios/out/{id}-{slug}/kotlin.kt -include-runtime -d build/kotlin-{id}.jar && '
       'java -jar build/kotlin-{id}.jar   # Kotlin 1.9+ on JVM 11+; needs a hub on :7878')

# Kotlin parameter names and types per operation, in canonical order (render.SIGNATURES). Every optional
# parameter has a default in the SDK, so the renderer passes arguments by name whenever a middle one is skipped.
PARAMS = {
    'hash': [('doc', 'any')], 'verify': [('doc', 'any'), ('keys', 'list')],
    'dryRun': [('recipe', 'any'), ('recipeId', 'string'), ('device', 'any'), ('deviceId', 'string'), ('humanPresent', 'bool'), ('allowModel', 'bool')],
    'checkEnvelope': [('op', 'string'), ('trace', 'list'), ('target', 'map'), ('altitudeM', 'double')],
    'parseSms': [('text', 'string')], 'deriveConstraints': [('facets', 'list'), ('role', 'string'), ('consents', 'list')],
    'convert': [('value', 'double'), ('unit', 'string'), ('to', 'string'), ('densityGPerMl', 'double')],
    'ladder': [('op', 'string'), ('sensors', 'list'), ('allowModel', 'bool'), ('humanPresent', 'bool')],
    'validate': [('kind', 'string'), ('doc', 'any')], 'humanitarianCheck': [('docs', 'list'), ('packs', 'list')],
    'listRecipes': [], 'getRecipe': [('id', 'string')], 'getDevices': [], 'getOps': [], 'getRegistry': [],
    'capabilities': [], 'safetyLimits': [], 'recalls': [], 'conformance': [],
    'startExecution': [('request', 'map'), ('idempotencyKey', 'string'), ('humanPresent', 'bool')],
    'getExecution': [('id', 'string')], 'stopExecution': [('id', 'string'), ('reason', 'string')],
    'resumeExecution': [('id', 'string'), ('seq', 'any')], 'executionLog': [('id', 'string')], 'reportIncident': [('doc', 'map')],
}
TRY_OPS = ('startExecution', 'stopExecution', 'resumeExecution')


class Lit(str):
    """An expression string that remembers the JSON value it came from, so `call` can type it."""
    value = None


def kstr(text):
    """A Kotlin string literal: `$` is escaped so JSON text is never read as a template."""
    out = ['"']
    for ch in text:
        if ch == '"': out.append('\\"')
        elif ch == '\\': out.append('\\\\')
        elif ch == '$': out.append('\\$')
        elif ch == '\n': out.append('\\n')
        elif ch == '\r': out.append('\\r')
        elif ch == '\t': out.append('\\t')
        elif ord(ch) < 0x20: out.append('\\u%04x' % ord(ch))
        else: out.append(ch)
    out.append('"')
    return ''.join(out)


def knum(value):
    return repr(float(value))


class Renderer:
    def header(self, s):
        return (f'// Scenario {s["id"]}: {s["title"]["en"]}\n// {s["goal"]["en"]}\n'
                '// Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                f'// Build and run: kotlinc sdk/kotlin/src/ai/cookwala/sdk/*.kt scenarios/out/{s["id"]}-{s["slug"]}/kotlin.kt '
                f'-include-runtime -d build/kotlin-{s["id"]}.jar && java -jar build/kotlin-{s["id"]}.jar\n'
                'import ai.cookwala.sdk.CookwalaClient\nimport ai.cookwala.sdk.CookwalaProblem\nimport ai.cookwala.sdk.Json\n'
                'import java.nio.file.Files\nimport java.nio.file.Path\n\n'
                '/** Reads a JSON file by its repository-relative path, walking up from the working directory to the repository root. */\n'
                'fun load(path: String): Any? {\n'
                '    var dir = Path.of("").toAbsolutePath()\n'
                '    while (!Files.exists(dir.resolve(path)) && dir.parent != null) dir = dir.parent\n'
                '    return Json.parse(Files.readString(dir.resolve(path)))\n}\n\n'
                '/** Walks "a.b[0].length" into a parsed document. */\n'
                'fun pick(obj: Any?, path: String): Any? {\n'
                '    var o = obj\n'
                '    for (part in path.replace("]", "").replace("[", ".").split(".")) {\n'
                '        if (part.isEmpty()) continue\n'
                '        o = when {\n'
                '            part == "length" -> when (o) { is List<*> -> o.size; is Map<*, *> -> o.size; else -> (o as String).length }\n'
                '            part.all { it in \'0\'..\'9\' } -> (o as List<*>)[part.toInt()]\n'
                '            else -> (o as Map<*, *>?)?.get(part)\n'
                '        }\n    }\n    return o\n}\n\n'
                '/** Compares canonical JSON (sorted keys, 36.0 == 36) and prints "ok <label> = <value>". */\n'
                'fun expect(got: Any?, want: Any?, label: String) {\n'
                '    val g = Json.canonical(got)\n    val w = Json.canonical(want)\n'
                '    if (g != w) throw AssertionError("$label: got $g, want $w")\n'
                '    println("ok $label = $w")\n}\n\n'
                'fun main() {\n'
                '    val c = CookwalaClient(System.getenv("COOKWALA_HUB")?.takeIf { it.isNotEmpty() } ?: "http://localhost:7878")')

    def comment(self, text): return f'\n    // {text}'

    def lit(self, value):
        e = Lit(f'Json.parse({kstr(json.dumps(value, ensure_ascii=False))})')
        e.value = value
        return e

    def file(self, path): return f'load({kstr(path)})'
    def sub(self, expr, path): return f'pick({expr}, {kstr(path)})'
    def var(self, name, path=None): return f'pick({name}, {kstr(path)})' if path else name

    def typed(self, expr, kind):
        """Coerce an argument expression to the Kotlin parameter type."""
        if isinstance(expr, Lit):
            v = expr.value
            if kind == 'string' and isinstance(v, str): return kstr(v)
            if kind == 'bool' and isinstance(v, bool): return 'true' if v else 'false'
            if kind == 'double' and isinstance(v, (int, float)) and not isinstance(v, bool): return knum(v)
            if kind == 'list' and isinstance(v, list): return f'Json.parseList({kstr(json.dumps(v, ensure_ascii=False))})'
            if kind == 'map' and isinstance(v, dict): return f'Json.parseObject({kstr(json.dumps(v, ensure_ascii=False))})'
            if kind == 'any': return str(expr)
            if v is None: return 'null'
        if kind == 'string': return f'{expr} as String'
        if kind == 'bool': return f'{expr} as Boolean'
        if kind == 'double': return f'({expr} as Number).toDouble()'
        if kind == 'list': return f'{expr} as List<Any?>'
        if kind == 'map': return f'{expr} as Map<String, Any?>'
        return str(expr)

    def call(self, op, args, save):
        given = dict(args)
        params = PARAMS[op]
        kinds = dict(params)
        names = [n for n, _ in params]
        positional = [n for n, _ in args] == names[:len(args)] and op != 'dryRun'
        if positional:
            rendered = [self.typed(e, kinds[n]) for n, e in args]
        else:
            rendered = [f'{n} = {self.typed(given[n], kinds[n])}' for n in names if n in given]
        expr = f'c.{op}({", ".join(rendered)})'
        if op in TRY_OPS:
            target = save or 'result'
            return (f'    val {target}: Any? = try {{ {expr} }} catch (p: CookwalaProblem) {{\n'
                    f'        println("refused: ${{Json.stringify(p.refusal)}}") // a refusal is a result, not a crash\n'
                    f'        p.body\n    }}')
        return f'    val {save} = {expr}' if save else f'    {expr}'

    def expect(self, var, path, value):
        got = f'pick({var}, {kstr(path)})' if path else var
        return f'    expect({got}, {self.lit(value)}, {kstr(path or var)})'

    def wait(self, seconds): return f'    Thread.sleep({int(seconds * 1000)})'
    def footer(self): return '\n    println("scenario complete")\n}'
