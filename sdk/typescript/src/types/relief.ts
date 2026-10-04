// Generated from relief.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Relief (feeding programs, needs, pledges, allocations, impact)

import type { ProductionPlan } from "./advice";
import type { DateTime, Meta, Money, Quantity, Range, SpecVersion } from "./common";

/** Humanitarian Exchange Language tag, e.g. #adm1+name, #affected+f+children. */
export type Hxl = string;

export type Place = {
  country?: string;
  admin1?: string;
  admin2?: string;
  /** OCHA place code when available. */
  pcode?: string;
  /** Camp, school, kitchen or distribution point id. */
  site?: string;
  lat?: number;
  lon?: number;
  radiusKm?: number;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Nutrition and ration rules for a program. Defaults follow widely used humanitarian minimums (e.g. Sphere: about 2,100 kcal per person per day for general food rations); programs set their own. */
export type RationStandard = {
  kcalPerPersonDay?: number;
  proteinPctEnergy?: Range;
  fatPctEnergy?: Range;
  /** e.g. iron, vitamin_a, iodine (fortified foods). */
  micronutrients?: string[];
  groups?: Array<{
    group?: "infant_6_23m" | "child" | "adolescent" | "adult" | "pregnant_lactating" | "elderly" | "malnourished_mam" | "malnourished_sam";
    kcalPerDay?: number;
    notes?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** e.g. sphere-2018, wfp-school-meals, national guideline id. */
  standardRef?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Program = {
  cookwala: SpecVersion;
  id: string;
  name: string;
  /** Provider id of the organization running it. */
  operator: string;
  partners?: string[];
  type: "emergency_relief" | "school_meals" | "community_kitchen" | "food_bank" | "soup_kitchen" | "elderly_meals" | "refugee_camp" | "disaster_response" | "surplus_rescue" | "pay_it_forward" | "other";
  area: Place[];
  period?: {
    from?: string;
    to?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  rations?: RationStandard;
  /** Food safety + dietary (e.g. dietary.halal) + humanitarian.sphere. */
  policyPacks?: string[];
  /** Hub/catalog URLs of participating kitchens. */
  kitchens?: string[];
  /** Recipe catalogs used: local, culturally appropriate, from local ingredients. */
  catalogs?: string[];
  accepts?: Array<"food" | "surplus_food" | "cooked_meals" | "kitchen_capacity" | "robot_capacity" | "transport" | "volunteers" | "cold_storage" | "funds" | "fuel" | "equipment">;
  contact?: string;
  transparency?: {
    impactFeed?: string;
    /** IATI activity identifier when reporting aid flows. */
    iati?: string;
    hdx?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Aggregated demand at a place and time. No names, no individual data. */
export type Need = {
  cookwala: SpecVersion;
  id: string;
  program: string;
  place: Place;
  window: {
    from: DateTime;
    to: DateTime;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  people: number;
  groups?: Array<{
    group?: string;
    count?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  mealsPerDay?: number;
  form?: "hot_meals" | "packed_meals" | "dry_rations" | "mixed";
  dietary?: string[];
  allergensToAvoid?: string[];
  /** Cooking/serving constraints at the site: no fuel, no water, no refrigeration, no utensils, access window. */
  constraints?: {
    [key: string]: unknown;
  };
  /** Set by the program using its own vulnerability criteria. */
  priority?: "critical" | "high" | "normal";
  status?: "open" | "partially_covered" | "covered" | "closed";
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Something a participant commits to give: food, surplus, cooking or robot capacity, transport, cold storage, volunteers, fuel, equipment or funds expressed as meals. */
export type Pledge = {
  cookwala: SpecVersion;
  id: string;
  /** Provider id (grocer, restaurant, farm, donor, robot operator, kitchen...). */
  from: string;
  kind: "food" | "surplus_food" | "cooked_meals" | "kitchen_capacity" | "robot_capacity" | "transport" | "cold_storage" | "volunteers" | "funds" | "fuel" | "equipment";
  items?: Array<{
    ingredientId?: string;
    recipeId?: string;
    qty?: Quantity;
    servings?: number;
    useBy?: DateTime;
    storage?: "ambient" | "chilled" | "frozen" | "hot_held";
    dietary?: string[];
    allergens?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** For kitchen/robot/transport/storage/volunteer pledges. */
  capacity?: {
    mealsPerHour?: number;
    hours?: string[];
    kitchen?: string;
    vehicles?: number;
    coldStorageL?: number;
    people?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  funds?: {
    /** Funds expressed as number of meals sponsored. */
    meals?: number;
    amount?: Money;
    /** The program's own donation channel; Cookwala never handles payments. */
    channel?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  available: {
    from: DateTime;
    to: DateTime;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  place?: Place;
  conditions?: string[];
  /** Required for surplus/cooked food: when cooked, how held, temperatures logged. */
  foodSafety?: {
    cookedAt?: DateTime;
    holding?: string;
    tempLog?: string;
    ccpRecords?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  anonymous?: boolean;
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** The allocator's plan for covering a need from pledges: which supply goes to which kitchen, what gets cooked (production plans), how it moves, and what remains uncovered. */
export type Allocation = {
  cookwala: SpecVersion;
  id: string;
  need: string;
  assignments: Array<{
    pledge?: string;
    to?: string;
    items?: unknown[];
    pickupAt?: DateTime;
    deliverBy?: DateTime;
    transport?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  production?: ProductionPlan[];
  coverage?: {
    meals?: number;
    kcalPerPersonDay?: number;
    pct?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  gaps?: Array<{
    what?: string;
    qty?: number;
    unit?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  solver?: {
    name?: string;
    status?: string;
    objective?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  approvedBy?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Open, aggregated impact data. No personal data. */
export type ImpactReport = {
  cookwala: SpecVersion;
  program: string;
  place?: Place;
  period: {
    from?: string;
    to?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  meals: number;
  peopleReached?: number;
  kcalPerPersonDayAvg?: number;
  costPerMeal?: Money;
  surplusRescuedKg?: number;
  wasteKg?: number;
  energyKWhPerMeal?: number;
  /** Share of cooking steps performed by robots. */
  robotShare?: number;
  foodSafetyIncidents?: number;
  gapsUnmet?: number;
  /** Field → HXL tag mapping for export. */
  hxl?: {
    [key: string]: Hxl;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
