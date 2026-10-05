<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->

# 农场 surplus 与供应信号

> **状态：experimental** (RFC-0007)。Schema: `schemas/supply.schema.json`。示例：
> `examples/supply/`。**Gate：** 在任何生产使用前的竞争法审查
> (`docs/ACTION-PLAN.md`，关注点 C7)。cookwala.ai 今日未发布任何信号。

## 1. 农民现在需要的两件事

1. **一种在过剩物资腐烂前进行列出的方式。** 农场是人道主义概况（Humanitarian Profile）中的捐赠者：
   一个具有 `Item.origin: farm` 和 `harvestedAt` 的 `Offer`，或通过 SMS：

FARM 120KG TOMATO A BB0411

food bank 声称它，厨房烹饪它，分发统计它。没有新文档，
   没有个人数据，仅限组织。
2. **关于将需要什么的公平信号。** 以下是实验部分。

## 2. 需求与供应信号

| Document | Says | Rules |
|---|---|---|
| `DemandSignal` | 在区域 R，在 ISO 周 W，厨房和项目计划使用 L 到 H kg 的成分**类别** C | 至少 20 个贡献源；在周结束后至少 7 天发布；类别层级（豆类、叶菜类、家禽），绝非产品或品牌；**无价格**；区域细度不细于 admin1，除非有 100 个或更多源 |
| `SupplySignal` | 在区域 R，在周 W，类别 C 处于过剩、正常或短缺供应状态，且有收获窗口 | 由合作社、项目或市场运营方发布；**对所有人开放**：公开、免费、对每个读者均一致 |

参考检查是 `tools/cookwala_ref.py` 中的 `check_signal()`；配置文件向量 (`conformance/profiles/signal.json`) 显示了哪些是被接受的，哪些是被拒绝的。

## 3. 为什么会有这些规则

在竞争对手之间共享预测是竞争执法机构警告的信息交换行为。聚合、延迟、类别层面、无价格以及公开发布，能使信号对规划保持有用，而对协调价格无效。阈值是起点；应当由法律顾问和统计学家来设定。

## 4. 创始人的想法会变成什么

宏观循环 (RFC-0007)：计划烹饪 → 聚合需求 → 农场和商店计划需求 → 减少种植、移动和丢弃。城市、国家和世界模拟器在其假设下展示了该效应的大小（仅作说明，而非预测）。这两份文件是向其迈出的最小的诚实一步。

## 5. Later

来自前瞻需求的种植建议；储备规模（一个完美的精益供应链是脆弱的）；跨区域救济流；来自合作社的 SMS 供应信号。

