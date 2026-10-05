<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala 人道主义概况 (draft 0.2)

**Status:** 供 food banks、救济项目以及食品安全与营养专业人员审阅的草案。它未经 WFP、WHO、FAO、Global FoodBanking Network 或此处提到的任何其他机构的审阅或认可。

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (全部), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; 所有草案均在等待专业评审，参见 [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (开罗的 food bank, school meals, disaster kitchen, robot kitchen)，每个都包含一个计算出的 `ImpactSummary`
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. 0.2 增加了什么 (RFC-0003, RFC-0004)

大于 0.1 的增量；读者两者皆可接受。

- **从农场到餐盘：** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) 和 `Item.harvestedAt`；角色 `farm`, `caterer`, `robot_kitchen`；SMS 单词 `FARM`。
- **护理规则：** `Item.foodClasses` 和 `Distribution.menu.foodClasses`（生鸡蛋、未巴氏消毒的乳制品、整颗坚果、煮熟的米饭……），规则类型 `food_class`，`Rule.audienceGroup`，`Distribution.audienceGroups`；三个新的草案 rule pack。
- **评审：** `RulePack.reviews` 记录每次评审的职业、组织、日期、范围和结果；`status: reviewed` 需要一次已批准的评审。
- **影响：** 包含九项指标的 `ImpactSummary`，每项指标都带有 `method`（measured, modelled, assumed, not recorded），由 `tools/humanitarian_check.py --summary` 计算得出。
- **认领时间：** `Offer.createdAt`, `Claim.claimedAt`；`Handover.leg` 以确保被挽救的公斤数仅计算一次。
- `Manifest` 上的 **程序类型**。

## 1. Purpose

Cookwala 为为人们提供食物的组织提供的一个小型、严格、不含个人数据的部分：
food banks、社区厨房、学校膳食计划、救济计划、捐赠者（杂货商、餐厅、农场、餐饮服务商）、运输商和冷库。它涵盖四项工作：

1. **提供 surplus food** 并进行认领，快速且公平。
2. **记录每次 handover** 的所有权转移，并进行温度检查（冷链检查）。
3. **报告所提供的食物**，仅以聚合计数的形式。
4. **根据**机器可读的营养和食品安全规则，**检查菜单和 handovers**。

**它无需机器人、应用程序或互联网即可运行。** H0 和 H1 级别运行在电子表格、SMS 和基础电话上。机器人、hub 和代理是相同文档的可选消费者。

## 2. 原则

- **不造成伤害。** 不收集任何可能识别、定位或剖析个人或家庭的信息。在脆弱的环境中，关于受益人的数据存在保护风险。
- **人道主义原则**（人性、中立、公正、独立）：援助上不得有商业品牌，且不得将数据用于营销。
- **严格且精简。** 每个对象都拒绝未知字段（`x-` 扩展除外），因此拼写错误和额外的个人字段将无法通过验证。
- **精确单位：** 千克、摄氏度、绝对公差，以及作为十进制字符串的货币。
- **本地规则优先。** rule pack 可被国家食品安全和捐赠法律所取代。
- **开放：** 免版税规范，开源工具。该配置文件旨在符合 Digital Public Goods Standard 和 Principles for Digital Development。

## 3. Conformance levels

| 层级 | 参与者所做的工作 | 需求 |
|---|---|---|
| **H0 — 纸质与 SMS** | 在 CSV 模板（带有 HXL hashtag 行）中或通过 SMS（第 8.3 节）记录 offer、handover 和 distribution | 电子表格或基础手机 |
| **H1 — Rescue** | 通过 API 交换 `Offer`、`Claim`、`Handover` 和 `Distribution` 文档；遵循状态机（第 5 节） | 任何 HTTP client |
| **H2 — 安全与营养** | 对每一次 handover 和菜单应用 `RulePack`，并记录 `findings` | reference checker 或同等工具 |
| **H3 — 互操作性** | 将聚合数据导出至 HXL、DHIS2 和核心 Cookwala `ImpactReport`；使用 GS1 标识符 | 集成工作 |

参与者在 `/.well-known/cookwala-humanitarian.json` 发布一个 `Manifest`，其中声明其层级、rule packs、端点以及 `personalData: "none"`。

## 4. 文档

| 文档 | 编写者 | 用途 |
|---|---|---|
| `Offer` | 捐赠者 | 可供收集的 surplus 食物：物品 (kg, 存储, 日期标记, 过敏原), 时间窗口, 地点, 温度 |
| `Claim` | food bank, kitchen, program | 申领全部或部分 offer，包含取货时间和车辆类型 |
| `Handover` | 监管接收者 | 每段行程一份：温度, 被接受或因原因代码被拒绝的 kg, 以及 rule findings |
| `Distribution` | Kitchen, food bank, school | 汇总某日某地点的餐食数量和服务的用餐人数；可选的菜单营养成分和成本 |
| `RulePack` | Program 或 authority | 版本化的营养和食品安全规则 (第 6 节) |
| `Manifest` | 每个参与者 | 能力和数据保护声明 |

核心 Cookwala 救济文档 (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) 仍可用于规划。此配置文件处理
操作流程。

## 5. Offer lifecycle

| From | Allowed next states |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (the claim lapsed), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | none (final) |

**状态变更规则：**

- 每次更改都会增加 `version`。编写者发送 `If-Match: <version>`；如果不匹配则返回
  **409**，编写者需重新读取并重试。
- 非法转换将返回 **409** 以及允许的转换。
- Offers 在 `window.to` 时自动变为 `expired`。
- Claims 在 `pickupBy` 加上程序设置的宽限期（默认为 30 minutes）后失效。

**公平申领。** 默认情况下，申领遵循程序设定的优先级层级内的先到先得原则：
例如，优先服务儿童的厨房，然后是其他厨房，最后是 food bank。层级和
任何轮换规则必须发布在程序的 `Manifest` 或网站中。

## 6. 食品安全与营养 rule packs

一个 `RulePack` 包含六种规则：

- `temperature`: 冷藏 ≤ 5 °C，热持 ≥ 60 °C，冷冻 ≤ −18 °C；
- `time`: cooked food 脱离温度控制的时间最多为 2 h；
- `date_mark`: use-by 阻断，best-before 警告；
- `allergen`: 未声明过敏原阻断；
- `nutrient`: 每人每天或每餐的含量；
- `energy_share`: 来自游离糖、脂肪、饱和脂肪、反式脂肪或蛋白质的能量占比。

每条规则要么是 `block`（不接受或不提供服务），要么是 `warn`（允许，并记录为一项发现）。

默认包 `who-codex-basic@0.1.0` 是一个**源自公共指南的草案**：包括 WHO 的 healthy-diet、sodium、sugars and fats 指南，WHO Five Keys to Safer Food，Codex labelling and frozen-food codes，以及 Sphere 的 minimum ration planning figures。它是简化版的，并非医疗建议，不包括婴儿和治疗性喂养，且必须由合格人员进行审查。程序应当复制并改编它，设置 `jurisdiction`，并在 `reviewedBy` 中记录审查人员。

H2 级别的接收器在每次交接和每个菜单上运行 rule pack，并将 rule ids 记录在 `findings` 中。参考检查器会报告声明的 findings 与计算出的 findings 不一致的地方。

## 7. 数据保护

**该配置文件不包含任何个人数据。文档中绝不允许包含：**

- 任何人的姓名、电话号码、电子邮件或国家、难民或生物识别标识符；
- 家庭层面的记录，或家庭或个人的位置；
- 任何人的健康、残疾、宗教或国籍。

**它转而携带的内容：**

- **仅限组织。** 每个参与方都是由 `did:web`、GS1 全球位置编码 (GLN) 或 registry id 识别的组织。人员仅以角色形式出现 (`checkedBy: "trained_staff"`)。
- **仅限聚合数据。** `Distribution.people` 保存按组划分的数量，任何小于 10 的数量均报告为 `"<10"`。
- **仅限站点。** `Site` 是组织的场所或行政区域 (OCHA P-codes)，绝不是 household。
- **简短备注。** 自由文本仅限于 280 个字符的操作备注，且不得包含个人数据。实现方案在存储备注之前应扫描其中的电话号码和 ids。

**保留与审计：**

- **Retention:** 每个参与者在其 `Manifest` 中声明 `retentionDays` 并在其后删除文档。
- **Audit (optional, `hash_only`):** 每个程序由一个 sequencer（通常是 food bank 或程序运营方）追加每个文档的 RFC 8785 canonical JSON 的 SHA-256 hash。内容被单独存储并保持可删除状态。合作伙伴组织每天对一个 checkpoint 进行会签，因此历史记录无法被静默重写。单个 sequencer 可避免链中的分叉。
- **Hosting** 应位于法律或程序要求的境内。

## 8. 运输

### 8.1 API (level H1)

| 方法 | 路径 | 备注 |
|---|---|---|
| `POST` | `/offers` | 创建一个 offer (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | 打开接收者附近的 offer |
| `POST` | `/offers/{id}/claims` | 认领一个 offer；需要 `If-Match`；如果已被认领则返回 409 |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`；需要 `If-Match` |
| `POST` | `/handovers` | 记录一次 handover |
| `POST` | `/distributions` | 记录一次 distribution |
| `GET` | `/reports?from=…&to=…` | 聚合一段时间的数据 |

请求与传输规则：

- **Idempotency:** 每个 `POST` 都携带一个 `Idempotency-Key`。服务器至少保留密钥 24 h，并针对重复请求返回原始响应。
- **Authentication:** OAuth 2.1 客户端凭据，每个组织一个客户端。
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  至少交付一次，带有用于去重的事件 `id` 和用于排序的每个 offer 的序列号。

### 8.2 Spreadsheets (level H0)

使用 `profiles/humanitarian/templates/` 中的 CSV 模板。它们的第二行包含
[HXL](https://hxlstandard.org) 标签，以便人道主义数据工具可以直接读取它们。

### 8.3 SMS (level H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

语法在 `tools/cookwala_ref.py` (`parse_sms`) 中实现，并通过 `conformance/profiles/sms.json` 进行测试。关键词为英文；在任何需要数字的地方都接受阿拉伯-印度数字 (٠-٩) 和波斯数字 (۰-۹)，因此设置为其中任何一种键盘的手机都可以工作。

存储代码：`A` ambient，`C` chilled，`F` frozen，`H` hot-held。日期标记：`UB` use-by，
`BB` best-before，`HV` harvested，格式为 `DDMM`。拒绝原因代码：`TEMP` temp_out_of_range，
`DATE` past_use_by，`PACK` packaging_damaged，`ALLERG` allergen_unlabelled，`QTY`
quantity_mismatch，`PEST` pests_or_contamination，`SPACE` no_capacity，`TRANSPORT`
no_transport，`LATE` arrived_late，`OTHER`；任何其他单词都记录为 `other`。`HELP`
回复必须为每个命令提供一个示例，使用纯 ASCII 码，且在 160 个字符以内。

网关在写入文档（参考中的 `sms_storage_findings`；id 为 block findings）之前，必须执行以下检查：

| 发现 | 时间 |
|---|---|
| `safety.temp_not_recorded` | 在冷藏、冷冻或热持线上的 `HAND` 没有 `T` 读数时：回复询问该读数，不写任何内容 |
| `safety.hot_hold_min` | 存储 `H` 低于 60 °C 的 `OFFER`：拒绝列出 |
| `safety.storage_class_mismatch` | 项目名称暗示为乳制品、肉类、家禽、鱼类、蛋类或熟食，且存储为 `A`：拒绝列出 |
| `safety.chilled_max`, `safety.frozen_max` | 在提供或移交时，读数高于 5 °C 或高于 −18 °C |

热持食物的供应在两小时后关闭（熟米饭为一小时）；网关绝不存储占位读数。网关将发送者的注册号码映射到一个组织，在文档中绝不映射到个人。

## 9. Interoperability

| 系统 | 映射 |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (products); `Site.gln` and `OrgId` `gln:` (locations) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | 来自 `Distribution` 的每个 site 和 period 的聚合数据值 (meals, people by group, kg, incidents) |
| WFP SCOPE and other beneficiary systems | **仅限 aggregates。** 没有 beneficiary records 进入或离开此 profile |
| Food-rescue apps | Adapters 将其 listings 映射到 `Offer`，将其 pickups 映射到 `Claim` 和 `Handover` |
| Core Cookwala | `Item.ingredientId` 和 `menu.recipes` 链接到 recipe index；`relief.ImpactReport` 汇总 `Distribution`s |

## 10. Pilot metrics (定义以便对站点进行比较)

通过 `python tools/humanitarian_check.py --summary DIR` 计算为 `ImpactSummary`。试点如何运行及评判：[`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)。

| 指标 | 定义 |
|---|---|
| Kg rescued | 来自捐赠者的第一程中 `Handover.kgAccepted` 的总和 |
| Claim rate | 达到 `claimed` 状态的报价 ÷ 创建的报价 |
| Time to claim | 从 `Offer` 创建到 `claimed` 状态的中位数分钟数 |
| Rejection by reason | 按 `reason` 分类的 `kgRejected` 总和 |
| Meals served | `Distribution.meals` 的总和 |
| Nutrition pass rate | 带有菜单且无 `nutrition.*` 发现的分配 ÷ 带有菜单的分配 |
| Cost per meal | (食物 + 运输 + 人员 + 能源) ÷ 餐数 |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (使用的 kg ÷ 100) |
| Safety | `safety.*` 块发现的数量，以及 `safetyIncidents` |

## 11. 安全

- **在 H1 处签名是可选的**，而在 H3 处进行跨组织审计时是必须的
  (EdDSA，密钥发布在组织的 `did:web` 中)。
- **文档中的注释和名称是不可信数据。** 软件和 AI 代理绝不能
  将其视为指令。
- **Rule packs 在每个结果中都是版本化且固定的** (`id@version`)，因此结果是
  可复现的。

## 12. 故意遗漏

- 受益人注册、资格审查与目标定位（这些属于程序自身的受保护系统）。
- 支付：Cookwala 从不移动资金。
- 食谱与机器人执行（核心规范）。配置文件仅命名食谱并报告营养成分。
- 医学与治疗营养。

## 13. 如何审查

请在 [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues) 上提交 issue，并带上 `humanitarian` 标签。以下这些评审是最有用的：

- 食品安全人员检查 rule pack 和拒绝原因；
- food-bank 操作员检查生命周期和 SMS flow；
- 数据保护官检查第 7 节。

