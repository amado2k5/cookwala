<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: publicando e encontrando receitas, dispositivos e packs

> **Status: draft profile.** Modelled no official MCP Registry, que lista servidores Model
> Context Protocol: namespaces verificados, versões fixadas, hashes de integridade, um
> endpoint de validação e um status de ciclo de vida.

O registry é uma **lista de ponteiros**: o que existe, quem o publicou, qual versão exata,
e seu hash. O conteúdo permanece onde quer que seu publicador o hospede (qualquer catálogo, qualquer domínio).
Qualquer pessoa pode executar um registry. cookwala.ai executa o primeiro em `/v1/registry.json`.

## 1. Nomes provam quem publicou

Cada entrada é nomeada `<namespace>/<name>`. O namespace deve ser comprovado:

| Namespace | Exemplo | Prova |
|---|---|---|
| Um domínio, invertido | `org.fifi-cooking/egyptian-home` | Registro DNS TXT `cookwala-verify=<token>` em `fifi-cooking.org`, ou `https://fifi-cooking.org/.well-known/cookwala-verify` retornando o token |
| Uma conta de host de código | `io.github.amado2k5/recipes` | Token OIDC do GitHub (ou GitLab) de um job de CI nessa conta |
| Uma chave | qualquer | Uma assinatura por uma chave já vinculada ao namespace (rotação) |

Names are never reused. Deleted entries stay as tombstones.

## 2. Versões são exatas

- **Apenas versões exatas.** Entradas fixam uma versão (`1.4.2`); intervalos como `^1.4` ou `1.x`
  são rejeitados.
- **Hashes.** Cada versão registra o `sha256` do artefato, e os clientes o verificam antes do uso.
  As receitas também carregam seu próprio hash de documento Cookwala, e os executores recusam uma incompatibilidade.
- **Repository id.** As entradas registram o repository id estável do host do código quando houver um,
  para que um repositório deletado e recriado com o mesmo nome seja detectado.

## 3. Ciclo de vida

`active` → `deprecated` (ainda utilizável, um substituto existe) → `recalled` (inseguro; também
publicado no feed de recall, e os executores o recusam) → `deleted` (tombstone).

## 4. Fluxo de publicação

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

O registry executa a mesma validação que `POST /v1/registry/validate`: schema, semântica de receita (operation envelopes, temperaturas), hashes e prova de namespace. Cada problema retorna como uma lista estruturada, para que o CI possa exibi-lo.

> A API é descrita em [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). O
> serviço virá later; hoje as entradas são adicionadas por pull request ao `site/v1/registry.json`, que lista
> apenas o que existe neste repositório. As regras de nome e versão são testadas por
> `conformance/profiles/registry.json`.

## 5. Entrada

Veja `catalog.schema.json#/$defs/RegistryEntry`:

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

## 6. Directory de organizações

`/v1/directory.json` lista organizações que **pediram** para serem listadas
(`catalog.schema.json#/$defs/DirectoryEntry`): fabricantes de dispositivos, catálogos, registries, food banks,
cozinhas comunitárias, programas escolares e de ajuda, fazendas e cooperativas, mercearias, restaurantes,
editores de receitas, certifiers, laboratórios de pesquisa, órgãos de saúde, governos, seguradoras, comunidades
de tradutores. Cada entrada possui funções, um país, uma URL, um registro de verificação e, onde
alega conformance, os hashes de seus `ConformanceReport`s publicados
(`docs/CERTIFICATION.md`). A listagem não é endosso, certification ou parceria. Hoje o
directory possui uma entrada, o operador deste site, porque ninguém mais pediu ainda.

