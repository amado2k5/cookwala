# Cookwala samples for Java

Sample clients, agents, an orchestrator, gates, recovery and reporting for the Cookwala Core 0.2 API, for Java 17+.
It has no runtime dependencies. Everything runs offline against simulated devices built from the bundled snapshot
(`samples/data/bundle.json`), or against a real hub (`python hub/cookwala_hub.py`, or any executor that serves the
Core API).

It is a port of the Python reference (`samples/python`). The contract every port follows is in
[`samples/SPEC.md`](../SPEC.md): the same roles, decisions, refusal reasons and demo outcomes.

**Status:** Samples, not certified software; simulated devices; the executor is always the authority.

## Add it to a build

Maven:

```xml
<dependency>
  <groupId>ai.cookwala</groupId>
  <artifactId>cookwala-samples</artifactId>
  <version>0.3.0</version>
</dependency>
```

Gradle (Kotlin DSL):

```kotlin
dependencies {
    implementation("ai.cookwala:cookwala-samples:0.3.0")
}
```

Until it is published, build it from this directory with `mvn -B package` (or `gradle build`). The build reads
`../data/bundle.json` in place and puts it on the classpath at `ai/cookwala/samples/bundle.json`; the file is never
copied into this directory.

## Command line

```sh
java -jar target/cookwala-samples-0.3.0.jar demo                      # Markdown report of the six-job demo
java -jar target/cookwala-samples-0.3.0.jar demo --format junit --out demo.xml
java -jar target/cookwala-samples-0.3.0.jar demo --hub http://127.0.0.1:7878 --token T   # fault-free jobs against a hub
java -jar target/cookwala-samples-0.3.0.jar gates shakshuka --block eggs --human-present
java -jar target/cookwala-samples-0.3.0.jar plan koshari --servings 4 --human-present
java -jar target/cookwala-samples-0.3.0.jar run lentil koshari --human-present --fault example-koshari#n14=overheat --format json
java -jar target/cookwala-samples-0.3.0.jar serve --port 8080         # GET /health, /v1/samples, /v1/samples/demo?format=...
java -jar target/cookwala-samples-0.3.0.jar list
java -jar target/cookwala-samples-0.3.0.jar version
```

The demo formats are `markdown`, `json`, `junit` and `csv`. Exit codes: 0 ok, 1 something was refused or failed, 2 usage.
`--token` defaults to `$COOKWALA_HUB_TOKEN`. `serve` reads `PORT` and `BIND` when the flags are absent.

## Use it as a library

```java
import ai.cookwala.samples.*;
import java.util.List;
import java.util.Map;

// The whole demo: four simulated devices, a planner agent, a person, six orders.
System.out.print(Scenarios.demo().toMarkdown());

// Your own orchestration over the simulated kitchen (or HubClient for a real executor).
ScriptedHuman person = new ScriptedHuman(true);   // present, says yes
PlannerAgent planner = new PlannerAgent("agent:my-planner",
        Mandates.make("household:h-1/person:p-1", "agent:my-planner"), new BundleCatalog(), person);
Orchestrator orch = new Orchestrator(Scenarios.kitchen(), planner, person, List.of());
RunRecord rec = orch.run(Job.ofOrder("dinner", Map.of("dish", "koshari", "servings", 4L), true));
System.out.println(rec.outcome + " on " + rec.device + ", food: " + rec.disposition);

// Gates on their own: explain a refusal before anything is sent.
Map<String, Object> recipe = Bundle.recipe("shakshuka");
Map<String, Object> request = new java.util.LinkedHashMap<>(Map.of("core", "0.2.0", "kind", "ExecuteRequest",
        "id", "ex-1", "recipe", Bundle.globalRef(recipe), "recipeHash", Jcs.docHash(recipe),
        "requestedBy", "person:p-1", "idempotencyKey", "key-00000001", "allergenBlocks", List.of("eggs")));
GateDecision d = GatePipeline.defaults().run(new GateContext(request, recipe, null, true));
System.out.println(d.refusal());   // {reason=allergen_block, ...}
```

`Service.handle(method, path, query, body)` is the same framework-free handler the CLI's `serve` uses, so you can mount
it in any HTTP stack or a serverless function.

## The six roles

| Role | Classes | What it does |
|---|---|---|
| Clients | `ExecutorClient`, `HubClient`, `LocalClient`, `BundleCatalog`, `HubCatalog` | One interface over HTTP and over the in-process `SimulatedExecutor`. HTTP retries reuse the Idempotency-Key and send the bearer token. |
| Agents | `PlannerAgent`, `MonitorAgent`, `ScriptedHuman`, `Mandates` | The planner acts only under a mandate and never substitutes around an allergen block; alternatives need a person's `diet_or_allergen_change` confirmation; `irreversible` and `safety_override` are always confirmed. The monitor checks transitions, seq and envelope temperatures. |
| Orchestrator | `Orchestrator`, `Job` | Planner, then gates without the capability gate, then devices ranked by dry run, then start, poll, monitor, recover, log and incident. |
| Gates | `GatePipeline.defaults()`, `Gates.*`, `GateContext`, `GateResult`, `GateDecision` | core-version, recipe-hash, recall, mandate, allergen, untrusted-text, envelope, attendance, capability. The first refusal stops; a gate that throws refuses (`x-gate-error`); untrusted text is logged, never obeyed. |
| Recovery | `RecoveryPolicy`, `RecoveryAction` | Final refusals give up; device refusals try the next device; a missing person is asked for; nobody answering means stop; failed or safety-stopped runs are discarded and reported; transport errors retry with backoff. |
| Reporting | `Reporter`, `RunRecord`, `Reporting.incidentFrom` | Summary, JSON, Markdown, JUnit XML and CSV; anonymous IncidentReports with a random id and a date only. |

Under them: `Jcs` (RFC 8785 canonical JSON and the document hash), `Simulator` (the reference dry run),
`SimulatedExecutor` (the Core API in process, with injectable faults), `Json` (a small parser and writer) and
`Bundle` (the shared data).

## Publishing

- Maven Central: `mvn -B -Pcentral,sign deploy` (Sonatype Central Portal; token under server id `central` in
  `settings.xml`, GPG key for the `sign` profile).
- Artifactory: `mvn -B deploy -Dartifactory.url=https://.../libs-release-local` (server id `artifactory`), or
  `gradle publishAllPublicationsToArtifactoryRepository` with `ARTIFACTORY_URL`, `ARTIFACTORY_USER`, `ARTIFACTORY_TOKEN`.
- GitHub Packages: `gradle publishAllPublicationsToGitHubPackagesRepository` with `GITHUB_ACTOR` and `GITHUB_TOKEN`.
- Gradle signs only when `SIGNING_KEY` (and `SIGNING_PASSWORD`) or `-PsigningKey` are set.

License: Apache-2.0.
