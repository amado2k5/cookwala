// Generated from policy.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Policy Pack

import type { LangMap, Meta, Severity, Signature, SpecVersion } from "./common";

export type Rule = {
  id: string;
  effect: "deny" | "require" | "warn" | "inform" | "adjust";
  scope?: "recipe" | "node" | "ingredient" | "session" | "device" | "inventory" | "order";
  /** Rule applies when this is true. */
  when: Expr;
  /** For require: this must also be true, else the rule fails. */
  then?: Expr;
  /** For adjust: values to tighten (never loosen), e.g. {"ccp.minCoreC": 74}. */
  adjust?: {
    [key: string]: unknown;
  };
  message: LangMap;
  severity?: Severity;
  overridable?: "no" | "by_user" | "by_operator";
  source?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A small, side-effect-free expression language over JSON paths. Paths start at the evaluation context: recipe, node, ingredient, session, device, policyContext (venue, ageGroups, time, location). */
export type Expr = ({
  all: Expr[];
} | {
  any: Expr[];
} | {
  not: Expr;
} | {
  /** JSONPath-like, e.g. recipe.ingredients[*].ingredientId, node.op, session.supervision, device.safety.presenceDetection. */
  path: string;
  eq?: unknown;
  ne?: unknown;
  in?: unknown[];
  contains?: unknown;
  containsAny?: unknown[];
  gte?: number;
  lte?: number;
  exists?: boolean;
  /** Ingredient/op belongs to a vocabulary class, e.g. cw.ing.class.pork. */
  inClass?: string;
});

/** Machine-checkable local rules (food safety, allergen disclosure, dietary, venue, appliance/robot operation). Evaluated by a hub or device against a recipe + session + capability set. Informational and best-effort: packs cite their legal sources and are not legal advice. */
export type Policy = {
  cookwala: SpecVersion;
  /** e.g. us.fda-food-code-2022, eu.reg-852-2004, sa.sfda, dietary.halal, venue.school, household.default, robot.unattended-default. */
  id: string;
  version: string;
  kind: "jurisdiction" | "dietary" | "venue" | "household" | "device" | "organization";
  jurisdiction?: string[];
  title: LangMap;
  extends?: string[];
  rules: Rule[];
  sources: Array<{
    title: string;
    url: string;
    section?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  effective: string;
  reviewedBy?: string;
  reviewStatus?: "draft" | "community_reviewed" | "expert_reviewed";
  disclaimer: string;
  signature?: Signature;
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
