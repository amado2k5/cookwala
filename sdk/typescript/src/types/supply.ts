// Generated from supply.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala supply signals (experimental)

import type { DateTime, Signature } from "./common";

export type Version = string;

export type OrgId = string;

export type Region = {
  country: string;
  admin1: string;
  /** Allowed only with at least 100 contributing sources. */
  admin2?: string;
  pcode?: string;
};

export type Period = {
  /** Monday of the ISO week. */
  weekStart: string;
};

export type QuantityRange = {
  low: number;
  high: number;
  method: "measured" | "modelled" | "assumed";
};

export type DemandSignal = {
  profile: Version;
  kind: "DemandSignal";
  id: string;
  publisher: OrgId;
  region: Region;
  period: Period;
  /** A class (legume, leafy vegetable, poultry), never a product or brand. */
  ingredientClass: string;
  quantityKg: QuantityRange;
  /** Kitchens, programs or households whose plans were aggregated. At least 20. */
  contributingSources: number;
  /** Days between the end of the period and publication. At least 7. */
  delayDays: number;
  basis: "planned_meals" | "distributions" | "orders" | "production_runs";
  prices: "none";
  publishedAt: DateTime;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type SupplySignal = {
  profile: Version;
  kind: "SupplySignal";
  id: string;
  /** A cooperative, program or market operator, never a single person. */
  publisher: OrgId;
  region: Region;
  period: Period;
  ingredientClass: string;
  availability: "glut" | "normal" | "short";
  quantityKg?: QuantityRange;
  harvestWindow?: {
    from: string;
    to: string;
  };
  /** Published signals are public, free and identical for every reader. */
  openToAll: true;
  publishedAt: DateTime;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
