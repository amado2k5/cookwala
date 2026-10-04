// Generated from mission.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Mission

import type { AdviceRequest, RecipePatch } from "./advice";
import type { DateTime, Duration, GlobalRef, Hash, LangMap, Meta, Money, Signature, SpecVersion, VocabId } from "./common";
import type { OperatingMode } from "./profile";
import type { Session } from "./session";

export type Facet = {
  facet: VocabId;
  subject: string;
  value: unknown;
  summary?: string;
  source: {
    kind: "declared" | "observed" | "reported" | "inferred";
    actor?: string;
    evidence?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  observedAt: DateTime;
  validFor?: Duration;
  confidence?: number;
  privacy: "public" | "household" | "sensitive" | "secret";
  consent?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A role in the flow with ordered candidates (primary → alternates), what each may see and do. */
export type ProviderSlot = {
  /** e.g. planner, grocer, delivery, monitor, arbiter:substitution, nutrition, orchestrator. */
  role: string;
  candidates: Array<{
    provider: string;
    tier?: string;
    pace?: "primary" | "alternate" | "contingency" | "emergency";
    endpoint?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Facet types disclosed to this role. */
  view?: string[];
  /** Delegated, attenuated authorization (UCAN/ZCAP-style). */
  capabilityToken?: string;
  mayForward?: boolean;
  timeoutS?: number;
  /** Ask alternates in parallel when latency matters; first valid answer wins. */
  hedge?: boolean;
  /** Capability tags this role covers, e.g. estimate:robot_energy, estimate:duration, assess:criticality. Several roles/providers may share a tag; their outputs become competing assessments. */
  capabilities?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** critical: must be met exactly, never traded, failure blocks the Mission (allergen-free, halal, CCPs, child safety). required: must be met, but approved alternatives (plan B/C) are allowed. preferred: degrade gracefully; record the loss. optional: drop silently if unavailable; log only. */
export type Criticality = "critical" | "required" | "preferred" | "optional";

export type Requirement = {
  id: string;
  /** e.g. ingredient:eggs, dietary:halal, allergen_free:peanuts, serve_by:19:30, budget<=40USD, dish_identity, delivery:groceries, device:oven. */
  what: string;
  criticality: Criticality;
  /** Who set it: owner, recipe identity, policy pack, clinician, mode. */
  source?: string;
  fallbacks?: Pace;
  /** Decision class governing changes to it (see decisionRights). */
  decidedBy?: string;
  status?: "open" | "satisfied" | "satisfied_by_fallback" | "dropped" | "violated" | "blocked";
  /** Contribution or decision id. */
  satisfiedBy?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Primary, Alternate, Contingency, Emergency (military PACE planning): ordered plan A/B/C/D for one requirement, step or the whole Mission. */
export type Pace = {
  primary?: Fallback;
  alternate?: Fallback;
  contingency?: Fallback;
  emergency?: Fallback;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Fallback = {
  /** e.g. substitute:cw.ing.turmeric, provider:did:web:grocer-b, method:pressure_cook, dish:w-ma-012, order:ready_meal, drop, delay:PT30M, ask:owner. */
  action?: string;
  /** When to switch: timeout, unavailable, failed_check, budget_exceeded, quality_below. */
  trigger?: string;
  impact?: {
    quality?: string;
    extraCost?: Money;
    extraTime?: Duration;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Decision class or actor that must approve before switching. */
  needsApproval?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Who may decide what. Evaluated top-down; the first matching rule applies. Safety-class decisions can never be granted solely to a remote provider. */
export type DecisionRight = {
  class: "substitute_ingredient" | "drop_optional" | "drop_preferred" | "change_method" | "change_dish" | "change_provider" | "spend_more" | "delay" | "reschedule" | "discard_food" | "salvage" | "serve_degraded" | "abort_mission" | "contact_emergency" | "share_more_data" | "accept_offer" | "criticality_assessment" | "custom" | "budget_increase" | "deadline_extension" | "reduce_scope" | "accept_deviation" | "lower_autonomy" | "request_assist" | "recharge_plan" | "handoff_task" | "reconcile";
  decider: "holder" | "arbiter" | "orchestrator" | "provider" | "quorum" | "household_human" | "named_human" | "safety_kernel";
  /** Specific DIDs/roles (e.g. arbiter providers, 'parent'). */
  who?: string[];
  /** Thresholds under which the decider may act alone, e.g. {"extraCost": {"amount": 3, "currency": "USD"}, "quality": "minor", "delay": "PT15M"}. */
  limits?: {
    [key: string]: unknown;
  };
  quorum?: {
    of?: number;
    need?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Decision class/actor to escalate to when limits are exceeded. */
  beyondLimits?: string;
  timeout?: Duration;
  onTimeout?: "take_default" | "take_safest" | "escalate" | "abort";
  default?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type EscalationStep = {
  level: number;
  /** holder | arbiter:<class> | orchestrator | household:<person/role> | maker_support | service_provider | emergency_services. */
  to: string;
  when?: string[];
  channel?: string[];
  waitFor?: Duration;
  then?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** What a provider adds. Lifecycle: offered → accepted/rejected (by holder) → committed (binding, with SLA) → in_progress → fulfilled | partially_fulfilled | failed | withdrawn | superseded | compensated. */
export type Contribution = {
  id: string;
  by: string;
  role: string;
  kind: "facet" | "advice" | "plan" | "quote" | "offer" | "order" | "delivery" | "monitor" | "decision" | "approval" | "review" | "custom" | "assessment";
  /** Requirement ids. */
  satisfies?: string[];
  /** Typed payload (AdviceResponse, TeamPlan, Quote, OrderIntent...). */
  body?: unknown;
  bodySchema?: string;
  binding?: "informational" | "advisory" | "binding_offer" | "commitment";
  sla?: {
    deliverBy?: DateTime;
    availability?: string;
    penalty?: string;
    insurer?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  status: "offered" | "accepted" | "rejected" | "committed" | "in_progress" | "fulfilled" | "partially_fulfilled" | "failed" | "withdrawn" | "superseded" | "compensated";
  failure?: Failure;
  /** Action that undoes/offsets this contribution if the Mission changes (cancel order, release slot, refund) — saga pattern. */
  compensation?: string;
  idempotencyKey?: string;
  createdAt: DateTime;
  hash?: Hash;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Failure = {
  code: "timeout" | "unavailable" | "out_of_stock" | "capability_mismatch" | "policy_denied" | "safety_denied" | "budget_exceeded" | "invalid_input" | "insufficient_context" | "conflict" | "internal_error" | "rate_limited" | "subscription_inactive" | "custom";
  retryable: boolean;
  retryAfter?: Duration;
  /** Whatever could still be provided. */
  partial?: unknown;
  /** Missing facets/permissions that would let it succeed. */
  needs?: string[];
  /** Suggested alternates/fallbacks. */
  suggest?: string[];
  message?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Decision = {
  id: string;
  class: string;
  /** Requirement/contribution/task ids. */
  about?: string[];
  by: string;
  basis?: "decision_right" | "quorum" | "fallback_rule" | "default_on_timeout" | "safety_kernel" | "human";
  options?: string[];
  choice: string;
  rationale?: string;
  confidence?: number;
  votes?: Array<{
    by?: string;
    choice?: string;
    confidence?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Usually the holder's safety kernel. */
  verifiedBy?: string;
  at: DateTime;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** How the Mission ends: every committed contribution is fulfilled, failed-and-compensated or released; the holder signs the final receipt; settlements are recorded. */
export type Closure = {
  closedAt?: DateTime;
  byHolder?: Signature;
  participants?: Array<{
    who?: string;
    contributions?: string[];
    final?: "fulfilled" | "partially_fulfilled" | "failed" | "compensated" | "released";
    settlement?: string;
    rating?: number;
    signature?: Signature;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  ledgerHead?: Hash;
  /** Transparency log / blockchain anchoring reference, if any. */
  anchoredAt?: string;
  /** Predicted vs actual per assessment; updates provider calibration and reputation. */
  calibration?: Array<{
    assessment?: string;
    by?: string;
    predicted?: unknown;
    actual?: unknown;
    withinInterval?: boolean;
    error?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Append-only, hash-chained, signed. Modeled on EPCIS event dimensions (what, when, where, why, who). Deprecated in favour of MissionEvent (same fields plus hash); kept for 0.1 documents. */
export type LedgerEntry = {
  seq: number;
  at: DateTime;
  actor: string;
  action: "created" | "facet_added" | "view_granted" | "contribution_offered" | "contribution_accepted" | "contribution_rejected" | "committed" | "progress" | "fulfilled" | "failed" | "withdrawn" | "compensated" | "decision" | "escalated" | "approved" | "state_changed" | "closed" | "custom" | "assessment" | "reconciled";
  ref?: string;
  why?: string;
  where?: string;
  contentHash?: Hash;
  /** Hash of the previous entry ('genesis' for seq 0). */
  prev: string;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Budget = {
  id: string;
  kind: "cost" | "time" | "energy" | "gas" | "water" | "robot_battery" | "retries" | "provider_calls" | "hops" | "data_disclosure" | "human_attention" | "waste" | "custom";
  /** Whole mission, a requirement, a step, a provider role or a provider (e.g. 'mission', 'role:grocer', 'step:n7'). */
  scope?: string;
  /** Currency code, ISO 8601 duration ('time'), kWh, MJ, L, pct, count, minutes. */
  unit?: string;
  /** Hard limit (number, Money or Duration/DateTime for time). */
  limit: unknown;
  /** Planned/baseline amount (from the bound plan). */
  plan?: unknown;
  thresholds?: Array<{
    /** Fraction of limit (0.8 = 80%) or of forecast overrun. */
    at: number;
    /** Trigger on spent-so-far or on estimate-at-completion. */
    on?: "actual" | "forecast";
    action: "log" | "notify" | "require_approval" | "switch_fallback" | "cheaper_mode" | "reduce_scope" | "pause" | "escalate" | "abort";
    /** Who is notified/asked (decision class, role or person). */
    to?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Who tracks and enforces it: holder (default), orchestrator (delegated), or budget_controller provider. The holder's kernel enforces hard limits regardless. */
  controller: string;
  status?: {
    /** Actual so far. */
    spent?: unknown;
    /** Committed but not yet spent (e.g. accepted orders). */
    committed?: unknown;
    /** Estimate at completion (spent + committed + remaining plan). */
    forecastAtCompletion?: unknown;
    /** (forecast - plan) / plan. */
    variance?: number;
    state?: "ok" | "warning" | "over_soft" | "over_hard" | "frozen";
    updatedAt?: DateTime;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Unspent amount returns to a parent budget (meal plan, week). */
  carryOver?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type MeterEntry = {
  budget: string;
  /** Number, Money or Duration. */
  amount: unknown;
  kind?: "spent" | "committed" | "released" | "forecast_change";
  /** Contribution/task/decision causing it. */
  ref?: string;
  at: DateTime;
  by: string;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Degradation = {
  id: string;
  area: "vision" | "low_light" | "glare" | "depth_sensing" | "touch_force" | "gripper" | "arm_reach" | "mobility" | "temperature_sensing" | "smell_sensing" | "audio" | "speech" | "compute" | "network" | "battery" | "calibration" | "tool_missing" | "appliance_fault" | "space_constraint" | "human_unavailable" | "custom";
  /** Robot/device/zone affected. */
  subject?: string;
  severity: "minor" | "moderate" | "severe" | "blocking";
  detail?: string;
  /** e.g. {"visionConfidence": 0.55, "lux": 40, "gripForceMaxN": 6}. */
  measured?: {
    [key: string]: unknown;
  };
  since?: DateTime;
  expectedUntil?: DateTime;
  /** Ops, sensors or cues affected (cw.op.cut, cw.sense.translucent...). */
  affects?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Adaptation = {
  id: string;
  /** Degradation ids. */
  for: string[];
  strategy: "fix_environment" | "substitute_sensing" | "borrow_perception" | "reassign_task" | "human_assist" | "remote_assist" | "simplify_method" | "change_equipment" | "widen_safety_margin" | "slow_down" | "shrink_batch" | "change_recipe" | "use_preprepared_ingredient" | "lower_autonomy" | "defer";
  /** Who proposed/provides it: holder, planner, arbiter, maker extension, another robot, smart-home device, human, teleoperation service. */
  by: string;
  /** e.g. 'turn on hood light (Matter On/Off)', 'use probe cw.sense.core_temp instead of vision cue', 'arm-1 camera streams view of pan', 'coarse chop 20 mm instead of 10 mm'. */
  actions?: string[];
  patch?: RecipePatch;
  /** How the result will differ from the normal dish. */
  deviation?: {
    /** Must be true unless a change_dish decision approved otherwise. */
    identityPreserved?: boolean;
    /** e.g. 'onions less browned', 'coarser texture', 'slightly overcooked eggs (firm yolks)'. */
    sensory?: string[];
    quality?: "none" | "minor" | "noticeable" | "major";
    nutritionDelta?: {
      [key: string]: number;
    };
    extraTime?: Duration;
    extraCost?: Money;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Why safety is unchanged or stricter (never looser). */
  safety?: string;
  /** Decision id (serve_degraded / change_method) or actor. */
  approvedBy?: string;
  status?: "proposed" | "approved" | "active" | "rejected" | "ended";
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Uncertainty of an estimate. */
export type Distribution = {
  p10?: number;
  p50?: number;
  p90?: number;
  mean?: number;
  sd?: number;
  min?: number;
  max?: number;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** An opinion, estimate or judgment by a provider (or the robot) on a topic. Multiple providers may assess the same topic; they may agree, refine or disagree. */
export type Assessment = {
  id: string;
  /** e.g. estimate.robot_energy_pct, estimate.robot_energy_wh, estimate.duration, estimate.cost, estimate.appliance_energy_kwh, assess.safety, assess.criticality, assess.feasibility, assess.doneness, assess.spoilage. */
  topic: string;
  /** What it is about: mission, recipe, plan, task, item. */
  subject?: string;
  by: string;
  group?: string;
  /** Point value (number/string/object). */
  value: unknown;
  unit?: string;
  distribution?: Distribution;
  method: "physics_model" | "simulation" | "historical_stats" | "ml_model" | "llm_judgment" | "measurement" | "vendor_spec" | "expert_rule" | "human_judgment";
  evidence?: Array<{
    kind?: "facet" | "media" | "telemetry" | "history" | "spec" | "benchmark" | "report";
    ref?: string;
    note?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  assumptions?: string[];
  /** Hash of the inputs/view it saw, so disagreements caused by different inputs are visible. */
  inputsHash?: Hash;
  confidence: number;
  /** Assessment id it reacts to. */
  respondsTo?: string;
  stance?: "independent" | "agree" | "refine" | "disagree";
  reason?: string;
  /** Provider's historical accuracy on this topic (claimed; verified by the reconciler from closure data). */
  calibration?: {
    n?: number;
    intervalCoverage?: number;
    meanAbsError?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  at: DateTime;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type ReconcileRule = {
  /** Topic or prefix (estimate.robot_energy*). */
  topic: string;
  /** holder (default), a chosen agent/orchestrator DID, a quorum, or a household human. */
  reconciler: string;
  strategy: "conservative" | "calibration_weighted" | "evidence_priority" | "bayesian_fusion" | "median" | "quorum" | "debate_then_decide" | "ask_human";
  /** For safety/feasibility topics take the cautious quantile (e.g. energy need at p90). */
  safetyBias?: "worst_case" | "p90" | "p50";
  /** Relative spread above which assessments count as conflicting (e.g. 0.25). */
  conflictThreshold?: number;
  /** Precedence when evidence quality differs, e.g. [measurement, historical_stats, physics_model, vendor_spec, llm_judgment]. */
  evidenceOrder?: string[];
  /** Rebuttal/clarification rounds before deciding. */
  maxRounds?: number;
  timeout?: Duration;
  onTimeout?: "take_conservative" | "take_latest" | "escalate";
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Reconciliation = {
  id: string;
  topic: string;
  assessments: string[];
  conflict?: {
    detected?: boolean;
    spread?: number;
    causes?: Array<"different_inputs" | "different_methods" | "different_assumptions" | "stale_evidence" | "model_error" | "unknown">;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Requests for more evidence/rebuttals (e.g. robot measured battery; provider re-estimated). */
  rounds?: Array<{
    asked?: string[];
    question?: string;
    newEvidence?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  reconciler: string;
  strategy: string;
  weights?: {
    [key: string]: number;
  };
  result: {
    value?: unknown;
    unit?: string;
    distribution?: Distribution;
    /** The value used for decisions after safety bias. */
    decisionValue?: unknown;
    dissent?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Decision/plan-change ids triggered (charge first, handoff midway, notify owner...). */
  consequences?: string[];
  at: DateTime;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** One entry of the Mission event log. The log is the source of truth; the Mission document is a projection derived by replaying it (tools/mission_reducer.py). One sequencer per Mission (normally the holder's hub) assigns seq and prev, so the chain never forks; other parties submit proposals and receive the sequenced event back. */
export type MissionEvent = {
  mission: string;
  seq: number;
  at: DateTime;
  actor: string;
  type: "created" | "facet_added" | "view_granted" | "contribution_offered" | "contribution_accepted" | "contribution_rejected" | "committed" | "progress" | "fulfilled" | "failed" | "withdrawn" | "compensated" | "decision" | "escalated" | "approved" | "state_changed" | "closed" | "custom" | "assessment" | "reconciled";
  /** For state_changed: checked against profiles/mission/transitions.json. */
  transition?: {
    from?: unknown;
    to?: unknown;
  };
  /** Type-specific body. Personal content may be replaced by a Disclosure digest. */
  payload?: {
    [key: string]: unknown;
  };
  /** Hash-only mode: the payload is stored off-log in erasable storage and only its hash is kept here. */
  payloadDigest?: Hash;
  prev: string;
  /** sha256 of the RFC 8785 canonical JSON of this event without hash and signature. */
  hash: Hash;
  signature?: Signature;
  /** When the actor is not the sequencer: the actor's signature over the proposal. */
  proposedBy?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A signed statement of the log head, counter-signed by witnesses (another party in the Mission or an external transparency service, e.g. IETF SCITT). A sequencer that rewrites history after a witnessed checkpoint is detectable. */
export type Checkpoint = {
  mission: string;
  seq: number;
  head: Hash;
  at: DateTime;
  sequencer: string;
  signature: Signature;
  witnesses?: Array<{
    actor: string;
    at?: DateTime;
    signature: Signature;
    /** Transparency-service receipt, if any. */
    receipt?: string;
  }>;
};

/** The shared, signed, living document of the Cookwala Protocol (docs/PROTOCOL.md): intent, mandate, context facets, credentials, routing, requirements with criticality, fallbacks (PACE), decision rights, escalation, contributions with commitment lifecycle, the bound plan, execution, outcome and a hash-chained ledger. Decision governance is described in docs/DECISIONS.md. */
export type Mission = {
  cookwala: SpecVersion;
  /** Stable URI-able id (e.g. cw:mission:<uuid>). */
  id: string;
  header: {
    type: "home_meal" | "meal_plan" | "event" | "restaurant_service" | "production_run" | "school_meals" | "relief_kitchen" | "packed_meals" | "delivery" | "custom";
    createdAt: DateTime;
    /** DID of the party that owns the Mission (usually the robot acting for the household); only the holder accepts contributions and closes the Mission. */
    holder: string;
    /** DID of the human/organization the holder acts for. */
    owner?: string;
    jurisdiction?: string;
    /** Parent Mission (e.g. a relief program Mission). */
    parent?: string;
    deadline?: DateTime;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  intent: {
    summary: LangMap;
    goals?: string[];
    /** What matters most if the plan breaks (e.g. 'a safe, warm halal dinner for 5 by 19:30; cost matters more than variety'). */
    commandersIntent?: LangMap;
    /** Order after the fixed safety prefix; the first three are always first. */
    priorities?: Array<"human_safety" | "animal_safety" | "food_safety" | "property" | "mandate" | "time" | "quality" | "cost" | "waste" | "energy">;
    /** Structured request when the intent maps to a reasoner intent. */
    advice?: AdviceRequest;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** What the holder may do and decide. */
  mandate: {
    tasks?: Array<"cook" | "prep" | "clean_dishes" | "clean_floor" | "fetch_supplies" | "open_door_for_delivery" | "receive_delivery" | "take_out_trash" | "set_table" | "serve_to_table" | "serve_to_room" | "pack_food" | "order_groceries" | "garden_pick" | "remind_people" | "care_for_pets_food">;
    zones?: string[];
    stairs?: boolean;
    hardNos?: string[];
    caution?: "extra_slow" | "normal" | "relaxed";
    autonomyLevel?: "CA0" | "CA1" | "CA2" | "CA3" | "CA4" | "CA5";
    spendingLimit?: Money;
    /** Providers/people the holder may bring into the flow. */
    mayAddParties?: string[];
    /** Whose instructions win (higher level wins within scope). */
    authority?: Array<{
      who: string;
      level: number;
      scopes?: string[];
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  context?: {
    facets?: Facet[];
    profiles?: GlobalRef[];
    mode?: OperatingMode;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  credentials?: Array<{
    type: string;
    vc: string;
    selective?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  routing?: {
    topology?: "direct" | "chain" | "orchestrated" | "swarm" | "hybrid";
    orchestrator?: string;
    providers?: ProviderSlot[];
    maxHops?: number;
    budget?: Money;
    /** Provider groups that share capabilities (consortia, ensembles, partner networks). */
    groups?: Array<{
      id: string;
      members: string[];
      sharedCapabilities?: string[];
      /** Each member answers independently, the group returns one agreed answer, or a leader answers and others review. */
      mode?: "each_independent" | "group_consensus" | "leader_with_reviewers";
      leader?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  requirements: Requirement[];
  /** Definition of ready: execution may start only when every listed requirement is satisfied (or resolved by an allowed fallback) and the safety kernel passes. */
  readiness?: {
    requires?: string[];
    minConfidence?: number;
    deadline?: DateTime;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  decisionRights: DecisionRight[];
  escalation?: EscalationStep[];
  contributions?: Contribution[];
  decisions?: Decision[];
  plan?: {
    recipes?: Array<{
      recipe?: GlobalRef;
      hash?: Hash;
      servings?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Bound plan (R4): tasks, leases, handoffs. */
    session?: Session;
    contingencies?: Array<{
      on?: string;
      do?: string;
      playbook?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    invariants?: string[];
    monitors?: Array<{
      who?: string;
      signal?: string;
      everyS?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  execution?: {
    progress?: number;
    log?: Array<{
      at?: DateTime;
      by?: string;
      kind?: "progress" | "deviation" | "interruption" | "decision" | "comment" | "lesson" | "issue";
      text?: string;
      ref?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  outcome?: {
    result?: "success" | "success_degraded" | "partial" | "failed" | "aborted_safety" | "aborted_by_human" | "cancelled";
    requirementsMet?: string[];
    requirementsDropped?: string[];
    consumedPct?: number;
    wasteG?: number;
    costActual?: Money;
    feedback?: string[];
    lessons?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  state: "draft" | "open" | "enriching" | "ready" | "committed" | "executing" | "paused" | "degraded" | "closing" | "closed" | "failed" | "cancelled";
  closure?: Closure;
  ledger: LedgerEntry[];
  meta?: Meta;
  /** Guardrails for cost, time, energy, retries, hops, data disclosure, human attention. Tracked live from contributions, meters and execution; thresholds trigger actions automatically. */
  budgets?: Budget[];
  /** Accruals against budgets (each also recorded in the ledger). */
  meters?: MeterEntry[];
  /** Who plays which role in this Mission (see docs/DECISIONS.md). */
  roles?: Array<{
    role: "holder" | "owner" | "budget_controller" | "orchestrator" | "arbiter" | "provider" | "monitor" | "approver" | "safety_kernel" | "auditor" | "executor";
    who: string;
    scope?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** What is not working fully right now (robot, environment, devices, connectivity). Declared by the holder or observed by monitors. */
  degradations?: Degradation[];
  /** How the plan is adjusted to the degradations, by whom, with which accepted deviations from the normal dish. */
  adaptations?: Adaptation[];
  assessments?: Assessment[];
  reconcileRules?: ReconcileRule[];
  reconciliations?: Reconciliation[];
  /** Where the authoritative event log lives and which head this projection was derived from. */
  eventLog?: {
    uri?: string;
    sequencer?: string;
    headSeq: number;
    head: Hash;
    mode?: "full" | "hash_only";
  };
  checkpoints?: Checkpoint[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
