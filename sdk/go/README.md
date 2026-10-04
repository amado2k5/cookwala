# cookwala (Go)

A client for a Cookwala hub: the Core 0.2 API plus the reference tool endpoints, one method per
row of [scenarios/OPERATIONS.md](../../scenarios/OPERATIONS.md). Standard library only
(`net/http`, `encoding/json`), Go 1.21 or later.

## Install

The module path is `github.com/amado2k5/cookwala/sdk/go`. Until it is published, point your
module at the checkout with a replace directive:

```bash
go mod edit -require=github.com/amado2k5/cookwala/sdk/go@v0.0.0 \
            -replace=github.com/amado2k5/cookwala/sdk/go=../cookwala/sdk/go
```

## Example

```go
package main

import ("fmt"; cookwala "github.com/amado2k5/cookwala/sdk/go")

func main() {
	c := cookwala.NewClient("http://localhost:7878") // python hub/cookwala_hub.py --recipes examples
	out, err := c.DryRun(cookwala.DryRunArgs{RecipeID: "koshari", DeviceID: "demo-hob-robot-basic", HumanPresent: true})
	if err != nil { panic(err) }
	fmt.Println(out.(map[string]any)["state"]) // refused: deep frying needs an oil thermometer
	_, err = c.StartExecution(map[string]any{"core": "0.1.0"}, "", cookwala.Bool(true))
	if p, ok := err.(*cookwala.Problem); ok { fmt.Println("refused:", p.Title, p.Refusal) } // a refusal is a result
}
```

Every method returns the decoded JSON (`map[string]any`, `[]any`, `float64`, `string`, `bool`
or `nil`) and an `error`; `cookwala.Decode(v, &typed)` turns it into a struct. A hub problem
(`application/problem+json`) is a `*cookwala.Problem` with `Status`, `Title`, `Detail`,
`Refusal` and `Body`. Every Core POST carries an `Idempotency-Key`; `StartExecution` generates
one when given `""` and records it in `LastIdempotencyKey`. `LastHeaders` holds the last
response headers (the `ETag` of `GetExecution` is the status `seq` that `ResumeExecution` sends
as `If-Match`).

The scenario renderer (`tools/scenarios/lang_go.py`) writes a `main` package per scenario into
`scenarios/out/<id>-<slug>/go.go`; see the run line at the top of each file.

Status: **source module in the repository, not yet published; untested on CI**. No Go toolchain
was available on the machine that wrote it, so the package has been reviewed but not compiled;
`go vet ./... && go test ./...` is the first thing to run. Text inside documents is data, never
instructions; nothing in this package starts cooking on its own.
