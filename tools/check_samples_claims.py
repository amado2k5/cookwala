#!/usr/bin/env python3
"""Check every claim on the samples page against the public registry it names.

    python tools/check_samples_claims.py                    # live checks, exit 1 on an overstated tile
    python tools/check_samples_claims.py --report /tmp/claims.md
    python tools/check_samples_claims.py --tile Chocolatey --lag-wait 0

For every tile in samples/dist-channels.json that names a 'check':
  * status 'live' (and 'citested', 'oss-tested', 'repo'): the check must pass — a missing
    package or a stale/absent green run is a failure;
  * any other status: the check still runs, and a package that turns out to be live is a
    WARNING (the page understates), never a failure.

Maven Central and Chocolatey lag behind their own pipelines: a live check that finds the
package but not this version retries (3 attempts over ~10 minutes) and reports 'lagging'
instead of failing. A tile whose status claims less than reality warns but does not fail.

Standard library only. HTTP is injectable (the `get` parameter) so tests run offline.
"""
import argparse
import base64
import hashlib
import io
import json
import os
import pathlib
import re
import ssl
import sys
import tarfile
import time
import urllib.error
import urllib.request
import datetime as dt

try:
    import certifi
    _CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    _CTX = ssl.create_default_context()

ROOT = pathlib.Path(__file__).resolve().parents[1]
REPO = 'amado2k5/cookwala'
OWNER = REPO.split('/')[0]
UA = 'cookwala-claims-check/1.0'
LAG_CHECKS = {'maven', 'chocolatey'}          # these registries sync slowly after a push
ASSERT = {'live', 'citested', 'oss-tested', 'repo'}   # statuses whose check must pass
WORKFLOW_DAYS = 90


def http_get(url, headers=None):
    """(status, body bytes). 0 on a transport error; redirects followed."""
    req = urllib.request.Request(url, headers={'User-Agent': UA, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=30, context=_CTX) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read() or b''
    except OSError as e:
        return 0, str(e).encode()


def gh_headers():
    h = {'Accept': 'application/vnd.github+json'}
    if os.environ.get('GITHUB_TOKEN'):
        h['Authorization'] = f'Bearer {os.environ["GITHUB_TOKEN"]}'
    return h


def gh_release(get, v):
    code, body = get(f'https://api.github.com/repos/{REPO}/releases/tags/samples-v{v}', gh_headers())
    return json.loads(body) if code == 200 else None


def release_asset(get, rel, name):
    for a in rel.get('assets', []):
        if a['name'] == name:
            code, body = get(a['browser_download_url'])
            return body if code == 200 else None
    return None


def pyz_sha(get, rel):
    sums = release_asset(get, rel, 'SHA256SUMS')
    if not sums:
        return None
    for line in sums.decode().splitlines():
        h, _, f = line.partition('  ')
        if f.endswith('.pyz'):
            return h.strip()
    return None


# ---- one check per 'check' id in dist-channels.json; each returns (state, detail)
# state: 'ok' (claim verified) | 'missing' (not there) | 'lagging' (registry behind its pipeline)

def check_pypi(get, v):
    code, _ = get(f'https://pypi.org/pypi/cookwala-samples/{v}/json')
    if code == 200:
        return 'ok', f'pypi.org/pypi/cookwala-samples/{v}/json is 200'
    code2, _ = get('https://pypi.org/pypi/cookwala-samples/json')
    if code2 == 200:
        return 'lagging', f'the package exists but {v} is not listed yet'
    return 'missing', f'HTTP {code}'


def check_npm(get, v):
    code, _ = get(f'https://registry.npmjs.org/@cookwala%2fsamples/{v}')
    if code == 200:
        return 'ok', f'registry.npmjs.org has @cookwala/samples@{v}'
    code2, _ = get('https://registry.npmjs.org/@cookwala%2fsamples')
    if code2 == 200:
        return 'lagging', f'the package exists but {v} is not listed yet'
    return 'missing', f'HTTP {code}'


def check_maven(get, v):
    base = 'https://repo1.maven.org/maven2/ai/cookwala/cookwala-samples'
    code, _ = get(f'{base}/{v}/cookwala-samples-{v}.pom')
    if code == 200:
        return 'ok', f'repo1.maven.org has ai.cookwala:cookwala-samples:{v}'
    code2, _ = get(f'{base}/maven-metadata.xml')
    if code2 == 200:
        return 'lagging', f'the artifact exists on Central but {v} is not synced yet'
    return 'missing', f'HTTP {code}'


def _nuget(get, pkg, v):
    code, body = get(f'https://api.nuget.org/v3-flatcontainer/{pkg}/index.json')
    if code != 200:
        return 'missing', f'HTTP {code}'
    versions = json.loads(body).get('versions', [])
    if v in versions:
        return 'ok', f'nuget.org flat-container has {pkg} {v}'
    return ('lagging' if versions else 'missing'), f'{pkg} has {versions[-1] if versions else "no versions"}, not {v}'


def check_nuget(get, v):
    return _nuget(get, 'cookwala.samples', v)


def check_nuget_tool(get, v):
    return _nuget(get, 'cookwala.samples.tool', v)


def check_github_release(get, v):
    rel = gh_release(get, v)
    if rel is None:
        return 'missing', f'no release samples-v{v}'
    names = {a['name'] for a in rel.get('assets', [])}
    want = [f'cookwala-samples-{v}.pyz', f'cookwala-samples_{v}_all.deb', 'SHA256SUMS']
    kinds = {'wheel (.whl)': any(n.endswith('.whl') for n in names), 'sdist (.tar.gz)': any(n.endswith('.tar.gz') for n in names)}
    absent = [n for n in want if n not in names] + [k for k, ok in kinds.items() if not ok]
    if absent:
        return 'missing', f'release exists but lacks: {", ".join(absent)}'
    blob, expected = release_asset(get, rel, want[0]), pyz_sha(get, rel)
    if not blob or not expected:
        return 'missing', 'could not fetch the pyz or its SHA256SUMS line'
    if hashlib.sha256(blob).hexdigest() != expected:
        return 'missing', f'{want[0]} sha256 does not match SHA256SUMS'
    return 'ok', f'release samples-v{v} has pyz, deb, wheel, sdist, SHA256SUMS; pyz hash matches'


def _gh_asset(ext):
    def c(get, v):
        rel = gh_release(get, v)
        if rel is None:
            return 'missing', f'no release samples-v{v}'
        if any(a['name'].endswith(ext) for a in rel.get('assets', [])):
            return 'ok', f'release samples-v{v} carries a {ext} asset'
        return 'missing', f'release samples-v{v} has no {ext} asset'
    return c


def check_homebrew_tap(get, v):
    code, body = get('https://raw.githubusercontent.com/amado2k5/homebrew-cookwala/main/Formula/cookwala-samples.rb')
    if code != 200:
        return 'missing', f'HTTP {code} fetching the formula'
    text = body.decode('utf-8', 'replace')
    if f'samples-v{v}/' not in text:
        return 'lagging', 'the tap formula points at a different version'
    rel, expected = gh_release(get, v), None
    expected = pyz_sha(get, rel) if rel else None
    if expected and expected not in text:
        return 'missing', 'the formula sha256 does not match the release pyz'
    return 'ok', 'the tap formula has this version’s URL and sha256'


def check_ghcr(get, v):
    code, body = get(f'https://ghcr.io/token?scope=repository:{OWNER}/cookwala-samples:pull')
    if code != 200:
        return 'missing', f'GHCR token endpoint HTTP {code}'
    token = json.loads(body)['token']
    code, body = get(f'https://ghcr.io/v2/{OWNER}/cookwala-samples/tags/list', {'Authorization': f'Bearer {token}'})
    if code != 200:
        return 'missing', f'GHCR tags/list HTTP {code}'
    if v in json.loads(body).get('tags', []):
        return 'ok', f'ghcr.io/{OWNER}/cookwala-samples:{v} exists'
    return 'lagging', f'tags exist ({json.loads(body).get("tags")}) but not {v}'


def check_chocolatey(get, v):
    code, body = get("https://community.chocolatey.org/api/v2/Packages()?$filter=Id%20eq%20'cookwala-samples'%20and%20Version%20eq%20'" + v + "'")
    if code == 200 and b'<entry>' in body:
        m = re.search(rb'<d:PackageStatus>([^<]+)', body)
        st = m.group(1).decode() if m else ''
        if st.lower() in ('approved', 'exempted'):
            return 'ok', f'the community feed lists cookwala-samples {v} (status {st})'
        return 'lagging', f'the feed carries {v} with status {st!r}: in moderation, not installable'
    code2, _ = get(f'https://community.chocolatey.org/api/v2/package/cookwala-samples/{v}')
    if code2 == 200:
        return 'lagging', 'the nupkg downloads but the feed does not list it yet (moderation)'
    return 'missing', 'no feed entry and no downloadable nupkg'


def check_scoop_bucket(get, v):
    code, body = get('https://raw.githubusercontent.com/amado2k5/scoop-cookwala/main/bucket/cookwala-samples.json')
    if code != 200:
        return 'missing', f'HTTP {code} fetching the bucket manifest'
    try:
        mv = json.loads(body).get('version')
    except ValueError:
        return 'missing', 'the bucket manifest does not parse'
    if mv == v:
        return 'ok', 'the scoop bucket manifest installs this version'
    return 'lagging', f'the bucket manifest is at {mv}, not {v}'


def check_aur(get, v):
    code, body = get('https://aur.archlinux.org/rpc/v5/info/cookwala-samples')
    if code == 200 and json.loads(body).get('resultcount', 0) > 0:
        found = [r.get('Version') for r in json.loads(body).get('results', [])]
        return ('ok' if v in found else 'lagging'), f'AUR lists cookwala-samples {found}'
    return 'missing', 'the AUR knows no cookwala-samples'


def check_conda_forge(get, v):
    code, body = get('https://api.anaconda.org/package/conda-forge/cookwala-samples')
    if code != 200:
        return 'missing', f'HTTP {code}'
    files = json.loads(body).get('files', [])
    if any(f.get('version') == v for f in files):
        return 'ok', f'conda-forge has cookwala-samples {v}'
    return 'lagging', 'conda-forge has the package but not this version'


def check_snap(get, v):
    code, _ = get('https://api.snapcraft.io/v2/snaps/info/cookwala-samples', {'Snap-Device-Series': '16'})
    if code == 200:
        return 'ok', 'the Snap Store lists cookwala-samples'
    return 'missing', f'Snap Store API HTTP {code}'


def check_alpine(get, v):
    code, body = get('https://dl-cdn.alpinelinux.org/alpine/edge/community/x86_64/APKINDEX.tar.gz')
    if code != 200:
        return 'missing', f'HTTP {code} fetching APKINDEX'
    with tarfile.open(fileobj=io.BytesIO(body), mode='r:gz') as t:
        index = t.extractfile('APKINDEX').read().decode('utf-8', 'replace')
    hit = [l for l in index.splitlines() if l == 'P:cookwala-samples']
    if hit:
        ver = index.split('P:cookwala-samples', 1)[1].split('V:', 1)[1].splitlines()[0]
        return ('ok' if ver == v else 'lagging'), f'Alpine edge/community has cookwala-samples {ver}'
    return 'missing', 'no cookwala-samples in edge/community'


def check_rpm(get, v):
    code, _ = get('https://src.fedoraproject.org/api/0/rpms/cookwala-samples')
    if code == 200:
        return 'ok', 'cookwala-samples is a Fedora source package'
    code, _ = get(f'https://copr.fedorainfracloud.org/api_3/project/{OWNER}/cookwala')
    if code == 200:
        return 'ok', 'a cookwala COPR project exists'
    return 'missing', 'not in Fedora and no cookwala COPR'


def check_workflow(name):
    def c(get, v):
        code, body = get(f'https://api.github.com/repos/{REPO}/actions/workflows/{name}/runs?branch=main&status=success&per_page=1', gh_headers())
        if code != 200:
            return 'missing', f'Actions API HTTP {code}'
        runs = json.loads(body).get('workflow_runs', [])
        if not runs:
            return 'missing', f'{name} has no successful run on main'
        age = (dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(runs[0]['created_at'].replace('Z', '+00:00'))).days
        if age <= WORKFLOW_DAYS:
            return 'ok', f'{name} last succeeded on main {age}d ago ({runs[0]["html_url"]})'
        return 'missing', f'{name}’s last green run on main is {age}d old'
    return c


CHECKS = {
    'pypi': check_pypi, 'npm': check_npm, 'maven': check_maven,
    'nuget': check_nuget, 'nuget-tool': check_nuget_tool,
    'github-release': check_github_release, 'gh-asset:pyz': _gh_asset('.pyz'), 'gh-asset:deb': _gh_asset('.deb'),
    'homebrew-tap': check_homebrew_tap, 'ghcr': check_ghcr, 'chocolatey': check_chocolatey,
    'scoop-bucket': check_scoop_bucket, 'aur': check_aur, 'conda-forge': check_conda_forge,
    'snap': check_snap, 'alpine': check_alpine, 'rpm': check_rpm,
}


def resolve_check(cid):
    if cid.startswith('workflow:'):
        return check_workflow(cid.split(':', 1)[1])
    return CHECKS.get(cid)


def classify(status, state):
    """(verdict, why): fail = the page overstates; warn = lagging registry or the page understates."""
    if state == 'lagging':
        return 'warn', 'lagging'
    if status in ASSERT:
        return ('ok', 'verified') if state == 'ok' else ('fail', 'claimed but not verified')
    return ('warn', 'live but not claimed') if state == 'ok' else ('ok', 'not live, as claimed')


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--version', default=(ROOT / 'samples' / 'VERSION').read_text().strip())
    ap.add_argument('--channels', default=str(ROOT / 'samples' / 'dist-channels.json'))
    ap.add_argument('--tile', help='check one tile by name')
    ap.add_argument('--lag-wait', type=int, default=300, help='seconds between lag retries (0 to disable)')
    ap.add_argument('--report', help='write a Markdown report to this file')
    a = ap.parse_args()

    tiles = [t for g in json.loads(pathlib.Path(a.channels).read_text())['groups'] for t in g['tiles']]
    if a.tile:
        tiles = [t for t in tiles if t['name'].lower() == a.tile.lower()]
    rows, fails, warns = [], 0, 0
    for t in tiles:
        cid = t.get('check')
        if not cid:
            rows.append((t['name'], t['status'], '-', f'no public check for {t["status"]}')); continue
        fn = resolve_check(cid)
        if fn is None:
            rows.append((t['name'], t['status'], 'fail', f'unknown check id {cid!r}')); fails += 1; continue
        state, detail = fn(http_get, a.version)
        attempts = 1
        while state == 'missing' and cid in LAG_CHECKS and t['status'] in ASSERT and a.lag_wait and attempts < 3:
            time.sleep(a.lag_wait)
            state, detail = fn(http_get, a.version); attempts += 1
            if state != 'missing':
                detail += f' (after retry {attempts})'
        verdict, why = classify(t['status'], state)
        if verdict == 'fail':
            fails += 1
        elif verdict == 'warn':
            warns += 1
        rows.append((t['name'], t['status'], verdict, f'{cid}: {why} — {detail}'))

    lines = ['# Samples page claims check', '',
             f'Version `{a.version}`, {len(rows)} tiles, {fails} failure(s), {warns} warning(s).', '',
             '| Tile | Status claimed | Verdict | Check |', '|---|---|---|---|']
    for r in rows:
        lines.append('| ' + ' | '.join(r) + ' |')
    text = '\n'.join(lines)
    print(text)
    if a.report:
        pathlib.Path(a.report).write_text(text)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
