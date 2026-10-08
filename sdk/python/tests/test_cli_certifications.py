"""The certification commands (RFC-0010): verify-cert, current-certs, certify, revoke-cert.

The authority key here is RFC 8032 test key 1, which is public; nothing signed with it is a claim.
"""
import contextlib
import io
import json
import pathlib
import tempfile
import unittest

from cookwala import ROOT, cli

KEYS = str(ROOT / 'conformance' / 'keys' / 'certification-test-keys.json')
CERTS = ROOT / 'examples' / 'certifications'
SEED = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
AUTH = 'did:web:halal-authority.example'


def run(*argv):
    out = io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(io.StringIO()):
        code = cli.main(list(argv))
    return code, out.getvalue()


class CertificationCliTest(unittest.TestCase):
    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp())
        (self.tmp / 'seed').write_text(SEED + '\n')

    def test_examples_verify(self):
        code, out = run('verify-cert', str(CERTS), '--keys', KEYS, '--json')
        self.assertEqual(code, 0)
        self.assertTrue(all(r['ok'] for r in json.loads(out)))

    def test_keys_are_required(self):
        self.assertEqual(run('verify-cert', str(CERTS))[0], 2)

    def test_subject_mismatch(self):
        code, out = run('verify-cert', str(CERTS / 'halal-kofta-oven-2026-10.json'), '--keys', KEYS,
                        '--subject', str(ROOT / 'examples' / 'shakshuka.cookwala.json'), '--json')
        self.assertEqual((code, json.loads(out)[0]['reason']), (2, 'subject_mismatch'))

    def test_current_supersedes_older(self):
        code, out = run('current-certs', str(ROOT / 'examples' / 'kofta-oven.cookwala.json'), '--keys', KEYS, '--json')
        res = json.loads(out)
        self.assertEqual(code, 0)
        self.assertEqual(res['current'], ['cert-halal-kofta-oven-2026-10'])
        self.assertEqual(res['rejected'], {'cert-halal-kofta-oven-2026-01': 'superseded'})

    def test_mixed_subjects_do_not_supersede_each_other(self):
        code, out = run('current-certs', '--keys', KEYS, '--json')
        res = json.loads(out)
        self.assertEqual(code, 0)
        self.assertIn('cert-halal-beef-lot-2026-09', res['current'])
        self.assertEqual(res['rejected'], {'cert-halal-kofta-oven-2026-01': 'superseded'})

    def test_search_certified(self):
        code, out = run('search', '--certified', 'halal', '--keys', KEYS, '--json')
        self.assertEqual(code, 0)
        self.assertEqual([h['id'] for h in json.loads(out)], ['example-kofta-oven'])
        self.assertEqual(run('search', '--certified', 'vegetarian', '--keys', KEYS, '--json', 'kofta')[0], 1)
        self.assertEqual(run('search', '--certified', 'halal')[0], 2)  # no keys, no trust

    def test_certify_then_revoke(self):
        recipe = str(ROOT / 'examples' / 'shakshuka.cookwala.json')
        cert, revoked = str(self.tmp / 'c.json'), str(self.tmp / 'r.json')
        self.assertEqual(run('certify', recipe, '--scheme', 'halal', '--authority', AUTH, '--key', str(self.tmp / 'seed'),
                             '--valid-until', '2099-01-01T00:00:00Z', '-o', cert)[0], 0)
        self.assertEqual(run('verify-cert', cert, '--keys', KEYS, '--subject', recipe)[0], 0)
        self.assertEqual(run('revoke-cert', cert, '--key', str(self.tmp / 'seed'), '--reason', 'test', '-o', revoked)[0], 0)
        code, out = run('verify-cert', revoked, '--keys', KEYS, '--json')
        self.assertEqual((code, json.loads(out)[0]['reason']), (2, 'revoked'))

    def test_bad_seed(self):
        (self.tmp / 'bad').write_text('nope')
        self.assertEqual(run('certify', str(ROOT / 'examples' / 'shakshuka.cookwala.json'), '--scheme', 'halal',
                             '--authority', AUTH, '--key', str(self.tmp / 'bad'))[0], 1)


if __name__ == '__main__':
    unittest.main()
