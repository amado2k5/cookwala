// Generated from household.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: profile-draft. Cookwala Household Context Profile

import type { DateTime, Disclosure, Duration, UntrustedText, VocabId } from "./common";

export type Version = string;

export type Id = string;

export type FacetId = string;

export type RecipientRole = "grocer" | "delivery" | "planner" | "device_maker" | "program" | "dataset" | "insurer" | "other_robot";

export type ConstraintType = "delivery_window" | "access_point" | "no_movement_zone" | "quiet_hours" | "avoid_ingredient" | "allergen_block" | "diet_rule" | "serve_window" | "budget_cap" | "heat_sources" | "equipment_available" | "texture_level" | "portion_count" | "presence_required" | "caution_level" | "robot_runtime_minutes" | "serving_form" | "labeling_required" | "cuisine_preference" | "spice_level" | "packaging_preference" | "pet_safe_storage" | "child_safe_zones" | "device_fault_summary";

/** One typed fact about the home. The same shape as a Mission facet; the type must exist in vocab/facets.json. */
export type Facet = {
  id?: Id;
  facet: FacetId;
  /** What the fact is about: a device id, a zone, a role such as 'adult_member_2'. Never a legal name. */
  subject: string;
  value: unknown;
  summary?: UntrustedText;
  source: {
    kind: "declared" | "observed" | "reported" | "inferred";
    actor?: string;
    /** Local references (frames, logs) kept on the device. */
    evidence?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  observedAt: DateTime;
  validFor?: Duration;
  confidence?: number;
  /** May be raised above the registry default, never lowered below it. */
  privacy: "public" | "household" | "sensitive" | "secret";
  /** ConsentGrant ids that cover this facet. */
  consent?: Id[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Permission for facets with travel 'consented' to leave the home as selective disclosures. Granted by a role, never a named person. */
export type ConsentGrant = {
  id: Id;
  /** A role. Children cannot grant consent. */
  grantedBy: "owner" | "adult_member" | "guardian" | "organization";
  scope: {
    facets?: FacetId[];
    families?: string[];
  };
  recipientRole: RecipientRole;
  /** Specific organization (did:web) when the grant is not for a whole role. */
  recipient?: string;
  purpose: string;
  grantedAt: DateTime;
  expiresAt?: DateTime;
  withdrawnAt?: DateTime;
  withdrawable: true;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** The only household-originated object a provider or agent ever receives. Names the facet TYPES it came from, never their values. */
export type DerivedConstraint = {
  kind: "DerivedConstraint";
  type: ConstraintType;
  value: unknown;
  recipientRole: RecipientRole;
  derivedFrom: FacetId[];
  issuedAt: DateTime;
  validFrom?: DateTime;
  validTo?: DateTime;
  /** Present only for 'consented' facets sent as a selective disclosure. */
  disclosure?: Disclosure;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** The household's own memory of what went wrong and what was learnt. Never exported. The public, anonymous record is core.schema.json IncidentReport. */
export type LocalIncident = {
  id: Id;
  date: string;
  /** From vocab/incidents.json. */
  category: VocabId;
  involved: Array<"robot" | "other_robot" | "appliance" | "utensil" | "alarm" | "adult" | "child" | "pet" | "visitor" | "worker" | "provider" | "network" | "power">;
  note?: UntrustedText;
  lesson?: UntrustedText;
  escalatedTo?: "none" | "household" | "maker_support" | "emergency_services";
  resolved: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Local-only document held by the home's hub or robot. meta.visibility MUST be local_only and meta.sensitive MUST be true. */
export type HouseholdContext = {
  profile: Version;
  kind: "HouseholdContext";
  id: Id;
  /** Device or hub id that holds the document. */
  holder: string;
  meta: {
    visibility: "local_only";
    sensitive: true;
    createdAt?: DateTime;
    updatedAt?: DateTime;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  facets: Facet[];
  consents: ConsentGrant[];
  incidents?: LocalIncident[];
  retention: {
    /** Observed facets older than this are dropped unless re-observed. */
    facetsDays?: number;
    incidentsDays?: number;
    /** An erasure request completes within this many days. Default 7. */
    erasureWindowDays: number;
  };
  /** Local log that erasure happened, kept without the erased content. */
  erasures?: Array<{
    requestedAt: DateTime;
    scope: "all" | "facets" | "incidents" | "family" | "facet";
    target?: string;
    completedAt: DateTime;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Which DerivedConstraint types each recipient role may receive. Closed list in 0.1 (RFC-0001 open question 1). */
export type RecipientRoles = {
  profile: Version;
  kind: "RecipientRoles";
  roles: {
    grocer?: ConstraintTypeList;
    delivery?: ConstraintTypeList;
    planner?: ConstraintTypeList;
    device_maker?: ConstraintTypeList;
    program?: ConstraintTypeList;
    dataset?: ConstraintTypeList;
    insurer?: ConstraintTypeList;
    other_robot?: ConstraintTypeList;
  };
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type ConstraintTypeList = ConstraintType[];
