// Generated from recipe.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: core. Cookwala Recipe

import type { Condition, ConditionOrCheck, Duration, EnergyEstimate, FailureAction, GlobalRef, Hash, LangMap, LocalRef, Meta, Quantity, Range, Severity, Signature, SpecVersion, VocabId } from "./common";

export type Verification = {
  /** V0 described · V1 structured · V2 simulated + reviewed · V3 field-verified. */
  level: "V0" | "V1" | "V2" | "V3";
  evidence?: {
    simulatorRuns?: number;
    humanReviews?: number;
    fieldReports?: number;
    deviceClasses?: string[];
    incidents?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  reviewedBy?: string;
  /** Tool/model that produced the process graph, for audit. */
  generatedBy?: string;
  notes?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Dish = {
  names: LangMap;
  localName?: string;
  /** ISO 3166-1 alpha-2 countries. */
  cuisine?: string[];
  course?: "breakfast" | "starter" | "soup" | "salad" | "main" | "side" | "bread" | "dessert" | "snack" | "drink" | "sauce" | "condiment" | "baby" | "other";
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard";
  wikidata?: string;
  images?: Array<{
    url: string;
    role?: "banner" | "thumb" | "step" | "reference_done";
    width?: number;
    height?: number;
    node?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Yield = {
  servings: number;
  totalMass?: Quantity;
  scaling?: {
    minScale?: number;
    maxScale?: number;
    /** How cooking time scales with mass (0 = constant, 0.66 typical for roasts). */
    timeExponent?: number;
    note?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Prep = {
  op?: string;
  shape?: "whole" | "halve" | "quarter" | "slice" | "dice" | "brunoise" | "julienne" | "chop" | "chop_fine" | "mince" | "grate" | "crush" | "puree" | "cube" | "strip" | "wedge" | "ring" | "peel_only" | "zest" | "juice";
  size?: Quantity;
  remove?: string[];
  soak?: {
    liquid?: string;
    duration?: Duration;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Ingredient = {
  ref: LocalRef;
  ingredientId: VocabId;
  /** masterIngredients[].id in the site data. */
  legacyId?: string;
  qty: Quantity;
  display?: LangMap;
  prep?: Prep;
  startTemp?: "frozen" | "fridge" | "room" | "warm" | "hot";
  scaling?: "linear" | "sublinear" | "fixed";
  toTaste?: boolean;
  optional?: boolean;
  /** Equivalents that keep the dish the same. Never used to bypass dietary rules. */
  substitutions?: Array<{
    ingredientId: VocabId;
    qty: Quantity;
    note?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Optional example GS1 product codes for ordering. */
  gtin?: string[];
  /** Computed from the vocabulary; repeated here for offline use. */
  allergens?: string[];
  /** Budget/ration hints. */
  economy?: {
    costClass?: "cheap" | "moderate" | "expensive";
    /** Can be reduced or bulked out without changing the dish's identity. */
    stretchable?: boolean;
    /** Lowest fraction of qty that still gives an acceptable dish. */
    minRatio?: number;
    /** Ingredient ids that can extend it (e.g. lentils for minced meat). */
    bulkWith?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Equipment = {
  ref: LocalRef;
  class: VocabId;
  optional?: boolean;
  constraints?: {
    diameterMm?: Range;
    capacityMl?: Range;
    powerW?: Range;
    maxTempC?: number;
    lid?: boolean;
    material?: string[];
    inductionCompatible?: boolean;
    ovenSafe?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Node = {
  id: LocalRef;
  op: VocabId;
  /** Ingredient refs or outputs of earlier nodes. */
  inputs?: LocalRef[];
  output?: LocalRef;
  /** Container/intermediate the inputs are added to. */
  into?: LocalRef;
  equipment?: LocalRef[];
  /** Validated against the op's param schema in vocab/ops. */
  params?: {
    [key: string]: unknown;
  };
  until?: Condition;
  onTimeout?: FailureAction;
  onFail?: FailureAction;
  retry?: {
    max?: number;
    extendBy?: Duration;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** How closely the executor must watch this step. */
  attention?: "none" | "periodic" | "monitor" | "continuous";
  /** Who may do this step. A hub assigns concrete actors at plan time. */
  assignment?: {
    allowed?: Array<"human" | "robot" | "appliance" | "any">;
    preferred?: "human" | "robot" | "appliance";
    reason?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** A human may do or confirm this step (e.g. tasting). */
  humanOptional?: boolean;
  timing?: {
    startAfter?: Duration;
    /** Following dependent node must start within this time. */
    nextWithin?: Duration;
    /** Relative anchor, e.g. serve-PT30M. */
    notBefore?: string;
    canPause?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  hazards?: LocalRef[];
  ccp?: LocalRef;
  optional?: boolean;
  variants?: Array<{
    id: string;
    label?: LangMap;
    params?: {
      [key: string]: unknown;
    };
    until?: ConditionOrCheck;
    maxTime?: Duration;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Optional reference to a learned skill/policy id for robots that have one (vendor namespace). */
  skill?: string;
  notes?: LangMap;
  /** Original step numbers (fifi.cooking uniqueInstructions.stepNumber) this node was derived from, for traceability and translation reuse. */
  sourceSteps?: number[];
  energy?: EnergyEstimate;
  /** Other ways to do this step (different heat source, equipment, or effort) with their trade-offs, used by planners for energy/budget/battery modes and missing equipment. */
  alternatives?: Array<{
    id: string;
    op: VocabId;
    equipment?: string[];
    params?: {
      [key: string]: unknown;
    };
    until?: Condition;
    energy?: EnergyEstimate;
    /** Duration relative to the main method (0.4 = 60% faster). */
    timeFactor?: number;
    quality?: "better" | "same" | "minor_loss" | "noticeable_loss";
    /** Mode tags where this is preferred: energy_saver, battery_low, budget_low, no_oven, gas_only, quiet, fast. */
    when?: string[];
    label?: LangMap;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Food/equipment states required before this node may start. */
  pre?: FoodState[];
  /** States this node produces (planner effects; verified at completion). */
  post?: FoodState[];
  /** Interruption handling. */
  pause?: {
    pausable?: boolean;
    /** e.g. heat_off, heat_hold_low, lid_on, knife_down, cover_food, move_from_edge. */
    safeState?: string[];
    /** Longest pause before the node's output quality or safety is affected. */
    maxPause?: Duration;
    onExceeded?: "resume_with_extension" | "reheat_then_resume" | "restart_node" | "salvage" | "discard";
    resumeCheck?: FoodState[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Known ways this step goes wrong, how to spot them early, and which playbook recovers. */
  failureModes?: Array<{
    /** cw.incident.* id. */
    incident: string;
    likelihood?: "low" | "medium" | "high";
    detect?: ConditionOrCheck[];
    prevent?: string[];
    /** cw.pb.* id to run. */
    playbook?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** What an executor needs physically (robots match capabilities against this). */
  affordances?: {
    grasp?: string[];
    forceN?: Range;
    precisionMm?: number;
    tools?: string[];
    twoHanded?: boolean;
    liftKg?: number;
    /** e.g. clean_gloves, wash_after_raw_meat, allergen_clean. */
    hygiene?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  space?: {
    zone?: string;
    areaCm2?: number;
    keepClearOfChildren?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Process = {
  nodes: Node[];
  edges?: ("implicit-from-inputs" | Array<{
    from: string;
    to: string;
    type?: "finish_to_start" | "start_to_start" | "finish_to_finish";
    lag?: Duration;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>);
  parallelGroups?: string[][];
  activeTime?: Duration;
  totalTime?: Duration;
  makeAhead?: Array<{
    until?: string;
    maxAdvance?: Duration;
    storage?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Hazard = {
  id: LocalRef;
  type: VocabId;
  severity: Severity;
  mitigation?: string[];
  /** Hard envelope, e.g. {"oilTempMaxC": 200, "maxFillPct": 50}. */
  limits?: {
    [key: string]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type CCP = {
  id: LocalRef;
  /** e.g. pathogen.salmonella, pathogen.clostridium_perfringens (cooling), toxin.bacillus_cereus (rice). */
  hazard: string;
  node: LocalRef;
  criticalLimit: (string | {
    [key: string]: unknown;
  });
  /** Machine-checkable form of the critical limit. */
  limit?: ConditionOrCheck;
  monitoring: string[];
  corrective: string;
  /** Executor must log readings to the session record. */
  record?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Safety = {
  hazards: Hazard[];
  ccps?: CCP[];
  allergens: {
    eu14?: Array<"cereals_gluten" | "crustaceans" | "eggs" | "fish" | "peanuts" | "soybeans" | "milk" | "nuts" | "celery" | "mustard" | "sesame" | "sulphites" | "lupin" | "molluscs">;
    us9?: Array<"milk" | "eggs" | "fish" | "crustacean_shellfish" | "tree_nuts" | "peanuts" | "wheat" | "soybeans" | "sesame">;
    mayContain?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  dietary?: Array<{
    claim: "halal" | "kosher" | "vegetarian" | "vegan" | "gluten_free" | "dairy_free" | "nut_free" | "low_sodium" | "diabetic_friendly" | "pregnancy_safe" | "infant_safe";
    basis: "ingredients" | "certified";
    ruleset?: string;
    certificate?: string;
    note?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  supervision: {
    default: "unattended_ok" | "presence_required" | "hands_on_required";
    reasons?: {
      [key: string]: string;
    };
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  abort: {
    steps: Array<"heat_off" | "lid_on" | "vent_on" | "move_pan_to_cool_zone_if_capable" | "retract_arm" | "stop_motion" | "unlock_doors" | "alert_user" | "alert_emergency_contact" | "call_emergency_services_if_fire">;
    /** Nodes during which the executor must not leave the cooking zone unattended. */
    neverLeave?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  environment?: {
    ventilation?: "none" | "recommended" | "required";
    openFlame?: boolean;
    /** Lets smoke alarms/hubs distinguish expected searing smoke from fire (never disables alarms). */
    smokeExpected?: boolean;
    childrenPetsKeepAway?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Derived summary for fast capability matching. */
export type Requirements = {
  ops?: string[];
  equipment?: string[];
  sensors?: string[];
  maxTempC?: number;
  minHumanSkill?: "none" | "basic" | "intermediate" | "advanced";
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Nutrition = {
  perServing?: {
    kcal?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    fiber?: number;
    sugar?: number;
    sodiumMg?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  basis?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Cost = {
  currency?: string;
  priceYear?: number;
  region?: string;
  total?: number;
  buckets?: {
    [key: string]: number;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Storage = {
  fridgeDays?: number;
  freezerDays?: number;
  reheat?: {
    minCoreC?: number;
    method?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** If true, leftover cooling is a CCP (see policy packs). */
  coolingRequired?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Text = {
  title?: string;
  intro?: string;
  culturalNotes?: string;
  /** Node id → human instruction. */
  steps?: {
    [key: string]: string;
  };
  tips?: string[];
  /** Original human steps in order, as published on the source site. */
  legacySteps?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A named state of an ingredient or intermediate, checkable by sensors, vision or a human. Used as node pre/post conditions (planning) and as checkpoints. */
export type FoodState = {
  /** Ingredient ref or intermediate output. */
  of?: string;
  /** e.g. diced_10mm, translucent, golden, reduced_30pct, al_dente, set, rested, cooled_below_5C. */
  state?: string;
  checks?: ConditionOrCheck[];
  /** Reference images/clips/sounds of this state for vision/audio models. */
  reference?: string[];
  description?: LangMap;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type SensoryTarget = {
  /** Node id or 'final'. */
  stage?: string;
  color?: string;
  texture?: string;
  aroma?: string;
  sound?: string;
  taste?: {
    salt?: number;
    sour?: number;
    sweet?: number;
    bitter?: number;
    umami?: number;
    heat?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  servingTempC?: Range;
  description?: LangMap;
  references?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A recipe a machine can plan, check against local policy, execute and verify. Media type application/vnd.cookwala+json; file extension .cookwala.json. Layers: L0 semantics (dish, yield, ingredients, equipment, nutrition, cost, text), L1 process graph, L2 bindings, L3 safety. L4 policies live in policy.schema.json documents. */
export type Recipe = {
  $schema?: string;
  /** Optional JSON-LD context (https://cookwala.ai/v1/context.jsonld) mapping Cookwala terms to schema.org, FoodOn, Wikidata and IEEE 1872.1. */
  "@context"?: unknown;
  cookwala: SpecVersion;
  /** Same as the site recipe id (e.g. fah-234, w-ma-001). */
  id: string;
  revision: number;
  updated?: string;
  hash?: Hash;
  signature?: Signature;
  /** Links back to the existing fifi.cooking representations. */
  legacy?: {
    /** /data/recipes/{id}.json */
    dataUrl?: string;
    pageUrl?: string;
    /** URL of the schema.org Recipe JSON-LD. */
    schemaOrg?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  verification: Verification;
  dish: Dish;
  yield: Yield;
  ingredients: Ingredient[];
  equipment: Equipment[];
  process: Process;
  safety: Safety;
  requires?: Requirements;
  nutrition?: Nutrition;
  cost?: Cost;
  storage?: Storage;
  /** Human-readable text per language. Machines must not rely on it for control. */
  text: {
    [key: string]: Text;
  };
  /** Optional device-class hints, keyed by x-<namespace>. Unknown keys must be ignored. */
  bindings?: {
    [key: string]: unknown;
  };
  source?: {
    name: string;
    url: string;
    citation?: string;
    collection?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** SPDX id, e.g. CC-BY-4.0. */
  license: string;
  /** Other languages are served as sidecar files to keep the core document small: {"languages": [...], "url": "/v1/recipes/{id}/text/{lang}.json"}. Each sidecar validates against #/$defs/Text. */
  textSidecars?: {
    languages?: string[];
    url?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  meta?: Meta;
  /** What makes this dish itself: elements that must not change (or it becomes another dish) vs elements that may flex. Planners and substitution engines must keep the essentials. */
  identity?: {
    /** Ingredient refs, ops or states that define the dish (e.g. eggs poached in spiced tomato-pepper sauce). */
    essential?: string[];
    flexible?: string[];
    /** Additions that break authenticity or the dish's dietary character. */
    neverAdd?: string[];
    /** Related dishes/variants (for repurposing and suggestions). */
    family?: string[];
    culturalNotes?: LangMap;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Sensory targets per stage and for the finished dish. */
  sensory?: SensoryTarget[];
  /** Scalable proportions: quantities as ratios to a base, with role and flex range. Lets planners scale, ration, budget and substitute without breaking the dish. */
  formula?: {
    /** Ingredient ref used as 1.0 (e.g. tomato). */
    base?: string;
    ratios?: Array<{
      ref: string;
      ratio: number;
      min?: number;
      max?: number;
      role?: string;
      scaling?: "linear" | "sublinear" | "fixed" | "to_taste";
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Base-ingredient grams per serving at reference portion. */
    perServing?: {
      baseG?: number;
      cookedG?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Mise en place for the environment: what must be true or done before cooking starts (tools found and clean, surfaces cleared, space, ingredients staged, pre-tasks like soaking). */
  prep?: {
    tools?: Array<{
      ref?: string;
      clean?: boolean;
      dry?: boolean;
      /** Zone, e.g. counter-left. */
      stageAt?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    surfaces?: Array<{
      zone?: string;
      clearAreaCm2?: number;
      sanitized?: boolean;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    stageIngredients?: boolean;
    /** Soak, thaw, marinate, preheat: scheduled ahead by planners. */
    advanceTasks?: Array<{
      task?: string;
      lead?: Duration;
      node?: Node;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** e.g. sink, hob, counter-left (planner adds tidy/wash/dry tasks if occupied). */
    clearFirst?: string[];
    estimatedPrepTime?: Duration;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** How the dish is served and eaten. */
  service?: {
    servingTempC?: Range;
    maxHoldBeforeServe?: Duration;
    plating?: LangMap;
    /** Serving vessel classes (shared pan, bowl, plate, lunchbox). */
    vessel?: string[];
    accompaniments?: Array<{
      item?: string;
      recipeId?: GlobalRef;
      optional?: boolean;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** e.g. spoon, bread for scooping, fork, chopsticks. */
    tableware?: string[];
    eatingStyle?: Array<"utensils" | "by_hand" | "bread_scoop" | "chopsticks" | "shared_platter" | "individual">;
    portioning?: {
      unit?: string;
      divisible?: boolean;
      perPersonMin?: number;
      perPersonMax?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    packable?: {
      lunchbox?: boolean;
      travelMax?: Duration;
      notes?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Final acceptance checks (the recipe's 'tests'): the dish is done and right when these hold. */
  acceptance?: FoodState[];
  /** Which knowledge layers this document carries (WHO-SMART-style): R1 narrative, R2 dish spec, R3 executable IR. R4 bound plans live in Missions. */
  layers?: {
    r1?: boolean;
    r2?: boolean;
    r3?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
