// Generated from flow.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Flow

import type { Duration, LangMap, Meta, SpecVersion } from "./common";
import type { OperatingMode } from "./profile";

export type Step = {
  id: string;
  do: "advise" | "plan_session" | "start_session" | "confirm_with_human" | "order_intent" | "approve_with_human" | "notify" | "wait" | "wait_for_event" | "branch" | "foreach" | "set" | "call_tool" | "call_agent" | "call_extension" | "store_profile" | "publish_recipe" | "end";
  /** Arguments; values may reference earlier outputs with {{steps.<id>.output...}} and inputs with {{inputs.<name>}}. */
  with?: {
    [key: string]: unknown;
  };
  /** Run only when this expression is true. */
  if?: {
    [key: string]: unknown;
  };
  branches?: Array<{
    when?: {
      [key: string]: unknown;
    };
    goto?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  items?: string;
  steps?: Step[];
  timeout?: Duration;
  /** Name to store the result under. */
  output?: string;
  next?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A declarative, shareable workflow that strings Cookwala capabilities together: triggers (events, schedules, questions), steps (advise, plan, session, order, notify, wait for human, call an agent/tool/extension), branches and loops. Examples: 'every Sunday plan a week of halal meals under a budget, ask me to approve groceries, batch-cook Monday', 'when the fridge reports expiring items, suggest a dinner that uses them', 'restaurant: on order received, schedule robots and hold times'. Flows run inside a hub (or any compatible flow runner) and never bypass approvals or safety. */
export type Flow = {
  cookwala: SpecVersion;
  id: string;
  name: string;
  version: string;
  description?: LangMap;
  /** JSON Schema of parameters the user sets when installing (budget, people, cuisines...). */
  inputs?: {
    [key: string]: unknown;
  };
  mode?: OperatingMode;
  triggers: Array<{
    type: "schedule" | "event" | "ask" | "manual" | "webhook";
    cron?: string;
    timezone?: string;
    eventTypes?: string[];
    /** Expression over the event (policy expression language). */
    filter?: {
      [key: string]: unknown;
    };
    /** For ask: example utterances that start this flow. */
    phrases?: LangMap;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  steps: Step[];
  onError?: "stop" | "notify_and_stop" | "skip" | "ask_human";
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
