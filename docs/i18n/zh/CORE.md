<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. 这是 Cookwala 的规范部分。MUST、SHOULD 和 MAY 遵循 RFC 2119。此处未列出的所有内容均为可选的 **profile** (section 10)。

一个设备应该能够在约一周内实现 Core。Core 说明了**要做什么、何时完成以及绝不能发生什么**。它并不说明机器人如何移动。

## 1. Conformance classes

| Class | 必须实现 |
|---|---|
| **Recipe publisher** | 有效的 `recipe.schema.json` 文档；在 operation envelopes 内的温度；一个 hash 和一个 signature |
| **Executor** (robot, appliance or hub) | Core API (`api/core.openapi.yaml`)；operation envelopes 和 sensor ladders；本地安全限制；拒绝而非猜测；execution log |
| **Catalog** | 已签名的 recipes，包含 key records 的 `/.well-known/cookwala.json`，recall feed，incident intake |
| **Agent** (AI or software acting for a person) | 仅在 `AgentMandate` 下行动；将文档文本视为数据；在 `confirmBefore` 中的任何操作前询问 principal |
| **Verifier** | Hashes, signatures, key validity and revocation, disclosures, event chains and checkpoints |

声明一个类意味着通过其 conformance 向量 (`conformance/`, 使用 `tools/run_conformance.py` 运行)。

## 2. 核心文档

| 文档 | Schema |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

所有 schema 都是**严格的**：未知的字段会被拒绝，除非是 `x-<vendor>-…` 扩展。
读取器会忽略它们不理解的 `x-` 字段。`tools/bundle_schemas.py` 会生成一个单一的
bundle，以便设备进行离线验证。实现方式不得在运行时获取 schema。

## 3. 操作的含义

- **Envelopes.** `vocab/ops.json` 中的每一个基于热量或危险的操作都有一个 `envelope`。
  它规定了：
  - 介质（水、油、空气、锅表面、产品……）；
  - 其在 °C 下的温度范围（以及压力，针对压力烹饪）；
  - 搅拌、盖子、注意力水平以及该步骤是否可以无人值守运行；
  - 危险；
  - 一种测试方法。

`cw.op.simmer` = 85–96 °C 的水基液体；`cw.op.deep_fry` = 160–190 °C 的油。
- **envelope 内的目标。** 食谱目标（`params.tempC` 或介质 sensor 上的 `target`）必须位于 envelope 内。验证器会拒绝违反此规则的食谱。
- **Executor 将介质保持在 envelope 内。** 如果食谱给出了更窄的目标，一旦首次达到该目标，它们也会将其保持在该目标内。
- **海拔。** 水和蒸汽带随厨房海拔每增加 300 m 移动 −1 °C。
- **热量等级** (`very_low` … `max`) 具有一个共同含义：在 `vocab/units.json` 中定义的以 °C 为单位的锅表面带。
- **sensor ladder。** 每个 envelope 列出了验证该步骤的方法，按优先级排序：特定的 sensor，然后是 `model`（记录的估计值），然后是 `time`，最后是 `human`。
  - executor 使用它能满足的第一级，并将其记录在 `verifiedBy` 中。
  - 如果它**无法**满足任何一级，则必须拒绝该步骤 (`missing_sensor_no_fallback`)。
  - 需要持续关注且可能无法无人值守运行的操作（sautéing, searing, frying, reducing, caramelizing…）绝不会仅退回到 time：它们的最后一级是人在观察。
  - Deep frying 没有 fallback：没有油温 sensor 意味着无法进行 deep frying。
  - 一个 `Condition` 可以通过 `onSensorMissing` 来缩小此范围。
- **拒绝，而非猜测。** 无法满足步骤的 envelope、ladder、设备或安全限制的 executor 在开始前必须回答 `refused` 并给出原因。

## 4. Numbers and units

- **线缆上的温度单位为 °C。** 显示设备可能会进行转换。
- **公差 (Tolerances)。**
  - `tolerance` 是相对的，且仅允许用于比例尺度单位。
  - `toleranceAbs` 是该数值单位下的绝对值，也是 °C 上唯一允许的公差。
  - `Target.tolerance` 是绝对的。
- **厨房单位具有精确的公制数值：** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml。
- **体积 ↔ 质量需要密度** (`Quantity.densityGPerMl`，或食材词汇表)；
  如果没有密度，则视为错误，绝非猜测。
- **货币是带有 ISO 4217 货币符号的十进制字符串** (`"12.70"`)，绝非浮点数。

## 5. 完整性与信任

- **Hash.** `sha256:` 加上该文档 RFC 8785 canonical JSON 的十六进制摘要，
  不包含其 `hash` 和 `signature` 字段。参考 canonicalizer 会完全重现 RFC
  8785 的示例。
- **Signature.** 对 ASCII hash 字符串进行 Ed25519 (`EdDSA`) 签名。对于 P-256
  硬件密钥，允许使用 `ES256`。`kid` 指定一个 `KeyRecord`。
- **Keys.** 一个 `KeyRecord` 提供公钥、其所有者、有效期窗口和 `revokedAt`。
  如果签名的 `signedAt` 落在撤销之后，或在有效期窗口之外，则该签名是
  无效的。
  - Catalogs 在 `/.well-known/cookwala.json` 中发布其密钥。
  - 组织和个人在 did:web 文档中发布其密钥。
  - 设备在其 capabilities document 中发布其密钥。
  - Verifiers 缓存密钥记录以供离线使用。
- **Selective disclosure.** 一个已签名的文档可以包含一个 `Disclosure` 摘要，
  `sha256(JCS([salt, value]))`，而不是敏感值。持有者仅向被允许查看这些信息的各方
  揭示 salt 和 value，且签名仍然可以验证。
- **Event logs** (Mission profile):
  - 每个 log 对应一个 sequencer，分配 `seq` 和 `prev`，从而使链永远不会分叉。
  - Checkpoints 由 sequencer 签名，并由 witnesses 进行连署签名，witnesses 可能包括
    透明度服务，例如 IETF SCITT。在经过 witnessed checkpoint 之后的重写是
    可检测的。
  - 在 `hash_only` 模式下，payloads 存储在可擦除存储器中，而 log 仅保留它们的 hashes。

## 6. 安全与代理规则（规范性）

1. **安全是本地的。** 执行器在设备上强制执行 `SafetyLimits` pack。
   - 任何食谱、代理、远程消息、扩展或操作模式都不能提高或禁用限制。
   - 更严格的限制始终胜出。
   - `profiles/core/safety-limits.default.json` 是一个草案起点，设备制造商会根据其自身的 safety case 进行收紧。
2. **本地停止。** 设备上的停止控制会在 0.5 s 内停止运动，并在 1 s 内切断热量，无论是否有网络。一旦调用者能够触达执行器，`POST …/stop` 绝不会因授权而被拒绝。
3. **事件报告；它们从不提供保护。** `cookwalalatency: local_safety` 事件报告设备已经执行的操作。任何安全功能都不得依赖于事件的到达。
4. **不可信文本。** 对于软件和 AI 代理而言，每个自由文本字段（标注为 `x-cookwala-untrusted`）都是数据，绝非指令。通过文本进行指令引导的尝试将被忽略并记录 (`cw.incident.untrusted_instruction`)。
5. **代理在 mandate 下行动。** 由代理发送的请求携带由委托人签署的 `AgentMandate`：范围、支出上限、允许的提供商、有效期以及需要确认的操作。
   - 无论 mandate 如何规定，`irreversible` 和 `safety_override` 始终需要确认。
   - 执行器会拒绝 mandate 范围之外的请求 (`mandate_scope`)。
6. **无人值守操作需要人员。** 其 operation envelope 显示 `unattended: false` 的操作需要一名负责人到场，或在 1 分钟内可触达。
7. **过敏原阻断拒绝。** 食谱或库存中任何被阻断的过敏原都会拒绝请求；阻断项不存在替代方案。
8. **Recall。** 目录在 `GET /v1/recalls` 发布签署过的 recall。执行器在联网时进行轮询，并拒绝被 recall 的版本。`block_and_stop_running` 也会安全地停止正在运行的执行。
9. **Incident reports** 是匿名的 (`IncidentReport`：仅日期，无姓名或 ids) 并提交给目录，以便每个制造商都能从每一次 near miss 中学习。

## 7. 执行生命周期与 API

- **API:** `api/core.openapi.yaml`。其端点为：
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - catalog 端：`GET /v1/recalls`, `POST /v1/incidents`。
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` 和 `stopping` → 在过程中变为 `stopped`;
  - `refused` 和 `failed` 是最终状态。
  - 完整的转换表位于 `core.schema.json#/$defs/ExecutionState` 和
    conformance 向量中。
- **Request rules:**
  - 每个 POST 都携带一个 `Idempotency-Key`。
  - 对现有 execution 的更改携带 `If-Match: <seq>`; 不匹配则返回 412。
  - Stop 不需要 If-Match。
- **Events:**
  - 交付是至少一次。
  - CloudEvents `id` 是去重键。
  - `cookwalaseq` 按 subject 对事件进行排序并匹配状态 `seq`。
  - 设备发出 `cookwala.device.heartbeat`，因此 hub 可以检测到丢失的设备并进行移交。

## 8. 隐私

- **Execution logs 不携带任何个人数据** (`privacy.personalData: "none"` )。
- **只有在选择性同意的情况下，它们才会离开设备** (`consent.dataset`: 默认为 `none`，
  `research_only`，或 `open`)。同意可以被撤回。
- **Open datasets 将时间粒度粗化至天。**
- **家庭、健康和宗教数据保留在家庭内部**，除非个人另有选择。
  当必须传输时，它们以 selective disclosures 的形式进行传输。
- **The Humanitarian Profile** 完全不携带任何个人数据。

## 9. 版本控制与扩展

- **核心版本为 `0.2.x`。**
  - 读取器接受其次要版本（minor version）的任何补丁版本（patch）。
  - 他们会以 `unsupported_version` 拒绝其他次要版本。
  - 他们会忽略未知的 `x-` 字段。
- **新的操作、单位、传感器和事件类型**被添加到词汇表中，且无需更改版本。
- **更改操作的含义即为一个新的 id；** 旧的会被标记为 `deprecated` 并带有 `replacedBy`。
- **Profiles** 独立进行版本控制，并声明它们所需的 Core 版本。

## 10. Profiles 及其状态

| Profile | Status | Notes |
|---|---|---|
| Core (this document) | **draft, normative** | 第一批设备实现的目标 |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | 无个人数据；通过 SMS 和 CSV 工作；surplus to plate，影响摘要，care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | 本地优先的 household facts；仅 derived constraints 进行传输 (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | 已验证的 namespaces，确切的版本，tombstones；按请求提供 organizations (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | 每个 conformance 声明背后都有已签名的报告 (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds 和 relays；针对 issuer 进行验证 (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | 餐厅、社区、学校、灾难和机器人厨房 (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | 聚合的、延迟的、类别级的需求和供应信号；需经过竞争法审查后开启 (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection，在 `profiles/mission/transitions.json` 中的 transitions |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | 在投入生产使用前需要进行竞争法审查 |
| Relief planning (`relief.schema.json`) | experimental | Operational flow 已移至 Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API 是参考 surface |

当两个独立的实现通过其 conformance 向量且拥有真实用户时，一个 profile 就会变得稳定。

## 11. 工具

| 工具 | 功能 |
|---|---|
| `tools/validate_specs.py` | 检查 schemas、examples、recipe semantics（envelopes、op parameters、无 template placeholders）、strictness，以及 API references 是否可解析 |
| `tools/run_conformance.py` | 运行 `conformance/*.json` 和 `conformance/profiles/*.json`，并使用 `--report` 写入一个 ConformanceReport：hashing（包括 RFC 8785 示例）、signatures（包括 RFC 8032 key）、revocation、disclosure、event chains 和 checkpoints、units、envelopes、sensor ladders、state machines |
| `tools/cookwala_ref.py` | Reference library 和 CLI：`hash`、`verify`、`chain` |
| `tools/make_conformance.py` | 重新生成 vectors（查看 diff） |
| `tools/bundle_schemas.py` | 离线 schema bundle |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack 检查器和 impact summaries |
| `tools/make_profile_vectors.py` | 重新生成 `conformance/profiles/` 中的 profile vectors |

## 12. 从 0.1 开始的变更

| 区域 | 0.1 | 0.2 |
|---|---|---|
| Schemas | 接受未知字段 | 严格，带有 `x-` 扩展 |
| Temperatures | °C 或 °F，允许相对容差 | 仅限 °C；绝对容差 |
| Money | 数字 | 十进制字符串 |
| Operations | 散文式定义 | 物理 operation envelope，sensor ladder，热量等级，测试向量 |
| Signatures | 固定 EdDSA，无生命周期的密钥 | EdDSA 或 ES256，带有有效性和撤销功能的 KeyRecords |
| Missions | 单个可变文档，内部包含账本 | 事件日志 + 投影，单一排序器，见证检查点，仅哈希模式 |
| Agents | 仅在 Missions 内部包含 mandate | `AgentMandate` 在 common 中；代理请求时必填 |
| Safety | 在食谱中声明 | 还通过 SafetyLimits 在本地强制执行；recalls；事故报告 |
| Data | 无数据集模型 | 经同意的、无个人数据的 ExecutionLog |
| Conformance | 仅限 Schema 验证 | 106 个向量 (44 个 Core，62 个 profile) 外加一个参考实现 |

要迁移 0.1 文档：将 °F 转换为 °C；将温度上的相对容差替换为 `toleranceAbs`；将金额转换为十进制字符串；删除或重命名未知字段为 `x-` 字段。

