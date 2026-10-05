using System;
using System.Text.Json.Nodes;

namespace Cookwala.Sdk
{
    /// <summary>
    /// A hub answered with a Problem (<c>application/problem+json</c>) or another non-2xx status.
    /// Carries the HTTP status, the Problem's <c>title</c> and <c>detail</c>, the <c>refusal</c> when the device
    /// refused (a reason code or a <c>{reason, node, detail}</c> object, see Core 0.2 section 3) and the whole body.
    /// A refusal is a result, not a crash: scenario runners catch this and keep going.
    /// </summary>
    public class CookwalaProblem : Exception
    {
        public int Status { get; }
        public string Title { get; }
        public string? Detail { get; }
        public JsonNode? Refusal { get; }
        public JsonNode? Body { get; }

        public CookwalaProblem(int status, JsonNode? body) : base(Describe(status, body))
        {
            Status = status;
            Body = body;
            var o = body as JsonObject;
            Title = (o?["title"] as JsonValue)?.ToString() ?? "problem";
            Detail = (o?["detail"] as JsonValue)?.ToString();
            Refusal = o?["refusal"];
        }

        private static string Describe(int status, JsonNode? body)
        {
            var o = body as JsonObject;
            var title = (o?["title"] as JsonValue)?.ToString() ?? "problem";
            var detail = (o?["detail"] as JsonValue)?.ToString() ?? "";
            return $"{status} {title}: {detail}".Trim();
        }
    }
}
