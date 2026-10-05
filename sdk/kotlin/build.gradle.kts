// Cookwala hub client for Kotlin/JVM. No runtime dependencies beyond the Kotlin standard library:
// java.net.http for HTTP and a minimal JSON object (no kotlinx).
//   gradle -p sdk/kotlin build        (writes build/libs/cookwala-sdk-0.2.0.jar)
//   gradle -p sdk/kotlin jsonTest     (runs the JSON tests, a plain main() under test/)
// Without Gradle:  kotlinc sdk/kotlin/src/ai/cookwala/sdk/*.kt -d build/kotlin
// Not yet published to Maven Central; consume from this repository.
plugins {
    kotlin("jvm") version "2.2.20"
}

group = "ai.cookwala"
version = "0.2.0"

repositories {
    mavenCentral()
}

kotlin {
    jvmToolchain(11)
}

sourceSets {
    main { kotlin.srcDirs("src") }
    test { kotlin.srcDirs("test") }
}

tasks.register<JavaExec>("jsonTest") {
    group = "verification"
    description = "Runs the minimal JSON tests (sdk/kotlin/test, a plain main)."
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("ai.cookwala.sdk.JsonTestKt")
}

// The tests are a plain main(), not JUnit: `check` runs jsonTest and the JUnit test task is switched off.
tasks.test { enabled = false }
tasks.check { dependsOn("jsonTest") }

tasks.jar {
    archiveBaseName.set("cookwala-sdk")
}
