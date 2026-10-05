<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance 与 certification 之路

**Status:** draft, 2026-10-04 (RFC-0008). 尚未聘请任何认证机构；这是该标准提供的路径。

## 1. 三个步骤

| 步骤 | 谁 | 含义 | 显示为 |
|---|---|---|---|
| **Self-declared** | 制作方或发布方 | 使用公共工具运行了公共 vectors，并发布了使用其自身密钥签名的 `ConformanceReport` (`schemas/conformance.schema.json`) | 包含 suites 和 counts 的报告；绝非徽章 |
| **Verified** | registry 运营方 | 针对相同的 vector set hash 进行了重现运行，并对报告进行了会签 | 报告加上 verifier |
| **Certified** | 独立的 certifier（目前尚不存在） | 在已发布的方案下运行了 suite 以及硬件和 safety-case 检查，并授予了 mark | 报告、certifier 以及 mark |

任何未能通过某一类别的任何向量的报告，都不得声称属于该类别。registry 显示的是报告，而非徽章。

今天唯一的 registry 运营方是规范维护者 (cookwala.ai)，因此在第二个 registry 存在之前，“verified” 并未增加任何独立性；其状态仍显示为 self-verification。

## 2. 报告包含的内容

核心版本，声明的类 (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) 或配置文件声明 (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`)，主体 (product, vendor, version)，运行的 suites 以及总数和失败的
vector ids，vector set 的 hash，工具和 commit，日期，status 以及
verifier。示例：`examples/conformance/report-reference.json`，由以下内容生成

```bash
python tools/run_conformance.py --report report.json
```

## 3. 类别及其证明的内容

| Class | Vectors | Also needed for certification (not covered by vectors) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | 由食品安全专业人员对食谱进行内容审查 |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | 设备自身的 safety case (根据适用情况，包括 ISO 13482, IEC 60335, UL 3300)；measured 的本地停止延迟；在无网络情况下强制执行的 safety limits |
| Catalog | hash, signature, key revocation, recalls | 密钥托管和事件受理流程 |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | 根据 model 并通过 method 发布的结果 |
| Verifier | all Core suites | 无 |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | 数据责任审查；无个人数据审计 |
| Household | disclosure policy | 数据保护影响评估 |
| Registry | name and version rules, tombstones | 命名空间证明流程 |

## 4. certification 无法承诺的内容

一份 conformance 报告证明了软件在运行当天其行为符合向量的要求。
它并不证明设备在每个厨房中都是安全的，也不证明食谱味道正确，或者证明不会发生任何伤害。一个承诺零伤害的标准是不诚实的；本标准承诺限制会在本地强制执行，refusal before heat 会发生，并且记录可以被检查。

## 5. 标志的治理

认证标志及其规则随商标一起移至中立基础 (`GOVERNANCE.md`)。在此之前不存在任何标志；仅有报告。

