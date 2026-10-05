// Shared fixtures for the tests (no tests in this file).
import { loadBundle, globalRef } from '../src/data.js';
import { docHash } from '../src/jcs.js';

export const B = loadBundle();

/** An ExecuteRequest for a bundled recipe; overrides replace any field. */
export function requestFor(key, overrides = {}) {
  const r = B.recipes[key];
  const { id = `ex-${key}`, key: idem = `key-${key}-0001`, ...rest } = overrides;
  return { core: '0.2.0', kind: 'ExecuteRequest', id, recipe: globalRef(r), recipeHash: docHash(r), requestedBy: 'person:p-1', idempotencyKey: idem, ...rest };
}

export const clone = (v) => JSON.parse(JSON.stringify(v));
