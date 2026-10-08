#!/usr/bin/env python3
"""Publish the certifications endpoints (RFC-0010) as static files on cookwala.ai.

    python tools/build_certifications.py OUT        (called by tools/build_site.sh)

Writes:
    OUT/v1/certifications/{id}.json     one signed Certification document (getCertification)
    OUT/v1/certifications/index.json    every Certification this catalog relays (listCertifications)

The site is static (GitHub Pages), so the list ignores query parameters: a reader fetches index.json and
filters by subjectHash, subject, scheme and authority itself, then verifies each document against the
authority's own KeyRecord. Every document is verified here before it is published; one that does not verify
against the keys we hold fails the build.

The documents published today are the examples in examples/certifications. Their authorities are fictional
and they are signed with the public RFC 8032 test keys (conformance/keys/certification-test-keys.json), so
nothing here is a claim by anyone.
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import cookwala_ref as ref  # noqa: E402

SOURCES = [ref.ROOT / 'examples' / 'certifications']
KEYS = ref.ROOT / 'conformance' / 'keys' / 'certification-test-keys.json'


def main(out):
    dest = pathlib.Path(out) / 'v1' / 'certifications'
    dest.mkdir(parents=True, exist_ok=True)
    keys = json.loads(KEYS.read_text())
    docs, seen = [], set()
    for src in SOURCES:
        for f in sorted(src.glob('*.json')):
            d = json.loads(f.read_text())
            if d.get('kind') != 'Certification': continue
            ok, why = ref.verify(d, keys)
            if not ok: sys.exit(f'{f}: signature does not verify ({why}); refusing to publish it')
            if d['id'] in seen: sys.exit(f'{f}: duplicate certification id {d["id"]}')
            if '/' in d['id'] or d['id'] in ('index',): sys.exit(f'{f}: id {d["id"]!r} cannot be a file name')
            seen.add(d['id'])
            (dest / f"{d['id']}.json").write_text(json.dumps(d, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
            docs.append(d)
    docs.sort(key=lambda d: (d.get('subject', {}).get('ref', ''), d.get('scheme', ''), d.get('issuedAt', '')))
    (dest / 'index.json').write_text(json.dumps(docs, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'{len(docs)} certifications in {dest}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '_site')
