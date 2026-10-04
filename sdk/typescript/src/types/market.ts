// Generated from market.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Market (providers, offers, quotes)

import type { DateTime, Duration, GlobalRef, LangMap, Meta, Money, Quantity, Signature, SpecVersion } from "./common";
import type { CookwareItem } from "./profile";

export type Role = "grocer" | "ingredient_supplier" | "farm" | "butcher" | "fishmonger" | "bakery" | "restaurant" | "cloud_kitchen" | "caterer" | "meal_kit" | "robot_maker" | "appliance_maker" | "cookware_maker" | "robot_rental" | "robot_operator" | "repair_service" | "recipe_publisher" | "chef" | "nutritionist" | "cooking_school" | "certifier" | "food_safety_auditor" | "lab" | "delivery" | "energy_provider" | "extension_vendor" | "ai_model_vendor" | "hub_vendor" | "catalog_host" | "marketplace_operator" | "other" | "food_bank" | "humanitarian_org" | "community_kitchen" | "school_feeding_program" | "donor" | "volunteer_group" | "government_agency" | "logistics";

/** A claim such as halal/kosher/organic certification, food business license or safety certification, ideally as a W3C Verifiable Credential. */
export type Credential = {
  /** e.g. halal_certified, kosher_certified, organic, food_business_license, iso_22000, haccp, iec_60335, iso_13482, cookwala_conformance:executor. */
  type: string;
  issuer: string;
  subject?: string;
  validFrom?: string;
  validUntil?: string;
  /** URL of a W3C Verifiable Credential (JWT or JSON-LD) proving the claim. */
  vc?: string;
  /** Set by the index/hub after checking the VC; never trusted from the provider itself. */
  verified?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Area = {
  countries?: string[];
  postalCodes?: string[];
  radiusKm?: number;
  center?: {
    lat?: number;
    lon?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  online?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Pricing = {
  model?: "free" | "one_time" | "per_unit" | "per_use" | "subscription" | "quote" | "donation";
  price?: Money;
  unit?: string;
  period?: string;
  validUntil?: DateTime;
  taxIncluded?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Provider = {
  cookwala: SpecVersion;
  /** Stable id, ideally a domain or DID (did:web:grocer.example). */
  id: string;
  name: string;
  roles: Role[];
  description?: LangMap;
  url?: string;
  contact?: string;
  area?: Area;
  credentials?: Credential[];
  /** How to reach the provider's own systems. */
  endpoints?: {
    /** OfferFeed URL. */
    offers?: string;
    ucp?: string;
    acp?: string;
    a2a?: string;
    mcp?: string;
    /** Cookwala recipe catalog the provider publishes (chefs, meal kits, restaurants). */
    catalog?: string;
    quotes?: string;
    support?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Other standards they follow (GS1, schema.org/Product, Matter, UCP...), to help bridging. */
  standards?: string[];
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Offer = {
  id: string;
  provider: string;
  type: "ingredient" | "grocery_bundle" | "meal_kit" | "ready_meal" | "recipe_pack" | "cooking_class" | "robot" | "robot_rental" | "robot_service" | "appliance" | "cookware" | "spare_part" | "repair" | "extension" | "ai_model" | "hub" | "catalog_hosting" | "certification" | "audit" | "delivery" | "energy_plan" | "other" | "surplus_food" | "donated_meal" | "sponsored_meal" | "kitchen_capacity" | "volunteer_service" | "cold_storage";
  title: LangMap;
  description?: LangMap;
  /** For ingredients: the cw.ing id this product fulfils. */
  ingredientId?: string;
  gtin?: string;
  pack?: Quantity;
  /** Meal kits, ready meals and recipe packs map to Cookwala recipes, so a kitchen can choose cook-it-yourself vs buy-it-ready. */
  recipeIds?: GlobalRef[];
  /** For robots/appliances/cookware: classes and the capability manifest they ship with. */
  deviceClasses?: string[];
  /** URL of the product's capability manifest (robots/appliances). */
  capabilities?: string;
  cookware?: CookwareItem;
  dietary?: string[];
  allergens?: string[];
  credentials?: Credential[];
  pricing?: Pricing;
  availability?: {
    inStock?: boolean;
    qty?: number;
    leadTime?: Duration;
    slots?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  area?: Area;
  fulfillment?: Array<"delivery" | "pickup" | "robot_receive" | "digital" | "on_site">;
  sustainability?: {
    co2eKg?: number;
    local?: boolean;
    packaging?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** For recipe packs/extensions/models: usage license (may be proprietary). */
  license?: string;
  /** Must be true when placement was paid; indexes must disclose it. */
  sponsored?: boolean;
  checkout?: {
    protocol?: "ucp" | "acp" | "provider_site" | "quote" | "free";
    url?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type OfferFeed = {
  cookwala: SpecVersion;
  provider: Provider;
  updatedAt: DateTime;
  offers: Offer[];
  next?: string;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A kitchen/agent asks providers for prices without revealing personal data (e.g. catering for 80 people, halal lamb 5 kg, robot rental for an event). */
export type QuoteRequest = {
  cookwala: SpecVersion;
  id: string;
  need: {
    offerTypes?: string[];
    lines?: Array<{
      ingredientId?: string;
      recipeId?: string;
      qty?: Quantity;
      servings?: number;
      constraints?: {
        [key: string]: unknown;
      };
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    by?: DateTime;
    area?: Area;
    budget?: Money;
    credentialsRequired?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  replyTo?: string;
  expires?: DateTime;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Quote = {
  cookwala: SpecVersion;
  requestId: string;
  provider: string;
  lines: Array<{
    offerId?: string;
    qty?: number;
    price?: Money;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  total: Money;
  validUntil?: DateTime;
  checkout?: {
    protocol?: string;
    url?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
