"""`cookwala` command line. Every subcommand ends in something you can check.

    cookwala hash RECIPE.json                      sha256 over RFC 8785 canonical JSON
    cookwala verify DOC.json --keys KEYS.json      signature, key validity, revocation
    cookwala dryrun RECIPE.json --device CAPS.json [--human-present] [--no-model]
    cookwala envelope OP TRACE.json [--target 94 --tolerance 3] [--altitude 1500]
    cookwala convert 2 tbsp ml | cookwala convert 1 cup g --density 0.53
    cookwala sms "OFFER 36KG YOGURT C 4C UB0511"
    cookwala constraints CONTEXT.json --role grocer
    cookwala validate                              every schema, example, vocabulary and API in the repo
    cookwala conformance [--report report.json]    Core and profile vectors; writes a ConformanceReport
    cookwala humanitarian [--pack P ...] FILE...   rule-pack findings on offers, handovers, distributions
    cookwala search [WORDS] [--cuisine EG] [--course main] [--tag T] [--free-of nuts] [--level V1] [--limit 20] [--json]
    cookwala get ID [--lang ar] [--json]           view a recipe (ID from search, or a file path)
    cookwala export cooklang ID [-o FILE]          Cookwala recipe -> Cooklang (also: cookwala convert --to cooklang ID)
    cookwala export schema-org ID [-o FILE]        Cookwala recipe -> schema.org JSON-LD
    cookwala export lerobot|otel RECIPE LOG OUT    datasets and traces, with consent
    cookwala init my-dish                          scaffold a recipe, validate it, hash it
    cookwala hub [--port 7878]                     run the reference hub (Core API, simulated device)
    cookwala mcp                                   run the MCP server on stdio
    cookwala submit RECIPE.json [--author LOGIN] [--open-pr]
                                                    add a recipe to recipes/community/ (RFC-0013,
                                                    docs/CONTRIBUTE-RECIPES.md): hashes it, checks it
                                                    and the id-prefix claim, then opens a pull request
                                                    with `gh` if --open-pr is given and `gh` is on PATH,
                                                    otherwise prints the commands to do it by hand.
"""
import json
import pathlib
import runpy
import subprocess
import sys

from . import ROOT, ref, catalog


def _load(p):
    return json.loads(pathlib.Path(p).read_text())


def _tool(name, args):
    return subprocess.call([sys.executable, str(ROOT / 'tools' / name), *args], cwd=ROOT)


def cmd_hash(a):
    print(ref.doc_hash(_load(a[0]))); return 0


def cmd_verify(a):
    keys = _load(a[a.index('--keys') + 1]) if '--keys' in a else []
    ok, why = ref.verify(_load(a[0]), keys); print(why); return 0 if ok else 1


def cmd_dryrun(a):
    dev = _load(a[a.index('--device') + 1])
    res = ref.dry_run(_load(a[0]), dev, '--human-present' in a, '--no-model' not in a)
    print(json.dumps(res, indent=1, ensure_ascii=False)); return 0 if res['state'] == 'accepted' else 1


def cmd_envelope(a):
    op, trace = a[0], _load(a[1])
    target = {'value': float(a[a.index('--target') + 1]), 'tolerance': float(a[a.index('--tolerance') + 1]) if '--tolerance' in a else 0} if '--target' in a else None
    alt = float(a[a.index('--altitude') + 1]) if '--altitude' in a else 0
    res = ref.check_envelope(op, trace, target, alt); print(json.dumps(res)); return 0 if res['envelopeOk'] else 1


def _opt(a, flag, default=None):
    return a[a.index(flag) + 1] if flag in a else default


def _positional(a, flags_with_value):
    out, skip = [], False
    for x in a:
        if skip: skip = False
        elif x in flags_with_value: skip = True
        elif not x.startswith('--') and x != '-o': out.append(x)
    return out


def cmd_search(a):
    q = ' '.join(_positional(a, ('--cuisine', '--course', '--tag', '--free-of', '--level', '--limit', '--lang')))
    hits, total = catalog.search(q, _opt(a, '--cuisine'), _opt(a, '--course'), _opt(a, '--tag'), (_opt(a, '--free-of') or '').split(',') if '--free-of' in a else None,
                                 _opt(a, '--level'), int(_opt(a, '--limit', 20)))
    lang = _opt(a, '--lang', 'en')
    if '--json' in a: print(json.dumps(hits, indent=1, ensure_ascii=False)); return 0 if hits else 1
    for h in hits:
        print(f"{h['id']:<18} {h.get('x-titles', {}).get(lang) or h['title']:<44} {h.get('level', ''):<3} {','.join(h.get('cuisine', []))}")
    print(f"{len(hits)} of {total} match" + ('' if hits else '; try fewer words or `cookwala search --limit 5`'), file=sys.stderr)
    return 0 if hits else 1


def cmd_get(a):
    rid = _positional(a, ('--lang',))[0]
    d = catalog.load(rid)
    print(json.dumps(d, indent=1, ensure_ascii=False) if '--json' in a else catalog.render(d, _opt(a, '--lang', 'en'))); return 0


def _emit(text, a):
    out = _opt(a, '-o')
    if out: pathlib.Path(out).write_text(text); print(f'wrote {out}')
    else: print(text, end='' if text.endswith('\n') else '\n')


def cmd_convert(a):
    if '--to' in a:  # recipe export, as in docs/CLI.md
        return cmd_export([_opt(a, '--to'), *_positional(a, ('--to', '--lang')), *(['--lang', _opt(a, '--lang')] if '--lang' in a else []), *(['-o', _opt(a, '-o')] if '-o' in a else [])])
    density = float(a[a.index('--density') + 1]) if '--density' in a else None
    try:
        print(round(ref.convert(float(a[0]), a[1], a[2], density), 6)); return 0
    except ValueError as e:
        print(f'error: {e}'); return 1


def cmd_sms(a):
    print(json.dumps(ref.parse_sms(' '.join(a)), ensure_ascii=False)); return 0


def cmd_constraints(a):
    ctx = _load(a[0]); role = a[a.index('--role') + 1]
    print(json.dumps(ref.derive_constraints(ctx.get('facets', []), role, ctx.get('consents')), indent=1)); return 0


def cmd_validate(a): return _tool('validate_specs.py', a)
def cmd_conformance(a): return _tool('run_conformance.py', a)
def cmd_humanitarian(a): return _tool('humanitarian_check.py', a)
def cmd_export(a):
    if a and a[0] in ('cooklang', 'schema-org'):
        d = catalog.load(_positional(a[1:], ('--lang',))[0]); lang = _opt(a, '--lang', 'en')
        _emit(catalog.to_cooklang(d, lang) if a[0] == 'cooklang' else json.dumps(catalog.to_schema_org(d, lang), indent=1, ensure_ascii=False), a); return 0
    return _tool('execlog_export.py', a)


def cmd_init(a):
    """Scaffold a recipe from the shakshuka example, renamed, then hash it. Edit it, then `cookwala validate`."""
    name = a[0] if a else 'my-dish'
    src = _load(ROOT / 'examples' / 'shakshuka.cookwala.json')
    src['id'] = name; src['revision'] = 1; src['verification'] = {'level': 'V0', 'notes': 'Scaffold from the Cookwala example. Replace every value; raise the level only with evidence.'}
    src['dish']['names'] = {'en': name.replace('-', ' ').title(), 'ar': ''}; src.pop('hash', None); src.pop('signature', None)
    out = pathlib.Path(f'{name}.cookwala.json'); out.write_text(json.dumps(src, indent=1, ensure_ascii=False) + '\n')
    print(f'wrote {out}  hash {ref.doc_hash(src)}\nNext: edit it, then run `cookwala dryrun {out} --device {ROOT}/examples/capabilities/robot-arm.json --human-present`.'); return 0


def cmd_hub(a):
    sys.argv = ['cookwala_hub.py', *a]; runpy.run_path(str(ROOT / 'hub' / 'cookwala_hub.py'), run_name='__main__'); return 0


def cmd_mcp(a):
    sys.argv = ['cookwala_mcp.py', *a]; runpy.run_path(str(ROOT / 'sdk' / 'mcp' / 'cookwala_mcp.py'), run_name='__main__'); return 0


def cmd_submit(a):
    """Add a recipe to recipes/community/: hash it, place it, check it, then open or print a PR (RFC-0013)."""
    import shutil
    src = pathlib.Path(a[0])
    author = a[a.index('--author') + 1] if '--author' in a else None
    open_pr = '--open-pr' in a
    doc = _load(src)
    rid = doc.get('id', '')
    namespaces = json.loads((ROOT / 'recipes' / 'community' / 'NAMESPACES.json').read_text())
    matching = [ns for ns in namespaces['namespaces'] if rid.startswith(ns['prefix'])]
    if not matching:
        prefix_guess = rid.split('-')[0] + '-' if '-' in rid else rid + '-'
        print(f"error: id {rid!r} doesn't match any prefix claimed in recipes/community/NAMESPACES.json.\n"
              f"Add an entry there first, e.g.:\n"
              f'  {{"prefix": "{prefix_guess}", "owner": "<your GitHub login>", "verification": "github_account", "addedAt": "<today>"}}\n'
              f'See docs/CONTRIBUTE-RECIPES.md.')
        return 1
    prefix = max((ns['prefix'] for ns in matching), key=len)
    if author and matching[0]['owner'] != author and not any(ns['owner'] == author for ns in matching):
        print(f"error: prefix {prefix!r} is owned by {matching[0]['owner']!r}, not {author!r}. "
              f'Pick a different id prefix, or ask the owner to submit it.')
        return 1

    doc.pop('hash', None)
    doc['hash'] = ref.doc_hash(doc)
    dest_dir = ROOT / 'recipes' / 'community' / prefix.rstrip('-')
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f'{rid}.cookwala.json'
    dest.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + '\n')
    print(f'wrote {dest.relative_to(ROOT)}  hash {doc["hash"]}')

    problems = _tool('check_community_namespaces.py', ['--author', author] if author else [])
    if problems != 0:
        print('Fix the problems above (or add --author once you know your GitHub login), then run `cookwala submit` again.')
        return problems
    if _tool('validate_specs.py', []) != 0:
        print('`validate_specs.py` found problems above; fix them before opening a pull request.')
        return 1

    branch = f'recipe-{rid}'
    if open_pr and shutil.which('gh') and shutil.which('git'):
        subprocess.call(['git', 'checkout', '-b', branch], cwd=ROOT)
        subprocess.call(['git', 'add', str(dest.relative_to(ROOT)), 'recipes/community/NAMESPACES.json'], cwd=ROOT)
        subprocess.call(['git', 'commit', '-s', '-m', f'recipes: add {rid}'], cwd=ROOT)
        subprocess.call(['git', 'push', '-u', 'origin', branch], cwd=ROOT)
        subprocess.call(['gh', 'pr', 'create', '--title', f'recipes: add {rid}', '--body',
                          f'Adds `{dest.relative_to(ROOT)}` under the `{prefix}` namespace. See docs/CONTRIBUTE-RECIPES.md.',
                          '--template', 'recipe-submission.md'], cwd=ROOT)
        return 0
    print(f'Checks passed. To open a pull request by hand:\n'
          f'  git checkout -b {branch}\n'
          f'  git add {dest.relative_to(ROOT)} recipes/community/NAMESPACES.json\n'
          f'  git commit -s -m "recipes: add {rid}"\n'
          f'  git push -u origin {branch}\n'
          f'Then open a pull request using the "Recipe submission" template.\n'
          f'(Install the gh CLI and pass --open-pr to do this automatically.)')
    return 0


COMMANDS = {'search': cmd_search, 'get': cmd_get, 'hash': cmd_hash, 'verify': cmd_verify, 'dryrun': cmd_dryrun, 'envelope': cmd_envelope, 'convert': cmd_convert, 'sms': cmd_sms, 'constraints': cmd_constraints,
            'validate': cmd_validate, 'conformance': cmd_conformance, 'humanitarian': cmd_humanitarian, 'export': cmd_export, 'init': cmd_init, 'hub': cmd_hub, 'mcp': cmd_mcp, 'submit': cmd_submit}


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if not argv or argv[0] in ('-h', '--help', 'help') or argv[0] not in COMMANDS:
        print(__doc__); return 0 if argv and argv[0] in ('-h', '--help', 'help') else 2
    try:
        return COMMANDS[argv[0]](argv[1:])
    except FileNotFoundError as e:
        print(f'error: {e}'); return 1
    except (IndexError, KeyError) as e:
        print(f'usage error: {e}\n'); print(__doc__); return 2


if __name__ == '__main__':
    sys.exit(main())
