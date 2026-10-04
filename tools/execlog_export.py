"""Export Cookwala execution logs to robot-learning and observability formats.

    python tools/execlog_export.py lerobot RECIPE.json LOG.json OUT_DIR [--lang en]
    python tools/execlog_export.py otel    RECIPE.json LOG.json OUT.json

lerobot  Writes the Cookwala side of a LeRobotDataset episode (v2.1-style tasks.jsonl; v3 parquet is next):
         meta/tasks.jsonl (one natural-language task per recipe step, for task-conditioned
         policies) and meta/cookwala/<log id>.json (recipe ref and hash, per-step segments with
         times, sensor-ladder rung, envelope result and consent). Robot video and actions come
         from the robot's own recorder; this file lets anyone line them up with recipe steps.
otel     Writes OTLP/JSON spans: one trace per execution, one span per step, with
         cookwala.* attributes, for any OpenTelemetry backend (Jaeger, Grafana, LangSmith...).

Both refuse logs whose consent.dataset is "none" unless --local is given: an execution log
leaves the kitchen only with the household's opt-in (docs/CORE.md section 8).
"""
import datetime as dt
import hashlib
import json
import pathlib
import sys


def _t(s): return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))


def step_text(recipe, node, lang):
    text = recipe.get('text', {}).get(lang, {}).get('steps', {})
    if node['id'] in text:
        return text[node['id']]
    op = node['op'].split('.')[-1].replace('_', ' ')
    ins = ', '.join(node.get('inputs', []))
    return f'{op} {ins}'.strip()


def segments(recipe, log):
    nodes = {n['id']: n for n in recipe['process']['nodes']}
    t0 = _t(log['startedAt'])
    out = []
    for s in log['steps']:
        seg = {'node': s['node'], 'op': s['op'], 'verifiedBy': s['verifiedBy'], 'envelopeOk': s['envelopeOk']}
        if s.get('startedAt'): seg['start_s'] = (_t(s['startedAt']) - t0).total_seconds()
        if s.get('endedAt'): seg['end_s'] = (_t(s['endedAt']) - t0).total_seconds()
        if s.get('deviation'): seg['deviation'] = s['deviation']['kind']
        seg['node_def'] = nodes.get(s['node'])
        out.append(seg)
    return out


def to_lerobot(recipe, log, out_dir, lang='en'):
    out = pathlib.Path(out_dir)
    (out / 'meta' / 'cookwala').mkdir(parents=True, exist_ok=True)
    tasks, index = [], {}
    for n in recipe['process']['nodes']:
        t = step_text(recipe, n, lang)
        if t not in index:
            index[t] = len(tasks); tasks.append({'task_index': len(tasks), 'task': t})
    (out / 'meta' / 'tasks.jsonl').write_text(''.join(json.dumps(t, ensure_ascii=False) + '\n' for t in tasks))
    segs = []
    for s in segments(recipe, log):
        node = s.pop('node_def')
        s['task_index'] = index[step_text(recipe, node, lang)] if node else None
        segs.append(s)
    side = {'cookwala': '0.2.0', 'execution': log['id'], 'recipe': log['recipe'], 'recipeHash': log['recipeHash'],
            'device': log['device'], 'outcome': log['outcome'], 'segments': segs, 'consent': log['consent'], 'privacy': log['privacy']}
    (out / 'meta' / 'cookwala' / f"{log['id']}.json").write_text(json.dumps(side, indent=1, ensure_ascii=False) + '\n')
    return len(tasks), len(segs)


def _id(seed, n): return hashlib.sha256(seed.encode()).hexdigest()[:n]


def _attr(k, v):
    if isinstance(v, bool): return {'key': k, 'value': {'boolValue': v}}
    if isinstance(v, (int, float)): return {'key': k, 'value': {'doubleValue': float(v)}}
    return {'key': k, 'value': {'stringValue': str(v)}}


def _ns(s): return str(int(_t(s).timestamp() * 1e9))


def to_otel(recipe, log):
    trace = _id(log['id'], 32); root = _id(log['id'] + ':root', 16)
    spans = [{'traceId': trace, 'spanId': root, 'name': f"cook {recipe.get('dish', {}).get('names', {}).get('en', log['recipe'])}",
              'kind': 1, 'startTimeUnixNano': _ns(log['startedAt']), 'endTimeUnixNano': _ns(log.get('endedAt', log['startedAt'])),
              'attributes': [_attr('cookwala.recipe', log['recipe']), _attr('cookwala.recipe_hash', log['recipeHash']), _attr('cookwala.outcome', log['outcome']),
                             _attr('cookwala.device.model', log['device']['model']), _attr('cookwala.energy_kwh', log.get('energyKwh', 0)),
                             _attr('cookwala.human_interventions', len(log.get('humanInterventions', []))), _attr('cookwala.safety_events', len(log.get('safetyEvents', [])))],
              'status': {'code': 1 if log['outcome'] in ('served', 'partial') else 2}}]
    for s in log['steps']:
        start = s.get('startedAt', log['startedAt']); end = s.get('endedAt', start)
        spans.append({'traceId': trace, 'spanId': _id(log['id'] + s['node'], 16), 'parentSpanId': root, 'name': s['op'], 'kind': 1,
                      'startTimeUnixNano': _ns(start), 'endTimeUnixNano': _ns(end),
                      'attributes': [_attr('cookwala.node', s['node']), _attr('cookwala.verified_by', s['verifiedBy']), _attr('cookwala.envelope_ok', s['envelopeOk'])]
                      + ([_attr('cookwala.deviation', s['deviation']['kind'])] if s.get('deviation') else []),
                      'status': {'code': 1 if s['envelopeOk'] else 2}})
    for e in log.get('safetyEvents', []):
        spans[0].setdefault('events', []).append({'timeUnixNano': _ns(e['at']), 'name': 'cookwala.safety.limit_fired', 'attributes': [_attr('limit', e['limit']), _attr('action', e['action'])]})
    return {'resourceSpans': [{'resource': {'attributes': [_attr('service.name', 'cookwala-executor'), _attr('cookwala.core', log['core'])]},
                               'scopeSpans': [{'scope': {'name': 'cookwala', 'version': '0.2.0'}, 'spans': spans}]}]}


def main(argv):
    if len(argv) < 5:
        print(__doc__); return 2
    cmd, recipe, log = argv[1], json.loads(pathlib.Path(argv[2]).read_text()), json.loads(pathlib.Path(argv[3]).read_text())
    if log['consent']['dataset'] == 'none' and '--local' not in argv:
        print('refused: this log has consent.dataset = none (use --local only for on-device analysis)'); return 1
    if cmd == 'lerobot':
        lang = argv[argv.index('--lang') + 1] if '--lang' in argv else 'en'
        n_tasks, n_segs = to_lerobot(recipe, log, argv[4], lang)
        print(f'{n_tasks} tasks, {n_segs} segments -> {argv[4]}/meta'); return 0
    if cmd == 'otel':
        pathlib.Path(argv[4]).write_text(json.dumps(to_otel(recipe, log), indent=1) + '\n')
        print(f'OTLP/JSON trace -> {argv[4]}'); return 0
    print(__doc__); return 2


if __name__ == '__main__':
    sys.exit(main(sys.argv))
