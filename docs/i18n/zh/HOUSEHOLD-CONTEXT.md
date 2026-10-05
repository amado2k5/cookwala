<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->

# Household Context Profile: the whole picture stays home

> **状态: draft profile** (RFC-0001)。不属于 Cookwala Core。Schema:
> `schemas/household.schema.json`。Registry: `vocab/facets.json` (139 facet types)。
> Recipient rules: `profiles/household/recipient-roles.json`。Local API:
> `api/household.openapi.yaml`。Example: `examples/household/context.json`。

## 1. 为什么

一个能够很好地服务家庭的机器人需要了解大量信息：家电及其特性、谁住在那里以及他们何时在家、宠物、儿童、饮食、过敏、用药时间、习惯、预算、购物习惯、上次出了什么问题。同样的这些事实既是入室盗窃计划，也是画像工具。这个画像为**家中的 planner** 提供了全貌，而仅为其他所有人提供了一个**constraint**。

## 2. 三个想法

1. **Facets.** 每个类型包含一个事实 (`cw.facet.household.health.allergies`)，并注明谁
   断言了它（declared, observed, reported, inferred）、何时、持续多久、置信度如何，
   以及隐私级别 (`public`, `household`, `sensitive`, `secret`)。
2. **registry 中的 travel rules。** 每种 facet type 都说明其原始值是否可以离开
   家庭：`never`（45 种类型：children, absences, layouts, health conditions, religion,
   behaviour, incidents, income posture），仅作为 `derived` constraint（81 种类型），或在
   明确授权后作为 `consented` disclosure（13 种类型，大多为面向制造商的设备 self-state）。
3. **Derived constraints.** 这是杂货商、规划者、配送服务、设备制造商或其他机器人
   唯一会接收到的 household object：“17:00–18:00 送至前门”，“禁止花生”，“15:00–15:30 走廊内禁止机器人移动”，“每餐预算上限 18.00 USD”。每个 constraint 仅指明其来源的 facet **types**，绝不包含其 values。

## 3. 谁获得什么

| 接收者角色 | 可能接收 |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI or software that plans the meal) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | 仅限 device fault summary (按类别统计故障次数，无时间，无 household facts)，且仅当 household 已指定 insurer 为接收者时；RFC-0001 将此列为若隐私审查提出异议时最有可能被移除的角色 |
| program (food bank, school) | 无 |
| dataset | 无 |

## 4. 规则

- 原始 facet 绝不会离开设备。没有任何 API 会将其返回给家庭网络之外的任何人。
- `inferred` facet 绝不会用于安全决策。
- 不会生成或存储任何人的行为评分。行为 facet 的存在是为了服务于 household (份量大小、何时清理)，且绝不会传输。
- 经济水平是一种 **owner-set budget posture**，绝不会从任何事物中推断得出。
- 儿童数据和缺席情况是 `secret` 且绝不会传输，即使是 derived 的也不例外，除非作为不泄露日程的移动和安全区域约束。
- 每个 facet 都是可擦除的。擦除在 household 的窗口期内完成 (默认 7 天，最多 30 天)，并记录在 execution log 中但不包含内容。
- 隐私级别可以高于 registry 默认值，但绝不会降低。

## 5. 本地事件记忆

RFC-0001 询问机器人记得哪些关于警报、冲突、放弃和教训的信息。`LocalIncident` 保存了这些信息：日期、来自 `vocab/incidents.json` 的类别、按类型划分的相关人员、一条备注和一条教训。它永远不会离开家庭。Core 中公开、匿名的 `IncidentReport` 是一个不同的文档，每个 maker 都会从中学习。

## 6. Conformance

配置文件向量 (`conformance/profiles/disclosure_policy.json`) 提供 facet 和接收者角色，并期望准确的 constraint 类型、已披露的 ids 以及带有原因的未披露 ids。参考实现是 `tools/cookwala_ref.py` 中的 `derive_constraints()`。

## 7. 与其他文档的关系

`ClientProfile`、`KitchenProfile` 和 `RobotProfile` (`profile.schema.json`) 保持为便捷的捆绑包。任务 facet (`mission.schema.json`) 使用相同的 registry ids。核心 `AgentMandate` 保持为关于 agent 可以做什么的规范性陈述；mandate facet 在本地描述 household 的 rules。

## 8. 开放性问题

参见 RFC-0001: closed recipient roles; raise-only privacy; 包含一名评审员的数据保护影响评估。

