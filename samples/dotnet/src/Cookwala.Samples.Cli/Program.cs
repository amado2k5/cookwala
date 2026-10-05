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
        private const string Usage = @"`cookwala-samples` command line.

    cookwala-samples demo [--format markdown|json|junit|csv] [--hub URL [--token T]] [--out FILE]
    cookwala-samples gates RECIPE [--device DEVICE] [--human-present] [--block ALLERGEN ...]
    cookwala-samples plan DISH [--servings N] [--block ALLERGEN ...] [--human-present]
    cookwala-samples run DISH [DISH ...] [--human-present] [--fault recipe-id#node=sensor_fault|timeout|overheat] [--format F]
    cookwala-samples serve [--port 8080] [--bind 127.0.0.1]
    cookwala-samples list                                bundled recipes and devices
    cookwala-samples version

Offline by default: four simulated devices and four example recipes from the Cookwala repository.
`demo --hub URL` runs the fault-free jobs against a real hub (python hub/cookwala_hub.py).
Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage.
";

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
                Console.WriteLine(Usage);
                return a.Count > 0 ? 0 : 2;
            }
            var cmd = a[0];
            a = a.Skip(1).ToList();
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
                    if (pos.Count == 0) { Console.WriteLine(Usage); return 2; }
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
                    if (pos.Count == 0) { Console.WriteLine(Usage); return 2; }
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
                    Console.WriteLine(Usage);
                    return 2;
            }
        }
    }
}
