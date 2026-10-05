<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry：发布与查找食谱、设备及 rule pack

> **Status: draft profile.** 基于官方 MCP Registry 进行 modelled，该 registry 列出了 Model
> Context Protocol 服务器：已验证的 namespaces，pinned versions，integrity hashes，一个
> validation endpoint 以及 lifecycle status。

registry 是一个**指针列表**：存在什么、谁发布的、确切的版本，以及它的 hash。内容保留在其发布者托管的任何地方（任何目录，任何域名）。任何人都可以运行一个 registry。cookwala.ai 在 `/v1/registry.json` 运行第一个。

## 1. 名称证明了发布者

每个条目都命名为 `<namespace>/<name>`。命名空间必须经过验证：

| 命名空间 | 示例 | 证明 |
|---|---|---|
| 一个域名，反转 | `org.fifi-cooking/egyptian-home` | `fifi-cooking.org` 上的 DNS TXT 记录 `cookwala-verify=<token>`，或 `https://fifi-cooking.org/.well-known/cookwala-verify` 返回该 token |
| 一个代码托管账户 | `io.github.amado2k5/recipes` | 来自该账户中 CI 作业的 GitHub (或 GitLab) OIDC token |
| 一个密钥 | 任意 | 由已绑定到该命名空间的密钥进行的签名 (rotation) |

Names are never reused. Deleted entries stay as tombstones.

## 2. 版本是精确的

- **仅限精确版本。** 条目固定一个版本 (`1.4.2`)；诸如 `^1.4` 或 `1.x` 之类的范围将被拒绝。
- **哈希值。** 每个版本记录 artifacts 的 `sha256`，客户端在使用前进行验证。
  Recipes 也携带其自身的 Cookwala 文档哈希，执行器会拒绝不匹配的情况。
- **Repository id。** 条目在存在时会记录代码主机的稳定 repository id，
  以便检测到同名但已删除并重新创建的 repository。

## 3. 生命周期

`active` → `deprecated` (仍可使用，但已有替代方案) → `recalled` (不安全；同时
发布在 recall feed 中，且执行器会拒绝它) → `deleted` (墓碑).

## 4. 发布流程

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

该 registry 运行与 `POST /v1/registry/validate` 相同的验证：schema、recipe 语义（operation envelopes、温度）、hashes 和 namespace proof。每个问题都会以结构化列表的形式返回，以便 CI 可以显示。

> API 在 [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002) 中进行了描述。
> 服务将在 later 提供；目前通过向 `site/v1/registry.json` 提交 pull request 来添加条目，该文件仅列出
> 本仓库中存在的内容。名称和版本规则由
> `conformance/profiles/registry.json` 进行测试。

## 5. 条目

查看 `catalog.schema.json#/$defs/RegistryEntry`：

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

## 6. 组织目录

`/v1/directory.json` 列出了**请求**列入名单的组织
(`catalog.schema.json#/$defs/DirectoryEntry`): 设备制造商、目录、registry、food bank、
社区厨房、学校和救济计划、农场和合作社、杂货商、餐厅、
食谱发布者、certifiers、研究实验室、卫生机构、政府、保险公司、翻译
社区。每个条目都有角色、国家、URL、验证记录，以及在它
声称 conformance 的地方，其发布的 `ConformanceReport` 的哈希值
(`docs/CERTIFICATION.md`)。列入名单并不代表认可、certification 或合作伙伴关系。目前该
directory 有一个条目，即本站的运营者，因为还没有其他人提出请求。

