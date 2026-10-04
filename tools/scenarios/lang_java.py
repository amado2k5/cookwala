"""Java renderer for scenarios: one compilable single-file program (public class Scenario) per scenario.

The sample uses sdk/java (ai.cookwala.sdk): scenario arguments are JSON literals parsed at runtime with the
SDK's minimal JSON class (Json.parse / parseList / parseObject), files load from the repository root, `pick`
walks "a.b[0].length" paths and `expect` compares canonical JSON strings. The RUN line compiles the client once
and then launches the sample in Java 11 source-file mode, which does not require the file name to match the
class name, so `java.java` may hold `public class Scenario`.
"""
import json

EXT = '.java'
LABEL = 'Java'
RUN = ('javac -cp sdk/java/src -d build/java sdk/java/src/ai/cookwala/sdk/*.java && '
       'java -cp build/java scenarios/out/{id}-{slug}/java.java   # Java 11+ (source-file mode); needs a hub on :7878')

# Java parameter types per operation, in canonical order (render.SIGNATURES), and the default used when a
# scenario leaves a middle argument out. Arities lists the overloads sdk/java offers.
PARAMS = {
    'hash': [('doc', 'any', None)],
    'verify': [('doc', 'any', None), ('keys', 'list', 'List.of()')],
    'checkEnvelope': [('op', 'string', None), ('trace', 'list', None), ('target', 'map', 'null'), ('altitudeM', 'double', '0')],
    'parseSms': [('text', 'string', None)],
    'deriveConstraints': [('facets', 'list', None), ('role', 'string', None), ('consents', 'list', 'null')],
    'convert': [('value', 'double', None), ('unit', 'string', None), ('to', 'string', None), ('densityGPerMl', 'Double', 'null')],
    'ladder': [('op', 'string', None), ('sensors', 'list', None), ('allowModel', 'bool', 'true'), ('humanPresent', 'bool', 'false')],
    'validate': [('kind', 'string', None), ('doc', 'any', None)],
    'humanitarianCheck': [('docs', 'list', None), ('packs', 'list', 'null')],
    'listRecipes': [], 'getRecipe': [('id', 'string', None)], 'getDevices': [], 'getOps': [], 'getRegistry': [],
    'capabilities': [], 'safetyLimits': [], 'recalls': [], 'conformance': [],
    'startExecution': [('request', 'map', None), ('idempotencyKey', 'string', 'null'), ('humanPresent', 'Boolean', 'null')],
    'getExecution': [('id', 'string', None)],
    'stopExecution': [('id', 'string', None), ('reason', 'string', '"requested"')],
    'resumeExecution': [('id', 'string', None), ('seq', 'any', None)],
    'executionLog': [('id', 'string', None)],
    'reportIncident': [('doc', 'map', None)],
}
ARITIES = {'verify': [2], 'checkEnvelope': [2, 4], 'deriveConstraints': [2, 3], 'convert': [3, 4], 'ladder': [2, 4],
           'humanitarianCheck': [1, 2], 'startExecution': [1, 3], 'stopExecution': [1, 2]}
DRY_RUN_TYPES = {'recipe': 'any', 'recipeId': 'string', 'device': 'any', 'deviceId': 'string', 'humanPresent': 'bool', 'allowModel': 'bool'}
TRY_OPS = ('startExecution', 'stopExecution', 'resumeExecution')


class Lit(str):
    """An expression string that remembers the JSON value it came from, so `call` can type it."""
    value = None


def jstr(text):
    """A Java string literal for `text`; non-ASCII becomes \\uXXXX so the file compiles under any source encoding."""
    out = ['"']
    for ch in text:
        if ch == '"': out.append('\\"')
        elif ch == '\\': out.append('\\\\')
        elif ch == '\n': out.append('\\n')
        elif ch == '\r': out.append('\\r')
        elif ch == '\t': out.append('\\t')
        elif ord(ch) < 0x20 or ord(ch) > 0x7e: out.append('\\u%04x' % ord(ch))
        else: out.append(ch)
    out.append('"')
    return ''.join(out)


def jnum(value):
    return repr(float(value)) if isinstance(value, (int, float)) and not isinstance(value, bool) else str(value)


class Renderer:
    def header(self, s):
        return (f'// Scenario {s["id"]}: {s["title"]["en"]}\n// {s["goal"]["en"]}\n'
                '// Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                '// Compile the client once, then run this file in source-file mode (Java 11+):\n'
                '//   javac -d build/java sdk/java/src/ai/cookwala/sdk/*.java && java -cp build/java scenarios/out/'
                f'{s["id"]}-{s["slug"]}/java.java\n'
                'import ai.cookwala.sdk.CookwalaClient;\nimport ai.cookwala.sdk.CookwalaProblem;\nimport ai.cookwala.sdk.DryRunArgs;\n'
                'import ai.cookwala.sdk.Json;\nimport java.nio.charset.StandardCharsets;\nimport java.nio.file.Files;\n'
                'import java.nio.file.Path;\nimport java.util.List;\nimport java.util.Map;\n\n'
                'public class Scenario {\n'
                '    /** Reads a JSON file by its repository-relative path, walking up from the working directory to the repository root. */\n'
                '    static Object load(String path) throws Exception {\n'
                '        Path dir = Path.of("").toAbsolutePath();\n'
                '        while (!Files.exists(dir.resolve(path)) && dir.getParent() != null) dir = dir.getParent();\n'
                '        return Json.parse(Files.readString(dir.resolve(path), StandardCharsets.UTF_8));\n    }\n\n'
                '    /** Walks "a.b[0].length" into a parsed document. */\n'
                '    static Object pick(Object o, String path) {\n'
                '        for (String part : path.replace("]", "").replace("[", ".").split("\\\\.")) {\n'
                '            if (part.isEmpty()) continue;\n'
                '            if (part.equals("length")) o = o instanceof List ? ((List<?>) o).size() : o instanceof Map ? ((Map<?, ?>) o).size() : ((String) o).length();\n'
                '            else if (part.matches("\\\\d+")) o = ((List<?>) o).get(Integer.parseInt(part));\n'
                '            else o = o == null ? null : ((Map<?, ?>) o).get(part);\n'
                '        }\n        return o;\n    }\n\n'
                '    /** Compares canonical JSON (sorted keys, 36.0 == 36) and prints "ok <label> = <value>". */\n'
                '    static void expect(Object got, Object want, String label) {\n'
                '        String g = Json.canonical(got), w = Json.canonical(want);\n'
                '        if (!g.equals(w)) throw new AssertionError(label + ": got " + g + ", want " + w);\n'
                '        System.out.println("ok " + label + " = " + w);\n    }\n\n'
                '    public static void main(String[] args) throws Exception {\n'
                '        String hub = System.getenv("COOKWALA_HUB");\n'
                '        CookwalaClient c = new CookwalaClient(hub == null || hub.isEmpty() ? "http://localhost:7878" : hub);')

    def comment(self, text): return f'\n        // {text}'

    def lit(self, value):
        e = Lit(f'Json.parse({jstr(json.dumps(value, ensure_ascii=False))})')
        e.value = value
        return e

    def file(self, path): return f'load({jstr(path)})'
    def sub(self, expr, path): return f'pick({expr}, {jstr(path)})'
    def var(self, name, path=None): return f'pick({name}, {jstr(path)})' if path else name

    def typed(self, expr, kind):
        """Coerce an argument expression to the Java parameter type."""
        if isinstance(expr, Lit):
            v = expr.value
            if kind == 'string' and isinstance(v, str): return jstr(v)
            if kind in ('bool', 'Boolean') and isinstance(v, bool): return 'true' if v else 'false'
            if kind in ('double', 'Double') and isinstance(v, (int, float)) and not isinstance(v, bool): return jnum(v)
            if kind == 'list' and isinstance(v, list): return f'Json.parseList({jstr(json.dumps(v, ensure_ascii=False))})'
            if kind == 'map' and isinstance(v, dict): return f'Json.parseObject({jstr(json.dumps(v, ensure_ascii=False))})'
            if kind == 'any': return str(expr)
            if v is None and kind not in ('bool', 'double'): return 'null'
        if kind == 'string': return f'(String) {expr}'
        if kind in ('bool', 'Boolean'): return f'(Boolean) {expr}'
        if kind == 'double': return f'((Number) {expr}).doubleValue()'
        if kind == 'Double': return f'((Number) {expr}).doubleValue()'
        if kind == 'list': return f'(List<?>) {expr}'
        if kind == 'map': return f'(Map<String, ?>) {expr}'
        return str(expr)

    def call(self, op, args, save):
        given = dict(args)
        if op == 'dryRun':
            chain = ''.join(f'.{n}({self.typed(e, DRY_RUN_TYPES[n])})' for n, e in args)
            expr = f'c.dryRun(new DryRunArgs(){chain})'
        else:
            params = PARAMS[op]
            last = max([i for i, (n, _, _) in enumerate(params) if n in given], default=-1) + 1
            arity = next((a for a in ARITIES.get(op, [len(params)]) if a >= last), len(params))
            rendered = [self.typed(given[n], k) if n in given else d for n, k, d in params[:arity]]
            expr = f'c.{op}({", ".join(rendered)})'
        if op in TRY_OPS:
            target = save or 'result'
            return (f'        Object {target};\n        try {{ {target} = {expr}; }}\n        catch (CookwalaProblem p) {{\n'
                    f'            {target} = p.body; // a refusal is a result, not a crash\n'
                    f'            System.out.println("refused: " + Json.stringify(p.refusal));\n        }}')
        return f'        Object {save} = {expr};' if save else f'        {expr};'

    def expect(self, var, path, value):
        got = f'pick({var}, {jstr(path)})' if path else var
        return f'        expect({got}, {self.lit(value)}, {jstr(path or var)});'

    def wait(self, seconds): return f'        Thread.sleep({int(seconds * 1000)});'
    def footer(self): return '\n        System.out.println("scenario complete");\n    }\n}'
