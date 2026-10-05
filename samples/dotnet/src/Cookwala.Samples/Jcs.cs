using System;
using System.Globalization;
using System.Linq;
using System.Numerics;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Cookwala.Samples
{
    /// <summary>RFC 8785 canonical JSON and the Cookwala document hash (same output as tools/cookwala_ref.py).</summary>
    public static class Jcs
    {
        /// <summary>RFC 8785 canonical JSON text: keys sorted by UTF-16 code units, ECMAScript number formatting.</summary>
        public static string Canonical(JsonNode? value)
        {
            var sb = new StringBuilder();
            Write(sb, value);
            return sb.ToString();
        }

        /// <summary>Canonical JSON of any value System.Text.Json can serialise.</summary>
        public static string Canonical(object? value) => Canonical(value as JsonNode ?? JsonSerializer.SerializeToNode(value));

        /// <summary><c>sha256:&lt;hex&gt;</c> of the canonical JSON of doc without its own <c>hash</c> and <c>signature</c>.</summary>
        public static string DocHash(JsonNode? doc, params string[] exclude)
        {
            if (exclude.Length == 0) exclude = new[] { "hash", "signature" };
            JsonNode? body = doc;
            if (doc is JsonObject o)
            {
                var copy = new JsonObject();
                foreach (var kv in o)
                    if (!exclude.Contains(kv.Key)) copy[kv.Key] = kv.Value?.DeepClone();
                body = copy;
            }
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(Canonical(body)));
            return "sha256:" + Convert.ToHexString(bytes).ToLowerInvariant();
        }

        /// <summary>ECMAScript <c>Number.prototype.toString</c> for a finite double.</summary>
        public static string Number(double x)
        {
            if (double.IsNaN(x) || double.IsInfinity(x)) throw new ArgumentException("JCS forbids NaN and Infinity");
            if (x == 0) return "0";
            if (Math.Floor(x) == x && Math.Abs(x) < 1e21) return new BigInteger(x).ToString(CultureInfo.InvariantCulture);
            var (neg, s, n) = J.ShortestDigits(x);
            var k = s.Length;
            string r;
            if (k <= n && n <= 21) r = s + new string('0', n - k);
            else if (0 < n && n <= 21) r = s.Substring(0, n) + "." + s.Substring(n);
            else if (-6 < n && n <= 0) r = "0." + new string('0', -n) + s;
            else
            {
                var e = n - 1;
                r = s[0] + (k > 1 ? "." + s.Substring(1) : "") + "e" + (e < 0 ? "-" : "+") + Math.Abs(e).ToString(CultureInfo.InvariantCulture);
            }
            return neg ? "-" + r : r;
        }

        /// <summary>A JSON string literal: <c>\" \\ \b \f \n \r \t</c>, other code units below 0x20 as lower-case <c>\u00xx</c>.</summary>
        public static void WriteString(StringBuilder sb, string s)
        {
            sb.Append('"');
            foreach (var c in s)
            {
                switch (c)
                {
                    case '"': sb.Append("\\\""); break;
                    case '\\': sb.Append("\\\\"); break;
                    case '\b': sb.Append("\\b"); break;
                    case '\f': sb.Append("\\f"); break;
                    case '\n': sb.Append("\\n"); break;
                    case '\r': sb.Append("\\r"); break;
                    case '\t': sb.Append("\\t"); break;
                    default:
                        if (c < 0x20) sb.Append("\\u").Append(((int)c).ToString("x4", CultureInfo.InvariantCulture));
                        else sb.Append(c);
                        break;
                }
            }
            sb.Append('"');
        }

        private static void Write(StringBuilder sb, JsonNode? v)
        {
            switch (v)
            {
                case null: sb.Append("null"); return;
                case JsonObject o:
                {
                    var keys = o.Select(kv => kv.Key).ToList();
                    keys.Sort(string.CompareOrdinal); // UTF-16 code units, as RFC 8785 requires
                    sb.Append('{');
                    for (var i = 0; i < keys.Count; i++)
                    {
                        if (i > 0) sb.Append(',');
                        WriteString(sb, keys[i]);
                        sb.Append(':');
                        Write(sb, o[keys[i]]);
                    }
                    sb.Append('}');
                    return;
                }
                case JsonArray a:
                    sb.Append('[');
                    for (var i = 0; i < a.Count; i++)
                    {
                        if (i > 0) sb.Append(',');
                        Write(sb, a[i]);
                    }
                    sb.Append(']');
                    return;
                default:
                    switch (v.GetValueKind())
                    {
                        case JsonValueKind.String: WriteString(sb, J.Str(v)!); return;
                        case JsonValueKind.True: sb.Append("true"); return;
                        case JsonValueKind.False: sb.Append("false"); return;
                        case JsonValueKind.Number: sb.Append(Number(J.Num(v)!.Value)); return;
                        case JsonValueKind.Null: sb.Append("null"); return;
                        default: throw new ArgumentException($"not JSON: {v.GetValueKind()}");
                    }
            }
        }
    }
}
