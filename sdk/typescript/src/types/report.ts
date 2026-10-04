// Generated from report.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: experimental. Cookwala Execution Report

import type { DateTime, Hash, Meta, Signature, SpecVersion } from "./common";

/** Anonymous, opt-in report a hub or device sends to the index after a session (POST /v1/reports). Drives verification levels (V3) and recipe fixes. No personal data, no images unless the user opts in, no location finer than country. */
export type Report = {
  cookwala: SpecVersion;
  reportId: string;
  recipeId: string;
  recipeHash: Hash;
  scale?: number;
  mode?: "guided" | "assisted" | "autonomous";
  outcome: "success" | "success_with_interventions" | "failed" | "aborted_safety" | "aborted_user";
  deviceClasses: string[];
  country?: string;
  nodes?: Array<{
    nodeId: string;
    result: "ok" | "retried" | "extended" | "human_took_over" | "skipped" | "failed";
    durationS?: number;
    conditionFired?: string;
    assigneeKind?: "human" | "robot" | "appliance";
    note?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  ccps?: Array<{
    ccpId?: string;
    passed?: boolean;
    value?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  safetyEvents?: string[];
  rating?: number;
  submittedAt: DateTime;
  signature?: Signature;
  meta?: Meta;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
