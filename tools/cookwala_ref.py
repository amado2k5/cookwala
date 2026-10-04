"""Cookwala reference library (Core 0.2).

Small, dependency-light reference implementations that the conformance suite (conformance/)
checks and that other implementations can compare against:

- canonical JSON (RFC 8785 JCS) and document hashes
- Ed25519 signatures over document hashes, key records with validity and revocation
- selective disclosure digests
- Mission event-log chains, checkpoints, and replay to a projected state
- unit conversion (vocab/units.json) and operation-envelope checks (vocab/ops.json)
- execution and Mission state machines

Signing needs the `cryptography` package; everything else is standard library.

CLI:
    python tools/cookwala_ref.py hash FILE
    python tools/cookwala_ref.py verify FILE --keys KEYS.json
    python tools/cookwala_ref.py chain EVENTS.json [--keys KEYS.json]
    python tools/cookwala_ref.py dryrun RECIPE.json --device CAPABILITIES.json [--human-present] [--no-model]
"""
import base64
import datetime as dt
import hashlib
import json
import math
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]

# ---------------------------------------------------------------- canonical JSON (RFC 8785)


def _num(x):
    if isinstance(x, bool):
        raise TypeError('bool is not a number')
    if isinstance(x, int):
        return str(x)
    if not math.isfinite(x):
        raise ValueError('JCS forbids NaN and Infinity')
    if x == 0:
        return '0'
    if x.is_integer() and abs(x) < 1e21:
        return str(int(x))
    r = repr(x)  # shortest round-trip, like ECMAScript Number.prototype.toString
    if 'e' in r:
        mant, exp = r.split('e')
        sign = '-' if exp.startswith('-') else '+'
        r = f"{mant}e{sign}{int(exp.lstrip('+-'))}"
    return r


def _str(s):
    out = ['"']
    for ch in s:
        o = ord(ch)
        if ch == '"': out.append('\\"')
        elif ch == '\\': out.append('\\\\')
        elif ch == '\b': out.append('\\b')
        elif ch == '\f': out.append('\\f')
        elif ch == '\n': out.append('\\n')
        elif ch == '\r': out.append('\\r')
        elif ch == '\t': out.append('\\t')
        elif o < 0x20: out.append(f'\\u{o:04x}')
        else: out.append(ch)
    out.append('"')
    return ''.join(out)


def canonical(value):
    """RFC 8785 canonical JSON text."""
    if value is None: return 'null'
    if value is True: return 'true'
    if value is False: return 'false'
    if isinstance(value, (int, float)): return _num(value)
    if isinstance(value, str): return _str(value)
    if isinstance(value, (list, tuple)): return '[' + ','.join(canonical(v) for v in value) + ']'
    if isinstance(value, dict):
        keys = sorted(value, key=lambda k: k.encode('utf-16-be'))  # sort by UTF-16 code units
        return '{' + ','.join(_str(k) + ':' + canonical(value[k]) for k in keys) + '}'
    raise TypeError(f'not JSON: {type(value)}')


def doc_hash(doc, exclude=('hash', 'signature')):
    """sha256:<hex> of the canonical JSON of doc without the excluded top-level fields."""
    body = {k: v for k, v in doc.items() if k not in exclude} if isinstance(doc, dict) else doc
    return 'sha256:' + hashlib.sha256(canonical(body).encode('utf-8')).hexdigest()

# ---------------------------------------------------------------- signatures and keys


def b64u(b): return base64.urlsafe_b64encode(b).rstrip(b'=').decode()
def unb64u(s): return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))


def _ed():
    from cryptography.hazmat.primitives.asymmetric import ed25519
    return ed25519


def public_key_from_seed(seed_hex):
    from cryptography.hazmat.primitives import serialization
    sk = _ed().Ed25519PrivateKey.from_private_bytes(bytes.fromhex(seed_hex))
    return b64u(sk.public_key().public_bytes(serialization.Encoding.Raw, serialization.PublicFormat.Raw))


def sign(doc, seed_hex, kid, signed_at=None):
    """Return a Signature object over doc_hash(doc). Ed25519 is deterministic, so vectors are reproducible."""
    sk = _ed().Ed25519PrivateKey.from_private_bytes(bytes.fromhex(seed_hex))
    sig = {'alg': 'EdDSA', 'kid': kid, 'sig': b64u(sk.sign(doc_hash(doc).encode('ascii')))}
    if signed_at: sig['signedAt'] = signed_at
    return sig


def _time(s): return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))


def verify(doc, keys, now=None):
    """Verify doc['signature'] against a list of KeyRecords. Returns (ok, reason)."""
    sig = doc.get('signature')
    if not sig: return False, 'unsigned'
    rec = next((k for k in keys if k['kid'] == sig['kid']), None)
    if not rec: return False, 'unknown_key'
    if rec['alg'] != sig['alg']: return False, 'alg_mismatch'
    when = _time(sig['signedAt']) if sig.get('signedAt') else (now or dt.datetime.now(dt.timezone.utc))
    if when < _time(rec['validFrom']) or (rec.get('validTo') and when > _time(rec['validTo'])): return False, 'key_not_valid_at_signing_time'
    if rec.get('revokedAt') and when >= _time(rec['revokedAt']): return False, 'key_revoked'
    if sig['alg'] != 'EdDSA': return False, 'alg_not_supported_by_reference'
    pk = _ed().Ed25519PublicKey.from_public_bytes(unb64u(rec['publicKey']))
    try:
        pk.verify(unb64u(sig['sig']), doc_hash(doc).encode('ascii'))
        return True, 'ok'
    except Exception:
        return False, 'bad_signature'

# ---------------------------------------------------------------- selective disclosure


def disclosure_digest(salt, value):
    return 'sha256:' + hashlib.sha256(canonical([salt, value]).encode('utf-8')).hexdigest()


def verify_disclosure(d):
    return 'salt' in d and 'value' in d and disclosure_digest(d['salt'], d['value']) == d['digest']

# ---------------------------------------------------------------- Mission event log


def event_hash(ev): return doc_hash(ev, exclude=('hash', 'signature', 'proposedBy'))


def verify_chain(events, keys=None):
    """Check seq order, prev links, hashes and (optionally) signatures. Returns (ok, reason, head)."""
    prev = 'genesis'
    for i, ev in enumerate(events):
        if ev['seq'] != i: return False, f'seq_gap_at_{i}', None
        if ev['prev'] != prev: return False, f'broken_link_at_{i}', None
        if event_hash(ev) != ev['hash']: return False, f'hash_mismatch_at_{i}', None
        if keys is not None and ev.get('signature'):
            ok, why = _verify_hash(ev, ev['hash'], keys)  # events are signed over their own hash
            if not ok: return False, f'{why}_at_{i}', None
        prev = ev['hash']
    return True, 'ok', prev


def _verify_hash(doc, h, keys):
    sig = doc.get('signature')
    rec = next((k for k in keys if k['kid'] == sig['kid']), None)
    if not rec: return False, 'unknown_key'
    if rec.get('revokedAt') and sig.get('signedAt') and _time(sig['signedAt']) >= _time(rec['revokedAt']): return False, 'key_revoked'
    try:
        _ed().Ed25519PublicKey.from_public_bytes(unb64u(rec['publicKey'])).verify(unb64u(sig['sig']), h.encode('ascii'))
        return True, 'ok'
    except Exception:
        return False, 'bad_signature'


def sign_event(ev, seed_hex, kid, signed_at=None):
    ev = dict(ev)
    ev['hash'] = event_hash(ev)
    sk = _ed().Ed25519PrivateKey.from_private_bytes(bytes.fromhex(seed_hex))
    ev['signature'] = {'alg': 'EdDSA', 'kid': kid, 'sig': b64u(sk.sign(ev['hash'].encode('ascii')))}
    if signed_at: ev['signature']['signedAt'] = signed_at
    return ev


def verify_checkpoint(cp, events, keys):
    """A checkpoint is valid if its head matches the event at cp.seq and every signature verifies over the checkpoint hash."""
    if cp['seq'] >= len(events) or events[cp['seq']]['hash'] != cp['head']: return False, 'head_mismatch'
    h = doc_hash(cp, exclude=('signature', 'witnesses'))
    ok, why = _verify_hash(cp, h, keys)
    if not ok: return False, 'sequencer_' + why
    for w in cp.get('witnesses', []):
        ok, why = _verify_hash(w, h, keys)
        if not ok: return False, 'witness_' + why
    return True, 'ok'


def load_transitions():
    t = json.loads((ROOT / 'profiles' / 'mission' / 'transitions.json').read_text())
    return t, {(x['from'], x['to']): x['allowedRoles'] for x in t['transitions']}


def mission_transition_allowed(frm, to, role):
    _, table = load_transitions()
    roles = table.get((frm, to))
    return roles is not None and role in roles


def replay_mission(events, roles):
    """Replay a verified event log into a projected state. roles maps actor -> role. Raises on illegal transitions."""
    t, table = load_transitions()
    state = t['initial']; history = []
    for ev in events:
        if ev['type'] == 'state_changed':
            frm, to = ev['transition']['from'], ev['transition']['to']
            if frm != state: raise ValueError(f'event {ev["seq"]}: from {frm} but state is {state}')
            if not mission_transition_allowed(frm, to, roles.get(ev['actor'], 'unknown')): raise ValueError(f'event {ev["seq"]}: {frm} -> {to} not allowed for {roles.get(ev["actor"])}')
            state = to; history.append((ev['seq'], to))
    return {'state': state, 'history': history, 'headSeq': events[-1]['seq'] if events else None}

# ---------------------------------------------------------------- executions

EXEC = {'accepted': {'preparing', 'refused', 'stopped'}, 'preparing': {'running', 'needs_human', 'stopping', 'failed'},
        'running': {'paused', 'needs_human', 'stopping', 'completed', 'failed'}, 'paused': {'running', 'stopping'},
        'needs_human': {'running', 'stopping', 'failed'}, 'stopping': {'stopped'},
        'refused': set(), 'stopped': set(), 'completed': set(), 'failed': set()}


def execution_transition_allowed(frm, to): return to in EXEC.get(frm, set())

# ---------------------------------------------------------------- units and envelopes


def _vocab(name): return {e['id']: e for e in json.loads((ROOT / 'vocab' / f'{name}.json').read_text())['entries']}


def convert(value, unit, to, density_g_per_ml=None):
    """Convert kitchen quantities. Volume<->mass needs a density (g/ml)."""
    units = _vocab('units')
    def base(v, u):
        e = units.get(f'cw.unit.{u}')
        return (v * e['convert']['factor'], e['convert']['to']) if e else (v, u)
    v, b = base(value, unit)
    tf, tb = base(1, to)
    if b == tb: return v / tf
    if density_g_per_ml is None: raise ValueError('volume<->mass conversion needs a density')
    if b == 'ml' and tb == 'g': return v * density_g_per_ml / tf
    if b == 'g' and tb == 'ml': return v / density_g_per_ml / tf
    raise ValueError(f'cannot convert {unit} to {to}')


def check_envelope(op_id, readings, target=None, altitude_m=0):
    """Check a medium-temperature trace against an op envelope and an optional recipe target.

    readings: [{'t': seconds, 'tempC': value}]; target: {'value': degC, 'tolerance': absolute degC}.
    Returns {'envelopeOk': bool, 'targetOk': bool|None, 'reason': str}.
    A recipe target outside the envelope is invalid regardless of readings.
    Boiling-point bands shift by -1 degC per 300 m of altitude (water media only).
    """
    op = _vocab('ops')[op_id]
    env = op.get('envelope')
    if not env or 'tempC' not in env: return {'envelopeOk': True, 'targetOk': None, 'reason': 'no_thermal_envelope'}
    lo, hi = env['tempC']['min'], env['tempC']['max']
    if env['medium'] in ('water', 'steam'):
        shift = altitude_m / 300.0
        lo, hi = lo - shift, hi - shift
    if target is not None:
        tv, tol = target['value'], target.get('tolerance', 0)
        if tv < lo or tv > hi: return {'envelopeOk': False, 'targetOk': False, 'reason': 'target_outside_envelope'}
    temps = [r['tempC'] for r in readings]
    # allow the warm-up: readings before the medium first enters the band are not violations
    try:
        first_in = next(i for i, t in enumerate(temps) if lo <= t <= hi)
    except StopIteration:
        return {'envelopeOk': False, 'targetOk': False if target else None, 'reason': 'never_reached_envelope'}
    steady = temps[first_in:]
    env_ok = all(lo <= t <= hi for t in steady)
    tgt_ok = None
    if target is not None:  # the target band, once reached, must hold for the rest of the step
        tol = target.get('tolerance', 0)
        hits = [i for i, t in enumerate(steady) if abs(t - target['value']) <= tol]
        tgt_ok = bool(hits) and all(abs(t - target['value']) <= tol for t in steady[hits[0]:])
    reason = 'ok' if env_ok and tgt_ok in (None, True) else ('left_envelope' if not env_ok else 'missed_target')
    return {'envelopeOk': env_ok, 'targetOk': tgt_ok, 'reason': reason}


def ladder_choice(op_id, available_sensors, allow_model=True, human_present=False):
    """First rung of the op's sensor ladder this executor can satisfy, or None (the step must be refused)."""
    env = _vocab('ops')[op_id].get('envelope', {})
    for rung in env.get('sensorLadder', ['time']):
        if rung == 'model' and allow_model: return 'model'
        if rung == 'time': return 'time'
        if rung == 'human' and human_present: return 'human'
        if rung in available_sensors: return rung
    return None

# ---------------------------------------------------------------- dry run


def dry_run(recipe, capabilities, human_present=False, allow_model=True):
    """Decide, before cooking, whether a device can run every step of a recipe.

    Returns an ExecutionStatus-like dict: state accepted (with the sensor-ladder rung chosen per
    step) or refused (with the first blocking reason). Nothing is executed.
    """
    caps = capabilities.get('capabilities', {})
    ops = {o['op'] for o in caps.get('ops', [])}
    sensors = {s['sensor'] for s in caps.get('sensors', [])}
    for s in caps.get('sensors', []):
        sensors.update(s.get('visionCues', []))
    vocab = _vocab('ops')
    plan = []
    for node in recipe.get('process', {}).get('nodes', []):
        op = node['op']
        assign = node.get('assignment', {}).get('allowed', ['any'])
        if op not in ops:
            if human_present and ('human' in assign or 'any' in assign):
                plan.append({'node': node['id'], 'op': op, 'by': 'human', 'verifiedBy': 'human'}); continue
            return {'state': 'refused', 'refusal': {'reason': 'missing_capability', 'node': node['id'], 'detail': f'device cannot perform {op} and no person is present to do it'}, 'plan': plan}
        env = vocab.get(op, {}).get('envelope', {})
        if env and not env.get('unattended', True) and not human_present:
            return {'state': 'refused', 'refusal': {'reason': 'needs_human_present', 'node': node['id'], 'detail': f'{op} may not run unattended'}, 'plan': plan}
        rung = ladder_choice(op, sensors, allow_model, human_present) if env else 'time'
        if rung is None:
            return {'state': 'refused', 'refusal': {'reason': 'missing_sensor_no_fallback', 'node': node['id'], 'detail': f'no way to verify {op} on this device'}, 'plan': plan}
        plan.append({'node': node['id'], 'op': op, 'by': 'device', 'verifiedBy': 'sensor' if rung.startswith(('cw.', 'x-')) else rung, 'rung': rung})
    return {'state': 'accepted', 'plan': plan}


# ---------------------------------------------------------------- CLI


def main(argv):
    if len(argv) < 3:
        print(__doc__); return 2
    cmd, path = argv[1], pathlib.Path(argv[2])
    doc = json.loads(path.read_text())
    keys = []
    if '--keys' in argv: keys = json.loads(pathlib.Path(argv[argv.index('--keys') + 1]).read_text())
    if cmd == 'hash':
        print(doc_hash(doc)); return 0
    if cmd == 'verify':
        ok, why = verify(doc, keys); print(why); return 0 if ok else 1
    if cmd == 'dryrun':
        dev = json.loads(pathlib.Path(argv[argv.index('--device') + 1]).read_text())
        res = dry_run(doc, dev, '--human-present' in argv, '--no-model' not in argv)
        print(json.dumps(res, indent=1, ensure_ascii=False)); return 0 if res['state'] == 'accepted' else 1
    if cmd == 'chain':
        ok, why, head = verify_chain(doc, keys if keys else None); print(why, head or ''); return 0 if ok else 1
    print(__doc__); return 2


if __name__ == '__main__':
    sys.exit(main(sys.argv))
