# Cookwala reference hub

The Core 0.2 API (`api/core.openapi.yaml`) served by a **simulated device**, so the quickstart
`curl` works on your laptop and device makers have something to test against before they have
hardware. Standard library Python, no persistence, no accounts.

```bash
python hub/cookwala_hub.py --port 7878
# or
docker build -t cookwala-hub -f hub/Dockerfile . && docker run -p 7878:7878 cookwala-hub
```

What it does, in the order Core requires:

1. `POST /v1/executions` checks the Idempotency-Key, the Core version, the recipe hash, recalls,
   the agent mandate scope and allergen blocks, then **dry-runs** the recipe against the device's
   capabilities. If any step cannot be verified it answers `refused` with the reason and the step,
   before anything heats up.
2. Accepted executions advance `accepted → preparing → running → completed` on a clock
   (default 20 simulated seconds per real second). Steps a person must do or confirm pause the
   execution in `needs_human`; `POST …/resume` with `If-Match` continues.
3. Medium temperatures reported in `GET /v1/executions/{id}` stay inside the operation
   envelopes from `vocab/ops.json`.
4. `POST …/stop` always works and ends in `stopped` with an `aborted_safe` log.
5. `GET …/log` returns an `ExecutionLog` with no personal data and `consent.dataset: none`.
6. `GET /v1/safety-limits` returns the limits pack the hub enforces. No request can change it.

Try the refusal first, then add a person:

```bash
H=$(python tools/cookwala_ref.py hash examples/shakshuka.cookwala.json)
curl -s -X POST localhost:7878/v1/executions -H 'Content-Type: application/vnd.cookwala+json' -H 'Idempotency-Key: demo-00000001' \
  -d "{\"core\":\"0.2.0\",\"kind\":\"ExecuteRequest\",\"id\":\"ex-1\",\"recipe\":\"cw:cookwala.ai:example-shakshuka\",\"recipeHash\":\"$H\",\"requestedBy\":\"person-1\",\"idempotencyKey\":\"demo-00000001\"}"
# → "state": "refused", "reason": "needs_human_present" (cutting may not run unattended)
curl -s -X POST localhost:7878/v1/executions -H 'Content-Type: application/vnd.cookwala+json' -H 'Idempotency-Key: demo-00000002' \
  -d "{\"core\":\"0.2.0\",\"kind\":\"ExecuteRequest\",\"id\":\"ex-2\",\"recipe\":\"cw:cookwala.ai:example-shakshuka\",\"recipeHash\":\"$H\",\"requestedBy\":\"person-1\",\"idempotencyKey\":\"demo-00000002\",\"x-hub-human-present\":true}"
# → "state": "accepted" with a plan per step; then GET /v1/executions/ex-2 to watch it run
```

`x-hub-human-present` is a hub extension field (Core allows `x-` fields); a real hub learns
presence from its own sensors.

Limits: one device, one process, in-memory state, no TLS, no pairing. It is a test bed, not a
product; see `docs/CERTIFICATION.md` for what a real executor must also prove.

## Reference tools over HTTP (`/v1/tools/*`)

Not part of the Core API. The hub exposes the reference library so a client in any language gets
exactly the behaviour the conformance vectors test: `POST /v1/tools/{hash|verify|dryrun|envelope|sms|constraints|convert|ladder|validate|humanitarian}`
and `GET /v1/tools/{recipes|recipes/{id}|devices|vocab/ops|registry}`. The arguments and answers are
listed in `scenarios/OPERATIONS.md`; every SDK client (`sdk/*`) wraps them. `validate` resolves a
document's `kind` inside container schemas, as `tools/validate_specs.py` does.
