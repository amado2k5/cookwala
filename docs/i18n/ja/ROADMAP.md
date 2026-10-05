<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# ロードマップ: now, next, later

**Status:** 2026-10-04. すべての項目はステータスを伴います: **done**, **in progress**, **planned**,
**not yet funded**. ゲートは `ACTION-PLAN.md` セクション 4 から来ます。指定されたエビデンスなしに、planned から done へ移動することはありません。

## Now (this release)

| 項目 | ステータス |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| 英語とアラビア語による9つのレシピ例 | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| 139-type facet registryとdisclosure vectorsを備えたHousehold Context Profile | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| プロトコルのオン/オフを切り替え可能な4つのシミュレーター | done (illustrative) |
| 全てのステークホルダー向けのページ、whitepaper、deckを備えた英語とアラビア語のウェブサイト | in progress |

## Next (約1年以内、リソースが許す限り)

| 項目 | ステータス | ゲート |
|---|---|---|
| operation envelopes の食品科学者によるレビュー | planned | reviewer agrees |
| 4つの rule pack に対する管理栄養士および食品安全責任者のレビュー | planned | reviews filed; packs move to reviewed |
| household profile のデータ保護影響評価 | planned | reviewer agrees |
| food-bank パイロット (12 weeks, pre-registered, independent evaluator) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| いくつかのモデルファミリーに対する Agent-safety ベンチマーク結果 | planned | runs published with method |
| `pip install cookwala` wheel および npm 上の `@cookwala/sdk` | planned | packaging that bundles vocabularies and schemas |
| Registry サービス (`validate`, `publish`, tombstones) | planned | a worker and namespace proof |
| リファレンス hub に対して Core API を実装する最初のデバイスメーカー | planned | one maker agrees; conformance report published |
| 最初の fifi.cooking コレクションの変換 | planned | founder decides rights per collection |
| デバイスからのフィードバックに基づく Core 0.3 | planned | two implementers' feedback |
| 運営委員会 | planned | three independent adopters or two implementations |

## Later

| 項目 | ステータス |
|---|---|
| Cookwala のレシピを調理する実機、無編集、ビデオ | 未資金提供; デバイスパートナーが必要 |
| 独立した認証機関を伴う certification スキーム | 計画中; 認証機関は未契約 |
| 仕様、商標、およびマークのためのニュートラルな基盤 | 計画中 |
| 貢献者ネットワーク: クレジット付きの実レシピの同意済み録音 | 計画中 |
| プログラムおよび協同組合によって公開される需要と供給のシグナル | 計画中, 競争法レビューの後 |
| "Cook in simulation" ベンチマーク (Isaac Lab, Gazebo または MuJoCo) | 計画中 |
| Humanitarian Profile に対する Digital Public Good の認定 | 計画中, パイロットによる evidence の後 |
| ワールドシミュレーターにおける地域を越えた救援フロー; クリーンクッキングの効果 | 計画中 |

## 私たちがしないこと

個人データを収集する；手法を明示せずに数値を公開する；パートナーが同意する前にその名称を挙げる；
存在しない certification を主張する；いかなる ledger にも household data を載せる；キッチンが依存するような中央の orchestrator を構築する；飢餓を終わらせると主張する。

## Kill and pivot rules

アクションプランより：2回の外部レビューラウンドでデバイスメーカーまたはパイロットパートナーが見つからない場合、CookwalaはHumanitarian Profileとレシピ形式へと絞り込みます。パイロットの結果が5 %未満の改善にとどまる場合、結果は公開され、スケーリングの前にプロファイルが再設計されます。

