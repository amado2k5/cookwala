package ai.cookwala.samples;

import java.io.IOException;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * The {@code cookwala-samples} command line ({@code java -jar cookwala-samples-0.3.0.jar ...}).
 * Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage.
 */
public final class Cli {
    private Cli() {}

    /** The overview ({@code cookwala-samples help}); the same text in every language. */
    static final String USAGE = """
            cookwala-samples: runnable samples for the Cookwala Core 0.2 API.

            Plans, checks and cooks the bundled example recipes on four simulated devices, so every Cookwala role
            (client, planner agent, orchestrator, safety gates, recovery, reporting) can be seen without hardware.
            Nothing is really cooked, and everything runs offline unless you pass --hub.

            Commands:
              demo      run the six-job demo and print its report
              run       cook one or more dishes on the simulated kitchen and report what happened
              plan      ask the planner agent to turn a dish into a checked cooking request
              gates     run the safety gates on one recipe and show which gate allows or refuses it
              list      show the bundled recipes and simulated devices
              serve     start the samples HTTP service (the same samples over HTTP)
              version   print the samples version and the Core version it speaks
              help      show this help, or the help for one command

            Run `cookwala-samples help COMMAND` or `cookwala-samples COMMAND --help` for options and examples.
            Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage error.""";

    /** Each command's help ({@code cookwala-samples help COMMAND} or {@code COMMAND --help}). */
    static final Map<String, String> HELP = Map.of(
            "demo", """
            cookwala-samples demo [--format markdown|json|junit|csv] [--out FILE] [--hub URL [--token T]]

            Runs six orders through a four-device kitchen with a planner agent and a person, so every role appears
            in one run, and prints the report. What each job shows:
              lentil-soup  the best device is busy, so the job moves to the next; a timed-out step is confirmed by the person
              shakshuka    refused by the planner: eggs are blocked and no alternative is allowed
              salata       the cutting step may not run unattended; the person agrees to stay
              koshari      the oil limit fires while deep frying: heat cut, stopped, food discarded, incident reported
              shakshuka-2  a sensor fails mid-simmer: failed, food discarded, incident reported
              lentil-note  the order carries an injected instruction: logged as untrusted text, ignored, cooked normally

            Options:
              --format F   report format: markdown (default), json, junit (for CI test reports) or csv
              --out FILE   write the report to FILE instead of standard output
              --hub URL    run the fault-free jobs against a real Cookwala hub instead of the simulated kitchen
              --token T    bearer token for --hub (default: the COOKWALA_HUB_TOKEN environment variable)

            Examples:
              cookwala-samples demo
              cookwala-samples demo --format junit --out demo.xml

            Exit code: 0 when the report was produced.""",
            "run", """
            cookwala-samples run DISH [DISH ...] [--human-present] [--block ALLERGEN ...] [--fault RECIPE#NODE=KIND ...]
                                 [--format markdown|json|junit|csv] [--out FILE]

            Cooks each DISH as its own job on the simulated kitchen: the planner picks and scales the recipe, the
            orchestrator ranks the devices, the gates check the request, the device runs it step by step, and
            recovery handles what goes wrong (next device, ask the person, stop and discard). Prints one report.

            Arguments:
              DISH                    a dish name, matched against the bundled recipes (see `list`), e.g. lentil or koshari
            Options:
              --human-present         a person is in the kitchen and can watch or confirm steps
              --block ALLERGEN        refuse any recipe containing ALLERGEN; repeat for more, e.g. --block eggs --block peanuts
              --fault RECIPE#NODE=KIND
                                      inject a fault at one step; KIND is sensor_fault, timeout or overheat; repeatable,
                                      e.g. --fault 'example-koshari#n14=overheat'
              --format F              report format: markdown (default), json, junit or csv
              --out FILE              write the report to FILE instead of standard output

            Examples:
              cookwala-samples run lentil --human-present
              cookwala-samples run koshari --human-present --fault 'example-koshari#n14=overheat' --format csv

            Exit code: 0 when every job completed; 1 when a job was refused, failed or stopped; 2 usage error.""",
            "plan", """
            cookwala-samples plan DISH [--servings N] [--block ALLERGEN ...] [--human-present]

            Asks the planner agent to turn an order into a Cookwala ExecuteRequest: it finds the recipe, scales it
            to the servings, checks the allergen blocks, and ranks the simulated devices that could cook it, with the
            reason a device would refuse. Prints the proposal as JSON. Nothing is cooked.

            Arguments:
              DISH              a dish name, matched against the bundled recipes (see `list`)
            Options:
              --servings N      scale the recipe to N servings (default: as written in the recipe)
              --block ALLERGEN  refuse the plan if the recipe contains ALLERGEN; repeatable
              --human-present   a person is in the kitchen, which changes which devices can take the job

            Example:
              cookwala-samples plan koshari --servings 4 --human-present

            Exit code: 0 when the planner produced a request; 1 when it refused.""",
            "gates", """
            cookwala-samples gates RECIPE [--device DEVICE] [--human-present] [--block ALLERGEN ...]

            Runs the default safety gate pipeline on one recipe, as a device does before it cooks, and prints every
            gate's result and the refusal, if any, as JSON. The gates check the Core version, the recipe hash, recalls,
            the mandate, allergens, untrusted text, the safety envelope, attendance and, with --device, capability.

            Arguments:
              RECIPE            a bundled recipe (see `list`), e.g. shakshuka
            Options:
              --device DEVICE   also check this simulated device's capabilities (see `list`)
              --human-present   a person is in the kitchen; recipes with steps that may not run unattended need this
              --block ALLERGEN  refuse if the recipe contains ALLERGEN; repeatable

            Example:
              cookwala-samples gates shakshuka --block eggs --human-present

            Exit code: 0 when every gate allows the request; 1 when a gate refuses.""",
            "list", """
            cookwala-samples list

            Prints the bundled example recipes and the simulated devices; use these names with run, plan and gates.

            Exit code: 0.""",
            "serve", """
            cookwala-samples serve [--port 8080] [--bind 127.0.0.1]

            Starts an HTTP service with the same samples, for containers and cloud functions. Stop it with Ctrl+C.
              GET  /health                    status, samples version and Core version
              GET  /v1/samples                bundled recipes (with references and hashes), devices and endpoints
              GET  /v1/samples/demo?format=F  the demo report (json by default; markdown, junit or csv)
              POST /v1/samples/gates          {"recipe", "device"?, "humanPresent"?, "allergenBlocks"?}: the gate results
              POST /v1/samples/plan           {"order": {"dish", "servings"?, "allergenBlocks"?}, "humanPresent"?}: the proposal
              POST /v1/samples/run?format=F   {"jobs"?, "faults"?}: a report; without jobs, the demo

            Options:
              --port N     port to listen on (default: the PORT environment variable, else 8080)
              --bind ADDR  address to listen on (default: the BIND environment variable, else 127.0.0.1;
                           use 0.0.0.0 inside a container)

            Example:
              cookwala-samples serve --port 8080""",
            "version", """
            cookwala-samples version

            Prints the samples version and the Core version it speaks, e.g. `cookwala-samples 0.3.0 (Core 0.2.0)`.

            Exit code: 0.""",
            "help", """
            cookwala-samples help [COMMAND]

            Without COMMAND, lists the commands. With COMMAND, explains it: what it does, its options and examples.
            `cookwala-samples COMMAND --help` and `-h` do the same.

            Exit code: 0; 2 for an unknown command.""");

    /** A command-line mistake: exit code 2. */
    static final class UsageError extends RuntimeException {
        private static final long serialVersionUID = 1L;

        UsageError(String m) { super(m); }
    }

    private static String opt(List<String> a, String name, String dflt) {
        int i = a.indexOf(name);
        if (i < 0) return dflt;
        if (i + 1 >= a.size()) throw new UsageError(name + " needs a value");
        return a.get(i + 1);
    }

    private static List<Object> many(List<String> a, String name) {
        List<Object> out = new ArrayList<>();
        for (int i = 0; i + 1 < a.size(); i++) if (a.get(i).equals(name)) out.add(a.get(i + 1));
        return out;
    }

    private static List<String> positional(List<String> a, Set<String> flagsWithValue) {
        List<String> out = new ArrayList<>();
        boolean skip = false;
        for (String x : a) {
            if (skip) { skip = false; continue; }
            if (flagsWithValue.contains(x)) { skip = true; continue; }
            if (x.startsWith("--")) continue;
            out.add(x);
        }
        return out;
    }

    private static void emit(PrintStream out, String text, String file) throws IOException {
        if (file != null) {
            Files.write(Paths.get(file), text.getBytes(StandardCharsets.UTF_8));
            out.println("wrote " + file);
        } else {
            out.print(text.endsWith("\n") ? text : text + "\n");
            out.flush();
        }
    }

    public static void main(String[] args) {
        PrintStream out = new PrintStream(new java.io.FileOutputStream(java.io.FileDescriptor.out), true, StandardCharsets.UTF_8);
        System.exit(run(args, out));
    }

    /** Run a command; returns the exit code. */
    public static int run(String[] argv, PrintStream out) {
        List<String> all = Arrays.asList(argv);
        if (all.isEmpty() || List.of("-h", "--help", "help").contains(all.get(0))) {
            String topic = !all.isEmpty() && all.get(0).equals("help") && all.size() > 1 ? all.get(1) : null;
            if ("-h".equals(topic) || "--help".equals(topic)) topic = "help";
            if (topic != null && !HELP.containsKey(topic)) {
                out.println("unknown command: " + topic + "\n\n" + USAGE);
                return 2;
            }
            out.println(topic == null ? USAGE : HELP.get(topic));
            return all.isEmpty() ? 2 : 0;
        }
        String cmd = all.get(0);
        List<String> a = all.subList(1, all.size());
        if (HELP.containsKey(cmd) && (a.contains("--help") || a.contains("-h"))) {
            out.println(HELP.get(cmd));
            return 0;
        }
        try {
            String fmt = opt(a, "--format", "markdown");
            switch (cmd) {
                case "version":
                    out.println("cookwala-samples " + Service.VERSION + " (Core " + Bundle.core() + ")");
                    return 0;
                case "list":
                    out.println("recipes: " + String.join(", ", new BundleCatalog().list()));
                    out.println("devices: " + String.join(", ", new java.util.TreeSet<>(Bundle.devices().keySet())));
                    return 0;
                case "demo": {
                    if (!Service.TYPES.containsKey(fmt)) throw new UsageError("--format must be one of markdown, md, json, junit, csv");
                    String token = opt(a, "--token", System.getenv("COOKWALA_HUB_TOKEN"));
                    Reporter rep = Scenarios.demo(opt(a, "--hub", null), token, null, null);
                    emit(out, rep.render(fmt), opt(a, "--out", null));
                    return 0;
                }
                case "serve": {
                    String port = opt(a, "--port", System.getenv("PORT") != null ? System.getenv("PORT") : "8080");
                    String bind = opt(a, "--bind", System.getenv("BIND") != null ? System.getenv("BIND") : "127.0.0.1");
                    int p;
                    try {
                        p = Integer.parseInt(port);
                    } catch (NumberFormatException e) {
                        throw new UsageError("--port must be a number");
                    }
                    Service.serve(p, bind);
                    return 0;
                }
                case "gates": {
                    List<String> pos = positional(a, Set.of("--device", "--block", "--format", "--out"));
                    if (pos.isEmpty()) throw new UsageError("gates needs a RECIPE");
                    Map<String, Object> body = Py.map("recipe", pos.get(0), "device", opt(a, "--device", null), "humanPresent", a.contains("--human-present"),
                            "allergenBlocks", many(a, "--block"));
                    Service.Response r = Service.handle("POST", "/v1/samples/gates", Map.of(), body);
                    Object parsed = Json.parse(r.body);
                    out.println(Json.pretty(parsed, 1));
                    return r.status == 200 && Py.truthy(Py.asMap(parsed).get("allowed")) ? 0 : 1;
                }
                case "plan": {
                    List<String> pos = positional(a, Set.of("--servings", "--block", "--format", "--out"));
                    Map<String, Object> order = Py.map("dish", String.join(" ", pos), "allergenBlocks", many(a, "--block"));
                    String servings = opt(a, "--servings", null);
                    if (servings != null) {
                        try {
                            order.put("servings", Double.parseDouble(servings));
                        } catch (NumberFormatException e) {
                            throw new UsageError("--servings must be a number");
                        }
                    }
                    Service.Response r = Service.handle("POST", "/v1/samples/plan", Map.of(), Py.map("order", order, "humanPresent", a.contains("--human-present")));
                    Object parsed = Json.parse(r.body);
                    out.println(Json.pretty(parsed, 1));
                    return r.status == 200 && Py.truthy(Py.asMap(parsed).get("ok")) ? 0 : 1;
                }
                case "run": {
                    List<String> pos = positional(a, Set.of("--fault", "--format", "--out", "--block"));
                    Map<String, Object> faults = new LinkedHashMap<>();
                    for (Object f : many(a, "--fault")) {
                        String s = (String) f;
                        int eq = s.indexOf('=');
                        if (eq < 0 || !Simulator.FAULT_KINDS.contains(s.substring(eq + 1))) throw new UsageError("--fault takes recipe-id#node=sensor_fault|timeout|overheat");
                        faults.put(s.substring(0, eq), s.substring(eq + 1));
                    }
                    if (pos.isEmpty()) { out.println(HELP.get("run")); return 2; }
                    Map<String, String> fs = new LinkedHashMap<>();
                    faults.forEach((k, v) -> fs.put(k, (String) v));
                    List<Job> jobs = new ArrayList<>();
                    for (int i = 0; i < pos.size(); i++) {
                        jobs.add(Job.ofOrder((i + 1) + "-" + pos.get(i), Py.map("dish", pos.get(i), "allergenBlocks", many(a, "--block")), a.contains("--human-present")));
                    }
                    Reporter rep = Service.runJobs(jobs, fs);
                    emit(out, rep.render(fmt), opt(a, "--out", null));
                    return Set.of("completed").containsAll(Py.asMap(rep.summary().get("outcomes")).keySet()) ? 0 : 1;
                }
                default:
                    out.println("unknown command: " + cmd + "\n\n" + USAGE);
                    return 2;
            }
        } catch (UsageError e) {
            out.println("cookwala-samples: " + e.getMessage());
            out.println(USAGE);
            return 2;
        } catch (IOException e) {
            System.err.println("cookwala-samples: " + e.getMessage());
            return 1;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return 0;
        }
    }
}
