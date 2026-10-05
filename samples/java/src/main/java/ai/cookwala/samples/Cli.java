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
 * The {@code cookwala-samples} command line ({@code java -jar cookwala-samples-0.1.0.jar ...}).
 * Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage.
 */
public final class Cli {
    private Cli() {}

    static final String USAGE = String.join("\n",
            "`cookwala-samples` command line.",
            "",
            "    cookwala-samples demo [--format markdown|json|junit|csv] [--hub URL [--token T]] [--out FILE]",
            "    cookwala-samples gates RECIPE [--device DEVICE] [--human-present] [--block ALLERGEN ...]",
            "    cookwala-samples plan DISH [--servings N] [--block ALLERGEN ...] [--human-present]",
            "    cookwala-samples run DISH [DISH ...] [--human-present] [--fault recipe-id#node=sensor_fault|timeout|overheat] [--format F]",
            "    cookwala-samples serve [--port 8080] [--bind 127.0.0.1]",
            "    cookwala-samples list                                bundled recipes and devices",
            "    cookwala-samples version",
            "",
            "Offline by default: four simulated devices and four example recipes from the Cookwala repository.",
            "`demo --hub URL` runs the fault-free jobs against a real hub (python hub/cookwala_hub.py).",
            "Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage.",
            "");

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
            out.print(USAGE);
            return all.isEmpty() ? 2 : 0;
        }
        String cmd = all.get(0);
        List<String> a = all.subList(1, all.size());
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
                    if (pos.isEmpty()) { out.print(USAGE); return 2; }
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
                    out.print(USAGE);
                    return 2;
            }
        } catch (UsageError e) {
            out.println("cookwala-samples: " + e.getMessage());
            out.print(USAGE);
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
