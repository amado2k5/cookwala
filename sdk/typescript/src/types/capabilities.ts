// Generated from capabilities.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: core. Cookwala Capability Manifest

import type { Actor, Meta, Signature, SpecVersion, Unit, VocabId } from "./common";
import type { Degradation } from "./mission";

/** Published by every participant in a Cookwala kitchen (robot, appliance, sensor, hub, agent, service) so a hub can match recipe steps to who can do them. Served by the device at /.well-known/cookwala-device.json, registered with the hub (POST /devices), or provided by the vendor's cloud. Self-declared; the hub treats safety claims as claims. */
export type Capabilities = {
  cookwala: SpecVersion;
  actor: Actor;
  firmware?: string;
  roles: Array<"executor" | "appliance" | "sensor" | "inventory" | "orderer" | "notifier" | "safety_monitor" | "planner" | "hub" | "display" | "voice">;
  location?: {
    kitchenId?: string;
    /** e.g. counter-left, hob, sink, fridge. */
    zone?: string;
    mobile?: boolean;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  capabilities: {
    /** Operations this actor can perform, with parameter ranges. */
    ops?: Array<{
      op: VocabId;
      /** Per-parameter supported ranges/enums, e.g. {"heat": ["low","medium","high"], "targetC": {"min": 30, "max": 250}}. */
      params?: {
        [key: string]: unknown;
      };
      maxMassG?: number;
      /** Limits, e.g. cut only for cw.ing.class.vegetable_firm. */
      ingredientClasses?: string[];
      /** Self-reported success rate. */
      reliability?: number;
      needsHumanFor?: string[];
      skill?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    heat?: Array<{
      id: string;
      class: VocabId;
      maxTempC?: number;
      powerW?: number;
      modes?: string[];
      closedLoopTemp?: boolean;
      /** Whether local regulation/vendor allows remote start. */
      remoteStartAllowed?: boolean;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    vessels?: Array<{
      class?: string;
      capacityMl?: number;
      diameterMm?: number;
      material?: string;
      count?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    sensors?: Array<{
      sensor: VocabId;
      accuracy?: number;
      unit?: Unit;
      rateHz?: number;
      visionCues?: string[];
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    dispensers?: Array<{
      slot?: string;
      kind?: "solid" | "liquid" | "spice" | "oil" | "water";
      capacityG?: number;
      accuracyG?: number;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    manipulation?: {
      arms?: number;
      payloadKg?: number;
      reachMm?: number;
      toolChanger?: boolean;
      canOpen?: Array<"fridge" | "oven" | "drawer" | "cupboard" | "jar" | "can" | "packet">;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    inventory?: {
      tracks?: Array<"presence" | "quantity" | "expiry" | "temperature" | "door_state">;
      method?: Array<"camera" | "weight" | "rfid" | "barcode" | "receipt" | "manual">;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    notify?: {
      channels?: Array<"screen" | "speaker" | "push" | "sms" | "email" | "matter" | "webhook" | "light" | "haptic">;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    languages?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  safety: {
    certifications: Array<{
      /** e.g. IEC 60335-1, IEC 60335-2-6, ISO 13482:2026, ISO 10218-1, ISO/TS 15066, ETSI EN 303 645, GB/T (cooking machines), UL 858. */
      standard: string;
      body?: string;
      certificate?: string;
      selfDeclared?: boolean;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    }>;
    /** Can detect humans, children or pets in its work zone. */
    presenceDetection: boolean;
    emergencyStop: "physical" | "remote" | "both" | "none";
    /** Ops the maker certifies for unattended use. */
    unattendedOps?: string[];
    /** Policy packs the device enforces itself. */
    policyPacks?: string[];
    minVerificationLevel?: {
      presence_required?: "V1" | "V2" | "V3";
      unattended?: "V2" | "V3";
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  /** How the hub reaches this actor. */
  interfaces: {
    /** Base URL of the actor's Cookwala executor API. */
    cookwalaHttp?: string;
    mqtt?: {
      topicPrefix?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    matter?: {
      nodeId?: string;
      endpoints?: Array<{
        endpoint?: number;
        deviceType?: string;
        /** Vendor extensions (x-<name>) and other pattern properties. */
        [key: `x-${string}`]: unknown;
      }>;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    ros2?: {
      namespace?: string;
      actionServer?: string;
      /** Vendor extensions (x-<name>) and other pattern properties. */
      [key: `x-${string}`]: unknown;
    };
    /** AgentCard URL (/.well-known/agent-card.json). */
    a2a?: string;
    mcp?: string;
    /** Entity id prefix if bridged through Home Assistant. */
    homeAssistant?: string;
    vendorCloud?: string;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  signature?: Signature;
  meta?: Meta;
  /** Live degradations (low light, weak grip, sensor fault...) so planners adapt before assigning tasks. */
  currentLimitations?: Degradation[];
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};
