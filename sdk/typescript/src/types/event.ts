// Generated from event.schema.json by tools/gen_ts_types.py. Do not edit; regenerate.
// Status: core. Cookwala Event

import type { Actor, DateTime, LangMap } from "./common";
import type { Item } from "./inventory";
import type { TaskState } from "./session";

export type EventType = ("cookwala.session.created" | "cookwala.session.planned" | "cookwala.session.state_changed" | "cookwala.session.completed" | "cookwala.session.aborted" | "cookwala.policy.evaluated" | "cookwala.policy.acknowledged" | "cookwala.task.assigned" | "cookwala.task.started" | "cookwala.task.progress" | "cookwala.task.condition_met" | "cookwala.task.input_required" | "cookwala.task.completed" | "cookwala.task.failed" | "cookwala.task.reassigned" | "cookwala.lease.requested" | "cookwala.lease.granted" | "cookwala.lease.released" | "cookwala.lease.revoked" | "cookwala.handoff.proposed" | "cookwala.handoff.ready" | "cookwala.handoff.acknowledged" | "cookwala.handoff.completed" | "cookwala.handoff.refused" | "cookwala.ccp.recorded" | "cookwala.ccp.failed" | "cookwala.telemetry.reading" | "cookwala.device.online" | "cookwala.device.offline" | "cookwala.device.fault" | "cookwala.device.capabilities_changed" | "cookwala.inventory.changed" | "cookwala.inventory.low" | "cookwala.inventory.expiring" | "cookwala.inventory.reserved" | "cookwala.order.intent_created" | "cookwala.order.approval_required" | "cookwala.order.placed" | "cookwala.order.status" | "cookwala.order.delivered" | "cookwala.notify.request" | "cookwala.notify.delivered" | "cookwala.notify.acknowledged" | "cookwala.human.presence" | "cookwala.human.confirmation" | "cookwala.human.override" | "cookwala.safety.estop" | "cookwala.safety.smoke" | "cookwala.safety.co" | "cookwala.safety.gas_leak" | "cookwala.safety.fire" | "cookwala.safety.overtemp" | "cookwala.safety.boilover" | "cookwala.safety.spill" | "cookwala.safety.intrusion_zone" | "cookwala.safety.child_or_pet_in_zone" | "cookwala.safety.unattended_heat" | "cookwala.safety.water_leak" | "cookwala.safety.power_loss" | "cookwala.safety.cleared" | "cookwala.team.cfp" | "cookwala.team.bid" | "cookwala.team.award" | "cookwala.team.decline" | "cookwala.team.plan" | "cookwala.team.replan" | "cookwala.advice.requested" | "cookwala.advice.answered" | "cookwala.advice.applied" | "cookwala.mode.changed" | "cookwala.device.battery" | "cookwala.market.quote_requested" | "cookwala.market.quote" | "cookwala.market.offer_changed" | "cookwala.flow.started" | "cookwala.flow.step" | "cookwala.flow.completed" | "cookwala.flow.failed" | "cookwala.relief.need_opened" | "cookwala.relief.need_updated" | "cookwala.relief.pledge_offered" | "cookwala.relief.allocated" | "cookwala.relief.dispatched" | "cookwala.relief.delivered" | "cookwala.relief.impact" | "cookwala.relief.surplus_available" | "cookwala.mission.assessment" | "cookwala.mission.conflict" | "cookwala.mission.reconciled" | "cookwala.mission.budget_threshold" | "cookwala.mission.degradation" | "cookwala.mission.adaptation" | "cookwala.mission.decision" | "cookwala.mission.closed" | "cookwala.device.heartbeat" | "cookwala.execution.accepted" | "cookwala.execution.refused" | "cookwala.execution.state_changed" | "cookwala.execution.step" | "cookwala.execution.completed" | "cookwala.safety.limit_fired" | "cookwala.recall.published" | string);

export type SafetyData = {
  level: "warning" | "alarm" | "emergency";
  /** Required response from every participant. */
  action: "none" | "pause_all" | "heat_off_all" | "abort_session" | "evacuate";
  zone?: string;
  reading?: {
    [key: string]: unknown;
  };
  detectedBy?: Actor;
  /** True when the hub matched it to recipe safety.environment.smokeExpected; never suppresses alarms, only adds context for humans. */
  expected?: boolean;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type TaskData = {
  taskId: string;
  nodeId?: string;
  recipeId?: string;
  state: TaskState;
  assignee?: Actor;
  progress?: number;
  message?: LangMap;
  reason?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type TelemetryData = {
  taskId?: string;
  readings: Array<{
    sensor: string;
    value: unknown;
    unit?: string;
    target?: string;
    confidence?: number;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type InventoryData = {
  items?: Item[];
  storage?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

export type NotifyData = {
  audience: string[];
  urgency: "info" | "action_needed" | "time_critical" | "emergency";
  message: LangMap;
  actions?: Array<{
    id?: string;
    label?: LangMap;
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  }>;
  channels?: string[];
  expiresAt?: DateTime;
  relatesTo?: string;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Contract-net style teaming: a robot (or the hub) issues a call for proposals for tasks; helpers bid with capability, ETA, battery and cost; the hub awards. */
export type TeamData = {
  cfpId?: string;
  sessionId?: string;
  tasks?: string[];
  from?: string;
  bid?: {
    actorId?: string;
    canDo?: string[];
    etaS?: number;
    durationS?: number;
    batteryAfterPct?: number;
    energyWh?: number;
    confidence?: number;
    constraints?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  award?: {
    actorId?: string;
    tasks?: string[];
    /** Vendor extensions (x-<name>) and other pattern properties. */
    [key: `x-${string}`]: unknown;
  };
  deadline?: DateTime;
  /** Vendor extensions (x-<name>) and other pattern properties. */
  [key: `x-${string}`]: unknown;
};

/** Every message on the kitchen event bus (MQTT, WebSocket, SSE, webhooks) is a CloudEvents 1.0 JSON event with a type from the cookwala catalog below. Safety events have priority and must be delivered to every participant. */
export type Event = (unknown & unknown & unknown & unknown & unknown & unknown);
