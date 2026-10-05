<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->

# Cookwala 策略：消息、产品、网站、文档、开发者体验

**Status:** 修订于 2026-10-04 (v2)。涵盖了使命、愿景、故事、标准、网站、
文档、API 和 SDK、演示、社区和指标。它建立在行动计划
(`ACTION-PLAN.md`)、背景故事和差距列表 (`research/BACKSTORY.md`)、架构审查
(`research/ARCHITECTURE-REVIEW.md`)、23 个站点的基准测试 (`research/WEB-BENCHMARK.md`)、
利益相关者设计 (`STAKEHOLDERS.md`) 和消息规则 (`MESSAGING.md`) 之上。第 1 节的表格是初步研究；若两者存在差异，以基准测试为准。

---

## 0. 摘要

**Cookwala 的工作。** 它是一种开放的方式，用以告知任何厨房（一个人、一个 food bank、一个烤箱或一个类人机器人）**要做什么、每一步何时完成，以及什么绝对不能发生**，并在设备上检查所有这三点。

**发生了哪些变化：**

1. **Message.** 弃用“全球首个且最大的机器人烹饪食谱索引和 CLI”，
   转而以每个机器人制造商和厨房都面临的问题作为开场。新的单句标语：
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Story.** 机器人即将进入家庭进行烹饪，但还没有人以机器可以检查的形式，
   写下“完成”和“安全”在不同菜系中分别意味着什么。Cookwala 从一个家庭的埃及食谱开始。
   其使命是安全地教会机器每一种菜系，并确保美食能够送达人们手中。
3. **Proof before promise.** 实时、真实的计数。now / next / later 标签。已发布的评论。
4. **每个人都能理解的一个循环：** *Describe → Check → Cook → Learn.*
5. **按受众划分的路径：** 设备制造商、AI-agent 构建者、厨房和 food bank、厨师、
   研究人员。
6. **首屏展示代码和实时演示。** 浏览器内的 dry run（“此设备能烹饪此食谱吗？”）、
   模拟器，以及即刻可用的复制粘贴命令。
7. **达到顶级 AI 和机器人文档水平的开发者体验：** 5 分钟快速入门、以教程、
   操作指南、参考与解释形式组织的文档、`llms.txt`、复制页面、Python 包和 CLI、
   带类型的 JS/TS SDK、一个 MCP server、一个可以本地运行的 reference hub、
   一个 ROS 2 package，以及一个 LeRobot bridge。
8. **一个贡献者网络**（受 Figure's Index 启发）：厨师和厨房贡献经同意的真实食谱录音，
   从而让机器人学习每一种菜系，并向教导它们的人致谢。

---

## 1. 我们学到了什么

| 站点 | 解决的问题 | 方法 | 如何沟通 | 受众 | 我们借鉴的内容 |
|---|---|---|---|---|---|
| **Figure – Index** | 人形机器人需要海量的现实世界任务数据 | 记录日常任务的有偿贡献者网络；现在提供服务，稍后提供机器人 | 电影感、单色、巨大的字体；实时计数器 (29 M 视频上传, $15 M 有偿)；*"Today, services on demand. Soon, robots on demand."* | 贡献者、家庭、企业 | 带有信用机制的贡献者网络；**实时证明计数器**；一条“today / soon”的诚实准则；一张引人注目的图像 |
| **Figure (home)** | 家庭助手 | 通用型人形机器人 | *"The future of home help is here."* 一句话，一段视频 | 家庭、投资者 | 那句一句话的承诺；产品先于功能 |
| **MCP Registry** | 寻找值得信赖的 MCP 服务器 | 社区 registry；经过验证的 reverse-DNS 命名空间；精确版本；完整性哈希；验证端点；生命周期状态 | 清晰的 OpenAPI 参考；schema-first | 服务器发布者、客户端开发者 | **经过验证的命名空间、固定的版本、哈希、tombstones** → `REGISTRY.md` |
| **LangChain docs** | 构建 agent 过于碎片化 | 开放、模型无关的框架加上一个平台 | *"The open agent engineering ecosystem"*; 生命周期 Build → Test → Deploy → Monitor；信任中心和状态 | Agent 工程师、企业 | **读者能够识别的生命周期**；信任中心；学院和论坛 |
| **LangSmith Observability** | 查看 agent 在生产环境中的行为 | Traces → 监控 → 反馈 → 用于 evals 的数据集 | 带有链接的步骤；概念页面；集成 | Agent 团队 | **作为 traces 的 execution logs**；traces 变为数据集 → `execlog_export.py otel` |
| **OpenAI API docs** | 第一次 API 调用 | 代码优先的 Quickstart；构建路径；model cards | 深色调、代码导向、“Ask AI”、状态和 cookbook | 开发者 | **首屏即代码；“build paths”** |
| **Claude Platform docs** | 从第一次调用到生产环境 | 两个界面 (Messages, Managed Agents)；编号的开发者旅程；model family cards | ⌘K 搜索；语言标签 (Python … cURL, CLI)；旅程 1–4 | 开发者、平台团队 | **编号的开发者旅程；语言标签；“choose how you build”** |
| **AsyncAPI** | 描述事件驱动型 API | 开放规范加上工具 (generators, docs)；在 Linux Foundation 下的开放治理 | "Part of the Linux Foundation"; spec → docs → code demo; 社区会议；赞助层级 | 架构师、工具构建者 | **开放治理徽章、TSC、社区日历、赞助商** |
| **SiliconFlow** | 快速、廉价的模型推理 | 为多种模型提供的一站式 API | 关于性能、可扩展性、成本和安全性的功能列表 | 开发者、企业 | 一份简洁的**characteristics**列表 (我们的：safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | 试错式的 prompt engineering | 声明式测试用例、red teaming、CI | *"Test-driven LLM development, not trial-and-error"*; why-choose 列表；工作流步骤 | LLM 应用开发者、安全人员 | **声明式安全测试** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; not Figure's Helix AI) | DeFi 太复杂 | 在每次交易前都需要确认的自然语言 agent | 白皮书：abstract → problem → solution → architecture → security model | 加密货币用户 | **白皮书结构；明确的安全模型；“always confirm”** (我们借鉴其结构，而非其 token 模型) |
| **Hugging Face LeRobot** | 机器人学难以入门 | 硬件无关的库；teleoperate → record → train → deploy；标准数据集格式；社区数据集 | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet; 常见问题 | 创客、研究人员 | **“Pick your path”；数据集兼容性；common-problems 部分** |
| **ROS 2 / Open Robotics** | 机器人软件互操作性 | 由非营利组织运行的开放中间件 (ROS, Gazebo, Open-RMF) | *"Powering the world's robots"* | 机器人开发者 | **ROS 2 actions；非营利组织管理** |
| **NVIDIA Isaac** | 开发和训练机器人 | 仿真、库、基础模型 (GR00T) | 平台地图：libraries, simulation, models, blueprints | 机器人团队 | **将仿真作为测试 envelopes 的测试台** |
| **1X, Unitree, Pollen** | 家庭人形机器人、负担得起的机器人、面向创客的开放机器人 | 带有押金、预订和社区的产品 | 一个产品，一个价格，一个按钮 | 家庭、创客 | 家庭机器人正在 now 发货；我们的窗口期是 now |

**顶尖水平所共有的模式：**
1. 一句话说明其受众及功能。
2. 读者能够识别的循环。
3. 在一次滚动范围内提供可运行的代码或演示。
4. 可供选择的入口点。
5. 证明（数字、用户、治理）。
6. 诚实的状态（信任中心、状态页面、now/next）。
7. 今天即可加入的社区。
8. 兼顾人类与 AI 阅读者的文档（复制页面、`llms.txt`、“Ask AI”）。

---

## 2. Cookwala 今日现状

**优势：**
- 一个罕见且具体的想法：物理 operation envelopes，sensor ladders，以 refusal 代替猜测，在设备上强制执行安全，可验证的文档。
- 包含两个独立标准结果（RFC 8785, RFC 8032）的 conformance 向量。
- 四个可运行的模拟器。
- 一个无需机器人即可运行的人道主义概况。
- 一个真实的食谱语料库 (fifi.cooking) 和一个具有身份认同的地区（埃及，阿拉伯世界）。
- 一份异常诚实的批判与响应记录。

**Gaps:**

| 差距 | 影响 |
|---|---|
| 标题声称“首个且最大”但仅有 1 个已发布的 recipe | 读起来像是炒作；容易招致否定 |
| 以“终结世界饥饿”作为导语 | 会让了解饥饿驱动因素的资助者和专家望而却步 |
| 仅限机器人的框架 | 排除了今天就能采用的用户（厨房、food bank、agent builders） |
| 没有 quickstart，没有 SDK，没有可运行的 server | 没人能在 5 分钟内取得成功 |
| 文档是 25 个没有导航的 markdown 文件 | 难以查找，难以信任 |
| 没有实时证明或 status | 没有动力感或就绪感 |
| 没有加入方式 | 兴趣无法转化为贡献 |

---

## 3. 定位与消息

### 3.1 类别与一句话简介
- **类别：** 一种用于可执行、可验证烹饪的开放标准（附带免费工具和索引）。
- **一句话简介：** *Cookwala 是安全烹饪的开放标准：涵盖人员、厨房与机器人。*
- **三要素**，随处使用：
  - **做什么。** 将食谱作为机器可以规划的步骤。
  - **何时完成。** 可测量的结束条件：温度、食物状态线索、时间。
  - **绝不能发生什么。** 设备自身强制执行的安全限制。

### 3.2 使命与愿景（修订版）
- **使命：** *无论由谁掌勺，帮助每个人都能吃得好、吃得安全、吃得负担得起且不浪费。*
- **愿景：** *地球上的任何厨房都能安全地烹饪任何食谱，让美食进入人们的餐桌而非垃圾桶。*
- **变更原因：** “终结世界饥饿”作为长期目标保持不变，并辅以证据说明。Cookwala 通过减少浪费、食物救援和更廉价的烹饪方式，配合饥饿问题所需的计划、资金和政策，为此做出贡献。

### 3.3 故事

> 家用机器人正在到来：Figure 03、1X NEO 以及厨房机器人正在出货或接受订单。它们正在学习移动，但还没有人以机器可以检查的方式写下“simmer”是什么意思、什么时候鸡肉是安全的，或者祖母做的 molokhia 是如何制作的。每个制造商都编写自己的封闭食谱，且大多仅限于少数几种菜系。
>
> Cookwala 从 fifi.cooking 上一个家庭的埃及家常食谱开始，并提出了一个简单的问题：你如何将食谱交给机器，并知道它会安全地烹饪？
>
> 答案是一个开放标准。它规定了要做什么、每一步何时完成，以及什么情况绝不能发生。设备在加热任何东西之前都会对其进行检查，并且是拒绝执行而非进行猜测。同样的食谱今天适用于人类和 food bank，明天它们将让机器人学习地球上的每一种菜系，并向教导它们的厨师致敬。

*(创始人应确认并个性化原始句子。真实胜过润色。)*

### 3.4 信息架构

| 支柱 | 承诺 | 我们今天可以展示的证明 |
|---|---|---|
| **设计安全** | 设备拒绝而非猜测，并在本地强制执行限制 | 32 种操作的 operation envelopes；safety-limits pack；dry run；conformance |
| **可验证** | 任何人都可以检查食谱、设备和记录 | 签名、密钥撤销、event-log checkpoints；包括 RFC 结果在内的 106 个向量 |
| **开放且中立** | 免版税、与模型无关、与设备无关 | 许可；治理路径；无需 API keys |
| **每种菜系** | 基于真实的家庭烹饪构建，多语言 | fifi.cooking corpus；阿拉伯语和英语；world-cuisines plan |
| **在机器人出现前即有用** | 厨房和 food bank 现在即可受益 | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **经同意后学习** | 真实的烹饪转化为更好的机器人，并给予认可 | ExecutionLog consent；LeRobot export；OTel traces |

### 3.5 语言规则
- **使用：** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent。
- **避免：** "revolutionary", "first and largest"（在事实属实前）, "end hunger"（作为标题）,
  "AI-powered"（模糊）。
- **为每个数字标注**为 *measured*, *modelled* 或 *assumed*。
- **使用 "now / next / later"** 而不是暗示某物在不存在时存在。

---

## 4. 受众及其首次成功

| 受众 | 待完成的任务 | 初次成功 (≤ 15 min) | 然后 |
|---|---|---|---|
| **机器人和家电制造商** | 在不编写每条食谱的情况下，安全地交付烹饪功能 | 使用 5 个食谱对他们的设备配置文件进行 dry run；查看每一步的接受/拒绝情况 | 实现 Core API (reference hub)，通过 conformance，将设备发布到 registry |
| **AI-agent 构建者** | 让 agent 在无害的情况下规划餐食并订购食物 | 添加 Cookwala MCP server；在他们的模型上运行 agent-safety benchmark | 在行动前使用 AgentMandate 和 dry run |
| **厨房和 food bank** | 安全地回收 surplus，规划营养菜单 | 发送 SMS offer，或填写 CSV；查看 rule pack 检查 | 使用 Humanitarian Profile 进行试点 |
| **厨师和食谱创作者** | 让他们的食谱保持活跃并获得署名 | 使用编辑器转换一个食谱；查看其通过验证 | 贡献录音 (已征得同意)；出现在 credits 中 |
| **研究人员和评审员** | 数据、benchmarks、诚实的 assumptions | 运行模拟器；阅读 critique 和 conformance suite | 使用数据集；发布 reviews |
| **资助者和政策制定者** | 查看影响、风险和治理 | 阅读 2 页的 whitepaper summary 和 concept note | 资助试点；加入治理 |

---

## 5. 产品架构：Cookwala 提供什么

| Layer | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profiles (draft / experimental) | Core 0.3 after first device feedback | Core 1.0 under a foundation |
| **Index and registry** | 示例食谱；registry spec | fifi.cooking corpus converted (1,881 recipes, Arabic + English); verified namespaces | 社区集合，世界美食 |
| **Tools** | Validator, reference library, dry run, conformance, exporters | `pip install cookwala` (CLI + library); JS/TS SDK | 食谱编辑器 (web) |
| **Reference hub** | Core API spec | Docker hub with a simulated device, so the quickstart `curl` works locally | Hardware-in-the-loop kit |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 package; MCP server; Open-RMF task | Isaac Lab "cook in simulation" benchmark |
| **Safety** | Limits pack, recalls, incidents, agent benchmark | Reviewed limits; public agent-safety results | Certification scheme with a certifier |
| **Humanitarian** | Profile, rule pack, templates, concept note | Egypt food-bank pilot | Food-bank network adoption |
| **Data** | ExecutionLog with consent | Contributor network, first consented dataset | Multi-cuisine benchmark on the Hugging Face Hub |

---

## 6. 网站

### 6.1 站点地图

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 主页，从上到下

| # | 章节 | 目的 | 内容 |
|---|---|---|---|
| 1 | **Hero** | 用一句话说明它是什么 | 一行简介、三要素、两个按钮（*Try the dry run*, *Read the quickstart*）；诚实的状态标签 "Draft standard · v0.2" |
| 2 | **Live demo** | 演示，而非空谈 | “这个设备能做这个食谱吗？” 选择一个食谱和一个设备；每一步显示 done / person / refuse，以及决定该步骤的 rule |
| 3 | **The problem** | 让差距变得可感 | 机器人正在到来；“simmer” 意味着不同的含义；来自少数菜系的封闭食谱；人们在挨饿时食物被浪费 |
| 4 | **The loop** | 一个心理模型 | Describe → Check → Cook → Learn，每一步都包含 artifact 和 command |
| 5 | **Pick your path** | 为每位访客规划路径 | 五张卡片（第 4 节），每张卡片都有一个 first success |
| 6 | **Proof** | 势头与诚实 | 来自 `/v1/stats.json` 的实时计数器（operations defined, conformance vectors, schemas, recipes published, languages）；每个数字都有标签 |
| 7 | **Safety** | 信任 | 安全是局部的；refusal；agent rules；recalls；链接至 /trust |
| 8 | **Works today** | 机器人出现前的实用性 | Humanitarian Profile, SMS 示例, simulators |
| 9 | **Now / next / later** | 诚实的路线图 | 来自第 5 节 |
| 10 | **Open** | 中立且可加入 | Licences, governance path, contribute, GitHub |

### 6.3 设计方向
- **感觉：** 冷静、精准、温暖。一个拥有厨房灵魂的专业仪器。
- **字体：** 用于 UI 的精准 grotesque 字体，用于数据和代码的 mono face 字体。用于 hero 部分的大型、轻盈的显示字体（借鉴 Figure 的自信），但不模仿其电影般的暗调。
- **色彩：** 中性的纸张与墨水色，配以一种热量强调色（余烬橙），该颜色也用于标记温度数据。色板已针对色盲读者进行验证，并设计了亮色和暗色主题。
- **图像：** 一旦我们有了素材，将使用真实的手和真实的家庭厨房，绝不使用素材库中的机器人。在此之前，由图表和实时演示来承载页面。
- **动态：** 仅在 step-by-step dry run 时有动态。其他一切保持静止。
- **从一开始就支持双语：** 英语和阿拉伯语（从右至左布局），然后是其他语言。
- **无障碍性：** WCAG 2.2 AA；键盘操作；减少动态；不单纯依靠颜色传递信息。

### 6.4 交互性
1. 浏览器内 dry run（食谱 × 设备）。
2. Envelope explorer：拖动温度曲线并查看其何时离开 "simmer"。
3. 模拟器，支持开启或关闭协议。
4. 食谱步骤查看器：将步骤的句子、其 JSON 和其 envelope 并排显示。
5. Later：一个在你输入时进行验证的食谱编辑器。

---

## 7. Documentation

根据 Diátaxis 框架进行组织，因此每个页面都有一个特定的任务：

| 类型 | 用途 | 页码 |
|---|---|---|
| **Tutorials** | 通过实践学习 | Quickstart; Your first Cookwala recipe; Make a device Cookwala-ready; Add Cookwala to an agent; Run a food-rescue pilot with SMS |
| **How-to guides** | 解决单一任务 | Dry-run a device; Sign and verify; Publish to the registry; Export logs to LeRobot or OpenTelemetry; Run the agent-safety benchmark; Report an incident; Issue a recall |
| **Reference** | 查询信息 | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Explanation** | 理解原因 | Why envelopes; safety is local; trust model; privacy; humanitarian design; critiques and responses; simulators and their limits |

**文档人体工程学：**
- 左侧导航、搜索、“Copy page”、“Edit on GitHub”、上一页/下一页链接；
- 语言选项卡 (Python / JavaScript / cURL / CLI)；
- 供 AI 阅读器使用的 `llms.txt` 和每页 markdown；
- 速查表和常见问题页面；
- 带有日期的变更日志。

---

## 8. API 和 SDK

| 交付物 | 内容 | 原因 |
|---|---|---|
| `cookwala` Python package | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (来自 `tools/`) | 一个命令实现首次成功 |
| `@cookwala/sdk` (TypeScript) | 从 schemas 生成的类型；Core API client；在浏览器中进行 dry run | Web 和 agent 开发人员 |
| Reference hub (Docker) | 带有模拟设备和安全限制的 Core API | quickstart 的 `curl` 可在本地工作；创作者的测试床 |
| MCP server | 工具：`search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | 每个具备 MCP 能力的 agent 都可以安全地使用 Cookwala |
| ROS 2 package | `cookwala_msgs` (actions)，一个通往 Core API 的 bridge node | 机器人创作者 |
| Exporters | LeRobot, OpenTelemetry (已完成) | 学习与可观测性 |
| Evals | promptfoo agent-safety benchmark (已完成) | Agent 构建者、安全审查员 |
| Versioning | Core 使用 Semver；带日期的 schema bundle；changelog；弃用窗口 | 稳定性承诺 |
| Status | cookwala.ai 端点的公开状态页面 | 信任 |

---

## 9. 演示

| 演示 | 受众 | 状态 |
|---|---|---|
| 浏览器内 dry run | 每个人 | Building now |
| 模拟器 (home, city, country, world) | 每个人, 资助者 | Live |
| 跨模型的 Agent-safety 结果 | Agent 构建者, AI 实验室 | Next (运行基准测试, 发布带有方法的结果) |
| SMS food-rescue 演示流程 | food banks | Next (录制演示) |
| 使用真实设备烹饪 Cookwala 食谱，未经编辑 | 每个人 | Later (最重要的演示; 需要设备合作伙伴) |
| "Cook in simulation" (Isaac Lab / Gazebo) | 机器人研究人员 | Later |

---

## 10. 社区与增长

- **Contributor network**（受 Figure's Index 启发）：
  - *Cooks* 记录他们熟悉的食谱的已授权会话，并在每份食谱和数据集卡片上注明贡献。
  - *Kitchens and food banks* 试点。
  - *Makers* 实现设备。
  - *Reviewers* 审查 rule packs 和 envelopes。
  - *Translators* 翻译步骤和词汇。
  - 有偿贡献在 later 阶段出现，由资助提供资金。在没有知情同意和公平条款的情况下，绝不为数据付费。
- **Rituals：** 每月社区会议；每季度使用真实数据的“state of Cookwala”；公开评审线程。
- **Partnership sequence：** 来自利益相关者追踪器的前十名（food bank, WFP Innovation Accelerator, Home Assistant, 一家设备初创公司, 一所大学实验室, 一家 certifier, World Central Kitchen, 一个基金会, 一个中立家庭, 一位 creator）。
- **Channels：** GitHub Discussions, 一份时事通讯, 会议演讲 (ROSCon, IROS/ICRA workshops, food-tech events), 阿拉伯语频道。

---

## 11. 指标

- **北极星指标：** *verified cooks*，指使用经同意且符合 conformance 的 log，端到端运行了已签名的 Cookwala 食谱的 execution 次数。当该数值为零时，请追踪领先指标。

| 漏斗 | 指标 | 2027-03 目标 |
|---|---|---|
| Attract | /start 的每月访问量 | 2,000 |
| Activate | 完成的 dry runs (web + CLI) | 500 |
| Build | 通过 conformance 的独立 Core 实现 | 2 |
| Adopt | Food-bank 试点挽救的 kg (measured) | 首个 6 个月试点运行中 |
| Contribute | 拥有已合并变更的外部贡献者 | 15 |
| Trust | 已发布的外部评审 | 6 |
| Learn | 已授权的 execution logs | 1,000 |

---

## 12. 路线图

包含每项状态的维护路线图见 [`ROADMAP.md`](ROADMAP.md)。下表是
原始的 180-day 计划，仅供记录。

| 时间 | 网站与故事 | 开发者体验 | 标准与安全 | 社区 |
|---|---|---|---|---|
| **Now (本次发布)** | 新主页，包含实时 dry run、triad、paths、proof、now/next/later；文档查看器；`llms.txt`；信任页面 (security, governance) | Dry run；LeRobot 和 OTel 导出器；ROS 2 actions；agent-safety 基准测试 | Registry 规范 (namespaces, versions, hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Next 30 days** | /start quickstart；阿拉伯语主页；所有页面通过 claims | `pip install cookwala`；reference hub (Docker) | 发布首批基准测试结果 | 向 food bank 发送概念说明；Home Assistant 提案 |
| **60 days** | 包含 fifi corpus (首批 100 个已转换) 的 /recipes 索引；/humanitarian | TS SDK；MCP server | 由食品科学家进行 operation envelope 审查 | 首次社区会议 |
| **90 days** | 白皮书 + 2 页摘要；/roadmap | ROS 2 package | 根据设备反馈推出 Core 0.3 | 设备合作伙伴、大学实验室 |
| **180 days** | 真机演示视频 | 食谱编辑器 | Certifier 差距分析 | 试点结果；基金会申请 |

---

## 13. 该策略面临的风险

| 风险 | 缓解措施 |
|---|---|
| 华而不实的网站掩盖了单薄的现实，看起来像是在炒作 | 每个声明都进行标注；来自真实数据的实时计数器；now/next/later |
| 覆盖了过多的受众 | 未来 90 天的两条主要路径：设备制造商和 food bank。其他受众得到支持但不会被刻意追求 |
| 大型平台发布封闭的替代方案 | 成为他们可以采用的中立、可验证层；与开放参与者（Hugging Face, Open Robotics, Home Assistant）合作 |
| 贡献者数据滥用 | 选择性加入、可撤回的同意；无个人数据；发布的 data cards |
| 创始人带宽 | 在制定更多规范之前，先交付开发者体验（package, hub）；招募一名共同维护者 |

