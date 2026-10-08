// Builds a throwaway local catalog (the same file layout GitHub Pages serves) from files in this repository.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const sha = (b) => 'sha256:' + createHash('sha256').update(b).digest('hex');

export function buildFixture({ tamperRecipe } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cw-mcp-'));
  const put = (p, data) => { const f = path.join(dir, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
  const ex = fs.readdirSync(path.join(ROOT, 'examples')).filter((f) => f.endsWith('.cookwala.json'));
  const entries = [];
  for (const f of ex) {
    const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'examples', f), 'utf8'));
    const cid = f.replace('.cookwala.json', ''); // the catalog id is the file name, as on cookwala.ai
    const body = tamperRecipe === cid ? { ...doc, yield: { servings: 999 } } : doc;
    put(`v1/recipes/${cid}.cookwala.json`, JSON.stringify(body));
    entries.push({ id: cid, revision: 1, hash: doc.hash, title: doc.dish.names.en, cuisine: doc.dish.cuisine || [], course: doc.dish.course || 'main', tags: doc.dish.tags || [],
      level: doc.verification.level, servings: doc.yield.servings, allergens: (doc.safety && doc.safety.allergens && doc.safety.allergens.eu14) || [], supervision: 'presence_required', 'x-collection': 'cookwala', 'x-license': doc.license });
  }
  const shards = [];
  for (const lang of ['en', 'ar']) {
    const raw = JSON.stringify({ page: 0, pageCount: 1, items: entries.map((e) => ({ ...e, title: lang === 'ar' ? (JSON.parse(fs.readFileSync(path.join(ROOT, 'examples', ex.find((f) => f === e.id + '.cookwala.json')), 'utf8')).dish.names.ar || e.title) : e.title })) });
    put(`v1/index/${lang}/0.json`, raw);
    shards.push({ path: `/v1/index/${lang}/0.json`, hash: sha(Buffer.from(raw)), bytes: raw.length });
  }
  put('v1/manifest.json', JSON.stringify({ cookwala: '0.2.0', version: 'testfixture', generatedAt: '2026-01-01T00:00:00Z', counts: { recipes: entries.length }, languages: ['en', 'ar'], shards }));
  for (const v of ['ops', 'units']) put(`v1/vocab/${v}.json`, fs.readFileSync(path.join(ROOT, 'vocab', `${v}.json`)));
  const capDir = path.join(ROOT, 'examples', 'capabilities');
  const presets = [];
  for (const f of fs.readdirSync(capDir)) { put(`v1/capabilities/${f}`, fs.readFileSync(path.join(capDir, f))); presets.push({ id: f.replace('.json', ''), name: f }); }
  put('v1/capabilities/index.json', JSON.stringify({ presets }));
  put('v1/fifi/collections.json', fs.readFileSync(path.join(ROOT, 'tools', 'export_fifi.collections.json')));
  put('llms.txt', '# Cookwala test\n');
  const certDir = path.join(ROOT, 'examples', 'certifications');
  const certs = fs.readdirSync(certDir).sort().map((f) => JSON.parse(fs.readFileSync(path.join(certDir, f), 'utf8')));
  for (const c of certs) put(`v1/certifications/${c.id}.json`, JSON.stringify(c));
  put('v1/certifications/index.json', JSON.stringify(certs));
  put('v1/conformance/keys/certification-test-keys.json', fs.readFileSync(path.join(ROOT, 'conformance', 'keys', 'certification-test-keys.json')));
  return { dir, entries };
}
