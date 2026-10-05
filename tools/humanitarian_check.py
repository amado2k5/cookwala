"""Reference checker for the Cookwala Humanitarian Profile.

Validates documents against schemas/humanitarian.schema.json and applies a rule pack to offers,
handovers and distributions, printing which rules pass, warn or block. Also exposes the offer
state machine. Usage:

    python tools/humanitarian_check.py [--pack PACK.json ...] FILE...
    python tools/humanitarian_check.py --summary DIR --org did:web:... --from 2026-11-01 --to 2026-11-30 [--out summary.json]

--pack may be given several times (0.2: care-vulnerable-groups, school-meals-basic, sodium-reduction extend basic-nutrition-food-safety).
--summary computes an ImpactSummary (RFC-0003) from every Offer, Claim, Handover and Distribution in DIR.
"""
import argparse
import datetime as dt
import json
import pathlib
import sys

from jsonschema import Draft202012Validator, FormatChecker

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT / 'schemas' / 'humanitarian.schema.json').read_text())
DEFAULT_PACK = ROOT / 'profiles' / 'humanitarian' / 'basic-nutrition-food-safety.rulepack.json'

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
            if k == 'food_class' and chk.get('foodClass') in item.get('foodClasses', []) and rule_applies_to_audience(rule, doc.get('audienceGroups')):
                out.append((rule, f"line {line_id}: contains {chk['foodClass']}"))
    return out


def rule_applies_to_audience(rule, audience_groups):
    """A rule with an audienceGroup applies when the distribution serves that group (or the rule is for all)."""
    group = rule.get('audienceGroup', 'all')
    if group == 'all':
        return True
    return group in (audience_groups or [])


def menu_findings(doc, pack):
    out = []
    menu = doc.get('menu', {})
    for rule in pack['rules']:
        if not rule_applies_to_audience(rule, doc.get('audienceGroups')):
            continue
        if rule['kind'] == 'food_class' and rule['check'].get('foodClass') in menu.get('foodClasses', []):
            out.append((rule, f"menu contains {rule['check']['foodClass']}")); continue
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
    if kind not in ('Offer', 'Claim', 'Handover', 'Distribution', 'RulePack', 'Manifest', 'ImpactSummary'):
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


def merge_packs(paths):
    """Several packs act as one; later packs extend earlier ones (RFC-0004 'extends')."""
    rules, ids = [], set()
    for path in paths:
        pack = json.loads(pathlib.Path(path).read_text())
        errs = list(validator('RulePack').iter_errors(pack))
        for e in errs[:10]:
            print(f'  {path} {list(e.path)}: {e.message[:160]}')
        if errs:
            raise SystemExit(f'{path}: invalid rule pack')
        if pack.get('status') == 'reviewed' and not any(r.get('outcome', '').startswith('approved') for r in pack.get('reviews', [])):
            raise SystemExit(f"{path}: status 'reviewed' needs at least one approved review")
        for r in pack['rules']:
            if r['id'] not in ids:
                rules.append(r); ids.add(r['id'])
    return {'rules': rules}


def summarize(folder, org, start, end, pack_ids):
    """Compute an ImpactSummary from the documents in a folder. Every measure says how it was obtained."""
    docs = [json.loads(p.read_text()) for p in sorted(pathlib.Path(folder).rglob('*.json'))]
    by = lambda k: [d for d in docs if d.get('kind') == k]
    offers, claims, handovers, dists = by('Offer'), by('Claim'), by('Handover'), by('Distribution')
    in_period = lambda s: start <= s[:10] <= end
    handovers = [h for h in handovers if in_period(h['at'])]
    dists = [d for d in dists if in_period(d['date'])]
    first_leg = [h for h in handovers if h.get('leg', 1) == 1]
    kg_rescued = sum(l.get('kgAccepted', 0) for h in first_leg for l in h['lines'])
    kg_rejected = sum(l.get('kgRejected', 0) for h in handovers for l in h['lines'])
    meals = sum(d.get('meals', 0) for d in dists)
    people_vals = [d.get('people', {}).get('total') for d in dists]
    people = None if not people_vals else (sum(v for v in people_vals if isinstance(v, int)) if all(isinstance(v, int) for v in people_vals) else '<10' if all(v == '<10' for v in people_vals) else sum(v for v in people_vals if isinstance(v, int)))
    with_menu = [d for d in dists if d.get('menu')]
    nutrition_pass = None if not with_menu else round(sum(1 for d in with_menu if not any(f.startswith('nutrition.') or f.startswith('school.') or f.startswith('sodium.') for f in d.get('findings', []))) / len(with_menu), 3)
    costs = [(sum(float(v['amount']) for v in d.get('cost', {}).values()), d.get('meals', 0), next(iter(d.get('cost', {}).values()), {}).get('currency')) for d in dists if d.get('cost') and d.get('meals')]
    cost_per_meal = None if not costs else round(sum(c for c, _, _ in costs) / sum(m for _, m, _ in costs), 2)
    currency = costs[0][2] if costs else None
    claim_times = []
    for c in claims:
        o = next((o for o in offers if o['id'] == c['offer']), None)
        if o and o.get('createdAt') and c.get('claimedAt'):
            claim_times.append((parse_time(c['claimedAt']) - parse_time(o['createdAt'])).total_seconds() / 60)
    claim_times.sort()
    ttc = None if not claim_times else claim_times[len(claim_times) // 2]
    claim_rate = None if not offers else round(len({c['offer'] for c in claims}) / len(offers), 3)
    blocks = sum(1 for h in handovers for f in h.get('findings', []) if f.startswith('safety.') or f.startswith('care.'))
    incidents = sum(d.get('safetyIncidents', 0) for d in dists)
    vol = sum(d.get('volunteerMinutes', 0) for d in dists); kg_used = sum(d.get('kgUsed', 0) for d in dists)
    M = lambda v, unit, method, source, n=None: {'value': v, **({'unit': unit} if unit else {}), 'method': method if v is not None else 'not_recorded', 'source': source, **({'n': n} if n is not None else {})}
    return {
        'profile': '0.2.0', 'kind': 'ImpactSummary', 'id': f'impact-{org.split(":")[-1]}-{start}-{end}'.lower().replace('.', '-'), 'org': org,
        'period': {'from': start, 'to': end},
        'measures': {
            'kgRescued': M(round(kg_rescued, 1), 'kg', 'measured', 'sum of Handover.lines.kgAccepted', len(handovers)),
            'kgRejected': M(round(kg_rejected, 1), 'kg', 'measured', 'sum of Handover.lines.kgRejected', len(handovers)),
            'mealsServed': M(meals, 'meals', 'measured', 'sum of Distribution.meals', len(dists)),
            'peopleReached': M(people, 'people', 'measured', 'sum of Distribution.people.total; <10 suppressed', len(dists)),
            'nutritionPassRate': M(nutrition_pass, 'ratio', 'measured', 'distributions with a menu and no nutrition findings / distributions with a menu', len(with_menu)),
            'costPerMeal': M(cost_per_meal, currency, 'measured', 'sum of Distribution.cost / sum of meals, where both exist', len(costs)),
            'timeToClaimMinutesMedian': M(ttc, 'min', 'measured', 'median of Claim.claimedAt - Offer.createdAt', len(claim_times)),
            'claimRate': M(claim_rate, 'ratio', 'measured', 'offers with a claim / offers', len(offers)),
            'safetyBlockFindings': M(blocks, 'findings', 'measured', 'safety.* and care.* findings on handovers', len(handovers)),
            'safetyIncidents': M(incidents, 'incidents', 'measured', 'sum of Distribution.safetyIncidents', len(dists)),
            'volunteerMinutesPer100Kg': M(None if not kg_used else round(vol / (kg_used / 100), 1), 'min', 'measured', 'volunteerMinutes / (kgUsed / 100)', len(dists)),
        },
        'documents': {'offers': len(offers), 'claims': len(claims), 'handovers': len(handovers), 'distributions': len(dists)},
        'whatWentWrong': [f'{kg_rejected:.0f} kg rejected at handover' if kg_rejected else 'nothing recorded yet'] + ([f'{incidents} safety incident(s) recorded'] if incidents else []),
        'unknowns': ['Cost excludes volunteer time.', 'Nutrition pass rate covers only distributions that recorded a menu.'] + (['No claim timestamps: time to claim not computable.'] if ttc is None else []),
        'rulePack': ', '.join(pack_ids),
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--pack', action='append', default=None)
    ap.add_argument('--summary', help='folder of documents to summarize into an ImpactSummary')
    ap.add_argument('--org', default='did:web:example.org')
    ap.add_argument('--from', dest='start', default='0000-01-01')
    ap.add_argument('--to', dest='end', default='9999-12-31')
    ap.add_argument('--out')
    ap.add_argument('files', nargs='*')
    args = ap.parse_args()
    pack_paths = args.pack or [str(DEFAULT_PACK)]
    pack = merge_packs(pack_paths)
    pack_ids = [f"{json.loads(pathlib.Path(p).read_text())['id']}@{json.loads(pathlib.Path(p).read_text())['version']}" for p in pack_paths]
    failures = 0
    if args.summary:
        summary = summarize(args.summary, args.org, args.start, args.end, pack_ids)
        errs = list(validator('ImpactSummary').iter_errors(summary))
        for e in errs[:10]:
            print(f'  summary {list(e.path)}: {e.message[:160]}')
        failures += len(errs)
        text = json.dumps(summary, indent=1, ensure_ascii=False) + '\n'
        if args.out:
            pathlib.Path(args.out).write_text(text); print(f'ImpactSummary -> {args.out}')
        else:
            print(text)
    failures += sum(check_file(f, pack) for f in args.files)
    assert can_transition('offered', 'claimed') and not can_transition('distributed', 'offered')
    sys.exit(1 if failures else 0)


if __name__ == '__main__':
    main()
