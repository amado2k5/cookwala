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
    python tools/cookwala_ref.py sms OFFER 36KG YOGURT C T4C UB0511
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


def _time(s): return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))


def _now_iso(): return dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


def signing_input(h, kid, alg, signed_at, kind=None):
    """RFC-0012: the bytes a signature covers. Canonical JSON of the signing header, so the key id, the
    algorithm, the signing time and the document kind are all under the signature; a verifier can trust
    signedAt against revocation, and a signature cannot be moved to another key id or document kind."""
    hdr = {'alg': alg, 'hash': h, 'kid': kid, 'signedAt': signed_at}
    if kind: hdr['kind'] = kind
    return canonical(hdr).encode('utf-8')


def sign_hash(h, seed_hex, kid, signed_at=None, kind=None):
    """Sign a hash string with an Ed25519 seed. Deterministic, so vectors are reproducible."""
    signed_at = signed_at or _now_iso()
    sk = _ed().Ed25519PrivateKey.from_private_bytes(bytes.fromhex(seed_hex))
    return {'alg': 'EdDSA', 'kid': kid, 'signedAt': signed_at, 'sig': b64u(sk.sign(signing_input(h, kid, 'EdDSA', signed_at, kind)))}


def sign(doc, seed_hex, kid, signed_at=None, kind=None):
    """Return a Signature object for doc (over its hash, inside the RFC-0012 signing header)."""
    return sign_hash(doc_hash(doc), seed_hex, kid, signed_at, kind or doc.get('kind'))


def _key_for(sig, keys):
    """Find and check the KeyRecord a signature names. Returns (record, reason)."""
    if not sig: return None, 'unsigned'
    if not sig.get('signedAt'): return None, 'unsigned_time'
    rec = next((k for k in keys if k['kid'] == sig.get('kid')), None)
    if not rec: return None, 'unknown_key'
    if rec['alg'] != sig.get('alg'): return None, 'alg_mismatch'
    if sig['alg'] != 'EdDSA': return None, 'alg_not_supported_by_reference'
    try:
        when = _time(sig['signedAt'])
    except (ValueError, TypeError):
        return None, 'invalid_timestamp'
    if when < _time(rec['validFrom']) or (rec.get('validTo') and when > _time(rec['validTo'])): return None, 'key_not_valid_at_signing_time'
    if rec.get('revokedAt') and when >= _time(rec['revokedAt']): return None, 'key_revoked'
    return rec, 'ok'


def verify_signature(h, sig, keys, kind=None):
    """The one verification path for documents, events and checkpoints (RFC-0012)."""
    rec, why = _key_for(sig, keys)
    if not rec: return False, why
    try:
        _ed().Ed25519PublicKey.from_public_bytes(unb64u(rec['publicKey'])).verify(unb64u(sig['sig']), signing_input(h, sig['kid'], sig['alg'], sig['signedAt'], kind))
        return True, 'ok'
    except Exception:
        return False, 'bad_signature'


def verify(doc, keys, now=None):
    """Verify doc['signature'] against a list of KeyRecords. Returns (ok, reason). `now` is accepted for
    compatibility; the signing time comes from the signature itself and is covered by it."""
    return verify_signature(doc_hash(doc), doc.get('signature'), keys, doc.get('kind'))

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


def _verify_hash(doc, h, keys, kind='Event'):
    return verify_signature(h, doc.get('signature'), keys, kind)


def sign_event(ev, seed_hex, kid, signed_at=None):
    ev = dict(ev)
    ev['hash'] = event_hash(ev)
    ev['signature'] = sign_hash(ev['hash'], seed_hex, kid, signed_at or ev.get('at'), 'Event')
    return ev


def verify_checkpoint(cp, events, keys):
    """A checkpoint is valid if its head matches the event at cp.seq, the sequencer's signature and every
    witness signature verify over the checkpoint hash (kind Checkpoint), and at least one witness signs
    with a key id other than the sequencer's (RFC-0012: a self-witnessed checkpoint proves nothing)."""
    if cp['seq'] >= len(events) or events[cp['seq']]['hash'] != cp['head']: return False, 'head_mismatch'
    h = doc_hash(cp, exclude=('signature', 'witnesses'))
    ok, why = _verify_hash(cp, h, keys, 'Checkpoint')
    if not ok: return False, 'sequencer_' + why
    independent = False
    for w in cp.get('witnesses', []):
        ok, why = _verify_hash(w, h, keys, 'Checkpoint')
        if not ok: return False, 'witness_' + why
        if (w.get('signature') or {}).get('kid') != cp['signature'].get('kid'): independent = True
    if not independent: return False, 'no_independent_witness'
    return True, 'ok'


def detect_fork(cp_a, cp_b):
    """Two checkpoints of one log at the same seq with different heads prove a fork or a rewrite."""
    same_log = cp_a.get('mission', cp_a.get('log')) == cp_b.get('mission', cp_b.get('log'))
    if same_log and cp_a.get('seq') == cp_b.get('seq') and cp_a.get('head') != cp_b.get('head'):
        return {'fork': True, 'reason': 'fork_detected'}
    return {'fork': False, 'reason': 'ok'}


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


def trusted_sensors(capabilities, now=None):
    """Sensor ids (and the vision cues of trusted cameras) that may satisfy a ladder rung (RFC-0011).

    Excluded: state degraded, fault or unknown; calibration whose validUntil has passed.
    A sensor record without state or calibration is trusted as declared (0.2 behaviour).
    """
    t = _time(now) if isinstance(now, str) else (now or dt.datetime.now(dt.timezone.utc))
    out = set()
    for s in capabilities.get('capabilities', {}).get('sensors', []):
        if s.get('state', 'ok') != 'ok': continue
        vu = (s.get('calibration') or {}).get('validUntil')
        if vu and t > _time(vu): continue
        out.add(s['sensor']); out.update(s.get('visionCues', []))
    return out


def check_plausibility(readings, sensors, tolerance_c=1.0):
    """Cross-check readings of one medium from several sensors (RFC-0011).

    readings: [{'sensor': id, 'tempC': value}]; sensors: the capabilities sensor records (accuracy in °C,
    default 2.0 when not stated). Two readings that differ by more than the sum of their accuracies
    plus tolerance_c are implausible: both sensors are demoted for this step and an incident is logged.
    Returns (ok, reason, detail).
    """
    acc = {s['sensor']: float(s.get('accuracy', 2.0)) for s in sensors}
    rs = [r for r in readings if _finite(r.get('tempC'))]
    if len(rs) != len(readings): return False, 'non_numeric_reading', 'a reading is not a finite number'
    for i in range(len(rs)):
        for j in range(i + 1, len(rs)):
            a, b = rs[i], rs[j]
            allowed = acc.get(a['sensor'], 2.0) + acc.get(b['sensor'], 2.0) + tolerance_c
            if abs(a['tempC'] - b['tempC']) > allowed:
                return False, 'implausible', f"{a['sensor']} {a['tempC']:g} °C and {b['sensor']} {b['tempC']:g} °C differ by more than {allowed:g} °C"
    return True, 'ok', ''


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


def _heat_bands():
    return {e['id'].split('.')[-1]: (e['surfaceTempC']['min'], e['surfaceTempC']['max']) for e in json.loads((ROOT / 'vocab' / 'units.json').read_text())['entries'] if 'surfaceTempC' in e}


def _finite(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)


def check_node_params(op_id, node, limits=None, vocab=None):
    """Executor-side check of a step's numbers against the operation envelope and the local SafetyLimits.

    Returns None when the step may be planned, else (reason, detail) with reason
    envelope_out_of_range or safety_limit. Checks params.tempC, params.oilTempC, params.pressureKPa,
    a temperature target, and a hob heat level against the envelope; then every temperature against
    the stricter of the applicable max_temp limits. A non-numeric or non-finite number is refused.
    """
    vocab = vocab or _vocab('ops')
    env = vocab.get(op_id, {}).get('envelope') or {}
    params = node.get('params') or {}
    temps = []
    for key in ('tempC', 'oilTempC'):
        if key in params: temps.append((key, params[key]))
    tgt = params.get('target') or node.get('target')
    if isinstance(tgt, dict) and 'value' in tgt and tgt.get('unit', 'degC') in ('degC', 'C'):
        temps.append(('target', tgt['value']))
    for key, t in temps:
        if not _finite(t): return 'envelope_out_of_range', f'{key} is not a finite number'
    band = env.get('tempC')
    if band:
        for key, t in temps:
            if t < band['min'] or t > band['max']:
                return 'envelope_out_of_range', f'{key} {t:g} °C is outside the {op_id} envelope {band["min"]}–{band["max"]} °C'
        heat = params.get('heat')
        if env.get('medium') == 'pan_surface' and isinstance(heat, str):
            hb = _heat_bands().get(heat)
            if hb and (hb[1] < band['min'] or hb[0] > band['max']):
                return 'envelope_out_of_range', f'heat level {heat} (pan {hb[0]}–{hb[1]} °C) cannot hold the {op_id} envelope {band["min"]}–{band["max"]} °C'
    pk = params.get('pressureKPa')
    if pk is not None:
        if not _finite(pk): return 'envelope_out_of_range', 'pressureKPa is not a finite number'
        pb = env.get('pressureKPa')
        if pb and (pk < pb['min'] or pk > pb['max']):
            return 'envelope_out_of_range', f'pressure {pk:g} kPa is outside the {op_id} envelope {pb["min"]}–{pb["max"]} kPa'
    for lim in (limits or {}).get('limits', []):
        applies = lim.get('appliesTo', {})
        if applies.get('ops') and op_id not in applies['ops']: continue
        if applies.get('medium') and applies['medium'] != env.get('medium'): continue
        if not applies.get('ops') and not applies.get('medium'): continue
        if lim.get('kind') == 'max_temp' and lim.get('unit') == 'degC':
            for key, t in temps:
                if t > lim['max']: return 'safety_limit', f'{key} {t:g} °C exceeds local limit {lim["id"]} ({lim["max"]} °C)'
        if lim.get('kind') == 'pressure' and pk is not None and pk > lim.get('max', float('inf')):
            return 'safety_limit', f'pressure {pk:g} kPa exceeds local limit {lim["id"]} ({lim["max"]} kPa)'
    return None


def dry_run(recipe, capabilities, human_present=False, allow_model=True, limits=None, now=None):
    """Decide, before cooking, whether a device can run every step of a recipe.

    Returns an ExecutionStatus-like dict: state accepted (with the sensor-ladder rung chosen per
    step) or refused (with the first blocking reason). Nothing is executed. Steps whose numbers
    fall outside the operation envelope or the local SafetyLimits are refused before any ladder is
    climbed; operations marked executable:false in the vocabulary never run on a device.
    """
    caps = capabilities.get('capabilities', {})
    vocab = _vocab('ops')
    ops = {o['op'] for o in caps.get('ops', []) if vocab.get(o['op'], {}).get('executable', True) is not False}
    sensors = trusted_sensors(capabilities, now)  # RFC-0011: health and calibration decide which sensors may satisfy a rung
    plan = []
    for node in recipe.get('process', {}).get('nodes', []):
        op = node['op']
        assign = node.get('assignment', {}).get('allowed', ['any'])
        if op not in ops:
            if human_present and ('human' in assign or 'any' in assign):
                plan.append({'node': node['id'], 'op': op, 'by': 'human', 'verifiedBy': 'human'}); continue
            return {'state': 'refused', 'refusal': {'reason': 'missing_capability', 'node': node['id'], 'detail': f'device cannot perform {op} and no person is present to do it'}, 'plan': plan}
        bad = check_node_params(op, node, limits, vocab)
        if bad:
            return {'state': 'refused', 'refusal': {'reason': bad[0], 'node': node['id'], 'detail': bad[1]}, 'plan': plan}
        env = vocab.get(op, {}).get('envelope', {})
        if env and not env.get('unattended', True) and not human_present:
            return {'state': 'refused', 'refusal': {'reason': 'needs_human_present', 'node': node['id'], 'detail': f'{op} may not run unattended'}, 'plan': plan}
        rung = ladder_choice(op, sensors, allow_model, human_present) if env else 'time'
        if rung is None:
            return {'state': 'refused', 'refusal': {'reason': 'missing_sensor_no_fallback', 'node': node['id'], 'detail': f'no way to verify {op} on this device'}, 'plan': plan}
        plan.append({'node': node['id'], 'op': op, 'by': 'device', 'verifiedBy': 'sensor' if rung.startswith(('cw.', 'x-')) else rung, 'rung': rung})
    return {'state': 'accepted', 'plan': plan}


# ---------------------------------------------------------------- certifications (RFC-0010)


def verify_certification(cert, keys, now=None, subject_hash=None):
    """Verify one Certification: signature against the authority's KeyRecords, subject hash, status and window.

    Returns (ok, reason). Reasons: unsigned, unknown_key, bad_signature, key_revoked, ... (from verify),
    subject_mismatch, revoked, suspended, not_yet_valid, expired, ok.
    """
    if cert.get('kind') != 'Certification': return False, 'not_a_certification'
    ok, why = verify(cert, keys)
    if not ok: return False, why
    if subject_hash and cert.get('subject', {}).get('hash') != subject_hash: return False, 'subject_mismatch'
    t = _time(now) if isinstance(now, str) else (now or dt.datetime.now(dt.timezone.utc))
    st = cert.get('status')
    if st == 'revoked' and (not cert.get('revokedAt') or t >= _time(cert['revokedAt'])): return False, 'revoked'
    if st == 'suspended': return False, 'suspended'
    if cert.get('validFrom') and t < _time(cert['validFrom']): return False, 'not_yet_valid'
    if cert.get('validUntil') and t > _time(cert['validUntil']): return False, 'expired'
    return True, 'ok'


def current_certifications(certs, keys, now=None, subject_hash=None):
    """Which certifications currently hold for a subject.

    Several authorities may certify the same subject and scheme: each counts. Within one authority and
    scheme the newest verifying document wins and earlier ones are superseded (re-certification).
    Returns {'current': [ids], 'rejected': {id: reason}}.
    """
    verdicts = {c['id']: verify_certification(c, keys, now, subject_hash) for c in certs}
    groups = {}
    for c in certs:
        if verdicts[c['id']][0]: groups.setdefault((c.get('authority', {}).get('id'), c.get('scheme')), []).append(c)
    current, rejected = [], {cid: why for cid, (ok, why) in verdicts.items() if not ok}
    for members in groups.values():
        members.sort(key=lambda c: c.get('issuedAt', ''))
        newest = members[-1]
        current.append(newest['id'])
        for older in members[:-1]: rejected[older['id']] = 'superseded'
    return {'current': sorted(current), 'rejected': rejected}


# ---------------------------------------------------------------- profiles (RFC-0001, 0002, 0003, 0007)

import re as _re


def _registry_facets():
    return {e['id']: e for e in json.loads((ROOT / 'vocab' / 'facets.json').read_text())['entries']}


def _recipient_roles():
    return json.loads((ROOT / 'profiles' / 'household' / 'recipient-roles.json').read_text())['roles']


def derive_constraints(facets, role, consents=None, registry=None, roles=None):
    """RFC-0001: what a recipient role may receive from a list of household facets.

    Returns {'constraints': [{'type', 'derivedFrom': [facet ids]}], 'disclosed': [facet ids],
    'withheld': [{'facet', 'reason'}]}. Raw facets never appear in the output. Facets with travel
    'never' are withheld; 'derived' facets produce only the constraint types allowed for the role;
    'consented' facets need a ConsentGrant covering the facet (or its family) for that role.
    """
    registry = registry or _registry_facets(); roles = roles if roles is not None else _recipient_roles()
    allowed = set(roles.get(role, []))
    consents = [c for c in (consents or []) if c.get('recipientRole') == role and not c.get('withdrawnAt')]
    out = {'constraints': [], 'disclosed': [], 'withheld': []}
    by_type = {}
    for f in facets:
        fid = f['facet']; entry = registry.get(fid)
        if entry is None:
            out['withheld'].append({'facet': fid, 'reason': 'unknown_facet'}); continue
        travel = entry['travel']
        if travel == 'never':
            out['withheld'].append({'facet': fid, 'reason': 'never_travels'}); continue
        if travel == 'consented':
            fam = entry['family']
            ok = any(fid in c.get('scope', {}).get('facets', []) or fam in c.get('scope', {}).get('families', []) for c in consents)
            if ok: out['disclosed'].append(fid)
            else: out['withheld'].append({'facet': fid, 'reason': 'no_consent'})
            continue
        types = [t for t in entry.get('derivesTo', []) if t in allowed]
        if not types:
            out['withheld'].append({'facet': fid, 'reason': 'not_allowed_for_role'}); continue
        for t in types:
            by_type.setdefault(t, [])
            if fid not in by_type[t]: by_type[t].append(fid)
    out['constraints'] = [{'type': t, 'derivedFrom': ids} for t, ids in by_type.items()]
    return out


_NAME = _re.compile(r'^[a-z0-9]+(\.[a-z0-9-]+)+/[a-z0-9][a-z0-9._-]{0,99}$')
_SEMVER = _re.compile(r'^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?$')


def registry_name_valid(name):
    """RFC-0002: <reverse-dns-namespace>/<name>, lower case, 3..200 chars, namespace has at least one dot."""
    if not isinstance(name, str) or not 3 <= len(name) <= 200: return False, 'length'
    if name != name.lower(): return False, 'not_lower_case'
    if name.count('/') != 1: return False, 'one_slash_required'
    if not _NAME.match(name): return False, 'bad_format'
    return True, 'ok'


def version_exact(version):
    """RFC-0002: exact semver only; ranges and tags are rejected."""
    if not isinstance(version, str): return False, 'not_a_string'
    if version in ('latest', '*'): return False, 'tag_not_allowed'
    if any(ch in version for ch in '^~<>=x*') or version.endswith('.'): return False, 'range_not_allowed'
    if not _SEMVER.match(version): return False, 'not_semver'
    return True, 'ok'


def check_signal(signal, min_sources=20, min_delay_days=7, fine_region_min_sources=100):
    """RFC-0007: policy check for an aggregated demand or supply signal. Returns (ok, reasons)."""
    reasons = []
    if signal.get('kind') not in ('DemandSignal', 'SupplySignal'): reasons.append('unknown_kind')
    if signal.get('kind') == 'DemandSignal':
        if signal.get('contributingSources', 0) < min_sources: reasons.append('too_few_sources')
        if signal.get('delayDays', 0) < min_delay_days: reasons.append('delay_too_short')
        if signal.get('prices', 'none') != 'none': reasons.append('prices_not_allowed')
    for key in ('price', 'prices', 'unitPrice', 'priceRange'):
        v = signal.get(key)
        if v not in (None, 'none'): reasons.append('prices_not_allowed')
    cls = signal.get('ingredientClass', '')
    if not cls.startswith('cw.ing.class.') and not cls.startswith('x-'): reasons.append('class_level_required')
    region = signal.get('region', {})
    if (region.get('admin2') or region.get('pcode')) and signal.get('contributingSources', 0) < fine_region_min_sources: reasons.append('region_too_fine')
    if signal.get('kind') == 'SupplySignal' and signal.get('openToAll') is not True: reasons.append('must_be_open_to_all')
    reasons = sorted(set(reasons))
    return (not reasons), reasons


# SMS grammar for the Humanitarian Profile (docs/HUMANITARIAN-PROFILE.md section 8.3, RFC-0003).
_STORAGE = {'A': 'ambient', 'C': 'chilled', 'F': 'frozen', 'H': 'hot_held'}


_DIGITS = {ord(c): str(i) for digits in ('٠١٢٣٤٥٦٧٨٩', '۰۱۲۳۴۵۶۷۸۹') for i, c in enumerate(digits)}
_REASONS = {'TEMP': 'temp_out_of_range', 'DATE': 'past_use_by', 'PACK': 'packaging_damaged', 'ALLERG': 'allergen_unlabelled',
            'QTY': 'quantity_mismatch', 'PEST': 'pests_or_contamination', 'SPACE': 'no_capacity', 'TRANSPORT': 'no_transport',
            'LATE': 'arrived_late', 'OTHER': 'other'}
# Item words that imply a food class the rule packs care about (RFC-0003 section 8.3). Deliberately small; a gateway
# may extend it per language. Classes drive storage checks: a chilled-class item offered as ambient is a block finding.
_SMS_CLASSES = [
    (('YOGURT', 'YOGHURT', 'MILK', 'CHEESE', 'LABNEH', 'CREAM', 'BUTTER', 'ZABADI'), 'dairy'),
    (('CHICKEN', 'POULTRY', 'TURKEY'), 'poultry'),
    (('MEAT', 'BEEF', 'LAMB', 'KOFTA', 'MINCE', 'LIVER'), 'meat'),
    (('FISH', 'SHRIMP', 'PRAWN', 'TUNA', 'SARDINE'), 'fish'),
    (('EGG', 'EGGS'), 'egg'),
    (('COOKED', 'HOT', 'MEALS', 'MEAL', 'TRAYS', 'SOUP', 'STEW', 'KOSHARI'), 'cooked_food'),
    (('RICE',), 'cooked_rice'),
]
_CHILL_CLASSES = ('dairy', 'poultry', 'meat', 'fish', 'egg', 'cooked_food', 'cooked_rice')

def sms_food_classes(item):
    """Food classes implied by the item words of an OFFER (gateway hint; the donor's storage code is still recorded)."""
    words = set(item.upper().split())
    out = [cls for keys, cls in _SMS_CLASSES if words & set(keys)]
    if 'cooked_rice' in out and 'cooked_food' not in out and not (words & {'COOKED', 'HOT', 'TRAYS', 'MEALS', 'MEAL'}): out.remove('cooked_rice')
    return out

def sms_storage_findings(cmd):
    """Gateway-side checks on a parsed OFFER/HAND: missing temperature on a temperature-controlled line, hot food already
    below 60 °C, and a chilled-class item declared ambient. Returns rule ids (safety.* are block findings)."""
    f = []
    st = cmd.get('storage'); t = cmd.get('tempC')
    if cmd.get('command') == 'OFFER':
        if st == 'ambient' and any(c in _CHILL_CLASSES for c in cmd.get('foodClasses', [])): f.append('safety.storage_class_mismatch')
        if st == 'hot_held' and t is not None and t < 60: f.append('safety.hot_hold_min')
        if st == 'chilled' and t is not None and t > 5: f.append('safety.chilled_max')
        if st == 'frozen' and t is not None and t > -18: f.append('safety.frozen_max')
    if cmd.get('command') == 'HAND' and st in ('chilled', 'frozen', 'hot_held'):
        if t is None: f.append('safety.temp_not_recorded')
        elif st == 'chilled' and t > 5: f.append('safety.chilled_max')
        elif st == 'hot_held' and t < 60: f.append('safety.hot_hold_min')
        elif st == 'frozen' and t > -18: f.append('safety.frozen_max')
    return f

def parse_sms(text, today=None):
    """Parse one SMS into a structured command. Returns {'ok': True, 'command': ..., ...} or {'ok': False, 'error': ...}.

    OFFER <kg>KG <item words> <A|C|F|H> [T<temp>C] [UB<ddmm>|BB<ddmm>]
    FARM  <kg>KG <item words> <A|C|F|H> [BB<ddmm>]          (an OFFER with origin farm)
    CLAIM <offer> ALL | <kg>
    HAND  <offer> <kg accepted> [REJ <kg rejected> <REASON>] [T<temp>]   (REJ with 0 accepted = all rejected)
    DIST  <meals> MEALS <people> PEOPLE <kg>KG
    MENU  <distribution> KCAL<n> SODIUM<mg> FV<g>
    HELP · CANCEL <id>

    Arabic-Indic (٠-٩) and Persian (۰-۹) digits are accepted everywhere a digit is. FARM and OFFER
    accept HV<ddmm> (harvested on). Reason codes: TEMP, DATE, PACK, ALLERG, QTY, PEST, SPACE,
    TRANSPORT, LATE, OTHER (RFC-0003 section 8.3); unknown codes become 'other'.
    """
    if not isinstance(text, str) or not text.strip(): return {'ok': False, 'error': 'empty'}
    text = text.translate(_DIGITS)
    toks = text.strip().upper().split()
    cmd = toks[0]
    def kg(tok):
        m = _re.fullmatch(r'(\d+(?:\.\d+)?)KG', tok); return float(m.group(1)) if m else None
    def temp(tok):
        # T4.6, T4.6C or 4C (a C suffix or a T prefix is required so plain numbers stay kilograms)
        m = _re.fullmatch(r'T(-?\d+(?:\.\d+)?)C?', tok) or _re.fullmatch(r'(-?\d+(?:\.\d+)?)C', tok)
        return float(m.group(1)) if m else None
    def datemark(tok):
        m = _re.fullmatch(r'(UB|BB|HV)(\d{2})(\d{2})', tok)
        if not m: return None
        day, month = int(m.group(2)), int(m.group(3))
        if not (1 <= day <= 31 and 1 <= month <= 12): return 'bad_date'
        if m.group(1) == 'HV': return {'harvested': f'{day:02d}-{month:02d}'}
        return {'kind': 'use_by' if m.group(1) == 'UB' else 'best_before', 'dayMonth': f'{day:02d}-{month:02d}'}
    if cmd == 'HELP': return {'ok': True, 'command': 'HELP'}
    if cmd == 'CANCEL':
        if len(toks) != 2: return {'ok': False, 'error': 'usage'}
        return {'ok': True, 'command': 'CANCEL', 'id': toks[1]}
    if cmd in ('OFFER', 'FARM'):
        if len(toks) < 4 or kg(toks[1]) is None: return {'ok': False, 'error': 'usage'}
        rest = toks[2:]
        storage = None; t = None; dm = None; hv = None; words = []
        for tok in rest:
            if tok in _STORAGE and storage is None: storage = _STORAGE[tok]; continue
            if temp(tok) is not None and t is None: t = temp(tok); continue
            d = datemark(tok)
            if d == 'bad_date': return {'ok': False, 'error': 'bad_date'}
            if d and 'harvested' in d: hv = d['harvested']; continue
            if d: dm = d; continue
            words.append(tok)
        if storage is None or not words: return {'ok': False, 'error': 'usage'}
        out = {'ok': True, 'command': 'OFFER', 'kg': kg(toks[1]), 'item': ' '.join(words).lower(), 'storage': storage, 'origin': 'farm' if cmd == 'FARM' else None}
        if t is not None: out['tempC'] = t
        if dm: out['dateMark'] = dm
        if hv: out['harvested'] = hv
        classes = sms_food_classes(out['item'])
        if classes: out['foodClasses'] = classes
        if out['origin'] is None: out.pop('origin')
        return out
    if cmd == 'CLAIM':
        if len(toks) != 3: return {'ok': False, 'error': 'usage'}
        if toks[2] == 'ALL': return {'ok': True, 'command': 'CLAIM', 'offer': toks[1], 'all': True}
        k = kg(toks[2]) if toks[2].endswith('KG') else (float(toks[2]) if _re.fullmatch(r'\d+(?:\.\d+)?', toks[2]) else None)
        if k is None: return {'ok': False, 'error': 'usage'}
        return {'ok': True, 'command': 'CLAIM', 'offer': toks[1], 'kg': k}
    if cmd == 'HAND':
        if len(toks) < 3: return {'ok': False, 'error': 'usage'}
        out = {'ok': True, 'command': 'HAND', 'offer': toks[1]}
        if not _re.fullmatch(r'\d+(?:\.\d+)?', toks[2]): return {'ok': False, 'error': 'usage'}
        out['kgAccepted'] = float(toks[2]); rest = toks[3:]
        if rest and rest[0] == 'REJ':
            k = float(rest[1]) if len(rest) >= 2 and _re.fullmatch(r'\d+(?:\.\d+)?', rest[1]) else None
            if k is None or len(rest) < 3: return {'ok': False, 'error': 'usage'}
            out.update({'kgRejected': k, 'reason': _REASONS.get(rest[2], 'other'), 'reasonCode': rest[2]})
            rest = rest[3:]
        for tok in rest:
            if temp(tok) is not None: out['tempC'] = temp(tok)
        return out
    if cmd == 'DIST':
        m = _re.fullmatch(r'DIST (\d+) MEALS (\d+) PEOPLE (\d+(?:\.\d+)?)KG', ' '.join(toks))
        if not m: return {'ok': False, 'error': 'usage'}
        return {'ok': True, 'command': 'DIST', 'meals': int(m.group(1)), 'people': int(m.group(2)), 'kg': float(m.group(3))}
    if cmd == 'MENU':
        if len(toks) < 3: return {'ok': False, 'error': 'usage'}
        out = {'ok': True, 'command': 'MENU', 'distribution': toks[1], 'perMeal': {}}
        for tok in toks[2:]:
            m = _re.fullmatch(r'(KCAL|SODIUM|FV|PROTEIN)(\d+(?:\.\d+)?)', tok)
            if not m: return {'ok': False, 'error': 'usage'}
            out['perMeal'][{'KCAL': 'energyKcal', 'SODIUM': 'sodiumMg', 'FV': 'fruitVegG', 'PROTEIN': 'proteinG'}[m.group(1)]] = float(m.group(2))
        return out
    return {'ok': False, 'error': 'unknown_command'}


# ---------------------------------------------------------------- CLI


def main(argv):
    if len(argv) < 3:
        print(__doc__); return 2
    cmd = argv[1]
    if cmd == 'sms':
        print(json.dumps(parse_sms(' '.join(argv[2:])), ensure_ascii=False)); return 0
    path = pathlib.Path(argv[2])
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
    if cmd == 'sms':
        print(json.dumps(parse_sms(' '.join(argv[2:])), ensure_ascii=False)); return 0
    if cmd == 'chain':
        ok, why, head = verify_chain(doc, keys if keys else None); print(why, head or ''); return 0 if ok else 1
    print(__doc__); return 2


if __name__ == '__main__':
    sys.exit(main(sys.argv))
