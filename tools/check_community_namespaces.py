#!/usr/bin/env python3
"""Check recipes/community/: every recipe id matches a claimed, non-reserved prefix and the
prefix was claimed by the GitHub login opening this pull request (docs/CONTRIBUTE-RECIPES.md,
RFC-0013). Exit 0 if everything checks out, 1 otherwise. Also importable: `check(root, author)`.

Usage:
  python tools/check_community_namespaces.py                 # structural checks only
  python tools/check_community_namespaces.py --author LOGIN  # also checks ownership of any
                                                               # prefix newly claimed or used
                                                               # for the first time by this PR
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
COMMUNITY = ROOT / 'recipes' / 'community'
NAMESPACES_FILE = COMMUNITY / 'NAMESPACES.json'


def _load_namespaces():
    data = json.loads(NAMESPACES_FILE.read_text())
    reserved = list(data.get('reservedPrefixes', []))
    claimed = {}
    for ns in data.get('namespaces', []):
        prefix = ns['prefix']
        if prefix in claimed:
            raise ValueError(f'prefix {prefix!r} is claimed twice in NAMESPACES.json')
        claimed[prefix] = ns
    return reserved, claimed


def check(root: pathlib.Path = ROOT, author: str | None = None) -> list[str]:
    """Return a list of problems (empty = ok)."""
    problems = []
    community = root / 'recipes' / 'community'
    if not community.exists():
        return problems

    try:
        reserved, claimed = _load_namespaces()
    except Exception as e:
        return [f'recipes/community/NAMESPACES.json: {e}']

    for prefix in claimed:
        if not (len(prefix) >= 3 and prefix[-1] == '-' and prefix[:-1].replace('-', 'x').isalnum() and prefix[0].isalpha() and prefix.islower()):
            problems.append(f'NAMESPACES.json: {prefix!r} is not a valid prefix (lowercase letters/digits/hyphens, 2-16 chars, ending in a hyphen)')
        for r in reserved:
            if prefix.startswith(r) or r.startswith(prefix):
                problems.append(f'NAMESPACES.json: claimed prefix {prefix!r} collides with reserved prefix {r!r}')

    seen_prefixes = set()
    for dirpath in sorted(p for p in community.iterdir() if p.is_dir()):
        dirname = dirpath.name
        recipe_files = sorted(dirpath.rglob('*.cookwala.json'))
        if not recipe_files:
            continue
        for path in recipe_files:
            doc = json.loads(path.read_text())
            rid = doc.get('id', '')
            matching = [p for p in claimed if rid.startswith(p)]
            if not matching:
                problems.append(f'{path.relative_to(root)}: id {rid!r} does not start with any prefix claimed in NAMESPACES.json '
                                 '(claim it there in the same pull request, docs/CONTRIBUTE-RECIPES.md)')
                continue
            for r in reserved:
                if rid.startswith(r):
                    problems.append(f'{path.relative_to(root)}: id {rid!r} uses reserved prefix {r!r}')
            seen_prefixes.update(matching)
            prefix = max(matching, key=len)
            if dirname != prefix.rstrip('-'):
                problems.append(f'{path.relative_to(root)}: lives under recipes/community/{dirname}/ but its id prefix is {prefix!r}; '
                                 f'put it under recipes/community/{prefix.rstrip("-")}/')

    if author:
        for prefix in seen_prefixes:
            owner = claimed[prefix]['owner']
            if owner != author:
                problems.append(f'prefix {prefix!r} is owned by {owner!r} on GitHub; this pull request is from {author!r} '
                                 'and may not add recipes under it')

    return problems


if __name__ == '__main__':
    author = None
    args = sys.argv[1:]
    if '--author' in args:
        author = args[args.index('--author') + 1]
    problems = check(ROOT, author)
    for p in problems:
        print(f'  {p}')
    print(f'recipes/community/: {"ok" if not problems else f"{len(problems)} problem(s)"}')
    sys.exit(1 if problems else 0)
