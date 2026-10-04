"""C# renderer for scenarios: one compilable top-level-statements program per scenario.

The sample uses sdk/csharp (Cookwala.Sdk, System.Text.Json.Nodes): scenario arguments are JSON literals parsed at
runtime with the SDK's Json helper (Json.Parse / ParseArray / ParseObject), files load from the repository root,
`Pick` walks "a.b[0].length" paths and `Expect` compares canonical JSON strings. The first line is a .NET 10
file-based-app directive that references the SDK project, so `dotnet run <file>` builds both; on an older SDK,
copy the file into a console project as Program.cs with a ProjectReference to sdk/csharp/Cookwala.Sdk.csproj.
"""
import json

EXT = '.cs'
LABEL = 'C#'
RUN = 'dotnet run scenarios/out/{id}-{slug}/csharp.cs   # .NET 10+ file-based app (references sdk/csharp); needs a hub on :7878'

# C# parameter names and types per operation, in canonical order (render.SIGNATURES). Every optional parameter
# has a default in the SDK, so the renderer passes arguments by name whenever a middle one is skipped.
PARAMS = {
    'hash': [('doc', 'any')], 'verify': [('doc', 'any'), ('keys', 'array')],
    'dryRun': [('recipe', 'any'), ('recipeId', 'string'), ('device', 'any'), ('deviceId', 'string'), ('humanPresent', 'bool'), ('allowModel', 'bool')],
    'checkEnvelope': [('op', 'string'), ('trace', 'array'), ('target', 'object'), ('altitudeM', 'double')],
    'parseSms': [('text', 'string')], 'deriveConstraints': [('facets', 'array'), ('role', 'string'), ('consents', 'array')],
    'convert': [('value', 'double'), ('unit', 'string'), ('to', 'string'), ('densityGPerMl', 'double')],
    'ladder': [('op', 'string'), ('sensors', 'array'), ('allowModel', 'bool'), ('humanPresent', 'bool')],
    'validate': [('kind', 'string'), ('doc', 'any')], 'humanitarianCheck': [('docs', 'array'), ('packs', 'array')],
    'listRecipes': [], 'getRecipe': [('id', 'string')], 'getDevices': [], 'getOps': [], 'getRegistry': [],
    'capabilities': [], 'safetyLimits': [], 'recalls': [], 'conformance': [],
    'startExecution': [('request', 'object'), ('idempotencyKey', 'string'), ('humanPresent', 'bool')],
    'getExecution': [('id', 'string')], 'stopExecution': [('id', 'string'), ('reason', 'string')],
    'resumeExecution': [('id', 'string'), ('seq', 'seq')], 'executionLog': [('id', 'string')], 'reportIncident': [('doc', 'object')],
}
TRY_OPS = ('startExecution', 'stopExecution', 'resumeExecution')


def pascal(name): return name[0].upper() + name[1:]


class Lit(str):
    """An expression string that remembers the JSON value it came from, so `call` can type it."""
    value = None


def cstr(text):
    """A C# regular string literal."""
    out = ['"']
    for ch in text:
        if ch == '"': out.append('\\"')
        elif ch == '\\': out.append('\\\\')
        elif ch == '\n': out.append('\\n')
        elif ch == '\r': out.append('\\r')
        elif ch == '\t': out.append('\\t')
        elif ord(ch) < 0x20: out.append('\\u%04x' % ord(ch))
        else: out.append(ch)
    out.append('"')
    return ''.join(out)


def cnum(value):
    return repr(float(value))


class Renderer:
    def header(self, s):
        return ('#:project ../../../sdk/csharp/Cookwala.Sdk.csproj\n'
                f'// Scenario {s["id"]}: {s["title"]["en"]}\n// {s["goal"]["en"]}\n'
                '// Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                f'// Run: dotnet run scenarios/out/{s["id"]}-{s["slug"]}/csharp.cs   (.NET 10+ file-based app; the first line references the SDK project)\n'
                'using System;\nusing System.IO;\nusing System.Text.Json.Nodes;\nusing System.Threading.Tasks;\nusing Cookwala.Sdk;\n\n'
                '// Reads a JSON file by its repository-relative path, walking up from the working directory to the repository root.\n'
                'static JsonNode? Load(string path)\n{\n'
                '    var dir = Directory.GetCurrentDirectory();\n'
                '    while (!File.Exists(Path.Combine(dir, path)) && Directory.GetParent(dir) is DirectoryInfo up) dir = up.FullName;\n'
                '    return Json.Parse(File.ReadAllText(Path.Combine(dir, path)));\n}\n\n'
                '// Walks "a.b[0].length" into a parsed document.\n'
                'static JsonNode? Pick(JsonNode? o, string path)\n{\n'
                '    foreach (var part in path.Replace("]", "").Replace("[", ".").Split(\'.\'))\n    {\n'
                '        if (part.Length == 0) continue;\n'
                '        if (part == "length") o = o switch { JsonArray a => a.Count, JsonObject ob => ob.Count, _ => o!.GetValue<string>().Length };\n'
                '        else if (int.TryParse(part, out var index)) o = o![index];\n'
                '        else o = o?[part];\n    }\n    return o;\n}\n\n'
                '// Compares canonical JSON (sorted keys, 36.0 == 36) and prints "ok <label> = <value>".\n'
                'static void Expect(JsonNode? got, JsonNode? want, string label)\n{\n'
                '    var g = Json.Canonical(got);\n    var w = Json.Canonical(want);\n'
                '    if (g != w) throw new Exception($"{label}: got {g}, want {w}");\n'
                '    Console.WriteLine($"ok {label} = {w}");\n}\n\n'
                'var hubUrl = Environment.GetEnvironmentVariable("COOKWALA_HUB");\n'
                'var c = new CookwalaClient(string.IsNullOrEmpty(hubUrl) ? "http://localhost:7878" : hubUrl);')

    def comment(self, text): return f'\n// {text}'

    def lit(self, value):
        e = Lit(f'Json.Parse({cstr(json.dumps(value, ensure_ascii=False))})')
        e.value = value
        return e

    def file(self, path): return f'Load({cstr(path)})'
    def sub(self, expr, path): return f'Pick({expr}, {cstr(path)})'
    def var(self, name, path=None): return f'Pick({name}, {cstr(path)})' if path else name

    def typed(self, expr, kind):
        """Coerce an argument expression to the C# parameter type."""
        if isinstance(expr, Lit):
            v = expr.value
            if kind == 'string' and isinstance(v, str): return cstr(v)
            if kind == 'bool' and isinstance(v, bool): return 'true' if v else 'false'
            if kind == 'double' and isinstance(v, (int, float)) and not isinstance(v, bool): return cnum(v)
            if kind == 'array' and isinstance(v, list): return f'Json.ParseArray({cstr(json.dumps(v, ensure_ascii=False))})'
            if kind == 'object' and isinstance(v, dict): return f'Json.ParseObject({cstr(json.dumps(v, ensure_ascii=False))})'
            if kind == 'seq': return cnum(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else cstr(str(v))
            if kind == 'any': return str(expr)
            if v is None: return 'null'
        if kind == 'string': return f'{expr}!.GetValue<string>()'
        if kind == 'bool': return f'{expr}!.GetValue<bool>()'
        if kind == 'double': return f'{expr}!.GetValue<double>()'
        if kind == 'array': return f'(JsonArray){expr}!'
        if kind == 'object': return f'(JsonObject){expr}!'
        if kind == 'seq': return f'{expr}!'
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
            rendered = [f'{n}: {self.typed(given[n], kinds[n])}' for n in names if n in given]
        expr = f'await c.{pascal(op)}({", ".join(rendered)})'
        if op in TRY_OPS:
            target = save or 'result'
            return (f'JsonNode? {target};\ntry {{ {target} = {expr}; }}\n'
                    f'catch (CookwalaProblem p) {{ {target} = p.Body; Console.WriteLine($"refused: {{Json.Stringify(p.Refusal)}}"); }} '
                    '// a refusal is a result, not a crash')
        return f'var {save} = {expr};' if save else f'{expr};'

    def expect(self, var, path, value):
        got = f'Pick({var}, {cstr(path)})' if path else var
        return f'Expect({got}, {self.lit(value)}, {cstr(path or var)});'

    def wait(self, seconds): return f'await Task.Delay({int(seconds * 1000)});'
    def footer(self): return '\nConsole.WriteLine("scenario complete");'
