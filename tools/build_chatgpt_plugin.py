#!/usr/bin/env python3
"""Validate and package the ChatGPT plugin in plugins/chatgpt/cookwala.

Checks the limits OpenAI documents for plugin submission (developers.openai.com/plugins/deploy/submission), then
writes build/cookwala-chatgpt-plugin-<version>.zip with the plugin folder contents at the ZIP root.

  python tools/build_chatgpt_plugin.py            # validate, then build the ZIP
  python tools/build_chatgpt_plugin.py --check    # validate only (exits 1 on an error)
  python tools/build_chatgpt_plugin.py --final    # also require the fields only you can supply (demo recording)
"""
import json, re, sys, zipfile
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent.parent
PKG = ROOT / 'plugins' / 'chatgpt' / 'cookwala'
IMG = {'.png', '.jpg', '.jpeg', '.webp', '.svg'}
errors, warnings = [], []


def err(m): errors.append(m)
def warn(m): warnings.append(m)


def need(cond, msg):
    if not cond: err(msg)


def https(u, field):
    need(isinstance(u, str) and u.startswith('https://') and len(u) <= 1024 and '@' not in u.split('/')[2], f'{field}: must be an https URL of at most 1024 characters with no credentials')


def rel(path, field):
    need(isinstance(path, str) and path.startswith('./'), f'{field}: path must start with ./')
    need(isinstance(path, str) and (PKG / path).is_file(), f'{field}: file not found: {path}')


def servers_url(mcp):
    return next(iter(mcp.get('mcpServers', {}).values()), {}).get('url', '\0')


def check(final):
    mf = PKG / 'plugin.json'
    need(mf.is_file(), 'plugin.json missing at the plugin root')
    if not mf.is_file(): return None
    m = json.loads(mf.read_text(encoding='utf-8'))
    need(m.get('$schema') == 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', '$schema must be the Agent Plugins plugin schema')
    need(re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', m.get('name', '')) and len(m.get('name', '')) <= 64, 'name: lowercase letters, numbers and single hyphens, at most 64 characters')
    need(re.fullmatch(r'\d+\.\d+\.\d+', m.get('version', '')), 'version: use an explicit semantic version')
    need(0 < len(m.get('description', '')) <= 4000, 'description: 1 to 4000 characters')
    need(0 < len(m.get('author', {}).get('name', '')) <= 120, 'author.name: 1 to 120 characters')
    if m.get('author', {}).get('url'): https(m['author']['url'], 'author.url')
    need(len(m.get('author', {}).get('email', '')) <= 320, 'author.email: at most 320 characters')
    need('gmail.com' not in json.dumps(m), 'no personal address may appear in the package; use eat@cookwala.ai')
    for forbidden in ('apps', 'hooks'):
        need(forbidden not in m and forbidden not in m.get('extensions', {}).get('com.openai', {}), f'"{forbidden}" is not allowed: such ZIPs cannot be submitted')
    need(not (PKG / '.app.json').exists() and not (PKG / 'hooks').exists(), '.app.json and hooks/ must not be in the package')

    o = m.get('extensions', {}).get('com.openai', {})
    i = o.get('interface', {})
    for f, n in (('displayName', 30), ('shortDescription', 30), ('longDescription', 4000), ('developerName', 80)):
        need(0 < len(i.get(f, '')) <= n, f'interface.{f}: 1 to {n} characters')
    CATEGORIES = ('Productivity', 'Creativity', 'Developer Tools', 'Business & Operations', 'Data & Analytics', 'Communication', 'Education & Research', 'Security', 'Finance', 'Healthcare', 'Travel', 'Entertainment', 'Other')
    need(i.get('category') in CATEGORIES, 'interface.category must be one of: ' + ', '.join(CATEGORIES))
    need(isinstance(i.get('capabilities'), list) and len(i['capabilities']) <= 20 and all(len(c) <= 120 for c in i['capabilities']), 'interface.capabilities: a list of at most 20 items of at most 120 characters')
    for f in ('websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL'): https(i.get(f), f'interface.{f}')
    dp = i.get('defaultPrompt', [])
    need(len(dp) <= 3 and all(len(p) <= 128 for p in dp), 'interface.defaultPrompt: at most 3 prompts of at most 128 characters')
    for f in ('logo', 'logoDark', 'composerIcon', 'composerIconDark'):
        rel(i.get(f), f'interface.{f}')
        p = PKG / i.get(f, '')
        if p.is_file():
            need(p.suffix.lower() in IMG, f'interface.{f}: PNG, JPEG, WebP or SVG only')
            need(p.stat().st_size <= 5 * 1024 * 1024, f'interface.{f}: at most 5 MiB')
            if p.suffix.lower() == '.svg':
                vb = re.search(r'viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"', p.read_text(encoding='utf-8'))
                need(bool(vb) and vb.group(1) == vb.group(2) and float(vb.group(1)) >= 48, f'interface.{f}: SVG needs a square viewBox of at least 48x48')
    if o.get('onboardingSkill'): rel(o['onboardingSkill'], 'onboardingSkill')
    # naming rules from the plugin guidelines
    need(not re.search(r'\b(mcp|plugin)\b', i.get('displayName', ''), re.I), 'displayName must not include "MCP" or "Plugin"')
    for f in ('shortDescription', 'longDescription'):
        need(not re.search(r'\bfree\b|discount|trial|subscription|price', i.get(f, ''), re.I), f'interface.{f}: do not advertise pricing or promotions')

    tc = o.get('review', {}).get('test_cases', {})
    pos, neg = tc.get('positive', []), tc.get('negative', [])
    need(len(pos) == 5, f'review.test_cases.positive: initial MCP review requires exactly 5, found {len(pos)}')
    need(len(neg) == 3, f'review.test_cases.negative: initial MCP review requires exactly 3, found {len(neg)}')
    for n, c in enumerate(pos): need(all(c.get(k) for k in ('description', 'prompt', 'tools_triggered', 'expected_behavior')), f'positive case {n + 1}: description, prompt, tools_triggered and expected_behavior are required')
    for n, c in enumerate(pos): need(isinstance(c.get('tools_triggered'), str), f'positive case {n + 1}: tools_triggered must be a single string (comma-separated tool names), not a list')
    for n, c in enumerate(pos + neg): need(all(isinstance(c.get(k), str) for k in ('description', 'prompt', 'expected_behavior')), f'test case {n + 1}: description, prompt and expected_behavior must be strings')
    for n, c in enumerate(neg): need(all(c.get(k) for k in ('description', 'prompt', 'expected_behavior')), f'negative case {n + 1}: description, prompt and expected_behavior are required')
    if o.get('review', {}).get('demo_recording_url'): https(o['review']['demo_recording_url'], 'review.demo_recording_url')
    else: (err if final else warn)('review.demo_recording_url: required for MCP review; record it and add the URL before submitting')

    # tool names named in tools_triggered must exist on the server
    known = set(re.findall(r"name: '([a-z_]+)', title:", (ROOT / 'sdk' / 'mcp-js' / 'src' / 'server.js').read_text(encoding='utf-8')))
    for n, c in enumerate(pos):
        for t in re.split(r'\s*,\s*', c.get('tools_triggered', '')):
            need(t in known, f'positive case {n + 1}: tools_triggered names unknown tool "{t}"')
    prompts = [c.get('prompt') for c in pos + neg]
    need(len(set(prompts)) == len(prompts), 'test-case prompts must be unique')
    need(len(set(dp)) == len(dp), 'interface.defaultPrompt: prompts must be unique')
    # colours: #RRGGBB, at least 2:1 against white (light) and #212121 (dark)
    def lum(h):
        c = [int(h[k:k + 2], 16) / 255 for k in (1, 3, 5)]
        c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    def ratio(a, b):
        la, lb = sorted((lum(a), lum(b)), reverse=True)
        return (la + 0.05) / (lb + 0.05)
    for f, bg in (('brandColor', '#ffffff'), ('brandColorDark', '#212121')):
        if i.get(f):
            ok = re.fullmatch(r'#[0-9A-Fa-f]{6}', i[f]) is not None
            need(ok, f'interface.{f}: use #RRGGBB')
            if ok: need(ratio(i[f], bg) >= 2, f'interface.{f}: needs at least 2:1 contrast against {bg}')
    for k, v in (o.get('publication', {}).get('translations') or {}).items():
        v = v or {}
        need(bool(k) and re.fullmatch(r'[a-z]{2,3}(-[A-Z]{2})?', k) is not None, f'translations.{k}: use a locale such as fr-FR')
        sub, desc = v.get('subtitle') or '', v.get('description') or ''
        need(len(sub) <= 30 and '\n' not in sub, f'translations.{k}.subtitle: one line of at most 30 characters')
        need(len(desc) <= 4000 and '\t' not in desc, f'translations.{k}.description: at most 4000 characters, no tabs')
        need(bool(sub.strip() or desc.strip()), f'translations.{k}: needs a subtitle or a description')
    need(all(re.fullmatch(r'[A-Z]{2}', c) for c in o.get('publication', {}).get('countries', [])), 'publication.countries: uppercase country codes')
    blob = json.dumps(m)
    need('test_credentials' not in blob and 'reviewer_instructions' not in blob, 'metadata must not contain test_credentials or reviewer_instructions')

    mcp = json.loads((PKG / 'mcp.json').read_text(encoding='utf-8')) if (PKG / 'mcp.json').is_file() else {}
    servers = mcp.get('mcpServers', {})
    need(len(servers) == 1, f'mcp.json: exactly one MCP server is allowed, found {len(servers)}')
    for name, s in servers.items():
        need(s.get('type') == 'streamable-http', f'mcp.json {name}: type must be streamable-http')
        https(s.get('url'), f'mcp.json {name}.url')

    skills = sorted((PKG / 'skills').glob('*/SKILL.md'))
    need(bool(skills), 'skills/: at least one SKILL.md is expected')
    for s in skills:
        fm = re.match(r'---\n(.*?)\n---\n', s.read_text(encoding='utf-8'), re.S)
        need(bool(fm) and re.search(r'^name: \S', fm.group(1), re.M) and re.search(r'^description: \S', fm.group(1), re.M), f'{s.relative_to(PKG)}: front matter needs name and description')
        agent = s.parent / 'agents' / 'openai.yaml'
        if agent.is_file():
            label = agent.relative_to(PKG)
            try:
                metadata = yaml.safe_load(agent.read_text(encoding='utf-8'))
            except (yaml.YAMLError, UnicodeError) as e:
                err(f'{label}: invalid YAML: {e}')
                continue
            need(isinstance(metadata, dict), f'{label}: must be a YAML mapping')
            interface = metadata.get('interface') if isinstance(metadata, dict) else None
            need(isinstance(interface, dict), f'{label}: interface must be a mapping')
            for field in ('display_name', 'short_description'):
                value = interface.get(field) if isinstance(interface, dict) else None
                need(isinstance(value, str) and bool(value.strip()), f'{label}: interface.{field} must be a nonblank string')
    dep = PKG / 'skills' / 'cookwala' / 'agents' / 'openai.yaml'
    need(dep.is_file() and 'streamable_http' in dep.read_text(encoding='utf-8') and servers_url(mcp) in dep.read_text(encoding='utf-8'), 'skills/cookwala/agents/openai.yaml must declare the MCP dependency with the same URL as mcp.json')
    for f in PKG.rglob('*'):
        need(not (f.is_file() and re.search(r'(token|secret|password|\.env)', f.name, re.I)), f'{f.relative_to(PKG)}: looks like a credential file')
    return m


def main():
    final = '--final' in sys.argv
    m = check(final)
    for w in warnings: print('warning:', w)
    for e in errors: print('error:', e)
    if errors: sys.exit(1)
    print(f'plugin.json ok ({m["name"]} {m["version"]}): {len(list((PKG / "skills").glob("*/SKILL.md")))} skills, 1 MCP server')
    if '--check' in sys.argv: return
    out = ROOT / 'build'; out.mkdir(exist_ok=True)
    z = out / f'cookwala-chatgpt-plugin-{m["version"]}.zip'
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(PKG.rglob('*')):
            if f.is_file(): zf.write(f, f.relative_to(PKG).as_posix())
    print('wrote', z.relative_to(ROOT), f'({z.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
