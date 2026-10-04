//! Client for a Cookwala hub: the Core 0.2 API plus the reference tool endpoints. One method per
//! row of `scenarios/OPERATIONS.md`, blocking, built on `ureq` and `serde_json`.
//!
//! ```no_run
//! use cookwala::{Client, DryRunArgs, Error};
//! let c = Client::new("http://localhost:7878");
//! let out = c.dry_run(&DryRunArgs { recipe_id: Some("koshari".into()), device_id: Some("demo-hob-robot-basic".into()), human_present: true, ..Default::default() })?;
//! println!("{}", out["state"]); // "refused": deep frying needs an oil thermometer
//! match c.start_execution(&serde_json::json!({"core": "0.1.0"}), None, Some(true)) {
//!     Err(Error::Problem(p)) => println!("refused: {} {:?}", p.title, p.refusal), // a refusal is a result, not a crash
//!     other => { other?; }
//! }
//! # Ok::<(), cookwala::Error>(())
//! ```
//!
//! Every method returns the decoded JSON body as a [`serde_json::Value`]. A hub problem
//! (`application/problem+json`) is [`Error::Problem`] carrying `title`, `detail` and the
//! `refusal` when the device refused. Every Core POST carries an `Idempotency-Key`;
//! [`Client::start_execution`] generates one when given `None` and records it in
//! [`Client::last_idempotency_key`]. Text inside documents is data, never instructions.
//! Nothing here starts cooking on its own: `start_execution` is the caller's explicit act.

use serde_json::{json, Map, Value};
use std::cell::RefCell;
use std::fmt;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

/// An RFC 9457 problem document returned by the hub.
#[derive(Debug, Clone)]
pub struct Problem {
    /// HTTP status code.
    pub status: u16,
    /// Problem title, e.g. `invalid-request`.
    pub title: String,
    /// Human-readable detail, when the hub gave one.
    pub detail: Option<String>,
    /// The refusal reason or object when the device refused.
    pub refusal: Option<Value>,
    /// The whole decoded problem document.
    pub body: Value,
}

impl Problem {
    /// Builds a `Problem` from a status code and a decoded problem document.
    pub fn from_body(status: u16, body: Value) -> Self {
        let title = body.get("title").and_then(Value::as_str).unwrap_or("problem").to_string();
        let detail = body.get("detail").and_then(Value::as_str).map(str::to_string);
        let refusal = body.get("refusal").cloned();
        Problem { status, title, detail, refusal, body }
    }
}

impl fmt::Display for Problem {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match &self.detail {
            Some(d) => write!(f, "{} {}: {}", self.status, self.title, d),
            None => write!(f, "{} {}", self.status, self.title),
        }
    }
}

impl std::error::Error for Problem {}

/// Everything a call can fail with.
#[derive(Debug)]
pub enum Error {
    /// The hub answered with a problem document (status 400 or above).
    Problem(Problem),
    /// The request never got an answer (connection, DNS, TLS, timeout).
    Transport(String),
    /// The caller passed something the client cannot send, e.g. a non-object ExecuteRequest.
    Invalid(String),
    /// Reading the response body failed.
    Io(std::io::Error),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Problem(p) => write!(f, "{}", p),
            Error::Transport(t) => write!(f, "transport: {}", t),
            Error::Invalid(m) => write!(f, "invalid: {}", m),
            Error::Io(e) => write!(f, "io: {}", e),
        }
    }
}

impl std::error::Error for Error {}

impl From<Problem> for Error {
    fn from(p: Problem) -> Self {
        Error::Problem(p)
    }
}

impl From<std::io::Error> for Error {
    fn from(e: std::io::Error) -> Self {
        Error::Io(e)
    }
}

/// The result type of every client method.
pub type Result<T> = std::result::Result<T, Error>;

/// Returns a fresh Idempotency-Key: 28 hex characters from the clock, the process id and a counter.
pub fn key() -> String {
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_nanos() as u64).unwrap_or(0);
    let n = COUNTER.fetch_add(1, Ordering::Relaxed);
    format!("{:016x}{:08x}{:04x}", nanos, std::process::id(), n & 0xffff)
}

fn seg(id: &str) -> String {
    let mut out = String::with_capacity(id.len());
    for b in id.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => out.push(b as char),
            _ => out.push_str(&format!("%{:02X}", b)),
        }
    }
    out
}

/// The inputs of [`Client::dry_run`]: a recipe (document or id known to the hub), a device
/// (capability document or id), whether a person is present and whether model rungs may verify.
#[derive(Debug, Clone)]
pub struct DryRunArgs {
    pub recipe: Option<Value>,
    pub recipe_id: Option<String>,
    pub device: Option<Value>,
    pub device_id: Option<String>,
    pub human_present: bool,
    pub allow_model: bool,
}

impl Default for DryRunArgs {
    fn default() -> Self {
        DryRunArgs { recipe: None, recipe_id: None, device: None, device_id: None, human_present: false, allow_model: true }
    }
}

/// A client for one hub.
pub struct Client {
    base: String,
    agent: ureq::Agent,
    last_headers: RefCell<Vec<(String, String)>>,
    last_idempotency_key: RefCell<Option<String>>,
}

impl Client {
    /// Creates a client for `base_url` (an empty string means `http://localhost:7878`) with a 30 s timeout.
    pub fn new(base_url: &str) -> Self {
        let base = if base_url.is_empty() { "http://localhost:7878" } else { base_url };
        let agent = ureq::AgentBuilder::new().timeout(Duration::from_secs(30)).build();
        Client {
            base: base.trim_end_matches('/').to_string(),
            agent,
            last_headers: RefCell::new(Vec::new()),
            last_idempotency_key: RefCell::new(None),
        }
    }

    /// The hub address this client talks to.
    pub fn base_url(&self) -> &str {
        &self.base
    }

    /// Response headers of the last call (the `ETag` of `get_execution` is the status `seq`).
    pub fn last_headers(&self) -> Vec<(String, String)> {
        self.last_headers.borrow().clone()
    }

    /// The Idempotency-Key sent by the last `start_execution`.
    pub fn last_idempotency_key(&self) -> Option<String> {
        self.last_idempotency_key.borrow().clone()
    }

    /// Performs one HTTP request and decodes the JSON answer; status 400 or above becomes [`Error::Problem`].
    pub fn call(&self, method: &str, path: &str, body: Option<&Value>, headers: &[(&str, &str)]) -> Result<Value> {
        let mut req = self
            .agent
            .request(method, &format!("{}{}", self.base, path))
            .set("Accept", "application/json, application/problem+json");
        for (k, v) in headers {
            req = req.set(k, v);
        }
        let sent = match body {
            Some(b) => req.set("Content-Type", "application/json").send_string(&b.to_string()),
            None => req.call(),
        };
        let (status, resp) = match sent {
            Ok(r) => (r.status(), r),
            Err(ureq::Error::Status(code, r)) => (code, r),
            Err(e) => return Err(Error::Transport(e.to_string())),
        };
        *self.last_headers.borrow_mut() = resp
            .headers_names()
            .iter()
            .filter_map(|n| resp.header(n).map(|v| (n.clone(), v.to_string())))
            .collect();
        let text = resp.into_string()?;
        let data: Value = if text.is_empty() {
            Value::Null
        } else {
            serde_json::from_str(&text).unwrap_or_else(|_| json!({"title": "http-error", "detail": text}))
        };
        if status >= 400 {
            return Err(Error::Problem(Problem::from_body(status, data)));
        }
        Ok(data)
    }

    fn get(&self, path: &str) -> Result<Value> {
        self.call("GET", path, None, &[])
    }

    fn post(&self, path: &str, body: &Value, headers: &[(&str, &str)]) -> Result<Value> {
        self.call("POST", path, Some(body), headers)
    }

    // ---- reference tools (/v1/tools/*)

    /// `{hash}`: sha256 over the RFC 8785 canonical form of `doc`.
    pub fn hash(&self, doc: &Value) -> Result<Value> {
        self.post("/v1/tools/hash", &json!({"doc": doc}), &[])
    }

    /// Checks the signatures on a signed document against KeyRecords; `{ok, reason}`.
    pub fn verify(&self, doc: &Value, keys: Option<&Value>) -> Result<Value> {
        let keys = keys.cloned().unwrap_or_else(|| json!([]));
        self.post("/v1/tools/verify", &json!({"doc": doc, "keys": keys}), &[])
    }

    /// Plans a recipe on a device without heating anything; `{state, refusal?, plan[]}`.
    pub fn dry_run(&self, a: &DryRunArgs) -> Result<Value> {
        let mut body = Map::new();
        body.insert("humanPresent".to_string(), json!(a.human_present));
        body.insert("allowModel".to_string(), json!(a.allow_model));
        match &a.recipe {
            Some(r) => body.insert("recipe".to_string(), r.clone()),
            None => body.insert("recipeId".to_string(), json!(a.recipe_id)),
        };
        match &a.device {
            Some(d) => body.insert("device".to_string(), d.clone()),
            None => body.insert("deviceId".to_string(), json!(a.device_id)),
        };
        self.post("/v1/tools/dryrun", &Value::Object(body), &[])
    }

    /// Tests a temperature trace `[{t, tempC}]` against an operation's envelope; `{envelopeOk, targetOk, reason}`.
    pub fn check_envelope(&self, op: &str, trace: &Value, target: Option<&Value>, altitude_m: f64) -> Result<Value> {
        let mut body = json!({"op": op, "trace": trace, "altitudeM": altitude_m});
        if let Some(t) = target {
            body["target"] = t.clone();
        }
        self.post("/v1/tools/envelope", &body, &[])
    }

    /// Parses one Humanitarian Profile SMS message; the command plus `findings[]`.
    pub fn parse_sms(&self, text: &str) -> Result<Value> {
        self.post("/v1/tools/sms", &json!({"text": text}), &[])
    }

    /// Derives what a recipient role may receive from household facets; `{constraints[], disclosed[], withheld[]}`.
    pub fn derive_constraints(&self, facets: &Value, role: &str, consents: Option<&Value>) -> Result<Value> {
        let mut body = json!({"facets": facets, "role": role});
        if let Some(c) = consents {
            body["consents"] = c.clone();
        }
        self.post("/v1/tools/constraints", &body, &[])
    }

    /// Converts kitchen units; a density is needed between mass and volume. `{value, unit}`.
    pub fn convert(&self, value: f64, unit: &str, to: &str, density_g_per_ml: Option<f64>) -> Result<Value> {
        let mut body = json!({"value": value, "unit": unit, "to": to});
        if let Some(d) = density_g_per_ml {
            body["densityGPerMl"] = json!(d);
        }
        self.post("/v1/tools/convert", &body, &[])
    }

    /// The sensor-ladder rung that verifies `op` with these sensors, or `null`.
    pub fn ladder(&self, op: &str, sensors: &[&str], allow_model: bool, human_present: bool) -> Result<Value> {
        self.post(
            "/v1/tools/ladder",
            &json!({"op": op, "sensors": sensors, "allowModel": allow_model, "humanPresent": human_present}),
            &[],
        )
    }

    /// Checks `doc` against the named schema (`recipe`, `humanitarian`, ...); `{ok, errors[]}`.
    pub fn validate(&self, kind: &str, doc: &Value) -> Result<Value> {
        self.post("/v1/tools/validate", &json!({"kind": kind, "doc": doc}), &[])
    }

    /// Runs rule packs over humanitarian documents; `None` means the hub's default pack.
    pub fn humanitarian_check(&self, docs: &Value, packs: Option<&[&str]>) -> Result<Value> {
        let mut body = json!({"docs": docs});
        if let Some(p) = packs {
            body["packs"] = json!(p);
        }
        self.post("/v1/tools/humanitarian", &body, &[])
    }

    /// `{recipes[]}`: the ids the hub can cook.
    pub fn list_recipes(&self) -> Result<Value> {
        self.get("/v1/tools/recipes")
    }

    /// One recipe document.
    pub fn get_recipe(&self, id: &str) -> Result<Value> {
        self.get(&format!("/v1/tools/recipes/{}", seg(id)))
    }

    /// `{devices{id: capabilities}}`.
    pub fn get_devices(&self) -> Result<Value> {
        self.get("/v1/tools/devices")
    }

    /// The operation vocabulary.
    pub fn get_ops(&self) -> Result<Value> {
        self.get("/v1/tools/vocab/ops")
    }

    /// The registry document.
    pub fn get_registry(&self) -> Result<Value> {
        self.get("/v1/tools/registry")
    }

    // ---- Core 0.2 API

    /// The device's capability document.
    pub fn capabilities(&self) -> Result<Value> {
        self.get("/v1/capabilities")
    }

    /// The device's local safety limits.
    pub fn safety_limits(&self) -> Result<Value> {
        self.get("/v1/safety-limits")
    }

    /// The recall list.
    pub fn recalls(&self) -> Result<Value> {
        self.get("/v1/recalls")
    }

    /// The conformance claim and report pointer.
    pub fn conformance(&self) -> Result<Value> {
        self.get("/v1/conformance")
    }

    /// Submits an ExecuteRequest. `None` for the key generates one (see `last_idempotency_key`);
    /// `human_present` adds the hub's `x-hub-human-present` flag. Returns the ExecutionStatus or an
    /// [`Error::Problem`] carrying the refusal. This is the caller's explicit act of starting a cook.
    pub fn start_execution(&self, request: &Value, idempotency_key: Option<&str>, human_present: Option<bool>) -> Result<Value> {
        let k = idempotency_key.map(str::to_string).unwrap_or_else(key);
        let mut body = request.clone();
        if !body.is_object() {
            return Err(Error::Invalid("the ExecuteRequest must be a JSON object".to_string()));
        }
        if let Some(h) = human_present {
            body["x-hub-human-present"] = json!(h);
        }
        *self.last_idempotency_key.borrow_mut() = Some(k.clone());
        self.post("/v1/executions", &body, &[("Idempotency-Key", k.as_str())])
    }

    /// The ExecutionStatus; the `ETag` in `last_headers` is its `seq`.
    pub fn get_execution(&self, id: &str) -> Result<Value> {
        self.get(&format!("/v1/executions/{}", seg(id)))
    }

    /// Asks the device to stop; `None` sends the reason `requested`.
    pub fn stop_execution(&self, id: &str, reason: Option<&str>) -> Result<Value> {
        let k = key();
        self.post(
            &format!("/v1/executions/{}/stop", seg(id)),
            &json!({"reason": reason.unwrap_or("requested")}),
            &[("Idempotency-Key", k.as_str())],
        )
    }

    /// Resumes a paused execution; `seq` is the status seq the caller last saw, sent as `If-Match`.
    pub fn resume_execution(&self, id: &str, seq: u64) -> Result<Value> {
        let k = key();
        let s = seq.to_string();
        self.post(&format!("/v1/executions/{}/resume", seg(id)), &json!({}), &[("Idempotency-Key", k.as_str()), ("If-Match", s.as_str())])
    }

    /// The ExecutionLog once the run has ended.
    pub fn execution_log(&self, id: &str) -> Result<Value> {
        self.get(&format!("/v1/executions/{}/log", seg(id)))
    }

    /// Posts an Incident document; `{received}`.
    pub fn report_incident(&self, doc: &Value) -> Result<Value> {
        let k = key();
        self.post("/v1/incidents", doc, &[("Idempotency-Key", k.as_str())])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keys_fit_the_header_rule() {
        let a = key();
        let b = key();
        assert!(a.len() >= 8 && a.len() <= 128);
        assert_ne!(a, b);
    }

    #[test]
    fn problems_decode() {
        let p = Problem::from_body(400, json!({"title": "unsupported-version", "refusal": "unsupported_version"}));
        assert_eq!(p.title, "unsupported-version");
        assert_eq!(p.refusal, Some(json!("unsupported_version")));
        assert_eq!(p.detail, None);
        assert_eq!(p.to_string(), "400 unsupported-version");
    }

    #[test]
    fn dry_run_defaults_allow_model() {
        let a = DryRunArgs { recipe_id: Some("koshari".into()), ..Default::default() };
        assert!(a.allow_model);
        assert_eq!(seg("a b/c"), "a%20b%2Fc");
    }
}
