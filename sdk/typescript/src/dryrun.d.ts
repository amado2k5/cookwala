// Types for the browser dry run (src/dryrun.js), a pure-function port of tools/cookwala_ref.py.
// The script sets a global `CookwalaDryRun`; import it for its side effect, then use the global.
import type { Recipe, Node } from "./types/recipe";
import type { Capabilities } from "./types/capabilities";

export type Rung = "model" | "time" | "human" | string;
export interface PlanStep { node: Node; by: "device" | "human"; verifiedBy: "sensor" | "model" | "time" | "human"; rung?: Rung; env?: unknown }
export interface Refusal { reason: "missing_capability" | "needs_human_present" | "missing_sensor_no_fallback"; node: string; detail: string }
export type DryRunResult = { state: "accepted"; plan: PlanStep[] } | { state: "refused"; refusal: Refusal; plan: PlanStep[]; at: Node };
export interface OpsById { [opId: string]: { envelope?: { sensorLadder?: string[]; unattended?: boolean; medium?: string; tempC?: { min: number; max: number } } } }
export interface CookwalaDryRunApi {
  dryRun(recipe: Recipe, device: Capabilities | { capabilities: Capabilities["capabilities"] }, ops: OpsById, humanPresent: boolean, allowModel: boolean): DryRunResult;
  ladderChoice(env: OpsById[string]["envelope"], sensors: Set<string>, allowModel: boolean, humanPresent: boolean): Rung | null;
  opLabel(id: string): string;
}
declare global { var CookwalaDryRun: CookwalaDryRunApi }
export {};
