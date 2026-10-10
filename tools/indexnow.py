"""IndexNow for cookwala.ai: tell Bing, Yandex, Naver, Seznam (and through Bing, DuckDuckGo, Ecosia, Yahoo, Qwant) which pages changed.

Standard library only.

    python tools/indexnow.py manifest OUT            write OUT/indexnow-manifest.json (page path -> sha256 of its HTML)
    python tools/indexnow.py changed OUT FILE         compare with the live manifest, write the changed URLs to FILE
    python tools/indexnow.py submit FILE [--dry-run]  POST the URLs in FILE to api.indexnow.org

The key file is site/<KEY>.txt (copied to the site root by build_site.sh); the protocol needs it at
https://cookwala.ai/<KEY>.txt. Only changed or new pages are sent, never the whole sitemap. Nothing personal is sent:
the request carries the host, the key, the key location and the page URLs.
"""
import hashlib
import json
import pathlib
import sys
import urllib.request

BASE_URL = 'https://cookwala.ai'
HOST = 'cookwala.ai'
KEY = '2d4d91dfaa0ad91c77bf2055b28ba4ed'
ENDPOINT = 'https://api.indexnow.org/indexnow'
MANIFEST = 'indexnow-manifest.json'
BATCH = 10000  # protocol limit per request


def page_urls(out):
    """Every URL listed in the site's sitemaps (sitemap.xml is an index of per-language files)."""
    import re
    urls = []
    for f in sorted(out.glob('sitemap-*.xml')):
        urls += re.findall(r'<loc>([^<]+)</loc>', f.read_text(encoding='utf-8'))
    return urls


def manifest(out):
    data = {}
    for url in page_urls(out):
        rel = url[len(BASE_URL):].lstrip('/')
        f = out / rel / 'index.html' if not rel or rel.endswith('/') else out / rel
        if f.exists():
            data[url] = hashlib.sha256(f.read_bytes()).hexdigest()
    (out / MANIFEST).write_text(json.dumps(data, sort_keys=True, separators=(',', ':')), encoding='utf-8')
    print(f'{MANIFEST}: {len(data)} pages')


def changed(out, dest):
    new = json.loads((out / MANIFEST).read_text(encoding='utf-8'))
    try:
        with urllib.request.urlopen(f'{BASE_URL}/{MANIFEST}', timeout=30) as r:
            old = json.loads(r.read().decode('utf-8'))
    except Exception as e:  # first deploy, or the live site is unreachable: send nothing rather than everything
        print(f'no live manifest ({e}); nothing to submit')
        old = None
    urls = [] if old is None else sorted(u for u, h in new.items() if old.get(u) != h)
    pathlib.Path(dest).write_text(''.join(u + '\n' for u in urls), encoding='utf-8')
    print(f'{len(urls)} changed or new pages')


def submit(src, dry_run=False):
    urls = [u.strip() for u in pathlib.Path(src).read_text(encoding='utf-8').splitlines() if u.strip().startswith(BASE_URL)]
    if not urls:
        print('nothing to submit'); return
    for i in range(0, len(urls), BATCH):
        body = {'host': HOST, 'key': KEY, 'keyLocation': f'{BASE_URL}/{KEY}.txt', 'urlList': urls[i:i + BATCH]}
        if dry_run:
            print(json.dumps({**body, 'urlList': f'{len(body["urlList"])} urls'})); continue
        req = urllib.request.Request(ENDPOINT, data=json.dumps(body).encode('utf-8'), headers={'Content-Type': 'application/json; charset=utf-8'})
        with urllib.request.urlopen(req, timeout=60) as r:
            print(f'IndexNow: {len(body["urlList"])} urls, HTTP {r.status}')


if __name__ == '__main__':
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == 'manifest': manifest(pathlib.Path(args[0]))
    elif cmd == 'changed': changed(pathlib.Path(args[0]), args[1])
    elif cmd == 'submit': submit(args[0], '--dry-run' in args)
    else: sys.exit(__doc__)
