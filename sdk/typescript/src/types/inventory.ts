// Generated from inventory.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Inventory

import type { Actor, DateTime, Meta, Quantity, SpecVersion, VocabId } from "./common";

export type Item = {
  id: string;
  ingredientId: VocabId;
  label?: string;
  gtin?: string;
  qty: Quantity;
  storage?: string;
  openedAt?: string;
  expires?: string;
  useWithinDaysAfterOpening?: number;
  /** How sure the detector is (camera inventories are approximate). */
  confidence?: number;
  detectedBy?: "camera" | "weight" | "rfid" | "barcode" | "receipt" | "manual" | "order";
  /** e.g. halal_certified, kosher, organic. */
  dietary?: string[];
  allergens?: string[];
  /** Session id holding this item for a planned cook. */
  reservedBy?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** What food is in the kitchen (fridge, freezer, pantry, robot dispensers). Matter covers fridge state but not contents, so Cookwala defines it. Published by smart fridges, pantry scales, receipt scanners or humans; read by planners to decide what can be cooked and what to order. */
export type Inventory = {
  cookwala: SpecVersion;
  kitchenId: string;
  updatedAt: DateTime;
  storages?: Array<{
    id: string;
    kind: "fridge" | "freezer" | "pantry" | "spice_rack" | "dispenser" | "counter" | "cellar";
    tempC?: number;
    actor?: Actor;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  items: Item[];
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
