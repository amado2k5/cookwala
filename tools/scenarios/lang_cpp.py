"""C++ renderer for scenarios: a program per scenario using sdk/cpp (header-only, libcurl + nlohmann/json).

Scenario argument values are JSON literals; the sample keeps them as raw JSON parsed at runtime
(`json::parse(R"cw(...)cw")`) except where the client method takes a typed parameter (string,
bool, double), in which case the C++ literal is written directly. Dynamic values (`pick(...)`)
are converted with `.get<T>()`.
"""
import json
import re

EXT = '.cpp'
LABEL = 'C++'
RUN = ('clang++ -std=c++20 -I sdk/cpp/include -I "$(brew --prefix nlohmann-json)/include" scenarios/out/{id}-{slug}/cpp.cpp -lcurl -o /tmp/scenario-{id} && /tmp/scenario-{id}'
       '   # from the repository root; needs a hub on :7878')

# (name, kind) per positional parameter of the C++ client, in the order of render.SIGNATURES.
# kinds: str, optstr ("" = default), bool, optbool (std::optional<bool>), num (double), optnum (std::optional<double>),
# strs (std::vector<std::string>), any (json), optany (std::optional<json>), seq (long long)
PARAMS = {
    'hash': [('doc', 'any')], 'verify': [('doc', 'any'), ('keys', 'any')],
    'checkEnvelope': [('op', 'str'), ('trace', 'any'), ('target', 'optany'), ('altitudeM', 'num')],
    'parseSms': [('text', 'str')], 'deriveConstraints': [('facets', 'any'), ('role', 'str'), ('consents', 'optany')],
    'convert': [('value', 'num'), ('unit', 'str'), ('to', 'str'), ('densityGPerMl', 'optnum')],
    'ladder': [('op', 'str'), ('sensors', 'strs'), ('allowModel', 'bool'), ('humanPresent', 'bool')],
    'validate': [('kind', 'str'), ('doc', 'any')], 'humanitarianCheck': [('docs', 'any'), ('packs', 'strs')],
    'listRecipes': [], 'getRecipe': [('id', 'str')], 'getDevices': [], 'getOps': [], 'getRegistry': [],
    'capabilities': [], 'safetyLimits': [], 'recalls': [], 'conformance': [],
    'startExecution': [('request', 'any'), ('idempotencyKey', 'optstr'), ('humanPresent', 'optbool')],
    'getExecution': [('id', 'str')], 'stopExecution': [('id', 'str'), ('reason', 'optstr')],
    'resumeExecution': [('id', 'str'), ('seq', 'seq')], 'executionLog': [('id', 'str')], 'reportIncident': [('doc', 'any')],
}
DEFAULTS = {('ladder', 'allowModel'): True, ('ladder', 'humanPresent'): False, ('checkEnvelope', 'altitudeM'): 0}
ABSENT = {'str': '""', 'optstr': '""', 'bool': 'false', 'optbool': 'std::nullopt', 'num': '0', 'optnum': 'std::nullopt',
          'strs': '{}', 'any': 'json()', 'optany': 'std::nullopt', 'seq': '0'}
# trailing arguments that equal the method's default may be left out (every client method has defaults there)
TRIM = {'""', 'std::nullopt', '{}', 'json()'}
PROBLEM_OPS = ('startExecution', 'stopExecution', 'resumeExecution')
_MISSING = object()


def cstr(value):
    """A C++ string literal from a JSON string value (JSON escapes are valid C++ escapes)."""
    return json.dumps(value, ensure_ascii=False)


def rawjson(value):
    text = json.dumps(value, ensure_ascii=False)
    return f'json::parse(R"cw({text})cw")' if ')cw"' not in text else f'json::parse({json.dumps(text)})'


class Renderer:
    def __init__(self):
        self._lits = {}  # expression -> original JSON value, so typed parameters get C++ literals
        self._declared = set()

    def header(self, s):
        return (f'// Scenario {s["id"]}: {s["title"]["en"]}\n// {s["goal"]["en"]}\n'
                '// Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                '// Build from the repository root (file paths are relative to it):\n'
                f'//   {RUN.format(id=s["id"], slug=s["slug"], ext=EXT).split("   #")[0]}\n'
                '#include <cookwala/client.hpp>\n\n#include <algorithm>\n#include <cctype>\n#include <chrono>\n#include <cstdlib>\n'
                '#include <fstream>\n#include <iostream>\n#include <sstream>\n#include <string>\n#include <thread>\n\n'
                'using json = nlohmann::json;\n\n'
                '[[maybe_unused]] static json load(const std::string& path) {\n  std::ifstream f(path);\n'
                '  if (!f) { std::cerr << "cannot read " << path << "\\n"; std::exit(1); }\n  return json::parse(f);\n}\n\n'
                '// Walks "a.b[0].length" through a JSON value.\n'
                'static json pick(json obj, std::string path) {\n'
                '  for (char& ch : path) if (ch == \'[\') ch = \'.\';\n'
                '  path.erase(std::remove(path.begin(), path.end(), \']\'), path.end());\n'
                '  std::stringstream ss(path);\n  std::string part;\n'
                '  while (std::getline(ss, part, \'.\')) {\n    if (part.empty()) continue;\n'
                '    if (part == "length") obj = obj.size();\n'
                '    else if (std::isdigit(static_cast<unsigned char>(part[0]))) { size_t i = std::stoul(part); obj = obj.is_array() && i < obj.size() ? obj[i] : json(); }\n'
                '    else obj = obj.is_object() && obj.contains(part) ? obj[part] : json();\n  }\n  return obj;\n}\n\n'
                '// Compares as JSON (numbers by value) so every language sees the same expectation.\n'
                'static void expect(const json& got, const json& want, const std::string& label) {\n'
                '  if (got != want) { std::cerr << label << ": got " << got.dump() << ", want " << want.dump() << "\\n"; std::exit(1); }\n'
                '  std::cout << "ok " << label << " = " << want.dump() << "\\n";\n}\n\n'
                'int main() {\n  const char* hub = std::getenv("COOKWALA_HUB");\n'
                '  cookwala::Client c(hub ? hub : "http://localhost:7878");\n  try {')

    def comment(self, text): return f'\n    // {text}'

    def lit(self, value):
        expr = rawjson(value)
        self._lits[expr] = value
        return expr

    def file(self, path): return f'load({cstr(path)})'
    def sub(self, expr, path): return f'pick({expr}, {cstr(path)})'
    def var(self, name, path=None): return f'pick({name}, {cstr(path)})' if path else name

    def _arg(self, kind, expr):
        if expr is None: return ABSENT[kind]
        v = self._lits.get(expr, _MISSING)
        literal = v is not _MISSING
        if kind in ('any', 'optany'): return expr
        if kind in ('str', 'optstr'): return cstr(v) if literal else f'{expr}.get<std::string>()'
        if kind in ('bool', 'optbool'): return ('true' if v else 'false') if literal else f'{expr}.get<bool>()'
        if kind in ('num', 'optnum'): return json.dumps(v) if literal else f'{expr}.get<double>()'
        if kind == 'seq': return str(int(v)) if literal else f'{expr}.get<long long>()'
        if kind == 'strs': return ('{' + ', '.join(cstr(x) for x in v) + '}') if literal else f'{expr}.get<std::vector<std::string>>()'
        raise ValueError(kind)

    def _assign(self, save, expr):
        if save in self._declared: return f'    {save} = {expr};'
        self._declared.add(save)
        return f'    json {save} = {expr};'

    def call(self, op, args, save):
        a = dict(args)
        if op == 'dryRun':
            fields = []
            for n, e in args:
                if n in ('recipeId', 'deviceId'): fields.append(f'.{n} = {self._arg("str", e)}')
                elif n in ('humanPresent', 'allowModel'): fields.append(f'.{n} = {self._arg("bool", e)}')
                else: fields.append(f'.{n} = {e}')
            expr = f'c.dryRun({{{", ".join(fields)}}})'
        else:
            rendered = []
            for name, kind in PARAMS[op]:
                e = a.get(name)
                if e is None and (op, name) in DEFAULTS: e = self.lit(DEFAULTS[(op, name)])
                rendered.append(self._arg(kind, e))
            while rendered and rendered[-1] in TRIM and a.get(PARAMS[op][len(rendered) - 1][0]) is None: rendered.pop()
            expr = f'c.{op}({", ".join(rendered)})'
        if op in PROBLEM_OPS:
            target = save or 'result'
            decl = '' if target in self._declared else f'    json {target};\n'
            self._declared.add(target)
            return (f'{decl}    try {{ {target} = {expr}; }} catch (const cookwala::Problem& p) {{\n'
                    f'      {target} = p.body; std::cout << "refused: " << p.refusal.dump() << "\\n"; // a refusal is a result, not a crash\n    }}')
        return self._assign(save, expr) if save else f'    {expr};'

    def expect(self, var, path, value):
        got = f'pick({var}, {cstr(path)})' if path else var
        return f'    expect({got}, {self.lit(value)}, {cstr(path or var)});'

    def wait(self, seconds): return f'    std::this_thread::sleep_for(std::chrono::milliseconds({int(seconds * 1000)}));'

    def footer(self):
        return ('\n    std::cout << "scenario complete\\n";\n'
                '  } catch (const std::exception& e) {\n    std::cerr << e.what() << "\\n";\n    return 1;\n  }\n  return 0;\n}')
