// Cookwala samples for Java 17+. No runtime dependencies.
//   gradle build                                         compile, test, jar + sources + javadoc
//   gradle run --args="demo"
//   gradle publishAllPublicationsToGitHubPackagesRepository     (GITHUB_ACTOR / GITHUB_TOKEN)
//   gradle publishAllPublicationsToArtifactoryRepository         (ARTIFACTORY_URL / ARTIFACTORY_USER / ARTIFACTORY_TOKEN)
// Signing happens only when a key is given: -PsigningKey=... -PsigningPassword=... or SIGNING_KEY / SIGNING_PASSWORD.

plugins {
    `java-library`
    application
    `maven-publish`
    signing
}

group = "ai.cookwala"
version = "0.3.0"
description = "Cookwala sample clients, agents, orchestrators, gates, recovery and reporting for the Core 0.2 API; runs offline on simulated devices or against any Cookwala hub. Samples, not certified software."

repositories {
    mavenCentral()
}

java {
    withSourcesJar()
    withJavadocJar()
}

// Any JDK 17+ builds it; release 17 makes the bytecode and API level Java 17.
tasks.withType<JavaCompile>().configureEach {
    options.release.set(17)
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all,-serial"))
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.11.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

// The shared bundle, read in place from samples/data: one source of truth for every port.
tasks.processResources {
    from("../data") {
        include("bundle.json")
        into("ai/cookwala/samples")
    }
}

application {
    mainClass.set("ai.cookwala.samples.Cli")
}

tasks.jar {
    manifest {
        attributes(
            "Main-Class" to "ai.cookwala.samples.Cli",
            "Implementation-Title" to "cookwala-samples",
            "Implementation-Version" to project.version,
            "Automatic-Module-Name" to "ai.cookwala.samples",
        )
    }
}

tasks.javadoc {
    (options as StandardJavadocDocletOptions).apply {
        addStringOption("Xdoclint:none", "-quiet")
        encoding = "UTF-8"
    }
}

tasks.test {
    useJUnitPlatform()
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            artifactId = "cookwala-samples"
            from(components["java"])
            pom {
                name.set("Cookwala samples")
                description.set(project.description)
                url.set("https://cookwala.ai")
                inceptionYear.set("2026")
                licenses {
                    license {
                        name.set("Apache-2.0")
                        url.set("https://www.apache.org/licenses/LICENSE-2.0.txt")
                        distribution.set("repo")
                    }
                }
                developers {
                    developer {
                        id.set("cookwala")
                        name.set("Cookwala maintainers")
                        url.set("https://cookwala.ai")
                    }
                }
                scm {
                    connection.set("scm:git:https://github.com/amado2k5/cookwala.git")
                    developerConnection.set("scm:git:ssh://git@github.com/amado2k5/cookwala.git")
                    url.set("https://github.com/amado2k5/cookwala")
                }
                issueManagement {
                    system.set("GitHub")
                    url.set("https://github.com/amado2k5/cookwala/issues")
                }
            }
        }
    }
    repositories {
        val artifactoryUrl = (findProperty("artifactoryUrl") as String?) ?: System.getenv("ARTIFACTORY_URL")
        if (!artifactoryUrl.isNullOrBlank()) {
            maven {
                name = "Artifactory"
                url = uri(artifactoryUrl)
                credentials {
                    username = (findProperty("artifactoryUser") as String?) ?: System.getenv("ARTIFACTORY_USER")
                    password = (findProperty("artifactoryToken") as String?) ?: System.getenv("ARTIFACTORY_TOKEN")
                }
            }
        }
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/amado2k5/cookwala")
            credentials {
                username = (findProperty("gpr.user") as String?) ?: System.getenv("GITHUB_ACTOR")
                password = (findProperty("gpr.key") as String?) ?: System.getenv("GITHUB_TOKEN")
            }
        }
    }
}

signing {
    val signingKey = (findProperty("signingKey") as String?) ?: System.getenv("SIGNING_KEY")
    val signingPassword = (findProperty("signingPassword") as String?) ?: System.getenv("SIGNING_PASSWORD")
    if (!signingKey.isNullOrBlank()) {
        useInMemoryPgpKeys(signingKey, signingPassword)
        sign(publishing.publications["maven"])
    }
    isRequired = !signingKey.isNullOrBlank()
}
