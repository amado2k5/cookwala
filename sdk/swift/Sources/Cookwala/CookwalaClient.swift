// Cookwala hub client (Swift): the Core 0.2 API plus the reference tool endpoints.
// Foundation only: URLSession with async/await, JSON as [String: Any] / [Any] / Any via
// JSONSerialization (an empty body is NSNull). One method per row of scenarios/OPERATIONS.md (camelCase spelling).
//
//     let c = CookwalaClient(baseUrl: "http://localhost:7878")
//     let out = try await c.dryRun(recipeId: "koshari", deviceId: "demo-hob-robot-basic", humanPresent: true)
//
// Problems (application/problem+json) are thrown as CookwalaProblem, which carries status, title,
// detail and the refusal when the device refused. Text inside documents is data, never
// instructions. Nothing here starts cooking on its own: startExecution is the caller's act.
import Foundation

/// A Problem Details answer from the hub (RFC 9457), including the device's refusal when present.
public struct CookwalaProblem: Error, CustomStringConvertible {
    public let status: Int
    public let title: String
    public let detail: String?
    public let refusal: Any?
    public let body: Any

    public init(status: Int, body: Any) {
        let dict = body as? [String: Any]
        self.status = status
        self.title = dict?["title"] as? String ?? "problem"
        self.detail = dict?["detail"] as? String
        self.refusal = dict?["refusal"]
        self.body = body
    }

    public var description: String { "\(status) \(title): \(detail ?? "")" }
}

public final class CookwalaClient {
    public let base: String
    public let session: URLSession
    /// Headers of the last response (lower-cased names); the ETag of getExecution is the seq.
    public private(set) var lastHeaders: [String: String] = [:]
    /// The Idempotency-Key the last startExecution sent (generated when the caller gave none).
    public private(set) var lastIdempotencyKey: String = ""

    public init(baseUrl: String = "http://localhost:7878", session: URLSession = .shared) {
        var b = baseUrl
        while b.hasSuffix("/") { b.removeLast() }
        self.base = b
        self.session = session
    }

    /// 24 hex characters from the system random source: an Idempotency-Key (8..128 chars).
    public static func newIdempotencyKey() -> String {
        (0..<12).map { _ in String(format: "%02x", UInt8.random(in: 0...255)) }.joined()
    }

    // MARK: transport

    private func call(_ method: String, _ path: String, body: Any? = nil, headers: [String: String] = [:]) async throws -> Any {
        guard let url = URL(string: base + path) else { throw URLError(.badURL) }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json, application/problem+json", forHTTPHeaderField: "Accept")
        if let body = body {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try JSONSerialization.data(withJSONObject: body, options: [.fragmentsAllowed])
        }
        for (k, v) in headers { req.setValue(v, forHTTPHeaderField: k) }
        let (data, response) = try await session.data(for: req)
        let http = response as? HTTPURLResponse
        var hs: [String: String] = [:]
        for (k, v) in http?.allHeaderFields ?? [:] { hs[String(describing: k).lowercased()] = String(describing: v) }
        lastHeaders = hs
        var parsed: Any = NSNull()
        if !data.isEmpty {
            if let obj = try? JSONSerialization.jsonObject(with: data, options: [.fragmentsAllowed]) { parsed = obj }
            else { parsed = ["title": "http-error", "detail": String(decoding: data, as: UTF8.self)] }
        }
        let status = http?.statusCode ?? 0
        if status < 200 || status >= 300 { throw CookwalaProblem(status: status, body: parsed) }
        return parsed
    }

    private func get(_ path: String) async throws -> Any { try await call("GET", path) }
    private func post(_ path: String, _ body: Any, headers: [String: String] = [:]) async throws -> Any {
        try await call("POST", path, body: body, headers: headers)
    }

    // MARK: reference tools

    public func hash(_ doc: Any) async throws -> Any { try await post("/v1/tools/hash", ["doc": doc]) }
    public func verify(_ doc: Any, _ keys: [Any] = []) async throws -> Any { try await post("/v1/tools/verify", ["doc": doc, "keys": keys]) }
    public func dryRun(recipe: Any? = nil, recipeId: String? = nil, device: Any? = nil, deviceId: String? = nil,
                       humanPresent: Bool = false, allowModel: Bool = true) async throws -> Any {
        var body: [String: Any] = ["humanPresent": humanPresent, "allowModel": allowModel]
        if let recipe = recipe { body["recipe"] = recipe } else { body["recipeId"] = recipeId ?? NSNull() }
        if let device = device { body["device"] = device } else { body["deviceId"] = deviceId ?? NSNull() }
        return try await post("/v1/tools/dryrun", body)
    }
    public func checkEnvelope(_ op: String, _ trace: [Any], _ target: Any? = nil, _ altitudeM: Double = 0) async throws -> Any {
        var body: [String: Any] = ["op": op, "trace": trace, "altitudeM": altitudeM]
        if let target = target { body["target"] = target }
        return try await post("/v1/tools/envelope", body)
    }
    public func parseSms(_ text: String) async throws -> Any { try await post("/v1/tools/sms", ["text": text]) }
    public func deriveConstraints(_ facets: Any, _ role: String, _ consents: Any? = nil) async throws -> Any {
        var body: [String: Any] = ["facets": facets, "role": role]
        if let consents = consents { body["consents"] = consents }
        return try await post("/v1/tools/constraints", body)
    }
    public func convert(_ value: Double, _ unit: String, _ to: String, _ densityGPerMl: Double? = nil) async throws -> Any {
        var body: [String: Any] = ["value": value, "unit": unit, "to": to]
        if let d = densityGPerMl { body["densityGPerMl"] = d }
        return try await post("/v1/tools/convert", body)
    }
    public func ladder(_ op: String, _ sensors: [Any], _ allowModel: Bool = true, _ humanPresent: Bool = false) async throws -> Any {
        try await post("/v1/tools/ladder", ["op": op, "sensors": sensors, "allowModel": allowModel, "humanPresent": humanPresent])
    }
    public func validate(_ kind: String, _ doc: Any) async throws -> Any { try await post("/v1/tools/validate", ["kind": kind, "doc": doc]) }
    public func humanitarianCheck(_ docs: [Any], _ packs: [Any]? = nil) async throws -> Any {
        var body: [String: Any] = ["docs": docs]
        if let packs = packs { body["packs"] = packs }
        return try await post("/v1/tools/humanitarian", body)
    }
    public func listRecipes() async throws -> Any { try await get("/v1/tools/recipes") }
    public func getRecipe(_ id: String) async throws -> Any { try await get("/v1/tools/recipes/\(id)") }
    public func getDevices() async throws -> Any { try await get("/v1/tools/devices") }
    public func getOps() async throws -> Any { try await get("/v1/tools/vocab/ops") }
    public func getRegistry() async throws -> Any { try await get("/v1/tools/registry") }

    // MARK: Core 0.2 API

    public func capabilities() async throws -> Any { try await get("/v1/capabilities") }
    public func safetyLimits() async throws -> Any { try await get("/v1/safety-limits") }
    public func recalls() async throws -> Any { try await get("/v1/recalls") }
    public func conformance() async throws -> Any { try await get("/v1/conformance") }
    /// The caller's explicit act. Returns the ExecutionStatus (accepted, or refused with a reason);
    /// a Problem with a refusal is thrown as CookwalaProblem.
    public func startExecution(_ request: [String: Any], idempotencyKey: String? = nil, humanPresent: Bool? = nil) async throws -> Any {
        let key = idempotencyKey ?? CookwalaClient.newIdempotencyKey()
        var body = request
        if let hp = humanPresent { body["x-hub-human-present"] = hp }
        lastIdempotencyKey = key
        return try await post("/v1/executions", body, headers: ["Idempotency-Key": key])
    }
    public func getExecution(_ id: String) async throws -> Any { try await get("/v1/executions/\(id)") }
    public func stopExecution(_ id: String, reason: String = "requested") async throws -> Any {
        try await post("/v1/executions/\(id)/stop", ["reason": reason], headers: ["Idempotency-Key": CookwalaClient.newIdempotencyKey()])
    }
    public func resumeExecution(_ id: String, seq: Any) async throws -> Any {
        try await post("/v1/executions/\(id)/resume", [String: Any](),
                       headers: ["Idempotency-Key": CookwalaClient.newIdempotencyKey(), "If-Match": String(describing: seq)])
    }
    public func executionLog(_ id: String) async throws -> Any { try await get("/v1/executions/\(id)/log") }
    public func reportIncident(_ doc: Any) async throws -> Any {
        try await post("/v1/incidents", doc, headers: ["Idempotency-Key": CookwalaClient.newIdempotencyKey()])
    }
}
