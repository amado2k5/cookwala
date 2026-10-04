// Generated from humanitarian.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: profile-draft. Cookwala Humanitarian Profile

import type { Signature } from "./common";

/** Humanitarian Profile version. 0.2 is additive over 0.1; readers accept both during the transition. */
export type Version = string;

export type Id = string;

/** An ORGANIZATION, never a person: a did:web domain, a GS1 Global Location Number, or a registry-scoped id. */
export type OrgId = string;

export type Role = "donor" | "food_bank" | "community_kitchen" | "school" | "relief_program" | "transporter" | "cold_storage" | "platform" | "farm" | "caterer" | "robot_kitchen";

/** RFC 3339 with an explicit offset. */
export type DateTime = string;

export type Date = string;

/** Mass in kilograms. The profile uses kg only. */
export type Kg = number;

/** Degrees Celsius. The profile uses Celsius only; displays may convert. */
export type TempC = number;

/** Exact decimal, never a binary float. */
export type Decimal = string;

export type Money = {
  amount: Decimal;
  currency: string;
};

export type Extensions = {
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Operational note. MUST NOT contain names, phone numbers, ids or health details of any person. */
export type Note = string;

/** An organization's premises or an administrative area. Never a household or a person's location. */
export type Site = (Extensions & {
  country: string;
  admin1: string;
  admin2?: string;
  /** OCHA common operational dataset P-code. */
  pcode?: string;
  gln?: string;
  /** Name of the organization's site, e.g. 'North warehouse'. */
  siteName?: string;
  lat?: number;
  lon?: number;
});

export type Storage = "ambient" | "chilled" | "frozen" | "hot_held";

export type DateMark = {
  kind: "use_by" | "best_before" | "cooked_on" | "none";
  date: Date;
};

export type Item = (Extensions & {
  lineId?: string;
  name: string;
  ingredientId?: string;
  gtin?: string;
  kg: Kg;
  units?: number;
  storage: Storage;
  dateMark?: DateMark;
  /** Declared allergens. 'unknown' means unlabelled and triggers rule-pack checks. */
  allergens?: Array<"cereals_gluten" | "crustaceans" | "eggs" | "fish" | "peanuts" | "soybeans" | "milk" | "tree_nuts" | "sesame" | "mustard" | "celery" | "lupin" | "molluscs" | "sulphites" | "unknown">;
  /** Ready-to-eat cooked food (higher risk). */
  cooked?: boolean;
  cookedAt?: DateTime;
  origin?: Origin;
  /** Harvest date for farm produce. */
  harvestedAt?: Date;
  foodClasses?: FoodClass[];
});

export type TempReading = {
  at: DateTime;
  tempC: TempC;
  method: "probe" | "infrared" | "logger" | "fridge_display" | "not_measured";
  lineId?: string;
};

/** Legal transitions are listed in docs/HUMANITARIAN-PROFILE.md section 5; anything else MUST be refused with 409. */
export type OfferState = "offered" | "claimed" | "collected" | "delivered" | "distributed" | "expired" | "withdrawn" | "rejected";

export type RejectReason = "temp_out_of_range" | "past_use_by" | "packaging_damaged" | "allergen_unlabelled" | "quantity_mismatch" | "pests_or_contamination" | "no_capacity" | "no_transport" | "arrived_late" | "other";

/** A donor offers surplus food for collection. */
export type Offer = (Extensions & {
  profile: Version;
  kind: "Offer";
  id: Id;
  donor: OrgId;
  items: Item[];
  window: {
    from: DateTime;
    to: DateTime;
  };
  site: Site;
  /** Storage temperatures at the donor when offered. */
  readings?: TempReading[];
  needs?: Array<"refrigerated_vehicle" | "pallet_jack" | "volunteers" | "same_day">;
  /** Applicable donor-liability law, e.g. 'US Bill Emerson Act'. */
  donationProtection?: string;
  state: OfferState;
  /** Incremented on every change; used with If-Match. */
  version?: number;
  note?: Note;
  /** When the offer was created; with Claim.claimedAt it gives time to claim. */
  createdAt?: DateTime;
});

/** A receiving organization claims all or part of an offer. */
export type Claim = (Extensions & {
  profile: Version;
  kind: "Claim";
  id: Id;
  offer: Id;
  claimant: OrgId;
  claimantRole?: Role;
  lines: Array<{
    lineId: string;
    kg: Kg;
  }>;
  pickupBy: DateTime;
  transporter?: OrgId;
  vehicle?: "refrigerated" | "insulated" | "ambient" | "on_foot_or_bike";
  note?: Note;
  claimedAt?: DateTime;
});

/** A custody transfer with a cold-chain check. One per leg (donor → transporter → food bank → kitchen). */
export type Handover = (Extensions & {
  profile: Version;
  kind: "Handover";
  id: Id;
  offer: Id;
  claim?: Id;
  from: OrgId;
  to: OrgId;
  at: DateTime;
  site?: Site;
  readings: TempReading[];
  lines: Array<{
    lineId: string;
    kgAccepted: Kg;
    kgRejected?: Kg;
    reason?: RejectReason;
  }>;
  outcome: "accepted" | "partly_accepted" | "rejected";
  /** A role, never a name. */
  checkedBy?: "trained_staff" | "volunteer" | "driver" | "automated_logger";
  /** Id@version of the rule pack applied. */
  rulePack?: string;
  /** Ids of rules that warned or blocked. */
  findings?: string[];
  note?: Note;
  /** 1 for the first custody transfer from the donor; kilograms rescued are counted on leg 1 only. */
  leg?: number;
  /** Who the receiving program serves, so care rules apply at handover. */
  audienceGroups?: AudienceGroup[];
});

/** AGGREGATE record of food served or handed out at a site on a day. No individual or household records exist in this profile. */
export type Distribution = (Extensions & {
  profile: Version;
  kind: "Distribution";
  id: Id;
  org: OrgId;
  orgRole?: Role;
  site: Site;
  date: Date;
  form?: "hot_meals" | "food_parcels" | "school_meals" | "mixed";
  meals: number;
  /** Counts by HXL-style groups. Any group under 10 MUST be reported as the string '<10' (small-cell suppression). */
  people?: {
    total?: Count;
    children?: Count;
    adults?: Count;
    elderly?: Count;
    female?: Count;
    male?: Count;
  };
  kgUsed?: Kg;
  kgRescuedUsed?: Kg;
  offers?: Id[];
  menu?: {
    recipes?: string[];
    perPersonDay?: Nutrients;
    perMeal?: Nutrients;
    /** Food classes present in the menu, for food_class rules. */
    foodClasses?: FoodClass[];
  };
  cost?: {
    food?: Money;
    transport?: Money;
    staff?: Money;
    energy?: Money;
  };
  volunteerMinutes?: number;
  rulePack?: string;
  findings?: string[];
  /** Suspected foodborne illness reports or recalls linked to this distribution (counts only). */
  safetyIncidents?: number;
  note?: Note;
  /** Who the distribution serves, so care rules apply. */
  audienceGroups?: AudienceGroup[];
});

export type Count = (number | "<10");

export type Nutrients = {
  energyKcal?: number;
  proteinG?: number;
  fatG?: number;
  saturatedFatG?: number;
  transFatG?: number;
  freeSugarsG?: number;
  sodiumMg?: number;
  fruitVegG?: number;
  fibreG?: number;
};

export type Rule = {
  id: string;
  kind: "nutrient" | "energy_share" | "temperature" | "time" | "date_mark" | "allergen" | "food_class";
  applies: "menu_per_person_day" | "menu_per_meal" | "item_chilled" | "item_frozen" | "item_hot_held" | "item_cooked" | "item_any";
  check: {
    nutrient?: "energyKcal" | "proteinG" | "fatG" | "saturatedFatG" | "transFatG" | "freeSugarsG" | "sodiumMg" | "fruitVegG" | "fibreG";
    min?: number;
    max?: number;
    unit?: "mg" | "g" | "kcal" | "pct_energy" | "degC" | "hours" | "days";
    dateKind?: "use_by" | "best_before";
    allergen?: "unknown";
    foodClass?: FoodClass;
  };
  /** block: the receiver should not accept or serve; warn: allowed, recorded as a finding. */
  severity: "block" | "warn";
  /** Population the rule is meant for, e.g. 'adults', 'children 2-15 (adjust by energy)'. */
  audience?: string;
  message?: string;
  source: string;
  /** Machine-readable population the rule is for; a program applies rules whose audienceGroup matches its audienceGroups or is 'all'. */
  audienceGroup?: AudienceGroup;
};

/** Machine-readable nutrition and food-safety rules a program applies to handovers and menus. Packs are versioned and replaceable by local authorities' rules. */
export type RulePack = {
  profile: Version;
  kind: "RulePack";
  id: Id;
  version: string;
  title: string;
  status: "draft" | "reviewed" | "adopted" | "retired";
  reviewedBy?: string[];
  jurisdiction?: string;
  rules: Rule[];
  disclaimer: string;
  /** Who reviewed this pack (RFC-0004). status may be 'reviewed' only with at least one approved outcome. */
  reviews?: Array<{
    /** A profession, e.g. registered dietitian, food-safety officer. Never a person's name. */
    role: string;
    organization?: string;
    date: Date;
    /** Which rules were reviewed. */
    scope?: string;
    outcome: "approved" | "approved_with_changes" | "rejected";
    notes?: Note;
  }>;
  /** id@version of a pack this one tightens. */
  extends?: string;
};

/** Published at /.well-known/cookwala-humanitarian.json by a participating system or organization. */
export type Manifest = {
  profile: Version;
  kind: "Manifest";
  org: OrgId;
  roles?: Role[];
  levels: Array<"H0" | "H1" | "H2" | "H3">;
  rulePacks?: string[];
  endpoints?: {
    api?: string;
    sms?: string;
    csvTemplates?: string;
  };
  /** hash_only: document hashes appended by one sequencer per program, checkpoints witnessed by a partner. */
  auditLog?: "none" | "hash_only";
  dataProtection?: {
    personalData: "none";
    retentionDays?: number;
    hosting?: string;
  };
  contact: string;
  programTypes?: Array<"food_bank" | "school_meals" | "community_kitchen" | "disaster_kitchen" | "robot_kitchen" | "surplus_rescue">;
};

/** Food classes that care rules refer to (RFC-0004). */
export type FoodClass = "raw_egg" | "undercooked_egg" | "raw_meat" | "raw_fish" | "unpasteurized_dairy" | "soft_cheese" | "raw_sprouts" | "high_mercury_fish" | "honey" | "whole_nuts" | "hard_candy" | "alcohol" | "caffeine_high" | "deli_meat_cold" | "leafy_greens_raw" | "cut_melon" | "cooked_rice" | "none";

export type AudienceGroup = "all" | "children_under_5" | "children" | "pregnant" | "older_adults" | "immunocompromised";

/** Where the item comes from. A farm is a donor like any other: an organization, never a person. */
export type Origin = "farm" | "processor" | "wholesale" | "retail" | "food_service" | "kitchen";

export type Measure = {
  value: (number | "<10" | null);
  unit?: string;
  method: "measured" | "modelled" | "assumed" | "not_recorded";
  /** Which documents or model produced it. */
  source?: string;
  /** Number of documents behind the value. */
  n?: number;
};

/** RFC-0003. The measures that prove impact, computed from Handovers, Claims and Distributions, each with its method. People counts under 10 are '<10'. Never typed by hand when the documents exist. */
export type ImpactSummary = (Extensions & {
  profile: Version;
  kind: "ImpactSummary";
  id: Id;
  org: OrgId;
  programType?: "food_bank" | "school_meals" | "community_kitchen" | "disaster_kitchen" | "robot_kitchen" | "surplus_rescue";
  site?: Site;
  period: {
    from: Date;
    to: Date;
  };
  measures: {
    kgRescued: Measure;
    kgRejected?: Measure;
    mealsServed: Measure;
    peopleReached?: Measure;
    nutritionPassRate?: Measure;
    costPerMeal?: Measure;
    timeToClaimMinutesMedian?: Measure;
    claimRate?: Measure;
    safetyBlockFindings?: Measure;
    safetyIncidents: Measure;
    volunteerMinutesPer100Kg?: Measure;
  };
  documents?: {
    offers?: number;
    claims?: number;
    handovers?: number;
    distributions?: number;
  };
  /** Required on published summaries: problems recorded in the period, or 'nothing recorded yet'. */
  whatWentWrong?: Note[];
  /** What the documents cannot tell. */
  unknowns?: Note[];
  rulePack?: string;
  signature?: Signature;
  /** A partner organization's signature over the same hash (recommended for published summaries). */
  counterSignature?: Signature;
});
