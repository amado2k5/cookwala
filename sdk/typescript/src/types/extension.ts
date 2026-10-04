// Generated from extension.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Extension Manifest

import type { Hash, LangMap, Meta, Signature, SpecVersion } from "./common";
import type { Pricing } from "./market";

export type Hook = "reasoner.parse" | "reasoner.retrieve" | "reasoner.filter" | "reasoner.generate" | "reasoner.verify" | "reasoner.rank" | "reasoner.explain" | "planner.cost_terms" | "planner.constraints" | "planner.post_plan" | "policy.evaluate" | "session.before_start" | "session.on_event" | "session.after_complete" | "catalog.ingest" | "catalog.enrich" | "catalog.search_filter" | "catalog.search_rank" | "inventory.ingest" | "order.route" | "notify.deliver" | "sense.classify";

export type Contribution = {
  type: "fields" | "vocabulary" | "knowledge" | "policy_pack" | "playbooks" | "recipes" | "filter" | "ranker" | "advisor" | "intent" | "planner_terms" | "model" | "sensor_classifier" | "agent" | "tool" | "adapter" | "flow" | "ui_card" | "market_connector" | "profile_kind" | "mode_preset";
  id?: string;
  hooks?: Hook[];
  /** For 'fields': JSON Schema (URL) of the x- fields and which documents they attach to. */
  schema?: string;
  attachesTo?: Array<"recipe" | "node" | "ingredient" | "capabilities" | "policy" | "session" | "inventory" | "order" | "profile" | "advice_request" | "advice_response" | "offer" | "event">;
  /** For 'intent': new advisor intent name, e.g. x-acme.wine_free_pairing; request/response schemas below. */
  intent?: string;
  requestSchema?: string;
  responseSchema?: string;
  /** For 'model' / 'sensor_classifier': bring-your-own AI. */
  model?: {
    roles?: Array<"parse" | "propose" | "explain" | "translate" | "vision_cue" | "embed" | "rerank">;
    /** cw.sense.* vision cues it can classify. */
    cues?: string[];
    /** Declared accuracy per cue/task on the Cookwala benchmark. */
    accuracy?: {
      [key: string]: number;
    };
    local?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** URL of a flow document (flow.schema.json). */
  flow?: string;
  /** URL of the contributed data (vocabulary, knowledge pack, policy pack, recipes catalog). */
  data?: string;
  /** Order among extensions at the same hook (lower first). */
  priority?: number;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Declares an extension anyone can build and host anywhere: new fields (x- namespace), vocabularies, knowledge packs, policy packs, filters, rankers, advisors, planners' cost terms, AI models, agents, tools, device adapters, flows, UI cards, or marketplace connectors. Hubs and indexes load extensions the operator trusts. Core safety checks always run after every extension and cannot be disabled or loosened by one. */
export type Extension = {
  cookwala: SpecVersion;
  /** Namespace owned by the publisher, e.g. x-acme or x-acme.halal-plus. Fields it adds are prefixed with this id. */
  id: string;
  name: string;
  version: string;
  description?: LangMap;
  publisher: {
    name: string;
    url?: string;
    contact?: string;
    did?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  license?: string;
  compat?: {
    /** SemVer range, e.g. ^0.1 || ^1. */
    cookwala?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  provides: Contribution[];
  /** What data and actions the extension needs. The operator grants or denies each; sensitive data is never granted by default. */
  permissions: {
    read?: Array<"recipes" | "catalog" | "inventory" | "session" | "telemetry" | "profiles.client" | "profiles.client.sensitive" | "profiles.kitchen" | "profiles.cookware" | "profiles.robot" | "orders" | "events" | "mode">;
    write?: Array<"advice" | "inventory" | "orders.intent" | "notify" | "session.patch_proposal" | "catalog.private" | "events.custom">;
    /** Hosts the extension may call (empty = offline only). */
    network?: string[];
    /** Extensions never actuate devices directly; they propose, the hub decides. */
    actuate?: false;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** How it runs. Pure data contributions need no runtime. */
  runtime?: {
    kind?: "data" | "wasm" | "http" | "mcp" | "a2a" | "container";
    /** WASM component URL/path, HTTP base URL, MCP endpoint, AgentCard URL or OCI image. */
    entry?: string;
    timeoutMs?: number;
    offline?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  pricing?: Pricing;
  integrity?: {
    hash?: Hash;
    signature?: Signature;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
