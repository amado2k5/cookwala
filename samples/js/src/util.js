// Small helpers that reproduce Python formatting, so every port prints the same text.

/** Python truthiness: null, undefined, false, 0, '', [] and {} are false. */
export function truthy(v) {
  if (v === null || v === undefined || v === false || v === 0 || v === '' || Number.isNaN(v)) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
}

/** dict.get(key, default): the default only when the key is absent. */
export function get(obj, key, dflt) {
  return obj !== null && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : dflt;
}

/** Python str() of a value, as used in f-strings. */
export function pyStr(v) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return pyRepr(v);
  return String(v);
}

/** Python repr() of a string or a list of strings/numbers. */
export function pyRepr(v) {
  if (typeof v === 'string') {
    const q = v.includes("'") && !v.includes('"') ? '"' : "'";
    let s = v.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll('\r', '\\r').replaceAll('\t', '\\t');
    if (q === "'") s = s.replaceAll("'", "\\'");
    return q + s + q;
  }
  if (Array.isArray(v)) return '[' + v.map(pyRepr).join(', ') + ']';
  return pyStr(v);
}

/** Python format(x, 'g'). */
export function formatG(x) {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? 'nan' : x > 0 ? 'inf' : '-inf';
  if (x === 0) return Object.is(x, -0) ? '-0' : '0';
  const [m0, e0] = x.toExponential(5).split('e');
  const exp = parseInt(e0, 10);
  const strip = (s) => (s.includes('.') ? s.replace(/\.?0+$/, '') : s);
  if (exp < -4 || exp >= 6) return strip(m0) + 'e' + (exp < 0 ? '-' : '+') + String(Math.abs(exp)).padStart(2, '0');
  return strip(x.toFixed(5 - exp));
}

/** Python sorted() on strings (code point order). */
export function sorted(it) {
  return [...it].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * json.dumps(value, indent=indent, ensure_ascii=False) with Python's default separators:
 * ', ' and ': ' when compact, ',' and ': ' when indented.
 */
export function pyDumps(value, indent = null) {
  if (indent !== null && indent !== undefined) return JSON.stringify(value, null, indent) ?? 'null';
  const walk = (v) => {
    if (v === undefined) return 'null';
    if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null';
    if (typeof v.toJSON === 'function') return walk(v.toJSON());
    if (Array.isArray(v)) return '[' + v.map(walk).join(', ') + ']';
    return '{' + Object.entries(v).filter(([, x]) => x !== undefined && typeof x !== 'function').map(([k, x]) => JSON.stringify(k) + ': ' + walk(x)).join(', ') + '}';
  };
  return walk(value);
}

/** xml.sax.saxutils.escape */
export function xmlEscape(s) {
  return String(s).replaceAll('&', '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;');
}

/** xml.sax.saxutils.quoteattr */
export function quoteattr(s) {
  let d = xmlEscape(s).replaceAll('\n', '&#10;').replaceAll('\r', '&#13;').replaceAll('\t', '&#9;');
  if (d.includes('"')) {
    if (d.includes("'")) d = '"' + d.replaceAll('"', '&quot;') + '"';
    else d = "'" + d + "'";
  } else d = '"' + d + '"';
  return d;
}

/** One row as Python's csv.writer writes it (QUOTE_MINIMAL, \r\n). */
export function csvRow(cells) {
  const out = cells.map((c) => {
    const s = pyStr(c);
    return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
  });
  if (out.length === 1 && out[0] === '') return '""\r\n';
  return out.join(',') + '\r\n';
}

/** The ISO instant without milliseconds, like strftime('%Y-%m-%dT%H:%M:%SZ'). */
export function iso(d) {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function parseTime(s) {
  const t = new Date(s);
  if (Number.isNaN(t.getTime())) throw new ValueError(`Invalid isoformat string: ${pyRepr(String(s))}`);
  return t;
}

export class ValueError extends Error {
  constructor(msg) { super(msg); this.name = 'ValueError'; }
}

export class KeyError extends Error {
  constructor(key) { super(pyRepr(String(key))); this.name = 'KeyError'; }
}

export const sleepS = (s) => new Promise((r) => setTimeout(r, Math.max(0, s * 1000)));
