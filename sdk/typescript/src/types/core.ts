// Generated from core.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: core. Cookwala Core

import type { AgentMandate, DateTime, Duration, GlobalRef, Hash, Severity, Signature, SpecVersion, Unit, UntrustedText, VocabId } from "./common";

/** Core version. A reader accepts any patch of its minor version, rejects other minors with error unsupported_version, and ignores x- fields it does not know. */
export type CoreVersion = string;

export type Id = string;

/** Ask a device or hub to cook a recipe. The executor refuses (state refused) rather than guessing when it cannot meet a step's envelope, sensor ladder or safety limits. */
export type ExecuteRequest = {
  core: CoreVersion;
  kind: "ExecuteRequest";
  id: Id;
  recipe: GlobalRef;
  /** The executor must cook exactly this revision; a mismatch is refused. */
  recipeHash: Hash;
  servings?: number;
  serveBy?: DateTime;
  /** Id of the human, or of the agent acting under mandate. */
  requestedBy: string;
  /** Required when an AI agent sends the request; must include the start_cooking scope. */
  mandate?: AgentMandate;
  /** Allergens that must not be present for these diners. Matched against the recipe and the inventory; any match refuses the request. */
  allergenBlocks?: string[];
  /** Id of an operating mode (profile.schema.json), e.g. energy saver. */
  operatingMode?: string;
  /** Repeating a request with the same key returns the original execution. */
  idempotencyKey: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type RefusalReason = "unsupported_version" | "recipe_hash_mismatch" | "recipe_recalled" | "missing_equipment" | "missing_capability" | "missing_sensor_no_fallback" | "envelope_out_of_range" | "safety_limit" | "allergen_block" | "not_authorized" | "mandate_scope" | "needs_human_present" | "busy";

/** Legal transitions: accepted→preparing|refused|stopped; preparing→running|needs_human|stopping|failed; running→paused|needs_human|stopping|completed|failed; paused→running|stopping; needs_human→running|stopping|failed; stopping→stopped. refused, stopped, completed and failed are final. */
export type ExecutionState = "accepted" | "refused" | "preparing" | "running" | "paused" | "needs_human" | "stopping" | "stopped" | "completed" | "failed";

export type ExecutionStatus = {
  core: CoreVersion;
  kind: "ExecutionStatus";
  id: Id;
  request: Id;
  state: ExecutionState;
  /** Increments on every change; events carry the same sequence. */
  seq: number;
  updatedAt: DateTime;
  step?: {
    node?: string;
    op?: VocabId;
    startedAt?: DateTime;
    progress?: number;
    verifiedBy?: VerifiedBy;
    readings?: Reading[];
  };
  eta?: DateTime;
  refusal?: {
    reason: RefusalReason;
    node?: string;
    detail?: string;
  };
  humanNeeded?: {
    why?: string;
    byWhen?: DateTime;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Ask an executor to stop safely. Stopping never needs authorization beyond reaching the executor; a local stop on the device always works without the network. */
export type StopRequest = {
  core: CoreVersion;
  kind: "StopRequest";
  execution: Id;
  requestedBy: string;
  reason?: string;
};

/** Which rung of the operation's sensor ladder confirmed the step. */
export type VerifiedBy = "sensor" | "model" | "time" | "human";

export type Reading = {
  sensor: VocabId;
  value: number;
  unit: Unit;
  at?: DateTime;
  /** true when the value comes from a model, not a sensor. */
  estimated?: boolean;
};

/** What happened when a recipe was cooked. The record behind the cooking benchmark and the open dataset. Contains no personal data; shared beyond the device only with the consent given in consent.dataset. */
export type ExecutionLog = {
  core: CoreVersion;
  kind: "ExecutionLog";
  id: Id;
  recipe: GlobalRef;
  recipeHash: Hash;
  device: {
    vendor: string;
    model: string;
    firmware?: string;
    capabilitiesHash?: Hash;
    /** Id@version of the SafetyLimits pack in force. */
    safetyLimits?: string;
  };
  startedAt: DateTime;
  endedAt?: DateTime;
  outcome: "served" | "partial" | "aborted_safe" | "refused" | "failed";
  servings?: number;
  steps: Array<{
    node: string;
    op: VocabId;
    startedAt?: DateTime;
    endedAt?: DateTime;
    verifiedBy: VerifiedBy;
    /** The medium stayed inside the op envelope (and the recipe target, if narrower) for the whole step. */
    envelopeOk: boolean;
    summary?: Array<{
      sensor: VocabId;
      unit: Unit;
      min?: number;
      max?: number;
      end?: number;
      estimated?: boolean;
    }>;
    deviation?: {
      kind: "substitution" | "extended_time" | "shortened_time" | "temperature_excursion" | "skipped_optional" | "human_took_over" | "other";
      detail?: string;
    };
  }>;
  safetyEvents?: Array<{
    at: DateTime;
    /** SafetyLimit id that fired. */
    limit: string;
    action: LimitAction;
    node?: string;
  }>;
  humanInterventions?: Array<{
    at?: DateTime;
    kind: "confirm" | "assist" | "take_over" | "stop" | "refill" | "other";
    minutes?: number;
  }>;
  energyKwh?: number;
  wasteG?: number;
  rating?: {
    score?: number;
    comment?: UntrustedText;
  };
  /** Opt-in only. Default none: the log stays on the device or hub. */
  consent: {
    dataset: "none" | "research_only" | "open";
    /** Opaque id of the household account; never a name. */
    grantedBy?: string;
    grantedAt?: DateTime;
    withdrawable?: true;
  };
  privacy: {
    personalData: "none";
    /** Times may be coarsened before sharing; day is the default for open datasets. */
    timePrecision?: "minute" | "hour" | "day";
  };
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type LimitAction = "refuse_start" | "cut_heat" | "stop_motion" | "stop_all" | "ask_human" | "alert";

export type SafetyLimit = {
  id: string;
  kind: "max_temp" | "min_core_temp" | "time_temp" | "allergen_block" | "unattended" | "pressure" | "smoke_or_fire" | "stop" | "untrusted_input";
  appliesTo?: {
    medium?: string;
    ops?: VocabId[];
    foodClass?: string;
  };
  min?: number;
  max?: number;
  unit?: "degC" | "kPa" | "s" | "min" | "h";
  holdFor?: Duration;
  action: LimitAction;
  message?: string;
  source: string;
};

/** Limits an executor enforces on the device itself. No recipe, agent, remote message, extension or operating mode can raise or disable them; only the device maker (and, more strictly, local law) can change them. A stricter limit always wins over a looser one. */
export type SafetyLimits = {
  core: CoreVersion;
  kind: "SafetyLimits";
  id: string;
  version: SpecVersion;
  status?: "draft" | "reviewed" | "adopted";
  reviewedBy?: string[];
  limits: SafetyLimit[];
  disclaimer: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Withdraws a recipe revision, an extension or a rule pack. Catalogs publish recalls in a feed (GET /v1/recalls); executors check the feed when online and refuse recalled revisions within the window the action names. */
export type Recall = {
  core: CoreVersion;
  kind: "Recall";
  id: Id;
  issuedAt: DateTime;
  /** Catalog or authority issuing the recall; its key must be trusted by the executor. */
  issuer: string;
  targets: Array<{
    ref: GlobalRef;
    hash?: Hash;
    allRevisions?: boolean;
  }>;
  severity: Severity;
  reason: "food_safety" | "allergen" | "device_safety" | "security" | "legal" | "quality";
  action: "block" | "block_and_stop_running" | "warn";
  replacement?: GlobalRef;
  detail?: string;
  signature: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Anonymous near-miss or incident report, modelled on aviation's confidential reporting. No names, addresses, account ids or exact times; dates only. */
export type IncidentReport = {
  core: CoreVersion;
  kind: "IncidentReport";
  id: Id;
  date: string;
  /** Id from vocab/incidents.json. */
  category: string;
  severity: Severity;
  outcome?: "near_miss" | "minor_injury" | "injury" | "property_damage" | "illness_suspected" | "none";
  op?: VocabId;
  deviceModel?: string;
  recipe?: GlobalRef;
  safetyLimitsFired?: string[];
  description: UntrustedText;
  contributingFactors?: Array<"sensor_missing" | "sensor_fault" | "envelope_unclear" | "recipe_error" | "agent_instruction" | "human_override" | "network" | "power" | "other">;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type ConformanceVector = {
  id: string;
  kind: "hash" | "signature" | "disclosure" | "envelope" | "units" | "execution_transition" | "mission_transition" | "ledger";
  description: string;
  input: unknown;
  expected: unknown;
};
