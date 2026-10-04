// Run a hub first: python hub/cookwala_hub.py --recipes examples
// cargo run --manifest-path sdk/rust/Cargo.toml --example quickstart
use cookwala::{Client, DryRunArgs, Error};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let c = Client::new(&std::env::var("COOKWALA_HUB").unwrap_or_else(|_| "http://localhost:7878".to_string()));
    let out = c.dry_run(&DryRunArgs { recipe_id: Some("koshari".into()), device_id: Some("demo-hob-robot-basic".into()), human_present: true, ..Default::default() })?;
    println!("dry run: {} {}", out["state"], out["refusal"]["reason"]); // refused: deep frying needs an oil thermometer
    match c.start_execution(&serde_json::json!({"core": "0.1.0"}), None, Some(true)) {
        Err(Error::Problem(p)) => println!("refused: {} {:?}", p.title, p.refusal), // a refusal is a result, not a crash
        other => println!("{:?}", other?),
    }
    Ok(())
}
