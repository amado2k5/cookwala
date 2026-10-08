// Certifications (RFC-0010): verify one document and work out which ones currently hold.
// Port of verify_certification / current_certifications in tools/cookwala_ref.py; the reasons are the same strings.
// Pure: Web Crypto Ed25519 only, so it runs in Node 20+ and in browsers that support Ed25519.
import { canonical, docHash } from './jcs.js';
import { parseTime } from './envelope.js';

const unb64u = (s) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};
const time = (s) => { const t = parseTime(s); if (!Number.isFinite(t)) throw new RangeError('invalid_timestamp'); return t; };

/** RFC-0012 signing input: canonical JSON of the signing header. */
export function signingInput(h, kid, alg, signedAt, kind) {
  const hdr = { alg, hash: h, kid, signedAt };
  if (kind) hdr.kind = kind;
  return new TextEncoder().encode(canonical(hdr));
}

function keyFor(sig, keys) {
  if (!sig) return [null, 'unsigned'];
  if (!sig.signedAt) return [null, 'unsigned_time'];
  const rec = (keys || []).find((k) => k.kid === sig.kid);
  if (!rec) return [null, 'unknown_key'];
  if (rec.alg !== sig.alg) return [null, 'alg_mismatch'];
  if (sig.alg !== 'EdDSA') return [null, 'alg_not_supported_by_reference'];
  let when;
  try { when = time(sig.signedAt); } catch { return [null, 'invalid_timestamp']; }
  try {
    if (when < time(rec.validFrom) || (rec.validTo && when > time(rec.validTo))) return [null, 'key_not_valid_at_signing_time'];
    if (rec.revokedAt && when >= time(rec.revokedAt)) return [null, 'key_revoked'];
  } catch { return [null, 'invalid_timestamp']; }
  return [rec, 'ok'];
}

/** Verify doc.signature over its hash. Resolves to [ok, reason]. */
export async function verifyDocument(doc, keys) {
  const sig = doc && doc.signature;
  const [rec, why] = keyFor(sig, keys);
  if (!rec) return [false, why];
  try {
    const key = await globalThis.crypto.subtle.importKey('raw', unb64u(rec.publicKey), { name: 'Ed25519' }, false, ['verify']);
    const ok = await globalThis.crypto.subtle.verify({ name: 'Ed25519' }, key, unb64u(sig.sig), signingInput(await docHash(doc), sig.kid, sig.alg, sig.signedAt, doc.kind));
    return ok ? [true, 'ok'] : [false, 'bad_signature'];
  } catch { return [false, 'bad_signature']; }
}

/** One Certification: signature, subject hash, status, validity window. Resolves to [ok, reason]. */
export async function verifyCertification(cert, keys, now = null, subjectHash = null) {
  if (!cert || cert.kind !== 'Certification') return [false, 'not_a_certification'];
  const [ok, why] = await verifyDocument(cert, keys);
  if (!ok) return [false, why];
  if (subjectHash && (cert.subject || {}).hash !== subjectHash) return [false, 'subject_mismatch'];
  try {
    const t = now ? time(now) : Date.now();
    if (cert.status === 'revoked' && (!cert.revokedAt || t >= time(cert.revokedAt))) return [false, 'revoked'];
    if (cert.status === 'suspended') return [false, 'suspended'];
    if (cert.validFrom && t < time(cert.validFrom)) return [false, 'not_yet_valid'];
    if (cert.validUntil && t > time(cert.validUntil)) return [false, 'expired'];
  } catch { return [false, 'invalid_timestamp']; }
  return [true, 'ok'];
}

/** Which certifications hold now: newest verifying document per (authority, scheme); older ones are superseded. */
export async function currentCertifications(certs, keys, now = null, subjectHash = null) {
  const verdicts = new Map();
  for (const c of certs) verdicts.set(c.id, await verifyCertification(c, keys, now, subjectHash));
  const groups = new Map();
  for (const c of certs) {
    if (!verdicts.get(c.id)[0]) continue;
    const k = JSON.stringify([(c.authority || {}).id ?? null, c.scheme ?? null]);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(c);
  }
  const rejected = {};
  for (const [id, [ok, why]] of verdicts) if (!ok) rejected[id] = why;
  const current = [];
  for (const members of groups.values()) {
    members.sort((a, b) => ((a.issuedAt || '') < (b.issuedAt || '') ? -1 : (a.issuedAt || '') > (b.issuedAt || '') ? 1 : 0));
    current.push(members[members.length - 1].id);
    for (const older of members.slice(0, -1)) rejected[older.id] = 'superseded';
  }
  return { current: current.sort(), rejected };
}

/** currentCertifications for a mixed list: one call per subject hash, so one subject never supersedes another. */
export async function currentBySubject(certs, keys, now = null) {
  const bySubject = new Map();
  for (const c of certs) { const h = (c.subject || {}).hash || ''; if (!bySubject.has(h)) bySubject.set(h, []); bySubject.get(h).push(c); }
  const out = { current: [], rejected: {} };
  for (const [h, group] of bySubject) {
    const r = await currentCertifications(group, keys, now, h || null);
    out.current.push(...r.current); Object.assign(out.rejected, r.rejected);
  }
  out.current.sort();
  return out;
}
