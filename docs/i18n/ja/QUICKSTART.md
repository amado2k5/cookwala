<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# クイックスタート

5分間、ハードウェアなし。レシピを取得してハッシュ化し、デバイスがそれを調理できるかを確認し、温度トレースをoperationのsafe bandと照合し、調理ログをtraceとしてエクスポートします。以下のすべては今日動作します。

## 1. ツールを入手する

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`、`dryrun`、およびエクスポート機能は Python 標準ライブラリのみを使用します。その他のパッケージは、完全な conformance および署名用です。`pip install cookwala` パッケージは、ロードマップの next にあります。

## 2. レシピを取得してハッシュ化する

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

エグゼキューターは正確にこのリビジョンを調理し、与えられたハッシュが一致しない場合は拒否します。

## 3. このデバイスで調理できますか？

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

答えは `refused` で、理由は `needs_human_present` です：切断作業は無人で実行することはできません。
人を追加してください：

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

現在は `accepted` です。プランには、アームが行うステップ、人が行うステップ、および各ステップがどのようにチェックされるか（sensor、logged estimate、time、または person）が記載されています。ブラウザ上の [home page](/#demo) で同じことを試してください。

## 4. 温度トレースを安全帯に対してチェックする

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. すべてを検証し、conformance テストを実行する

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. 調理ログをトレースまたはデータセットに変換する

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` は、あらゆる OpenTelemetry バックエンドにロードされます。`my-dataset/meta/` は、LeRobot スタイルのデータセット用に、レシピのステップごとに 1 つのタスクを保持します。両方とも、household が opt in しなかったログを refusal します。

## 次はどこへ

| あなたの状況 | Next |
|---|---|
| ロボットまたは家電を構築している | [Robots, ROS 2 and datasets](ROBOTICS.md)、次に [Core API](CORE.md#7-execution-lifecycle-and-api) |
| AIエージェントを構築している | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) および [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| キッチンまたは food bank を運営している | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| レシピを書いている | [Recipe format](RECIPE-FORMAT.md) および [Contributing](../CONTRIBUTING.md) |

