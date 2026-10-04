"""PHP renderer for scenarios (PHP 7.4+; the sample requires the client from the repository layout)."""
import json

EXT = '.php'
LABEL = 'PHP'
RUN = 'php scenarios/out/{id}-{slug}/php.php   # PHP 7.4+ with ext-json; needs a hub on :7878; require path assumes the repository layout'


def php_string(s):
    """A single-quoted PHP string: only backslash and the quote are escapes, so UTF-8 passes through."""
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


class Renderer:
    def header(self, s):
        return (f'<?php\n// Scenario {s["id"]}: {s["title"]["en"]}\n// {s["goal"]["en"]}\n'
                '// Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                'declare(strict_types=1);\n\n'
                'require __DIR__ . "/../../../sdk/php/src/CookwalaClient.php";\n\n'
                'use Cookwala\\CookwalaClient;\nuse Cookwala\\CookwalaProblem;\n\n'
                'function load(string $path)\n{\n    $raw = file_get_contents($path);\n'
                '    if ($raw === false) {\n        throw new RuntimeException("cannot read $path");\n    }\n'
                '    return json_decode($raw, true, 512, JSON_THROW_ON_ERROR);\n}\n\n'
                'function j(string $text)\n{\n    return json_decode($text, true, 512, JSON_THROW_ON_ERROR);\n}\n\n'
                'function pick($obj, string $path)\n{\n'
                "    foreach (preg_split('/[.\\[]/', str_replace(']', '', $path)) as $part) {\n"
                "        if ($part === 'length') {\n            $obj = is_array($obj) ? count($obj) : (is_string($obj) ? strlen($obj) : null);\n"
                '        } elseif (preg_match(\'/^\\d+$/\', $part) === 1) {\n            $obj = is_array($obj) && array_key_exists((int) $part, $obj) ? $obj[(int) $part] : null;\n'
                '        } else {\n            $obj = is_array($obj) && array_key_exists($part, $obj) ? $obj[$part] : null;\n        }\n    }\n    return $obj;\n}\n\n'
                'function expect($got, $want, string $label): void\n{\n'
                '    $g = json_encode($got, JSON_UNESCAPED_UNICODE);\n    $w = json_encode($want, JSON_UNESCAPED_UNICODE);\n'
                '    if ($g !== $w && !(is_numeric($got) && is_numeric($want) && $got == $want)) {  // 36 and 36.0 are the same number\n        throw new RuntimeException("$label: got $g");\n    }\n'
                '    echo "ok $label = $w\\n";\n}\n\n'
                '$c = new CookwalaClient(getenv("COOKWALA_HUB") ?: "http://localhost:7878");\n')

    def comment(self, text): return f'\n// {text}'

    def lit(self, value):
        if isinstance(value, str): return php_string(value)
        if isinstance(value, bool): return 'true' if value else 'false'
        if value is None: return 'null'
        if isinstance(value, (int, float)): return json.dumps(value)
        return f'j({php_string(json.dumps(value, ensure_ascii=False))})'

    def file(self, path): return f'load({php_string(path)})'
    def sub(self, expr, path): return f'pick({expr}, {php_string(path)})'
    def var(self, name, path=None): return f'pick(${name}, {php_string(path)})' if path else f'${name}'

    def call(self, op, args, save):
        if op == 'dryRun':
            expr = f'$c->dryRun([{", ".join(f"{php_string(n)} => {e}" for n, e in args)}])'
        else:
            expr = f'$c->{op}({", ".join(e for _, e in args)})'
        if op in ('startExecution', 'stopExecution', 'resumeExecution'):
            target = save or 'result'
            return (f'try {{\n    ${target} = {expr};\n}} catch (CookwalaProblem $p) {{\n'
                    f'    ${target} = $p->body; // a refusal is a result, not a crash\n    echo "refused: " . json_encode($p->refusal, JSON_UNESCAPED_UNICODE) . "\\n";\n}}')
        return f'${save} = {expr};' if save else f'{expr};'

    def expect(self, var, path, value):
        got = f'pick(${var}, {php_string(path)})' if path else f'${var}'
        return f'expect({got}, {self.lit(value)}, {php_string(path or var)});'

    def wait(self, seconds): return f'usleep({int(seconds * 1_000_000)});'
    def footer(self): return '\necho "scenario complete\\n";'
