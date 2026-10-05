package ai.cookwala.sdk

/**
 * A hub answered with a Problem (`application/problem+json`) or another non-2xx status.
 *
 * Carries the HTTP status, the Problem's `title` and `detail`, the `refusal` when the device refused (a reason
 * code or a `{reason, node, detail}` object, see Core 0.2 section 3) and the whole body. A refusal is a result,
 * not a crash: scenario runners catch this and keep going.
 */
class CookwalaProblem(val status: Int, val body: Any?) : RuntimeException(message(status, body)) {
    val title: String = (body as? Map<*, *>)?.get("title")?.toString() ?: "problem"
    val detail: String? = (body as? Map<*, *>)?.get("detail")?.toString()
    val refusal: Any? = (body as? Map<*, *>)?.get("refusal")

    private companion object {
        fun message(status: Int, body: Any?): String {
            val m = body as? Map<*, *>
            val title = m?.get("title")?.toString() ?: "problem"
            val detail = m?.get("detail")?.toString() ?: ""
            return "$status $title: $detail".trim()
        }
    }
}
