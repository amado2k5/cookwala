"""Rust renderer for scenarios: a program per scenario using the sdk/rust crate (`cookwala`).

Scenario argument values are JSON literals; the sample keeps them as `json!(...)` except where
the client method takes a typed parameter (&str, bool, f64), in which case the Rust literal is
written directly. Dynamic values (`pick(...)`) are converted with `as_str()`, `as_bool()`, ...
"""
import json
import re

EXT = '.rs'
LABEL = 'Rust'
RUN = ('cp scenarios/out/{id}-{slug}/rust.rs sdk/rust/examples/scenario_{id}.rs && '
       'cargo run -q --manifest-path sdk/rust/Cargo.toml --example scenario_{id}   # from the repository root; needs a hub on :7878')

# (name, kind) per positional parameter of the Rust client, in the order of render.SIGNATURES.
# kinds: str (&str), optstr (Option<&str>), bool, optbool (Option<bool>), num (f64), optnum (Option<f64>),
# strs (&[&str]), optstrs (Option<&[&str]>), any (&Value), optany (Option<&Value>), seq (u64)
PARAMS = {
    'hash': [('doc', 'any')], 'verify': [('doc', 'any'), ('keys', 'optany')],
    'checkEnvelope': [('op', 'str'), ('trace', 'any'), ('target', 'optany'), ('altitudeM', 'num')],
    'parseSms': [('text', 'str')], 'deriveConstraints': [('facets', 'any'), ('role', 'str'), ('consents', 'optany')],
    'convert': [('value', 'num'), ('unit', 'str'), ('to', 'str'), ('densityGPerMl', 'optnum')],
    'ladder': [('op', 'str'), ('sensors', 'strs'), ('allowModel', 'bool'), ('humanPresent', 'bool')],
    'validate': [('kind', 'str'), ('doc', 'any')], 'humanitarianCheck': [('docs', 'any'), ('packs', 'optstrs')],
    'listRecipes': [], 'getRecipe': [('id', 'str')], 'getDevices': [], 'getOps': [], 'getRegistry': [],
    'capabilities': [], 'safetyLimits': [], 'recalls': [], 'conformance': [],
    'startExecution': [('request', 'any'), ('idempotencyKey', 'optstr'), ('humanPresent', 'optbool')],
    'getExecution': [('id', 'str')], 'stopExecution': [('id', 'str'), ('reason', 'optstr')],
    'resumeExecution': [('id', 'str'), ('seq', 'seq')], 'executionLog': [('id', 'str')], 'reportIncident': [('doc', 'any')],
}
DEFAULTS = {('ladder', 'allowModel'): True, ('ladder', 'humanPresent'): False, ('checkEnvelope', 'altitudeM'): 0}
ABSENT = {'str': '""', 'optstr': 'None', 'bool': 'false', 'optbool': 'None', 'num': '0.0', 'optnum': 'None',
          'strs': '&[]', 'optstrs': 'None', 'any': '&Value::Null', 'optany': 'None', 'seq': '0'}
DRY_FIELDS = {'recipe': 'recipe', 'recipeId': 'recipe_id', 'device': 'device', 'deviceId': 'device_id', 'humanPresent': 'human_present', 'allowModel': 'allow_model'}
PROBLEM_OPS = ('startExecution', 'stopExecution', 'resumeExecution')
_MISSING = object()


def snake(name):
    return re.sub(r'([A-Z])', lambda m: '_' + m.group(1).lower(), name)


def rstr(value):
    """A Rust string literal from a JSON string value (JSON escapes mapped to Rust's)."""
    s = json.dumps(value, ensure_ascii=False)
    s = re.sub(r'\\u([0-9a-fA-F]{4})', r'\\u{\1}', s)
    return s.replace('\\b', '\\u{0008}').replace('\\f', '\\u{000c}')


def rnum(value):
    return f'{value}.0' if isinstance(value, int) and not isinstance(value, bool) else json.dumps(value)


def owned_ref(expr):
    """Borrow an owned-Value expression; `name.clone()` becomes `&name`."""
    return f'&{expr[:-8]}' if expr.endswith('.clone()') else f'&{expr}'


class Renderer:
    def __init__(self):
        self._lits = {}  # expression -> original JSON value, so typed parameters get Rust literals

    def header(self, s):
        return (f'// Scenario {s["id"]}: {s["title"]["en"]}\n// {s["goal"]["en"]}\n'
                '// Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                '// Run from the repository root (file paths are relative to it); see sdk/rust/README.md.\n'
                '#![allow(unused)]\nuse cookwala::{Client, DryRunArgs, Error};\nuse serde_json::{json, Value};\n\n'
                'fn load(path: &str) -> Value {\n    serde_json::from_str(&std::fs::read_to_string(path).expect(path)).expect(path)\n}\n\n'
                '/// Walks "a.b[0].length" through a JSON value.\n'
                'fn pick(obj: &Value, path: &str) -> Value {\n    let mut cur = obj.clone();\n'
                '    for part in path.replace(\']\', "").replace(\'[\', ".").split(\'.\') {\n'
                '        cur = if part == "length" {\n            json!(cur.as_array().map(|a| a.len()).or_else(|| cur.as_object().map(|o| o.len())).unwrap_or(0))\n'
                '        } else if let Ok(i) = part.parse::<usize>() {\n            cur.get(i).cloned().unwrap_or(Value::Null)\n'
                '        } else {\n            cur.get(part).cloned().unwrap_or(Value::Null)\n        };\n    }\n    cur\n}\n\n'
                'fn strs(v: &Value) -> Vec<&str> {\n    v.as_array().map(|a| a.iter().filter_map(Value::as_str).collect()).unwrap_or_default()\n}\n\n'
                '/// Numbers compare by value (36 == 36.0) so every language sees the same expectation.\n'
                'fn norm(v: &Value) -> Value {\n    match v {\n        Value::Number(n) => json!(n.as_f64()),\n'
                '        Value::Array(a) => Value::Array(a.iter().map(norm).collect()),\n'
                '        Value::Object(o) => Value::Object(o.iter().map(|(k, x)| (k.clone(), norm(x))).collect()),\n        _ => v.clone(),\n    }\n}\n\n'
                'fn expect(got: &Value, want: &Value, label: &str) {\n    if norm(got) != norm(want) {\n'
                '        eprintln!("{}: got {}, want {}", label, got, want);\n        std::process::exit(1);\n    }\n'
                '    println!("ok {} = {}", label, want);\n}\n\n'
                'fn main() -> Result<(), Box<dyn std::error::Error>> {\n'
                '    let c = Client::new(&std::env::var("COOKWALA_HUB").unwrap_or_else(|_| "http://localhost:7878".to_string()));')

    def comment(self, text): return f'\n    // {text}'

    def lit(self, value):
        expr = f'json!({json.dumps(value, ensure_ascii=False)})'
        self._lits[expr] = value
        return expr

    def file(self, path): return f'load({rstr(path)})'
    def sub(self, expr, path): return f'pick({owned_ref(expr)}, {rstr(path)})'
    def var(self, name, path=None): return f'pick(&{name}, {rstr(path)})' if path else f'{name}.clone()'

    def _arg(self, kind, expr):
        if expr is None: return ABSENT[kind]
        v = self._lits.get(expr, _MISSING)
        literal = v is not _MISSING
        if kind == 'any': return owned_ref(expr)
        if kind == 'optany': return f'Some({owned_ref(expr)})'
        if kind == 'str': return rstr(v) if literal else f'{expr}.as_str().unwrap()'
        if kind == 'optstr': return f'Some({rstr(v)})' if literal else f'Some({expr}.as_str().unwrap())'
        if kind == 'bool': return ('true' if v else 'false') if literal else f'{expr}.as_bool().unwrap()'
        if kind == 'optbool': return f'Some({"true" if v else "false"})' if literal else f'Some({expr}.as_bool().unwrap())'
        if kind == 'num': return rnum(v) if literal else f'{expr}.as_f64().unwrap()'
        if kind == 'optnum': return f'Some({rnum(v)})' if literal else f'Some({expr}.as_f64().unwrap())'
        if kind == 'seq': return str(int(v)) if literal else f'{expr}.as_u64().unwrap()'
        if kind == 'strs': return ('&[' + ', '.join(rstr(x) for x in v) + ']') if literal else f'&strs({owned_ref(expr)})'
        if kind == 'optstrs': return ('Some(&[' + ', '.join(rstr(x) for x in v) + '][..])') if literal else f'Some(&strs({owned_ref(expr)})[..])'
        raise ValueError(kind)

    def call(self, op, args, save):
        a = dict(args)
        if op == 'dryRun':
            fields = []
            for n, e in args:
                if n in ('recipeId', 'deviceId'): fields.append(f'{DRY_FIELDS[n]}: Some({self._arg("str", e)}.to_string())')
                elif n in ('humanPresent', 'allowModel'): fields.append(f'{DRY_FIELDS[n]}: {self._arg("bool", e)}')
                else: fields.append(f'{DRY_FIELDS[n]}: Some({e})')
            expr = f'c.dry_run(&DryRunArgs {{ {", ".join(fields)}, ..Default::default() }})'
        else:
            rendered = []
            for name, kind in PARAMS[op]:
                e = a.get(name)
                if e is None and (op, name) in DEFAULTS: e = self.lit(DEFAULTS[(op, name)])
                rendered.append(self._arg(kind, e))
            expr = f'c.{snake(op)}({", ".join(rendered)})'
        if op in PROBLEM_OPS:
            target = save or '_result'
            return (f'    let {target} = match {expr} {{\n        Ok(v) => v,\n'
                    f'        Err(Error::Problem(p)) => {{\n            println!("refused: {{}}", p.refusal.clone().unwrap_or(Value::Null)); // a refusal is a result, not a crash\n            p.body\n        }}\n'
                    f'        Err(e) => return Err(e.into()),\n    }};')
        return f'    let {save} = {expr}?;' if save else f'    {expr}?;'

    def expect(self, var, path, value):
        got = f'&pick(&{var}, {rstr(path)})' if path else f'&{var}'
        return f'    expect({got}, &{self.lit(value)}, {rstr(path or var)});'

    def wait(self, seconds): return f'    std::thread::sleep(std::time::Duration::from_millis({int(seconds * 1000)}));'
    def footer(self): return '\n    println!("scenario complete");\n    Ok(())\n}'
