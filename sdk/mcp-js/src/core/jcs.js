// RFC 8785 canonical JSON and the Cookwala document hash (same output as tools/cookwala_ref.py).
// Pure: uses only Web Crypto (globalThis.crypto.subtle), so it runs in Node 20+ and in browsers.
const ESC = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' };
const num = (x) => {
  if (!Number.isFinite(x)) throw new RangeError('JCS forbids NaN and Infinity');
  return x === 0 ? '0' : String(x);
};
const str = (s) => {
  let out = '"';
  for (const c of s) {
    const e = ESC[c];
    if (e) out += e;
    else if (c.charCodeAt(0) < 0x20) out += '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0');
    else out += c;
  }
  return out + '"';
};
const byUtf16 = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export function canonical(v) {
  if (v === null) return 'null';
  if (v === true) return 'true';
  if (v === false) return 'false';
  if (typeof v === 'number') return num(v);
  if (typeof v === 'string') return str(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  if (typeof v === 'object') {
    return '{' + Object.keys(v).filter((k) => v[k] !== undefined).sort(byUtf16).map((k) => str(k) + ':' + canonical(v[k])).join(',') + '}';
  }
  throw new TypeError(`not JSON: ${typeof v}`);
}

export async function sha256Hex(text) {
  const buf = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** sha256:<hex> of the canonical JSON of doc without its own hash and signature. */
export async function docHash(doc, exclude = ['hash', 'signature']) {
  let body = doc;
  if (doc && typeof doc === 'object' && !Array.isArray(doc)) {
    body = Object.fromEntries(Object.entries(doc).filter(([k]) => !exclude.includes(k)));
  }
  return 'sha256:' + (await sha256Hex(canonical(body)));
}

/** sha256:<hex> of raw bytes or text, as used for manifest shards. */
export async function bytesHash(data) {
  const buf = await globalThis.crypto.subtle.digest('SHA-256', typeof data === 'string' ? new TextEncoder().encode(data) : data);
  return 'sha256:' + [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
