// Generated from fleet.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Kitchens and Production Runs (fleets)

import type { DateTime, GlobalRef, Hash, Meta, Money, UntrustedText, VocabId } from "./common";

export type Version = string;

export type Id = string;

export type OrgId = string;

export type Station = {
  id: Id;
  kind: "prep" | "hob" | "oven" | "fryer" | "grill" | "steam" | "kettle" | "robot_cell" | "plating" | "packing" | "hot_hold" | "cooling" | "cold_store" | "wash";
  heatSources?: Array<"gas" | "electric" | "induction" | "steam" | "charcoal" | "solar" | "none">;
  /** Capability document references (URL or id) of robots and appliances at this station. */
  devices?: string[];
  /** Portions per hour this station can process. */
  capacityPerHour?: number;
  sensors?: VocabId[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Kitchen = {
  profile: Version;
  kind: "Kitchen";
  id: Id;
  organization: OrgId;
  name?: string;
  type: "restaurant" | "community" | "school" | "disaster" | "care_home" | "central_production" | "robot" | "caterer" | "food_factory";
  site?: {
    country: string;
    admin1?: string;
    pcode?: string;
    altitudeM?: number;
  };
  stations: Station[];
  capacityMealsPerHour: number;
  hotHold?: {
    units?: number;
    minTempC?: number;
  };
  cooling?: {
    blastChiller?: boolean;
    iceBath?: boolean;
    coldStoreKg?: number;
  };
  /** Humanitarian rule packs in force, id@version. */
  rulePacks: string[];
  /** SafetyLimits pack id@version enforced by the kitchen's devices. */
  safetyLimits?: string;
  /** Counts by role, never names. */
  staff?: Array<{
    role: "head_cook" | "cook" | "assistant" | "volunteer" | "robot_technician" | "food_safety_lead" | "server" | "driver";
    count: number;
  }>;
  operatingHours?: Array<{
    days: string;
    from: string;
    to: string;
  }>;
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Assignment = {
  recipe: GlobalRef;
  /** Recipe node id. */
  node: string;
  station: Id;
  actor: "device" | "person" | "either";
  device?: string;
  role?: "head_cook" | "cook" | "assistant" | "volunteer" | "robot_technician" | "food_safety_lead" | "server";
  plannedStart?: DateTime;
  plannedEnd?: DateTime;
};

export type CcpRecord = {
  id: Id;
  kind: "cook_core_temp" | "hot_hold_temp" | "cooling_stage_1" | "cooling_stage_2" | "reheat_core_temp" | "chilled_storage_temp" | "allergen_segregation";
  recipe?: GlobalRef;
  batch?: number;
  limit: number;
  unit: "degC" | "min" | "h";
  observed?: number;
  at?: DateTime;
  method?: "probe" | "device_log" | "logger" | "visual" | "not_measured";
  pass?: boolean;
  /** Corrective action when the record fails. */
  action?: string;
};

export type ProductionRun = {
  profile: Version;
  kind: "ProductionRun";
  id: Id;
  kitchen: Id;
  /** Humanitarian Program or Distribution id when the run serves a program. */
  program?: string;
  purpose?: "service" | "school_meals" | "community_meals" | "disaster_response" | "care_home_meals" | "event" | "donation" | "retail";
  serveWindow: {
    from: DateTime;
    to: DateTime;
  };
  recipes: Array<{
    recipe: GlobalRef;
    recipeHash: Hash;
    batches: number;
    servingsPerBatch: number;
    /** Scale factor per batch relative to the recipe yield; must respect yield.scaling. */
    scale?: number;
  }>;
  /** Diet rules in force for this run (e.g. halal, vegetarian). */
  dietRules?: string[];
  allergenBlocks?: string[];
  assignments?: Assignment[];
  ccps?: CcpRecord[];
  /** Core executions (ExecutionLog) that device steps produced. */
  executions?: Array<{
    device: string;
    executionId: string;
    logHash?: Hash;
    outcome?: "served" | "partial" | "aborted_safe" | "refused" | "failed";
  }>;
  state: "planned" | "in_progress" | "completed" | "aborted";
  outcome?: {
    mealsProduced?: number;
    mealsServed?: number;
    kgWaste?: number;
    kgRescuedUsed?: number;
    ccpFailures?: number;
    safetyIncidents?: number;
    findings?: string[];
    /** Humanitarian Distribution id emitted for this run. */
    distribution?: string;
    energyKwh?: number;
    gasM3?: number;
    cost?: {
      food?: Money;
      energy?: Money;
      staff?: Money;
    };
  };
  note?: UntrustedText;
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Exclusive use of a station by a device or a role for a time. Two robots cannot hold the same hob. */
export type StationLease = {
  kind: "StationLease";
  id: Id;
  kitchen: Id;
  run?: Id;
  station: Id;
  /** Device id or staff role. */
  holder: string;
  from: DateTime;
  to: DateTime;
  releasedAt?: DateTime;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
