<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# 路线图：now, next, later

**Status:** 2026-10-04. 每个项目都带有状态：**done**，**in progress**，**planned**，
**not yet funded**。Gate 来自 `ACTION-PLAN.md` 第 4 节。没有指定的 evidence，任何项目都不能从 planned 变为 done。

## Now (this release)

| 项目 | 状态 |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Nine example recipes in English and Arabic | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website in English and Arabic with a page for every stakeholder, whitepaper and deck | in progress |

## Next (within about a year, as resources allow)

| 项目 | 状态 | 关卡 |
|---|---|---|
| 食品科学家对 operation envelopes 的评审 | planned | 评审员同意 |
| 营养师和食品安全官员对四个 rule packs 的评审 | planned | 评审已归档；packs 移至 reviewed |
| 家庭概况的数据保护影响评估 | planned | 评审员同意 |
| 一个 food-bank 试点（12 周，预注册，独立评估员） | not yet funded | 合作伙伴与资金 (`humanitarian/CONCEPT-NOTE.md`) |
| 几个模型家族的 Agent-safety 基准测试结果 | planned | 运行结果连同方法一并发布 |
| `pip install cookwala` wheel 和 npm 上的 `@cookwala/sdk` | planned | 捆绑词汇表和模式的打包 |
| Registry 服务 (`validate`, `publish`, tombstones) | planned | 一个 worker 和命名空间证明 |
| 首个针对参考 hub 实现 Core API 的设备制造商 | planned | 一家制造商同意；conformance 报告已发布 |
| 首批 fifi.cooking collections 的转换 | planned | 创始人根据每个 collection 决定权利 |
| 基于设备反馈的 Core 0.3 | planned | 两个实现者的反馈 |
| 指导委员会 | planned | 三个独立采用者或两个实现 |

## Later

| 项目 | 状态 |
|---|---|
| 真实设备烹饪 Cookwala 食谱的未经编辑视频 | 尚未获得资金；需要设备合作伙伴 |
| 带有独立认证机构的 certification 方案 | 已计划；尚未聘请认证机构 |
| 规范、商标和标志的中立基础 | 已计划 |
| 贡献者网络：附带署名的真实食谱经同意的录制 | 已计划 |
| 由项目和合作社发布的供需信号 | 已计划，需经过竞争法审查 |
| “在模拟中烹饪”基准 (Isaac Lab, Gazebo 或 MuJoCo) | 已计划 |
| 人道主义概况的数字公共产品认可 | 已计划，需试点证据 |
| 世界模拟器中的跨区域救援流；清洁烹饪效应 | 已计划 |

## 我们不会做的事情

收集个人数据；在没有方法的情况下发布数字；在合作伙伴同意前对其进行命名；
声称拥有不存在的 certification；将 household data 放入任何 ledger；构建厨房所依赖的中央 orchestrator；声称结束饥饿。

## 终止与转向规则

来自行动计划：如果两轮外部审查未能产生设备制造商或试点合作伙伴，Cookwala 将缩小范围至人道主义配置文件（Humanitarian Profile）和食谱格式。如果试点显示的增益低于 5 %，则在进行任何规模化之前发布结果并重新设计配置文件。

