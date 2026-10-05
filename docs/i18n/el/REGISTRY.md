<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: δημοσίευση και εύρεση συνταγών, συσκευών και packs

> **Status: draft profile.** Modelled στο επίσημο MCP Registry, το οποίο περιλαμβάνει Model
> Context Protocol servers: επαληθευμένα namespaces, pinned versions, integrity hashes, ένα
> validation endpoint και ένα lifecycle status.

Το registry είναι μια **λίστα από pointers**: τι υπάρχει, ποιος το δημοσίευσε, ποια ακριβώς έκδοση,
και το hash του. Το περιεχόμενο παραμένει εκεί που το φιλοξενεί ο εκδότης του (οποιοδήποτε catalog, οποιοδήποτε domain).
Οποιοσδήποτε μπορεί να τρέξει ένα registry. το cookwala.ai τρέχει το πρώτο στο `/v1/registry.json`.

## 1. Τα ονόματα αποδεικνύουν ποιος δημοσίευσε

Κάθε εγγραφή ονομάζεται `<namespace>/<name>`. Το namespace πρέπει να αποδεικνύεται:

| Namespace | Παράδειγμα | Απόδειξη |
|---|---|---|
| Ένα domain, αντιστραμμένο | `org.fifi-cooking/egyptian-home` | DNS TXT record `cookwala-verify=<token>` στο `fifi-cooking.org`, ή το `https://fifi-cooking.org/.well-known/cookwala-verify` που επιστρέφει το token |
| Ένας λογαριασμός code-host | `io.github.amado2k5/recipes` | GitHub (ή GitLab) OIDC token από ένα CI job σε αυτόν τον λογαριασμό |
| Ένα key | οποιοδήποτε | Μια υπογραφή από ένα key που είναι ήδη συνδεδεμένο με το namespace (rotation) |

Ονομασίες δεν επαναχρησιμοποιούνται ποτέ. Οι διαγραμμένες εγγραφές παραμένουν ως tombstones.

## 2. Οι εκδόσεις είναι ακριβείς

- **Μόνο ακριβείς εκδόσεις.** Οι εγγραφές ορίζουν μια έκδοση (`1.4.2`); εύρη όπως το `^1.4` ή το `1.x` απορρίπτονται.
- **Hashes.** Κάθε έκδοση καταγράφει το `sha256` του αντικειμένου, και οι πελάτες το επαληθεύουν πριν τη χρήση.
Τα συνταγές φέρουν επίσης το δικό τους Cookwala document hash, και οι εκτελεστές αρνούνται μια ασυμφωνία.
- **Repository id.** Οι εγγραφές καταγράφουν το σταθερό repository id του host του κώδικα όταν υπάρχει, ώστε να ανιχνεύεται ένα repository που έχει διαγραφεί και δημιουργηθεί ξανά με το ίδιο όνομα.

## 3. Κύκλος ζωής

`active` → `deprecated` (ακόμα χρησιμοποιήσιμο, υπάρχει αντικατάσταση) → `recalled` (μη ασφαλές· δημοσιεύεται επίσης στο recall feed, και οι εκτελεστές το αρνούνται) → `deleted` (tombstone).

## 4. Ροή δημοσίευσης

```bash
# 1. validate locally (same checks the registry runs)
python tools/validate_specs.py
python tools/cookwala_ref.py hash my-collection/recipe.cookwala.json

# 2. prove the namespace once (DNS TXT or /.well-known/cookwala-verify, or CI OIDC)

# 3. publish the entry
curl -X POST https://cookwala.ai/v1/registry/publish \
  -H "Authorization: Bearer $COOKWALA_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d @registry-entry.json
```

Το registry εκτελεί την ίδια επικύρωση με το `POST /v1/registry/validate`: schema, σημασιολογία συνταγής (operation envelopes, θερμοκρασίες), hashes και namespace proof. Κάθε ζήτημα επιστρέφεται ως μια δομημένη λίστα, ώστε το CI να μπορεί να την εμφανίσει.

> Το API περιγράφεται στο [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). Η
> υπηρεσία έρχεται later; σήμερα οι εγγραφές προστίθενται μέσω pull request στο `site/v1/registry.json`, το οποίο περιέχει
> μόνο όσα υπάρχουν σε αυτό το αποθετήριο. Οι κανόνες ονοματοδοσίας και έκδοσης ελέγχονται από το
> `conformance/profiles/registry.json`.

## 5. Είσοδος

Δείτε το `catalog.schema.json#/$defs/RegistryEntry`:

```json
{
  "kind": "recipe_collection",
  "name": "org.fifi-cooking/egyptian-home",
  "description": "Egyptian home recipes from fifi.cooking, robot-ready.",
  "version": "0.3.0",
  "status": "active",
  "url": "https://cookwala.ai/v1/recipes/",
  "sha256": "…",
  "coreVersion": "0.2.0",
  "verification": { "method": "dns_txt", "verifiedAt": "2026-10-04T10:00:00Z", "by": "cookwala.ai" },
  "repository": { "url": "https://github.com/amado2k5/cookwala", "source": "github", "id": "…" }
}
```

## 6. Directory των οργανισμών

`/v1/directory.json` περιέχει οργανισμούς που **ζήτησαν** να καταχωρηθούν
(`catalog.schema.json#/$defs/DirectoryEntry`): κατασκευαστές συσκευών, καταλόγους, registries, food banks,
κοινοτικά κουζίνες, προγράμματα σχολών και ανακούφισης, φάρμες και συνεργασίες, εμπόρους τρόφιμων, εστιατόρια,
εκδότες συνταγών, certifiers, ερευνητικά εργαστήρια, φορείς υγείας, κυβερνήσεις, ασφαλιστικές εταιρείες, κοινότητες
μεταφραστών. Κάθε καταχώρηση έχει ρόλους, μια χώρα, ένα URL, ένα αρχείο επαλήθευσης και, όπου
υποστηρίζει conformance, τα hashes των δημοσιευμένων `ConformanceReport`s
(`docs/CERTIFICATION.md`). Η καταχώρηση δεν αποτελεί υποστήριξη, certification ή συνεργασία. Σήμερα το
directory έχει μία καταχώρηση, τον χειριστή αυτού του ιστότοπου, επειδή κανείς άλλος δεν έχει ζητήσει ακόμα.

