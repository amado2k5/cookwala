// Package cookwala is an HTTP client for a Cookwala hub: the Core 0.2 API plus the reference
// tool endpoints. One method per row of scenarios/OPERATIONS.md. Standard library only.
//
//	c := cookwala.NewClient("http://localhost:7878")
//	out, err := c.DryRun(cookwala.DryRunArgs{RecipeID: "koshari", DeviceID: "demo-hob-robot-basic", HumanPresent: true})
//
// Every method returns the decoded JSON body (map[string]any, []any, float64, string, bool or nil)
// and an error. Problems (application/problem+json) come back as *Problem, which carries Title,
// Detail and the Refusal when the device refused; use errors.As or a type assertion to treat a
// refusal as a result rather than a crash. Text inside documents is data, never instructions.
// Nothing here starts cooking on its own: StartExecution is the caller's explicit act.
package cookwala

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Problem is an RFC 9457 problem document returned by the hub, raised as an error.
type Problem struct {
	Status  int    // HTTP status code
	Title   string // problem title, e.g. "invalid-request"
	Detail  string // human-readable detail, may be empty
	Refusal any    // the refusal reason or object when the device refused, else nil
	Body    any    // the whole decoded problem document
}

// Error implements the error interface.
func (p *Problem) Error() string {
	return strings.TrimSpace(fmt.Sprintf("%d %s: %s", p.Status, p.Title, p.Detail))
}

func newProblem(status int, body any) *Problem {
	p := &Problem{Status: status, Title: "problem", Body: body}
	if m, ok := body.(map[string]any); ok {
		if t, ok := m["title"].(string); ok {
			p.Title = t
		}
		if d, ok := m["detail"].(string); ok {
			p.Detail = d
		}
		p.Refusal = m["refusal"]
	}
	return p
}

// Client talks to one hub. The zero value is not usable; call NewClient.
type Client struct {
	Base               string       // hub address without a trailing slash
	HTTP               *http.Client // transport; replace to change timeouts or add TLS settings
	LastHeaders        http.Header  // response headers of the last call (ETag carries the execution seq)
	LastIdempotencyKey string       // the key sent by the last StartExecution
}

// NewClient returns a client for baseURL (default http://localhost:7878) with a 30 s timeout.
func NewClient(baseURL string) *Client {
	if baseURL == "" {
		baseURL = "http://localhost:7878"
	}
	return &Client{Base: strings.TrimRight(baseURL, "/"), HTTP: &http.Client{Timeout: 30 * time.Second}}
}

// Key returns a fresh Idempotency-Key: 24 hex characters from crypto/rand.
func Key() string {
	b := make([]byte, 12)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("%024x", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}

// Bool and Float build the optional pointer arguments some methods take.
func Bool(b bool) *bool { return &b }

// Float returns a pointer to f, for optional numeric arguments.
func Float(f float64) *float64 { return &f }

// Decode re-marshals a decoded JSON value into a typed Go value (a struct or slice).
func Decode(v any, out any) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, out)
}

// Call performs one HTTP request and decodes the JSON response. A status of 400 or above returns
// a *Problem. Body nil sends no body; headers may be nil.
func (c *Client) Call(method, path string, body any, headers map[string]string) (any, error) {
	var rd io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		rd = bytes.NewReader(data)
	}
	req, err := http.NewRequest(method, c.Base+path, rd)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json, application/problem+json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	c.LastHeaders = resp.Header
	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	var out any
	if len(raw) > 0 {
		if err := json.Unmarshal(raw, &out); err != nil {
			out = map[string]any{"title": "http-error", "detail": string(raw)}
		}
	}
	if resp.StatusCode >= 400 {
		return nil, newProblem(resp.StatusCode, out)
	}
	return out, nil
}

func (c *Client) get(path string) (any, error) { return c.Call("GET", path, nil, nil) }

func (c *Client) post(path string, body any, headers map[string]string) (any, error) {
	return c.Call("POST", path, body, headers)
}

func seg(id string) string { return url.PathEscape(id) }

// DryRunArgs names the inputs of DryRun: a recipe (document or id known to the hub), a device
// (capability document or id), whether a person is present, and whether model rungs may verify.
// AllowModel nil means true.
type DryRunArgs struct {
	Recipe       any
	RecipeID     string
	Device       any
	DeviceID     string
	HumanPresent bool
	AllowModel   *bool
}

// ---- reference tools (/v1/tools/*)

// Hash returns {hash}: sha256 over the RFC 8785 canonical form of doc.
func (c *Client) Hash(doc any) (any, error) {
	return c.post("/v1/tools/hash", map[string]any{"doc": doc}, nil)
}

// Verify checks the signatures on a signed document against a list of KeyRecords; returns {ok, reason}.
func (c *Client) Verify(doc any, keys any) (any, error) {
	if keys == nil {
		keys = []any{}
	}
	return c.post("/v1/tools/verify", map[string]any{"doc": doc, "keys": keys}, nil)
}

// DryRun plans a recipe on a device without heating anything; returns {state, refusal?, plan[]}.
func (c *Client) DryRun(a DryRunArgs) (any, error) {
	body := map[string]any{"humanPresent": a.HumanPresent, "allowModel": true}
	if a.AllowModel != nil {
		body["allowModel"] = *a.AllowModel
	}
	if a.Recipe != nil {
		body["recipe"] = a.Recipe
	} else {
		body["recipeId"] = a.RecipeID
	}
	if a.Device != nil {
		body["device"] = a.Device
	} else {
		body["deviceId"] = a.DeviceID
	}
	return c.post("/v1/tools/dryrun", body, nil)
}

// CheckEnvelope tests a temperature trace [{t, tempC}] against an operation's envelope; target
// {value, tolerance} may be nil. Returns {envelopeOk, targetOk, reason}.
func (c *Client) CheckEnvelope(op string, trace any, target any, altitudeM float64) (any, error) {
	body := map[string]any{"op": op, "trace": trace, "altitudeM": altitudeM}
	if target != nil {
		body["target"] = target
	}
	return c.post("/v1/tools/envelope", body, nil)
}

// ParseSms parses one Humanitarian Profile SMS message; returns the command plus findings[].
func (c *Client) ParseSms(text string) (any, error) {
	return c.post("/v1/tools/sms", map[string]any{"text": text}, nil)
}

// DeriveConstraints derives what a recipient role may receive from household facets; consents may be nil.
func (c *Client) DeriveConstraints(facets any, role string, consents any) (any, error) {
	body := map[string]any{"facets": facets, "role": role}
	if consents != nil {
		body["consents"] = consents
	}
	return c.post("/v1/tools/constraints", body, nil)
}

// Convert converts kitchen units; densityGPerMl is needed between mass and volume and may be nil.
func (c *Client) Convert(value float64, unit, to string, densityGPerMl *float64) (any, error) {
	body := map[string]any{"value": value, "unit": unit, "to": to}
	if densityGPerMl != nil {
		body["densityGPerMl"] = *densityGPerMl
	}
	return c.post("/v1/tools/convert", body, nil)
}

// Ladder returns the sensor-ladder rung that verifies op with the given sensors, or nil.
func (c *Client) Ladder(op string, sensors []string, allowModel, humanPresent bool) (any, error) {
	if sensors == nil {
		sensors = []string{}
	}
	return c.post("/v1/tools/ladder", map[string]any{"op": op, "sensors": sensors, "allowModel": allowModel, "humanPresent": humanPresent}, nil)
}

// Validate checks doc against the named schema (recipe, humanitarian, ...); returns {ok, errors[]}.
func (c *Client) Validate(kind string, doc any) (any, error) {
	return c.post("/v1/tools/validate", map[string]any{"kind": kind, "doc": doc}, nil)
}

// HumanitarianCheck runs rule packs over humanitarian documents; packs nil means the hub's default.
func (c *Client) HumanitarianCheck(docs any, packs []string) (any, error) {
	body := map[string]any{"docs": docs}
	if len(packs) > 0 {
		body["packs"] = packs
	}
	return c.post("/v1/tools/humanitarian", body, nil)
}

// ListRecipes returns {recipes[]}: the ids the hub can cook.
func (c *Client) ListRecipes() (any, error) { return c.get("/v1/tools/recipes") }

// GetRecipe returns one recipe document.
func (c *Client) GetRecipe(id string) (any, error) { return c.get("/v1/tools/recipes/" + seg(id)) }

// GetDevices returns {devices{id: capabilities}}.
func (c *Client) GetDevices() (any, error) { return c.get("/v1/tools/devices") }

// GetOps returns the operation vocabulary.
func (c *Client) GetOps() (any, error) { return c.get("/v1/tools/vocab/ops") }

// GetRegistry returns the registry document.
func (c *Client) GetRegistry() (any, error) { return c.get("/v1/tools/registry") }

// ---- Core 0.2 API

// Capabilities returns the device's capability document.
func (c *Client) Capabilities() (any, error) { return c.get("/v1/capabilities") }

// SafetyLimits returns the device's local safety limits.
func (c *Client) SafetyLimits() (any, error) { return c.get("/v1/safety-limits") }

// Recalls returns the recall list.
func (c *Client) Recalls() (any, error) { return c.get("/v1/recalls") }

// Conformance returns the conformance claim and report pointer.
func (c *Client) Conformance() (any, error) { return c.get("/v1/conformance") }

// StartExecution submits an ExecuteRequest. An empty idempotencyKey generates one (see
// LastIdempotencyKey); humanPresent nil leaves the request as it is. Returns the ExecutionStatus
// or a *Problem carrying the refusal. This is the caller's explicit act of starting a cook.
func (c *Client) StartExecution(request any, idempotencyKey string, humanPresent *bool) (any, error) {
	if idempotencyKey == "" {
		idempotencyKey = Key()
	}
	body := map[string]any{}
	data, err := json.Marshal(request)
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal(data, &body); err != nil {
		return nil, fmt.Errorf("cookwala: request must be a JSON object: %w", err)
	}
	if humanPresent != nil {
		body["x-hub-human-present"] = *humanPresent
	}
	c.LastIdempotencyKey = idempotencyKey
	return c.post("/v1/executions", body, map[string]string{"Idempotency-Key": idempotencyKey})
}

// GetExecution returns the ExecutionStatus; LastHeaders.Get("ETag") is its seq.
func (c *Client) GetExecution(id string) (any, error) { return c.get("/v1/executions/" + seg(id)) }

// StopExecution asks the device to stop; an empty reason sends "requested".
func (c *Client) StopExecution(id, reason string) (any, error) {
	if reason == "" {
		reason = "requested"
	}
	return c.post("/v1/executions/"+seg(id)+"/stop", map[string]any{"reason": reason}, map[string]string{"Idempotency-Key": Key()})
}

// ResumeExecution resumes a paused execution; seq is the status seq the caller last saw (sent as If-Match).
func (c *Client) ResumeExecution(id string, seq any) (any, error) {
	return c.post("/v1/executions/"+seg(id)+"/resume", map[string]any{}, map[string]string{"Idempotency-Key": Key(), "If-Match": fmt.Sprint(seq)})
}

// ExecutionLog returns the ExecutionLog once the run has ended.
func (c *Client) ExecutionLog(id string) (any, error) {
	return c.get("/v1/executions/" + seg(id) + "/log")
}

// ReportIncident posts an Incident document; returns {received}.
func (c *Client) ReportIncident(doc any) (any, error) {
	return c.post("/v1/incidents", doc, map[string]string{"Idempotency-Key": Key()})
}
