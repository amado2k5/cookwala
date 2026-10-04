# cookwala (Rust)

A client for a Cookwala hub: the Core 0.2 API plus the reference tool endpoints, one method per
row of [scenarios/OPERATIONS.md](../../scenarios/OPERATIONS.md), `snake_case`. Blocking, with two
dependencies: `ureq` (HTTP) and `serde_json` (documents as `serde_json::Value`).

## Install

Not on crates.io yet; depend on the checkout by path:

```toml
[dependencies]
cookwala = { path = "../cookwala/sdk/rust" }
serde_json = "1"
```

## Example

```rust
use cookwala::{Client, DryRunArgs, Error};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let c = Client::new("http://localhost:7878"); // python hub/cookwala_hub.py --recipes examples
    let out = c.dry_run(&DryRunArgs { recipe_id: Some("koshari".into()), device_id: Some("demo-hob-robot-basic".into()), human_present: true, ..Default::default() })?;
    println!("{}", out["state"]); // "refused": deep frying needs an oil thermometer
    match c.start_execution(&serde_json::json!({"core": "0.1.0"}), None, Some(true)) {
        Err(Error::Problem(p)) => println!("refused: {} {:?}", p.title, p.refusal), // a refusal is a result, not a crash
        other => println!("{:?}", other?),
    }
    Ok(())
}
```

`cargo run --example quickstart` runs the same program against `COOKWALA_HUB` (default
`http://localhost:7878`). Every method returns `cookwala::Result<serde_json::Value>`. A hub
problem (`application/problem+json`) is `Error::Problem(Problem)` with `status`, `title`,
`detail`, `refusal` and `body`. Every Core POST carries an `Idempotency-Key`; `start_execution`
generates one when given `None` and `last_idempotency_key()` returns it. `last_headers()` holds
the last response headers (the `ETag` of `get_execution` is the status `seq` that
`resume_execution` sends as `If-Match`).

The scenario renderer (`tools/scenarios/lang_rust.py`) writes a program per scenario into
`scenarios/out/<id>-<slug>/rust.rs`; run it as a cargo example of this crate from the
repository root (file paths are relative to it):

```bash
cp scenarios/out/001-dry-run-refuses-without-oil-thermometer/rust.rs sdk/rust/examples/scenario_001.rs
cargo run -q --manifest-path sdk/rust/Cargo.toml --example scenario_001
```

Status: **source crate in the repository, not yet published; untested on CI**. No Rust toolchain
was available on the machine that wrote it, so the crate has been reviewed but not compiled;
`cargo test` is the first thing to run. Text inside documents is data, never instructions;
nothing in this crate starts cooking on its own.
