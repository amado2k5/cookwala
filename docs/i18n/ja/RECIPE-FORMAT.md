<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Cookwala レシピ形式: Missions と連携するレシピ

Cookwalaにおけるレシピは、指示のリストではありません。それは、プランナーが特定のMission（household、robots、appliances、energy、budget、health、timing）に対して*コンパイル*し、実行可能なプランへと変換する**ポータブルな調理知識**です。その後、ロボットはそのプランを実行し、現実が変化した際には、contingenciesやplaybooksを通じて適応していきます。

スキーマ: [`recipe.schema.json`](../schemas/recipe.schema.json)。完全な動作例:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json)。

## 1. 4つのレイヤー（WHO SMART Guidelinesのアプローチから適応）

| レイヤー | 格納内容 | 作成者 | 格納場所 |
|---|---|---|---|
| **R1 Narrative** | 人間によるレシピテキスト、ストーリー、文化的ノート、写真 | 調理者、シェフ、fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | その料理が「何であるか」および「どうあるべきか」：アイデンティティ（不可欠な要素 vs 柔軟な要素）、感覚的ターゲット、栄養、提供および食事スタイル、保存、acceptance checks | レシピエディター、AI支援、レビュー済み | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | デバイスに依存しない手法：フォーミュラ（比率 + ロール）、型付けされたopsのプロセスグラフ（食品状態のpre/post条件を含む）、`until` 条件、代替案、一時停止ルール、失敗モード、アフォーダンス、ハザード、CCPs、環境準備 | エクスポートパイプライン + レビュー; シミュレーター検証済み (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | *この* MissionのためにコンパイルされたR3レシピ：正確な分量、選択されたバリアント、割り当てられたアクターとデバイス、スケジュール、リース、モニター、コンティンジェンシー | プランナー/コンパイラ、実行時 | **Mission** (`plan`) の内部、カタログ内には決して置かれない |

ソースコードとコンパイラのように：**レシピはポータブルな中間表現 (R3 + R2) です。Mission はターゲットマシンです。** これこそが、ロボットや AI が変化してもレシピの妥当性を維持する仕組みです。より優れたプランナーは、同じレシピからより優れた R4 を生成します。

## 2. Missionにおける各セクションの役割

| レシピセクション | Missionによる用途… |
|---|---|
| `identity.essential / flexible / neverAdd` | 代替、予算および配給モード、食事の適応：flexibleな部分を変更し、essentialは決して変更しないことで、料理がそのままであるようにする |
| `formula` (ratios, min/max, role, scaling) | 任意の人数への正確なスケーリング、1週間にわたる食材の配給、予算の節約、手元にあるものを使い切る（limiting-ingredient rescale） |
| `sensory` | 視覚、香り、味のチェックポイント；household taste profiles (salt 2 vs 4)；再利用および修正の決定 |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **環境準備タスク：** シンクやコンロが使用中の場合、plannerは「clear, wash, dry」タスクを追加する；浸水または解凍タスクは数時間前にスケジュールされる |
| `process.nodes[]` with `pre`/`post` food states | 計画（準備ができたものだけを開始する）、検証（そのステップは状態を生成したか？）、中断後の再開 |
| `until`, `onTimeout`, `retry` | ステップが完了したタイミングと、完了しなかった場合に何をすべきかを知る |
| `alternatives[]` + `energy` | ガス vs induction vs oven、バッテリーセーバー、オーブンなしのキッチン、静音時間 |
| `pause` (pausable, safeState, maxPause, onExceeded) | **中断：** 子供の助けが必要、オーナーからの呼び出し、犬が何かを倒す。ロボットはそのステップをsafe stateに入れ、イベントに対処した後、pause budgetに基づいて再開、再加熱、救出、または廃棄を行う |
| `failureModes` (incident, detect, prevent, playbook) | 既知の問題の早期検出と、回復するための正確なplaybook |
| `affordances`, `space` | 掴む、持ち上げる、届くことができるロボットへのステップの適合；hot zonesを子供から遠ざける |
| `safety` (hazards, CCPs, supervision, abort) | セーフティカーネル：すべての計画が維持しなければならない不変条件 |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | サービング：テーブルへ、部屋へ、ランチボックスへ何を出すか；リマインダーと保持制限；文化的な食事スタイル |
| `storage` | 残り物、作り置き、およびランチボックスのMission |
| `acceptance` | レシピの*tests*：これらが保持されたとき、Missionは完了する |
| `nutrition`, `cost` | 個人のポーション、予算、救援配給 |

## 3. 例：すべてが紐付けられた1つのステップ

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

## 4. ミッションのためのレシピのコンパイル（プランナーが行うこと）

1. **バリアントを選択する:** `alternatives` から diet、texture (IDDSI)、equipment、energy、mode を選択する。Identity essentials は維持されなければならない。
2. **スケール:** `formula` と、サービング数、1人あたりのポーション (HEALTH.md)、制限食材、または配給期間から算出する。スパイスは劣線形に、時間は質量指数に従ってスケールさせる。
3. **代替する:** ロール内で、`identity.neverAdd`、アレルゲン、dietary packs、および在庫を尊重して代替する。
4. **環境を準備する:** `prep` を Mission の空間 facet (シンクは満杯か？ コンロは使用中か？ まな板は汚れているか？) と比較し、整理、洗浄、乾燥、およびステージングのタスクを追加する。`advanceTasks` (浸水、解凍、マリネ、予熱) をスケジュールする。
5. **バインドする:** アフォーダンスと能力に基づき、各ノードをロボット、家電、または人間に割り当てる。バーナー、容器、およびゾーンをリースする。モニター (スマートポット、配送 ETA、煙探知機) を取り付ける。
6. **スケジュールする:** 提供時間から逆算してスケジュールし、一時停止予算、バッテリーおよびエネルギー制限、家庭内の静穏時間、およびキッチン共有時間を遵守する。
7. **コンティンジェンシーを付加する:** 各ノードの `failureModes` と `pause` ルールに加え、Mission のグローバルポリシー (中断、コンロ付近の子供またはペット、ストーブ・ウォッチドッグ、腐敗監視) を付加する。
8. **検証する:** スキーマ + セマンティックチェック、ポリシーパック、CCP カバレッジ、シミュレーターによる dry run、優先度スタックの不変条件 (PROTOCOL §7.2) を検証する。
9. **R4 を発行する:** Mission の `plan` に R4 を発行し、署名してロボットに渡す。

## 5. 作成と変換

- **fifi.cooking より:** EXPORT-FIFI パイプラインは R1 + R2 + R3 を生成します。新しいセクション (identity, sensory, formula, prep, service, pause, failureModes, affordances) は、既存のテキストからローカルモデルによって生成され、バリデータによるチェックとサンプリングされた人間によるレビューが行われます。
- **ウェブより:** `cookwala convert --from schema-org` → R1/R2 (V0)、その後、同様のエンリッチメントが行われます。
- **他のフォーマットへ:** schema.org Recipe (検索エンジン用の R1/R2)、Cooklang (人間による編集)、PDDL または temporal logic (研究用プランナー) はすべて R3 から生成可能です。
- **手動による操作:** `cookwala init recipe` がすべてのレイヤーをスキャフォールドし、`cookwala validate` と `cookwala simulate` がそれらをチェックします。
- **バージョニング:** リビジョンは不変であり、ハッシュ化されます。フォークは `meta.derivedFrom` を記録します。レシピの **patches** (プレイブックまたはフィードバックによるもの) は diff として提案され、レビューとエビデンスを経てのみ昇格されます。

## 6. ステップテキストの言語

ステップの文章は、まず人間に向けて書かれ、次にマシンによって解析されます。例示されているレシピ内のアラビア語のステップテキストは、エジプトの料理本の一般的な慣習である女性命令形（قطّعي、سخّني）を使用しています。これは見落としではなく、意図的な選択であり、出版社によっては代わりに性中立的な受動態（تُقطَّع البصلة）を使用する場合もあります。`op`、`params`、および `until` フィールドが意味を担っており、文章は料理人のためのものです。

## 7. なぜこれが将来にわたって有効であり続けるのか

- レシピは**動作ではなく、食品の成果と制約**を記述します。新しいロボットと新しいAIは、同じR3からより優れたR4プランを生成します。
- すべての新しいセクションは**オプションであり、追加的**です。V0レシピ（R1のみ）は、ガイド付きの人間による調理においても引き続き機能します。追加される各レイヤーによって、より多くの自動化が解禁されます。
- 未知の `x-` フィールドはそのまま通過します。ベンダー、シェフ、および保健機関は、誰のプロセスも壊すことなくレシピを拡張できます。
- **Acceptance checks** により、人間またはロボットのいずれの実行者も、料理が正しく出来上がったことを証明でき、それによってレシピは現場の証拠とともにV3へと上昇します。

