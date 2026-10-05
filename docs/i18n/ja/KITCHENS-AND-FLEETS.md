<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->
# キッチンとプロダクションラン：レストラン、コミュニティ、学校、災害、およびロボットキッチン

> **Status: experimental profile** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Examples: `examples/fleet/`.

## 1. なぜ

創設者は、レストラン、結婚式、寄付活動、または食品工場（RFC-0005）における同様のプロトコルを求めました。概要には、学校給食プログラムと災害時炊き出しが追加されています。Coreは1台のデバイスが1つのレシピを調理することをカバーし、Humanitarian Profileはsurplusの移動と食事の数を数えることをカバーします。その間には**kitchen**が存在します。すなわち、ステーション、デバイス、人々、多くのバッチ、配膳時間、重要管理点、そしてデバイスのexecution logからプログラムが報告する食事へのリンクです。

## 2. ドキュメント

| ドキュメント | 内容 |
|---|---|
| `Kitchen` | 組織のキッチン：タイプ、ステーション（prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash）、機能リファレンスとしてのデバイス、1時間あたりの食事数による容量、hot-holdおよびcooling機器、適用されているrule pack、**役割ごとのスタッフ数**、営業時間 |
| `ProductionRun` | バッチ数とサービング数を含むレシピ、serve window、レシピステップごとのステーションおよび`device`、`person`またはその両方への割り当て、重要管理点記録（cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation）、生成されたCoreのexecution、および結果（生産・提供された食事、廃棄物、使用されたrescued food、失敗、インシデント、エネルギー、コスト、それが発行したHumanitarian `Distribution`） |
| `StationLease` | デバイスまたは役割による、一定期間のステーションの独占的使用 |

## 3. 他の要素との結合方法

- `device` に割り当てられたステップは、Core `ExecuteRequest` (または ROS 2 binding を介した `ExecuteNode` ゴール) です。その `ExecutionLog` ハッシュは `executions` に格納されます。
- プログラムに供される run は、Humanitarian `Distribution` を発行します。その run の `ccps` は、distribution の安全性に関する知見の根拠となる evidence です。
- Humanitarian Profile からの rule pack は、run のメニューおよびアイテムに適用されます。
- フリート派遣 (どのロボットがどこへ行くか) は Open-RMF またはベンダーのフリートマネージャーに属するものであり、この profile に属するものではありません。

## 4. 例題

`examples/fleet/kitchen-disaster.json` および `production-run-disaster.json`: 2台のガスケトル、温蔵ユニット、およびアイスバスを備えた救援キッチンは、2時間のウィンドウでレンズ豆のスープと米の食事を710食分生産し、調理温度と温蔵温度を記録し、60 °Cを下回る温蔵ユニットを1つ発見して提供前にそのバッチを再加熱し、配布を放出します。この例は例示的なものであり、実際のキッチンやイベントは記述されていません。

## 5. 意図的に除外されているもの

スタッフの名前とスケジュール、賃金、顧客の注文と支払い、メニューの価格設定。スタッフは役割ごとの人数として表示されるため、個人を特定することなく食事あたりのコストを計算できます。

## 6. Next

ロボットステーションを伴うレストランサービスの例；実行状態ステートマシンのための conformance suite；`StationLease` とセッションリース (`session.schema.json`) の統合。

