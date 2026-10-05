"""Generate the profile conformance vectors in conformance/profiles/ (RFC-0001, 0002, 0003, 0006, 0007).

Like make_conformance.py: vectors are committed; regenerate only when a profile changes on purpose,
then review the diff. Each file validates against conformance.schema.json#/$defs/ProfileVector.

    python tools/make_profile_vectors.py
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import cookwala_ref as ref  # noqa: E402

OUT = ref.ROOT / 'conformance' / 'profiles'
OUT.mkdir(parents=True, exist_ok=True)


def write(name, vectors):
    (OUT / f'{name}.json').write_text(json.dumps(vectors, indent=1, ensure_ascii=False) + '\n')
    print(f'profiles/{name}: {len(vectors)} vectors')


def vec(vid, kind, profile, rfc, desc, inp, exp):
    return {'id': vid, 'kind': kind, 'profile': profile, 'rfc': rfc, 'description': desc, 'input': inp, 'expected': exp}


# ---- RFC-0001 disclosure policy
F = lambda fid: {'facet': fid, 'value': 'local'}
fac = [F('cw.facet.household.health.allergies'), F('cw.facet.household.people.schedule'), F('cw.facet.household.people.children'),
       F('cw.facet.commerce.receiving_rules'), F('cw.facet.self.firmware'), F('cw.facet.household.economics.budget_posture'),
       F('cw.facet.household.health.conditions'), F('cw.facet.space.layout'), F('cw.facet.household.tastes.spice')]
consent_maker = [{'id': 'cg-1', 'recipientRole': 'device_maker', 'scope': {'families': ['self']}}]
withdrawn = [{'id': 'cg-1', 'recipientRole': 'device_maker', 'scope': {'families': ['self']}, 'withdrawnAt': '2026-10-04T00:00:00Z'}]
cases = [
    ('disclosure-grocer', 'grocer', None, 'A grocer gets delivery window, access point, allergen block, labelling and a budget cap; never the schedule, children, conditions or layout.'),
    ('disclosure-planner', 'planner', None, 'A planner gets diet and allergen constraints, a budget cap and household movement constraints; health conditions and layout never travel.'),
    ('disclosure-device-maker-no-consent', 'device_maker', None, 'Without consent, device facets (firmware) are withheld and household facets are not allowed for the role.'),
    ('disclosure-device-maker-consented', 'device_maker', consent_maker, 'With a consent grant for the self family, firmware is disclosed; household facets stay withheld.'),
    ('disclosure-consent-withdrawn', 'device_maker', withdrawn, 'A withdrawn consent grant disclosess nothing.'),
    ('disclosure-program-nothing', 'program', None, 'A humanitarian program receives nothing from households.'),
    ('disclosure-dataset-nothing', 'dataset', None, 'A dataset receives nothing from household facets (execution logs carry no personal data).'),
]
write('disclosure_policy', [vec(vid, 'disclosure_policy', 'household', '0001', d, {'facets': fac, 'recipientRole': role, **({'consents': c} if c else {})}, ref.derive_constraints(fac, role, c)) for vid, role, c, d in cases]
      + [vec('disclosure-unknown-facet', 'disclosure_policy', 'household', '0001', 'An unknown facet type is withheld, never guessed.', {'facets': [F('cw.facet.nothing.here')], 'recipientRole': 'planner'}, ref.derive_constraints([F('cw.facet.nothing.here')], 'planner'))])

# ---- RFC-0002 registry names and versions
names = [('org.fifi-cooking/egyptian-home', True), ('io.github.amado2k5/recipes', True), ('ai.cookwala/reference-catalog', True), ('Org.Fifi/x', False), ('nodots/name', False),
         ('org.fifi-cooking/egyptian/home', False), ('org.fifi-cooking/', False), ('a/b', False), ('org.example/with space', False)]
versions = [('1.4.2', True), ('0.2.0', True), ('1.0.0-rc.1', True), ('^1.4', False), ('1.x', False), ('latest', False), ('1.4', False), ('v1.4.2', False), ('>=1.0.0', False), ('*', False)]
reg = [vec(f'name-{i}', 'registry_name', 'registry', '0002', f'Registry name {n!r} is {"valid" if ok else "invalid"}.', {'name': n}, dict(zip(('valid', 'reason'), ref.registry_name_valid(n)))) for i, (n, ok) in enumerate(names)]
for v, (n, ok) in zip(reg, names): assert v['expected']['valid'] == ok, n
regv = [vec(f'version-{i}', 'registry_version', 'registry', '0002', f'Version {n!r} is {"exact" if ok else "rejected"}.', {'version': n}, dict(zip(('exact', 'reason'), ref.version_exact(n)))) for i, (n, ok) in enumerate(versions)]
for v, (n, ok) in zip(regv, versions): assert v['expected']['exact'] == ok, n
write('registry', reg + regv)

# ---- RFC-0003 SMS grammar
sms = ['OFFER 36KG YOGURT C 4C UB0511', 'OFFER 36KG YOGURT CUPS C T4.6C UB0511', 'FARM 120KG TOMATO A BB0411', 'offer 18kg cooked rice trays h t66c',
       'CLAIM A7K ALL', 'CLAIM A7K 20', 'CLAIM A7K 20KG', 'HAND A7K 36 T4.6', 'HAND A7K 0 REJ 18 TEMP T52', 'DIST 410 MEALS 410 PEOPLE 96KG',
       'MENU D12 KCAL650 SODIUM540 FV95', 'HELP', 'CANCEL A7K', 'HAND 012 74 REJ 6 PACK T4.4', 'HAND A7K 36 REJ 2 BADWORD', 'FARM ١٢٠KG TOMATO A HV0411', 'OFFER 36KG YOGURT A', 'HAND A7K 36 REJ', 'OFFER YOGURT C', 'OFFER 36KG YOGURT', 'OFFER 36KG YOGURT C UB3213', 'DIST 410 MEALS', 'hello there', '']
write('sms', [vec(f'sms-{i}', 'sms_parse', 'humanitarian', '0003', f'Parse {t!r}.', {'text': t}, ref.parse_sms(t)) for i, t in enumerate(sms)])

# ---- RFC-0007 signal policy
good = {'kind': 'DemandSignal', 'publisher': 'did:web:foodbank.example', 'region': {'country': 'EG', 'admin1': 'Cairo'}, 'period': {'weekStart': '2026-11-02'}, 'ingredientClass': 'cw.ing.class.legume', 'quantityKg': {'low': 1800, 'high': 2400, 'method': 'modelled'}, 'contributingSources': 42, 'delayDays': 9, 'basis': 'distributions', 'prices': 'none'}
sig = [('signal-ok', good, 'A class-level, delayed, aggregated demand signal with no prices passes.'),
       ('signal-too-few-sources', {**good, 'contributingSources': 12}, 'Fewer than 20 contributing sources is rejected.'),
       ('signal-delay-too-short', {**good, 'delayDays': 2}, 'Less than 7 days of delay is rejected.'),
       ('signal-prices', {**good, 'priceRange': {'low': '3.20', 'high': '4.10'}}, 'Any price field is rejected.'),
       ('signal-product-level', {**good, 'ingredientClass': 'cw.ing.lentils_red'}, 'Product-level signals are rejected; class level only.'),
       ('signal-region-too-fine', {**good, 'region': {'country': 'EG', 'admin1': 'Cairo', 'admin2': 'Nasr City'}}, 'A region finer than admin1 needs at least 100 sources.'),
       ('signal-supply-ok', {'kind': 'SupplySignal', 'publisher': 'did:web:coop.example', 'region': {'country': 'EG', 'admin1': 'Beheira'}, 'period': {'weekStart': '2026-10-05'}, 'ingredientClass': 'cw.ing.class.vegetable_fruit', 'availability': 'glut', 'openToAll': True}, 'A supply signal open to all passes.'),
       ('signal-supply-closed', {'kind': 'SupplySignal', 'publisher': 'did:web:coop.example', 'region': {'country': 'EG', 'admin1': 'Beheira'}, 'period': {'weekStart': '2026-10-05'}, 'ingredientClass': 'cw.ing.class.vegetable_fruit', 'availability': 'glut', 'openToAll': False}, 'A supply signal not open to all is rejected.')]
write('signal', [vec(vid, 'signal_policy', 'supply', '0007', d, {'signal': s}, dict(zip(('ok', 'reasons'), ref.check_signal(s)))) for vid, s, d in sig])

# ---- RFC-0006 federation: a relayed recall verifies against the issuer, never the relay
ISSUER_SEED = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'  # RFC 8032 test key, never for real use
RELAY_SEED = '4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb'
issuer = {'kid': 'https://catalog.example#k1', 'alg': 'EdDSA', 'publicKey': ref.public_key_from_seed(ISSUER_SEED), 'actor': 'catalog.example', 'validFrom': '2026-01-01T00:00:00Z'}
relay = {'kid': 'https://mirror.example#k1', 'alg': 'EdDSA', 'publicKey': ref.public_key_from_seed(RELAY_SEED), 'actor': 'mirror.example', 'validFrom': '2026-01-01T00:00:00Z'}
recall = {'core': '0.2.0', 'kind': 'Recall', 'id': 'rc-100', 'issuedAt': '2026-10-04T10:00:00Z', 'issuer': 'catalog.example', 'targets': [{'ref': 'cw:catalog.example:r-9'}], 'severity': 'high', 'reason': 'food_safety', 'action': 'block'}
signed = {**recall, 'signature': ref.sign(recall, ISSUER_SEED, issuer['kid'], '2026-10-04T10:00:00Z')}
relayed = {**signed, 'x-relay': {'by': 'mirror.example', 'at': '2026-10-04T11:00:00Z'}}
forged = {**recall, 'signature': ref.sign(recall, RELAY_SEED, relay['kid'], '2026-10-04T11:00:00Z')}
write('federation', [
    vec('relay-verifies-with-issuer-key', 'signature', 'federation', '0006', 'A recall republished by a mirror still verifies with the issuer key. Relay provenance travels outside the signed document (for example in the feed entry), so the body is byte-for-byte the issuer\'s.', {'document': {k: v for k, v in relayed.items() if k != 'x-relay'}, 'keys': [issuer, relay]}, {'ok': True, 'reason': 'ok'}),
    vec('relay-key-proves-nothing', 'signature', 'federation', '0006', 'The same recall re-signed by the mirror with its own key is not the issuer\'s recall: unknown_key when only the issuer is trusted.', {'document': forged, 'keys': [issuer]}, {'ok': False, 'reason': 'unknown_key'}),
    vec('relay-cannot-alter', 'signature', 'federation', '0006', 'A mirror that edits the recall (changing block to warn) breaks the issuer signature.', {'document': {**signed, 'action': 'warn'}, 'keys': [issuer, relay]}, {'ok': False, 'reason': 'bad_signature'}),
])


# ---- RFC-0010 certifications: detached, signed, re-certifiable attestations
import copy
CA_SEED, CB_SEED = ISSUER_SEED, RELAY_SEED
CA = {'kid': 'did:web:halal-authority.example#k1', 'alg': 'EdDSA', 'publicKey': ref.public_key_from_seed(CA_SEED), 'actor': 'did:web:halal-authority.example', 'validFrom': '2025-01-01T00:00:00Z'}
CB = {'kid': 'did:web:plant-based-society.example#k1', 'alg': 'EdDSA', 'publicKey': ref.public_key_from_seed(CB_SEED), 'actor': 'did:web:plant-based-society.example', 'validFrom': '2025-01-01T00:00:00Z'}
CKEYS = [CA, CB]
RECIPE_HASH = 'sha256:' + '11' * 32
def mkcert(cid, auth, seed, issued, until, scheme='halal', status='valid', supersedes=None, subject_hash=RECIPE_HASH, **extra):
    d = {'cookwala': '0.2.0', 'kind': 'Certification', 'id': cid, 'scheme': scheme, 'standard': 'cw.ruleset.halal.v1' if scheme == 'halal' else 'test standard',
         'subject': {'kind': 'recipe', 'ref': 'cw:cookwala.ai:example-test', 'revision': 1, 'hash': subject_hash}, 'authority': {'id': auth['actor']},
         'status': status, 'issuedAt': issued, 'validFrom': issued, 'validUntil': until, **({'supersedes': supersedes} if supersedes else {}), **extra}
    d['hash'] = ref.doc_hash(d); d['signature'] = ref.sign(d, seed, auth['kid'], issued); return d
NOW = '2026-10-05T00:00:00Z'
c1 = mkcert('cert-a-2026-01', CA, CA_SEED, '2026-01-15T10:00:00Z', '2027-01-15T00:00:00Z')
c2 = mkcert('cert-a-2026-10', CA, CA_SEED, '2026-10-01T10:00:00Z', '2027-10-01T00:00:00Z', supersedes='cert-a-2026-01')
cb = mkcert('cert-b-2026-06', CB, CB_SEED, '2026-06-01T08:00:00Z', '2028-06-01T00:00:00Z')
expired = mkcert('cert-a-2025', CA, CA_SEED, '2025-02-01T00:00:00Z', '2025-08-01T00:00:00Z')
revoked = mkcert('cert-a-revoked', CA, CA_SEED, '2026-02-01T00:00:00Z', '2027-02-01T00:00:00Z', status='revoked', revokedAt='2026-08-01T00:00:00Z', revocationReason='supplier lost its own certificate')
forged = copy.deepcopy(c1); forged['signature'] = ref.sign(c1, CB_SEED, CA['kid'], '2026-01-15T10:00:00Z')  # B's key under A's kid
unsigned = {k: v for k, v in c1.items() if k != 'signature'}
cases = [
 ('cert-valid', 'A current certification by a known authority verifies.', {'certification': c1, 'keys': CKEYS, 'now': NOW, 'subjectHash': RECIPE_HASH}),
 ('cert-expired', 'Past validUntil: expired, whatever the signature says.', {'certification': expired, 'keys': CKEYS, 'now': NOW}),
 ('cert-revoked', 'Status revoked after revokedAt: not valid.', {'certification': revoked, 'keys': CKEYS, 'now': NOW}),
 ('cert-wrong-subject', 'The verifier holds a different recipe revision: subject_mismatch. A new revision needs a new certification.', {'certification': c1, 'keys': CKEYS, 'now': NOW, 'subjectHash': 'sha256:' + '22' * 32}),
 ('cert-forged-signature', 'Signed with another key under the authority\'s kid: bad_signature.', {'certification': forged, 'keys': CKEYS, 'now': NOW}),
 ('cert-unsigned', 'A certification without a signature is a claim, not a certification.', {'certification': unsigned, 'keys': CKEYS, 'now': NOW}),
 ('cert-unknown-authority-key', 'The authority\'s KeyRecord is not known: unknown_key; fetch it from authority.id first.', {'certification': cb, 'keys': [CA], 'now': NOW}),
]
cv = [vec(vid, 'certification', 'certifications', '0010', d, inp, dict(zip(('ok', 'reason'), ref.verify_certification(inp['certification'], inp['keys'], inp.get('now'), inp.get('subjectHash'))))) for vid, d, inp in cases]
sets = [
 ('certset-recertification-newest-wins', 'The same authority re-certified in October; the January document is superseded.', {'certifications': [c1, c2], 'keys': CKEYS, 'now': NOW, 'subjectHash': RECIPE_HASH}),
 ('certset-two-authorities-coexist', 'Two authorities certify the same recipe: both count; a reader may require a specific one.', {'certifications': [c2, cb], 'keys': CKEYS, 'now': NOW, 'subjectHash': RECIPE_HASH}),
 ('certset-expired-and-revoked-dropped', 'Expired and revoked documents are rejected with their reason; the current one stays.', {'certifications': [expired, revoked, c2], 'keys': CKEYS, 'now': NOW, 'subjectHash': RECIPE_HASH}),
]
cv += [vec(vid, 'certification_set', 'certifications', '0010', d, inp, ref.current_certifications(inp['certifications'], inp['keys'], inp['now'], inp['subjectHash'])) for vid, d, inp in sets]
assert [v['expected'].get('reason') for v in cv[:7]] == ['ok', 'expired', 'revoked', 'subject_mismatch', 'bad_signature', 'unsigned', 'unknown_key'], [v['expected'] for v in cv[:7]]
assert cv[7]['expected']['current'] == ['cert-a-2026-10'] and cv[8]['expected']['current'] == ['cert-a-2026-10', 'cert-b-2026-06']
write('certifications', cv)
