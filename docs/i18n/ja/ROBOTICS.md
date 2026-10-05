<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala とロボティクススタック

Cookwalaはロボットのいかなる部分も置き換えるものではありません。それは、料理のためにロボティクススタックに欠けているレイヤー、すなわち、**何を作るか、各ステップがいつ完了するか、そして何が絶対に起きてはならないか**を、あらゆるロボット、家電、シミュレーター、または学習パイプラインが読み取り、チェックできる形式で追加するものです。

## どこに適合するか

| レイヤー | レイヤーの例 (2026; これらとの統合は存在しません) | Cookwala が追加するもの |
|---|---|---|
| ロボットおよび家電 | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | dry run、拒否、または調理が可能なデバイスに依存しないレシピ; デバイス上の安全制限 |
| ミドルウェア | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | レシピとステップのための ROS 2 actions (`bindings/ros2`); Matter op マッピングのドラフト (`bindings/matter.json`, 未検証); Open-RMF タスクは計画された貢献 |
| ロボット学習 | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | データセットのための自然言語によるステップタスクとステップセグメント; 評価対象としての完了基準 |
| シミュレーション | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | テスト条件としての operation envelope と conformance ベクトル |
| AI エージェント | MCP, A2A, Claude, OpenAI およびオープンモデル | AgentMandate, untrusted-text rule, kitchen agent-safety benchmark |

Cookwalaは意図的に**motionの上**にあります。現代のロボットはend to endで操作を学習しますが、
Cookwalaはそれらにtask、success test、およびsafety envelopeを与え、
execution logを受け取ります。

## ROS 2

`bindings/ros2/` は 2 つのアクションを定義します：

| アクション | 目標 | フィードバック | 結果 |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | 最終状態、refusal reason、`ExecutionLog` |
| `ExecuteNode` | 1つのレシピノード、そのoperation envelope、オプションのより狭いターゲット | 進捗、medium temperature、ターゲット到達 | Envelope OK、使用されたrung、ステップの要約、偏差 |

`ExecuteRecipe` ゴールを**キャンセル**することは `StopRequest` です。サーバーは安全に停止しなければなりません。
**安全制限**はデバイス内に保持されます。どのゴールフィールドもそれらを変更することはできません。レシピを複数のロボットに分割して送信する hub は、`ExecuteNode` ゴールを送信し、フリートレベルのディスパッチをタスクとして **Open-RMF** に渡すことができます。

## LeRobot とロボット学習データセット

LeRobotのループは teleoperate → record → train → deploy であり、その LeRobotDataset v2.1 は自然言語のタスクを `meta/tasks.jsonl` に保存します（v3 ではメタデータを parquet に移動しました。現在は exporter が v2.1 スタイルのファイルを書き出し、次は v3 writer が実装される予定です）。Cookwala のレシピには、すでにステップごとに1文が含まれており、execution log には各ステップがいつ開始され、いつ終了したかが記録されています。

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

これは以下を書き込みます：
- `meta/tasks.jsonl`、レシピのステップごとに1つのタスク；
- レシピのハッシュ、ステップセグメント（開始および終了秒数、sensor-ladder の段、envelope の結果）、および世帯の同意を含む `meta/cookwala/<log>.json`

ビデオとアクションはロボット自身のレコーダーから取得されます。エクスポートは、dataset consentがない場合はログの出力を拒否します。

## シミュレーション

`conformance/envelope.json` 内の conformance ベクトル（期待される結果を伴う温度トレース）と sensor ladder ルールは、シミュレータでの使用が可能です。フライパン、鍋、またはオーブンの熱または物理シミュレーションは、実際のデバイスが維持しなければならないものと同じ envelope に基づいてスコアを付けることができます。Isaac Lab、Gazebo、および MuJoCo は、公開される "cook in simulation" ベンチマークの候補です。

## 観測可能性

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

これはOpenTelemetryトレースを書き込みます：各ステップにつき1つのスパン、`cookwala.*` 属性（rung、envelope OK、deviation）および安全制限イベントを含みます。任意のOTLPバックエンド（Jaeger、Grafana Tempo、LangSmith…）にロードできるため、チームはエージェントをデバッグするのと同じ方法でデバイスをデバッグできます。

## dry run: このデバイスでこのレシピを調理できますか？

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run は、何かが加熱される前に行われます。それは、デバイスが行うステップ、人が行うステップ、各ステップがどのように検証されるか（sensor、model、time または person）、または拒否しなければならない最初の理由を示します。

