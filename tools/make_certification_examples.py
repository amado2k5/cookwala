#!/usr/bin/env python3
"""Generate examples/certifications/*.json and conformance/keys/certification-test-keys.json (RFC-0010).

Deterministic. The two authorities sign with the RFC 8032 section 7.1 test keys, which are public;
nothing signed by them is a claim by anyone. A real authority publishes its own KeyRecords.

    python tools/make_certification_examples.py
"""
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import cookwala_ref as ref  # noqa: E402

OUT = ref.ROOT / 'examples' / 'certifications'; OUT.mkdir(exist_ok=True)
A_SEED = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'  # RFC 8032 test 1
B_SEED = '4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb'  # RFC 8032 test 2
A = {'id': 'did:web:halal-authority.example', 'name': 'Example Halal Certification Authority (fictional)'}
B = {'id': 'did:web:plant-based-society.example', 'name': 'Example Plant-Based Society (fictional)'}
KEYS = [
    {'kid': f"{A['id']}#k1", 'alg': 'EdDSA', 'publicKey': ref.public_key_from_seed(A_SEED), 'actor': A['id'], 'validFrom': '2025-01-01T00:00:00Z',
     'x-note': 'RFC 8032 test key 1; the fictional authority in examples/certifications. Never a real key.'},
    {'kid': f"{B['id']}#k1", 'alg': 'EdDSA', 'publicKey': ref.public_key_from_seed(B_SEED), 'actor': B['id'], 'validFrom': '2025-01-01T00:00:00Z',
     'x-note': 'RFC 8032 test key 2; the fictional society in examples/certifications. Never a real key.'},
]
kofta = json.loads((ref.ROOT / 'examples' / 'kofta-oven.cookwala.json').read_text())
shak = json.loads((ref.ROOT / 'examples' / 'shakshuka.cookwala.json').read_text())

def cert(cid, scheme, standard, subject, auth, issued, valid_from, valid_until, seed, **extra):
    doc = {'cookwala': '0.2.0', 'kind': 'Certification', 'id': cid, 'scheme': scheme, 'standard': standard, 'subject': subject, 'authority': auth,
           'status': 'valid', 'issuedAt': issued, 'validFrom': valid_from, 'validUntil': valid_until, **extra}
    doc['hash'] = ref.doc_hash(doc)
    doc['signature'] = ref.sign(doc, seed, f"{auth['id']}#k1", issued)
    return doc

docs = {
 'halal-beef-lot-2026-09.json': cert('cert-halal-beef-lot-2026-09', 'halal', 'OIC/SMIIC 1:2019',
    {'kind': 'lot', 'ref': 'cw.ing.beef_ground', 'gtin': '6221234567891', 'lot': 'L2026-09-14-A', 'name': {'en': 'Ground beef, 1 kg packs', 'ar': 'لحم بقري مفروم، عبوات 1 كجم'}},
    A, '2026-09-15T09:00:00Z', '2026-09-15T00:00:00Z', '2027-03-15T00:00:00Z', seed=A_SEED, certificateId='HA-2026-00912',
    scope='Slaughter, processing and packing of the named lot.', evidence=[{'kind': 'certificate_url', 'url': 'https://halal-authority.example/certificates/HA-2026-00912'}]),
 'halal-kofta-oven-2026-01.json': cert('cert-halal-kofta-oven-2026-01', 'halal', 'cw.ruleset.halal.v1',
    {'kind': 'recipe', 'ref': 'cw:cookwala.ai:example-kofta-oven', 'revision': kofta['revision'], 'hash': kofta['hash']},
    A, '2026-01-15T10:00:00Z', '2026-01-15T00:00:00Z', '2027-01-15T00:00:00Z', seed=A_SEED, certificateId='HA-2026-00071',
    conditions='Halal only when the beef carries a current halal certification of its own lot.'),
 'halal-kofta-oven-2026-10.json': cert('cert-halal-kofta-oven-2026-10', 'halal', 'cw.ruleset.halal.v1',
    {'kind': 'recipe', 'ref': 'cw:cookwala.ai:example-kofta-oven', 'revision': kofta['revision'], 'hash': kofta['hash']},
    A, '2026-10-01T10:00:00Z', '2026-10-01T00:00:00Z', '2027-10-01T00:00:00Z', seed=A_SEED, certificateId='HA-2026-00988', supersedes='cert-halal-kofta-oven-2026-01',
    conditions='Halal only when the beef carries a current halal certification of its own lot.',
    evidence=[{'kind': 'transparency_log', 'logId': 'scitt.example', 'entryId': 'urn:example:entry:4411', 'note': 'Illustrative: a transparency-log entry for the certificate hash.'}]),
 'vegetarian-shakshuka-2026-06.json': cert('cert-vegetarian-shakshuka-2026-06', 'vegetarian', 'Plant-Based Society vegetarian standard v3 (fictional)',
    {'kind': 'recipe', 'ref': 'cw:cookwala.ai:example-shakshuka', 'revision': shak['revision'], 'hash': shak['hash']},
    B, '2026-06-01T08:00:00Z', '2026-06-01T00:00:00Z', '2028-06-01T00:00:00Z', seed=B_SEED, certificateId='PBS-7781',
    scope='As written; the optional feta is dairy, so the dish is vegetarian, not vegan.'),
}
for name, d in docs.items():
    (OUT / name).write_text(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
(ref.ROOT / 'conformance' / 'keys' / 'certification-test-keys.json').write_text(json.dumps(KEYS, indent=1) + '\n')
print(f'{len(docs)} certifications in {OUT}; keys in conformance/keys/certification-test-keys.json')
