<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->

# Stakeholders: 一条消息，若干选项，一次初步成功以及面向所有人的流程

**Status:** 2026-10-04. 对于每个群体：为什么 Cookwala 对他们很重要，从轻度到深度的参与方式，在 15 分钟内的首次成功，其后的路径，以及参与如何推进他们的工作和世界。此处未提及任何不存在的合作伙伴、用户或试点。凡是计划中的内容，均标注为 next 或 later。

每一行背后的三个目标：帮助消除饥饿，让人们更健康，让机器人为人类工作。

---

## 1. 构建者：开发者、机器人与家电制造商、嵌入式工程师、AI-agent 构建者、智能家居与平台开发者、开源贡献者

**消息。** 机器人和家电正在学习移动。没有人以机器可以检查的形式写下“simmer”意味着什么，什么时候鸡肉是安全的，或者什么时候必须拒绝一个步骤。Cookwala 就是那层架构：机器可以规划的食谱、它可以测量的结束条件，以及它强制执行自身的安全限制。它是开放的、免版税的、模型中立且设备中立的，并附带了一套你今天就可以运行的 conformance 套件。

**选项。**
- *Light:* 运行浏览器的 dry run；阅读 Core 0.2（一个晚上）。
- *Medium:* `pip install -e sdk/python`，针对示例食谱对您的设备能力进行 dry-run，运行 conformance 向量，启动 reference hub。
- *Deep:* 在设备或 hub 上实现 Core API，发布一份 conformance 报告，将您的设备添加到 directory，提出一个 RFC，编写一个 ROS 2 bridge node，向 agent-safety benchmark 添加攻击用例。

**首次成功（15 分钟以内）。**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**流程。** dry run → 针对 reference hub 实现 Core API → 通过 conformance →
发布报告 → 列出设备 → 经同意的 execution logs 成为 LeRobot 数据集和
OpenTelemetry traces。

**它如何推进他们的工作。** 一个共享的烹饪任务定义和成功测试，并配有用于衡量的公开基准；无需编写即可拥有每种菜系的食谱；监管机构可以阅读的安全故事；作为销售文档的 conformance 报告；在由其执行者管理的标准中占据先发优势。

**它如何推动社会进步。** 更少的厨房火灾和食源性疾病，源于那些选择拒绝而非猜测的机器；源于那些继承了世界各地美食而非仅限于少数美食的机器。

---

## 2. 公司：初创企业、大型企业、食品公司、杂货商与配送、餐厅与餐饮服务、保险公司、认证机构、销售与合作伙伴团队

**消息。** 在接下来的几年里，每一家涉及食品的公司都将遇到烹饪机器和 AI agents。Cookwala 为所有这些设备提供了一个统一的接口，它是唯一一个在设备上强制执行安全限制并提供可供审计记录的接口。对于杂货商和配送商：接收配送时间窗和过敏原要求，而非家庭日程。对于保险公司和认证机构：为您设计的 conformance 报告格式和事故报告 feed。

**选项。**
- *Light:* 阅读 Investors and partners 页面和 trust 页面；将您的产品映射到
  ingredient classes 和 operations。
- *Medium:* 发布一个 offer feed（market profile, experimental）或向
  local program (Humanitarian Profile) 发布一个 surplus offer；在您计划部署的 agent 上运行 agent-safety benchmark。
- *Deep:* 在产品中实现 Core API；赞助一次 conformance verification；在 steering committee 成立时加入；采用 certification path。

**首次成功。** 将一条产品线转换为带有 GTINs 和过敏原凭证的市场 `Offer`，对其进行验证，并查看它可以提供哪些示例食谱。

**Flow.** 提供 feed → 来自 households 的 derived constraints → 通过您自己的 checkout 下单 → fulfilment events → 来自 execution reports 的 reputation（经同意）。

**它如何推进他们的工作。** 访问中立层而非数十种供应商集成；减少浪费的需求信号（later，在竞争法审查之后）；保险公司可以定价的 certification；一份公开的安全记录。

**它如何推动社会进步。** 减少从商店到餐盘之间的食物浪费；让 surplus 在腐烂前送达厨房；让家中的机器无法被诱导进行不安全的操作。

---

## 3. 提供商：杂货商、农场与合作社、配送、能源、AI 与模型供应商、食谱发布者

**消息。** 提供商以 peer 的身份接入 Cookwala，而非 tenant。杂货商或配送服务获取的是一个 constraint，绝不会获取某个 household 的 facts。AI 供应商获得一个展示其 model 在厨房中是安全的 benchmark，以及一个今天即可使用的 MCP server。食谱发布商在每份食谱上保留其名称，并可以从一个 static folder 发布一个 signed catalog。

**选项。** 发布目录 (recipes) · 发布报价 feed · 运行 agent-safety benchmark · 运行一个 registry node · 通过 SMS 提供 surplus。

**首次成功。** 食谱发布者：`cookwala init my-dish`，编辑，`cookwala validate`，
`cookwala hash`；您的目录是一个包含 `/.well-known/cookwala.json` 的文件夹。AI 供应商：
添加 MCP server 并运行十个 agent-safety cases。

**Flow.** Catalog or feed → registry entry under your proven namespace → recall feed if
something goes wrong → reputation from outcomes.

**如何推进他们的工作。** 通过一种格式触达每个设备和代理；
通过签名实现信用和溯源；一个在诚实通过时可作为营销资产的安全基准。

**它如何推动社会进步。** 食谱保持归属权；代表人们行动的代理人在被信任之前经过 measured。

---

## 4. 食物：农民、厨师与主厨、家庭厨师、食谱创作者、烹饪学校

**Message.** 为 Cookwala 编写的食谱可以让您的姓名和您的菜系在每一个烹饪它的设备上保持活跃，并将机器绝不能跳过的步骤记录下来。一个出现 surplus 的农场可以通过 SMS 列出它，并在同一天触达厨房。一所烹饪学校可以使用一种可以自我检查的格式来教授食品安全。

**选项。**
- *农民：* 将 `FARM 120KG TOMATO A BB0411` 发送到程序的网关（如果存在）；
  later，读取供需信号。
- *厨师和主厨：* 将一个你烂熟于心的食谱转化为 Cookwala 食谱；用你的语言检查
  步骤句子；later，记录带有积分的已授权会话。
- *学校：* 使用九个示例食谱作为教学案例；添加你自己的。

**首次成功。** Cooks: `cookwala init`，为每个加热步骤编写一个带有结束条件的配方，并进行验证。Farmers: 向运行该 profile 的程序发送一条 SMS offer（目前尚无程序运行；parser 和 vectors 已存在）。

**流程。** 食谱 → 验证 → 目录 → 在设备上进行 dry run → execution logs 显示其在真实机器上的表现 → 带有证据的修订。

**它如何推进他们的工作。** 可流动的归属；一种可以由其他国家的机器烹饪的食谱；对于农民而言，一种将过剩转化为餐食而非浪费的方式。

**它如何推动社会进步。** 烹饪遗产作为实践知识而非视频得以保存；
减少农场端的浪费。

---

## 5. 人道主义：NGOs、food banks、社区厨房、学校膳食计划、救援机构、捐赠者

**Message.** Humanitarian Profile 通过手机和电子表格将 surplus food 转移到餐盘中，记录冷链检查，统计餐食数量，并且**不携带任何个人数据**。它在没有机器人、应用程序或互联网的情况下运行。它为你提供可以辩护的数据：救援的公斤数、提供的餐食数、营养合格率、每餐成本、申领时间、安全事件，每项都有其对应的方法。

**选项。**
- *Light:* 阅读 profile 和 pilot protocol；尝试 SMS walkthrough。
- *Medium:* 在一个站点运行 CSV templates 四周（level H0）并计算一个
  impact summary。
- *Deep:* 一个包含 baseline 和独立评估员的为期 12 周的 pre-registered pilot；
  与您的 food-safety lead 一起将 rule packs 适配至国家法律；运行您自己的 registry
  node。

**首次成功。** 为一天填写三个 CSV 模板，运行
`cookwala humanitarian --summary your-folder`，阅读 `ImpactSummary`，每个数字下方都有一个方法。

**流程。** 提供 → 认领 → 带有温度检查的移交 → 分发 → 影响摘要 → 发布结果，无论其显示为何。

**如何推进他们的工作。** 各站点间具有可比性的数据；为资助者提供的证据；在问题发生前而非发生后的安全发现；捐赠者系统可以读取的格式 (HXL, GS1, DHIS2 mappings)。

**它如何推动社会进步。** 让更多食物安全地送达人们手中，同时维护他们的尊严：
无姓名，无面孔，无画像。

---

## 6. 健康：营养师、食品安全官员、公共卫生机构、护理院

**消息。** 营养与食品安全规则作为机器可检查的 rule pack，源自公共指南，应用于菜单与交接，您的审查将按专业和结果进行记录。任何内容均非医疗建议；除 rule pack 所述内容外，不作任何声明。

**选项。** 使用模板审查一个 rule pack（两小时） · 使 rule pack 适配国家规则 ·
为您服务的对象提议护理规则 · later，阅读来自程序的聚合结果。

**首次成功。** 打开 `profiles/humanitarian/care-vulnerable-groups.rulepack.json` 和
评审模板；将三条规则标记为已批准、已更改或已拒绝；提交评审。

**流程。** 草案包 → 审查 → 状态已审查 → 程序采用 → 每次分发中的发现 → 结果连同方法一并发布。

**它如何推进他们的工作。** 您的指导贯穿于每一个采用它的厨房中，
包括机器人厨房，您的专业知识将被记录在案；一份可发表的评论；一份用于研究的发现数据集（聚合数据，无个人数据）。

**它如何推动社会进步。** 大规模配餐中更少的钠、糖和饱和脂肪；更安全的温热保持和冷却；将对儿童和老年人的关怀写入机器之中。

---

## 7. 教育：学校教师、教育工作者、教授、研究人员、学生

**Message.** 烹饪是世界上最熟悉的过程，而 Cookwala 将其转化为一个
教学对象：温度、单位、公平分配、安全、遵循规则的机器。对于
研究人员而言，它是一个基准、一种数据集格式以及一个开放问题列表。

**选项。**
- *教师：* 课程包 (`docs/education/LESSON-KIT.md`)：从“什么是 simmer”到“机器绝不应该做什么”的五节课程。
- *教授与学生：* 研究课题列表、模拟器、作为测试条件的 conformance 向量、LeRobot 导出内容、论文规模的开放性问题。
- *研究人员：* 发布经同意的 execution log 数据集；批判模拟器的 assumptions；提出向量。

**首次成功。** 教师：在课堂上运行浏览器的 dry run 并询问设备为何 refusal before heat。学生：更改城市模拟器中的一个 assumed 假设并解释结果。

**流程。** Lesson → project → dataset → paper → RFC。

**如何推进他们的工作。** 免费、开放、可引用的材料；无人拥有的基准；
通过 RFCs 实现标准的共同署名。

**它如何推动社会进步。** 一代人知道什么是安全的厨房，并且能够阅读安全表。

---

## 8. 政府：政府、部委、城市官员、监管机构、政治家和立法者、管理和标准机构

**消息。** 家用和商用烹饪机器正依据分别为电器和软件编写的法规进入市场。Cookwala 为监管机构提供了具体的依据：在设备上强制执行的安全限制、refusal before heat、已签署的记录、匿名事件报告，以及任何人都可以运行的 conformance 套件。对于食物捐赠安全，它提供了一种不含个人数据的数据标准。它是免版税的，并正朝着中立治理的方向发展。

**选项。** 阅读政策简报 (`docs/policy/BRIEF.md`) · 使用模型语言进行食物捐赠数据和烹饪机器安全建模 · 要求您的标准机构审查 Core 0.2 · 运行一个国家 registry 节点 · 为您的学校膳食计划资助一项试点项目。

**首次成功。** 阅读这两页的简报并在仓库中检查三件事：safety limits pack，conformance runner，以及 humanitarian data-protection rules。

**流程。** 简要说明 → 国家标准机构审查 → 在指南中引用 → 试点 →
certification 方案。

**如何推进他们的工作。** 一个现成的、可审查的技术基础；来自 pilot 的证据；通过中立标准连接行业的渠道；与您已经在使用的 humanitarian data standards 的互操作性。

**它如何推动社会进步。** 家庭中更安全的机器；保护其服务人群的食物救援；城市中更少的浪费。

---

## 9. 资本：投资者、企业家、慈善机构、开发银行

**Message.** 烹饪即将成为基础设施。标准是免费的；围绕它的服务是一项业务：certification、hub 软件、经同意的数据集、registry 操作、试点。人道主义层级是一项公共产品，发展资助者可以通过预注册评估来支持它。本网站任何地方均未做出任何财务承诺。

**选项。** 阅读机会、商业模式、路线图、风险和治理
(`/investors`) · 资助试点或审查 · 支持一家在免费标准之外销售服务的公司 · 作为出资方观察员加入治理。

**首次成功。** 阅读白皮书的问题、架构和风险章节，以及行动计划的关注事项登记册；每个未解决的风险都已列出。

**流程。** 证据（pilots, conformance, adopters） → 行动计划中的关卡 → 与关卡挂钩的资金 → 标准的中立基础，提供服务的公司。

**它如何推进他们的工作。** 在一个定义类别的标准中占据早期地位，并拥有真实的数据；一家与公共利益相分离的、具备投资价值的服务型公司。

**它如何推动社会进步。** 资本流向被 measured 的事物，而非被 claimed 的事物。

---

## 10. 思考：哲学家、伦理学家、历史学家和未来学家

**Message.** 当机器烹饪祖母的食谱时，谁拥有这项知识？在自动化护理中，尊严意味着什么？一个家庭的机器人可以知道什么，还有谁也可以知道它？Cookwala 已通过代码对这些问题做出了选择；文章 (`docs/essays/`) 说明了这些选择是什么，并邀请人们提出异议。

**选项。** 阅读文章 · 撰写回复 · 提议规则（RFC 是带有模式的哲学论证） · 参与 household context 配置文件的伦理审查。

**首次成功。** 阅读关于 household context 的文章以及 facet registry 的旅行规则；
找出一个你想要更改其默认值的 facet，并说明原因。

**流程。** 文章 → 公众评论 → RFC → 更改默认值。

**它如何推进他们的工作。** 一个伦理立场转化为运行规则的实时案例，并附有论证的公开记录。

**它如何推动社会进步。** 在机器进入数百万家庭之前，在公开场合做出关于私密数据和文化传承的决策。

---

## 11. 每个人：关心食物、浪费、工作、气候和未来的人们

**Message.** Cookwala 是一种编写食谱的方式，使得任何人或任何事物都能安全地烹饪它，也是一种让原本会被丢弃的食物能够到达需要它的人手中的方式。它是免费的，不属于任何公司，并且它会说明它所不知道的内容。

**选项。** 尝试 dry run · 运行模拟器 · 阅读食谱 · 写一个你喜欢的食谱 · 遵循路线图 · 告诉 food bank 或学校这件事。

**首次成功。** 在 dry run 中更改设备并观察一个步骤被 refusal before heat；阅读原因。

**流程。** 好奇心 → 一个食谱 → 与一个可能使用它的厨房进行一次对话。

**如何改善他们的生活。** 家中更安全的机器，保留他们自己的食谱，一种无需给钱即可提供帮助的方式。

**它如何推动社会进步。** 更少的浪费，更安全的食物，为无法为自己烹饪的人提供服务的机器，以及归还给人类的时间。

---

## 12. 就工作与尊严而言，直言不讳

烹饪机器将改变工作。Cookwala 的立场：人类始终可以烹饪；首批用途面向无法为自己烹饪的人群以及人手短缺的社区厨房；厨师的名字将保留在任何烹饪该食谱的地方；劳动者的声音在指导委员会中占有一席之地；新角色（食谱工程师、食品机器人技术员、certifiers、rule-pack 审查员）已被命名，但并未承诺具体人数。

## 13. 每个小组在站点上的位置

| 组 | 页面 |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |

