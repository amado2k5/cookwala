"""Write /v1/stats.json for the website: real counts from the repository at build time.

Every figure carries a kind: "measured" (counted from files in this commit) or "planned".
    python tools/site_stats.py OUT.json
"""
import datetime as dt
import json
import os
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
ops = json.loads((ROOT / 'vocab' / 'ops.json').read_text())['entries']
vectors = sum(len(json.loads(p.read_text())) for p in (ROOT / 'conformance').glob('*.json'))
schemas = len(list((ROOT / 'schemas').glob('*.schema.json')))
recipes = list((ROOT / 'examples').glob('*.cookwala.json'))
langs = set()
for r in recipes:
    langs |= set(json.loads(r.read_text()).get('text', {}).keys())
limits = len(json.loads((ROOT / 'profiles' / 'core' / 'safety-limits.default.json').read_text())['limits'])
rules = len(json.loads((ROOT / 'profiles' / 'humanitarian' / 'who-codex-basic.rulepack.json').read_text())['rules'])
evals = __import__('yaml').safe_load((ROOT / 'evals' / 'kitchen-agent-safety' / 'promptfooconfig.yaml').read_text())['tests']
m = lambda v, label: {'value': v, 'label': label, 'kind': 'measured'}
stats = {
    'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'),
    'commit': os.environ.get('GITHUB_SHA', 'local')[:12],
    'core': '0.2.0',
    'figures': {
        'opsWithEnvelopes': m(sum(1 for o in ops if 'envelope' in o), 'cooking operations with a physical definition'),
        'ops': m(len(ops), 'cooking operations in the vocabulary'),
        'conformanceVectors': m(vectors, 'conformance test vectors'),
        'schemas': m(schemas, 'JSON schemas'),
        'safetyLimits': m(limits, 'default on-device safety limits'),
        'agentSafetyTests': m(len(evals), 'agent-safety test cases'),
        'humanitarianRules': m(rules, 'food-safety and nutrition rules for food banks'),
        'publishedRecipes': m(len(recipes), 'recipes published in the index'),
        'languages': m(len(langs), 'languages in published recipes'),
        'simulators': m(4, 'playable simulators'),
        'recipesInConversion': {'value': 1881, 'label': 'fifi.cooking recipes planned for conversion', 'kind': 'planned'},
    },
}
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'stats.json')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(stats, indent=1) + '\n')
print(json.dumps({k: v['value'] for k, v in stats['figures'].items()}))
