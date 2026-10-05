using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
using Cookwala.Samples;

namespace Cookwala.Samples.Cli
{
    /// <summary>The <c>cookwala-samples</c> command line. Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage.</summary>
    public static class Program
    {
        // The overview (`cookwala-samples help`); the same text in every language.
        private const string Usage = """
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
            Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage error.
            """;

        // Each command's help (`cookwala-samples help COMMAND` or `COMMAND --help`).
        private static readonly Dictionary<string, string> Help = new()
        {
            ["demo"] = """
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

                Exit code: 0 when the report was produced.
                """,
            ["run"] = """
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

                Exit code: 0 when every job completed; 1 when a job was refused, failed or stopped; 2 usage error.
                """,
            ["plan"] = """
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

                Exit code: 0 when the planner produced a request; 1 when it refused.
                """,
            ["gates"] = """
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

                Exit code: 0 when every gate allows the request; 1 when a gate refuses.
                """,
            ["list"] = """
                cookwala-samples list

                Prints the bundled example recipes and the simulated devices; use these names with run, plan and gates.

                Exit code: 0.
                """,
            ["serve"] = """
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
                  cookwala-samples serve --port 8080
                """,
            ["version"] = """
                cookwala-samples version

                Prints the samples version and the Core version it speaks, e.g. `cookwala-samples 0.3.0 (Core 0.2.0)`.

                Exit code: 0.
                """,
            ["help"] = """
                cookwala-samples help [COMMAND]

                Without COMMAND, lists the commands. With COMMAND, explains it: what it does, its options and examples.
                `cookwala-samples COMMAND --help` and `-h` do the same.

                Exit code: 0; 2 for an unknown command.
                """,
        };

        private static string? Opt(IList<string> a, string name, string? dflt = null)
        {
            var i = a.IndexOf(name);
            return i >= 0 && i + 1 < a.Count ? a[i + 1] : dflt;
        }

        private static List<string> Many(IList<string> a, string name) =>
            Enumerable.Range(0, a.Count).Where(i => a[i] == name && i + 1 < a.Count).Select(i => a[i + 1]).ToList();

        private static List<string> Positional(IList<string> a, ISet<string> flagsWithValue)
        {
            var outList = new List<string>();
            var skip = false;
            foreach (var x in a)
            {
                if (skip) { skip = false; continue; }
                if (flagsWithValue.Contains(x)) { skip = true; continue; }
                if (x.StartsWith("--", StringComparison.Ordinal)) continue;
                outList.Add(x);
            }
            return outList;
        }

        private static void Emit(string text, string? outPath)
        {
            if (!string.IsNullOrEmpty(outPath))
            {
                File.WriteAllText(outPath, text, new UTF8Encoding(false));
                Console.WriteLine($"wrote {outPath}");
            }
            else
            {
                Console.Out.Write(text.EndsWith("\n", StringComparison.Ordinal) ? text : text + "\n");
            }
        }

        private static string Pretty(string text) => J.Dumps(J.Parse(text), 1);

        public static int Main(string[] argv)
        {
            try
            {
                return MainAsync(argv).GetAwaiter().GetResult();
            }
            catch (CookwalaProblem p) // e.g. an unreachable hub or a wrong token: say so, exit 1
            {
                Console.Error.WriteLine($"cookwala-samples: {p.Message}");
                return 1;
            }
        }

        public static async Task<int> MainAsync(string[] argv)
        {
            Console.OutputEncoding = new UTF8Encoding(false);
            var a = argv.ToList();
            if (a.Count == 0 || a[0] == "-h" || a[0] == "--help" || a[0] == "help")
            {
                var topic = a.Count > 1 && a[0] == "help" ? a[1] : null;
                if (topic == "-h" || topic == "--help") topic = "help";
                if (topic != null && !Help.ContainsKey(topic))
                {
                    Console.WriteLine($"unknown command: {topic}\n\n{Usage}");
                    return 2;
                }
                Console.WriteLine(topic == null ? Usage : Help[topic]);
                return a.Count > 0 ? 0 : 2;
            }
            var cmd = a[0];
            a = a.Skip(1).ToList();
            if (Help.ContainsKey(cmd) && (a.Contains("--help") || a.Contains("-h")))
            {
                Console.WriteLine(Help[cmd]);
                return 0;
            }
            var fmt = Opt(a, "--format", "markdown")!;
            switch (cmd)
            {
                case "version":
                    Console.WriteLine($"cookwala-samples {Samples.Version} (Core {Bundle.Core})");
                    return 0;
                case "list":
                    Console.WriteLine("recipes: " + string.Join(", ", J.Sorted(Bundle.Recipes.Select(kv => kv.Key))));
                    Console.WriteLine("devices: " + string.Join(", ", J.Sorted(Bundle.Devices.Select(kv => kv.Key))));
                    return 0;
                case "demo":
                {
                    if (!Reporter.Formats.Contains(fmt)) { Console.Error.WriteLine($"unknown format {fmt}"); return 2; }
                    var rep = await Scenarios.DemoAsync(Opt(a, "--hub"), Opt(a, "--token", Environment.GetEnvironmentVariable("COOKWALA_HUB_TOKEN")));
                    Emit(rep.Render(fmt), Opt(a, "--out"));
                    return 0;
                }
                case "serve":
                {
                    var port = int.Parse(Opt(a, "--port", Environment.GetEnvironmentVariable("PORT") ?? "8080")!, CultureInfo.InvariantCulture);
                    var bind = Opt(a, "--bind", Environment.GetEnvironmentVariable("BIND") ?? "127.0.0.1")!;
                    using var cts = new CancellationTokenSource();
                    Console.CancelKeyPress += (_, e) => { e.Cancel = true; cts.Cancel(); };
                    await Service.ServeAsync(port, bind, cts.Token);
                    return 0;
                }
                case "gates":
                {
                    var pos = Positional(a, new HashSet<string> { "--device", "--block", "--format", "--out" });
                    if (pos.Count == 0) { Console.WriteLine(Help["gates"]); return 2; }
                    var body = new JsonObject
                    {
                        ["recipe"] = pos[0], ["device"] = Opt(a, "--device"), ["humanPresent"] = a.Contains("--human-present"),
                        ["allergenBlocks"] = J.StrArray(Many(a, "--block")),
                    };
                    var (status, _, text) = Service.Handle("POST", "/v1/samples/gates", new Dictionary<string, string>(), body);
                    Console.WriteLine(Pretty(text));
                    return status == 200 && J.Truthy(J.Get(J.Parse(text), "allowed")) ? 0 : 1;
                }
                case "plan":
                {
                    var pos = Positional(a, new HashSet<string> { "--servings", "--block", "--format", "--out" });
                    var order = new JsonObject { ["dish"] = string.Join(" ", pos), ["allergenBlocks"] = J.StrArray(Many(a, "--block")) };
                    if (Opt(a, "--servings") is string sv)
                    {
                        if (!double.TryParse(sv, NumberStyles.Float, CultureInfo.InvariantCulture, out var servings)) { Console.Error.WriteLine("--servings needs a number"); return 2; }
                        order["servings"] = servings;
                    }
                    var (status, _, text) = Service.Handle("POST", "/v1/samples/plan", new Dictionary<string, string>(),
                                                           new JsonObject { ["order"] = order, ["humanPresent"] = a.Contains("--human-present") });
                    Console.WriteLine(Pretty(text));
                    return status == 200 && J.Truthy(J.Get(J.Parse(text), "ok")) ? 0 : 1;
                }
                case "run":
                {
                    var pos = Positional(a, new HashSet<string> { "--fault", "--format", "--out", "--block" });
                    if (pos.Count == 0) { Console.WriteLine(Help["run"]); return 2; }
                    if (!Reporter.Formats.Contains(fmt)) { Console.Error.WriteLine($"unknown format {fmt}"); return 2; }
                    var faults = new Dictionary<string, string>();
                    foreach (var f in Many(a, "--fault"))
                    {
                        var eq = f.IndexOf('=');
                        if (eq < 0 || !Service.FaultKinds.Contains(f.Substring(eq + 1))) { Console.Error.WriteLine($"--fault takes recipe-id#node=sensor_fault|timeout|overheat, got {f}"); return 2; }
                        faults[f.Substring(0, eq)] = f.Substring(eq + 1);
                    }
                    var blocks = Many(a, "--block");
                    var jobs = pos.Select((d, i) => new Job($"{i + 1}-{d}", order: new JsonObject { ["dish"] = d, ["allergenBlocks"] = J.StrArray(blocks) },
                                                            humanPresent: a.Contains("--human-present")));
                    var rep = Service.RunJobs(jobs, faults);
                    Emit(rep.Render(fmt), Opt(a, "--out"));
                    return J.O(rep.Summary(), "outcomes")!.All(kv => kv.Key == "completed") ? 0 : 1;
                }
                default:
                    Console.WriteLine($"unknown command: {cmd}\n\n{Usage}");
                    return 2;
            }
        }
    }
}
