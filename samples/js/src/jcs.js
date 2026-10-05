// RFC 8785 canonical JSON and the Cookwala document hash (same output as tools/cookwala_ref.py).
import { createHash } from 'node:crypto';

const ESC = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' };

function num(x) {
  if (!Number.isFinite(x)) throw new RangeError('JCS forbids NaN and Infinity');
  if (x === 0) return '0'; // also -0
  return String(x); // ECMAScript Number.prototype.toString is what RFC 8785 specifies
}

function str(s) {
  let out = '"';
  for (const c of s) {
    const e = ESC[c];
    if (e) out += e;
    else if (c.charCodeAt(0) < 0x20) out += '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0');
    else out += c;
  }
  return out + '"';
}

// UTF-16 code unit order: JS string comparison already compares code units.
const byUtf16 = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** RFC 8785 canonical JSON text. */
export function canonical(value) {
  if (value === null) return 'null';
  if (value === true) return 'true';
  if (value === false) return 'false';
  if (typeof value === 'number') return num(value);
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'string') return str(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (typeof value === 'object') {
    const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort(byUtf16);
    return '{' + keys.map((k) => str(k) + ':' + canonical(value[k])).join(',') + '}';
  }
  throw new TypeError(`not JSON: ${typeof value}`);
}

/** sha256:<hex> of the canonical JSON of doc without its own hash and signature. */
export function docHash(doc, exclude = ['hash', 'signature']) {
  let body = doc;
  if (doc && typeof doc === 'object' && !Array.isArray(doc)) {
    body = {};
    for (const [k, v] of Object.entries(doc)) if (!exclude.includes(k)) body[k] = v;
  }
  return 'sha256:' + createHash('sha256').update(canonical(body), 'utf8').digest('hex');
}
