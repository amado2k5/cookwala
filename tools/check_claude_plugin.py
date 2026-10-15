#!/usr/bin/env python3
"""Check plugins/claude/cookwala: manifest fields, MCP URL equals the ChatGPT package, skills match it.
Usage: python tools/check_claude_plugin.py   (exits 1 on an error)"""
import json, re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
C = ROOT / 'plugins/claude/cookwala'
G = ROOT / 'plugins/chatgpt/cookwala'
errs = []
def need(c, m):
    if not c: errs.append(m)
m = json.loads((C / '.claude-plugin/plugin.json').read_text(encoding='utf-8'))
need(re.fullmatch(r'[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?', m.get('name', '')), 'plugin.json name must be lowercase letters, digits, hyphens, up to 64')
for k in ('displayName', 'version', 'description', 'author', 'license'): need(m.get(k), f'plugin.json: {k} is required')
g = json.loads((G / 'plugin.json').read_text(encoding='utf-8'))
need(m['description'] == g['description'], 'description differs from plugins/chatgpt/cookwala/plugin.json')
mcp = json.loads((C / '.mcp.json').read_text(encoding='utf-8'))['mcpServers']
gm = json.loads((G / 'mcp.json').read_text(encoding='utf-8'))['mcpServers']
need(len(mcp) == 1 and next(iter(mcp.values())).get('type') == 'http', '.mcp.json: one server of type http')
need(next(iter(mcp.values()))['url'] == next(iter(gm.values()))['url'], '.mcp.json URL differs from the ChatGPT package')
words = len(re.findall(r'\w+', re.sub(r'```.*?```', '', (C / 'README.md').read_text(encoding='utf-8'), flags=re.S)))
need(words >= 40, 'README needs at least 40 words')
need((C / 'LICENSE').is_file() or m.get('license'), 'LICENSE or license field required')
for f in C.rglob('*'):
    if f.is_file(): need(f.stat().st_size < 256 * 1024, f'{f} is over 256 KiB')
    need(f.name not in ('.DS_Store', 'Thumbs.db'), f'system file {f}')
pairs = {'cookwala-recipes': 'cookwala', 'cookwala-get-started': 'get-started'}
for cn, gn in pairs.items():
    s = C / 'skills' / cn / 'SKILL.md'
    t = s.read_text(encoding='utf-8')
    need(re.search(rf'^name: {cn}$', t, re.M), f'{s}: name must equal folder {cn}')
    need(re.search(r'^description: .+', t, re.M), f'{s}: description required')
    src = (G / 'skills' / gn / 'SKILL.md').read_text(encoding='utf-8')
    need(t.replace(f'name: {cn}', 'name: x') == src.replace('name: get-started', 'name: x').replace('name: cookwala-recipes', 'name: x'), f'{s} drifted from plugins/chatgpt/cookwala/skills/{gn}/SKILL.md')
need((C / 'skills/cookwala-recipes/references/filters.md').read_bytes() == (G / 'skills/cookwala/references/filters.md').read_bytes(), 'filters.md drifted from the ChatGPT copy')
for e in errs: print('ERROR', e)
if errs: sys.exit(1)
print(f'claude plugin ok ({m["name"]} {m["version"]})')
