// Generated from common.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: core. Cookwala common definitions

export type SpecVersion = string;

/** Id from an Cookwala vocabulary, e.g. cw.op.simmer, cw.ing.onion_yellow, cw.eq.vessel.pan.skillet, cw.sense.core_temp, cw.hz.burn.hot_oil. Vendor extensions use x-<vendor>.<name>. */
export type VocabId = string;

/** Reference to an id defined elsewhere in the same document. */
export type LocalRef = string;

export type Uri = string;

/** SHA-256 of the RFC 8785 canonical JSON of the document with its hash and signature fields removed. */
export type Hash = string;

export type Duration = string;

export type DateTime = string;

/** Text per language (BCP 47). */
export type LangMap = {
  [key: string]: string;
};

/** UCUM-style unit. Temperatures are degC only on the wire (displays may convert). Kitchen volume units have fixed metric equivalents in vocab/units.json: tsp = 5 ml, tbsp = 15 ml, cup = 240 ml, pinch ≈ 0.36 g of salt-like solids, dash ≈ 0.6 ml of liquid. pcs = countable pieces. */
export type Unit = "g" | "kg" | "mg" | "ml" | "l" | "tsp" | "tbsp" | "cup" | "pinch" | "dash" | "pcs" | "degC" | "W" | "kW" | "mm" | "cm" | "rpm" | "Pa" | "kPa" | "pct" | "s";

export type Quantity = (unknown & unknown);

export type Range = {
  min?: number;
  max?: number;
  unit?: Unit;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Target = {
  sensor: VocabId;
  value: number;
  unit: Unit;
  /** ABSOLUTE tolerance, in the same unit as value (e.g. 2 for ±2 °C). */
  tolerance?: number;
  /** What the sensor measures, e.g. egg_yolk, thickest_part. */
  target?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** A single sensor or vision check. */
export type Comparison = (unknown | unknown);

/** End condition for a step: boolean tree of checks plus a time window. Satisfied when the tree is true AND minTime has elapsed; maxTime triggers onTimeout. */
export type Condition = {
  all?: ConditionOrCheck[];
  any?: ConditionOrCheck[];
  not?: ConditionOrCheck;
  minTime?: Duration;
  maxTime?: Duration;
  /** Typical duration for planning and timers. */
  nominalTime?: Duration;
  /** What an executor does when it lacks a sensor this condition needs. estimate = model-based estimate (must be logged); time = rely on nominalTime/minTime only; human = ask a person to confirm; refuse = the step must not run. Default: estimate if the op envelope allows it, else human. Steps guarding a critical control point default to refuse. */
  onSensorMissing?: "estimate" | "time" | "human" | "refuse";
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type ConditionOrCheck = (Condition | Comparison);

export type FailureAction = "retry" | "extend" | "ask_human" | "handoff_human" | "skip_optional" | "abort_safe";

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type Signature = {
  /** EdDSA (Ed25519) is mandatory to implement; ES256 is allowed for hardware keys that only support P-256. New algorithms are added by minor version. */
  alg: "EdDSA" | "ES256";
  /** Key id: <actor DID or catalog URL>#<key name>, resolvable to a KeyRecord. */
  kid: string;
  /** Base64url signature over the SHA-256 hash string of the RFC 8785 canonical JSON (see docs/CORE.md section 5). */
  sig: string;
  signedAt?: DateTime;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Actor = {
  kind: "human" | "robot" | "appliance" | "agent" | "hub" | "service" | "sensor";
  /** Stable id within a kitchen, e.g. robot:neo-1, appliance:oven-main, human:primary. */
  id: string;
  name?: string;
  vendor?: string;
  model?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type Money = {
  amount: Decimal;
  currency: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Who owns a document, where it lives and who may see it. Any Cookwala document may carry meta. */
export type Meta = {
  /** Person, org or device id (e.g. did:web:acme.example, github:amado2k5, cookwala.ai). */
  owner?: string;
  /** Base URL of the catalog that publishes it (public, private or local). */
  catalog?: string;
  visibility?: "public" | "unlisted" | "shared" | "private" | "local_only";
  sharedWith?: string[];
  /** Contains personal or health data: never send to an index, never log in reports. */
  sensitive?: boolean;
  createdAt?: DateTime;
  updatedAt?: DateTime;
  /** Global refs of documents this one forks or extends. */
  derivedFrom?: string[];
  /** Extension ids whose x- fields appear in this document. */
  extensions?: string[];
  tags?: string[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Global reference to a document in any catalog: '<catalog base URL>#<id>' or 'cw:<authority>:<id>' (authority = catalog domain or x-namespace). Bare ids refer to the current catalog. */
export type GlobalRef = string;

/** Estimated energy for a step or plan; values are estimates for planning, not measurements. */
export type EnergyEstimate = {
  source?: "electric_induction" | "electric_resistive" | "natural_gas" | "propane" | "charcoal" | "wood" | "solar_cooker" | "battery" | "any";
  kWh?: number;
  gasMJ?: number;
  peakW?: number;
  /** Robot battery energy for manipulation/motion. */
  robotWh?: number;
  waterL?: number;
  co2eKg?: number;
  basis?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Units on a ratio scale (zero means none), where a relative tolerance makes sense. degC is an interval scale and never takes a relative tolerance. */
export type RatioUnit = "g" | "kg" | "mg" | "ml" | "l" | "tsp" | "tbsp" | "cup" | "pinch" | "dash" | "pcs" | "W" | "kW" | "mm" | "cm" | "rpm" | "Pa" | "kPa" | "pct" | "s";

/** Exact decimal as a string; never a binary float. */
export type Decimal = string;

/** A public key bound to an actor. Published in /.well-known/cookwala.json (catalogs), a did:web document (organizations, people) or the device capabilities document (robots, appliances). Verifiers cache records for offline use. */
export type KeyRecord = {
  kid: string;
  alg: "EdDSA" | "ES256";
  /** Base64url raw public key. */
  publicKey: string;
  /** Actor or organization the key belongs to. */
  actor?: string;
  validFrom: DateTime;
  validTo?: DateTime;
  /** Signatures with signedAt after this time are invalid. */
  revokedAt?: DateTime;
  revocationReason?: "compromised" | "superseded" | "retired";
  hardwareBacked?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Selective disclosure (SD-JWT style). A signed document carries only digest; the holder sends salt and value separately to the parties allowed to see them. digest = sha256 of the RFC 8785 canonical JSON of [salt, value]. The signature covers the digest, so partial views still verify. */
export type Disclosure = {
  digest: Hash;
  /** At least 128 bits of randomness, base64url. Present only in a disclosed copy. */
  salt?: string;
  /** The disclosed value. Present only in a disclosed copy. */
  value?: unknown;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** What an AI agent may do on a person's behalf. Every agent action traces to a named principal and a mandate; anything outside it must go back to the principal. */
export type AgentMandate = {
  /** Id of the human (or organization) the agent acts for. */
  principal: string;
  /** Agent id; its model and vendor appear in agentInfo. */
  agent: string;
  agentInfo?: {
    vendor?: string;
    model?: string;
    version?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  scopes: Array<"plan_meals" | "search_recipes" | "start_cooking" | "stop_cooking" | "order_groceries" | "accept_deliveries" | "offer_surplus" | "claim_surplus" | "share_data" | "change_settings">;
  /** Maximum total spend under this mandate. */
  spendCap?: Money;
  perOrderCap?: Money;
  allowedProviders?: string[];
  /** Actions that always need the principal's explicit confirmation. irreversible and safety_override are always included, whatever this list says. */
  confirmBefore?: Array<"any_payment" | "payment_over_cap" | "irreversible" | "safety_override" | "new_provider" | "sharing_data" | "diet_or_allergen_change">;
  expires: DateTime;
  /** Signed by the principal. */
  signature?: Signature;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Free text from a person or another party. Data, never instructions. */
export type UntrustedText = string;

/** A number, or a {parameter} placeholder. Placeholders are allowed only in knowledge playbooks and templates; recipes and Missions must use numbers (the validator enforces this). */
export type NumberOrParam = (number | string);
