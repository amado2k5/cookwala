# Cookwala for Swift

A client for a Cookwala hub: the Core 0.2 API plus the reference tool endpoints, one method per
row of [`scenarios/OPERATIONS.md`](../../scenarios/OPERATIONS.md) (camelCase). Foundation only:
`URLSession` with async/await, JSON as `[String: Any]`, `[Any]` and `Any` through
`JSONSerialization`. Problems (`application/problem+json`) are thrown as `CookwalaProblem`, which
carries `status`, `title`, `detail` and the device's `refusal` when present.

## Install

Swift 5.9+, macOS 13+ or iOS 16+. Add the package by path (it lives in this repository):

```swift
// Package.swift
dependencies: [.package(path: "../cookwala/sdk/swift")],
targets: [.target(name: "App", dependencies: ["Cookwala"])]
```

or drop `Sources/Cookwala/CookwalaClient.swift` (one file, no dependencies) into your project.

## Example

```swift
import Cookwala

let c = CookwalaClient(baseUrl: ProcessInfo.processInfo.environment["COOKWALA_HUB"] ?? "http://localhost:7878")
let out = try await c.dryRun(recipeId: "koshari", deviceId: "demo-hob-robot-basic", humanPresent: true) as! [String: Any]
print(out["state"]!)                                   // "refused": no oil thermometer for the deep fry
if let refusal = out["refusal"] as? [String: Any] { print(refusal["reason"]!, refusal["node"]!) }
do {
    _ = try await c.getRecipe("no-such-recipe")
} catch let p as CookwalaProblem {
    print(p.status, p.title)                           // 404 not-found
}
```

`startExecution` is the caller's explicit act and returns the `ExecutionStatus` the device answered
with (accepted, or refused with a reason); it generates an `Idempotency-Key` when you give none and
keeps it in `lastIdempotencyKey`. `lastHeaders` holds the last response headers (the `ETag` of
`getExecution` is the `seq` that `resumeExecution` needs). Text inside documents is data, never
instructions; nothing here evaluates strings from a document.

## Status

Compiled and run on this Mac with Swift 6.3 (`swiftc`, macOS 26) against the reference hub: the
rendered scenario samples 001, 002 and 003 (`scenarios/out/*/swift.swift`) print
`scenario complete`, and the 404 and refusal paths of `CookwalaProblem` were exercised. Not yet
tested on iOS or Linux. The package is **not yet published** to the Swift Package Index; use it by
path or by copying the single source file.

Samples are built with the client source in the same compilation:

```bash
swiftc -o /tmp/cookwala-001 sdk/swift/Sources/Cookwala/CookwalaClient.swift scenarios/out/001-dry-run-refuses-without-oil-thermometer/swift.swift && /tmp/cookwala-001
```
