<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# 快速入门

五分钟，无需硬件。你将获取一个食谱，对其进行哈希处理，询问设备是否可以烹饪它，根据操作的安全范围检查温度轨迹，并将烹饪日志作为轨迹导出。以下所有内容在今天均可运行。

## 1. 获取工具

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`、`dryrun` 以及导出器仅使用 Python 标准库。其他软件包用于完整的 validation 和 signatures。`pip install cookwala` 软件包是 roadmap 中的 next。

## 2. 获取食谱并对其进行哈希处理

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

执行器精确烹饪此修订版本，如果收到的哈希值不匹配，则拒绝执行。

## 3. 该设备可以烹饪它吗？

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

答案是 `refused`，原因为 `needs_human_present`：切割操作可能无法在无人看管的情况下运行。
添加人员：

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

现在是 `accepted`。该计划说明了机械臂执行哪些步骤，人员执行哪些步骤，以及每个步骤将如何被检查（sensor，logged estimate，time 或 person）。请在浏览器的 [home page](/#demo) 上尝试同样的操作。

## 4. 将温度轨迹与安全区间进行比对

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. 验证一切并运行 conformance 测试

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. 将烹饪日志转换为 trace 或数据集

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` 可加载到任何 OpenTelemetry 后端。`my-dataset/meta/` 为 LeRobot 风格的数据集为每个食谱步骤保留一个任务。两者都拒绝了未选择加入其 household context 的日志。

## 下一步

| 您的身份 | Next |
|---|---|
| 构建机器人或设备 | [Robots, ROS 2 and datasets](ROBOTICS.md)，然后是 [Core API](CORE.md#7-execution-lifecycle-and-api) |
| 构建 AI agent | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) 和 [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| 运营厨房或 food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| 编写食谱 | [Recipe format](RECIPE-FORMAT.md) 和 [Contributing](../CONTRIBUTING.md) |

