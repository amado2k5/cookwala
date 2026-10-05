using System;
using System.Text.Json.Nodes;

namespace Cookwala.Samples
{
    /// <summary>
    /// A Problem document (application/problem+json) as an exception, the same shape as sdk/csharp.
    /// Status 0 means the executor could not be reached.
    /// </summary>
    public class CookwalaProblem : Exception
    {
        public int Status { get; }
        public string Title { get; }
        public string? Detail { get; }
        public JsonNode? Refusal { get; }
        public JsonObject Body { get; }

        public CookwalaProblem(int status, JsonNode? body) : base(Describe(status, body))
        {
            Status = status;
            Body = body as JsonObject ?? new JsonObject();
            Title = J.S(Body, "title") ?? "problem";
            Detail = J.S(Body, "detail");
            Refusal = J.Get(Body, "refusal");
        }

        private static string Describe(int status, JsonNode? body)
        {
            var title = J.S(body, "title") ?? "problem";
            var detail = J.S(body, "detail") ?? "";
            return $"{status} {title}: {detail}".Trim();
        }

        /// <summary>A problem with the Cookwala error type URI.</summary>
        public static CookwalaProblem Make(int status, string title, string? detail = null, string? refusal = null)
        {
            var body = new JsonObject { ["type"] = $"https://cookwala.ai/errors/{title}", ["title"] = title };
            if (!string.IsNullOrEmpty(detail)) body["detail"] = detail;
            if (!string.IsNullOrEmpty(refusal)) body["refusal"] = refusal;
            return new CookwalaProblem(status, body);
        }
    }
}
