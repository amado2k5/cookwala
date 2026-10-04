// Generated from advice.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Advice (reasoning requests and responses)

import type { Capabilities } from "./capabilities";
import type { Condition, DateTime, Duration, GlobalRef, Hash, LangMap, Money, Quantity, Range, SpecVersion, VocabId } from "./common";
import type { Inventory } from "./inventory";
import type { Order } from "./order";
import type { OperatingMode, PersonNutrition } from "./profile";
import type { Ingredient, Node } from "./recipe";
import type { Allocation } from "./relief";

export type Intent = "ask" | "cook_from" | "substitute" | "recover" | "repurpose" | "adapt_equipment" | "team_plan" | "store" | "feed" | "rescale" | "retime" | "leftovers" | "diagnose" | "texture_modify" | "diet_merge" | "nutrition_target" | "shopping_optimize" | "custom" | "relief_allocate" | "personalize";

export type IngredientInput = (unknown | unknown);

export type DinerGroup = {
  count: number;
  ageGroup?: "infant" | "child" | "teen" | "adult" | "senior";
  allergies?: string[];
  dietary?: string[];
  /** IDDSI texture level for swallowing needs. */
  iddsiLevel?: number;
  appetite?: "light" | "normal" | "hearty";
  /** e.g. low_sodium, diabetic, renal (used only for filtering, never stored). */
  medical?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Constraints = {
  serveAt?: DateTime;
  startEarliest?: DateTime;
  timeAvailable?: Duration;
  maxActiveTime?: Duration;
  budget?: Money;
  cuisines?: string[];
  courses?: string[];
  dietary?: string[];
  excludeAllergens?: string[];
  avoidIngredients?: string[];
  /** Inventory item ids or ingredient ids to prioritise (expiring). */
  useFirst?: string[];
  equipmentUnavailable?: string[];
  skill?: "none" | "basic" | "intermediate" | "advanced";
  authenticity?: "strict" | "flexible" | "creative";
  minLevel?: "V0" | "V1" | "V2" | "V3";
  supervision?: "unattended" | "presence" | "hands_on";
  nutrition?: {
    kcalPerServing?: Range;
    proteinGMin?: number;
    sodiumMgMax?: number;
    sugarGMax?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  energy?: "any" | "low" | "no_oven" | "no_power";
  noise?: "any" | "quiet";
  minimizeWaste?: boolean;
  /** Longest acceptable time between done and served. */
  holdMax?: Duration;
  servingStyle?: "plated" | "family" | "buffet" | "packed" | "delivery";
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** What the asker knows about its kitchen. A hub fills this automatically; robots asking the index directly send what they have. */
export type Context = {
  kitchenId?: string;
  lang?: string;
  country?: string;
  /** Affects boiling point, baking and pressure-cooking times. */
  altitudeM?: number;
  policyPacks?: string[];
  inventory?: Inventory;
  actors?: Capabilities[];
  humansAvailable?: number;
  session?: {
    sessionId?: string;
    recipeId?: string;
    revision?: number;
    nodeId?: string;
    taskId?: string;
    completedNodes?: string[];
    telemetry?: {
      [key: string]: unknown;
    };
    startedAt?: DateTime;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  diners?: DinerGroup[];
  constraints?: Constraints;
  mode?: OperatingMode;
  /** Client, kitchen, cookware, robot and organization profiles to apply (resolved by the hub; private profiles never leave it). */
  profiles?: GlobalRef[];
  /** Recipe catalogs to search, in priority order (public, private, local). */
  catalogs?: string[];
  /** Extension ids to apply to this request (filters, rankers, advisors). */
  extensions?: string[];
  /** Only when asking a local hub/advisor; the public index rejects requests containing person data. */
  members?: PersonNutrition[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Incident = {
  /** From vocab/incidents (cw.incident.*), e.g. cw.incident.too_salty, cw.incident.scorched_bottom, cw.incident.emulsion_broke, cw.incident.time_temp_abuse. */
  type: VocabId;
  description?: string;
  recipeId?: string;
  nodeId?: string;
  ingredientRef?: string;
  /** Measurements and cues, e.g. {"saltAddedG": 20, "saltExpectedG": 8, "minutesBetween5and57C": 150, "coreTempC": 48, "smell": "acrid", "visual": ["black_flecks"]}. */
  observations?: {
    [key: string]: unknown;
  };
  noticedAt?: DateTime;
  elapsedSince?: Duration;
  servedAlready?: boolean;
  /** Local references to photos/frames (kept local unless the user opts in). */
  media?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Intent-specific parameters. See the per-intent definitions below. */
export type Query = {
  [key: string]: unknown;
};

export type CookFromQuery = {
  ingredients: IngredientInput[];
  useInventory?: boolean;
  /** Assume salt, pepper, oil, water, common spices. */
  pantryStaplesAssumed?: boolean;
  allowMissing?: number;
  allowSubstitutions?: boolean;
  allowShopping?: boolean;
  servings?: number;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type SubstituteQuery = {
  recipeId: string;
  ingredientRef?: string;
  equipmentRef?: string;
  reason?: "missing" | "allergy" | "dietary" | "cost" | "preference" | "spoiled" | "not_enough";
  qtyAvailable?: Quantity;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type RecoverQuery = {
  incident: Incident;
  goal?: "save_this_dish" | "any_good_meal" | "safest" | "fastest";
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type RepurposeQuery = {
  intermediate: {
    fromRecipeId?: string;
    fromNodeId?: string;
    description?: string;
    ingredients?: IngredientInput[];
    /** e.g. {"cooked": true, "texture": "mushy", "flavorIssues": ["too_salty"]}. */
    state?: {
      [key: string]: unknown;
    };
    qty?: Quantity;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  incident?: Incident;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type AdaptEquipmentQuery = {
  recipeId: string;
  missingEquipment: string[];
  availableEquipment?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type TeamPlanQuery = {
  recipes: Array<{
    recipeId: string;
    servings?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Actor id of the robot asking (it gets the coordinator role if no hub). */
  requester?: string;
  /** Actor ids that offered help (from cookwala.team.bid). */
  helpers?: string[];
  objective?: "on_time" | "min_makespan" | "min_hold" | "min_energy" | "balanced" | "min_human_work";
  /** Split divisible work (chopping 2 kg onions) across actors. */
  allowSplitTasks?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type StoreQuery = (unknown | unknown);

export type FeedQuery = {
  people: number;
  /** Number of meals to cover (e.g. 9 for three days × three meals). */
  meals?: number;
  mealTypes?: Array<"breakfast" | "lunch" | "dinner" | "snack" | "iftar" | "suhoor">;
  /** Variety per meal. */
  dishCount?: number;
  /** Plan make-ahead + storage for later meals. */
  includeStorage?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type RescaleQuery = {
  recipeId: string;
  targetServings?: number;
  targetMass?: Quantity;
  /** Scale to what I have of this. */
  limitingIngredient?: IngredientInput;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type RetimeQuery = {
  sessionId?: string;
  newServeAt?: DateTime;
  runningLate?: Duration;
  guestsLate?: Duration;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type DiagnoseQuery = {
  sessionId?: string;
  taskId?: string;
  anomalies: Array<{
    sensor?: string;
    expected?: unknown;
    observed?: unknown;
    since?: Duration;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type AdviceRequest = (unknown & unknown & unknown & unknown & unknown & unknown & unknown & unknown & unknown & unknown & unknown & unknown & unknown & unknown & unknown);

export type SafetyVerdict = {
  verdict: "safe" | "safe_with_conditions" | "unsafe_discard" | "unknown_ask_human" | "not_applicable";
  reasons?: string[];
  /** Policy-pack rule ids and knowledge ids (e.g. cw.safety.tcs_4h, us.fda-food-code-2022/3-501.19). */
  rulesApplied?: string[];
  conditions?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** One semantic change. In knowledge playbooks, string values may contain {placeholders} (e.g. {nodeId}, {salt_ratio}) that the reasoner resolves from the incident, answers and recipe. */
export type PatchOp = {
  op: "add_node" | "replace_node" | "remove_node" | "insert_before" | "insert_after" | "update_params" | "set_until" | "add_ingredient" | "scale_ingredient" | "replace_ingredient" | "remove_ingredient" | "scale_all" | "split_batch" | "merge_batches" | "discard_output" | "add_hazard" | "add_ccp" | "set_supervision" | "note";
  /** Node id, ingredient ref or intermediate ref. */
  target?: string;
  node?: Node;
  ingredient?: Ingredient;
  params?: {
    [key: string]: unknown;
  };
  factor?: (number | string);
  until?: Condition;
  text?: LangMap;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A semantic, validated change to a recipe's process graph (not raw JSON Patch), applied by the hub to the running session. */
export type RecipePatch = {
  base: {
    recipeId: string;
    revision?: number;
    hash?: Hash;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  ops: PatchOp[];
  /** Node id to continue from after the patch. */
  resumeAt?: string;
  /** Completed nodes whose outputs are invalidated and must be redone. */
  redo?: string[];
  /** Patched graph passed schema + semantic validation + policy. */
  validated?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type PlannedTask = {
  /** recipeId#nodeId, or recipeId#nodeId/part-k for split tasks. */
  ref: string;
  op?: string;
  /** Offset from plan start. */
  start: Duration;
  end: Duration;
  resources?: string[];
  handoffTo?: string;
  attention?: string;
  instructions?: LangMap;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type TeamPlan = {
  assignments: Array<{
    actorId: string;
    role?: string;
    tasks: PlannedTask[];
    utilization?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  makespan: Duration;
  startAt?: DateTime;
  serveAt?: DateTime;
  criticalPath?: string[];
  handoffs?: Array<{
    from?: string;
    to?: string;
    item?: string;
    at?: Duration;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  leases?: Array<{
    resource?: string;
    holder?: string;
    from?: string;
    until?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  humanTasks?: string[];
  slack?: Duration;
  solver?: {
    name?: string;
    status?: "optimal" | "feasible" | "infeasible" | "timeout";
    objective?: string;
    seconds?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  assumptions?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type StoragePlan = {
  feasible: boolean;
  method?: "fridge" | "freezer" | "fridge_then_freezer" | "freezer_then_fridge_thaw" | "pantry_shelf_stable" | "hot_hold" | "not_storable";
  keepsFor?: Duration;
  qualityBestWithin?: Duration;
  cooling?: {
    method?: string;
    maxDepthCm?: number;
    stages?: Array<{
      fromC?: number;
      toC?: number;
      within?: Duration;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  portioning?: {
    portions?: number;
    massPerPortionG?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  containers?: Array<{
    type?: string;
    material?: string;
    sizeMl?: number;
    count?: number;
    fillMaxPct?: number;
    headspaceMm?: number;
    airtight?: boolean;
    freezerSafe?: boolean;
    microwaveSafe?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Store apart (sauce, crispy toppings, dressing, garnish). */
  separateComponents?: string[];
  /** Changes when cooking specifically for storage (undercook pasta, hold back garnish...). */
  cookForStorage?: RecipePatch;
  /** What to write on the label: name, date cooked, use-by, allergens, reheat instructions. */
  label?: string[];
  thaw?: string;
  reheat?: {
    method?: string;
    minCoreC?: number;
    onlyOnce?: boolean;
    notes?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  discardIf?: string[];
  alternatives?: Array<{
    method?: string;
    keepsFor?: string;
    tradeoffs?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type ProductionPlan = {
  menu?: Array<{
    recipeId?: string;
    servings?: number;
    scale?: number;
    batches?: number;
    meal?: string;
    cookDay?: number;
    serveDay?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  schedule?: TeamPlan;
  shopping?: Order;
  storage?: StoragePlan[];
  equipmentLoad?: Array<{
    resource?: string;
    utilization?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  costTotal?: Money;
  perPerson?: {
    [key: string]: unknown;
  };
  constraintsMet?: string[];
  constraintsRelaxed?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Option = {
  id: string;
  rank?: number;
  kind: "recipe" | "recipe_with_changes" | "patch_and_resume" | "repurpose" | "discard_and_restart" | "discard" | "substitution" | "equipment_adaptation" | "team_plan" | "storage_plan" | "production_plan" | "timing_plan" | "shopping" | "ask_human" | "allocation" | "portion_plan";
  title: LangMap;
  summary?: LangMap;
  recipeIds?: string[];
  patch?: RecipePatch;
  teamPlan?: TeamPlan;
  storagePlan?: StoragePlan;
  productionPlan?: ProductionPlan;
  orderIntent?: Order;
  /** For cook_from: how the recipe matches what's available. */
  coverage?: {
    have?: string[];
    missing?: string[];
    substituted?: Array<{
      from?: string;
      to?: string;
      ratio?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    usesFirst?: string[];
    automation?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  impact?: {
    extraTime?: Duration;
    extraCost?: Money;
    quality?: "better" | "none" | "minor" | "noticeable" | "major";
    servingsChange?: number;
    notes?: LangMap;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  requires?: {
    ingredients?: string[];
    equipment?: string[];
    actors?: string[];
    human?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  safety: SafetyVerdict;
  confidence: number;
  evidence?: Array<{
    kind: "playbook" | "rule" | "recipe" | "simulation" | "solver" | "field_reports" | "llm" | "reference";
    ref: string;
    detail?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  explanation?: LangMap;
  allocation?: Allocation;
  portionPlan?: PortionPlan;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Question = {
  id: string;
  text: LangMap;
  answerType: "boolean" | "number" | "choice" | "text" | "measurement" | "photo";
  choices?: string[];
  /** A robot can answer by measuring this sensor instead of asking a human. */
  sensor?: string;
  why?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type AdviceResponse = {
  cookwala: SpecVersion;
  requestId: string;
  responseId?: string;
  intent: Intent;
  /** For intent=ask: what the question was understood as. */
  resolvedIntent?: Intent;
  resolvedQuery?: Query;
  status: "answered" | "needs_input" | "partial" | "refused" | "unsupported";
  /** Overall verdict. If unsafe_discard, no option may keep the unsafe food. */
  safety: SafetyVerdict;
  options: Option[];
  questions?: Question[];
  warnings?: LangMap[];
  engine?: {
    version?: string;
    components?: string[];
    llm?: {
      used?: boolean;
      model?: string;
      role?: "parse" | "propose" | "explain" | "none";
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    checks?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  generatedAt?: DateTime;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Right amount for each person from a dish or menu, so everyone meets their targets and nothing is wasted. */
export type PortionPlan = {
  recipeId?: string;
  totalCookedG?: number;
  people?: Array<{
    personId: string;
    grams: number;
    /** Grams per component (e.g. rice 120, stew 220). */
    components?: {
      [key: string]: number;
    };
    nutrition?: {
      kcal?: number;
      proteinG?: number;
      carbsG?: number;
      fatG?: number;
      fiberG?: number;
      sodiumMg?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** Share of the person's daily targets covered after this meal (0..1 per nutrient). */
    dayProgress?: {
      [key: string]: number;
    };
    /** e.g. 'serve before adding salt', 'IDDSI 5 minced', 'no sauce'. */
    modifications?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Scale to cook so total portions + planned leftovers are exact. */
  cookQuantityFactor?: number;
  plannedLeftovers?: {
    grams?: number;
    use?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  wasteEstimateG?: number;
  cost?: {
    total?: Money;
    perPerson?: {
      [key: string]: Money;
    };
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type PersonalizeQuery = {
  /** Members of the client profile (resolved locally by the hub). */
  personIds?: string[];
  /** Portion these dishes; omit to get a meal plan. */
  recipeIds?: string[];
  days?: number;
  mealTypes?: string[];
  optimize?: Array<"nutrition_fit" | "cost" | "waste" | "organic" | "local" | "variety" | "prep_time" | "energy">;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
