# Cookwala Testing Results — 2026-10-06

**Summary:** Ran critical tests from [docs/TESTING.md](docs/TESTING.md). Found 3 blocking issues.

---

## Test Results

### 🔴 Test 1: Fix & Verify Search Endpoint
**Status:** ❌ FAILED  
**Severity:** CRITICAL

**Finding:** The `/v1/search` endpoint is documented in the OpenAPI spec but returns 404 in production. The spec indicates it should be served by an edge worker, but the infrastructure is not deployed.

**Details:**
- GET `https://cookwala.ai/v1/search?q=koshari` → 404 (GitHub Pages)
- POST `https://cookwala.ai/v1/search` → 405 Method Not Allowed
- Alternative routes `/v1/recipes/search` and `/api/v1/search` → 404

**Evidence:**
```yaml
# OpenAPI spec states:
/v1/search:
  get:
    operationId: search
    summary: Full-text and faceted search
```

```yaml
# /.well-known/cookwala.json lists static endpoints but NOT /v1/search
endpoints:
  manifest: https://cookwala.ai/v1/manifest.json   # ✓ Works
  recipe: https://cookwala.ai/v1/recipes/{id}.cookwala.json  # ✓ Works
  search: NOT LISTED  # ❌ Missing
```

**Impact:** Search is a primary user-facing feature. Broken search blocks basic discoverability.

**Recommendation:** Deploy edge worker for `/v1/search` endpoint or remove from OpenAPI spec if not planned yet.

---

### 🔴 Test 2: Cross-SDK Compatibility (Python vs TypeScript)
**Status:** ⚠️ PARTIAL FAILURE  
**Severity:** CRITICAL

**Finding:** Python and TypeScript SDKs have incompatible APIs and vocab loading patterns.

**API Signature Mismatch:**
```python
# Python SDK
dry_run(recipe, capabilities, human_present=False, allow_model=True, ...)

# TypeScript SDK
dryRun(vocab, recipe, capabilities, { humanPresent: false, allowModel: true, ... })
```

**Vocab Loading Discrepancy:**
- **Python:** Auto-loads vocab internally via `_vocab('ops')`, transforms `{entries: [...]}` → `{id: entry}`
- **TypeScript:** Requires explicit vocab parameter, expects pre-transformed format

**Testing Status:**
- ✅ Python dry_run works: koshari + demo-oven → accepted, 20 steps
- ❌ TypeScript dry_run fails: vocab structure mismatch → `Cannot read properties of undefined`

**Root Cause:** The TypeScript implementation expects `vocab.ops[id]` but is given `vocab.entries`.

**Recommendation:** 
1. Standardize API signatures across SDKs (both should take same parameters in same order)
2. Provide vocab loader in TypeScript or document that users must transform vocab
3. Add cross-SDK test suite to prevent regression

---

### 🔴 Test 3: Multilingual Recipe Accuracy (Spot Check)
**Status:** ⚠️ DATA QUALITY ISSUE  
**Severity:** HIGH

**Finding:** Example recipes have non-standard structure; translations may not be in expected format.

**Observations:**
- Example recipes (`examples/basbousa.cookwala.json`) use field `dish` instead of `title`
- Community recipe (`recipes/community/demo/demo-mint-lemonade.cookwala.json`) has title as complex object: `{'names': {'en': '...', 'ar': '...'}, 'cuisine': [...], 'course': '...'}`
- Ingredients missing expected fields: no `n` (name), `q` (quantity), `u` (unit) — appear as `?`
- No `x-titles` dictionary found in test recipes

**Data Quality Concern:**
The warning in CLAUDE.md states: *"In October 2026, 35–60% of the fields were wrong in every language even though the linter passed."* 

Current recipe structure inconsistencies suggest either:
1. Schema has evolved since examples were created
2. Example recipes are deprecated/test-only
3. Real catalog recipes use different structure than examples

**Recommendation:** 
1. Clarify which recipes are canonical (check actual fifi.cooking export)
2. Ensure examples match current schema
3. Run schema validation on sample of real catalog recipes to estimate translation quality

---

## Test Execution Summary

| Test | Priority | Status | Time | Notes |
|------|----------|--------|------|-------|
| Test 1: Search | 🔴 | ❌ | 15 min | Endpoint not deployed |
| Test 2: Cross-SDK | 🔴 | ⚠️ | 30 min | API mismatch, vocab loading inconsistency |
| Test 3: Multilingual | 🔴 | ⚠️ | 20 min | Structure inconsistencies, data quality unclear |

**Total Time:** 65 minutes  
**Tests Completed:** 3/18  
**Blocking Issues Found:** 3 (all CRITICAL/HIGH)

---

## Recommended Next Actions

### Immediate (Blocks Shipping)
1. **Fix search endpoint** — Deploy edge worker or remove from spec
2. **Standardize SDK APIs** — Make Python and TypeScript APIs equivalent
3. **Clarify recipe data structure** — Confirm canonical schema and update examples

### High Priority
4. Run full conformance test (`python tools/run_conformance.py`)
5. Validate sample of 50+ real catalog recipes against schema
6. Create cross-SDK test matrix (Test 2 in TESTING.md)

### Medium Priority
7. Continue high-priority tests (4-7 in TESTING.md):
   - Allergen filtering
   - Halal enforcement
   - Device capability matching
   - Temperature envelope validation

---

## Resources

- **Full testing guide:** [docs/TESTING.md](docs/TESTING.md)
- **OpenAPI spec:** [api/index.openapi.yaml](api/index.openapi.yaml)
- **Schema:** [schemas/recipe.schema.json](schemas/recipe.schema.json)
- **Python ref:** [tools/cookwala_ref.py](tools/cookwala_ref.py)

---

*Generated by Claude Code — 2026-10-06*
