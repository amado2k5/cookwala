// Generated from session.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Cook Session

import type { Actor, DateTime, Hash, LangMap, Meta, SpecVersion } from "./common";
import type { OperatingMode } from "./profile";

export type SessionState = "draft" | "planned" | "awaiting_ingredients" | "awaiting_confirmation" | "running" | "paused" | "completed" | "aborted" | "failed";

/** Matches A2A task states plus 'scheduled' and 'blocked'. */
export type TaskState = "scheduled" | "blocked" | "submitted" | "working" | "input_required" | "auth_required" | "completed" | "failed" | "canceled" | "rejected";

export type Task = {
  id: string;
  recipeId: string;
  nodeId: string;
  op?: string;
  assignee: Actor;
  /** Who takes over on failure, in order (usually ends with a human). */
  fallback?: Actor[];
  state: TaskState;
  dependsOn?: string[];
  leases?: string[];
  scheduledStart?: DateTime;
  startedAt?: DateTime;
  endedAt?: DateTime;
  /** Resolved params after scaling and policy adjustments. */
  params?: {
    [key: string]: unknown;
  };
  progress?: number;
  /** Latest readings, e.g. {"cw.sense.core_temp": 61.5}. */
  telemetry?: {
    [key: string]: unknown;
  };
  /** Which until-checks are satisfied. */
  conditionStatus?: {
    [key: string]: unknown;
  };
  attempts?: number;
  /** What to show/say to humans for this task. */
  message?: LangMap;
  a2aTaskId?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Exclusive or shared hold on a physical resource, so two actors never use the same burner, pan or counter zone at once (modelled on Open-RMF resource scheduling). */
export type Lease = {
  id: string;
  /** e.g. appliance:hob-1/zone-2, vessel:pan-28, zone:counter-left, appliance:oven-main/cavity-1, robot:neo-1/arm-right. */
  resource: string;
  /** Task id or actor id. */
  holder: string;
  mode: "exclusive" | "shared_read";
  from: DateTime;
  until: DateTime;
  state?: "requested" | "granted" | "released" | "expired" | "revoked";
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Transfer of an intermediate or a task between actors (robot→human, appliance→robot, robot→robot). */
export type Handoff = {
  id: string;
  from: Actor;
  to: Actor;
  /** Intermediate ref (e.g. sauce) or task id. */
  item: string;
  location?: string;
  /** e.g. hot_vessel; the receiver must acknowledge. */
  hazards?: string[];
  state: "proposed" | "ready" | "acknowledged" | "completed" | "refused" | "timed_out";
  requiresAck?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** One execution of one or more recipes in one kitchen, coordinated by a Cookwala Hub. It holds the plan (who does what, when, with which resources), live task states, resource leases, handoffs, CCP records and policy decisions. Task states match the A2A task lifecycle so agents can follow along. */
export type Session = {
  cookwala: SpecVersion;
  id: string;
  kitchenId: string;
  createdBy?: Actor;
  createdAt?: DateTime;
  state: SessionState;
  /** Target time the food should be ready; the planner schedules backwards. */
  serveAt?: DateTime;
  /** guided: humans do the steps with prompts; assisted: mixed team; autonomous: machines do everything allowed. */
  mode?: "guided" | "assisted" | "autonomous";
  supervision?: "unattended" | "presence" | "hands_on";
  recipes: Array<{
    recipeId: string;
    revision?: number;
    hash: Hash;
    scale?: number;
    servings?: number;
    /** nodeId → chosen variant id. */
    variants?: {
      [key: string]: string;
    };
    /** Optional ingredients the diner chose to skip. */
    exclusions?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Optional, privacy-minimal diner profile used only for policy evaluation. */
  diners?: Array<{
    ageGroup?: "infant" | "child" | "adult" | "senior";
    allergies?: string[];
    dietary?: string[];
    pregnant?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  participants: Array<{
    actor: Actor;
    roles: string[];
    capabilitiesUrl?: string;
    status?: "available" | "busy" | "offline" | "fault" | "paused";
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  plan: {
    generatedBy?: string;
    estimatedStart?: DateTime;
    estimatedEnd?: DateTime;
    tasks: Task[];
    unassignable?: Array<{
      nodeId?: string;
      reason?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  leases?: Lease[];
  handoffs?: Handoff[];
  ccpRecords?: Array<{
    ccpId: string;
    taskId: string;
    at: DateTime;
    reading: {
      [key: string]: unknown;
    };
    passed: boolean;
    by?: Actor;
    corrective?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  policy: {
    packs: string[];
    decision: "allow" | "allow_with_warnings" | "deny";
    results?: Array<{
      pack?: string;
      rule?: string;
      effect?: string;
      passed?: boolean;
      message?: string;
      overriddenBy?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    acknowledgedBy?: Actor;
    acknowledgedAt?: DateTime;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Id of an order.schema.json OrderIntent generated for missing ingredients. */
  shoppingList?: string;
  abort?: {
    reason?: string;
    by?: Actor;
    at?: DateTime;
    stepsExecuted?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  meta?: Meta;
  operatingMode?: OperatingMode;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
