"""RFC 8785 canonical JSON and the Cookwala document hash (same output as tools/cookwala_ref.py)."""
import hashlib
import math


def _num(x):
    if isinstance(x, bool):
        raise TypeError('bool is not a number')
    if isinstance(x, int):
        return str(x)
    if not math.isfinite(x):
        raise ValueError('JCS forbids NaN and Infinity')
    if x == 0:
        return '0'
    if x.is_integer() and abs(x) < 1e21:
        return str(int(x))
    r = repr(x)  # shortest round-trip, like ECMAScript Number.prototype.toString
    if 'e' in r:
        mant, exp = r.split('e')
        r = f"{mant}e{'-' if exp.startswith('-') else '+'}{int(exp.lstrip('+-'))}"
    return r


_ESC = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'}


def _str(s):
    return '"' + ''.join(_ESC.get(c) or (f'\\u{ord(c):04x}' if ord(c) < 0x20 else c) for c in s) + '"'


def canonical(value):
    """RFC 8785 canonical JSON text."""
    if value is None: return 'null'
    if value is True: return 'true'
    if value is False: return 'false'
    if isinstance(value, (int, float)): return _num(value)
    if isinstance(value, str): return _str(value)
    if isinstance(value, (list, tuple)): return '[' + ','.join(canonical(v) for v in value) + ']'
    if isinstance(value, dict):
        keys = sorted(value, key=lambda k: k.encode('utf-16-be'))  # UTF-16 code units, as RFC 8785 requires
        return '{' + ','.join(_str(k) + ':' + canonical(value[k]) for k in keys) + '}'
    raise TypeError(f'not JSON: {type(value)}')


def doc_hash(doc, exclude=('hash', 'signature')):
    """sha256:<hex> of the canonical JSON of doc without its own hash and signature."""
    body = {k: v for k, v in doc.items() if k not in exclude} if isinstance(doc, dict) else doc
    return 'sha256:' + hashlib.sha256(canonical(body).encode('utf-8')).hexdigest()
