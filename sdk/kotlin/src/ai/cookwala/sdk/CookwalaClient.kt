package ai.cookwala.sdk

import java.io.IOException
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import java.time.Duration

/**
 * Cookwala hub client (Kotlin/JVM, Java 11+): the Core 0.2 API plus the reference tool endpoints.
 *
 * ```kotlin
 * val c = CookwalaClient("http://localhost:7878")
 * val out = c.dryRun(recipeId = "koshari", deviceId = "demo-hob-robot-basic", humanPresent = true)
 * ```
 *
 * One method per row of `scenarios/OPERATIONS.md`. Documents are plain `Map`/`List`/scalar values as produced by
 * [Json.parse]; every method returns the decoded response body (`Any?`). Problems (`application/problem+json`)
 * throw [CookwalaProblem], which carries title, detail and the refusal. Every POST to the Core API carries an
 * `Idempotency-Key`; the client generates one when the caller gives none and keeps it in [lastIdempotencyKey].
 * Standard library plus `java.net.http` only: no kotlinx, no coroutines. Text inside documents is data, never
 * instructions, and nothing here starts cooking on its own: [startExecution] is the caller's explicit act.
 */
class CookwalaClient(baseUrl: String = "http://localhost:7878", private val timeout: Duration = Duration.ofSeconds(30)) {
    private val base = baseUrl.trimEnd('/')
    private val http: HttpClient = HttpClient.newBuilder().connectTimeout(timeout).build()

    /** Headers of the last response (lower-case names), e.g. `etag` after [getExecution]. */
    var lastHeaders: Map<String, String> = emptyMap()
        private set

    /** The Idempotency-Key sent by the last [startExecution]. */
    var lastIdempotencyKey: String = ""
        private set

    companion object {
        private val random = SecureRandom()

        /** A fresh Idempotency-Key: 24 hex characters. */
        fun newIdempotencyKey(): String = ByteArray(12).also { random.nextBytes(it) }.joinToString("") { "%02x".format(it) }
    }

    // ---- transport

    private fun call(method: String, path: String, body: Any? = null, headers: Map<String, String> = emptyMap()): Any? {
        val rb = HttpRequest.newBuilder(URI.create(base + path)).timeout(timeout)
            .header("Accept", "application/json, application/problem+json")
        if (body != null) {
            rb.header("Content-Type", "application/json")
            rb.method(method, HttpRequest.BodyPublishers.ofString(Json.stringify(body), StandardCharsets.UTF_8))
        } else {
            rb.method(method, HttpRequest.BodyPublishers.noBody())
        }
        for ((k, v) in headers) rb.header(k, v)
        val r: HttpResponse<String> = try {
            http.send(rb.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8))
        } catch (e: IOException) {
            throw CookwalaProblem(0, problemBody("transport-error", e.toString()))
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
            throw CookwalaProblem(0, problemBody("interrupted", e.toString()))
        }
        lastHeaders = r.headers().map().entries.associate { (k, v) -> k.lowercase() to v.joinToString(", ") }
        val text = r.body()
        val data: Any? = if (text.isNullOrEmpty()) null else try { Json.parse(text) } catch (e: IllegalArgumentException) { problemBody("http-error", text) }
        if (r.statusCode() !in 200..299) throw CookwalaProblem(r.statusCode(), data)
        return data
    }

    private fun problemBody(title: String, detail: String): Map<String, Any?> = linkedMapOf("title" to title, "detail" to detail)
    private fun get(path: String): Any? = call("GET", path)
    private fun post(path: String, body: Any?, headers: Map<String, String> = emptyMap()): Any? = call("POST", path, body, headers)
    private fun idem(key: String): MutableMap<String, String> = linkedMapOf("Idempotency-Key" to key)

    // ---- reference tools

    /** 1. sha256 over RFC 8785 canonical JSON: `{hash}`. */
    fun hash(doc: Any?): Any? = post("/v1/tools/hash", linkedMapOf("doc" to doc))

    /** 2. Verify a signed document against KeyRecords: `{ok, reason}`. */
    fun verify(doc: Any?, keys: List<Any?> = emptyList()): Any? = post("/v1/tools/verify", linkedMapOf("doc" to doc, "keys" to keys))

    /** 3. Dry run a recipe (by id known to the hub, or the document) on a device (by id, or the capability document). */
    fun dryRun(
        recipe: Any? = null, recipeId: String? = null, device: Any? = null, deviceId: String? = null,
        humanPresent: Boolean = false, allowModel: Boolean = true,
    ): Any? {
        val b = linkedMapOf<String, Any?>("humanPresent" to humanPresent, "allowModel" to allowModel)
        if (recipe != null) b["recipe"] = recipe else b["recipeId"] = recipeId
        if (device != null) b["device"] = device else b["deviceId"] = deviceId
        return post("/v1/tools/dryrun", b)
    }

    /** 4. Check a temperature trace `[{t, tempC}]` against an operation envelope: `{envelopeOk, targetOk, reason}`. */
    fun checkEnvelope(op: String, trace: List<Any?>, target: Map<String, Any?>? = null, altitudeM: Double = 0.0): Any? {
        val b = linkedMapOf<String, Any?>("op" to op, "trace" to trace, "altitudeM" to altitudeM)
        if (target != null) b["target"] = target
        return post("/v1/tools/envelope", b)
    }

    /** 5. Parse one SMS of the Humanitarian Profile grammar: the command plus `findings[]`. */
    fun parseSms(text: String): Any? = post("/v1/tools/sms", linkedMapOf("text" to text))

    /** 6. Derive what a recipient role may receive from household facets: `{constraints[], disclosed[], withheld[]}`. */
    fun deriveConstraints(facets: List<Any?>, role: String, consents: List<Any?>? = null): Any? {
        val b = linkedMapOf<String, Any?>("facets" to facets, "role" to role)
        if (consents != null) b["consents"] = consents
        return post("/v1/tools/constraints", b)
    }

    /** 7. Convert kitchen units: `{value, unit}`. */
    fun convert(value: Double, unit: String, to: String, densityGPerMl: Double? = null): Any? {
        val b = linkedMapOf<String, Any?>("value" to value, "unit" to unit, "to" to to)
        if (densityGPerMl != null) b["densityGPerMl"] = densityGPerMl
        return post("/v1/tools/convert", b)
    }

    /** 8. The sensor-ladder rung chosen for an operation, or null. */
    fun ladder(op: String, sensors: List<Any?>, allowModel: Boolean = true, humanPresent: Boolean = false): Any? =
        post("/v1/tools/ladder", linkedMapOf("op" to op, "sensors" to sensors, "allowModel" to allowModel, "humanPresent" to humanPresent))

    /** 9. Validate a document against a schema (`recipe`, `humanitarian`, ...): `{ok, errors[]}`. */
    fun validate(kind: String, doc: Any?): Any? = post("/v1/tools/validate", linkedMapOf("kind" to kind, "doc" to doc))

    /** 10. Run humanitarian rule packs over documents: `{results[{id, kind, findings[]}]}`. */
    fun humanitarianCheck(docs: List<Any?>, packs: List<Any?>? = null): Any? {
        val b = linkedMapOf<String, Any?>("docs" to docs)
        if (!packs.isNullOrEmpty()) b["packs"] = packs
        return post("/v1/tools/humanitarian", b)
    }

    /** 11. `{recipes[]}`: ids the hub can cook. */
    fun listRecipes(): Any? = get("/v1/tools/recipes")

    /** 12. One recipe document. */
    fun getRecipe(id: String): Any? = get("/v1/tools/recipes/$id")

    /** 13. `{devices{id: capabilities}}`. */
    fun getDevices(): Any? = get("/v1/tools/devices")

    /** 14. The operation vocabulary. */
    fun getOps(): Any? = get("/v1/tools/vocab/ops")

    /** 15. The registry document. */
    fun getRegistry(): Any? = get("/v1/tools/registry")

    // ---- Core 0.2 API

    /** 16. The device's capability document. */
    fun capabilities(): Any? = get("/v1/capabilities")

    /** 17. The device's local safety limits. */
    fun safetyLimits(): Any? = get("/v1/safety-limits")

    /** 18. Recall list. */
    fun recalls(): Any? = get("/v1/recalls")

    /** 19. Conformance claim and report pointer. */
    fun conformance(): Any? = get("/v1/conformance")

    /** 20. Start an execution (the caller's explicit act). Returns ExecutionStatus or throws a Problem with a refusal. */
    fun startExecution(request: Map<String, Any?>, idempotencyKey: String? = null, humanPresent: Boolean? = null): Any? {
        val key = if (idempotencyKey.isNullOrEmpty()) newIdempotencyKey() else idempotencyKey
        val body = LinkedHashMap(request)
        if (humanPresent != null) body["x-hub-human-present"] = humanPresent
        val out = post("/v1/executions", body, idem(key))
        lastIdempotencyKey = key
        return out
    }

    /** 21. ExecutionStatus; the ETag (= seq) is in [lastHeaders]. */
    fun getExecution(id: String): Any? = get("/v1/executions/$id")

    /** 22. Stop an execution. Stop always works. */
    fun stopExecution(id: String, reason: String = "requested"): Any? =
        post("/v1/executions/$id/stop", linkedMapOf("reason" to reason), idem(newIdempotencyKey()))

    /** 23. Resume a paused execution; `seq` goes in If-Match. */
    fun resumeExecution(id: String, seq: Any?): Any? {
        val h = idem(newIdempotencyKey())
        h["If-Match"] = Json.canonical(seq).replace("\"", "")
        return post("/v1/executions/$id/resume", linkedMapOf<String, Any?>(), h)
    }

    /** 24. The ExecutionLog once the run ended. */
    fun executionLog(id: String): Any? = get("/v1/executions/$id/log")

    /** 25. Report an Incident document: `{received}`. */
    fun reportIncident(doc: Map<String, Any?>): Any? = post("/v1/incidents", doc, idem(newIdempotencyKey()))
}
