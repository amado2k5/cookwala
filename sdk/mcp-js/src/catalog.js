// Catalog client: reads the static files Cookwala publishes on GitHub Pages, caches them on disk,
// and verifies integrity. Node only. The only origins it will contact are the catalog origin
// (COOKWALA_BASE_URL) and https://fifi.cooking for the two fifi bridge tools.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { bytesHash, docHash } from './core/jcs.js';
import { opsIndex } from './core/envelope.js';
import { FIFI_ORIGIN, FIFI_ID } from './core/fifi.js';

export const DEFAULT_BASE = 'https://cookwala.ai';
const REVALIDATE_MS = 10 * 60 * 1000;
const UA = 'cookwala-mcp (+https://cookwala.ai/mcp/)';

export class CatalogError extends Error {
  constructor(code, detail, p) { super(`${code}: ${detail}`); this.code = code; this.detail = detail; this.path = p; }
}

const isUrl = (s) => /^https?:\/\//i.test(s);

export class Catalog {
  constructor(opts = {}) {
    const env = process.env;
    this.base = (opts.baseUrl || env.COOKWALA_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '');
    this.local = !isUrl(this.base);
    this.offline = opts.offline ?? (env.COOKWALA_OFFLINE === '1');
    this.lang = opts.lang || env.COOKWALA_LANG || 'en';
    this.fetch = opts.fetch || ((...a) => globalThis.fetch(...a)); // unbound: Workers reject a detached fetch
    this.now = opts.now || (() => Date.now());
    // diskCache: false is for hosted runtimes (the Worker) that have no home directory; files then stay in memory only.
    this.diskCache = opts.diskCache !== false;
    if (this.diskCache) {
      const xdg = env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache');
      this.cacheDir = opts.cacheDir || env.COOKWALA_CACHE_DIR || path.join(xdg, 'cookwala-mcp');
    } else this.cacheDir = null;
    this.mem = new Map();
    this.usedCache = false;
    this.networkFailed = false;
  }

  // ---- raw access with cache ------------------------------------------------
  _cacheFile(origin, p) {
    const key = createHash('sha256').update(origin).digest('hex').slice(0, 10);
    return path.join(this.cacheDir, key, p.replace(/^\/+/, '').replace(/[\\/]/g, '__'));
  }

  async _readCache(file) {
    if (!this.diskCache) return null;
    try {
      const [body, meta] = await Promise.all([fs.readFile(file), fs.readFile(file + '.meta', 'utf8').then(JSON.parse)]);
      return { body, meta };
    } catch { return null; }
  }

  async _writeCache(file, body, meta) {
    if (!this.diskCache) return;
    try {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, body);
      await fs.writeFile(file + '.meta', JSON.stringify(meta));
    } catch { /* a read-only cache never breaks a tool */ }
  }

  /** Fetch bytes of a path under an origin. Returns {bytes, fromCache}. */
  async raw(p, { origin = null, force = false, accept = 'json' } = {}) {
    if (!origin && this.local) {
      try { return { bytes: new Uint8Array(await fs.readFile(path.join(this.base, p))), fromCache: false }; }
      catch { throw new CatalogError('not_found', `no such file under ${this.base}`, p); }
    }
    const org = origin || this.base;
    const file = this.diskCache ? this._cacheFile(org, p) : null;
    const cached = force ? null : await this._readCache(file);
    const fresh = cached && this.now() - cached.meta.fetchedAt < REVALIDATE_MS;
    if (cached && (fresh || this.offline)) { this.usedCache = true; return { bytes: new Uint8Array(cached.body), fromCache: true }; }
    if (this.offline) throw new CatalogError('offline', 'COOKWALA_OFFLINE=1 and the file is not cached', p);
    const headers = { 'user-agent': UA, accept: accept === 'json' ? 'application/json' : '*/*' };
    if (cached && cached.meta.etag) headers['if-none-match'] = cached.meta.etag;
    let res;
    try { res = await this.fetch(org + p, { headers }); }
    catch (e) {
      this.networkFailed = true;
      if (cached) { this.usedCache = true; return { bytes: new Uint8Array(cached.body), fromCache: true }; }
      throw new CatalogError('network', String(e && e.message || e), p);
    }
    if (res.status === 304 && cached) {
      await this._writeCache(file, cached.body, { ...cached.meta, fetchedAt: this.now() });
      return { bytes: new Uint8Array(cached.body), fromCache: true };
    }
    if (res.status === 404) throw new CatalogError('not_found', `${org}${p} returned 404`, p);
    if (!res.ok) {
      if (cached) { this.usedCache = true; return { bytes: new Uint8Array(cached.body), fromCache: true }; }
      throw new CatalogError('http_error', `${org}${p} returned ${res.status}`, p);
    }
    const ctype = res.headers.get('content-type') || '';
    if (accept === 'json' && /text\/html/i.test(ctype)) throw new CatalogError('not_found', `${org}${p} returned an HTML page, not data`, p);
    const bytes = new Uint8Array(await res.arrayBuffer());
    await this._writeCache(file, bytes, { etag: res.headers.get('etag') || undefined, fetchedAt: this.now(), bytes: bytes.length });
    return { bytes, fromCache: false };
  }

  async json(p, opts) {
    const key = (opts && opts.origin || '') + p;
    if (!(opts && opts.force) && this.mem.has(key)) return this.mem.get(key);
    const { bytes } = await this.raw(p, opts);
    let v;
    try { v = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new CatalogError('bad_json', 'response is not JSON', p); }
    this.mem.set(key, v);
    return v;
  }

  async text(p, opts) {
    const { bytes } = await this.raw(p, { accept: 'text', ...opts });
    return new TextDecoder().decode(bytes);
  }

  // ---- catalog ---------------------------------------------------------------
  manifest() { return this.json('/v1/manifest.json'); }

  async shard(lang, n) {
    const p = `/v1/index/${lang}/${n}.json`;
    const manifest = await this.manifest();
    const entry = (manifest.shards || []).find((s) => s.path === p);
    let { bytes } = await this.raw(p);
    if (entry && (await bytesHash(bytes)) !== entry.hash) {
      ({ bytes } = await this.raw(p, { force: true }));
      if ((await bytesHash(bytes)) !== entry.hash) throw new CatalogError('integrity_mismatch', 'index shard does not match the manifest hash', p);
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  /** All index entries for a language (cached in memory). */
  async index(lang = this.lang) {
    const key = 'index:' + lang;
    if (this.mem.has(key)) return this.mem.get(key);
    const manifest = await this.manifest();
    const langs = manifest.languages || ['en'];
    const use = langs.includes(lang) ? lang : 'en';
    const pages = (manifest.shards || []).filter((s) => s.path.startsWith(`/v1/index/${use}/`) && /\/\d+\.json$/.test(s.path)).length || 1;
    const items = [];
    for (let n = 0; n < pages; n++) items.push(...(await this.shard(use, n)).items);
    this.mem.set(key, items);
    return items;
  }

  async recipe(id) {
    if (!/^[a-z0-9][a-z0-9._-]{0,80}$/i.test(id)) throw new CatalogError('bad_id', 'recipe ids use letters, digits, dot, dash and underscore', id);
    const p = `/v1/recipes/${id}.cookwala.json`;
    let doc = await this.json(p);
    let recomputed = await docHash(doc);
    if (doc.hash && recomputed !== doc.hash) {
      doc = await this.json(p, { force: true });
      recomputed = await docHash(doc);
      if (doc.hash && recomputed !== doc.hash) throw new CatalogError('integrity_mismatch', `recipe hash ${doc.hash} does not match its content ${recomputed}`, p);
    }
    return { doc, hash: recomputed, declaredHash: doc.hash, hashVerified: !!doc.hash && recomputed === doc.hash };
  }

  async recipeText(id, lang) { return this.json(`/v1/recipes/${id}/text/${lang}.json`); }

  async vocab() {
    if (this.mem.has('vocab')) return this.mem.get('vocab');
    const [ops, units] = await Promise.all([this.json('/v1/vocab/ops.json'), this.json('/v1/vocab/units.json')]);
    const v = opsIndex(ops, units);
    this.mem.set('vocab', v);
    return v;
  }

  presetsIndex() { return this.json('/v1/capabilities/index.json'); }
  preset(id) {
    if (!/^[a-z0-9-]+$/.test(id)) throw new CatalogError('bad_id', 'preset ids use lowercase letters, digits and dash', id);
    return this.json(`/v1/capabilities/${id}.json`);
  }
  schema(name) {
    if (!/^[a-z0-9._-]+$/i.test(name)) throw new CatalogError('bad_id', 'bad schema name', name);
    return this.json(`/v1/schemas/${name.replace(/(\.schema)?\.json$/, '')}.schema.json`);
  }
  doc(id) {
    if (!/^[A-Za-z0-9-]+$/.test(id)) throw new CatalogError('bad_id', 'document ids use letters, digits and dash', id);
    return this.text(`/docs/md/${id}.md`);
  }
  llms() { return this.text('/llms.txt'); }
  discovery() { return this.json('/.well-known/cookwala.json'); }

  // ---- fifi.cooking bridge (the only other origin) -----------------------------
  fifiConfig() { return this.json('/v1/fifi/collections.json'); }

  async fifiRecipe(id) {
    if (!FIFI_ID.test(id)) throw new CatalogError('bad_id', 'fifi.cooking ids use lowercase letters, digits and dash', id);
    return this.json(`/data/recipes/${id}.json`, { origin: FIFI_ORIGIN });
  }
  fifiSearchMap(lang) {
    if (!/^[a-z]{2,3}$/.test(lang)) throw new CatalogError('bad_id', 'bad language code', lang);
    return this.json(`/data/search/${lang}.json`, { origin: FIFI_ORIGIN });
  }

  // ---- status ------------------------------------------------------------------
  async status() {
    let manifest = null, error;
    try { manifest = await this.manifest(); } catch (e) { error = e.code || String(e); }
    let bytes = 0;
    if (this.diskCache) try {
      const walk = async (d) => { for (const e of await fs.readdir(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) await walk(f); else bytes += (await fs.stat(f)).size; } };
      await walk(this.cacheDir);
    } catch { /* no cache yet */ }
    return {
      baseUrl: this.base, catalogVersion: manifest && manifest.version, generatedAt: manifest && manifest.generatedAt,
      counts: manifest && manifest.counts, languages: manifest && manifest.languages,
      cache: { dir: this.local || !this.diskCache ? null : this.cacheDir, bytes, servedFromCache: this.usedCache },
      offline: this.offline || this.networkFailed, signature: 'manifest signature is not checked: /.well-known/cookwala.json publishes no keys yet',
      fifiOrigin: FIFI_ORIGIN, ...(error ? { error } : {}),
    };
  }
}
