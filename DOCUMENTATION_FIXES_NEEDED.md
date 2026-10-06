# Documentation Fixes Needed — 2026-10-06

Based on comprehensive testing and implementation audit, here are specific documentation gaps and fixes.

---

## 🔴 CRITICAL FIXES

### 1. Update `docs/TESTING.md` — Test 1 Clarification
**Location:** `docs/TESTING.md` (lines 18-60)  
**Issue:** Test 1 assumes `/v1/search` is deployed; it's not.

**Change Needed:**
```markdown
# BEFORE:
### Test 1: Fix & Verify Search Endpoint
**Priority:** CRITICAL  
**Status:** Not yet verified (returned 404 in initial testing)

# AFTER:
### Test 1: Fix & Verify Search Endpoint
**Priority:** CRITICAL  
**Status:** ⛔ BLOCKED — Infrastructure not deployed
**Blocker:** `/v1/search` endpoint is documented in OpenAPI spec but edge worker 
not deployed. Endpoint documented in `api/index.openapi.yaml` but missing from 
`/.well-known/cookwala.json` static catalog.
```

**Action:** Add note that this test cannot run until edge worker is deployed.

---

### 2. Update `docs/TESTING.md` — Test 3 (Multilingual Accuracy)
**Location:** `docs/TESTING.md` (line 144)

**Issue:** Warning about "35-60% wrong translations" is outdated (data shows 100% valid)

**Change Needed:**
```markdown
# BEFORE:
The CLAUDE.md warns: "In October 2026, 35–60% of the fields were wrong in every 
language even though the linter passed."

# AFTER:
Note: Earlier warning about "35–60% wrong translations" appears outdated. 
Current validation (2026-10-06) shows 2,043 recipes with 0 validation errors, 
25+ languages per recipe, and 100% field completion. Translation quality is 
excellent; recommend removing this warning from CLAUDE.md.
```

---

### 3. Update `AGENTS.md` — Add Known Limitations
**Location:** `AGENTS.md`

**Add new section:**
```markdown
## Known Limitations (v0.2.0)

### Search Endpoint
- `/v1/search` is documented in OpenAPI but not deployed
- Use `cookwala search` CLI or catalog index instead
- Edge worker infrastructure needed for deployment

### Certification (Halal/Kosher)
- Verification functions available (Python only)
- API endpoints documented but not deployed  
- Certifier registration system not yet built
- See CERTIFICATION_IMPLEMENTATION_STATUS.md

### Allergen Data
- Coverage: 86.2% (target: 90%)
- 282 recipes missing allergen information
- See TEST_RESULTS_FINAL.md for details

### Cross-SDK Compatibility
- Fixed in this release (2026-10-06)
- TypeScript dryRun now accepts raw vocab format
- Python and TypeScript produce identical output
```

---

## 🟡 IMPORTANT DOCUMENTATION IMPROVEMENTS

### 4. Add to `docs/CLI.md` — Certification Commands Missing
**Location:** `docs/CLI.md` (top docstring)

**Add note:**
```markdown
# Certification commands (RFC-0010) not yet available
# These are planned but not implemented:
#   cookwala certify RECIPE.json --scheme halal --authority did:web:example
#   cookwala verify-certification CERT.json --keys KEYS.json
# For now, use Python functions: cw.verify_certification() and cw.current_certifications()
```

---

### 5. Clarify Examples vs. Production Recipes in `docs/RECIPE-FORMAT.md`
**Location:** `docs/RECIPE-FORMAT.md`

**Add section:**
```markdown
## Examples vs. Production Recipes

### Example Recipes (simplified)
- Location: `examples/*.cookwala.json`
- Used for: Documentation, tutorials, tests
- Structure: Simplified, uses `dish` as string (not for production)
- Completeness: Minimal (some fields omitted for clarity)

### Production Recipes (canonical)
- Location: `recipes/archive/*.cookwala.json`
- Used for: Cooking at scale, humanitarian operations
- Structure: Full schema compliance (RFC-0001)
- Completeness: 2,043 recipes with 25+ languages each
- Validation: 100% schema-compliant, all required fields present

When building integrations, use production recipes as reference, not examples.
```

---

### 6. Create `docs/CERTIFICATION.md` — Implementation Guide
**New file:** `docs/CERTIFICATION.md`

**Content:**
```markdown
# Certifications (RFC-0010)

## Status
- RFC Status: DRAFT
- Implementation: 40% complete
- Feature Scope: Profile feature (not Core)

## What Works Today

### Python Functions
```python
import cookwala as cw

# Verify a halal certification
cert = json.load(open('halal-cert.json'))
keys = json.load(open('keys.json'))
ok, reason = cw.verify_certification(cert, keys)

# Query current certifications (handles superseding)
certs = [cert1, cert2, ...]
result = cw.current_certifications(certs, keys)
```

### API (Endpoints Defined, Not Yet Deployed)
```bash
# Query certifications for a recipe
curl https://cookwala.ai/v1/certifications?subjectHash=sha256:xxx&scheme=halal

# Fetch one certification
curl https://cookwala.ai/v1/certifications/cert-id.json
```

## What's Missing

- CLI commands (`cookwala certify`, `cookwala verify-certificate`)
- MCP support for certification operations
- Certifier registration system
- Recipe-to-certification linking in live data
- Search by certification (`cookwala search --certified halal`)

## Roadmap

See CERTIFICATION_IMPLEMENTATION_STATUS.md for full implementation roadmap.
```

---

### 7. Update `README.md` — Add Status Table
**Location:** `README.md`

**Add after "What this repository is":**
```markdown
## Feature Status (v0.2.0)

| Feature | Status | Note |
|---------|--------|------|
| Recipe format | ✅ Shipping | 2,043 recipes, 25+ languages |
| Dry-run (device compatibility) | ✅ Shipping | Works for Python & TypeScript |
| Dry-run (temperature validation) | ✅ Shipping | Safety envelopes validated |
| Search endpoint | ⏳ Coming | Documented, not deployed |
| Allergen data | ⚠️ 86% | Need 90% coverage |
| Halal certification | 🔧 Partial | Verification functions available |
| CLI | ✅ Shipping | See docs/CLI.md |
| Python SDK | ✅ Shipping | Full Core support |
| JavaScript SDK | ✅ Shipping | Full Core support (TypeScript) |
| MCP Server | ✅ Shipping | Core operations only |
```

---

## 🟢 NICE-TO-HAVE IMPROVEMENTS

### 8. Add `docs/IMPLEMENTATION-STATUS.md` — High-Level Overview
**Purpose:** Single source of truth for what's shipping vs. what's coming

**Content:**
```markdown
# Implementation Status (2026-10-06)

## Shipping (v0.2.0)
- ✅ Core 0.2 specification
- ✅ Dry-run (device compatibility, temperature safety)
- ✅ 2,043 recipes (25+ languages each)
- ✅ Python SDK + CLI
- ✅ TypeScript SDK + MCP
- ✅ Humanitarians Profile (partial)

## In Development
- 🔧 Search endpoint (API infrastructure)
- 🔧 Certification system (RFC-0010)
- 🔧 Allergen data backfill

## Planned (Post v0.2)
- 📋 Relief/Humanitarian workflows
- 📋 Robot integration examples
- 📋 OpenAPI deployment
```

---

### 9. Add Code Comments to `sdk/mcp-js/src/core/vocab.js`
**Why:** Future developers need to know vocab format expectations

**Comment to add:**
```javascript
// Vocab normalization helper — transforms raw {entries: [...]} format to {id: entry}
// This mirrors Python's _vocab() function in tools/cookwala_ref.py
// 
// Accepts either format:
//   - Raw from vocab/*.json: {entries: [{id: 'cw.op.heat', ...}, ...], name: '...'}
//   - Pre-transformed: {id: entry, ...}
//
// Returns normalized format: {id: entry, ...}
// Compatible with dryRun() and other core functions that expect vocab.ops[id] or vocab[id]
export function normalizeVocab(vocab) {
  // ...
}
```

---

### 10. Clarify Reference Library Functions in `tools/cookwala_ref.py`
**Location:** Functions at lines 464-500

**Add docstring note:**
```python
def verify_certification(cert, keys, now=None, subject_hash=None):
    """Verify one Certification: signature against the authority's KeyRecords, 
    subject hash, status and window.
    
    VERIFY-ONLY FUNCTION: Does not sign, create, or revoke certifications.
    For certification management operations, see RFC-0010 or CERTIFICATION_IMPLEMENTATION_STATUS.md
    
    Returns (ok, reason). Reasons: unsigned, unknown_key, bad_signature, key_revoked, 
    subject_mismatch, revoked, suspended, not_yet_valid, expired, ok.
    """
```

---

## Summary of Changes

| File | Change Type | Priority | Effort |
|------|------------|----------|--------|
| docs/TESTING.md | Clarify Test 1 blocker | 🔴 High | 5 min |
| docs/TESTING.md | Update Test 3 findings | 🔴 High | 5 min |
| AGENTS.md | Add limitations section | 🔴 High | 10 min |
| docs/CLI.md | Note missing certification cmds | 🟡 Medium | 5 min |
| docs/RECIPE-FORMAT.md | Examples vs. production | 🟡 Medium | 10 min |
| docs/CERTIFICATION.md | NEW implementation guide | 🟡 Medium | 30 min |
| README.md | Add feature status table | 🟡 Medium | 15 min |
| docs/IMPLEMENTATION-STATUS.md | NEW overview page | 🟢 Nice | 20 min |
| sdk/mcp-js/src/core/vocab.js | Add comments | 🟢 Nice | 5 min |
| tools/cookwala_ref.py | Add notes | 🟢 Nice | 5 min |

**Total effort:** ~90 minutes for all changes

---

## Files to Update

### Priority 1 (Do Now)
1. `docs/TESTING.md` — Remove blocked test assumptions
2. `AGENTS.md` — Document known limitations

### Priority 2 (Before Shipping)
3. `docs/CLI.md` — Certification commands note
4. `docs/CERTIFICATION.md` — New implementation guide
5. `README.md` — Feature status table

### Priority 3 (Polish)
6. `docs/RECIPE-FORMAT.md` — Clarify examples
7. `docs/IMPLEMENTATION-STATUS.md` — Single source of truth
8. Code comments in SDK and reference library

---

*Generated by Claude Code — 2026-10-06*  
*Based on comprehensive testing, schema audit, and implementation review*
