"""`cookwala-samples` command line: `cookwala-samples help` lists the commands, `cookwala-samples help COMMAND` explains one."""
import json
import os
import sys

from . import __version__
from .data import load_bundle
from .scenarios import demo
from .orchestrators import Job
from .service import FAULT_KINDS, handle, run_jobs, serve


OVERVIEW = """cookwala-samples: runnable samples for the Cookwala Core 0.2 API.

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
Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage error."""

HELP = {
    'demo': """cookwala-samples demo [--format markdown|json|junit|csv] [--out FILE] [--hub URL [--token T]]

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
    'run': """cookwala-samples run DISH [DISH ...] [--human-present] [--block ALLERGEN ...] [--fault RECIPE#NODE=KIND ...]
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
    'plan': """cookwala-samples plan DISH [--servings N] [--block ALLERGEN ...] [--human-present]

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
    'gates': """cookwala-samples gates RECIPE [--device DEVICE] [--human-present] [--block ALLERGEN ...]

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
    'list': """cookwala-samples list

Prints the bundled example recipes and the simulated devices; use these names with run, plan and gates.

Exit code: 0.""",
    'serve': """cookwala-samples serve [--port 8080] [--bind 127.0.0.1]

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
    'version': """cookwala-samples version

Prints the samples version and the Core version it speaks, e.g. `cookwala-samples 0.3.0 (Core 0.2.0)`.

Exit code: 0.""",
    'help': """cookwala-samples help [COMMAND]

Without COMMAND, lists the commands. With COMMAND, explains it: what it does, its options and examples.
`cookwala-samples COMMAND --help` and `-h` do the same.

Exit code: 0; 2 for an unknown command.""",
}


def help_text(topic=None):
    """The overview, or one command's help; None for an unknown command."""
    return OVERVIEW if topic is None else HELP.get(topic)


def _opt(a, name, default=None):
    return a[a.index(name) + 1] if name in a else default


def _many(a, name):
    return [a[i + 1] for i, x in enumerate(a) if x == name and i + 1 < len(a)]


def _positional(a, flags_with_value):
    out, skip = [], False
    for i, x in enumerate(a):
        if skip: skip = False; continue
        if x in flags_with_value: skip = True; continue
        if x.startswith('--'): continue
        out.append(x)
    return out


def _emit(text, out=None):
    if out:
        with open(out, 'w', encoding='utf-8') as f: f.write(text)
        print(f'wrote {out}')
    else:
        sys.stdout.write(text if text.endswith('\n') else text + '\n')


def main(argv=None):
    a = sys.argv[1:] if argv is None else argv
    if not a or a[0] in ('-h', '--help', 'help'):
        topic = a[1] if len(a) > 1 and a[0] == 'help' else None
        if topic in ('-h', '--help'): topic = 'help'
        text = help_text(topic)
        if text is None: print(f'unknown command: {topic}\n\n{OVERVIEW}'); return 2
        print(text); return 0 if a else 2
    cmd, a = a[0], a[1:]
    if cmd in HELP and ('--help' in a or '-h' in a):
        print(HELP[cmd]); return 0
    fmt = _opt(a, '--format', 'markdown')
    if cmd == 'version':
        print(f'cookwala-samples {__version__} (Core {load_bundle()["core"]})'); return 0
    if cmd == 'list':
        b = load_bundle()
        print('recipes: ' + ', '.join(sorted(b['recipes']))); print('devices: ' + ', '.join(sorted(b['devices']))); return 0
    if cmd == 'demo':
        rep = demo(hub_url=_opt(a, '--hub'), token=_opt(a, '--token', os.environ.get('COOKWALA_HUB_TOKEN')))
        _emit(rep.render(fmt), _opt(a, '--out')); return 0
    if cmd == 'serve':
        serve(int(_opt(a, '--port', os.environ.get('PORT', 8080))), _opt(a, '--bind', os.environ.get('BIND', '127.0.0.1'))); return 0
    if cmd == 'gates':
        pos = _positional(a, {'--device', '--block', '--format', '--out'})
        status, _, text = handle('POST', '/v1/samples/gates', {}, {'recipe': pos[0], 'device': _opt(a, '--device'), 'humanPresent': '--human-present' in a,
                                                                    'allergenBlocks': _many(a, '--block')})
        print(json.dumps(json.loads(text), indent=1, ensure_ascii=False)); return 0 if status == 200 and json.loads(text).get('allowed') else 1
    if cmd == 'plan':
        pos = _positional(a, {'--servings', '--block', '--format', '--out'})
        order = {'dish': ' '.join(pos), 'allergenBlocks': _many(a, '--block')}
        if _opt(a, '--servings'): order['servings'] = float(_opt(a, '--servings'))
        status, _, text = handle('POST', '/v1/samples/plan', {}, {'order': order, 'humanPresent': '--human-present' in a})
        print(json.dumps(json.loads(text), indent=1, ensure_ascii=False)); return 0 if status == 200 and json.loads(text).get('ok') else 1
    if cmd == 'run':
        pos = _positional(a, {'--fault', '--format', '--out', '--block'})
        if not pos: print(HELP['run']); return 2
        faults = dict(f.split('=', 1) for f in _many(a, '--fault') if '=' in f)
        if len(faults) != len(_many(a, '--fault')) or any(v not in FAULT_KINDS for v in faults.values()):
            print('usage error: --fault takes recipe-id#node=sensor_fault|timeout|overheat'); return 2
        jobs = [Job(f'{i + 1}-{d}', order={'dish': d, 'allergenBlocks': _many(a, '--block')}, human_present='--human-present' in a) for i, d in enumerate(pos)]
        rep = run_jobs(jobs, faults)
        _emit(rep.render(fmt), _opt(a, '--out'))
        return 0 if set(rep.summary()['outcomes']) <= {'completed'} else 1
    print(f'unknown command: {cmd}\n\n{OVERVIEW}'); return 2


if __name__ == '__main__':
    sys.exit(main())
