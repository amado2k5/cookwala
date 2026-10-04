// Generated from conformance.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: profile-draft. Cookwala conformance reports and profile vectors

import type { Hash, Signature, UntrustedText } from "./common";

export type Version = string;

/** A claim of conformance that anyone can reproduce. A report that fails any vector of a class may not claim that class. */
export type ConformanceReport = {
  profile: Version;
  kind: "ConformanceReport";
  id: string;
  /** Core version the vectors belong to. */
  core: string;
  /** Core conformance class (docs/CORE.md section 1) or profile claim. */
  claim: string;
  subject: {
    /** Product, device model or software name. */
    name: string;
    vendor?: string;
    /** Firmware or software version. */
    version?: string;
    capabilitiesHash?: Hash;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  suites: Array<{
    /** Vector file stem, e.g. hash, envelope, profiles/disclosure_policy. */
    suite: string;
    total: number;
    passed: number;
    /** Ids of failed vectors. */
    failed?: string[];
  }>;
  /** sha256 of the RFC 8785 canonical JSON of the sorted list of (suite, vector id, expected) used. */
  vectorsHash: Hash;
  tool: {
    name: string;
    version: string;
    commit?: string;
  };
  date: string;
  /** self_declared: published by the maker. verified: reproduced by a registry operator. certified: an independent certifier with hardware and safety-case checks. */
  status: "self_declared" | "verified" | "certified";
  /** Organization that verified or certified; required when status is not self_declared. */
  verifier?: string;
  notes?: UntrustedText;
  hash?: Hash;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A test vector for a profile suite. kind is any lower-case token the runner knows (disclosure_policy, registry_name, registry_version, sms_parse, signal_policy, signature...). */
export type ProfileVector = {
  id: string;
  kind: string;
  /** Profile the vector belongs to, e.g. household, registry, humanitarian. */
  profile?: string;
  rfc?: string;
  description: string;
  input: unknown;
  expected: unknown;
};
