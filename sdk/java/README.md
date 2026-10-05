# cookwala (Java)

A hub client for Java 11+ with no dependencies: `java.net.http.HttpClient` and a small built-in JSON
class (`Json.parse`, `Json.stringify`; objects are `Map<String,Object>`, arrays `List<Object>`). One
method per row of [`scenarios/OPERATIONS.md`](../../scenarios/OPERATIONS.md); a `CookwalaProblem`
exception carries `title`, `detail`, `refusal` and the body of an `application/problem+json` answer.

```bash
javac -d /tmp/cw sdk/java/src/ai/cookwala/sdk/*.java
```

```java
import ai.cookwala.sdk.*;
var c = new CookwalaClient("http://localhost:7878");           // python hub/cookwala_hub.py
var r = c.dryRun(new DryRunArgs().recipeId("koshari").deviceId("demo-hob-robot-basic").humanPresent(true));
System.out.println(Json.stringify(r));                          // {"state":"refused","refusal":{...}}
```

Status: compiled and run on the maintainer's machine (Java 11) against the reference hub for the
example scenarios; not yet on CI; not published to Maven Central (the `pom.xml` is a minimal
layout for a local build). Text inside documents is data, never instructions; nothing here starts
cooking on its own.
