"""Reference checker for the Cookwala Humanitarian Profile.

Validates documents against schemas/humanitarian.schema.json and applies a rule pack to offers,
handovers and distributions, printing which rules pass, warn or block. Also exposes the offer
state machine. Usage:

    python tools/humanitarian_check.py [--pack profiles/humanitarian/who-codex-basic.rulepack.json] FILE...
"""
import argparse
import datetime as dt
import json
import pathlib
import sys

from jsonschema import Draft202012Validator, FormatChecker

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT / 'schemas' / 'humanitarian.schema.json').read_text())
DEFAULT_PACK = ROOT / 'profiles' / 'humanitarian' / 'who-codex-basic.rulepack.json'

# Offer state machine (docs/HUMANITARIAN-PROFILE.md section 5). Anything else is refused.
TRANSITIONS = {
    'offered': {'claimed', 'expired', 'withdrawn'},
    'claimed': {'collected', 'offered', 'expired', 'withdrawn'},  # back to offered if the claim lapses
    'collected': {'delivered', 'rejected'},
    'delivered': {'distributed', 'rejected'},
    'distributed': set(), 'expired': set(), 'withdrawn': set(), 'rejected': set(),
}
KCAL_PER_G = {'fatG': 9, 'saturatedFatG': 9, 'transFatG': 9, 'proteinG': 4, 'freeSugarsG': 4}


def can_transition(a, b):
    return b in TRANSITIONS.get(a, set())


def validator(kind):
    return Draft202012Validator({'$ref': f'#/$defs/{kind}', '$defs': SCHEMA['$defs']}, format_checker=FormatChecker())


def parse_time(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))


def temperature_findings(doc, pack):
    """Item temperature, cooked-time, date-mark and allergen rules for an Offer or Handover."""
    out = []
    items = {i.get('lineId'): i for i in doc.get('items', [])}
    when = parse_time(doc.get('at') or doc.get('window', {}).get('from'))
    readings = {r.get('lineId'): r for r in doc.get('readings', []) if r.get('method') != 'not_measured'}
    for rule in pack['rules']:
        k, chk = rule['kind'], rule['check']
        for line_id, item in items.items():
            applies = rule['applies'] == 'item_any' or rule['applies'] == f"item_{item['storage']}" or (rule['applies'] == 'item_cooked' and item.get('cooked'))
            if not applies:
                continue
            if k == 'temperature' and line_id in readings:
                t = readings[line_id]['tempC']
                if ('max' in chk and t > chk['max']) or ('min' in chk and t < chk['min']):
                    out.append((rule, f'line {line_id}: {t} °C'))
            if k == 'time' and item.get('cookedAt') and item['storage'] not in ('hot_held', 'chilled', 'frozen'):
                hours = (when - parse_time(item['cookedAt'])).total_seconds() / 3600
                if hours > chk['max']:
                    out.append((rule, f'line {line_id}: {hours:.1f} h since cooking without temperature control'))
            if k == 'date_mark' and item.get('dateMark', {}).get('kind') == chk['dateKind']:
                if dt.date.fromisoformat(item['dateMark']['date']) < when.date():
                    out.append((rule, f"line {line_id}: {chk['dateKind']} {item['dateMark']['date']}"))
            if k == 'allergen' and 'unknown' in item.get('allergens', []):
                out.append((rule, f'line {line_id}: allergens not declared'))
    return out


def menu_findings(doc, pack):
    out = []
    menu = doc.get('menu', {})
    for rule in pack['rules']:
        scope = {'menu_per_person_day': 'perPersonDay', 'menu_per_meal': 'perMeal'}.get(rule['applies'])
        if not scope or scope not in menu:
            continue
        n = menu[scope]; chk = rule['check']; name = chk.get('nutrient')
        if name not in n:
            continue
        if chk['unit'] == 'pct_energy':
            if not n.get('energyKcal'):
                continue
            v = n[name] * KCAL_PER_G[name] / n['energyKcal'] * 100; shown = f'{v:.1f} % of energy'
        else:
            v = n[name]; shown = f"{v:g} {chk['unit']}"
        if ('max' in chk and v > chk['max']) or ('min' in chk and v < chk['min']):
            out.append((rule, f'{scope}: {shown}'))
    return out


def check_file(path, pack):
    doc = json.loads(pathlib.Path(path).read_text())
    kind = doc.get('kind')
    if kind not in ('Offer', 'Claim', 'Handover', 'Distribution', 'RulePack', 'Manifest'):
        print(f'{path}: unknown kind {kind!r}'); return 1
    errors = list(validator(kind).iter_errors(doc))
    for e in errors[:20]:
        print(f'  {path} {list(e.path)}: {e.message[:160]}')
    status = 'schema ok' if not errors else f'{len(errors)} schema errors'
    findings = []
    if kind in ('Offer', 'Handover'):
        if kind == 'Handover':  # a handover's lines refer to the offer's items; checks need the item details
            offer_path = pathlib.Path(path).with_name('offer.json')
            if offer_path.exists():
                doc = {**doc, 'items': json.loads(offer_path.read_text())['items']}
        findings = temperature_findings(doc, pack)
    if kind == 'Distribution':
        findings = menu_findings(doc, pack)
    blocks = [f for f in findings if f[0]['severity'] == 'block']
    print(f'{path}: {kind}, {status}, {len(blocks)} block, {len(findings) - len(blocks)} warn')
    for rule, detail in findings:
        print(f"  {rule['severity'].upper():5} {rule['id']}: {detail}. {rule['message']}")
    declared = set(doc.get('findings', []))
    computed = {r['id'] for r, _ in findings}
    if declared and declared != computed:
        print(f'  NOTE declared findings {sorted(declared)} differ from computed {sorted(computed)}')
    return 1 if errors else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--pack', default=str(DEFAULT_PACK))
    ap.add_argument('files', nargs='+')
    args = ap.parse_args()
    pack = json.loads(pathlib.Path(args.pack).read_text())
    failures = 0 if not list(validator('RulePack').iter_errors(pack)) else 1
    failures += sum(check_file(f, pack) for f in args.files)
    assert can_transition('offered', 'claimed') and not can_transition('distributed', 'offered')
    sys.exit(1 if failures else 0)


if __name__ == '__main__':
    main()
