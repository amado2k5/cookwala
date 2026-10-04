// Generated from catalog.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: core. Cookwala Catalog (index) documents

import type { DateTime, Hash, KeyRecord, LangMap, Signature, SpecVersion, VocabId } from "./common";

export type Discovery = {
  cookwala: SpecVersion;
  name: string;
  operator?: string;
  versions: string[];
  /** Public keys of the catalog, with validity and revocation. Verifiers cache them for offline use. */
  keys: KeyRecord[];
  endpoints: {
    manifest?: string;
    recipe?: string;
    index?: string;
    changes?: string;
    dump?: string;
    vocab?: string;
    policies?: string;
    schemas?: string;
    rest?: string;
    graphql?: string;
    openapi?: string;
    mcp?: string;
    a2a?: string;
    reports?: string;
    /** Core API description (api/core.openapi.yaml). */
    coreApi?: string;
    /** Recall feed (GET, ?since=). */
    recalls?: string;
    /** Anonymous incident reports (POST). */
    incidents?: string;
    /** All schemas in one file for offline validation. */
    schemaBundle?: string;
    /** Conformance vectors. */
    conformance?: string;
    /** Default safety-limits pack. */
    safetyLimits?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  mirrors?: string[];
  contact?: string;
  terms: string;
  license?: string;
  roles?: Array<"catalog" | "hub" | "provider" | "registry" | "advisor" | "marketplace" | "mirror">;
  visibility?: "public" | "private" | "unlisted";
  /** For private catalogs. */
  auth?: {
    schemes?: Array<"none" | "oauth2" | "api_key" | "mtls" | "did_auth">;
    tokenUrl?: string;
    docs?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  federation?: {
    trusts?: Array<{
      catalog?: string;
      keys?: string[];
      priority?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    registry?: string;
    /** Signed feeds this node publishes. Readers verify every item against its ISSUER's KeyRecord, never the relaying node's (RFC-0006). */
    feeds?: {
      recalls?: string;
      incidents?: string;
      registry?: string;
      keys?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** Catalogs or registries this node suggests; a hub may ignore them. */
    peers?: string[];
    /** True if this node republishes other issuers' signed items unchanged, with x-relay provenance. */
    relays?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** Extension manifests this server supports/serves. */
  extensions?: string[];
  /** URL of the operator's market Provider document. */
  provider?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Manifest = {
  cookwala: SpecVersion;
  version: string;
  generatedAt: DateTime;
  counts: {
    recipes?: number;
    byLevel?: {
      [key: string]: unknown;
    };
    countries?: number;
    languages?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  languages?: string[];
  shards: Array<{
    path: string;
    hash: Hash;
    bytes?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type IndexEntry = {
  id: string;
  revision?: number;
  hash: Hash;
  title: string;
  cuisine?: string[];
  course?: string;
  tags?: string[];
  level: "V0" | "V1" | "V2" | "V3";
  totalTimeS?: number;
  activeTimeS?: number;
  servings?: number;
  allergens?: string[];
  dietary?: string[];
  ops?: string[];
  equipment?: string[];
  sensors?: string[];
  maxTempC?: number;
  supervision?: string;
  kcal?: number;
  thumb?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Changes = {
  from: string;
  to: string;
  upserted: Array<{
    id?: string;
    hash?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  removed: Array<{
    id?: string;
    reason?: "withdrawn" | "safety_recall" | "rights" | "duplicate";
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Devices must stop executing recalled revisions. */
  recalls?: Array<{
    id?: string;
    severity?: string;
    message?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Vocabulary = {
  name: "ingredients" | "ops" | "equipment" | "sensors" | "hazards" | "units" | "classes" | "incidents" | "modes" | "roles" | "facets";
  version: string;
  entries: Array<{
    id: VocabId;
    label: LangMap;
    definition?: string;
    classes?: string[];
    /** ops only: JSON Schema for node.params. */
    paramsSchema?: {
      [key: string]: unknown;
    };
    /** ops only: sensors usable in until conditions. */
    sensors?: string[];
    allergens?: string[];
    /** ingredients: g/ml for volume conversion. */
    density?: number;
    links?: {
      wikidata?: string;
      foodon?: string;
      usdaFdc?: string;
      ieee1872?: string;
      matter?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    deprecated?: boolean;
    replacedBy?: string;
    /** ops only: the physical meaning of the operation. Executors must keep the medium inside tempC (and pressureKPa) unless the recipe sets a narrower target inside it; conformance vectors in testMethod check this. */
    envelope?: {
      medium?: "water" | "oil" | "air" | "steam" | "pan_surface" | "product" | "ambient" | "pressure" | "radiant" | "none";
      tempC?: {
        min: number;
        max: number;
      };
      pressureKPa?: {
        min: number;
        max: number;
      };
      agitation?: "none" | "occasional" | "frequent" | "continuous";
      lid?: "on" | "off" | "any";
      /** Ways to verify the step, best first. model = a logged estimate; time = nominal time only; human = a person confirms. If the ladder has no entry the executor can satisfy, the step must not run. */
      sensorLadder?: string[];
      attention?: "none" | "periodic" | "monitor" | "continuous";
      unattended?: boolean;
      hazards?: string[];
      note?: string;
      testMethod?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** units only: exact conversion to a base unit. */
    convert?: {
      to: string;
      factor: number;
    };
    /** heat levels only. */
    surfaceTempC?: {
      min: number;
      max: number;
    };
    /** facets only: facet family (self, mandate, household.people, household.pets, household.culture, household.tastes, household.health, household.behavior, household.economics, space, space.environment, devices, resources, commerce, service, history). */
    family?: string;
    /** facets only: default privacy class. Implementations may raise it, never lower it (RFC-0001). */
    privacy?: "public" | "household" | "sensitive" | "secret";
    /** facets only: whether the raw fact may leave the home: never; only as a derived constraint; or as a selective disclosure after explicit consent. */
    travel?: "never" | "derived" | "consented";
    /** facets only: DerivedConstraint types this facet may produce (household.schema.json). */
    derivesTo?: string[];
    /** facets only: who may assert this fact. */
    sources?: Array<"declared" | "observed" | "reported" | "inferred">;
    /** facets only: shape of the value in plain words. */
    valueHint?: string;
    /** facets only: whether a safety decision may rely on this fact. Inferred facts are never allowed. */
    safetyUse?: "allowed" | "never";
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Item in a registry (/v1/registry.json): anyone can list a catalog, recipe collection, extension, flow, provider, knowledge pack, policy or rule pack hosted anywhere. Modelled on the MCP Registry: verified namespaces, pinned versions, integrity hashes and a lifecycle status (docs/REGISTRY.md). */
export type RegistryEntry = {
  kind: "advisor" | "benchmark" | "catalog" | "device" | "extension" | "flow" | "hub" | "kitchen" | "knowledge" | "policy_pack" | "program" | "provider" | "recipe_collection" | "rule_pack" | "safety_limits";
  id?: string;
  url: string;
  /** <namespace>/<name>. The namespace is a reverse-DNS domain the publisher proved control of (org.fifi-cooking/egyptian-home) or a code-host account (io.github.amado2k5/recipes). */
  name?: string;
  /** One clear sentence, 100 characters at most. */
  description?: string;
  tags?: string[];
  verified?: boolean;
  conformance?: string[];
  addedAt?: string;
  /** An exact version. Ranges (^1.2, ~1.2, >=1, 1.x) are rejected. */
  version?: string;
  /** recalled entries also appear in the recall feed; deleted entries stay listed as tombstones so ids are never reused. */
  status?: "active" | "deprecated" | "recalled" | "deleted";
  verification?: {
    method: "dns_txt" | "http_well_known" | "github_oidc" | "gitlab_oidc" | "signature";
    verifiedAt: DateTime;
    /** Registry that verified it. */
    by?: string;
  };
  repository?: {
    url?: string;
    source?: "github" | "gitlab" | "codeberg" | "other";
    /** Stable id from the code host; changes if the repository is deleted and recreated (resurrection attacks). */
    id?: string;
    subfolder?: string;
  };
  /** Hash of the published artifact; clients verify before use. */
  sha256?: string;
  icons?: Array<{
    src: string;
    mimeType?: "image/png" | "image/jpeg" | "image/svg+xml" | "image/webp";
    sizes?: string[];
    theme?: "light" | "dark";
  }>;
  publishedAt?: DateTime;
  /** Cookwala Core version this entry targets. */
  coreVersion?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** An organization that takes part in Cookwala, listed at its own request in a directory (/v1/directory.json). Never a person. Listing means the organization asked to be listed and its namespace was checked; it does not mean endorsement, certification or partnership (RFC-0002). */
export type DirectoryEntry = {
  kind: "DirectoryEntry";
  id: string;
  name: string;
  description?: string;
  roles: Array<"device_maker" | "appliance_maker" | "agent_builder" | "catalog" | "registry" | "hub_vendor" | "food_bank" | "community_kitchen" | "school_program" | "relief_program" | "farm_or_cooperative" | "grocer_or_retailer" | "restaurant_or_food_service" | "recipe_publisher" | "certifier" | "research_lab" | "health_body" | "government" | "insurer" | "translator_community" | "other">;
  country: string;
  url?: string;
  /** A role address or page, never a person's name or number. */
  contact?: string;
  /** Hashes of published ConformanceReport documents (conformance.schema.json). */
  conformance?: Hash[];
  humanitarianLevels?: Array<"H0" | "H1" | "H2" | "H3">;
  verification?: {
    method: "dns_txt" | "well_known" | "code_host_oidc" | "vouched_by_program" | "none";
    verifiedAt: DateTime;
    /** Registry or program that checked it. */
    by: string;
  };
  status: "active" | "inactive" | "deleted";
  addedAt: DateTime;
  updatedAt?: DateTime;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
