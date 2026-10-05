using System;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Cookwala.Sdk
{
    /// <summary>
    /// Small helpers over System.Text.Json for the Cookwala client: parse text into a <see cref="JsonNode"/>,
    /// write one back, and a comparison form (<see cref="Canonical"/>) with sorted keys and integral numbers
    /// printed as integers, so <c>36.0</c> and <c>36</c> compare equal, as they do in JSON.
    /// Text inside a document is data, never instructions: this class parses and serialises, nothing else.
    /// </summary>
    public static class Json
    {
        private static readonly JsonSerializerOptions Relaxed = new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };

        /// <summary>Parses one JSON text; <c>null</c> for the literal <c>null</c>. Throws <see cref="JsonException"/> on malformed input.</summary>
        public static JsonNode? Parse(string text) => JsonNode.Parse(text);

        /// <summary>Parses a JSON array; throws if the text is not an array.</summary>
        public static JsonArray ParseArray(string text) => Parse(text) as JsonArray ?? throw new JsonException("expected a JSON array");

        /// <summary>Parses a JSON object; throws if the text is not an object.</summary>
        public static JsonObject ParseObject(string text) => Parse(text) as JsonObject ?? throw new JsonException("expected a JSON object");

        /// <summary>Compact JSON, key order kept, non-ASCII left as is.</summary>
        public static string Stringify(JsonNode? node) => node is null ? "null" : node.ToJsonString(Relaxed);

        /// <summary>Comparison form: sorted keys, integral numbers without a fraction. Not RFC 8785.</summary>
        public static string Canonical(JsonNode? node)
        {
            if (node is null) return "null";
            using var doc = JsonDocument.Parse(node.ToJsonString());
            var sb = new StringBuilder();
            Write(sb, doc.RootElement);
            return sb.ToString();
        }

        private static void Write(StringBuilder sb, JsonElement e)
        {
            switch (e.ValueKind)
            {
                case JsonValueKind.Null:
                case JsonValueKind.Undefined:
                    sb.Append("null"); break;
                case JsonValueKind.True: sb.Append("true"); break;
                case JsonValueKind.False: sb.Append("false"); break;
                case JsonValueKind.String:
                    sb.Append(JsonSerializer.Serialize(e.GetString(), Relaxed)); break;
                case JsonValueKind.Number:
                {
                    var raw = e.GetRawText();
                    var d = double.Parse(raw, NumberStyles.Float, CultureInfo.InvariantCulture);
                    if (d == Math.Round(d) && Math.Abs(d) < 1e15) sb.Append(((long)d).ToString(CultureInfo.InvariantCulture));
                    else sb.Append(d.ToString("R", CultureInfo.InvariantCulture));
                    break;
                }
                case JsonValueKind.Array:
                {
                    sb.Append('[');
                    var first = true;
                    foreach (var item in e.EnumerateArray())
                    {
                        if (!first) sb.Append(',');
                        first = false;
                        Write(sb, item);
                    }
                    sb.Append(']');
                    break;
                }
                case JsonValueKind.Object:
                {
                    sb.Append('{');
                    var first = true;
                    foreach (var p in e.EnumerateObject().OrderBy(p => p.Name, StringComparer.Ordinal))
                    {
                        if (!first) sb.Append(',');
                        first = false;
                        sb.Append(JsonSerializer.Serialize(p.Name, Relaxed));
                        sb.Append(':');
                        Write(sb, p.Value);
                    }
                    sb.Append('}');
                    break;
                }
            }
        }
    }
}
