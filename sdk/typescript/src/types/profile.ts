// Generated from profile.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Profiles and Operating Modes

import type { DinerGroup } from "./advice";
import type { Capabilities } from "./capabilities";
import type { Duration, GlobalRef, Money, Range, VocabId } from "./common";
import type { RationStandard } from "./relief";

export type BatteryState = {
  actorId?: string;
  /** Coarse level; planners map it to work they may assign. */
  level?: "full" | "high" | "medium" | "low" | "critical";
  pct?: number;
  remainingWh?: number;
  charging?: boolean;
  chargeW?: number;
  /** Never plan below this (needed to reach the dock and stay safe). */
  minReservePct?: number;
  canDockMidSession?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type EnergySource = {
  source: "electric_induction" | "electric_resistive" | "natural_gas" | "propane" | "charcoal" | "wood" | "solar_cooker" | "battery";
  appliances?: string[];
  available?: boolean;
  maxW?: number;
  /** Heat-to-pot efficiency if known; otherwise the reasoner uses knowledge/energy.json defaults. */
  efficiency?: number;
  price?: {
    perKWh?: Money;
    perMJ?: Money;
    timeOfUse?: Array<{
      from?: string;
      to?: string;
      perKWh?: Money;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  co2eKgPerKWh?: number;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** How to cook right now. Set per hub, per session, or per request; the most specific wins. Planners turn it into objective weights and hard limits. */
export type OperatingMode = {
  /** A named bundle of the settings below; explicit fields override the preset. */
  preset?: "normal" | "eco" | "budget" | "fast" | "quiet" | "off_grid" | "week_saver" | "feast" | "outage" | "battery_saver" | "relief";
  energy?: {
    sources?: EnergySource[];
    /** Preferred sources in order, e.g. ["electric_induction", "natural_gas"]. */
    prefer?: string[];
    avoid?: string[];
    goal?: "normal" | "min_energy" | "min_cost" | "min_carbon" | "off_grid";
    /** Household breaker / generator / solar-inverter limit across simultaneous appliances. */
    peakLimitW?: number;
    budgetKWh?: number;
    gridOutage?: boolean;
    gasAvailable?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  robots?: BatteryState[];
  conserve?: {
    energy?: "off" | "some" | "max";
    water?: "off" | "some" | "max";
    /** Fewer pots and tools. */
    cleanup?: "off" | "some" | "max";
    /** Make what's on hand last. */
    ingredients?: {
      /** e.g. P7D to make inventory last a week. */
      horizon?: Duration;
      strategy?: "normal" | "ration" | "stretch" | "use_expiring_first" | "no_waste";
      /** Ingredient ids to keep for later in the horizon. */
      protect?: string[];
      mealsPerDay?: number;
      minKcalPerPersonDay?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  budget?: {
    mode?: "very_low" | "low" | "moderate" | "open";
    amount?: Money;
    period?: "meal" | "day" | "week" | "month" | "event";
    includeEnergyCost?: boolean;
    allowShopping?: boolean;
    preferPantry?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  time?: "fastest" | "balanced" | "relaxed";
  quality?: "best" | "balanced" | "economy";
  noise?: "any" | "quiet";
  /** Advanced: explicit objective weights (0..1) when presets aren't enough. */
  weights?: {
    time?: number;
    cost?: number;
    energy?: number;
    carbon?: number;
    battery?: number;
    waste?: number;
    quality?: number;
    humanEffort?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Mass-feeding / no-ability-to-pay mode: maximize people fed per resource while meeting ration standards and safety. */
  relief?: {
    program?: string;
    ration?: RationStandard;
    objective?: "max_people_fed" | "max_nutrition_per_cost" | "min_waste" | "equity_first";
    /** Plan for no robots/appliances: guided human steps, fuel-efficient methods, minimal water. */
    lowTech?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Kind-specific fields; the profile root (which applies this through allOf) rejects unknown fields. */
export type ClientProfile = {
  diners?: DinerGroup[];
  preferences?: {
    cuisines?: string[];
    dislikes?: string[];
    spice?: "none" | "mild" | "medium" | "hot";
    portion?: "small" | "normal" | "large";
    favorites?: GlobalRef[];
    sourcing?: {
      organic?: "no_preference" | "prefer" | "require";
      local?: "no_preference" | "prefer" | "require";
      seasonal?: boolean;
      /** Required verified credentials, e.g. organic, halal_certified. */
      certifications?: string[];
      /** Max extra cost accepted for preferred sourcing. */
      maxPremiumPct?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  dietary?: string[];
  allergies?: string[];
  policyPacks?: string[];
  defaultMode?: OperatingMode;
  schedule?: {
    mealTimes?: {
      [key: string]: string;
    };
    fasting?: Array<{
      name?: string;
      from?: string;
      to?: string;
      rule?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  locale?: {
    lang?: string;
    country?: string;
    units?: "metric" | "us" | "imperial";
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  consent?: {
    shareReports?: boolean;
    shareMedia?: boolean;
    useCloudAdvice?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Per-person nutrition profiles (sensitive, local-only). */
  members?: PersonNutrition[];
};

/** Kind-specific fields; the profile root (which applies this through allOf) rejects unknown fields. */
export type KitchenProfile = {
  energy?: EnergySource[];
  appliances?: string[];
  zones?: Array<{
    id?: string;
    kind?: string;
    areaCm2?: number;
    reachableBy?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  storage?: {
    fridgeL?: number;
    freezerL?: number;
    pantryL?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  altitudeM?: number;
  water?: {
    potable?: boolean;
    hardness?: "soft" | "medium" | "hard";
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  ventilation?: "none" | "window" | "hood" | "commercial";
  accessibility?: string[];
};

export type CookwareItem = {
  id: string;
  class: VocabId;
  name?: string;
  count?: number;
  capacityMl?: number;
  diameterMm?: number;
  depthMm?: number;
  material?: "stainless" | "cast_iron" | "carbon_steel" | "aluminium" | "copper" | "nonstick" | "enamel" | "ceramic" | "glass" | "clay" | "silicone" | "plastic" | "wood" | "other";
  lid?: boolean;
  inductionCompatible?: boolean;
  ovenSafeMaxC?: number;
  microwaveSafe?: boolean;
  freezerSafe?: boolean;
  airtight?: boolean;
  foodGrade?: boolean;
  dishwasherSafe?: boolean;
  /** Affects robot grasping. */
  handle?: "long" | "two_loop" | "none" | "robot_adapter";
  massKg?: number;
  location?: string;
  /** e.g. halal_only, allergen_free (cross-contact control). */
  dietaryDedicated?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Kind-specific fields; the profile root (which applies this through allOf) rejects unknown fields. */
export type CookwareProfile = {
  items: CookwareItem[];
};

/** Kind-specific fields; the profile root (which applies this through allOf) rejects unknown fields. */
export type RobotProfile = {
  /** Inline manifest or URL. */
  capabilities?: (string | Capabilities);
  battery?: {
    capacityWh?: number;
    chargeW?: number;
    /** Typical draw by activity, e.g. {"idle": 40, "walk": 250, "stir": 120, "lift": 300}. */
    drawW?: {
      [key: string]: number;
    };
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  home?: {
    dock?: string;
    zones?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  maintenance?: {
    lastCleaned?: string;
    foodContactParts?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
};

/** Kind-specific fields; the profile root (which applies this through allOf) rejects unknown fields. */
export type OrganizationProfile = {
  type?: "household" | "restaurant" | "cloud_kitchen" | "school" | "hospital" | "care_home" | "charity_kitchen" | "caterer" | "military" | "disaster_relief" | "other" | "food_bank" | "humanitarian_org" | "community_kitchen" | "school_feeding_program" | "government_agency";
  licenses?: string[];
  policyPacks?: string[];
  /** Catalogs this organization publishes or trusts. */
  catalogs?: string[];
};

/** Daily targets for one person. Computed by the nutrition engine from the person's data and reference values, or set by a clinician (clinician values always win). */
export type NutritionTargets = {
  kcal?: Range;
  proteinG?: Range;
  carbsG?: Range;
  fatG?: Range;
  fiberGMin?: number;
  sodiumMgMax?: number;
  freeSugarsGMax?: number;
  satFatGMax?: number;
  potassiumMg?: Range;
  phosphorusMgMax?: number;
  /** e.g. carbohydrate budgeting for diabetes, if set by a clinician. */
  carbsPerMealGMax?: number;
  /** e.g. iron_mg, calcium_mg, vitamin_d_ug, folate_ug. */
  micronutrients?: {
    [key: string]: Range;
  };
  source?: "computed" | "clinician" | "program_standard" | "user_set";
  /** References used, e.g. mifflin_st_jeor, who_sodium_2023, dri_tables. */
  basis?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** One person's health and nutrition data. Always sensitive and local-only; never sent to an index or a provider. Cookwala is not a medical service: for medical diets, targets should come from a clinician. */
export type PersonNutrition = {
  id: string;
  /** Display name chosen by the household (e.g. 'Grandpa'). */
  alias?: string;
  ageYears?: number;
  /** Biological sex used only for reference-value equations; 'unspecified' uses averaged values. */
  sex?: "female" | "male" | "unspecified";
  heightCm?: number;
  weightKg?: number;
  activity?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  lifeStage?: Array<"infant" | "child" | "adolescent" | "adult" | "older_adult" | "pregnant_t1" | "pregnant_t2" | "pregnant_t3" | "lactating">;
  goals?: Array<"maintain" | "lose_weight" | "gain_weight" | "build_muscle" | "lower_sodium" | "lower_sugar" | "more_fiber" | "heart_health" | "gut_health" | "athletic">;
  /** e.g. type2_diabetes, hypertension, ckd_stage3, celiac, ibs_low_fodmap, gout, anemia (filters and clinician-set targets only). */
  conditions?: string[];
  allergies?: string[];
  intolerances?: string[];
  dietary?: string[];
  iddsiLevel?: number;
  /** Food-drug interaction flags set by a clinician (e.g. vitamin_k_consistent for warfarin, grapefruit_avoid). */
  medicationsInteractions?: string[];
  targets?: NutritionTargets;
  clinician?: {
    name?: string;
    reviewedAt?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  appetite?: "light" | "normal" | "hearty";
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Setup information about everything in the cooking lifecycle (clients/households, diners, kitchens, cookware, robots, organizations) and the Operating Mode that tells planners and advisors how to trade off energy, battery, ingredients, budget, time and quality. Profiles are owned by whoever creates them and can be private (local only), shared, or public, hosted in any catalog. Fields marked sensitive must never leave the owner's hub. */
export type Profile = (unknown & unknown & unknown & unknown & unknown & unknown);
