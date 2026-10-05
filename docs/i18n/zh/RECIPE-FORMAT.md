<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->
# Cookwala 食谱格式：适用于 Missions 的食谱

Cookwala 中的食谱不是一份指令列表。它是**可移植的烹饪知识**，规划器针对特定的 Mission（家庭、机器人、设备、能源、预算、健康、时机）将其*编译*成一个可执行计划。随后机器人运行该计划，并在现实发生变化时通过应急预案和剧本进行调整。

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json)。完整的完整示例：
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json)。

## 1. 四个层级（改编自 WHO SMART 指南方法）

| 层级 | 包含内容 | 编写者 | 存储位置 |
|---|---|---|---|
| **R1 Narrative** | 人类食谱文本、故事、文化笔记、照片 | 厨师、主厨、fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | 该菜肴*是什么*以及*必须是什么*：身份（本质 vs 灵活）、感官目标、营养、分量与食用方式、存储、验收检查 | 食谱编辑、AI 辅助、经审核 | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | 与设备无关的方法：配方（比例 + 角色）、带有食物状态前后置条件的类型化 ops 过程图、`until` 条件、替代方案、暂停规则、故障模式、可利用性、危害、CCPs、环境准备 | 导出流水线 + 审核；经模拟器验证 (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | 为*本次* Mission 编译的 R3 食谱：精确分量、选定的变体、分配的角色与设备、时间表、租约、监控器、应急预案 | 规划器/编译器，在运行时 | 在 **Mission** (`plan`) 内部，绝不在目录中 |

就像源代码和编译器一样：**食谱是可移植的中间表示 (R3 + R2)。Mission 是目标机器。** 这正是让食谱在机器人和 AI 发生变化时依然保持有效的原因：更好的规划器会从同一个食谱中生成更好的 R4。

## 2. Mission 中每个部分的作用

| 食谱章节 | Mission 用于…… |
|---|---|
| `identity.essential / flexible / neverAdd` | 替代品、预算和配给模式、饮食调整：改变 flexible 部分，绝不改变 essential 部分，以确保菜肴仍保持其本质 |
| `formula` (ratios, min/max, role, scaling) | 精确缩放至任意人数、在一周内配给食材、扩展预算、用完手头现有的食材（限制性食材重缩放） |
| `sensory` | 视觉、香气和味道检查点；household taste profiles (salt 2 vs 4)；重新利用和修复决策 |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **环境准备任务：** 如果水槽或炉灶被占用，规划器会添加 "clear, wash, dry" 任务；浸泡或解冻任务会提前数小时调度 |
| `process.nodes[]` 带有 `pre`/`post` 食物状态 | 规划（仅开始已准备就绪的部分）、验证（该步骤是否产生了该状态？）、中断后恢复 |
| `until`, `onTimeout`, `retry` | 了解步骤何时完成，以及在未完成时该做什么 |
| `alternatives[]` + `energy` | 燃气 vs 电磁炉 vs 烤箱、电池节省模式、无烤箱厨房、安静时段 |
| `pause` (pausable, safeState, maxPause, onExceeded) | **中断：** 孩子需要帮助、主人呼唤、狗撞倒了东西。机器人将该步骤置于其 safe state，处理该事件，然后根据 pause budget 进行恢复、重新加热、挽救或丢弃 |
| `failureModes` (incident, detect, prevent, playbook) | 早期检测已知问题以及用于恢复的精确 playbook |
| `affordances`, `space` | 将步骤与能够抓取、提起和触及的机器人相匹配；使热区远离儿童 |
| `safety` (hazards, CCPs, supervision, abort) | 安全内核：每个计划都必须保留的不变量 |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | 上菜：什么上桌、送入房间、放入便当盒；提醒和保持限制；文化饮食风格 |
| `storage` | 剩菜、提前烹饪和便当 Mission |
| `acceptance` | 食谱的 *tests*：当这些条件成立时，Mission 即告完成 |
| `nutrition`, `cost` | 个人份量、预算、救济配给 |

## 3. 示例：包含所有附件的一个步骤

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. 为一项 Mission 编写食谱（规划器所做的操作）

1. **选择变体：** 从 `alternatives` 中选择饮食、质地 (IDDSI)、设备、能量和模式。身份要素必须保留。
2. **缩放：** 根据 `formula` 和份量、人均份量 (HEALTH.md)、限制性成分或配给期限进行缩放。香料呈次线性缩放，时间按质量指数缩放。
3. **替换：** 在角色范围内进行替换，尊重 `identity.neverAdd`、过敏原、饮食包和库存。
4. **准备环境：** 将 `prep` 与任务的空间 facet（水槽满了？灶台被占用？案板脏了？）进行比较，并添加整理、清洗、干燥和分阶段准备任务。调度 `advanceTasks`（浸泡、解冻、腌制、预热）。
5. **绑定：** 根据功能和能力将每个节点分配给机器人、器具或人类。租赁燃烧器、容器和区域。附加监控器（智能锅、送达 ETA、烟雾探测器）。
6. **调度：** 从上菜时间反向调度，遵守暂停预算、电池和能量限制、家庭安静时间以及厨房共享窗口。
7. **附加应急预案：** 每个节点的 `failureModes` 和 `pause` 规则，加上任务的全局策略（中断、灶台附近有儿童或宠物、炉灶看守、变质观察）。
8. **验证：** 模式 + 语义检查、策略包、CCP 覆盖范围、模拟器 dry run、优先级栈不变性 (PROTOCOL §7.2)。
9. **发布 R4** 到任务的 `plan` 中，对其进行签名，并交给机器人。

## 5. 编写与转换

- **来自 fifi.cooking：** EXPORT-FIFI 流水线生成 R1 + R2 + R3。新的
  章节（identity, sensory, formula, prep, service, pause, failureModes, affordances）
  由本地模型从现有文本生成，并由验证器和抽样人工审查进行检查。
- **来自 Web：** `cookwala convert --from schema-org` → R1/R2 (V0)，然后进行相同的
  富化。
- **转换为其他格式：** schema.org Recipe (R1/R2 用于搜索引擎), Cooklang (人工
  编辑), PDDL 或时序逻辑 (研究规划器) 都可以从 R3 生成。
- **手动：** `cookwala init recipe` 构建所有层级；`cookwala validate` 和
  `cookwala simulate` 对其进行检查。
- **版本控制：** 修订版本是不可变的且经过哈希处理。分支记录 `meta.derivedFrom`。
  食谱 **patches** (来自 playbooks 或反馈) 作为 diff 提出，并且仅在经过审查和证据确认后才被提升。

## 6. 步骤文本的语言

步骤句子首先是为人类编写的，其次才由机器解析。示例食谱中的阿拉伯语步骤文本使用了女性命令式 (قطّعي، سخّني)，这是埃及食谱的常用惯例；这是一个刻意的选择，而非疏忽，出版商也可能使用性别中立的被动语态 (تُقطَّع البصلة) 来代替。`op`、`params` 和 `until` 字段承载了含义；句子是写给厨师看的。

## 7. 为什么这具有前瞻性

- 食谱描述的是 **food outcomes and constraints，而非 motions**。新的机器人和新的 AI 能从相同的 R3 中产生更好的 R4 计划。
- 所有新章节均为 **optional and additive**。V0 食谱（仅 R1）仍适用于引导式人工烹饪；每增加一个层级都会解锁更多的自动化。
- 未知的 `x-` 字段会透传。供应商、厨师和卫生机构可以扩展食谱而不会破坏任何人的使用。
- **Acceptance checks** 让任何执行者（无论是人类还是机器人）都能证明菜肴制作正确，这也是食谱通过实地证据晋升至 V3 的方式。

