<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/MESSAGING.md -->
# 消息传递：Cookwala 说什么，以及如何说

**Status:** 2026-10-04. 在页面之前编写。每个页面都遵循此文档。

## 1. 那一句话

**Cookwala 是安全烹饪的开放标准：人、厨房与机器人。**

Arabic: **Cookwala 是安全烹饪的开放标准：面向人类、厨房与机器人。**

## 2. 无处不在的三元组

一个 Cookwala 食谱说明了机器可以检查的三件事：

1. **要做什么。** 机器可以规划的步骤化食谱。
2. **何时完成。** 它可以测量的温度、食物状态线索和时间。
3. **绝不能发生什么。** 设备强制执行的安全限制。

阿拉伯语：**我们煮什么。什么时候熟。什么绝对不应该发生。**

## 3. 诚实讲述的任务

- **Mission:** 帮助消除饥饿，让人们更健康，并让机器人为人类工作。
- **How we say it:** “Cookwala helps end hunger by…” 后面跟着一种机制（减少浪费、更安全的救援、更便宜的餐食、协调），绝不使用 “Cookwala ends hunger”。
- **The caveat, once per page where the mission appears:** 饥饿有许多原因：贫困、冲突、气候、价格、政策。Cookwala 的作用是真实且部分的。

## 4. 三个阶段，保持克制

| Horizon | Say | Do not say |
|---|---|---|
| Now (to 2028) | 更安全的设备，宁可拒绝也不要猜测；跨机器运行的食谱；通过手机和电子表格拯救更多食物的 food bank；无法被欺骗的代理；你今天就能运行的开源工具 | "widely adopted", "proven" |
| Next (2028 to 2036) | 能烹饪每种菜系的家用和商用机器人；保持食谱生命力的经授权数据集；新角色；更少的浪费；更便宜、更健康的膳食；监管机构参考的标准 | "robots in every home", numbers of robots |
| Later (2036 and beyond) | 作为基础设施的烹饪：为任何人、在任何地方提供营养食物，包括灾区和不会烹饪的人；更少的浪费和更低的排放；归还人类时间；继承而非抹除烹饪遗产的机器 | dates, counts, "end hunger" |

读者通过遵循机制来发现规模；我们不会对其进行公告。

## 5. 编写规则

- 使用平实的词汇，短句。每个句子表达一个观点。
- 不使用术语：不要使用 revolutionary, disruptive, AI-powered, world-class, first and largest。
- 每个数字都是 **measured**、**modelled** 或 **assumed**，其来源需紧跟在数字旁边。
- 对于尚未存在的事物，使用 **now / next / later**。绝不要暗示某项服务已经存在。
- 不使用任何不存在的合作伙伴、用户、试点、引用、徽标或背书。组织应作为来源或标注为“我们希望合作的对象”出现。
- 通过角色和处境来描述人，绝不通过缺陷来描述。不要将“the vulnerable”作为名词；使用“children under five”或“people who cannot cook for themselves”。
- 安全是一个带有单位的数字，绝不要只使用“safe”这个词。
- Refusal 是好消息。自豪地说明“the device refuses before anything heats up”。
- 在每一个影响页面和路线图页面上，说明我们不知道的事情以及出错的地方。
- 代码放在代码块中；每个命令后需附带预期输出。
- 阿拉伯语是一个一级版本，而不是事后补做的翻译：保持相同的结构、相同的诚实度、从右至左的布局，以及读者预期的阿拉伯数字（技术内容中使用西式数字是可以接受的）。

## 6. 词汇表

| 使用 | 代替 |
|---|---|
| recipe, step, done, safe band, limit, refuse, check, verify, consent | instruction set, AI brain, smart, autonomous |
| device, executor, hub | the robot (除非指代机器人) |
| people who cannot cook for themselves | the elderly, the disabled |
| food bank, community kitchen, program | beneficiaries, recipients |
| measured, modelled, assumed | estimated, projected (不带标签) |
| now, next, later | coming soon, roadmap item (不带 horizon) |

## 7. 我们今天可以展示的证明

在构建时从仓库中统计 (`/v1/stats.json`)：具有物理定义的 operations，conformance 向量，safety limits，agent-safety tests，humanitarian rules，schemas，已发布的 recipes，languages，simulators。每一项都显示其类型。除非引用了来源，否则其他任何内容都不是数字。

## 8. 按动词分类的行动呼吁

尝试 (dry run, 模拟器) · 阅读 (quickstart, Core, whitepaper) · 构建 (SDK, hub, MCP) ·
发布 (recipe, device, pack) · 试点 (humanitarian) · 审查 (rule pack, envelopes) ·
教学 (lesson kit) · 立法 (model language) · 合作与投资 (investors page) ·
贡献 (RFC, translation, vectors)。

## 9. Headline bank

- 安全烹饪的开放标准。
- 做什么。何时完成。绝不能发生什么。
- 选择拒绝而非猜测的设备。
- 通过 SMS，让本会被丢弃的食物安全地到达餐盘。
- 每种菜系，都标有烹饪者的名字。
- 安全是本地化的。同意是明确的。记录可以被检查。
- 机器人正在学习移动。但没有人写下如何烹饪。

## 10. 每一页包含的内容

一个状态标签（Core normative, draft profile, experimental, planned），页脚中的那一句话，每层的 licences，指向 critiques 的链接，以及在任何陈述结果的页面上关于“what we don't know yet”的区块。

