# RFC-0010: Dietary & Authority Certifications

**Status:** RFC DRAFT, Implementation 40% complete  
**Feature Scope:** Profile feature (not Core 0.2)  
**Last Updated:** 2026-10-06

---

## What This Is

Certifications are detached, signed documents issued by authorities for dietary, sustainability, and safety claims on recipes, ingredients, lots, products, or kitchens.

**Examples:**
- "This kofta recipe is halal" (issued by Halal Certification Authority)
- "This beef lot is organic" (issued by Organic Inspector)
- "This kitchen is food-safe" (issued by Health Department)

---

## Working Today ✅

### Python Functions

```python
import cookwala as cw
import json

# Verify a certification
cert = json.load(open('halal-kofta-2026-10.json'))
keys = json.load(open('authority-keys.json'))
ok, reason = cw.verify_certification(cert, keys)  # → (True, 'ok')

# Find current certifications (handles superseding)
result = cw.current_certifications([cert1, cert2], keys)
# → {'current': ['cert-2026-10'], 'rejected': {'cert-2026-01': 'superseded'}}
```

### Supported Schemes

`halal`, `kosher`, `vegetarian`, `vegan`, `organic`, `gluten_free`, `dairy_free`, `nut_free`, `fair_trade`, `non_gmo`, `food_safety`, `x-*` (custom)

### Examples

- `examples/certifications/halal-kofta-oven-2026-10.json` ← Recipe certification (current)
- `examples/certifications/halal-kofta-oven-2026-01.json` ← Superseded version
- `examples/certifications/halal-beef-lot-2026-09.json` ← Ingredient lot
- `examples/certifications/vegetarian-shakshuka-2026-06.json` ← Alternative scheme

### Tests

`conformance/profiles/certifications.json` — 8 conformance vectors, all passing

---

## Not Yet Built ❌

| Feature | Status | Note |
|---------|--------|------|
| CLI commands | ❌ | `cookwala certify`, `verify-cert` |
| MCP tools | ❌ | Certification operations |
| API endpoints | ❌ | `/v1/certifications` defined, not deployed |
| Certifier registry | ❌ | Authority credential system |
| Recipe linking | ❌ | Recipes don't reference certs yet |
| Search filters | ❌ | No `--certified halal` option |

**Effort to complete:** 12-18 hours

---

## How to Verify a Certification Now

```bash
python3 << 'EOF'
import sys, json
sys.path.insert(0, 'sdk/python')
import cookwala as cw

cert = json.load(open('examples/certifications/halal-kofta-oven-2026-10.json'))
keys = json.load(open('conformance/keys/certification-test-keys.json'))

ok, reason = cw.verify_certification(cert, keys, subject_hash='sha256:...')
print(f"✓ Valid" if ok else f"✗ {reason}")
EOF
```

---

## See Also

- [rfcs/0010-certifications.md](../rfcs/0010-certifications.md) — Full RFC design
- [CERTIFICATION_IMPLEMENTATION_STATUS.md](../CERTIFICATION_IMPLEMENTATION_STATUS.md) — Audit & roadmap
- [docs/CERTIFICATION.md](CERTIFICATION.md) — Conformance reports (RFC-0008, different system)

---

*Last Updated: 2026-10-06*
