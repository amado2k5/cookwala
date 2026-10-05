<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry: publicación y búsqueda de recetas, dispositivos y packs

> **Status: draft profile.** Modelled on the official MCP Registry, which lists Model
> Context Protocol servers: verified namespaces, pinned versions, integrity hashes, a
> validation endpoint and a lifecycle status.

El registry es una **lista de punteros**: qué existe, quién lo publicó, qué versión exacta,
y su hash. El contenido permanece dondequiera que su editor lo aloje (cualquier catálogo, cualquier dominio).
Cualquiera puede ejecutar un registry. cookwala.ai ejecuta el primero en `/v1/registry.json`.

## 1. Los nombres demuestran quién publicó

Cada entrada se nombra `<namespace>/<name>`. El namespace debe ser probado:

| Namespace | Ejemplo | Prueba |
|---|---|---|
| Un dominio, invertido | `org.fifi-cooking/egyptian-home` | Registro DNS TXT `cookwala-verify=<token>` en `fifi-cooking.org`, o `https://fifi-cooking.org/.well-known/cookwala-verify` devolviendo el token |
| Una cuenta de host de código | `io.github.amado2k5/recipes` | Token OIDC de GitHub (o GitLab) de un trabajo de CI en esa cuenta |
| Una clave | cualquier | Una firma por una clave ya vinculada al namespace (rotación) |

Los nombres nunca se reutilizan. Las entradas eliminadas permanecen como lápidas.

## 2. Las versiones son exactas

- **Solo versiones exactas.** Las entradas fijan una versión (`1.4.2`); se rechazan los rangos como `^1.4` o `1.x`.
- **Hashes.** Cada versión registra el `sha256` del artefacto, y los clientes lo verifican antes de su uso. Las recetas también llevan su propio hash de documento Cookwala, y los ejecutores rechazan una discrepancia.
- **Repository id.** Las entradas registran el repository id estable del host de código cuando existe uno, para que se detecte un repositorio eliminado y recreado con el mismo nombre.

## 3. Ciclo de vida

`active` → `deprecated` (todavía utilizable, existe un reemplazo) → `recalled` (inseguro; también
publicado en el recall feed, y los ejecutores lo rechazan) → `deleted` (tombstone).

## 4. Flujo de publicación

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

El registry ejecuta la misma validación que `POST /v1/registry/validate`: esquema, semántica de recetas (operation envelopes, temperaturas), hashes y prueba de namespace. Cada problema se devuelve como una lista estructurada, para que CI pueda mostrarlo.

> La API se describe en [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). El
> servicio llega later; hoy las entradas se añaden mediante pull request a `site/v1/registry.json`, que enumera
> solo lo que existe en este repositorio. Las reglas de nombre y versión son probadas por
> `conformance/profiles/registry.json`.

## 5. Entrada

Vea `catalog.schema.json#/$defs/RegistryEntry`:

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

## 6. Directory de organizaciones

`/v1/directory.json` enumera las organizaciones que **pidieron** ser incluidas
(`catalog.schema.json#/$defs/DirectoryEntry`): fabricantes de dispositivos, catálogos, registries, food banks,
cocinas comunitarias, programas escolares y de ayuda, granjas y cooperativas, tenderos, restaurantes,
editores de recetas, certificadores, laboratorios de investigación, organismos de salud, gobiernos, aseguradoras, comunidades
de traductores. Cada entrada tiene roles, un país, una URL, un registro de verificación y, cuando
alega conformance, los hashes de sus `ConformanceReport`s publicados
(`docs/CERTIFICATION.md`). La inclusión no es respaldo, certification ni asociación. Hoy el
directory tiene una entrada, el operador de este sitio, porque nadie más lo ha pedido todavía.

