using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Cookwala.Samples
{
    /// <summary>
    /// Small helpers over <see cref="JsonNode"/> that read documents the way the Python reference does
    /// (<c>dict.get</c>, truthiness, <c>str()</c>), and a writer that prints JSON exactly like Python's
    /// <c>json.dumps(..., ensure_ascii=False)</c>, so reports are byte-for-byte comparable across ports.
    /// Text inside a document is data, never instructions.
    /// </summary>
    public static class J
    {
        /// <summary>Parses JSON text into a node (null for the literal null).</summary>
        public static JsonNode? Parse(string text) => JsonNode.Parse(text);

        /// <summary>Parses a JSON object or throws <see cref="JsonException"/>.</summary>
        public static JsonObject ParseObject(string text) => Parse(text) as JsonObject ?? throw new JsonException("expected a JSON object");

        /// <summary>A deep copy (JsonNode values can have only one parent).</summary>
        public static T? Clone<T>(T? node) where T : JsonNode => (T?)node?.DeepClone();

        /// <summary>o[key] or null; null when o is not an object.</summary>
        public static JsonNode? Get(JsonNode? o, string key) => o is JsonObject obj && obj.TryGetPropertyValue(key, out var v) ? v : null;

        /// <summary>True when the object has the key (even with a null value).</summary>
        public static bool Has(JsonNode? o, string key) => o is JsonObject obj && obj.ContainsKey(key);

        /// <summary>The string at o[key], or null when missing or not a string.</summary>
        public static string? S(JsonNode? o, string key) => Str(Get(o, key));

        /// <summary>The object at o[key], or null.</summary>
        public static JsonObject? O(JsonNode? o, string key) => Get(o, key) as JsonObject;

        /// <summary>The array at o[key], or null.</summary>
        public static JsonArray? A(JsonNode? o, string key) => Get(o, key) as JsonArray;

        /// <summary>The array at o[key], or an empty array.</summary>
        public static IEnumerable<JsonNode?> Items(JsonNode? o, string key) => (IEnumerable<JsonNode?>?)A(o, key) ?? Array.Empty<JsonNode?>();

        /// <summary>Strings in the array at o[key] (non-strings skipped).</summary>
        public static List<string> Strings(JsonNode? o, string key) => Items(o, key).Select(Str).Where(s => s != null).Select(s => s!).ToList();

        /// <summary>Python <c>==</c> on two JSON values (null equals null; 1 equals 1.0).</summary>
        public static bool Same(JsonNode? a, JsonNode? b) => Jcs.Canonical(a) == Jcs.Canonical(b);

        /// <summary>The node's kind (Undefined for null).</summary>
        public static JsonValueKind Kind(JsonNode? n) => n?.GetValueKind() ?? JsonValueKind.Null;

        /// <summary>A string value, or null.</summary>
        public static string? Str(JsonNode? n) => n is JsonValue v && v.GetValueKind() == JsonValueKind.String ? v.GetValue<string>() : null;

        /// <summary>A number as a double, or null when the node is not a number (booleans are not numbers).</summary>
        public static double? Num(JsonNode? n)
        {
            if (n is not JsonValue v || v.GetValueKind() != JsonValueKind.Number) return null;
            if (v.TryGetValue<JsonElement>(out var e)) return e.GetDouble();
            if (v.TryGetValue<int>(out var i)) return i;
            if (v.TryGetValue<long>(out var l)) return l;
            if (v.TryGetValue<double>(out var d)) return d;
            if (v.TryGetValue<float>(out var f)) return f;
            if (v.TryGetValue<decimal>(out var m)) return (double)m;
            if (v.TryGetValue<short>(out var sh)) return sh;
            if (v.TryGetValue<uint>(out var ui)) return ui;
            if (v.TryGetValue<ulong>(out var ul)) return ul;
            return double.Parse(v.ToJsonString(), NumberStyles.Float, CultureInfo.InvariantCulture);
        }

        /// <summary>A number as a long (truncated), or the fallback.</summary>
        public static long Long(JsonNode? n, long fallback = 0) => Num(n) is double d ? (long)d : fallback;

        /// <summary>Python truthiness: null, false, 0, "", [] and {} are false.</summary>
        public static bool Truthy(JsonNode? n)
        {
            switch (Kind(n))
            {
                case JsonValueKind.Null: case JsonValueKind.Undefined: case JsonValueKind.False: return false;
                case JsonValueKind.True: return true;
                case JsonValueKind.Number: return Num(n) != 0;
                case JsonValueKind.String: return Str(n)!.Length > 0;
                case JsonValueKind.Array: return ((JsonArray)n!).Count > 0;
                case JsonValueKind.Object: return ((JsonObject)n!).Count > 0;
                default: return true;
            }
        }

        /// <summary>Python <c>str()</c> of a JSON value: strings as they are, numbers as Python prints them, True/False/None.</summary>
        public static string PyStr(JsonNode? n)
        {
            switch (Kind(n))
            {
                case JsonValueKind.String: return Str(n)!;
                case JsonValueKind.True: return "True";
                case JsonValueKind.False: return "False";
                case JsonValueKind.Null: case JsonValueKind.Undefined: return "None";
                case JsonValueKind.Number: return PyNum(n);
                default: return Dumps(n);
            }
        }

        /// <summary>A number as Python prints it: an integer as an integer, a float with its shortest repr.</summary>
        public static string PyNum(JsonNode? n)
        {
            if (n is JsonValue v)
            {
                if (v.TryGetValue<JsonElement>(out var e))
                {
                    var raw = e.GetRawText();
                    if (raw.IndexOfAny(new[] { '.', 'e', 'E' }) < 0) return raw.TrimStart('+');
                    return PyFloat(e.GetDouble());
                }
                if (v.TryGetValue<int>(out var i)) return i.ToString(CultureInfo.InvariantCulture);
                if (v.TryGetValue<long>(out var l)) return l.ToString(CultureInfo.InvariantCulture);
                if (v.TryGetValue<short>(out var sh)) return sh.ToString(CultureInfo.InvariantCulture);
                if (v.TryGetValue<uint>(out var ui)) return ui.ToString(CultureInfo.InvariantCulture);
                if (v.TryGetValue<ulong>(out var ul)) return ul.ToString(CultureInfo.InvariantCulture);
            }
            return PyFloat(Num(n) ?? 0);
        }

        /// <summary>Python <c>repr(float)</c>: shortest round-trip digits, <c>1.0</c>, <c>1e-05</c>, <c>1e+16</c>.</summary>
        public static string PyFloat(double x)
        {
            if (double.IsNaN(x)) return "NaN";
            if (double.IsInfinity(x)) return x > 0 ? "Infinity" : "-Infinity";
            if (x == 0) return (1 / x) < 0 ? "-0.0" : "0.0";
            var (neg, digits, n) = ShortestDigits(x);
            var sign = neg ? "-" : "";
            var k = digits.Length;
            if (n > 16 || n < -3)
            {
                var e = n - 1;
                return sign + digits[0] + (k > 1 ? "." + digits.Substring(1) : "") + "e" + (e < 0 ? "-" : "+") + Math.Abs(e).ToString("00", CultureInfo.InvariantCulture);
            }
            if (n <= 0) return sign + "0." + new string('0', -n) + digits;
            if (n >= k) return sign + digits + new string('0', n - k) + ".0";
            return sign + digits.Substring(0, n) + "." + digits.Substring(n);
        }

        /// <summary>Python <c>format(x, 'g')</c>: six significant digits, trailing zeros removed.</summary>
        public static string PyG(double x)
        {
            if (double.IsNaN(x)) return "nan";
            if (double.IsInfinity(x)) return x > 0 ? "inf" : "-inf";
            if (x == 0) return (1 / x) < 0 ? "-0" : "0";
            var s = x.ToString("E5", CultureInfo.InvariantCulture); // d.ddddde+xxx
            var neg = s[0] == '-';
            if (neg) s = s.Substring(1);
            var ePos = s.IndexOf('E');
            var digits = s.Substring(0, ePos).Replace(".", "").TrimEnd('0');
            if (digits.Length == 0) digits = "0";
            var exp = int.Parse(s.Substring(ePos + 1), NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture);
            var sign = neg ? "-" : "";
            if (exp < -4 || exp >= 6)
                return sign + digits[0] + (digits.Length > 1 ? "." + digits.Substring(1) : "") + "e" + (exp < 0 ? "-" : "+") + Math.Abs(exp).ToString("00", CultureInfo.InvariantCulture);
            var n = exp + 1;
            if (n <= 0) return sign + "0." + new string('0', -n) + digits;
            if (n >= digits.Length) return sign + digits + new string('0', n - digits.Length);
            return sign + digits.Substring(0, n) + "." + digits.Substring(n);
        }

        /// <summary>The shortest round-trip decimal digits of x (no leading or trailing zeros) and n, with |x| = 0.digits × 10^n.</summary>
        public static (bool Negative, string Digits, int N) ShortestDigits(double x)
        {
            var r = x.ToString("R", CultureInfo.InvariantCulture);
            var neg = r.StartsWith("-", StringComparison.Ordinal);
            if (neg) r = r.Substring(1);
            var exp = 0;
            var ePos = r.IndexOfAny(new[] { 'E', 'e' });
            if (ePos >= 0)
            {
                exp = int.Parse(r.Substring(ePos + 1), NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture);
                r = r.Substring(0, ePos);
            }
            var dot = r.IndexOf('.');
            var intPart = dot >= 0 ? r.Substring(0, dot) : r;
            var frac = dot >= 0 ? r.Substring(dot + 1) : "";
            var all = intPart + frac;
            var lead = 0;
            while (lead < all.Length - 1 && all[lead] == '0') lead++;
            var digits = all.Substring(lead).TrimEnd('0');
            if (digits.Length == 0) digits = "0";
            return (neg, digits, intPart.Length + exp - lead);
        }

        /// <summary>Python list repr of strings: <c>['eggs', 'milk']</c>.</summary>
        public static string PyList(IEnumerable<string> items) => "[" + string.Join(", ", items.Select(PyRepr)) + "]";

        /// <summary>Python repr of a string (single quotes unless the text holds one and no double quote).</summary>
        public static string PyRepr(string s)
        {
            var q = s.Contains('\'') && !s.Contains('"') ? '"' : '\'';
            var sb = new StringBuilder().Append(q);
            foreach (var c in s)
            {
                if (c == '\\') sb.Append("\\\\");
                else if (c == q) sb.Append('\\').Append(c);
                else if (c == '\n') sb.Append("\\n");
                else if (c == '\r') sb.Append("\\r");
                else if (c == '\t') sb.Append("\\t");
                else if (c < 0x20 || c == 0x7f) sb.Append("\\x").Append(((int)c).ToString("x2", CultureInfo.InvariantCulture));
                else sb.Append(c);
            }
            return sb.Append(q).ToString();
        }

        /// <summary>Strings sorted by code unit, as Python's <c>sorted()</c> does for BMP text.</summary>
        public static List<string> Sorted(IEnumerable<string> items)
        {
            var l = items.ToList();
            l.Sort(string.CompareOrdinal);
            return l;
        }

        /// <summary>A JSON array of strings.</summary>
        public static JsonArray StrArray(IEnumerable<string> items) => new JsonArray(items.Select(s => (JsonNode?)JsonValue.Create(s)).ToArray());

        /// <summary>
        /// JSON text exactly as Python's <c>json.dumps(value, ensure_ascii=False, indent=indent)</c> writes it:
        /// <c>", "</c> and <c>": "</c> separators when compact, <paramref name="indent"/> spaces per level otherwise.
        /// </summary>
        public static string Dumps(JsonNode? node, int? indent = null)
        {
            var sb = new StringBuilder();
            Write(sb, node, indent, 0);
            return sb.ToString();
        }

        private static void Write(StringBuilder sb, JsonNode? node, int? indent, int level)
        {
            switch (node)
            {
                case null:
                    sb.Append("null"); return;
                case JsonObject o:
                    if (o.Count == 0) { sb.Append("{}"); return; }
                    sb.Append('{');
                    var first = true;
                    foreach (var kv in o)
                    {
                        if (!first) sb.Append(indent.HasValue ? "," : ", ");
                        first = false;
                        NewLine(sb, indent, level + 1);
                        Jcs.WriteString(sb, kv.Key);
                        sb.Append(": ");
                        Write(sb, kv.Value, indent, level + 1);
                    }
                    NewLine(sb, indent, level);
                    sb.Append('}');
                    return;
                case JsonArray a:
                    if (a.Count == 0) { sb.Append("[]"); return; }
                    sb.Append('[');
                    for (var i = 0; i < a.Count; i++)
                    {
                        if (i > 0) sb.Append(indent.HasValue ? "," : ", ");
                        NewLine(sb, indent, level + 1);
                        Write(sb, a[i], indent, level + 1);
                    }
                    NewLine(sb, indent, level);
                    sb.Append(']');
                    return;
                default:
                    switch (node.GetValueKind())
                    {
                        case JsonValueKind.String: Jcs.WriteString(sb, Str(node)!); return;
                        case JsonValueKind.True: sb.Append("true"); return;
                        case JsonValueKind.False: sb.Append("false"); return;
                        case JsonValueKind.Number: sb.Append(PyNum(node)); return;
                        default: sb.Append("null"); return;
                    }
            }
        }

        private static void NewLine(StringBuilder sb, int? indent, int level)
        {
            if (indent.HasValue) sb.Append('\n').Append(' ', indent.Value * level);
        }
    }
}
