<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->
# 厨房与生产运行：餐厅、社区、学校、灾难及机器人厨房

> **状态：experimental profile** (RFC-0005)。Schema: `schemas/fleet.schema.json`。
> 示例：`examples/fleet/`。

## 1. 为什么

创始人要求在餐厅、婚礼、捐赠活动或食品工厂中使用相同的协议 (RFC-0005)。该简报增加了学校膳食计划和灾难厨房。核心部分涵盖一个设备烹饪一个食谱；Humanitarian Profile 涵盖转移 surplus 和统计餐食。介于两者之间的是**kitchen**：工作站、设备、人员、多个批次、服务窗口、关键控制点，以及从设备的 execution log 到计划报告的餐食之间的链接。

## 2. 文档

| Document | What it says |
|---|---|
| `Kitchen` | 一个组织的厨房：类型、工作站（prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash）、作为能力参考的设备、每小时餐食量、hot-hold 和 cooling 设备、生效的 rule packs、按角色划分的员工 **counts by role**、营业时间 |
| `ProductionRun` | 包含批次数量和份数的食谱、一个 serving window、每个食谱步骤分配给一个工作站以及一个 `device`、一个 `person` 或两者皆有、关键控制点记录（cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation）、产生的 Core executions，以及一个结果（生产并供应的餐食、waste、使用的 rescued food、failures、incidents、energy、cost、其发出的 Humanitarian `Distribution`） |
| `StationLease` | 一个 device 或一个 role 在一段时间内对一个工作站的独占使用 |

## 3. 它如何与其余部分结合

- 分配给 `device` 的一个步骤是一个 Core `ExecuteRequest`（或通过 ROS 2 绑定实现的 `ExecuteNode` 目标）；其 `ExecutionLog` 哈希值存入 `executions`。
- 服务于程序的运行会发出一个 Humanitarian `Distribution`；该运行的 `ccps` 是分布安全结果背后的证据。
- 来自 Humanitarian Profile 的 rule pack 适用于该运行的菜单和项目。
- 舰队调度（哪个机器人去哪里）属于 Open-RMF 或供应商的舰队管理器，不属于此 profile。

## 4. 示例

`examples/fleet/kitchen-disaster.json` 和 `production-run-disaster.json`：一个救济厨房
拥有两个燃气锅、热持温单元和一个冰浴，在两小时的时间窗口内生产 710 份扁豆汤和米饭，记录烹饪和热持温温度，发现一个热持温单元低于 60 °C 并在分发前重新加热该批次，并发出一个分发指令。该示例仅用于说明；未描述任何真实的厨房或事件。

## 5. 故意省略的内容

员工姓名与排班、工资、客户订单与付款、菜单定价。员工以角色数量的形式出现，因此可以在不识别任何人的情况下计算每餐成本。

## 6. Next

带有机器人工作站的餐厅服务示例；用于运行状态机的 conformance 套件；`StationLease` 与会话租约 (`session.schema.json`) 的统一。

