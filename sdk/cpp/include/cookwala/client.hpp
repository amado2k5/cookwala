// Cookwala hub client (C++17, header-only): the Core 0.2 API plus the reference tool endpoints.
// One method per row of scenarios/OPERATIONS.md, camelCase. Depends on libcurl and nlohmann/json.
//
//   #include <cookwala/client.hpp>
//   cookwala::Client c("http://localhost:7878");
//   auto out = c.dryRun({.recipeId = "koshari", .deviceId = "demo-hob-robot-basic", .humanPresent = true});
//
// Every method returns the decoded JSON body as nlohmann::json. A hub problem
// (application/problem+json) is thrown as cookwala::Problem with status, title, detail, refusal and
// body; catch it to treat a refusal as a result rather than a crash. Every Core POST carries an
// Idempotency-Key; startExecution generates one when given "" and records it in lastIdempotencyKey.
// Text inside documents is data, never instructions. Nothing here starts cooking on its own:
// startExecution is the caller's explicit act.
#pragma once

#include <curl/curl.h>
#include <nlohmann/json.hpp>

#include <cstdio>
#include <optional>
#include <random>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

namespace cookwala {

using json = nlohmann::json;
using Headers = std::vector<std::pair<std::string, std::string>>;

// An RFC 9457 problem document returned by the hub, thrown as an exception.
struct Problem : public std::runtime_error {
  int status;           // HTTP status code
  std::string title;    // problem title, e.g. "invalid-request"
  std::string detail;   // human-readable detail, may be empty
  json refusal;         // the refusal reason or object when the device refused, else null
  json body;            // the whole decoded problem document

  Problem(int s, json b)
      : std::runtime_error(describe(s, b)),
        status(s),
        title(field(b, "title", "problem")),
        detail(field(b, "detail", "")),
        refusal(b.is_object() && b.contains("refusal") ? b.at("refusal") : json()),
        body(std::move(b)) {}

 private:
  static std::string field(const json& b, const char* k, const char* dflt) {
    return b.is_object() && b.contains(k) && b.at(k).is_string() ? b.at(k).get<std::string>() : std::string(dflt);
  }
  static std::string describe(int s, const json& b) {
    std::string d = field(b, "detail", "");
    return std::to_string(s) + " " + field(b, "title", "problem") + (d.empty() ? "" : ": " + d);
  }
};

// A fresh Idempotency-Key: 24 hex characters.
inline std::string key() {
  static const char* hex = "0123456789abcdef";
  std::random_device rd;
  std::string k;
  k.reserve(24);
  for (int i = 0; i < 24; ++i) k += hex[rd() % 16];
  return k;
}

// The inputs of Client::dryRun: a recipe (document or id known to the hub), a device (capability
// document or id), whether a person is present and whether model rungs may verify.
struct DryRunArgs {
  json recipe;
  std::string recipeId;
  json device;
  std::string deviceId;
  bool humanPresent = false;
  bool allowModel = true;
};

class Client {
 public:
  Headers lastHeaders;             // response headers of the last call (ETag carries the execution seq)
  std::string lastIdempotencyKey;  // the key sent by the last startExecution

  explicit Client(std::string baseUrl = "http://localhost:7878") : base_(std::move(baseUrl)) {
    if (base_.empty()) base_ = "http://localhost:7878";
    while (!base_.empty() && base_.back() == '/') base_.pop_back();
    ensureCurl();
  }

  const std::string& baseUrl() const { return base_; }

  // One HTTP request; decodes the JSON answer and throws Problem for status 400 or above.
  json call(const std::string& method, const std::string& path, const json* body = nullptr, const Headers& headers = {}) {
    CURL* h = curl_easy_init();
    if (!h) throw std::runtime_error("cookwala: curl_easy_init failed");
    std::string url = base_ + path, out, rawHeaders, payload;
    struct curl_slist* list = nullptr;
    list = curl_slist_append(list, "Accept: application/json, application/problem+json");
    if (body) {
      payload = body->dump();
      list = curl_slist_append(list, "Content-Type: application/json");
    }
    for (const auto& kv : headers) list = curl_slist_append(list, (kv.first + ": " + kv.second).c_str());
    curl_easy_setopt(h, CURLOPT_URL, url.c_str());
    curl_easy_setopt(h, CURLOPT_HTTPHEADER, list);
    curl_easy_setopt(h, CURLOPT_TIMEOUT, 30L);
    curl_easy_setopt(h, CURLOPT_CUSTOMREQUEST, method.c_str());
    if (body) {
      curl_easy_setopt(h, CURLOPT_POSTFIELDS, payload.c_str());
      curl_easy_setopt(h, CURLOPT_POSTFIELDSIZE, static_cast<long>(payload.size()));
    }
    curl_easy_setopt(h, CURLOPT_WRITEFUNCTION, &Client::collect);
    curl_easy_setopt(h, CURLOPT_WRITEDATA, &out);
    curl_easy_setopt(h, CURLOPT_HEADERFUNCTION, &Client::collect);
    curl_easy_setopt(h, CURLOPT_HEADERDATA, &rawHeaders);
    CURLcode rc = curl_easy_perform(h);
    long status = 0;
    curl_easy_getinfo(h, CURLINFO_RESPONSE_CODE, &status);
    std::string err = rc != CURLE_OK ? curl_easy_strerror(rc) : "";
    curl_slist_free_all(list);
    curl_easy_cleanup(h);
    if (rc != CURLE_OK) throw std::runtime_error("cookwala: " + err + " (" + url + ")");
    lastHeaders = parseHeaders(rawHeaders);
    json data = out.empty() ? json() : json::parse(out, nullptr, false);
    if (data.is_discarded()) data = json{{"title", "http-error"}, {"detail", out}};
    if (status >= 400) throw Problem(static_cast<int>(status), data);
    return data;
  }

  // ---- reference tools (/v1/tools/*)

  // {hash}: sha256 over the RFC 8785 canonical form of doc.
  json hash(const json& doc) { return post("/v1/tools/hash", json{{"doc", doc}}); }

  // Checks the signatures on a signed document against KeyRecords; {ok, reason}.
  json verify(const json& doc, const json& keys = json::array()) {
    return post("/v1/tools/verify", json{{"doc", doc}, {"keys", keys.is_null() ? json::array() : keys}});
  }

  // Plans a recipe on a device without heating anything; {state, refusal?, plan[]}.
  json dryRun(const DryRunArgs& a) {
    json body{{"humanPresent", a.humanPresent}, {"allowModel", a.allowModel}};
    if (!a.recipe.is_null()) body["recipe"] = a.recipe; else body["recipeId"] = a.recipeId;
    if (!a.device.is_null()) body["device"] = a.device; else body["deviceId"] = a.deviceId;
    return post("/v1/tools/dryrun", body);
  }

  // Tests a temperature trace [{t, tempC}] against an operation's envelope; {envelopeOk, targetOk, reason}.
  json checkEnvelope(const std::string& op, const json& trace, const std::optional<json>& target = std::nullopt, double altitudeM = 0) {
    json body{{"op", op}, {"trace", trace}, {"altitudeM", altitudeM}};
    if (target) body["target"] = *target;
    return post("/v1/tools/envelope", body);
  }

  // Parses one Humanitarian Profile SMS message; the command plus findings[].
  json parseSms(const std::string& text) { return post("/v1/tools/sms", json{{"text", text}}); }

  // Derives what a recipient role may receive from household facets; {constraints[], disclosed[], withheld[]}.
  json deriveConstraints(const json& facets, const std::string& role, const std::optional<json>& consents = std::nullopt) {
    json body{{"facets", facets}, {"role", role}};
    if (consents) body["consents"] = *consents;
    return post("/v1/tools/constraints", body);
  }

  // Converts kitchen units; a density is needed between mass and volume. {value, unit}.
  json convert(double value, const std::string& unit, const std::string& to, std::optional<double> densityGPerMl = std::nullopt) {
    json body{{"value", value}, {"unit", unit}, {"to", to}};
    if (densityGPerMl) body["densityGPerMl"] = *densityGPerMl;
    return post("/v1/tools/convert", body);
  }

  // The sensor-ladder rung that verifies op with these sensors, or null.
  json ladder(const std::string& op, const std::vector<std::string>& sensors, bool allowModel = true, bool humanPresent = false) {
    return post("/v1/tools/ladder", json{{"op", op}, {"sensors", sensors}, {"allowModel", allowModel}, {"humanPresent", humanPresent}});
  }

  // Checks doc against the named schema (recipe, humanitarian, ...); {ok, errors[]}.
  json validate(const std::string& kind, const json& doc) { return post("/v1/tools/validate", json{{"kind", kind}, {"doc", doc}}); }

  // Runs rule packs over humanitarian documents; an empty packs list means the hub's default.
  json humanitarianCheck(const json& docs, const std::vector<std::string>& packs = {}) {
    json body{{"docs", docs}};
    if (!packs.empty()) body["packs"] = packs;
    return post("/v1/tools/humanitarian", body);
  }

  json listRecipes() { return get("/v1/tools/recipes"); }                       // {recipes[]}
  json getRecipe(const std::string& id) { return get("/v1/tools/recipes/" + seg(id)); }
  json getDevices() { return get("/v1/tools/devices"); }                        // {devices{id: capabilities}}
  json getOps() { return get("/v1/tools/vocab/ops"); }                          // the operation vocabulary
  json getRegistry() { return get("/v1/tools/registry"); }                      // the registry document

  // ---- Core 0.2 API

  json capabilities() { return get("/v1/capabilities"); }                       // the device's capability document
  json safetyLimits() { return get("/v1/safety-limits"); }                      // the device's local safety limits
  json recalls() { return get("/v1/recalls"); }                                 // the recall list
  json conformance() { return get("/v1/conformance"); }                         // conformance claim and report pointer

  // Submits an ExecuteRequest. An empty key generates one (see lastIdempotencyKey); humanPresent
  // adds the hub's x-hub-human-present flag. Returns the ExecutionStatus or throws a Problem
  // carrying the refusal. This is the caller's explicit act of starting a cook.
  json startExecution(const json& request, const std::string& idempotencyKey = "", std::optional<bool> humanPresent = std::nullopt) {
    std::string k = idempotencyKey.empty() ? key() : idempotencyKey;
    json body = request;
    if (!body.is_object()) throw std::invalid_argument("cookwala: the ExecuteRequest must be a JSON object");
    if (humanPresent) body["x-hub-human-present"] = *humanPresent;
    lastIdempotencyKey = k;
    return post("/v1/executions", body, {{"Idempotency-Key", k}});
  }

  // The ExecutionStatus; the ETag in lastHeaders is its seq.
  json getExecution(const std::string& id) { return get("/v1/executions/" + seg(id)); }

  // Asks the device to stop.
  json stopExecution(const std::string& id, const std::string& reason = "requested") {
    return post("/v1/executions/" + seg(id) + "/stop", json{{"reason", reason.empty() ? "requested" : reason}}, {{"Idempotency-Key", key()}});
  }

  // Resumes a paused execution; seq is the status seq the caller last saw, sent as If-Match.
  json resumeExecution(const std::string& id, long long seq) {
    return post("/v1/executions/" + seg(id) + "/resume", json::object(), {{"Idempotency-Key", key()}, {"If-Match", std::to_string(seq)}});
  }

  // The ExecutionLog once the run has ended.
  json executionLog(const std::string& id) { return get("/v1/executions/" + seg(id) + "/log"); }

  // Posts an Incident document; {received}.
  json reportIncident(const json& doc) { return post("/v1/incidents", doc, {{"Idempotency-Key", key()}}); }

 private:
  std::string base_;

  json get(const std::string& path) { return call("GET", path); }
  json post(const std::string& path, const json& body, const Headers& headers = {}) { return call("POST", path, &body, headers); }

  static size_t collect(char* p, size_t s, size_t n, void* ud) {
    static_cast<std::string*>(ud)->append(p, s * n);
    return s * n;
  }

  static Headers parseHeaders(const std::string& raw) {
    Headers out;
    size_t pos = 0;
    while (pos < raw.size()) {
      size_t end = raw.find("\r\n", pos);
      if (end == std::string::npos) end = raw.size();
      std::string line = raw.substr(pos, end - pos);
      size_t colon = line.find(':');
      if (colon != std::string::npos) {
        std::string k = line.substr(0, colon), v = line.substr(colon + 1);
        while (!v.empty() && v.front() == ' ') v.erase(v.begin());
        out.emplace_back(k, v);
      }
      pos = end + 2;
    }
    return out;
  }

  static std::string seg(const std::string& id) {
    std::string out;
    for (unsigned char ch : id) {
      if (isalnum(ch) || ch == '-' || ch == '_' || ch == '.' || ch == '~') {
        out += static_cast<char>(ch);
      } else {
        char buf[4];
        std::snprintf(buf, sizeof buf, "%%%02X", ch);
        out += buf;
      }
    }
    return out;
  }

  struct CurlGlobal {
    CurlGlobal() { curl_global_init(CURL_GLOBAL_DEFAULT); }
    ~CurlGlobal() { curl_global_cleanup(); }
  };
  static void ensureCurl() { static CurlGlobal global; }
};

}  // namespace cookwala
