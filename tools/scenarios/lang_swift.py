"""Swift renderer for scenarios: one @main program per scenario, compiled together with the client source."""
import json
import re

EXT = '.swift'
LABEL = 'Swift'
RUN = ('swiftc -o /tmp/cookwala-{id} sdk/swift/Sources/Cookwala/CookwalaClient.swift scenarios/out/{id}-{slug}/swift.swift && /tmp/cookwala-{id}'
       '   # Swift 5.9+ on macOS 13+; needs a hub on :7878; run from the repository root')

# Parameters with a concrete Swift type: a non-literal expression (pick/load/json/variable) is cast to it.
TYPES = {
    ('dryRun', 'recipeId'): 'String', ('dryRun', 'deviceId'): 'String', ('dryRun', 'humanPresent'): 'Bool', ('dryRun', 'allowModel'): 'Bool',
    ('checkEnvelope', 'op'): 'String', ('checkEnvelope', 'trace'): '[Any]', ('checkEnvelope', 'altitudeM'): 'Double',
    ('parseSms', 'text'): 'String', ('deriveConstraints', 'role'): 'String',
    ('convert', 'value'): 'Double', ('convert', 'unit'): 'String', ('convert', 'to'): 'String', ('convert', 'densityGPerMl'): 'Double',
    ('ladder', 'op'): 'String', ('ladder', 'sensors'): '[Any]', ('ladder', 'allowModel'): 'Bool', ('ladder', 'humanPresent'): 'Bool',
    ('validate', 'kind'): 'String', ('verify', 'keys'): '[Any]', ('humanitarianCheck', 'docs'): '[Any]', ('humanitarianCheck', 'packs'): '[Any]',
    ('getRecipe', 'id'): 'String', ('getExecution', 'id'): 'String', ('stopExecution', 'id'): 'String', ('stopExecution', 'reason'): 'String',
    ('resumeExecution', 'id'): 'String', ('executionLog', 'id'): 'String',
    ('startExecution', 'request'): '[String: Any]', ('startExecution', 'idempotencyKey'): 'String', ('startExecution', 'humanPresent'): 'Bool',
}
# Argument labels the client uses beyond the first positional parameter.
LABELLED = {'dryRun': 'all', 'startExecution': 'rest', 'stopExecution': 'rest', 'resumeExecution': 'rest'}
SCALAR = re.compile(r'^(".*"|true|false|-?\d+(\.\d+)?([eE][-+]?\d+)?)$', re.S)


def swift_string(s):
    """A Swift string literal; JSON escapes coincide with Swift's except \\uXXXX -> \\u{XXXX}."""
    return re.sub(r'\\u([0-9a-fA-F]{4})', r'\\u{\1}', json.dumps(s, ensure_ascii=False))


class Renderer:
    def header(self, s):
        return (f'// Scenario {s["id"]}: {s["title"]["en"]}\n// {s["goal"]["en"]}\n'
                '// Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                '// Build: swiftc -o scenario sdk/swift/Sources/Cookwala/CookwalaClient.swift <this file>\n'
                'import Foundation\n\n'
                'struct ScenarioError: Error, CustomStringConvertible { let description: String; init(_ d: String) { description = d } }\n'
                'func load(_ path: String) throws -> Any {\n    try JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: path)), options: [.fragmentsAllowed])\n}\n'
                'func json(_ text: String) -> Any { (try? JSONSerialization.jsonObject(with: Data(text.utf8), options: [.fragmentsAllowed])) ?? NSNull() }\n'
                'func pick(_ obj: Any, _ path: String) -> Any {\n    var cur = obj\n'
                '    for part in path.replacingOccurrences(of: "]", with: "").split(whereSeparator: { $0 == "." || $0 == "[" }).map(String.init) {\n'
                '        if part == "length" { cur = (cur as? [Any])?.count ?? (cur as? [String: Any])?.count ?? (cur as? String)?.count ?? NSNull() }\n'
                '        else if let i = Int(part) { cur = (cur as? [Any]).flatMap { i < $0.count ? $0[i] : nil } ?? NSNull() }\n'
                '        else { cur = (cur as? [String: Any])?[part] ?? NSNull() }\n    }\n    return cur\n}\n'
                'func canon(_ v: Any?) -> String {  // canonical JSON text: sorted keys, shortest round-trip numbers\n'
                '    guard let v = v, !(v is NSNull) else { return "null" }\n'
                '    if let n = v as? NSNumber {\n        if CFGetTypeID(n) == CFBooleanGetTypeID() { return n.boolValue ? "true" : "false" }\n'
                '        return n.doubleValue == n.doubleValue.rounded() && abs(n.doubleValue) < 1e15 ? String(n.int64Value) : String(n.doubleValue)\n    }\n'
                '    if let s = v as? String { return String(decoding: try! JSONSerialization.data(withJSONObject: s, options: [.fragmentsAllowed]), as: UTF8.self) }\n'
                '    if let a = v as? [Any] { return "[" + a.map { canon($0) }.joined(separator: ",") + "]" }\n'
                '    if let d = v as? [String: Any] { return "{" + d.keys.sorted().map { canon($0) + ":" + canon(d[$0]) }.joined(separator: ",") + "}" }\n'
                '    return String(describing: v)\n}\n'
                'func expect(_ got: Any, _ want: Any, _ label: String) throws {\n'
                '    guard canon(got) == canon(want) || (got as? NSObject)?.isEqual(want) == true else { throw ScenarioError("\\(label): got \\(canon(got))") }\n'
                '    print("ok", label, "=", canon(want))\n}\n\n'
                '@main struct Scenario {\n    static func main() async throws {\n'
                '        let c = CookwalaClient(baseUrl: ProcessInfo.processInfo.environment["COOKWALA_HUB"] ?? "http://localhost:7878")')

    def comment(self, text): return f'\n        // {text}'

    def lit(self, value):
        if isinstance(value, str): return swift_string(value)
        if isinstance(value, bool): return 'true' if value else 'false'
        if value is None: return 'NSNull()'
        if isinstance(value, (int, float)): return json.dumps(value)
        text = json.dumps(value, ensure_ascii=False).replace('\\', '\\\\').replace('"', '\\"')
        return f'json("{text}")'

    def file(self, path): return f'try load({swift_string(path)})'
    def sub(self, expr, path): return f'pick({expr}, {swift_string(path)})'
    def var(self, name, path=None): return f'pick({name}, {swift_string(path)})' if path else name

    def _typed(self, op, name, expr):
        t = TYPES.get((op, name))
        if t and not SCALAR.match(expr): return f'{expr} as! {t}'
        return expr

    def call(self, op, args, save):
        mode = LABELLED.get(op)
        parts = []
        for i, (n, e) in enumerate(args):
            e = self._typed(op, n, e)
            parts.append(f'{n}: {e}' if mode == 'all' or (mode == 'rest' and i > 0) else e)
        expr = f'try await c.{op}({", ".join(parts)})'
        if op in ('startExecution', 'stopExecution', 'resumeExecution'):
            target = save or 'result'
            return (f'        let {target}: Any\n        do {{ {target} = {expr} }} catch let p as CookwalaProblem {{\n'
                    f'            {target} = p.body; print("refused:", canon(p.refusal))  // a refusal is a result, not a crash\n        }}')
        return f'        let {save} = {expr}' if save else f'        _ = {expr}'

    def expect(self, var, path, value):
        got = f'pick({var}, {swift_string(path)})' if path else var
        return f'        try expect({got}, {self.lit(value)}, {swift_string(path or var)})'

    def wait(self, seconds): return f'        try await Task.sleep(nanoseconds: {int(seconds * 1_000_000_000)})'
    def footer(self): return '\n        print("scenario complete")\n    }\n}'
