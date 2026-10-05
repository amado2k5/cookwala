using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace Cookwala.Samples
{
    /// <summary>One order for the planner agent, or a ready ExecuteRequest with the recipe it names.</summary>
    public class Job
    {
        public string Id { get; }
        /// <summary>For the planner agent: <c>{dish, servings, allergenBlocks, ...}</c>.</summary>
        public JsonObject? Order { get; }
        /// <summary>Or a ready ExecuteRequest ...</summary>
        public JsonObject? Request { get; }
        /// <summary>... with the recipe it names.</summary>
        public JsonObject? Recipe { get; }
        public bool HumanPresent { get; }
        public Dictionary<string, string> Tags { get; }

        public Job(string id, JsonObject? order = null, JsonObject? request = null, JsonObject? recipe = null, bool humanPresent = false, IDictionary<string, string>? tags = null)
        {
            Id = id; Order = order; Request = request; Recipe = recipe; HumanPresent = humanPresent;
            Tags = tags != null ? new Dictionary<string, string>(tags) : new Dictionary<string, string>();
        }
    }

    /// <summary>
    /// One request, several devices, gates first, recovery throughout, a record at the end:
    /// order → planner agent → gates (no device) → dry run on every device → best device → start (the executor checks again)
    /// → poll, monitor, ask people, recover → log → report. Ranking prefers accepted plans, then the fewest human-verified
    /// steps, then the fewest time-verified steps, then the device name. Orchestrators are optional in Cookwala.
    /// </summary>
    public class Orchestrator
    {
        private readonly List<KeyValuePair<string, IExecutorClient>> devices;

        public PlannerAgent? Planner { get; }
        public IHuman? Human { get; }
        public GatePipeline Gates { get; }
        public RecoveryPolicy Recovery { get; }
        public MonitorAgent Monitor { get; } = new MonitorAgent();
        public List<JsonObject>? RecallDocs { get; }
        /// <summary>How to wait between transport retries (Task.Delay by default; tests pass a no-op).</summary>
        public Func<TimeSpan, Task> Sleep { get; }

        public Orchestrator(IEnumerable<KeyValuePair<string, IExecutorClient>> devices, PlannerAgent? planner = null, GatePipeline? gates = null,
                            RecoveryPolicy? recovery = null, IHuman? human = null, IEnumerable<JsonObject>? recalls = null, Func<TimeSpan, Task>? sleep = null)
        {
            this.devices = devices.ToList();
            Planner = planner;
            Human = human;
            Gates = gates ?? GatePipeline.Default().Without("capability"); // the device check happens per device below
            Recovery = recovery ?? new RecoveryPolicy();
            RecallDocs = recalls?.ToList();
            Sleep = sleep ?? (t => Task.Delay(t));
        }

        /// <summary>Device names, in the order given.</summary>
        public IReadOnlyList<string> DeviceNames => devices.Select(d => d.Key).ToList();

        private IExecutorClient Client(string name) => devices.First(d => d.Key == name).Value;

        public async Task<List<JsonObject>> RecallsAsync()
        {
            if (RecallDocs != null) return RecallDocs;
            var outList = new List<JsonObject>();
            foreach (var d in devices)
            {
                try
                {
                    foreach (var r in await d.Value.RecallsAsync().ConfigureAwait(false))
                        if (r is JsonObject o) outList.Add((JsonObject)o.DeepClone());
                }
                catch (CookwalaProblem) { }
            }
            return outList;
        }

        private async Task<T> Retrying<T>(RunRecord rec, Func<Task<T>> fn)
        {
            var attempt = 0;
            while (true)
            {
                try
                {
                    return await fn().ConfigureAwait(false);
                }
                catch (CookwalaProblem p) when (p.Status == 0)
                {
                    var act = Recovery.OnTransportError(attempt);
                    rec.Recovery.Add(act.AsDict());
                    if (act.Kind != RecoveryAction.Retry) throw;
                    await Sleep(TimeSpan.FromSeconds(act.WaitS)).ConfigureAwait(false);
                    attempt++;
                }
            }
        }

        /// <summary>Dry-run the recipe on every device; accepted plans first, best first.</summary>
        public async Task<List<(string Device, JsonObject DryRun)>> RankAsync(JsonObject recipe, bool humanPresent)
        {
            var rows = new List<(bool Refused, int People, int Timed, string Name, JsonObject Dr)>();
            foreach (var d in devices)
            {
                JsonObject dr;
                try
                {
                    dr = await d.Value.DryRunAsync(recipe, humanPresent).ConfigureAwait(false);
                }
                catch (CookwalaProblem p)
                {
                    dr = new JsonObject { ["state"] = "refused", ["refusal"] = new JsonObject { ["reason"] = "busy", ["detail"] = p.Message }, ["plan"] = new JsonArray() };
                }
                var plan = J.Items(dr, "plan").ToList();
                rows.Add((J.S(dr, "state") != "accepted", plan.Count(p => J.S(p, "verifiedBy") == "human"), plan.Count(p => J.S(p, "verifiedBy") == "time"), d.Key, dr));
            }
            return rows.OrderBy(r => r.Refused).ThenBy(r => r.People).ThenBy(r => r.Timed).ThenBy(r => r.Name, StringComparer.Ordinal)
                       .Select(r => (r.Name, r.Dr)).ToList();
        }

        private static JsonObject With(JsonObject? refusal, string device)
        {
            var o = J.Clone(refusal) ?? new JsonObject();
            o["device"] = device;
            return o;
        }

        public async Task<RunRecord> RunAsync(Job job)
        {
            var rec = new RunRecord(job.Id, job.Tags);
            JsonObject? request = job.Request, recipe = job.Recipe;
            if (job.Order != null)
            {
                if (Planner == null) throw new InvalidOperationException("a job with an order needs a planner");
                var prop = Planner.Propose(job.Order);
                rec.Notes.AddRange(prop.Notes);
                if (!prop.Ok)
                    return rec.Refused(new JsonObject { ["reason"] = prop.Reason, ["detail"] = prop.Detail, ["gate"] = "planner" }, prop.Recipe);
                request = prop.Request;
                recipe = prop.Recipe;
            }
            if (request == null) throw new ArgumentException("a job needs an order or a request");
            rec.Request = request;
            rec.Recipe = J.S(recipe, "id");
            var humanPresent = job.HumanPresent;

            var decision = Gates.Run(new GateContext(request, recipe, null, humanPresent, recalls: await RecallsAsync().ConfigureAwait(false)));
            if (!decision.Allowed)
            {
                var act = Recovery.OnRefusal(decision.Refusal, humanPresent, devicesLeft: false);
                rec.Recovery.Add(act.AsDict());
                if (act.Kind == RecoveryAction.AskPresence && Human != null && Human.Present &&
                    Human.Confirm("presence", "a step may not run unattended; can a person stay in the kitchen?"))
                {
                    humanPresent = true;
                    rec.Human.Add(new JsonObject { ["kind"] = "presence", ["why"] = J.Clone(J.Get(decision.Refusal, "detail")) });
                    decision = Gates.Run(new GateContext(request, recipe, null, true, recalls: await RecallsAsync().ConfigureAwait(false)));
                }
            }
            rec.Gates = decision.AsDict();
            rec.Findings.AddRange(decision.Findings);
            if (!decision.Allowed) return rec.Refused(decision.Refusal!);

            var ranked = await RankAsync(recipe!, humanPresent).ConfigureAwait(false);
            for (var i = 0; i < ranked.Count; i++)
            {
                var (name, dr) = ranked[i];
                var client = Client(name);
                var attempt = new JsonObject { ["device"] = name, ["dryRun"] = J.S(dr, "state") };
                var drRefusal = J.O(dr, "refusal");
                if (J.Truthy(drRefusal)) attempt["reason"] = J.Clone(J.Get(drRefusal, "reason"));
                rec.Attempts.Add(attempt);
                var devicesLeft = i + 1 < ranked.Count;
                if (J.S(dr, "state") != "accepted")
                {
                    var act = Recovery.OnRefusal(drRefusal, humanPresent, devicesLeft);
                    rec.Recovery.Add(act.AsDict());
                    if (act.Kind == RecoveryAction.TryNextDevice) continue;
                    return rec.Refused(With(drRefusal, name));
                }
                var hp = humanPresent;
                var st = await Retrying(rec, () => client.StartExecutionAsync(request, J.S(request, "idempotencyKey"), hp)).ConfigureAwait(false);
                Monitor.Observe(st, name);
                if (J.S(st, "state") == "refused") // the executor is the authority; its refusal wins over our dry run
                {
                    attempt["executor"] = "refused";
                    var act = Recovery.OnRefusal(J.O(st, "refusal"), humanPresent, devicesLeft);
                    rec.Recovery.Add(act.AsDict());
                    if (act.Kind == RecoveryAction.TryNextDevice) continue;
                    return rec.Refused(With(J.O(st, "refusal"), name));
                }
                rec.Device = name;
                return await DriveAsync(rec, client, st, name).ConfigureAwait(false);
            }
            return rec.Refused(new JsonObject { ["reason"] = "missing_capability", ["detail"] = "no device accepted the recipe" });
        }

        private async Task<RunRecord> DriveAsync(RunRecord rec, IExecutorClient client, JsonObject st, string name)
        {
            var exId = J.PyStr(st["id"]);
            JsonObject Observe(JsonObject s) => Monitor.Observe(s, name);
            var ended = false;
            for (var tick = 0; tick < Recovery.MaxTicks; tick++)
            {
                if (Simulator.Final.Contains(J.S(st, "state") ?? "")) { ended = true; break; }
                await client.AdvanceAsync().ConfigureAwait(false);
                st = Observe(await Retrying(rec, () => client.GetExecutionAsync(exId)).ConfigureAwait(false));
                if (J.S(st, "state") == "needs_human")
                {
                    var act = Recovery.OnNeedsHuman(st, Human);
                    rec.Recovery.Add(act.AsDict());
                    if (act.Kind == RecoveryAction.Resume)
                    {
                        rec.Human.Add(new JsonObject { ["kind"] = "confirm", ["why"] = act.Detail });
                        st = Observe(await client.ResumeExecutionAsync(exId, J.Long(st["seq"])).ConfigureAwait(false));
                    }
                    else
                    {
                        st = Observe(await Retrying(rec, () => client.StopExecutionAsync(exId, "no_person_answered")).ConfigureAwait(false));
                    }
                }
            }
            if (!ended && Simulator.Final.Contains(J.S(st, "state") ?? "")) ended = true;
            if (!ended)
            {
                rec.Recovery.Add(Recovery.OnStall(st).AsDict());
                await Retrying(rec, () => client.StopExecutionAsync(exId, "stalled")).ConfigureAwait(false);
                for (var k = 0; k < 20; k++)
                {
                    await client.AdvanceAsync().ConfigureAwait(false);
                    st = Observe(await client.GetExecutionAsync(exId).ConfigureAwait(false));
                    if (Simulator.Final.Contains(J.S(st, "state") ?? "")) break;
                }
            }
            rec.Transitions = Monitor.Transitions(exId, name);
            rec.Status = st;
            try
            {
                rec.Log = await client.ExecutionLogAsync(exId).ConfigureAwait(false);
            }
            catch (CookwalaProblem)
            {
                rec.Log = null;
            }
            var end = Recovery.OnEnd(st, rec.Log);
            if (end != null)
            {
                rec.Recovery.Add(end.AsDict());
                if (end.Kind == RecoveryAction.DiscardAndReport && end.Flag("report", true))
                {
                    rec.Incident = Incidents.IncidentFrom(rec);
                    try
                    {
                        await client.ReportIncidentAsync(rec.Incident).ConfigureAwait(false);
                    }
                    catch (CookwalaProblem p)
                    {
                        rec.Notes.Add($"incident not accepted: {p.Message}");
                    }
                }
            }
            rec.Anomalies = Monitor.Anomalies.Where(a => J.S(a, "execution") == exId).Select(a => (JsonObject)a.DeepClone()).ToList();
            var disposition = end != null && end.Flag("discard") ? "discard" : J.S(st, "state") == "completed" ? "served" : "not_served";
            return rec.Finish(J.S(st, "state")!, disposition);
        }

        /// <summary>Run jobs one after another.</summary>
        public async Task<List<RunRecord>> RunAllAsync(IEnumerable<Job> jobs)
        {
            var outList = new List<RunRecord>();
            foreach (var j in jobs) outList.Add(await RunAsync(j).ConfigureAwait(false));
            return outList;
        }

        /// <summary>Synchronous <see cref="RunAsync"/> (fine for <see cref="LocalClient"/> kitchens, whose tasks complete at once).</summary>
        public RunRecord Run(Job job) => RunAsync(job).GetAwaiter().GetResult();

        /// <summary>Synchronous <see cref="RankAsync"/>.</summary>
        public List<(string Device, JsonObject DryRun)> Rank(JsonObject recipe, bool humanPresent) => RankAsync(recipe, humanPresent).GetAwaiter().GetResult();
    }
}
