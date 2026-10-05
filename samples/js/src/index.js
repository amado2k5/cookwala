// Cookwala samples: clients, agents, orchestrators, gates, recovery and reporting.
//
// Runnable sample code for the Cookwala Core 0.2 API, no dependencies. Everything runs offline
// against a simulated executor (the data comes from the bundled snapshot of the repository), or
// against a real hub (`python hub/cookwala_hub.py`, or any executor that serves the Core API).
//
//     import { demo } from '@cookwala/samples';
//     console.log((await demo()).toMarkdown());
//
// These are samples, not certified software. The executor is always the authority: the gates in
// this package check early so a client can explain a refusal, and the executor checks again.
export { version } from './version.js';
export { CookwalaProblem, problem } from './errors.js';
export { canonical, docHash } from './jcs.js';
export { loadBundle, recipeByRef, globalRef, recipeAllergens } from './data.js';
export { SimulatedExecutor, dryRun, checkNodeParams, ladderChoice, trustedSensors, transitionAllowed, FINAL, TRANSITIONS } from './simulator.js';
export { HubClient, LocalClient, BundleCatalog, HubCatalog, newKey } from './clients.js';
export { GateContext, GateResult, GateDecision, GatePipeline, Gate, CoreVersionGate, RecipeHashGate, RecallGate, MandateGate, AllergenGate,
  UntrustedTextGate, EnvelopeGate, AttendanceGate, CapabilityGate, INSTRUCTION_PATTERNS } from './gates.js';
export { PlannerAgent, Proposal, MonitorAgent, ScriptedHuman, ConsoleHuman, makeMandate, ALWAYS_CONFIRM } from './agents.js';
export { RecoveryPolicy, RecoveryAction, FINAL_REFUSALS, DEVICE_REFUSALS } from './recovery.js';
export { Orchestrator, Job } from './orchestrator.js';
export { Reporter, RunRecord, incidentFrom, CATEGORY } from './reporting.js';
export { demo, kitchen, NotePlanner, JOBS, FAULTS } from './scenarios.js';
export { handle, handleRaw, serve } from './service.js';
export { main } from './cli.js';
