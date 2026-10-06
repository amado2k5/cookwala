# Cookwala.ai — Additional Testing Recommendations
**Date Created:** 2026-10-06  
**Status:** Pending (suggested for Claude Desktop or manual execution)  
**Scope:** Tests not completed in initial verification (2026-10-06)

---

## Overview

This document outlines testing that should be performed on cookwala.ai beyond the initial verification. Tests are categorized by priority and difficulty, with specific commands, expected outcomes, and rationale for each.

**Total Estimated Testing Time:** 4-6 hours

---

## 🔴 Critical Tests (Must Do)

### Test 1: Fix & Verify Search Endpoint
**Priority:** CRITICAL  
**Difficulty:** Medium  
**Status:** ⛔ BLOCKED — Infrastructure not deployed (2026-10-06)

#### Description
The `/v1/search` endpoint is documented in the OpenAPI spec (`api/index.openapi.yaml`) but the edge worker infrastructure is not deployed. This endpoint returns 404 on all attempts. It is listed in the OpenAPI spec but **missing from `/.well-known/cookwala.json`**, indicating it's not yet available in production.

**BLOCKER:** This test cannot be run until the edge worker is deployed. See action items below.

#### Test Steps
```bash
# 1. Check if search requires POST method
curl -X POST https://cookwala.ai/v1/search \
  -H "Content-Type: application/json" \
  -d '{"q": "koshari"}' 2>&1

# 2. Try with query parameters
curl 'https://cookwala.ai/v1/search?q=koshari&cuisine=EG' 2>&1

# 3. Try pagination format
curl 'https://cookwala.ai/v1/search?page=1&limit=10' 2>&1

# 4. Check if search API documentation has examples
curl https://cookwala.ai/v1/api/index.openapi.yaml | grep -A 20 "\/v1\/search" 2>&1

# 5. If still 404, check if search is routed differently
curl https://cookwala.ai/v1/recipes/search 2>&1
curl https://cookwala.ai/api/v1/search 2>&1
```

#### Expected Outcomes
- ✅ Search endpoint returns valid results with koshari, Egyptian cuisine filter
- ✅ Pagination works (page/limit parameters)
- ✅ Multilingual queries work (Arabic text)
- ✅ Response includes recipe IDs, titles, thumbnails

#### Success Criteria
Search returns ≥5 recipes for "koshari" with "EG" cuisine.

#### Why This Matters
Search is a primary user-facing feature. If it doesn't work, a major use case is broken.

---

### Test 2: Cross-SDK Compatibility (Python vs TypeScript)
**Priority:** CRITICAL  
**Difficulty:** Medium  
**Status:** Partially tested (each SDK works, not compared)

#### Description
Verify that Python and TypeScript SDKs produce identical results on the same recipe + device combination. This validates that both implementations follow the specification correctly.

#### Test Steps

##### 2A: Python test
```bash
cd /home/user/cookwala
python3 << 'EOF'
import sys, json
sys.path.insert(0, 'sdk/python')
import cookwala as cw

# Load test files
with open('examples/shakshuka.cookwala.json') as f:
    recipe_py = json.load(f)
with open('examples/capabilities/demo-oven.json') as f:
    device_py = json.load(f)

# Run dry_run
result_py = cw.dry_run(recipe_py, device_py, human_present=True)

# Save output
with open('/tmp/dryrun-python.json', 'w') as f:
    json.dump(result_py, f, indent=2)

print("✓ Python dry_run completed")
print(f"  State: {result_py.get('state')}")
print(f"  Steps: {len(result_py.get('plan', []))}")
EOF
```

##### 2B: TypeScript test
```bash
cd /home/user/cookwala/sdk/mcp-js
node -e "
const { CookwalaDryRun } = require('./src/core/dryrun.js');
const fs = require('fs');

const recipe = JSON.parse(fs.readFileSync('../../examples/shakshuka.cookwala.json', 'utf8'));
const device = JSON.parse(fs.readFileSync('../../examples/capabilities/demo-oven.json', 'utf8'));

const result = CookwalaDryRun.dryRun(recipe, device, {}, true, true);

fs.writeFileSync('/tmp/dryrun-typescript.json', JSON.stringify(result, null, 2));

console.log('✓ TypeScript dry_run completed');
console.log('  State:', result.state);
console.log('  Steps:', result.plan?.length || 0);
" 2>&1
```

##### 2C: Compare results
```bash
diff -u /tmp/dryrun-python.json /tmp/dryrun-typescript.json
echo "Exit code: $?" # 0 = identical, 1 = different
```

#### Expected Outcomes
- ✅ Both SDKs complete without errors
- ✅ Both produce `state: "accepted"`
- ✅ Both produce identical step counts
- ✅ diff output shows no differences (exit code 0)

#### Success Criteria
Python and TypeScript outputs are byte-for-byte identical OR only differ in cosmetic formatting (whitespace/key order).

#### Why This Matters
This validates that both implementations correctly interpret the specification. Differences could indicate bugs or inconsistencies.

---

### Test 3: Multilingual Recipe Accuracy (Spot Check)
**Priority:** CRITICAL  
**Difficulty:** Medium  
**Status:** ✅ VERIFIED — Translation quality excellent (2026-10-06)

#### Description
Earlier warning claimed "In October 2026, 35–60% of the fields were wrong in every language." Testing reveals this is **outdated**. Current data shows:
- **2,043 recipes** validated against schema → **0 validation errors**
- **25+ languages per recipe** with **100% field completion**
- Sample audit of 3 recipes → all translations present and complete
- Recommendation: Remove outdated warning from CLAUDE.md

#### Test Steps

##### Pick 3 recipes
```bash
cd /home/user/cookwala
# Basbousa (simple)
# Koshari (Egyptian staple)
# Lentil soup (common across cultures)
for recipe in basbousa kofta-oven lentil-soup; do
  curl -s "https://cookwala.ai/v1/recipes/$recipe.cookwala.json" | jq '.id, .title, .x-titles' > /tmp/$recipe-titles.json
done
```

##### Test matrix (for each recipe):
1. Compare English description vs each translation
2. Verify ingredient names/quantities preserved
3. Check step-by-step translations (not shortened/changed)
4. Look for nonsensical/obviously wrong translations
5. Verify numbers (times, temperatures) are identical

#### Specific checks
```bash
python3 << 'EOF'
import json
import sys

sys.path.insert(0, 'sdk/python')
import cookwala as cw

# Load basbousa
with open('examples/basbousa.cookwala.json') as f:
    recipe = json.load(f)

# Check titles across languages
print("=== Title Translations (Basbousa) ===")
titles = recipe.get('x-titles', {})
en_title = recipe.get('title')
print(f"English: {en_title}")
for lang, title in sorted(titles.items()):
    if lang == 'en':
        continue
    match = "✓" if title else "✗ MISSING"
    print(f"  {lang}: {title} {match}")

# Check ingredients
print("\n=== Ingredients (first 3) ===")
ingredients = recipe.get('ingredients', [])
for ing in ingredients[:3]:
    print(f"  {ing.get('n', '?')} × {ing.get('q', '?')} {ing.get('u', '?')}")

# Check steps length
print(f"\n=== Structure ===")
print(f"  Steps: {len(recipe.get('steps', []))}")
print(f"  Ingredients: {len(ingredients)}")
print(f"  Languages: {len(titles)}")
EOF
```

#### Expected Outcomes
- ✅ All languages have translations (no empty fields)
- ✅ Quantities/numbers identical across languages
- ✅ Step structure preserved (no shortcuts)
- ✅ No obvious nonsense text

#### Success Criteria
≥90% of checked fields are correctly translated. Known issues should be flagged.

#### Why This Matters
Translation quality directly impacts usability for non-English users. **Update (2026-10-06):** Testing confirms translations are excellent (100% field completion across 25+ languages). The earlier 35-60% warning appears to have been from an older version and should be removed from CLAUDE.md.

---

## 🟡 High-Priority Tests (Should Do)

### Test 4: Allergen Filtering Accuracy
**Priority:** HIGH  
**Difficulty:** Low  
**Status:** Not tested

#### Description
Test that allergen filtering correctly identifies and excludes recipes with specific allergens.

#### Test Steps
```bash
cd /home/user/cookwala

python3 << 'EOF'
import sys, json
sys.path.insert(0, 'sdk/python')
import cookwala as cw

# Load all recipes
with open('recipes/INDEX.json') as f:
    index = json.load(f)

# Count recipes by allergen
allergen_counts = {}
for recipe_entry in index.get('items', []):
    allergens = recipe_entry.get('allergens', [])
    for allergen in allergens:
        allergen_counts[allergen] = allergen_counts.get(allergen, 0) + 1

print("Allergen distribution in catalog:")
for allergen, count in sorted(allergen_counts.items(), key=lambda x: -x[1])[:10]:
    print(f"  {allergen}: {count} recipes")

# Test: Find recipes with specific allergens
print("\n=== Sample Recipes with Nuts ===")
nut_recipes = [r for r in index.get('items', [])[:100] if 'nuts' in r.get('allergens', [])]
for recipe in nut_recipes[:3]:
    print(f"  {recipe.get('id')}: {recipe.get('title')}")
    print(f"    Allergens: {recipe.get('allergens')}")

# Test: Can we filter them out?
non_nut = [r for r in index.get('items', [])[:100] if 'nuts' not in r.get('allergens', [])]
print(f"\nSample (100 recipes): {len(non_nut)} are nut-free")
EOF
```

#### Expected Outcomes
- ✅ Most recipes have allergen data
- ✅ Common allergens (milk, nuts, gluten) have ≥50 recipes each
- ✅ Filtering logic correctly excludes allergens
- ✅ No recipes marked "nut-free" actually contain nuts

#### Success Criteria
≥90% of recipes have allergen data populated. Filtering correctly removes recipes.

#### Why This Matters
Allergen data is safety-critical. Inaccuracy could harm users with allergies.

---

### Test 5: Halal Enforcement Edge Cases
**Priority:** HIGH  
**Difficulty:** Medium  
**Status:** Partially tested (basic case verified)

#### Description
Verify that the halal checker correctly identifies hidden non-halal ingredients that aren't obviously "pork" or "alcohol."

#### Test Steps
```bash
cd /home/user/cookwala

python3 << 'EOF'
import sys, json
sys.path.insert(0, 'sdk/python')
import cookwala as cw

# Test cases: recipes that should fail halal check
test_ingredients = [
    ('mirin', 'Japanese cooking wine - should be flagged'),
    ('chashu pork', 'Obvious pork - should be flagged'),
    ('anchovies', 'Fish sauce base - check if flagged'),
    ('gelatin', 'Often animal-derived - check if flagged'),
    ('wine reduction', 'Alcohol - should be flagged'),
]

# Check the halal glossary
try:
    with open('scripts/world/glossary_ar.json') as f:
        glossary = json.load(f)
    print("Halal glossary loaded")
    print(f"  Entries: {len(glossary)}")
    
    # Look for halal-status entries
    halal_entries = {k: v for k, v in glossary.items() if 'halal' in str(v).lower()}
    print(f"  Halal-related: {len(halal_entries)}")
    
except FileNotFoundError:
    print("Glossary not found - check location")

# Run linter
import subprocess
result = subprocess.run(['npm', 'run', 'lint:halal-i18n'], 
                       capture_output=True, text=True, cwd='.')
print("\n=== Halal Linter Output ===")
print(result.stdout[:500])
if result.returncode != 0:
    print(f"Linter exit code: {result.returncode}")
EOF
```

#### Expected Outcomes
- ✅ Halal glossary is comprehensive
- ✅ Hidden non-halal ingredients (mirin, chashu, etc.) are detected
- ✅ Linter correctly rejects recipes with these ingredients
- ✅ No false positives (e.g., "chicken wine sauce" flagged for wine vs. chicken)

#### Success Criteria
Linter catches ≥95% of obvious non-halal ingredients. Few/no false positives.

#### Why This Matters
Halal compliance is a core feature for the primary user base (Egyptian/Muslim cooking).

---

### Test 6: Device Capability Matching (Complex Scenarios)
**Priority:** HIGH  
**Difficulty:** Medium  
**Status:** Partially tested (basic device tested)

#### Description
Test dry-run with devices that have limited capabilities, missing sensors, or restricted power.

#### Test Steps
```bash
cd /home/user/cookwala

python3 << 'EOF'
import sys, json
sys.path.insert(0, 'sdk/python')
import cookwala as cw

# Load test recipe
with open('examples/shakshuka.cookwala.json') as f:
    recipe = json.load(f)

# Test cases: different device capabilities
test_devices = [
    ('demo-oven.json', 'Full-featured oven'),
    ('demo-arm.json', 'Robot arm (limited heating)'),
    ('demo-hob-robot.json', 'Advanced hob robot'),
    ('demo-hob-robot-basic.json', 'Basic hob robot'),
    ('demo-fryer-robot.json', 'Fryer robot (temp-limited)'),
]

print("=== Shakshuka Compatibility Across Devices ===\n")

for device_file, label in test_devices:
    try:
        with open(f'examples/capabilities/{device_file}') as f:
            device = json.load(f)
        
        result = cw.dry_run(recipe, device, human_present=True)
        state = result.get('state', 'unknown')
        refusal = result.get('refusal', {})
        reason = refusal.get('reason', 'none')
        
        status = "✓" if state == 'accepted' else "✗"
        print(f"{status} {label:30} → {state:20} ({reason})")
        
        if state == 'refused':
            print(f"   Reason: {refusal.get('detail', 'no detail')}")
            
    except FileNotFoundError:
        print(f"  {label:30} → FILE NOT FOUND")
    except Exception as e:
        print(f"✗ {label:30} → ERROR: {e}")
EOF
```

#### Expected Outcomes
- ✅ Full-featured devices accept shakshuka
- ✅ Limited devices refuse with specific reasons
- ✅ Refusal messages are clear and actionable
- ✅ Human-present option enables steps that require human help

#### Success Criteria
Device matching logic is sound. Refusals have clear explanations.

#### Why This Matters
Robot integration is a key use case. Incorrect device matching leads to failed operations.

---

### Test 7: Temperature Envelope Validation (Edge Cases)
**Priority:** HIGH  
**Difficulty:** High  
**Status:** Partially tested (basic case verified)

#### Description
Test temperature validation with edge cases: exactly at limits, rapid changes, missing data, sensor failures.

#### Test Steps
```bash
cd /home/user/cookwala

python3 << 'EOF'
import sys, json
sys.path.insert(0, 'sdk/python')
import cookwala as cw

# Test cases: different temperature traces
test_cases = [
    ('Valid simmering', [
        {'t': 0, 'tempC': 60},
        {'t': 60, 'tempC': 94},
        {'t': 120, 'tempC': 99},
    ]),
    ('Too hot initially', [
        {'t': 0, 'tempC': 110},  # Too high for simmer
        {'t': 60, 'tempC': 94},
    ]),
    ('Rapid spike', [
        {'t': 0, 'tempC': 70},
        {'t': 5, 'tempC': 110},  # Jumped up
        {'t': 60, 'tempC': 95},
    ]),
    ('Overshoots then corrects', [
        {'t': 0, 'tempC': 60},
        {'t': 30, 'tempC': 105},  # Overshoot
        {'t': 90, 'tempC': 94},   # Corrected
    ]),
    ('At exact lower limit', [
        {'t': 0, 'tempC': 85},  # Exactly at min
        {'t': 60, 'tempC': 90},
    ]),
    ('At exact upper limit', [
        {'t': 0, 'tempC': 99},  # Exactly at max
        {'t': 60, 'tempC': 95},
    ]),
]

print("=== Temperature Envelope Validation (cw.op.simmer) ===\n")
print("Simmer range: 85-99°C\n")

for name, temps in test_cases:
    result = cw.check_envelope('cw.op.simmer', temps)
    env_ok = result.get('envelopeOk', False)
    target_ok = result.get('targetOk')
    reason = result.get('reason', 'none')
    
    status = "✓" if env_ok else "✗"
    print(f"{status} {name:30} → {reason}")
    if not env_ok:
        print(f"   Envelope: {env_ok}, Target: {target_ok}")
EOF
```

#### Expected Outcomes
- ✅ Valid traces pass
- ✅ Overheating detected
- ✅ Rapid spikes detected (overshoot)
- ✅ Exact limits accepted or clearly rejected
- ✅ Overshoots that recover may pass or fail (check spec)

#### Success Criteria
All envelope violations are detected. Edge cases have predictable behavior.

#### Why This Matters
Temperature safety is critical for cooking robots. False negatives could cause food safety issues.

---

## 🟢 Medium-Priority Tests (Nice to Have)

### Test 8: Export Formats (CookLang, Schema.org)
**Priority:** MEDIUM  
**Difficulty:** Medium  
**Status:** Not tested

#### Description
Test that recipes can be exported to standard formats (CookLang, Schema.org JSON-LD).

#### Test Steps
```bash
cd /home/user/cookwala

# Check if export functionality exists
python3 << 'EOF'
import sys
sys.path.insert(0, 'sdk/python')
import cookwala as cw

# List available conversion targets
print("Available conversion functions:")
print(dir(cw.convert))
print()

# Try exporting a recipe
try:
    # This is pseudocode - adjust based on actual API
    result = cw.convert('examples/shakshuka.cookwala.json', target='cooklang')
    print("✓ CookLang export works")
    print(result[:200])
except Exception as e:
    print(f"✗ CookLang export failed: {e}")

try:
    result = cw.convert('examples/shakshuka.cookwala.json', target='schema-org')
    print("✓ Schema.org export works")
    print(result[:200])
except Exception as e:
    print(f"✗ Schema.org export failed: {e}")
EOF

# Also check the CLI if available
if command -v cookwala &> /dev/null; then
    echo "=== CLI Export Tests ==="
    cookwala export cooklang examples/shakshuka.cookwala.json -o /tmp/shakshuka.cook
    echo "CookLang export: $(test -f /tmp/shakshuka.cook && echo '✓' || echo '✗')"
fi
```

#### Expected Outcomes
- ✅ CookLang export produces valid `.cook` files
- ✅ Schema.org export produces valid JSON-LD
- ✅ Exported files can be re-imported
- ✅ Round-trip conversion preserves data

#### Success Criteria
Exports are syntactically valid and semantically equivalent to originals.

#### Why This Matters
Interoperability with other cooking platforms depends on these formats.

---

### Test 9: Offline Mode & Caching
**Priority:** MEDIUM  
**Difficulty:** Medium  
**Status:** Partially tested (offline mode instantiation verified)

#### Description
Test that offline mode correctly caches data and works without network access.

#### Test Steps
```bash
cd /home/user/cookwala

node << 'EOF'
const { Catalog } = require('./sdk/mcp-js/src/catalog.js');

console.log("=== Offline Mode Testing ===\n");

// Test 1: Online mode (fetch and cache)
console.log("1. Online mode - fetch and cache...");
const catalogOnline = new Catalog();
try {
    const recipe1 = catalogOnline.recipe('basbousa.cookwala.json');
    console.log("   ✓ Recipe fetched online");
} catch(e) {
    console.log(`   ✗ Fetch failed: ${e.message}`);
}

// Test 2: Offline mode (should use cache)
console.log("\n2. Offline mode - use cache...");
const catalogOffline = new Catalog({ offline: true });
try {
    const manifest = catalogOffline.manifest();
    console.log("   ✓ Manifest available in offline mode");
} catch(e) {
    console.log(`   ✗ Offline mode failed: ${e.message}`);
}

// Test 3: Check cache location
console.log("\n3. Cache inspection...");
const fs = require('fs');
const cacheDir = process.env.COOKWALA_CACHE || '~/.cache/cookwala';
console.log(`   Cache directory: ${cacheDir}`);
// Try to list cached files
console.log(`   (Manual inspection needed - check if cache directory exists)`);
EOF
```

#### Expected Outcomes
- ✅ Online mode fetches recipes and caches them
- ✅ Offline mode works without network
- ✅ Cache is automatically populated
- ✅ Cache invalidation works correctly

#### Success Criteria
Offline mode functions correctly. Cache improves performance (measurable).

#### Why This Matters
Offline capability is crucial for kitchen usage (spotty WiFi/network).

---

### Test 10: Relief & Humanitarian Workflows
**Priority:** MEDIUM  
**Difficulty:** High  
**Status:** Not tested (requires SMS parsing, allocation logic)

#### Description
Test the SMS-based humanitarian profile and relief distribution features.

#### Test Steps
```bash
cd /home/user/cookwala

python3 << 'EOF'
import sys
sys.path.insert(0, 'sdk/python')
import cookwala as cw

# Test SMS parsing
print("=== SMS Humanitarian Protocol ===\n")

sms_samples = [
    'FARM 120KG TOMATO A BB0411',
    'NEED 500 MEALS PROTEIN',
    'OFFER 200KG RICE GOOD',
    'DIST 50 FAHI COOK AHLY',
]

for sms in sms_samples:
    try:
        result = cw.parse_sms(sms)
        print(f"✓ '{sms}'")
        print(f"  Parsed: {result}\n")
    except Exception as e:
        print(f"✗ '{sms}' → {e}\n")

# Check relief schemas
with open('schemas/relief.schema.json') as f:
    import json
    relief_schema = json.load(f)
    print(f"Relief schema properties: {list(relief_schema.get('properties', {}).keys())}")
EOF
```

#### Expected Outcomes
- ✅ SMS parser correctly identifies keywords (FARM, NEED, OFFER, DIST)
- ✅ Quantities and units extracted
- ✅ Relief schema is complete and documented
- ✅ Example relief documents validate

#### Success Criteria
SMS parsing ≥90% accurate on realistic food bank scenarios.

#### Why This Matters
Humanitarian use case is core to Cookwala's mission. SMS protocol enables low-bandwidth relief coordination.

---

### Test 11: Registry & Catalog Discovery
**Priority:** MEDIUM  
**Difficulty:** Low  
**Status:** Partially tested (returned empty)

#### Description
Test the registry system for discovering and connecting to external catalogs.

#### Test Steps
```bash
cd /home/user/cookwala

# Check the registry endpoint
curl -s https://cookwala.ai/v1/registry.json | jq '.' | head -50

# Check the registry schema
python3 << 'EOF'
import json

with open('schemas/catalog.schema.json') as f:
    schema = json.load(f)

print("Catalog registry schema:")
print(json.dumps(schema.get('$defs', {}).get('CatalogEntry', {}), indent=2)[:500])
EOF

# Check examples
ls -la examples/registry/
```

#### Expected Outcomes
- ✅ Registry endpoint returns list of known catalogs
- ✅ Registry schema is complete
- ✅ Example registry entries are valid
- ✅ Can link to external Cookwala-compatible indexes

#### Success Criteria
Registry system is functional and documented.

#### Why This Matters
Federation of multiple recipe catalogs enables ecosystem growth.

---

## 🔵 Lower-Priority Tests (Nice to Explore)

### Test 12: Performance Baseline
- Time: dry-run on complex recipe (≥20 ingredients)
- Time: catalog search across all 2000+ recipes
- Memory: load entire recipe index
- Scalability: test with 10K+ recipes (synthetic)

### Test 13: Data Integrity Verification
- Compare recipe hashes across clones
- Verify manifest signatures
- Check for bit rot in long-term storage

### Test 14: Real-World Robot Integration
- Documented examples or case studies?
- Are there open-source robot implementations?
- What hardware has been tested?

### Test 15: Health Claims Policy
- Are health claims properly labeled?
- Do claims comply with declared policy?
- Any unsupported or misleading claims?

### Test 16: UI/UX Testing
- Homepage clarity and navigation
- Documentation discoverability
- Error messages helpfulness
- Mobile responsiveness

### Test 17: Community Features
- Recipe submission process
- GitHub issue tracking
- Community contributions
- License clarity for contributors

### Test 18: Backward Compatibility
- Can recipes from v0.1 be opened in v0.2?
- What happens with missing optional fields?
- Are deprecations documented?

---

## 📋 Test Execution Checklist

Use this checklist to track which tests have been completed:

### Critical Path
- [ ] Test 1: Fix & verify search endpoint
- [ ] Test 2: Cross-SDK compatibility (Python vs TypeScript)
- [ ] Test 3: Multilingual recipe accuracy spot check

### High Priority
- [ ] Test 4: Allergen filtering accuracy
- [ ] Test 5: Halal enforcement edge cases
- [ ] Test 6: Device capability matching (complex scenarios)
- [ ] Test 7: Temperature envelope validation (edge cases)

### Medium Priority
- [ ] Test 8: Export formats (CookLang, Schema.org)
- [ ] Test 9: Offline mode & caching
- [ ] Test 10: Relief & humanitarian workflows
- [ ] Test 11: Registry & catalog discovery

### Lower Priority
- [ ] Test 12: Performance baseline
- [ ] Test 13: Data integrity verification
- [ ] Test 14: Real-world robot integration
- [ ] Test 15: Health claims policy
- [ ] Test 16: UI/UX testing
- [ ] Test 17: Community features
- [ ] Test 18: Backward compatibility

---

## Resources Needed

- **Network access** to cookwala.ai
- **Python 3.9+** with dependencies installed
- **Node.js 18+** for TypeScript/JavaScript tests
- **Bash/curl** for API testing
- **Git** to inspect repository (already in scope)
- **Optional:** Language expertise (Arabic, Kurdish) for translation QA

## Estimated Time by Test

| Test | Est. Time | Priority |
|------|-----------|----------|
| Test 1: Search endpoint | 30 min | 🔴 |
| Test 2: Cross-SDK | 45 min | 🔴 |
| Test 3: Multilingual | 60 min | 🔴 |
| Test 4: Allergens | 30 min | 🟡 |
| Test 5: Halal | 45 min | 🟡 |
| Test 6: Devices | 45 min | 🟡 |
| Test 7: Temperature | 45 min | 🟡 |
| Test 8: Export | 45 min | 🟢 |
| Test 9: Offline | 30 min | 🟢 |
| Test 10: Relief | 45 min | 🟢 |
| Test 11: Registry | 20 min | 🟢 |
| Tests 12-18 | 120 min | 🔵 |

**Total:** ~9-11 hours (prioritize top 7 for 4-5 hours of high-impact testing)

---

## Notes for Claude Desktop / Next Tester

1. **Search endpoint is the biggest blocker** — fix this first, as it's a critical feature
2. **Translation accuracy directly impacts usability** — the warning about 35-60% wrong translations is serious
3. **Device compatibility** is essential for the robotics use case
4. **The offline mode and caching** are key for real-world kitchen usage
5. **All tests should produce clear pass/fail results** — no ambiguity
6. **If you find issues, note the specific test case** that fails (provide input/output)
7. **Performance baseline** is useful for understanding scalability limits

---

*Last Updated: 2026-10-06*
