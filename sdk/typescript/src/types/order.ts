// Generated from order.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Order Intent

import type { Actor, DateTime, Meta, Money, Quantity, SpecVersion, VocabId } from "./common";

/** A shopping list or ready-meal order derived from a plan and the inventory. Cookwala never carries payment credentials. An adapter turns an OrderIntent into a UCP / ACP checkout (grocery or delivery merchant); payment authorization stays with the merchant and AP2-style user mandates. Orders are never placed without an approval record unless the user set a standing budget rule. */
export type Order = {
  cookwala: SpecVersion;
  id: string;
  kitchenId: string;
  sessionId?: string;
  kind: "groceries" | "ready_meal" | "meal_kit";
  lines: Array<{
    ingredientId: VocabId;
    qty: Quantity;
    forRecipes?: string[];
    constraints?: {
      /** e.g. halal_certified for meat. */
      dietary?: string[];
      excludeAllergens?: string[];
      preferredGtin?: string[];
      substitutionAllowed?: "no" | "same_ingredient_any_brand" | "ask";
      maxUnitPrice?: Money;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** For ready_meal: the dish to order from a restaurant/delivery merchant. */
  recipeId?: string;
  deliverBy?: DateTime;
  budget?: Money;
  merchantHints?: Array<{
    protocol?: "ucp" | "acp" | "vendor_api" | "manual";
    merchant?: string;
    endpoint?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  approval: {
    mode: "ask_every_time" | "standing_rule" | "approved";
    rule?: {
      maxTotal?: Money;
      merchants?: string[];
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    approvedBy?: Actor;
    approvedAt?: DateTime;
    /** Reference to the payment-protocol mandate (e.g. AP2), never the credential itself. */
    mandateRef?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  state: "draft" | "awaiting_approval" | "approved" | "placed" | "partially_fulfilled" | "delivered" | "canceled" | "failed";
  externalOrderRef?: string;
  delivery?: {
    eta?: DateTime;
    /** robot_receive: a home robot may receive and put away items (cold chain first). */
    handoff?: "door" | "locker" | "robot_receive" | "concierge";
    coldChainRequired?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
