"""Go renderer for scenarios: a `main` package per scenario using sdk/go (github.com/amado2k5/cookwala/sdk/go).

Scenario argument values are JSON literals; the sample keeps them as raw JSON parsed at runtime
(`J(...)`) except where the client method takes a typed parameter (string, bool, float64), in
which case the Go literal is written directly. Dynamic values (`pick(...)`) are type-asserted.
"""
import json

EXT = '.go'
LABEL = 'Go'
RUN = ('go run scenarios/out/{id}-{slug}/go.go   # from the repository root, with a go.mod there once: '
       'go mod init cookwala-samples && go mod edit -require=github.com/amado2k5/cookwala/sdk/go@v0.0.0 -replace=github.com/amado2k5/cookwala/sdk/go=./sdk/go')

# (name, kind) per positional parameter of the Go client, in the order of render.SIGNATURES.
# kinds: str, optstr ("" = default), bool, optbool (*bool), num (float64), optnum (*float64),
# strs ([]string), any, optany (nil allowed), seq (any, printed with fmt.Sprint)
PARAMS = {
    'hash': [('doc', 'any')], 'verify': [('doc', 'any'), ('keys', 'optany')],
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
ABSENT = {'str': '""', 'optstr': '""', 'bool': 'false', 'optbool': 'nil', 'num': '0', 'optnum': 'nil', 'strs': 'nil', 'any': 'nil', 'optany': 'nil', 'seq': 'nil'}
DRY_FIELDS = {'recipe': 'Recipe', 'recipeId': 'RecipeID', 'device': 'Device', 'deviceId': 'DeviceID', 'humanPresent': 'HumanPresent', 'allowModel': 'AllowModel'}
PROBLEM_OPS = ('startExecution', 'stopExecution', 'resumeExecution')
_MISSING = object()


def raw(text):
    """A Go raw string literal holding JSON; falls back to an interpreted literal if a backtick appears."""
    return '`' + text + '`' if '`' not in text else json.dumps(text)


def gostr(value):
    return json.dumps(value, ensure_ascii=False)


class Renderer:
    def __init__(self):
        self._lits = {}       # expression -> original JSON value, so typed parameters get Go literals
        self._declared = set()

    def header(self, s):
        return (f'// Scenario {s["id"]}: {s["title"]["en"]}\n// {s["goal"]["en"]}\n'
                '// Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                '// Run from the repository root (file paths are relative to it); see sdk/go/README.md for the go.mod replace directive.\n'
                'package main\n\n'
                'import (\n\t"encoding/json"\n\t"fmt"\n\t"os"\n\t"strconv"\n\t"strings"\n\t"time"\n\n'
                '\tcookwala "github.com/amado2k5/cookwala/sdk/go"\n)\n\n'
                'var _ = time.Sleep // keeps the import when no step waits\n\n'
                '// J parses a JSON literal; scenario values stay JSON so every language sees the same data.\n'
                'func J(s string) any {\n\tvar v any\n\tif err := json.Unmarshal([]byte(s), &v); err != nil {\n\t\tpanic(err)\n\t}\n\treturn v\n}\n\n'
                'func load(path string) any {\n\tb, err := os.ReadFile(path)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\treturn J(string(b))\n}\n\n'
                '// pick walks "a.b[0].length" through decoded JSON.\n'
                'func pick(obj any, path string) any {\n'
                '\tfor _, part := range strings.Split(strings.NewReplacer("]", "", "[", ".").Replace(path), ".") {\n'
                '\t\tswitch o := obj.(type) {\n'
                '\t\tcase []any:\n\t\t\tif part == "length" {\n\t\t\t\tobj = float64(len(o))\n\t\t\t} else {\n\t\t\t\ti, _ := strconv.Atoi(part)\n\t\t\t\tobj = o[i]\n\t\t\t}\n'
                '\t\tcase map[string]any:\n\t\t\tif part == "length" {\n\t\t\t\tobj = float64(len(o))\n\t\t\t} else {\n\t\t\t\tobj = o[part]\n\t\t\t}\n'
                '\t\tdefault:\n\t\t\treturn nil\n\t\t}\n\t}\n\treturn obj\n}\n\n'
                'func strs(v any) []string {\n\tout := []string{}\n\tif a, ok := v.([]any); ok {\n\t\tfor _, x := range a {\n\t\t\tout = append(out, fmt.Sprint(x))\n\t\t}\n\t}\n\treturn out\n}\n\n'
                'func must(v any, err error) any {\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\treturn v\n}\n\n'
                '// expect compares as JSON so numbers, lists and objects read the same in every language.\n'
                'func expect(got, want any, label string) {\n\tg, _ := json.Marshal(got)\n\tw, _ := json.Marshal(want)\n'
                '\tif string(g) != string(w) {\n\t\tfmt.Fprintf(os.Stderr, "%s: got %s, want %s\\n", label, g, w)\n\t\tos.Exit(1)\n\t}\n'
                '\tfmt.Println("ok", label, "=", string(w))\n}\n\n'
                'func main() {\n\thub := os.Getenv("COOKWALA_HUB")\n\tif hub == "" {\n\t\thub = "http://localhost:7878"\n\t}\n\tc := cookwala.NewClient(hub)')

    def comment(self, text): return f'\n\t// {text}'

    def lit(self, value):
        expr = f'J({raw(json.dumps(value, ensure_ascii=False))})'
        self._lits[expr] = value
        return expr

    def file(self, path): return f'load({gostr(path)})'
    def sub(self, expr, path): return f'pick({expr}, {gostr(path)})'
    def var(self, name, path=None): return f'pick({name}, {gostr(path)})' if path else name

    def _arg(self, kind, expr):
        """Render one positional argument of the given kind from an expression (or None when absent)."""
        if expr is None: return ABSENT[kind]
        v = self._lits.get(expr, _MISSING)
        literal = v is not _MISSING
        if kind in ('any', 'optany', 'seq'): return expr
        if kind in ('str', 'optstr'): return gostr(v) if literal else f'{expr}.(string)'
        if kind == 'bool': return ('true' if v else 'false') if literal else f'{expr}.(bool)'
        if kind == 'optbool': return f'cookwala.Bool({"true" if v else "false"})' if literal else f'cookwala.Bool({expr}.(bool))'
        if kind == 'num': return json.dumps(v) if literal else f'{expr}.(float64)'
        if kind == 'optnum': return f'cookwala.Float({json.dumps(v)})' if literal else f'cookwala.Float({expr}.(float64))'
        if kind == 'strs': return ('[]string{' + ', '.join(gostr(x) for x in v) + '}') if literal else f'strs({expr})'
        raise ValueError(kind)

    def _assign(self, save, expr):
        if save in self._declared: return f'\t{save} = {expr}\n\t_ = {save}'
        self._declared.add(save)
        return f'\t{save} := {expr}\n\t_ = {save}'

    def call(self, op, args, save):
        a = dict(args)
        if op == 'dryRun':
            fields = []
            for n, e in args:
                if n in ('recipeId', 'deviceId'): fields.append(f'{DRY_FIELDS[n]}: {self._arg("str", e)}')
                elif n == 'humanPresent': fields.append(f'{DRY_FIELDS[n]}: {self._arg("bool", e)}')
                elif n == 'allowModel': fields.append(f'{DRY_FIELDS[n]}: {self._arg("optbool", e)}')
                else: fields.append(f'{DRY_FIELDS[n]}: {e}')
            expr = f'c.DryRun(cookwala.DryRunArgs{{{", ".join(fields)}}})'
        else:
            rendered = []
            for name, kind in PARAMS[op]:
                e = a.get(name)
                if e is None and (op, name) in DEFAULTS: e = self.lit(DEFAULTS[(op, name)])
                rendered.append(self._arg(kind, e))
            expr = f'c.{op[0].upper()}{op[1:]}({", ".join(rendered)})'
        target = save or 'result'
        if op in PROBLEM_OPS:
            decl = ':=' if {target, 'err'} - self._declared else '='
            self._declared.update((target, 'err'))
            return (f'\t{target}, err {decl} {expr}\n'
                    f'\tif p, ok := err.(*cookwala.Problem); ok {{\n\t\t{target} = p.Body // a refusal is a result, not a crash\n\t\tfmt.Println("refused:", p.Refusal)\n'
                    f'\t}} else if err != nil {{\n\t\tpanic(err)\n\t}}\n\t_ = {target}')
        return self._assign(save, f'must({expr})') if save else f'\tmust({expr})'

    def expect(self, var, path, value):
        got = f'pick({var}, {gostr(path)})' if path else var
        return f'\texpect({got}, {self.lit(value)}, {gostr(path or var)})'

    def wait(self, seconds): return f'\ttime.Sleep({seconds} * time.Second)'
    def footer(self): return '\n\tfmt.Println("scenario complete")\n}'
