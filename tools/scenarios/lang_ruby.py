"""Ruby renderer for scenarios (Ruby 2.6+; the sample requires the gem from the repository layout)."""
import json
import re

EXT = '.rb'
LABEL = 'Ruby'
RUN = 'ruby scenarios/out/{id}-{slug}/ruby.rb   # Ruby 2.6+; needs a hub on :7878; require path assumes the repository layout'


def snake(name):
    return re.sub(r'([A-Z])', lambda m: '_' + m.group(1).lower(), name)


def rb_string(s):
    """A double-quoted Ruby string: JSON escapes are valid Ruby escapes; '#' must not interpolate."""
    return json.dumps(s, ensure_ascii=False).replace('#', '\\#')


def rb_single(s):
    """A single-quoted Ruby string holding arbitrary text (used for JSON to parse at runtime)."""
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


class Renderer:
    def header(self, s):
        return (f'# Scenario {s["id"]}: {s["title"]["en"]}\n# {s["goal"]["en"]}\n'
                '# Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                'require "json"\nrequire_relative "../../../sdk/ruby/lib/cookwala"\n\n'
                'def load_doc(path)\n  JSON.parse(File.read(path, encoding: "utf-8"))\nend\n\n'
                'def pick(obj, path)\n  path.delete("]").split(/[.\\[]/).each do |part|\n'
                '    obj = if part == "length" then obj.length\n          elsif part =~ /\\A\\d+\\z/ then obj[part.to_i]\n'
                '          elsif obj.is_a?(Hash) then obj[part]\n          end\n  end\n  obj\nend\n\n'
                'def expect(got, want, label)\n  raise "#{label}: got #{got.to_json}" unless got.to_json == want.to_json || got == want\n'
                '  puts "ok #{label} = #{want.to_json}"\nend\n\n'
                'c = Cookwala::Client.new(ENV.fetch("COOKWALA_HUB", "http://localhost:7878"))\n')

    def comment(self, text): return f'\n# {text}'

    def lit(self, value):
        if isinstance(value, str): return rb_string(value)
        if isinstance(value, bool): return 'true' if value else 'false'
        if value is None: return 'nil'
        if isinstance(value, (int, float)): return json.dumps(value)
        return f'JSON.parse({rb_single(json.dumps(value, ensure_ascii=False))})'

    def file(self, path): return f'load_doc({rb_string(path)})'
    def sub(self, expr, path): return f'pick({expr}, {rb_string(path)})'
    def var(self, name, path=None): return f'pick({name}, {rb_string(path)})' if path else name

    def call(self, op, args, save):
        if op == 'dryRun':
            expr = f'c.dry_run({", ".join(f"{snake(n)}: {e}" for n, e in args)})'
        else:
            expr = f'c.{snake(op)}({", ".join(e for _, e in args)})' if args else f'c.{snake(op)}'
        if op in ('startExecution', 'stopExecution', 'resumeExecution'):
            target = save or 'result'
            return (f'begin\n  {target} = {expr}\nrescue Cookwala::Problem => p\n'
                    f'  {target} = p.body # a refusal is a result, not a crash\n  puts "refused: #{{p.refusal.to_json}}"\nend')
        return f'{save} = {expr}' if save else expr

    def expect(self, var, path, value):
        got = f'pick({var}, {rb_string(path)})' if path else var
        return f'expect({got}, {self.lit(value)}, {rb_string(path or var)})'

    def wait(self, seconds): return f'sleep {seconds}'
    def footer(self): return '\nputs "scenario complete"'
