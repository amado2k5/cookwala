#!/usr/bin/env python3
"""Static files for the Cookwala MCP service (sdk/mcp-js), written into a built site directory.

    python tools/build_mcp_assets.py _site

Writes:
  v1/capabilities/<preset>.json + index.json   device presets for dry_run (from examples/capabilities)
  v1/fifi/collections.json                     per-collection text rights for the fifi.cooking bridge
  v1/mcp/server.json                           the MCP Registry manifest (copy of sdk/mcp-js/server.json)
  assets/mcp-core/*.js                         the pure JavaScript core, so /mcp/ can run every tool in the browser
Fails if server.json, package.json and the registry name disagree.
"""
import json
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
PKG = ROOT / 'sdk' / 'mcp-js'


def main(out):
    out = pathlib.Path(out)
    pkg = json.loads((PKG / 'package.json').read_text())
    srv = json.loads((PKG / 'server.json').read_text())
    problems = []
    if srv['name'] != pkg.get('mcpName'): problems.append(f"server.json name {srv['name']} != package.json mcpName {pkg.get('mcpName')}")
    if srv['version'] != pkg['version']: problems.append(f"server.json version {srv['version']} != package.json version {pkg['version']}")
    for p in srv.get('packages', []):
        if p.get('version') != srv['version']: problems.append(f"package entry version {p.get('version')} != {srv['version']}")
        if p.get('identifier') != pkg['name']: problems.append(f"package identifier {p.get('identifier')} != {pkg['name']}")
    if problems:
        print('\n'.join(problems), file=sys.stderr); return 1

    cap = out / 'v1' / 'capabilities'; cap.mkdir(parents=True, exist_ok=True)
    presets = []
    for p in sorted((ROOT / 'examples' / 'capabilities').glob('*.json')):
        d = json.loads(p.read_text())
        (cap / p.name).write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
        a = d.get('actor', {}); c = d.get('capabilities', {})
        presets.append({'id': p.stem, 'name': ' '.join(x for x in (a.get('vendor'), a.get('model')) if x) or p.stem, 'kind': a.get('kind'),
                        'roles': d.get('roles', []), 'ops': len(c.get('ops', [])), 'sensors': len(c.get('sensors', [])), 'url': f'/v1/capabilities/{p.name}'})
    (cap / 'index.json').write_text(json.dumps({'presets': presets}, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')

    fifi = out / 'v1' / 'fifi'; fifi.mkdir(parents=True, exist_ok=True)
    shutil.copy(ROOT / 'tools' / 'export_fifi.collections.json', fifi / 'collections.json')

    mcp = out / 'v1' / 'mcp'; mcp.mkdir(parents=True, exist_ok=True)
    shutil.copy(PKG / 'server.json', mcp / 'server.json')

    core = out / 'assets' / 'mcp-core'; core.mkdir(parents=True, exist_ok=True)
    for f in sorted((PKG / 'src' / 'core').glob('*.js')): shutil.copy(f, core / f.name)
    print(f'mcp assets: {len(presets)} presets, {len(list(core.glob("*.js")))} core modules, server {srv["name"]} {srv["version"]}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '_site'))
