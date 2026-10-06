"""Offline tests for tools/check_samples_claims.py: parser, classify(), every check's logic
against recorded fixtures and faked HTTP. Run: python -m unittest discover -s tools/tests"""
import datetime as dt
import hashlib
import io
import json
import sys
import tarfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import check_samples_claims as c  # noqa: E402

FIX = Path(__file__).parent / 'fixtures'
ROOT = Path(__file__).resolve().parents[2]
V = '0.3.0'
PYZ = b'fake-pyz-bytes'
PYZ_SHA = hashlib.sha256(PYZ).hexdigest()


def fake_get(routes):
    """routes: url -> (status, body str|bytes|dict). Unknown URLs 404."""
    def g(url, headers=None):
        if url in routes:
            code, body = routes[url]
            if isinstance(body, (dict, list)):
                body = json.dumps(body)
            return code, body.encode() if isinstance(body, str) else body
        return 404, b''
    return g


def release_routes():
    rel = json.loads((FIX / 'release-0.3.0.json').read_text())
    return {
        f'https://api.github.com/repos/{c.REPO}/releases/tags/samples-v{V}': (200, rel),
        'https://example.test/cookwala-samples-0.3.0.pyz': (200, PYZ),
        'https://example.test/SHA256SUMS': (200, f'{PYZ_SHA}  cookwala-samples-0.3.0.pyz\n'
                                                 f'{"0" * 64}  cookwala-samples_0.3.0_all.deb\n'),
    }, rel


class TestChannelsFile(unittest.TestCase):
    def test_every_tile_well_formed_and_checks_resolve(self):
        tiles = [t for g in json.loads((ROOT / 'samples/dist-channels.json').read_text())['groups'] for t in g['tiles']]
        self.assertGreater(len(tiles), 20)
        statuses = set()
        for t in tiles:
            for k in ('icons', 'name', 'cmd', 'status', 'src'):
                self.assertIn(k, t, t['name'])
            statuses.add(t['status'])
            if 'check' in t:
                self.assertIsNotNone(c.resolve_check(t['check']), f'{t["name"]}: {t["check"]}')
        known = {'live', 'ready', 'manual', 'byoi', 'deploy', 'repo', 'citested', 'oss-tested'}
        self.assertLessEqual(statuses, known, statuses - known)


class TestClassify(unittest.TestCase):
    def test_matrix(self):
        for status in ('live', 'citested', 'oss-tested', 'repo'):
            self.assertEqual(c.classify(status, 'ok'), ('ok', 'verified'))
            self.assertEqual(c.classify(status, 'missing')[0], 'fail')
        for status in ('ready', 'manual', 'byoi', 'deploy'):
            self.assertEqual(c.classify(status, 'ok'), ('warn', 'live but not claimed'))
            self.assertEqual(c.classify(status, 'missing'), ('ok', 'not live, as claimed'))
        for status in ('live', 'manual'):
            self.assertEqual(c.classify(status, 'lagging'), ('warn', 'lagging'))


class TestChecks(unittest.TestCase):
    def test_pypi(self):
        v_url = f'https://pypi.org/pypi/cookwala-samples/{V}/json'
        self.assertEqual(c.check_pypi(fake_get({v_url: (200, '{}')}), V)[0], 'ok')
        self.assertEqual(c.check_pypi(fake_get({'https://pypi.org/pypi/cookwala-samples/json': (200, '{}')}), V)[0], 'lagging')
        self.assertEqual(c.check_pypi(fake_get({}), V)[0], 'missing')

    def test_maven(self):
        base = 'https://repo1.maven.org/maven2/ai/cookwala/cookwala-samples'
        self.assertEqual(c.check_maven(fake_get({f'{base}/{V}/cookwala-samples-{V}.pom': (200, '<pom/>')}), V)[0], 'ok')
        self.assertEqual(c.check_maven(fake_get({f'{base}/maven-metadata.xml': (200, '<metadata/>')}), V)[0], 'lagging')
        self.assertEqual(c.check_maven(fake_get({}), V)[0], 'missing')

    def test_npm_and_nuget(self):
        idx = json.loads((FIX / 'nuget-index.json').read_text())
        self.assertEqual(c.check_npm(fake_get({f'https://registry.npmjs.org/@cookwala%2fsamples/{V}': (200, '{}')}), V)[0], 'ok')
        self.assertEqual(c.check_nuget(fake_get({'https://api.nuget.org/v3-flatcontainer/cookwala.samples/index.json': (200, idx)}), V)[0], 'ok')
        self.assertEqual(c.check_nuget_tool(fake_get({'https://api.nuget.org/v3-flatcontainer/cookwala.samples.tool/index.json': (200, {'versions': ['0.2.0']})}), V)[0], 'lagging')

    def test_github_release_and_assets(self):
        routes, rel = release_routes()
        self.assertEqual(c.check_github_release(fake_get(routes), V)[0], 'ok')
        self.assertEqual(c.resolve_check('gh-asset:deb')(fake_get(routes), V)[0], 'ok')
        bad = dict(routes)
        bad['https://example.test/cookwala-samples-0.3.0.pyz'] = (200, b'tampered')
        self.assertEqual(c.check_github_release(fake_get(bad), V)[0], 'missing')
        rel_no_deb = json.loads((FIX / 'release-0.3.0.json').read_text())
        rel_no_deb['assets'] = [a for a in rel_no_deb['assets'] if not a['name'].endswith('.deb')]
        self.assertEqual(c.check_github_release(fake_get({
            f'https://api.github.com/repos/{c.REPO}/releases/tags/samples-v{V}': (200, rel_no_deb)}), V)[0], 'missing')

    def test_homebrew_tap(self):
        routes, _ = release_routes()
        formula = f'class CookwalaSamples < Formula\n  url "https://github.com/amado2k5/cookwala/releases/download/samples-v{V}/cookwala-samples-{V}.pyz"\n  sha256 "{PYZ_SHA}"\nend'
        routes['https://raw.githubusercontent.com/amado2k5/homebrew-cookwala/main/Formula/cookwala-samples.rb'] = (200, formula)
        self.assertEqual(c.check_homebrew_tap(fake_get(routes), V)[0], 'ok')
        self.assertEqual(c.check_homebrew_tap(fake_get({}), V)[0], 'missing')

    def test_ghcr(self):
        routes = {
            'https://ghcr.io/token?scope=repository:amado2k5/cookwala-samples:pull': (200, {'token': 't'}),
            'https://ghcr.io/v2/amado2k5/cookwala-samples/tags/list': (200, {'name': 'x', 'tags': [V, 'latest']}),
        }
        self.assertEqual(c.check_ghcr(fake_get(routes), V)[0], 'ok')
        routes['https://ghcr.io/v2/amado2k5/cookwala-samples/tags/list'] = (200, {'tags': ['0.2.0']})
        self.assertEqual(c.check_ghcr(fake_get(routes), V)[0], 'lagging')

    def test_chocolatey(self):
        feed = (FIX / 'choco-feed-entry.xml').read_text()
        feed_url = "https://community.chocolatey.org/api/v2/Packages()?$filter=Id%20eq%20'cookwala-samples'%20and%20Version%20eq%20'" + V + "'"
        self.assertEqual(c.check_chocolatey(fake_get({feed_url: (200, feed)}), V)[0], 'ok')
        submitted = feed.replace('Approved', 'Submitted')
        self.assertEqual(c.check_chocolatey(fake_get({feed_url: (200, submitted)}), V)[0], 'lagging')
        self.assertEqual(c.check_chocolatey(fake_get({feed_url: (200, '<feed/>'), f'https://community.chocolatey.org/api/v2/package/cookwala-samples/{V}': (200, b'nupkg')}), V)[0], 'lagging')
        self.assertEqual(c.check_chocolatey(fake_get({feed_url: (200, '<feed/>')}), V)[0], 'missing')

    def test_scoop_aur_conda_snap(self):
        self.assertEqual(c.check_scoop_bucket(fake_get({'https://raw.githubusercontent.com/amado2k5/scoop-cookwala/main/bucket/cookwala-samples.json': (200, {'version': V})}), V)[0], 'ok')
        self.assertEqual(c.check_aur(fake_get({'https://aur.archlinux.org/rpc/v5/info/cookwala-samples': (200, {'resultcount': 1, 'results': [{'Version': V}]})}), V)[0], 'ok')
        self.assertEqual(c.check_aur(fake_get({'https://aur.archlinux.org/rpc/v5/info/cookwala-samples': (200, {'resultcount': 0})}), V)[0], 'missing')
        self.assertEqual(c.check_conda_forge(fake_get({'https://api.anaconda.org/package/conda-forge/cookwala-samples': (200, {'files': [{'version': V}]})}), V)[0], 'ok')
        self.assertEqual(c.check_snap(fake_get({'https://api.snapcraft.io/v2/snaps/info/cookwala-samples': (200, '{}')}), V)[0], 'ok')

    def test_alpine(self):
        buf = io.BytesIO()
        with tarfile.open(fileobj=buf, mode='w:gz') as t:
            data = f'P:cookwala-samples\nV:{V}\n'.encode()
            info = tarfile.TarInfo('APKINDEX'); info.size = len(data)
            t.addfile(info, io.BytesIO(data))
        routes = {'https://dl-cdn.alpinelinux.org/alpine/edge/community/x86_64/APKINDEX.tar.gz': (200, buf.getvalue())}
        self.assertEqual(c.check_alpine(fake_get(routes), V)[0], 'ok')
        self.assertEqual(c.check_alpine(fake_get({}), V)[0], 'missing')

    def test_workflow(self):
        chk = c.resolve_check('workflow:samples.yml')
        recent = {'workflow_runs': [{'created_at': (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=2)).isoformat().replace('+00:00', 'Z'), 'html_url': 'https://x/1'}]}
        url = f'https://api.github.com/repos/{c.REPO}/actions/workflows/samples.yml/runs?branch=main&status=success&per_page=1'
        self.assertEqual(chk(fake_get({url: (200, recent)}), V)[0], 'ok')
        old = {'workflow_runs': [{'created_at': (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=120)).isoformat().replace('+00:00', 'Z'), 'html_url': 'https://x/1'}]}
        self.assertEqual(chk(fake_get({url: (200, old)}), V)[0], 'missing')
        self.assertEqual(chk(fake_get({url: (200, {'workflow_runs': []})}), V)[0], 'missing')


if __name__ == '__main__':
    unittest.main()
