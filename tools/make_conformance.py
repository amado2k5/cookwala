"""Generate the Cookwala Core conformance vectors in conformance/.

Vectors are committed; regenerate only when the spec changes on purpose, then review the diff.
Two vectors come from outside this repo (RFC 8785 and RFC 8032) so the reference library is
checked against independent results, not only against itself.

    python tools/make_conformance.py
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import cookwala_ref as ref  # noqa: E402

OUT = ref.ROOT / 'conformance'
OUT.mkdir(exist_ok=True)

# Test keys from RFC 8032 section 7.1 (tests 1 and 2). Never use them for anything real.
SEQ_SEED = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
WIT_SEED = '4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb'
KEYS = [
    {'kid': 'did:web:hub.example#seq-1', 'alg': 'EdDSA', 'publicKey': ref.public_key_from_seed(SEQ_SEED), 'actor': 'hub:home', 'validFrom': '2026-01-01T00:00:00Z'},
    {'kid': 'did:web:grocer.example#k1', 'alg': 'EdDSA', 'publicKey': ref.public_key_from_seed(WIT_SEED), 'actor': 'grocer:a', 'validFrom': '2026-01-01T00:00:00Z', 'revokedAt': '2026-09-01T00:00:00Z', 'revocationReason': 'superseded'},
]


def write(name, vectors):
    (OUT / f'{name}.json').write_text(json.dumps(vectors, indent=1, ensure_ascii=False) + '\n')
    print(f'{name}: {len(vectors)} vectors')


# ---- hashing / canonical JSON
rfc8785_in = {'numbers': [333333333.33333329, 1e30, 4.50, 2e-3, 0.000000000000000000000000001],
              'string': '€$\u000f\nA\'B"\\\\"/', 'literals': [None, True, False]}
hash_vectors = [
    {'id': 'hash-rfc8785-example', 'kind': 'hash', 'description': 'RFC 8785 section 3.2.2 example: canonical text must match exactly.',
     'input': rfc8785_in, 'expected': {'canonical': '{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":"€$\\u000f\\nA\'B\\"\\\\\\\\\\"/"}'}},
    {'id': 'hash-key-order-utf16', 'kind': 'hash', 'description': 'Keys sort by UTF-16 code units: "é" (U+00E9) after "z", and an astral character before "ﬀ" (U+FB00).',
     'input': {'z': 1, 'é': 2, 'a': 3, '\U0001F600': 4, 'ﬀ': 5}, 'expected': {}},
    {'id': 'hash-excludes-hash-and-signature', 'kind': 'hash', 'description': 'hash and signature fields are excluded before hashing.',
     'input': {'id': 'r1', 'revision': 3, 'hash': 'sha256:' + '0' * 64, 'signature': {'alg': 'EdDSA', 'kid': 'x', 'sig': 'AA'}}, 'expected': {}},
]
for v in hash_vectors:
    v['expected']['canonical'] = v['expected'].get('canonical') or ref.canonical({k: x for k, x in v['input'].items() if k not in ('hash', 'signature')})
    v['expected']['hash'] = ref.doc_hash(v['input'])
assert ref.canonical(rfc8785_in) == hash_vectors[0]['expected']['canonical'], 'reference canonicalizer disagrees with RFC 8785'
write('hash', hash_vectors)

# ---- signatures
doc = {'kind': 'Recall', 'id': 'rc-001', 'issuedAt': '2026-10-04T10:00:00Z', 'targets': [{'ref': 'cw:cookwala.ai:shakshuka'}]}
signed = {**doc, 'signature': ref.sign(doc, SEQ_SEED, KEYS[0]['kid'], '2026-10-04T10:00:00Z')}
tampered = {**signed, 'id': 'rc-002'}
late = {**doc, 'signature': ref.sign(doc, WIT_SEED, KEYS[1]['kid'], '2026-09-15T00:00:00Z')}
sig_vectors = [
    {'id': 'sig-rfc8032-test1', 'kind': 'signature', 'description': 'RFC 8032 test 1: Ed25519 over the empty message with the test-1 key.',
     'input': {'seed': SEQ_SEED, 'messageHex': ''}, 'expected': {'publicKey': ref.public_key_from_seed(SEQ_SEED), 'signatureHex': 'e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b'}},
    {'id': 'sig-valid', 'kind': 'signature', 'description': 'A signed document verifies.', 'input': {'document': signed, 'keys': KEYS}, 'expected': {'ok': True, 'reason': 'ok'}},
    {'id': 'sig-tampered', 'kind': 'signature', 'description': 'Changing any signed field breaks the signature.', 'input': {'document': tampered, 'keys': KEYS}, 'expected': {'ok': False, 'reason': 'bad_signature'}},
    {'id': 'sig-revoked-key', 'kind': 'signature', 'description': 'A signature made after the key was revoked is invalid.', 'input': {'document': late, 'keys': KEYS}, 'expected': {'ok': False, 'reason': 'key_revoked'}},
    {'id': 'sig-unknown-key', 'kind': 'signature', 'description': 'An unknown kid is rejected, never trusted.', 'input': {'document': signed, 'keys': KEYS[1:]}, 'expected': {'ok': False, 'reason': 'unknown_key'}},
]
write('signature', sig_vectors)

# ---- selective disclosure
salt = 'q1w2e3r4t5y6u7i8o9p0aa'
value = {'diet': 'low_sodium', 'person': 'diner-2'}
dig = ref.disclosure_digest(salt, value)
write('disclosure', [
    {'id': 'disclosure-valid', 'kind': 'disclosure', 'description': 'digest = sha256(JCS([salt, value])).', 'input': {'digest': dig, 'salt': salt, 'value': value}, 'expected': {'ok': True}},
    {'id': 'disclosure-wrong-value', 'kind': 'disclosure', 'description': 'A different value does not match the digest.', 'input': {'digest': dig, 'salt': salt, 'value': {'diet': 'none', 'person': 'diner-2'}}, 'expected': {'ok': False}},
])

# ---- ledger / event log
events = []
prev = 'genesis'
for i, (t, actor, extra) in enumerate([('created', 'mom', {}), ('state_changed', 'hub:home', {'transition': {'from': 'draft', 'to': 'open'}}), ('contribution_offered', 'grocer:a', {'payload': {'ref': 'c-grocerA'}})]):
    ev = {'mission': 'm-001', 'seq': i, 'at': f'2026-10-04T17:0{i}:00Z', 'actor': actor, 'type': t, 'prev': prev, **extra}
    ev = ref.sign_event(ev, SEQ_SEED, KEYS[0]['kid'], ev['at'])
    events.append(ev); prev = ev['hash']
broken = [dict(e) for e in events]; broken[1] = {**broken[1], 'actor': 'mallory'}
cp = {'mission': 'm-001', 'seq': 2, 'head': events[2]['hash'], 'at': '2026-10-04T17:05:00Z', 'sequencer': 'hub:home'}
h = ref.doc_hash(cp, exclude=('signature', 'witnesses'))
from cryptography.hazmat.primitives.asymmetric import ed25519  # noqa: E402
sk1 = ed25519.Ed25519PrivateKey.from_private_bytes(bytes.fromhex(SEQ_SEED))
KEYS_W = [KEYS[0], {**KEYS[1], 'revokedAt': None}]
KEYS_W[1].pop('revokedAt'); KEYS_W[1].pop('revocationReason')
sk2 = ed25519.Ed25519PrivateKey.from_private_bytes(bytes.fromhex(WIT_SEED))
cp['signature'] = {'alg': 'EdDSA', 'kid': KEYS[0]['kid'], 'sig': ref.b64u(sk1.sign(h.encode()))}
cp['witnesses'] = [{'actor': 'grocer:a', 'at': '2026-10-04T17:06:00Z', 'signature': {'alg': 'EdDSA', 'kid': KEYS[1]['kid'], 'sig': ref.b64u(sk2.sign(h.encode()))}}]
rewritten = [dict(e) for e in events[:2]]
alt = {'mission': 'm-001', 'seq': 2, 'at': '2026-10-04T17:02:00Z', 'actor': 'grocer:b', 'type': 'contribution_offered', 'prev': rewritten[1]['hash'], 'payload': {'ref': 'c-grocerB'}}
rewritten.append(ref.sign_event(alt, SEQ_SEED, KEYS[0]['kid'], alt['at']))
write('ledger', [
    {'id': 'ledger-valid-chain', 'kind': 'ledger', 'description': 'Three sequenced, signed events form a valid chain.', 'input': {'events': events, 'keys': KEYS_W}, 'expected': {'ok': True, 'reason': 'ok', 'head': events[-1]['hash']}},
    {'id': 'ledger-edited-event', 'kind': 'ledger', 'description': 'Editing an event breaks its hash.', 'input': {'events': broken, 'keys': KEYS_W}, 'expected': {'ok': False, 'reason': 'hash_mismatch_at_1'}},
    {'id': 'ledger-checkpoint-valid', 'kind': 'ledger', 'description': 'A checkpoint signed by the sequencer and a witness matches the head.', 'input': {'events': events, 'checkpoint': cp, 'keys': KEYS_W}, 'expected': {'ok': True, 'reason': 'ok'}},
    {'id': 'ledger-rewrite-detected', 'kind': 'ledger', 'description': 'The sequencer rewrote event 2 after a witnessed checkpoint: the rewritten chain is internally valid but no longer matches the checkpoint.', 'input': {'events': rewritten, 'checkpoint': cp, 'keys': KEYS_W}, 'expected': {'ok': False, 'reason': 'head_mismatch'}},
])

# ---- units
write('units', [
    {'id': 'units-tbsp-ml', 'kind': 'units', 'description': '2 tbsp = 30 ml exactly.', 'input': {'value': 2, 'unit': 'tbsp', 'to': 'ml'}, 'expected': {'value': 30}},
    {'id': 'units-cup-flour-g', 'kind': 'units', 'description': '1 cup of flour at 0.53 g/ml = 127.2 g.', 'input': {'value': 1, 'unit': 'cup', 'to': 'g', 'density': 0.53}, 'expected': {'value': 127.2}},
    {'id': 'units-no-density', 'kind': 'units', 'description': 'Volume to mass without a density is an error, never a guess.', 'input': {'value': 1, 'unit': 'cup', 'to': 'g'}, 'expected': {'error': 'needs_density'}},
    {'id': 'units-relative-tolerance-on-degC', 'kind': 'units', 'description': 'A relative tolerance on a temperature is invalid; use toleranceAbs.', 'input': {'quantity': {'value': 94, 'unit': 'degC', 'tolerance': 0.05}}, 'expected': {'schemaValid': False}},
    {'id': 'units-absolute-tolerance-on-degC', 'kind': 'units', 'description': 'toleranceAbs on a temperature is valid.', 'input': {'quantity': {'value': 94, 'unit': 'degC', 'toleranceAbs': 3}}, 'expected': {'schemaValid': True}},
])

# ---- envelopes
def trace(*temps, step=30): return [{'t': i * step, 'tempC': t} for i, t in enumerate(temps)]
env_vectors = [
    ('env-simmer-ok', 'cw.op.simmer', trace(40, 70, 88, 92, 94, 93, 95), {'value': 94, 'tolerance': 3}, 0, True, True),
    ('env-simmer-boils', 'cw.op.simmer', trace(60, 90, 94, 99, 100, 100), None, 0, False, None),
    ('env-simmer-target-too-hot', 'cw.op.simmer', trace(90, 95), {'value': 99, 'tolerance': 1}, 0, False, False),
    ('env-boil-altitude', 'cw.op.boil', trace(60, 85, 93, 93, 93), None, 2400, True, None),
    ('env-boil-sea-level-too-cool', 'cw.op.boil', trace(60, 85, 93, 93, 93), None, 0, False, None),
    ('env-deep-fry-overheat', 'cw.op.deep_fry', trace(120, 165, 175, 185, 205), {'value': 175, 'tolerance': 10}, 0, False, False),
    ('env-hold-ok', 'cw.op.hold', trace(70, 66, 64, 63), None, 0, True, None),
    ('env-hold-too-cool', 'cw.op.hold', trace(70, 64, 58, 55), None, 0, False, None),
]
vecs = []
for vid, op, readings, target, alt, env_ok, tgt_ok in env_vectors:
    res = ref.check_envelope(op, readings, target, alt)
    assert res['envelopeOk'] == env_ok and res['targetOk'] == tgt_ok, (vid, res)
    vecs.append({'id': vid, 'kind': 'envelope', 'description': f'{op} trace check' + (f' at {alt} m' if alt else ''), 'input': {'op': op, 'readings': readings, 'target': target, 'altitudeM': alt}, 'expected': res})
for vid, op, sensors, model, human, exp in [('ladder-deep-fry-no-oil-sensor', 'cw.op.deep_fry', [], True, True, None), ('ladder-simmer-no-sensor-uses-model', 'cw.op.simmer', [], True, False, 'model'),
                                            ('ladder-simmer-sensor', 'cw.op.simmer', ['cw.sense.liquid_temp'], True, False, 'cw.sense.liquid_temp'), ('ladder-cut-needs-vision-or-human', 'cw.op.cut', [], True, False, None),
                                            ('ladder-saute-no-sensor-no-model-alone', 'cw.op.saute', [], False, False, None), ('ladder-saute-no-sensor-person-watches', 'cw.op.saute', [], False, True, 'human')]:
    got = ref.ladder_choice(op, sensors, model, human)
    assert got == exp, (vid, got)
    vecs.append({'id': vid, 'kind': 'envelope', 'description': f'Sensor ladder for {op}; null means the step must be refused.', 'input': {'op': op, 'sensors': sensors, 'allowModel': model, 'humanPresent': human}, 'expected': {'choice': exp}})
write('envelope', vecs)

# ---- state machines
write('transitions', [
    {'id': f'exec-{a}-{b}', 'kind': 'execution_transition', 'description': f'Execution {a} -> {b}', 'input': {'from': a, 'to': b}, 'expected': {'allowed': ref.execution_transition_allowed(a, b)}}
    for a, b in [('accepted', 'preparing'), ('running', 'completed'), ('completed', 'running'), ('refused', 'running'), ('stopping', 'running'), ('paused', 'running')]
] + [
    {'id': f'mission-{a}-{b}-{r}', 'kind': 'mission_transition', 'description': f'Mission {a} -> {b} by {r}', 'input': {'from': a, 'to': b, 'role': r}, 'expected': {'allowed': ref.mission_transition_allowed(a, b, r)}}
    for a, b, r in [('ready', 'committed', 'holder'), ('ready', 'committed', 'executor'), ('closed', 'executing', 'holder'), ('executing', 'degraded', 'executor'), ('draft', 'executing', 'holder')]
])
