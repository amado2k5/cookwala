package cookwala

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// A fake hub that checks the headers the client must send and answers like the reference hub.
func fakeHub(t *testing.T) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == "POST" && r.URL.Path == "/v1/tools/sms":
			var body map[string]any
			_ = json.NewDecoder(r.Body).Decode(&body)
			w.Header().Set("Content-Type", "application/vnd.cookwala+json")
			_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "command": "OFFER", "text": body["text"]})
		case r.Method == "POST" && r.URL.Path == "/v1/executions":
			if k := r.Header.Get("Idempotency-Key"); len(k) < 8 || len(k) > 128 {
				t.Errorf("Idempotency-Key %q out of range", k)
			}
			var body map[string]any
			_ = json.NewDecoder(r.Body).Decode(&body)
			if body["x-hub-human-present"] != true {
				t.Errorf("x-hub-human-present not forwarded: %v", body)
			}
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(400)
			_ = json.NewEncoder(w).Encode(map[string]any{"title": "unsupported-version", "refusal": "unsupported_version"})
		case r.Method == "POST" && r.URL.Path == "/v1/executions/e1/resume":
			if r.Header.Get("If-Match") != "3" {
				t.Errorf("If-Match = %q, want 3", r.Header.Get("If-Match"))
			}
			w.WriteHeader(202)
			_ = json.NewEncoder(w).Encode(map[string]any{"seq": 4, "state": "running"})
		case r.Method == "GET" && r.URL.Path == "/v1/recalls":
			_ = json.NewEncoder(w).Encode([]any{})
		default:
			w.WriteHeader(404)
			_ = json.NewEncoder(w).Encode(map[string]any{"title": "not-found"})
		}
	}))
}

func TestToolsAndProblems(t *testing.T) {
	srv := fakeHub(t)
	defer srv.Close()
	c := NewClient(srv.URL)

	out, err := c.ParseSms("OFFER 36KG YOGURT C 4C UB0511")
	if err != nil {
		t.Fatal(err)
	}
	if out.(map[string]any)["command"] != "OFFER" {
		t.Fatalf("unexpected body %v", out)
	}

	_, err = c.StartExecution(map[string]any{"core": "0.1.0", "id": "e1"}, "", Bool(true))
	p, ok := err.(*Problem)
	if !ok {
		t.Fatalf("want *Problem, got %v", err)
	}
	if p.Status != 400 || p.Title != "unsupported-version" || p.Refusal != "unsupported_version" {
		t.Fatalf("problem not decoded: %+v", p)
	}
	if len(c.LastIdempotencyKey) != 24 {
		t.Fatalf("generated key %q", c.LastIdempotencyKey)
	}

	st, err := c.ResumeExecution("e1", 3.0)
	if err != nil {
		t.Fatal(err)
	}
	if st.(map[string]any)["seq"] != 4.0 {
		t.Fatalf("resume status %v", st)
	}

	rec, err := c.Recalls()
	if err != nil {
		t.Fatal(err)
	}
	if len(rec.([]any)) != 0 {
		t.Fatalf("recalls %v", rec)
	}

	if _, err := c.GetRecipe("nope"); err == nil {
		t.Fatal("want a 404 Problem")
	}
}
