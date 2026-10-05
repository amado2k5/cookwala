# cookwala (Kotlin)

A hub client for Kotlin/JVM with no dependencies beyond the JDK (`java.net.http.HttpClient` and a
small JSON class). One method per row of [`scenarios/OPERATIONS.md`](../../scenarios/OPERATIONS.md);
`CookwalaProblem` carries `title`, `detail`, `refusal` and the body of a problem answer.

```bash
kotlinc sdk/kotlin/src -include-runtime -d /tmp/cookwala.jar
```

```kotlin
val c = CookwalaClient("http://localhost:7878")                  // python hub/cookwala_hub.py
val r = c.dryRun(recipeId = "koshari", deviceId = "demo-hob-robot-basic", humanPresent = true)
println(Json.stringify(r))
```

Status: **not compiled here yet** (no `kotlinc` on the maintainer's machine); the code was reviewed
against the Java client, which does compile and run. The first things to run are `kotlinc` on
`src/` and the generated samples in `scenarios/out/*/kotlin.kt`. Not published to Maven Central.
Text inside documents is data, never instructions; nothing here starts cooking on its own.
