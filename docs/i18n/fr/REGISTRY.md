<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry : publication et recherche de recettes, d'appareils et de packs

> **Status: draft profile.** Modelled sur l'officiel MCP Registry, qui liste les serveurs Model
> Context Protocol : namespaces vérifiés, versions épinglées, hachages d'intégrité, un
> endpoint de validation et un statut de cycle de vie.

Le registry est une **liste de pointeurs** : ce qui existe, qui l'a publié, quelle version exacte,
et son hash. Le contenu reste là où son éditeur l'héberge (n'importe quel catalogue, n'importe quel domaine).
N'importe qui peut exécuter un registry. cookwala.ai exécute le premier à `/v1/registry.json`.

## 1. Les noms prouvent qui a publié

Chaque entrée est nommée `<namespace>/<name>`. L'espace de noms doit être prouvé :

| Namespace | Exemple | Preuve |
|---|---|---|
| Un domaine, inversé | `org.fifi-cooking/egyptian-home` | Enregistrement DNS TXT `cookwala-verify=<token>` sur `fifi-cooking.org`, ou `https://fifi-cooking.org/.well-known/cookwala-verify` retournant le token |
| Un compte d'hébergement de code | `io.github.amado2k5/recipes` | Token OIDC GitHub (ou GitLab) provenant d'un job CI dans ce compte |
| Une clé | n'importe laquelle | Une signature par une clé déjà liée au namespace (rotation) |

Les noms ne sont jamais réutilisés. Les entrées supprimées restent sous forme de pierres tombales.

## 2. Les versions sont exactes

- **Versions exactes uniquement.** Les entrées fixent une version (`1.4.2`) ; les plages telles que `^1.4` ou `1.x` sont rejetées.
- **Hashes.** Chaque version enregistre le `sha256` de l'artéfact, et les clients le vérifient avant utilisation. Les recettes portent également leur propre hash de document Cookwala, et les exécuteurs refusent toute discordance.
- **Repository id.** Les entrées enregistrent le repository id stable de l'hôte de code lorsqu'il y en a un, afin qu'un repository supprimé puis recréé avec le même nom soit détecté.

## 3. Cycle de vie

`active` → `deprecated` (toujours utilisable, un remplacement existe) → `recalled` (non sûr ; également
publié dans le flux de recall, et les exécuteurs le refusent) → `deleted` (tombstone).

## 4. Flux de publication

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

Le registry exécute la même validation que `POST /v1/registry/validate` : schéma, sémantique des recettes (operation envelopes, températures), hashes et preuve de namespace. Chaque problème revient sous la forme d'une liste structurée, afin que la CI puisse l'afficher.

> L'API est décrite dans [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). Le
> service arrive later ; aujourd'hui, les entrées sont ajoutées par pull request à `site/v1/registry.json`, qui liste
> uniquement ce qui existe dans ce dépôt. Les règles de nom et de version sont testées par
> `conformance/profiles/registry.json`.

## 5. Entrée

Voir `catalog.schema.json#/$defs/RegistryEntry` :

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

## 6. Directory of organizations

`/v1/directory.json` répertorie les organisations qui ont **demandé** à être inscrites
(`catalog.schema.json#/$defs/DirectoryEntry`) : fabricants d'appareils, catalogues, registries, food banks,
cuisines communautaires, programmes scolaires et de secours, fermes et coopératives, épiciers, restaurants,
éditeurs de recettes, certifiers, laboratoires de recherche, organismes de santé, gouvernements, assureurs, communautés
de traducteurs. Chaque entrée possède des rôles, un pays, une URL, un enregistrement de vérification et, lorsqu'elle
revendique la conformance, les hashes de ses `ConformanceReport`s publiés
(`docs/CERTIFICATION.md`). Le fait d'être répertorié ne constitue pas une approbation, une certification ou un partenariat. Aujourd'hui, le
directory possède une entrée, l'opérateur de ce site, car personne d'autre n'a encore demandé.

