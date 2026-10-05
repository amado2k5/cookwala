<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: रेसिपी, डिवाइस और पैक प्रकाशित करना और ढूँढना

> **Status: draft profile.** Modelled on the official MCP Registry, जो Model
> Context Protocol servers को सूचीबद्ध करता है: verified namespaces, pinned versions, integrity hashes, a
> validation endpoint और एक lifecycle status.

registry एक **pointers की सूची** है: क्या मौजूद है, किसने इसे प्रकाशित किया, कौन सा सटीक version है,
और इसका hash है। Content वहीं रहता है जहाँ उसका publisher इसे host करता है (कोई भी catalog, कोई भी domain)।
कोई भी registry चला सकता है। cookwala.ai `/v1/registry.json` पर पहली registry चलाता है।

## 1. नाम सिद्ध करते हैं कि किसने प्रकाशित किया

प्रत्येक प्रविष्टि का नाम `<namespace>/<name>` है। namespace को सिद्ध किया जाना चाहिए:

| Namespace | उदाहरण | प्रमाण |
|---|---|---|
| एक domain, उल्टा | `org.fifi-cooking/egyptian-home` | `fifi-cooking.org` पर DNS TXT record `cookwala-verify=<token>`, या `https://fifi-cooking.org/.well-known/cookwala-verify` द्वारा token लौटाना |
| एक code-host खाता | `io.github.amado2k5/recipes` | उस खाते में एक CI job से GitHub (या GitLab) OIDC token |
| एक key | कोई भी | उस namespace से पहले से ही bound key द्वारा एक signature (rotation) |

नामों का पुन: उपयोग कभी नहीं किया जाता है। हटाए गए प्रविष्टियाँ tombstones के रूप में रहती हैं।

## 2. Versions exact हैं

- **केवल सटीक संस्करण।** प्रविष्टियाँ एक संस्करण (`1.4.2`) को पिन करती हैं; `^1.4` या `1.x` जैसे रेंज को अस्वीकार कर दिया जाता है।
- **Hashes।** प्रत्येक संस्करण आर्टिफैक्ट का `sha256` रिकॉर्ड करता है, और क्लाइंट उपयोग से पहले इसकी पुष्टि करते हैं। रेसिपीज़ में अपना Cookwala दस्तावेज़ hash भी होता है, और executors बेमेल होने पर refusal करते हैं।
- **Repository id।** प्रविष्टियाँ कोड होस्ट का स्थिर repository id रिकॉर्ड करती हैं जब कोई हो, ताकि समान नाम वाले डिलीट किए गए और फिर से बनाए गए repository का पता लगाया जा सके।

## 3. Lifecycle

`active` → `deprecated` (अभी भी उपयोग करने योग्य, एक विकल्प मौजूद है) → `recalled` (असुरक्षित; recall feed में भी प्रकाशित, और executors इसे अस्वीकार कर देते हैं) → `deleted` (tombstone)।

## 4. Publishing flow

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

`registry` वही validation चलाता है जो `POST /v1/registry/validate` चलाता है: schema, recipe semantics (operation envelopes, temperatures), hashes और namespace proof। प्रत्येक issue एक structured list के रूप में वापस आता है, ताकि CI इसे दिखा सके।

> API का वर्णन [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002) में किया गया है।
> सेवा later आएगी; आज प्रविष्टियाँ `site/v1/registry.json` में pull request द्वारा जोड़ी जाती हैं, जो
> केवल वही सूचीबद्ध करती हैं जो इस रिपॉजिटरी में मौजूद है। नाम और संस्करण के नियमों का परीक्षण
> `conformance/profiles/registry.json` द्वारा किया जाता है।

## 5. प्रविष्टि

`catalog.schema.json#/$defs/RegistryEntry` देखें:

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

## 6. संगठनों की Directory

`/v1/directory.json` उन संगठनों को सूचीबद्ध करता है जिन्होंने सूचीबद्ध होने के लिए **पूछा** है
(`catalog.schema.json#/$defs/DirectoryEntry`): डिवाइस निर्माता, कैटलॉग, registries, food banks,
सामुदायिक रसोई, स्कूल और राहत कार्यक्रम, फार्म और सहकारी समितियां, किराना विक्रेता, रेस्तरां,
रेसिपी प्रकाशक, certifiers, अनुसंधान प्रयोगशालाएं, स्वास्थ्य निकाय, सरकारें, बीमाकर्ता, अनुवादक
समुदाय। प्रत्येक प्रविष्टि में भूमिकाएं, एक देश, एक URL, एक सत्यापन रिकॉर्ड और, जहाँ यह
conformance का दावा करता है, इसके प्रकाशित `ConformanceReport`s के हैश हैं
(`docs/CERTIFICATION.md`)। सूचीबद्ध करना समर्थन, certification या साझेदारी नहीं है। आज
directory में एक प्रविष्टि है, इस साइट का ऑपरेटर, क्योंकि अभी तक किसी और ने नहीं पूछा है।

