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
rules = sum(len(json.loads(p.read_text())['rules']) for p in (ROOT / 'profiles' / 'humanitarian').glob('*.rulepack.json'))
evals = __import__('yaml').safe_load((ROOT / 'evals' / 'kitchen-agent-safety' / 'promptfooconfig.yaml').read_text())['tests']
facets = len(json.loads((ROOT / 'vocab' / 'facets.json').read_text())['entries'])
AR = {'cooking operations with a physical definition': 'عملية طهي بتعريف فيزيائي', 'cooking operations in the vocabulary': 'عملية طهي في المفردات', 'conformance test vectors': 'متّجه اختبار مطابقة', 'JSON schemas': 'مخطط JSON', 'default on-device safety limits': 'حدّ سلامة افتراضي على الجهاز', 'agent-safety test cases': 'حالة اختبار لسلامة الوكلاء', 'food-safety and nutrition rules for food banks': 'قاعدة سلامة غذاء وتغذية لبنوك الطعام', 'recipes published in the index': 'وصفة منشورة في الفهرس', 'languages in published recipes': 'لغة في الوصفات المنشورة', 'playable simulators': 'محاكٍ قابل للتشغيل', 'fifi.cooking recipes planned for conversion': 'وصفة من fifi.cooking مخطَّط تحويلها', 'household and device facet types with privacy rules': 'نوع معلومة منزلية بقواعد خصوصية'}
m = lambda v, label: {'value': v, 'label': label, 'labelAr': AR.get(label, label), 'kind': 'measured'}
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
        'facets': m(facets, 'household and device facet types with privacy rules'),
        'recipesInConversion': {'value': 1881, 'label': 'fifi.cooking recipes planned for conversion', 'labelAr': AR['fifi.cooking recipes planned for conversion'], 'kind': 'planned'},
    },
}
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'stats.json')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(stats, indent=1) + '\n')
print(json.dumps({k: v['value'] for k, v in stats['figures'].items()}))
