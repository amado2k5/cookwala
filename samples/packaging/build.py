#!/usr/bin/env python3
"""Build the Cookwala samples distributables and render every package-manager manifest.

    python samples/packaging/build.py                 # pyz, wheel, sdist, deb, rendered manifests -> samples/build/
    python samples/packaging/build.py --check-versions  # every manifest carries samples/VERSION (CI)

Outputs in samples/build/:
  cookwala-samples-<v>.pyz        one file, runs on any Python 3.9+: the payload of the OS packages
  cookwala_samples-<v>-py3-none-any.whl, cookwala_samples-<v>.tar.gz   PyPI (needs `pip install build`; skipped if missing)
  cookwala-samples_<v>_all.deb    apt (needs dpkg-deb; skipped if missing)
  manifests/                      Homebrew, Chocolatey, Scoop, winget, RPM spec, PKGBUILD, APKBUILD, conda, snap, with sha256 filled in
  SHA256SUMS

Release assets are expected at
  https://github.com/amado2k5/cookwala/releases/download/samples-v<v>/<file>
Override with --base-url when publishing elsewhere (an Artifactory generic repository, for example).
"""
import argparse
import hashlib
import importlib.util
import pathlib
import re
import shutil
import subprocess
import sys
import zipapp

HERE = pathlib.Path(__file__).resolve().parent
SAMPLES = HERE.parent
ROOT = SAMPLES.parent
VERSION = (SAMPLES / 'VERSION').read_text().strip()
BUILD = SAMPLES / 'build'
DEFAULT_BASE = 'https://github.com/amado2k5/cookwala/releases/download/samples-v{v}'


def sha256(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()


def build_pyz():
    stage = BUILD / 'pyz-stage'
    shutil.rmtree(stage, ignore_errors=True)
    shutil.copytree(SAMPLES / 'python' / 'cookwala_samples', stage / 'cookwala_samples', ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    (stage / '__main__.py').write_text('import sys\nfrom cookwala_samples.cli import main\n\nsys.exit(main())\n')
    out = BUILD / f'cookwala-samples-{VERSION}.pyz'
    zipapp.create_archive(stage, out, interpreter='/usr/bin/env python3', compressed=True)
    shutil.rmtree(stage)
    return out


def build_python():
    if importlib.util.find_spec('build') is None:
        print('skip wheel/sdist: pip install build'); return []
    subprocess.check_call([sys.executable, '-m', 'build', '--outdir', str(BUILD), str(SAMPLES / 'python')])
    return sorted(BUILD.glob('cookwala_samples-*'))


def build_deb(pyz):
    if not shutil.which('dpkg-deb'):
        print('skip deb: dpkg-deb not found'); return None
    root = BUILD / 'deb-root'
    shutil.rmtree(root, ignore_errors=True)
    (root / 'DEBIAN').mkdir(parents=True)
    lib = root / 'usr' / 'lib' / 'cookwala-samples'; lib.mkdir(parents=True)
    shutil.copy(pyz, lib / 'cookwala-samples.pyz')
    (lib / 'cookwala-samples.pyz').chmod(0o644)
    bindir = root / 'usr' / 'bin'; bindir.mkdir(parents=True)
    (bindir / 'cookwala-samples').write_text('#!/bin/sh\nexec python3 /usr/lib/cookwala-samples/cookwala-samples.pyz "$@"\n')
    (bindir / 'cookwala-samples').chmod(0o755)
    doc = root / 'usr' / 'share' / 'doc' / 'cookwala-samples'; doc.mkdir(parents=True)
    shutil.copy(HERE / 'linux' / 'copyright', doc / 'copyright')
    size_kb = sum(f.stat().st_size for f in root.rglob('*') if f.is_file()) // 1024 + 1
    control = (HERE / 'linux' / 'debian-control.in').read_text().replace('{{VERSION}}', VERSION).replace('{{SIZE_KB}}', str(size_kb))
    (root / 'DEBIAN' / 'control').write_text(control)
    out = BUILD / f'cookwala-samples_{VERSION}_all.deb'
    subprocess.check_call(['dpkg-deb', '--root-owner-group', '--build', str(root), str(out)], stdout=subprocess.DEVNULL)
    shutil.rmtree(root)
    return out


def render(base_url, hashes):
    out = BUILD / 'manifests'
    shutil.rmtree(out, ignore_errors=True)
    for tpl in sorted(HERE.rglob('*.in')):
        rel = tpl.relative_to(HERE)
        if rel.parts[0] == 'linux' and rel.name == 'debian-control.in':
            continue
        text = tpl.read_text()
        text = text.replace('{{VERSION}}', VERSION).replace('{{BASE_URL}}', base_url)
        for name, h in hashes.items():
            text = text.replace('{{SHA256:' + name + '}}', h)
        text = re.sub(r'\{\{SHA256:[a-z]+\}\}', 'SHA256-OF-AN-ARTIFACT-NOT-BUILT-HERE', text)  # e.g. the sdist when `build` is not installed
        dest = out / rel.with_suffix('')
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text)
    return out


MANIFESTS = {
    'python/pyproject.toml': r'^version = "([^"]+)"',
    'js/package.json': r'"version":\s*"([^"]+)"',
    'java/pom.xml': r'<artifactId>cookwala-samples</artifactId>\s*<version>([^<]+)</version>',
    'java/build.gradle.kts': r'version\s*=\s*"([^"]+)"',
    'dotnet/src/Cookwala.Samples/Cookwala.Samples.csproj': r'<Version>([^<]+)</Version>',
    'dotnet/src/Cookwala.Samples.Cli/Cookwala.Samples.Cli.csproj': r'<Version>([^<]+)</Version>',
    'python/cookwala_samples/__init__.py': r"__version__ = '([^']+)'",
    'packaging/snap/snapcraft.yaml': r"^version: '([^']+)'",
    'packaging/helm/cookwala-samples/Chart.yaml': r'^appVersion: "([^"]+)"',
    'cloud/azure-functions/requirements.txt': r'cookwala-samples==(\S+)',
    'cloud/aws-lambda/requirements.txt': r'cookwala-samples==(\S+)',
    'cloud/gcp-functions/requirements.txt': r'cookwala-samples==(\S+)',
}


def check_versions():
    bad = []
    for rel, rx in MANIFESTS.items():
        p = SAMPLES / rel
        if not p.exists():
            bad.append(f'{rel}: missing'); continue
        m = re.search(rx, p.read_text(), re.M)
        if not m or m.group(1) != VERSION:
            bad.append(f'{rel}: {m.group(1) if m else "no version found"} != {VERSION}')
    print('\n'.join(bad) if bad else f'all manifests at {VERSION}')
    return 1 if bad else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-url', default=DEFAULT_BASE.format(v=VERSION))
    ap.add_argument('--check-versions', action='store_true')
    a = ap.parse_args()
    if a.check_versions:
        return check_versions()
    BUILD.mkdir(exist_ok=True)
    pyz = build_pyz()
    files = [pyz, *build_python()]
    deb = build_deb(pyz)
    if deb: files.append(deb)
    hashes = {'pyz': sha256(pyz)}
    sdist = next((f for f in files if f.name.endswith('.tar.gz')), None)
    if sdist: hashes['sdist'] = sha256(sdist)
    out = render(a.base_url, hashes)
    (BUILD / 'SHA256SUMS').write_text(''.join(f'{sha256(f)}  {f.name}\n' for f in files))
    print('built:\n  ' + '\n  '.join(str(f.relative_to(ROOT)) for f in files) + f'\nmanifests: {out.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
