// Generated from knowledge.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Knowledge Packs

import type { PatchOp, Question } from "./advice";
import type { GlobalRef, LangMap, Range } from "./common";

/** Condition over the incident/context (same expression language as policy packs: all/any/not/path comparisons). */
export type Cond = {
  [key: string]: unknown;
};

export type Playbook = {
  id: string;
  incidentTypes: string[];
  title: LangMap;
  appliesTo?: {
    ops?: string[];
    ingredientClasses?: string[];
    dishTags?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Evaluated first. The first matching rule with verdict unsafe_discard ends the playbook: only discard/restart/repurpose-other-food options remain. */
  safetyGate?: Array<{
    when: Cond;
    verdict: "unsafe_discard" | "unknown_ask_human" | "safe_with_conditions";
    message: LangMap;
    ruleRef?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  diagnostics?: Question[];
  options: Array<{
    id: string;
    kind: "patch_and_resume" | "repurpose" | "discard_and_restart" | "discard" | "ask_human" | "substitution";
    title: LangMap;
    when?: Cond;
    /** Patch templates; {placeholders} resolved from the incident and recipe. */
    actions?: PatchOp[];
    resume?: "same_node" | "next_node" | "restart_node" | "restart_from_input" | "none";
    impact?: {
      extraTimeMin?: number;
      quality?: string;
      notes?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    priority?: number;
    notes?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** What executors should do to avoid it next time (fed back into recipes). */
  prevention?: string[];
  references?: Array<{
    title?: string;
    url?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type RoleEntry = {
  /** Ingredient id or class (cw.ing.* / cw.ing.class.*). */
  subject: string;
  roles: Array<{
    role: "salt" | "acid" | "sweetener" | "fat" | "umami" | "bitter" | "heat_spice" | "aromatic_base" | "herb_fresh" | "spice_warm" | "binder" | "leavener_chemical" | "leavener_biological" | "thickener_starch" | "thickener_protein" | "gelling" | "emulsifier" | "protein_main" | "bulk_starch" | "liquid_base" | "stock" | "color" | "crunch" | "moisture" | "preservative" | "garnish";
    strength?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Approximate salt (NaCl) by mass, for salt balancing. */
  saltPct?: number;
  acidity?: string;
  notes?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Substitution = {
  from: string;
  to: Array<{
    ingredientId: string;
    ratio: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Overall mass ratio to of from (1 = same mass). */
  ratio: number;
  /** Contexts/ops where it works (baking, braise, raw, frying...). */
  goodFor?: string[];
  badFor?: string[];
  quality?: "same" | "minor_loss" | "noticeable_loss";
  reasons?: Array<"missing" | "allergy" | "dietary" | "cost" | "preference" | "budget" | "ration">;
  /** Follow-up adjustments (e.g. reduce other liquid). */
  adjust?: PatchOp[];
  notes?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Transformation = {
  id: string;
  /** Intermediate state pattern: {"class": "cooked_rice", "issues": ["mushy"]}. */
  from: {
    [key: string]: unknown;
  };
  to: Array<{
    dishTag?: string;
    recipeId?: GlobalRef;
    title?: LangMap;
    needs?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Safety condition that must already hold (e.g. 'rice was cooled to 5 °C within 2 h'). */
  safety?: string;
  notes?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type StorageProfile = {
  id: string;
  foodClasses: string[];
  fridgeDays?: {
    min?: number;
    max?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  freezerMonths?: {
    min?: number;
    max?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  freezeQuality?: "good" | "fair" | "poor";
  roomTempMaxHours?: number;
  cooling?: string;
  reheatMinC?: number;
  containers?: string[];
  cookForStorage?: string[];
  notes?: string[];
  sources?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type EnergyModel = {
  id: string;
  source: string;
  /** Approximate fraction of input energy reaching the food. */
  efficiency?: Range;
  notes?: string[];
  tips?: string[];
  sources?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Culinary and food-safety knowledge the reasoner uses beyond recipes: recovery playbooks, ingredient functional roles, substitution rules, transformations (repurposing intermediates), storage profiles and energy models. Anyone can publish a knowledge pack (public or private); packs are merged by priority, and safety rules can only be tightened by lower-priority packs, never loosened. */
export type Knowledge = (unknown & unknown & unknown & unknown & unknown & unknown);
