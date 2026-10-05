<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->

# Cookwala 戦略: メッセージ、製品、ウェブサイト、ドキュメント、開発者体験

**Status:** 2026-10-04改訂 (v2)。ミッション、ビジョン、ストーリー、標準、ウェブサイト、
ドキュメント、APIおよびSDK、デモ、コミュニティ、およびメトリクスをカバーしています。これは、アクションプラン
(`ACTION-PLAN.md`)、バックストーリーおよびギャップリスト (`research/BACKSTORY.md`)、アーキテクチャレビュー
(`research/ARCHITECTURE-REVIEW.md`)、23サイトのベンチマーク (`research/WEB-BENCHMARK.md`)、
ステークホルダー設計 (`STAKEHOLDERS.md`)、およびメッセージングルール (`MESSAGING.md`) に基づいています。セクション1の表は初回調査であり、内容が異なる場合はベンチマークが優先されます。

---

## 0. Summary

**Cookwalaの仕事。** それは、あらゆるキッチン（人、food bank、オーブン、またはヒューマノイドロボット）に対して、**何を作るか、各ステップがいつ完了するか、そして何が絶対に起きてはならないか**を伝えるためのオープンな方法であり、デバイス上でこれら3つすべてをチェックすることです。

**変更内容:**

1. **Message.** 「世界初かつ最大級のロボット調理レシピ・インデックスおよびCLI」という表現を退け、すべてのロボットメーカーとキッチンが抱える問題から始めてください。新しいワンライナー：
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Story.** ロボットが家庭で調理する時代が近づいていますが、「完了」や「安全」が何を意味するのか、あるいはどの料理においてそうなのかを、機械が検証できる形式で書き留めた人は誰もいません。Cookwalaは、ある家族のエジプト料理のレシピから始まりました。そのミッションは、あらゆる料理を機械に安全に教え、美味しい食べ物が人々に届くようにすることです。
3. **Proof before promise.** 生の、リアルなカウンター。now / next / later ラベル。公開された批評。
4. **One loop everyone understands:** *Describe → Check → Cook → Learn.*
5. **Paths by audience:** デバイスメーカー、AIエージェント開発者、キッチンおよびfood bank、料理人、研究者。
6. **Code and a live demo on the first screen.** ブラウザ上でのdry run（「このデバイスはこのレシピを調理できるか？」）、シミュレーター、そして今日から使えるコピー＆ペースト可能なコマンド。
7. **Developer experience at the level of the best AI and robotics docs:** 5分間のクイックスタート、チュートリアル、ハウツーガイド、リファレンスと解説として整理されたドキュメント、`llms.txt`、コピーページ、PythonパッケージとCLI、型定義されたJS/TS SDK、MCPサーバー、ローカルで実行可能なリファレンスhub、ROS 2パッケージ、そしてLeRobotブリッジ。
8. **A contributor network** (FigureのIndexに触発): 料理人とキッチンが同意を得た実際のレシピの録画を提供することで、ロボットがあらゆる料理を学び、それを教えた人々へクレジットが送られる仕組み。

---

## 1. 私たちが学んだこと

| サイト | 解決する課題 | アプローチ | コミュニケーション方法 | 対象読者 | 私たちが取り入れるもの |
|---|---|---|---|---|---|
| **Figure – Index** | ヒューマノイドには膨大な量の現実世界のタスクデータが必要 | 日常のタスクを記録する有料コントリビューターネットワーク；services now, robots later | シネマティック、モノクロ、巨大なライトタイプ；ライブカウンター (29 M video uploads, $15 M paid)；*"Today, services on demand. Soon, robots on demand."* | コントリビューター、households、企業 | クレジット付きのコントリビューターネットワーク；**live proof counters**；"today / soon" の誠実なライン；印象的な1枚の画像 |
| **Figure (home)** | 家庭での手助け | 汎用ヒューマノイド | *"The future of home help is here."* 一文、一つのビデオ | Households、投資家 | 一文の約束；機能よりも製品 |
| **MCP Registry** | 信頼できるMCPサーバーの発見 | コミュニティregistry；検証済みreverse-DNS namespaces；正確なバージョン；integrity hashes；validation endpoint；lifecycle status | クリーンなOpenAPIリファレンス；schema-first | サーバーパブリッシャー、クライアントメーカー | **Verified namespaces, pinned versions, hashes, tombstones** → `REGISTRY.md` |
| **LangChain docs** | エージェント構築の断片化 | オープンでmodel-agnosticなフレームワークとプラットフォーム | *"The open agent engineering ecosystem"*; lifecycle Build → Test → Deploy → Monitor; trust centerとstatus | エージェントエンジニア、エンタープライズ | **読者が認識できるlifecycle**；trust center；academyとforum |
| **LangSmith Observability** | 本番環境でのエージェントの動作の可視化 | Traces → monitoring → feedback → datasets for evals | リンク付きのステップ；conceptsページ；integrations | エージェントチーム | **Tracesとしてのexecution logs**；tracesがdatasetsになる → `execlog_export.py otel` |
| **OpenAI API docs** | 初めてのAPIコール | コード優先のQuickstart；build paths；model cards | ダーク、コード重視、"Ask AI"、statusとcookbook | デベロッパー | **最初の画面にコード；"build paths"** |
| **Claude Platform docs** | 初回コールから本番環境まで | 2つのサーフェス (Messages, Managed Agents)；番号付きのデベロッパージャーニー；model family cards | ⌘K search；言語タブ (Python … cURL, CLI)；journey 1–4 | デベロッパー、プラットフォームチーム | **番号付きのデベロッパージャーニー；言語タブ；"choose how you build"** |
| **AsyncAPI** | イベント駆動型APIの記述 | オープンなspecとツール (generators, docs)；Linux Foundationの下でのオープンガバナンス | "Part of the Linux Foundation"; spec → docs → code demo; コミュニティミーティング；sponsor tiers | アーキテクト、ツールビルダー | **Open governance badge, TSC, community calendar, sponsors** |
| **SiliconFlow** | 高速で安価なモデル推論 | 多様なモデルに対応するワンストップAPI | パフォーマンス、スケーラビリティ、コスト、セキュリティの機能リスト | デベロッパー、エンタープライズ | **characteristics**の簡潔なリスト ( ours: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | 試行錯誤によるプロンプトエンジニアリング | 宣言的なテストケース、red teaming、CI | *"Test-driven LLM development, not trial-and-error"*; why-chooseリスト；ワークフローのステップ | LLMアプリデベロッパー、セキュリティ | **宣言的なsafety tests** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; FigureのHelix AIではない) | DeFiは複雑すぎる | すべてのトランザクションの前に確認を行う自然言語エージェント | Whitepaper: abstract → problem → solution → architecture → security model | クリプトユーザー | **Whitepaperの構造；明示的なsecurity model；"always confirm"** (トークンモデルではなく構造を取り入れる) |
| **Hugging Face LeRobot** | ロボティクスは開始のハードルが高い | Hardware-agnosticなライブラリ；teleoperate → record → train → deploy；標準的なdataset format；コミュニティdatasets | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet；よくある問題 | メーカー、研究者 | **"Pick your path"; datasetの互換性；common-problemsセクション** |
| **ROS 2 / Open Robotics** | ロボットソフトウェアの相互運用性 | 非営利団体が運営するオープンなmiddleware (ROS, Gazebo, Open-RMF) | *"Powering the world's robots"* | ロボットデベロッパー | **ROS 2 actions; non-profit stewardship** |
| **NVIDIA Isaac** | ロボットの開発とトレーニング | Simulation、libraries、foundation models (GR00T) | プラットフォームマップ：libraries、simulation、models、blueprints | ロボティクスチーム | envelopesのための**test benchとしてのSimulation** |
| **1X, Unitree, Pollen** | 家庭用ヒューマノイド、手頃なロボット、メーカー向けのオープンなロボット | デポジット、予約注文、コミュニティを備えた製品 | 1つの製品、1つの価格、1つのボタン | Households、メーカー | 家庭用ロボットはnow出荷中；私たちのwindowはnowである |

**最高峰に共通するパターン:**
1. 誰のため、何をするものかを示す一文。
2. 読者が認識できるループ。
3. 1スクロール内で完結する動作するコードまたはデモ。
4. 選択可能なエントリーポイント。
5. 証拠（数値、ユーザー、ガバナンス）。
6. 正直なステータス（trust center、status page、now/next）。
7. 今日から参加できるコミュニティ。
8. 人間とAI読者の両方のために構築されたドキュメント（copy page、`llms.txt`、"Ask AI"）。

---

## 2. 今日の Cookwala

**強み:**
- 稀有で具体的なアイデア: 物理的な operation envelope、sensor ladder、推測の代わりに refusal、デバイス上で強制される安全性、検証可能なドキュメント。
- 2つの独立した標準規格の結果 (RFC 8785, RFC 8032) を含む conformance ベクトル。
- 4つのプレイ可能なシミュレーター。
- ロボットなしでも機能する人道的なプロファイル。
- 実在のレシピコーパス (fifi.cooking) とアイデンティティを持つ地域 (Egypt、アラブ世界)。
- 異例なほど正直な批判と応答の記録。

**Gaps:**

| Gap | Effect |
|---|---|
| 見出しが1つの公開レシピで「最初かつ最大」と主張している | ハイプ（誇大広告）と受け取られ、退けられる原因となる |
| 「世界の飢餓を終わらせる」をリードに置いている | 飢餓の要因を知っている資金提供者や専門家を遠ざける |
| ロボット限定のフレーミング | 今日から導入可能なユーザー（キッチン、food bank、agent builders）を除外している |
| quickstart、SDK、実行可能なサーバーがない | 5分以内に成功できる人が誰もいない |
| ドキュメントがナビゲーションのない25個のmarkdownファイルである | 見つけにくく、信頼しにくい |
| ライブな証明やstatusがない | モメンタムや準備ができている感覚がない |
| 参加する方法がない | 関心が貢献に変わることができない |

---

## 3. ポジショニングとメッセージ

### 3.1 カテゴリとワンライナー
- **カテゴリ:** 実行可能で検証可能な調理のための、オープンスタンダード（無料ツールとインデックスを伴う）。
- **ワンライナー:** *Cookwalaは、人、キッチン、そしてロボットが安全に調理するためのオープンスタンダードです。*
- **トライアド（三要素）**, あらゆる場面で使用:
  - **何を作るか。** 機械が計画できるステップとしてのレシピ。
  - **いつ完了するか。** 測定可能な終了条件：温度、食品の状態の合図、時間。
  - **何が絶対に起きてはならないか。** デバイス自身が強制する安全制限。

### 3.2 使命とビジョン（改訂版）
- **使命:** *誰が料理をするかにかかわらず、誰もが、おいしく、安全に、手頃な価格で、無駄なく食べられるよう支援すること。*
- **ビジョン:** *地球上のあらゆるキッチンで、どんなレシピでも安全に調理でき、おいしい食べ物がゴミ箱ではなく人々に届いていること。*
- **変更の理由:** 「世界の飢餓を終わらせる」は、根拠とともに語られる長期的な理由として維持されます。Cookwalaは、飢餓対策に必要なプログラム、資金、政策と並行して、廃棄物の削減、フードレスキュー、そしてより安価な調理を通じて、その実現に貢献します。

### 3.3 ストーリー

> ホームロボットが登場しています：Figure 03、1X NEO、そしてキッチンロボットが出荷中、あるいは予約受付中です。それらは動き方を学習していますが、機械が検証できる方法で、「simmer」が何を意味するのか、鶏肉が安全な状態とはいつなのか、あるいは祖母のモロキアがどのように作られるのかを書き留めた者は誰もいません。各メーカーは、主にいくつかの料理に基づいた独自のクローズドなレシピを作成しています。
>
> Cookwalaは、fifi.cookingにあるある家族のエジプトの家庭料理レシピから始まり、シンプルな問いを投げかけました：どのようにレシピを機械に渡し、それが安全に調理されることを確信できるのか？
>
> その答えは、オープンな標準です。それは何を作るか、各ステップがいつ完了するか、そして何が絶対に起きてはならないかを規定します。デバイスは、何かを加熱する前にそれをチェックし、推測するのではなく refusal before heat を行います。同じレシピが今日では人間や food bank で機能しており、明日は、彼らに教えた料理人へのクレジットとともに、地球上のあらゆる料理をロボットが学習することを可能にするでしょう。

*(創設者は、元の文章を確認し、パーソナライズする必要があります。洗練されていることよりも、本物であることの方が重要です。)*

### 3.4 メッセージハウス

| Pillar | Promise | Proof we can show today |
|---|---|---|
| **Safe by design** | デバイスは推測するのではなく拒否し、ローカルで制限を強制する | 32のoperationに対するoperation envelope; safety-limits pack; dry run; conformance |
| **Verifiable** | 誰でもレシピ、デバイス、記録を確認できる | Signatures, key revocation, event-log checkpoints; RFCの結果を含む106のvectors |
| **Open and neutral** | ロイヤリティフリー、model-agnostic、device-agnostic | Licences; governance path; API keysなし |
| **Every cuisine** | 本物の家庭料理から構築され、多言語対応 | fifi.cooking corpus; アラビア語と英語; world-cuisines plan |
| **Useful before robots** | キッチンとfood bankがnowに恩恵を受ける | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **Learns with consent** | 本物の料理が、クレジットと共に、より優れたロボットへと進化する | ExecutionLog consent; LeRobot export; OTel traces |

### 3.5 言語ルール
- **使用する:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **避ける:** "revolutionary", "first and largest" (真実であるまで), "end hunger" (見出しとして),
  "AI-powered" (曖昧な表現).
- **すべての数値に** *measured*, *modelled* または *assumed* のラベルを付ける。
- 存在しないものが存在するかのように暗示するのではなく、"now / next / later" と言う。

---

## 4. オーディエンスとその最初の成功

| 対象 | 達成すべき課題 | 初回の成功 (≤ 15 min) | その次に |
|---|---|---|---|
| **Robot and appliance makers** | すべてのレシピを書くことなく、安全に調理機能をリリースする | 5つのレシピに対してデバイスプロファイルを dry run する; ステップごとの accept/refuse を確認する | Core API (reference hub) を実装し、conformance に合格し、デバイスを registry に公開する |
| **AI-agent builders** | エージェントが危害を加えることなく食事を計画し、食品を注文できるようにする | Cookwala MCP サーバーを追加する; モデルに対して agent-safety benchmark を実行する | 行動する前に AgentMandate と dry run を使用する |
| **Kitchens and food banks** | surplus を安全に救出し、栄養価の高いメニューを計画する | SMS によるオファーを送信するか、CSV を記入する; rule pack チェックを確認する | Humanitarian Profile でパイロット運用する |
| **Cooks and recipe creators** | レシピを存続させ、クレジットを保持する | エディタで1つのレシピを変換する; バリデーションに合格するのを確認する | 録音を提供する (同意済み); クレジットに表示される |
| **Researchers and reviewers** | データ、ベンチマーク、誠実な assumptions | シミュレーターを実行する; クリティークと conformance suite を読む | データセットを使用する; レビューを公開する |
| **Funders and policymakers** | インパクト、リスク、ガバナンスを確認する | 2ページのホワイトペーパーの要約とコンセプトノートを読む | パイロットに資金を提供し、ガバナンスに参加する |

---

## 5. 製品アーキテクチャ: Cookwala が提供するもの

| レイヤー | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profiles (draft / experimental) | 最初のデバイスフィードバック後の Core 0.3 | 基盤の下での Core 1.0 |
| **Index and registry** | レシピ例; registry 仕様 | fifi.cooking コーパスの変換済み (1,881 recipes, Arabic + English); 検証済み namespaces | コミュニティコレクション, 世界の料理 |
| **Tools** | Validator, リファレンスライブラリ, dry run, conformance, exporters | `pip install cookwala` (CLI + library); JS/TS SDK | レシピエディタ (web) |
| **Reference hub** | Core API 仕様 | シミュレーションデバイスを備えた Docker hub (quickstart `curl` がローカルで動作可能) | Hardware-in-the-loop kit |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 package; MCP server; Open-RMF task | Isaac Lab "cook in simulation" benchmark |
| **Safety** | Limits pack, recalls, incidents, agent benchmark | レビュー済みの limits; 公開された agent-safety 結果 | 認証機関による Certification scheme |
| **Humanitarian** | Profile, rule pack, templates, concept note | エジプト food-bank パイロット | Food-bank ネットワークへの採用 |
| **Data** | 同意付きの ExecutionLog | 貢献者ネットワーク, 最初の同意済みデータセット | Hugging Face Hub 上でのマルチキュイジーネ・ベンチマーク |

---

## 6. ウェブサイト

### 6.1 サイトマップ

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

### 6.2 ホームページ、上から下へ

| # | セクション | 目的 | 内容 |
|---|---|---|---|
| 1 | **Hero** | それが何であるかを一息で伝える | ワンライナー、トライアド、2つのボタン (*Try the dry run*, *Read the quickstart*)、誠実なステータスチップ "Draft standard · v0.2" |
| 2 | **Live demo** | 言葉ではなく見せる | 「このデバイスでこのレシピを調理できるか？」レシピとデバイスを選択。各ステップで done / person / refuse を表示し、決定を下した rule を示す |
| 3 | **The problem** | ギャップを実感させる | ロボットが到来している。「simmer」は異なる意味を持つ；少数の料理ジャンルによる閉じたレシピ；人々が飢えている間に食品が廃棄されている |
| 4 | **The loop** | 一つのメンタルモデル | Describe → Check → Cook → Learn、それぞれにアーティファクトとコマンドを伴う |
| 5 | **Pick your path** | 各訪問者を誘導する | 5つのカード（セクション 4）、それぞれに最初の成功体験を伴う |
| 6 | **Proof** | モメンタムと誠実さ | `/v1/stats.json` からのライブカウンター（定義された operations、conformance ベクトル、schemas、公開された recipes、languages）；すべての数値にラベルを付与 |
| 7 | **Safety** | 信頼 | 安全性はローカルである；refusal；エージェントの rules；recalls；/trust へのリンク |
| 8 | **Works today** | ロボット以前の有用性 | Humanitarian Profile、SMS の例、シミュレーター |
| 9 | **Now / next / later** | 誠実なロードマップ | セクション 5 より |
| 10 | **Open** | 中立的かつ参加可能 | ライセンス、ガバナンスの経路、貢献、GitHub |

### 6.3 デザインの方向性
- **フィーリング:** calm, precise, warm。キッチンの魂を持つプロフェッショナルな計器。
- **タイポグラフィ:** UIには精密な grotesque、データとコードには mono face。ヒーロー要素には、Figure の自信を借りつつ、その映画のような暗さを模倣しない、大きく light なディスプレイ用書体を使用。
- **カラー:** ニュートラルな paper と ink に、温度データを示すための一つの heat accent (ember orange) を加える。パレットは色覚多様性の読者に対して検証されており、light テーマと dark テーマの両方が設計されている。
- **イメージ:** ストックフォトのロボットではなく、準備ができ次第、実際の人の手と実際の家庭のキッチンを使用する。それまでは、図解とライブデモがページを構成する。
- **モーション:** 一瞬、step-by-step の dry run が動く。それ以外はすべて静止している。
- **最初からバイリンガル:** 英語とアラビア語 (right-to-left layout)、その後に他言語。
- **アクセシビリティ:** WCAG 2.2 AA; キーボード; reduced motion; 色のみに依存しない情報伝達。

### 6.4 インタラクティビティ
1. ブラウザ内での dry run (レシピ × デバイス)。
2. Envelope explorer: 温度のトレースをドラッグして、いつ "simmer" を離れるかを確認する。
3. プロトコルがオンおよびオフの状態でのシミュレーター。
4. レシピステップビューア: ステップの文章、その JSON、およびその envelope を並べて表示。
5. Later: 入力に合わせて検証を行うレシピエディタ。

---

## 7. Documentation

Diátaxis フレームワークによって整理されているため、各ページには一つの役割があります：

| タイプ | 目的 | ページ |
|---|---|---|
| **Tutorials** | 実践して学ぶ | Quickstart; Your first Cookwala recipe; Make a device Cookwala-ready; Add Cookwala to an agent; Run a food-rescue pilot with SMS |
| **How-to guides** | 1つのタスクを解決する | Dry-run a device; Sign and verify; Publish to the registry; Export logs to LeRobot or OpenTelemetry; Run the agent-safety benchmark; Report an incident; Issue a recall |
| **Reference** | 調べる | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Explanation** | 理由を理解する | Why envelopes; safety is local; trust model; privacy; humanitarian design; critiques and responses; simulators and their limits |

**Docs ergonomics:**
- 左ナビゲーション、検索、「Copy page」、「Edit on GitHub」、previous/next リンク;
- 言語タブ (Python / JavaScript / cURL / CLI);
- AIリーダー用の `llms.txt` およびページごとの markdown;
- チートシートと common-problems ページ;
- 日付付きの changelog;

---

## 8. API および SDK

| 成果物 | 内容 | 理由 |
|---|---|---|
| `cookwala` Python package | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (from `tools/`) | 最初の成功までを一つのコマンドで |
| `@cookwala/sdk` (TypeScript) | スキーマから生成された型; Core API クライアント; ブラウザでの dry run | Web およびエージェント開発者 |
| Reference hub (Docker) | シミュレートされたデバイスと安全制限を備えた Core API | クイックスタートの `curl` がローカルで動作; メイカー向けのテストベッド |
| MCP server | ツール: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | すべての MCP 対応エージェントが Cookwala を安全に使用できる |
| ROS 2 package | `cookwala_msgs` (actions), Core API へのブリッジノード | ロボットメイカー |
| Exporters | LeRobot, OpenTelemetry (done) | 学習とオブザーバビリティ |
| Evals | promptfoo agent-safety benchmark (done) | エージェントビルダー、安全性レビューアー |
| Versioning | Core 用の Semver; 日付付きスキーマバンドル; changelog; 非推奨期間 | 安定性の約束 |
| Status | cookwala.ai エンドポイント用の公開ステータスページ | 信頼 |

---

## 9. デモ

| デモ | 対象 | ステータス |
|---|---|---|
| ブラウザ内 dry run | 全員 | Building now |
| シミュレーター (home, city, country, world) | 全員, 資金提供者 | Live |
| モデル間における Agent-safety 結果 | Agent builders, AI labs | Next (ベンチマークを実行し、手法とともに結果を公開) |
| SMS food-rescue ウォークスルー | Food banks | Next (録画されたデモ) |
| Cookwala のレシピを調理する実際のデバイス、無編集 | 全員 | Later (最も重要なデモ; デバイスパートナーが必要) |
| "Cook in simulation" (Isaac Lab / Gazebo) | ロボティクス研究者 | Later |

---

## 10. コミュニティと成長

- **Contributor network** (Figure's Indexに触発):
  - *Cooks* は、自身が知っているレシピの同意を得たセッションを記録し、すべてのレシピと dataset card にクレジットを付与します。
  - *Kitchens and food banks* のパイロット。
  - *Makers* はデバイスを実装します。
  - *Reviewers* は rule pack と envelopes をレビューします。
  - *Translators* は手順と言語を翻訳します。
  - 有償の貢献は、助成金によって funding され、later に行われます。インフォームド・コンセントと公正な条件なしに、データに対して決して支払わないでください。
- **Rituals:** 月次のコミュニティコール、実数値を用いた四半期ごとの "state of Cookwala"、公開レビュースレッド。
- **Partnership sequence:** ステークホルダー・トラッカーからの最初の10件 (food bank, WFP Innovation Accelerator, Home Assistant, デバイス・スタートアップ, 大学の研究室, certifier, World Central Kitchen, 財団, 中立的な家庭, 1人のクリエイター)。
- **Channels:** GitHub Discussions、ニュースレター、カンファレンスでの講演 (ROSCon, IROS/ICRA workshops, food-tech イベント)、アラビア語チャンネル。

---

## 11. メトリクス

- **North-star metric:** *verified cooks*、同意され、conformanceを満たしたexecution logを伴い、署名済みのCookwalaレシピをend to endで実行したexecutionの数。それがゼロの間は、leading indicatorsを追跡すること。

| ファネル | 指標 | 2027-03までの目標 |
|---|---|---|
| Attract | /start への月間訪問者数 | 2,000 |
| Activate | 完了した dry run 数 (web + CLI) | 500 |
| Build | conformance に合格した独立した Core 実装数 | 2 |
| Adopt | food bank パイロットによる救出 kg 数 (measured) | 最初の 6 か月間のパイロット実施中 |
| Contribute | 変更がマージされた外部コントリビューター数 | 15 |
| Trust | 公開された外部レビュー数 | 6 |
| Learn | 同意を得た execution logs 数 | 1,000 |

---

## 12. ロードマップ

アイテムごとのステータスを含む維持されたロードマップは [`ROADMAP.md`](ROADMAP.md) です。以下の表は、記録のために保持されているオリジナルの180日間の計画です。

| 時期 | ウェブサイトとストーリー | 開発者エクスペリエンス | 標準と安全性 | コミュニティ |
|---|---|---|---|---|
| **Now (this release)** | ライブ dry run、triad、paths、proof、now/next/laterを備えた新しいホームページ; docs viewer; `llms.txt`; trust pages (security, governance) | Dry run; LeRobot および OTel exporters; ROS 2 actions; agent-safety benchmark | Registry spec (namespaces, versions, hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Next 30 days** | /start quickstart; アラビア語ホームページ; 全ページでの claims pass | `pip install cookwala`; reference hub (Docker) | 初の benchmark 結果の公開 | food bank への Concept note; Home Assistant への提案 |
| **60 days** | fifi corpus (最初の100件を変換済み) を含む /recipes index; /humanitarian | TS SDK; MCP server | 食品科学者による envelope のレビュー | 初の community call |
| **90 days** | Whitepaper + 2ページの要約; /roadmap | ROS 2 package | デバイスのフィードバックに基づく Core 0.3 | デバイスパートナー、大学の研究室 |
| **180 days** | 実機デモビデオ | Recipe editor | Certifier のギャップ分析 | パイロット結果; foundation への申請 |

---

## 13. この戦略に対するリスク

| リスク | 緩和策 |
|---|---|
| 薄い実態の上に構築された洗練されたサイトは、ハイプ（誇大広告）に見える | すべての主張にラベルを付与；実データからのライブカウンター；now/next/later |
| あまりに多くのオーディエンスに広げすぎること | 今後90日間の2つの主要なパス：デバイスメーカーとfood bank。その他はサポートされるが、追跡はしない |
| 大規模プラットフォームが閉鎖的な代替品を送り出す | 彼らが採用できる中立的で検証可能なレイヤーとなる；オープンなプレイヤー（Hugging Face, Open Robotics, Home Assistant）と提携する |
| 貢献者のデータの悪用 | オプトイン、撤回可能な同意；個人データなし；公開されたデータカード |
| ファウンダーの帯域幅 | さらなる仕様の前に、開発者体験（package, hub）をリリースする；共同メンテナーを募集する |

