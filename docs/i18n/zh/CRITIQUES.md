<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# 我们发布的 Critiques

我们针对 Cookwala 提出了尖锐的问题并记录了答案。每个疑虑在 [action plan's concern register](ACTION-PLAN.md#2-concern-register) 中都有一个 id，并附带我们的回复及其状态。欢迎外部评审，并将在此列出。

## 这能行得通吗？ (strategy)

| 担忧 | 简短回答 | 状态 |
|---|---|---|
| 市场尚不存在；规范领先于产品 | Small Core，演示优先，没有用户就不制定新规范 | Core 0.2 已完成；下一步进行设备演示 |
| 没有有权势的人有理由采用 | 以每个采用者的收益为导向；无需机器人即可使用 | 正在寻求 food-bank 试点和设备合作伙伴 |
| 模拟器证明的是它们所 assumed 的内容 | 公平的基准、范围、“illustrative”标签；用试点取代它们 | Open |
| 饥饿关乎贫困和冲突，而非 surplus | Cookwala 做出贡献；它并不声称能独自终结饥饿 | 消息已更改 |
| 安全、责任和攻击面 | 在设备上强制执行限制；refusal；recalls；事件报告 | 规范已完成；certifier 审查 open |
| 隐私（健康和宗教数据，账本 vs 擦除） | 本地优先，选择性披露，仅 hash 的 logs，同意 | 规范已完成；影响评估 open |
| 太复杂 | Core 0.2；其他一切均标记为实验性 | Done |
| 对创始人的依赖 | 通往中立归宿的治理路径 | GOVERNANCE.md |

## 技术设计是否合理？

| 疑虑 | Core 0.2 中发生了什么变化 |
|---|---|
| 操作没有物理含义 | Envelopes, heat levels, sensor ladders, altitude rule, test vectors |
| 单位和数字错误 | °C only, absolute tolerances, kitchen units, densities, decimal money |
| Schema 接受拼写错误 | 带有 `x-` 扩展的严格 Schema；offline bundle |
| 一个可变的 Mission 文档 | Event log + projection, single sequencer, transitions table |
| Ledger 证明力不足 | 带有撤销功能的关键记录，witnessed checkpoints，重写检测 |
| 未定义的事件传递；总线上的安全性 | Sequence numbers, latency classes, heartbeats, "safety is local" |
| API 表面漂移 | Core OpenAPI；在 CI 中检查每个引用 |
| 没有验证器 | Reference library 和 106 conformance vectors |

## 我们正在请求的 reviews

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), 食品科学家
(envelopes), 食品安全官员和营养师 (rule packs), 一项安全审计, 一项
数据保护审查, 以及认证方的差距分析。参见
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced)。

