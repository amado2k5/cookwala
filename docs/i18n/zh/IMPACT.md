<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->

# 影响：Cookwala 可以改变什么，包含来源与标签

**Status:** 2026-10-04. 以下每个数字均标记为 **measured**（由所述来源计数或报告）、**modelled**（在所述假设下由我们的模拟器生成）或 **assumed**（规划数值）。此处没有任何内容是 Cookwala 在现场的结果：尚未进行任何试点。本页面说明了问题的规模以及 Cookwala 做出贡献的机制。

## 1. 饥饿

| 事实 | 数字 | 标签与来源 |
|---|---|---|
| 2023 年面临饥饿的人数 | 约 7.33 亿 | measured by the source: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| 2023 年中度或重度粮食不安全的人数 | 约 23 亿 | measured by the source: SOFI 2024 |
| 收获与零售之间的食物损失 | 约占生产食物的 14 % | measured by the source: FAO, *The State of Food and Agriculture 2019* (UNEP 将同一数字四舍五入为 13 %) |
| 2022 年在零售、餐饮服务和 household context 中的食物浪费 | 约 10.5 亿吨；每人约 132 kg；household context 中每人约 79 kg | measured by the source: UNEP, *Food Waste Index Report 2024* |

**Cookwala 的机制：** 在食物变质前送达厨房的 surplus 提供，并在每次交接时进行冷链检查（Humanitarian Profile）；在每个站点以相同方式计算影响，以便项目进行比较和改进；later，聚合需求和供应信号，从而减少种植和移动后被丢弃的量（experimental，取决于竞争法审查）。**它不做的：** 解决贫困、冲突、气候冲击、价格或政策，这些是导致大多数饥饿的原因。

**Modelled, 仅作说明，而非预测：** 国家模拟器的混合推广救援的餐食量约等于其虚构的粮食不安全人口需求的 4.7 %；世界模拟器的“协议，无机器人”场景仅通过救援就覆盖了约 7.7 亿（模拟器的 assumed 基准，是上述 7.33 亿 measured 数值的向上取整）饥饿人口中的约 4000 万。两者表达了相同的内容：救援至关重要，但并不足够。

## 2. 健康

| 事实 | 数据 | 标签与来源 |
|---|---|---|
| 每年因不安全食品导致的疾病 | 约 6 亿；约 420,000 人死亡 | measured by the source: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| 盐摄入量与指南对比 | 大多数人每天摄入 9 至 12 g 盐；WHO 建议低于 5 g (2 g sodium) | measured by the source: WHO fact sheet on salt reduction |
| 每年归因于高钠摄入的死亡人数 | 约 190 万 | measured by the source: WHO, *Global report on sodium intake reduction* (2023) |
| 依赖污染性烹饪燃料的人数 | 约 21 亿；每年因 household air pollution 导致约 320 万人死亡 | measured by the source: WHO fact sheet on household air pollution (2024) |

**Cookwala 的机制：**在设备上强制执行并记录的关键控制点以及热持温、冷却和重新加热限制；在菜单上标记钠、游离糖、饱和脂肪以及水果和蔬菜的 rule packs；针对儿童、怀孕和老年人的护理规则；一份审查记录，以便营养师和食品安全官员可以为某个 pack 提供保证。
**它不执行的操作：**诊断、治疗或计算治疗饮食；参见 `docs/health/CLAIMS-POLICY.md`。

**Clean cooking** 在图中但不在模型中：模拟器尚未计算木柴和木炭烹饪或其健康影响（列为一项局限性；next）。

## 3. 环境

| 事实 | 数值 | 标签与来源 |
|---|---|---|
| 食物损失与浪费占全球温室气体排放的份额 | 大约 8% 到 10% | measured by the source: UNEP, *Food Waste Index Report 2024* |

**modelled, 示例：** 在世界模拟器中，“具有该协议的许多机器人”在五年内相比没有这些机器人的相同世界，可减少约 4.1 % 的食物流失或浪费，并减少约 5.2 % 的排放；“仅有许多机器人”会减少 household context 浪费，但会使进入家庭前的流失增加约 3 %（牛鞭效应）。机器人的电力消耗（在该场景下五年内约为 164 TWh）也被计入。这些是模型在其假设下的输出，列在每个模拟器页面上。

## 4. 经济与工作

**Assumed and modelled:** 城市模拟器估计每人每月减少约 5 USD 的食品支出，且每户每月因使用机器人烹饪和购物而减少约 10 小时，不包括硬件。任何地方都没有给出就业人数；新角色已被命名
（recipe engineers, food-robot technicians, certifiers, rule-pack reviewers）但没有
具体数字。

## 5. 文化

没有数字。该主张是定性的且可验证的：一份 Cookwala 食谱携带烹饪者的姓名、菜肴的身份（什么是本质的，什么是灵活的，什么是绝不添加的）、烹饪者语言的文本以及一个签名。烹饪它的机器将食谱作为工作知识继承，并带有署名。

## 6. 当有可测量内容时，我们将测量什么

| 衡量指标 | 方法 | 定义位置 |
|---|---|---|
| 挽救的公斤数、提供的餐食数、覆盖的人数、营养合格率、每餐成本、申领时间、申领率、安全阻断发现、安全事件 | 从 Offer、Claim、Handover 和 Distribution 文档中计算得出 | Humanitarian Profile section 10; `ImpactSummary` |
| 经过验证的厨师：运行了端到端签名食谱且具有 conformance 日志的执行 | 带有同意信息的 execution logs | `STRATEGY.md` section 11 |
| 通过 conformance 的独立实现 | 已发布的 conformance 报告 | `docs/CERTIFICATION.md` |
| 每个模型的 Agent-safety 结果 | promptfoo 基准测试，包含 model id、日期和 config hash | `evals/kitchen-agent-safety/` |

## 7. 我们尚不知道的内容

该 food bank 使用此 profile 是否比使用其当前方法能挽救更多（pilot protocol 已存在；尚未运行任何 pilot）。envelopes 是否适用于每种菜系（一位 food scientist 尚未对其进行评审）。simulators 的 behavioural assumptions 是否成立（它们已列出且可调节）。rebound effects 有多大。此处没有任何内容是承诺。

## 8. 出了什么问题

目前尚未进行部署，因此在实地运行中没有出现任何问题。在仓库中：第一个单行描述（“world's first and largest robot cooking recipes index”）夸大了现有内容并已更改；第一个 Mission schema 接受未知字段，现已改为严格模式；第一批模拟器使用了 strawman baseline，随后获得了 competent-integration baseline 和范围。驱动这些变更的批评意见已发布 (`docs/CRITIQUES.md`)。

## 9. Sources

- FAO, IFAD, UNICEF, WFP and WHO, *The State of Food Security and Nutrition in the World
  2024*, Rome, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rome, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Geneva, 2015.
- WHO, *Global report on sodium intake reduction*, Geneva, 2023; WHO fact sheet *Salt
  reduction*.
- WHO fact sheet *Household air pollution*, 2024.

数据以来源发布的形式进行引用，并进行四舍五入；在印刷引用前，请根据当前版本重新核对每一项。组织是来源，而非合作伙伴。

