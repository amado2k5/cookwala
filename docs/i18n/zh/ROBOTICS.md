<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala 与机器人技术栈

Cookwala 不会取代机器人的任何部分。它为机器人技术栈增加了烹饪所缺失的一层：**要做什么，每一步何时完成，以及绝不能发生什么**，其形式可以被任何机器人、家电、模拟器或学习流水线读取并检查。

## 它所适用的位置

| Layer | 该层示例 (2026; 尚不存在与其中任何一项的集成) | Cookwala 增加了什么 |
|---|---|---|
| Robots and appliances | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | 一种其可以进行 dry run、refusal before heat 或烹饪的设备无关型食谱；设备端安全限制 |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | 用于食谱和步骤的 ROS 2 actions (`bindings/ros2`)；一份 Matter op 映射草案 (`bindings/matter.json`, 未经验证)；一个 Open-RMF 任务是一个计划中的贡献 |
| Robot learning | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | 用于数据集的自然语言步骤任务和步骤分段；作为评估目标的完成标准 |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | 作为测试条件的 operation envelopes 和 conformance 向量 |
| AI agents | MCP, A2A, Claude, OpenAI and open models | AgentMandate, untrusted-text rule, kitchen agent-safety benchmark |

Cookwala 刻意处于 **above motion**。现代机器人进行端到端的操控学习；
Cookwala 为它们提供任务、成功测试和 safety envelope，并获取一个
execution log。

## ROS 2

`bindings/ros2/` 定义了两个动作：

| Action | Goal | Feedback | Result |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | 最终状态，refusal reason，`ExecutionLog` |
| `ExecuteNode` | 一个 recipe node，其 operation envelope，一个可选的更窄的目标 | Progress，medium temperature，target reached | Envelope OK，rung used，step summary，deviation |

**取消**一个 `ExecuteRecipe` 目标是一个 `StopRequest`：服务器必须安全停止。
**安全限制**保留在设备内部；任何目标字段都不能更改它们。一个将食谱分配给多个机器人的 hub 会发送 `ExecuteNode` 目标，并将集群级调度作为任务交给 **Open-RMF**。

## LeRobot 与机器人学习数据集

LeRobot 的循环是 teleoperate → record → train → deploy，其 LeRobotDataset v2.1 在 `meta/tasks.jsonl` 中存储自然语言任务（v3 将元数据移至 parquet；目前的 exporter 编写 v2.1 风格的文件，v3 writer 为 next）。Cookwala 食谱已为每一步包含一个句子，且 execution log 记录了每一步何时开始和结束。

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

这会写入：
- `meta/tasks.jsonl`，每个食谱步骤对应一个任务；
- `meta/cookwala/<log>.json`，包含食谱哈希、步骤分段（开始和结束秒数、sensor ladder 阶梯、operation envelope 结果）以及家庭的同意。

视频和动作来自机器人自身的录制器。导出操作会在没有 dataset consent 的情况下拒绝 logs。

## 模拟

`conformance/envelope.json` 中的 conformance 向量（带有预期结果的温度轨迹）和 sensor-ladder 规则已准备好用于模拟器。对平底锅、锅具或烤箱进行热力学或物理模拟，可以根据真实设备必须遵守的相同 operation envelope 进行评分。Isaac Lab、Gazebo 和 MuJoCo 是公开“在模拟中烹饪”基准测试的候选对象。

## 可观测性

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

这会写入一个 OpenTelemetry trace：每一步一个 span，带有 `cookwala.*` 属性（rung, envelope OK, deviation）和安全限制事件。它可以加载到任何 OTLP 后端（Jaeger, Grafana Tempo, LangSmith…），因此团队可以像调试 agent 一样调试设备。

## dry run：此设备能否烹饪此食谱？

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run 在任何东西加热之前给出答案。它说明了设备执行哪些步骤，人员执行哪些步骤，每个步骤将如何被验证（sensor, model, time 或 person），或者它必须 refusal before heat 的首要原因。

