<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->
# Cookwala Core 0.2

**Status:** draft, 2026-10-04. これは Cookwala の規範的な部分です。MUST、SHOULD、および MAY は RFC 2119 に従います。ここに記載されていないものはすべて、オプションの **profile** (section 10) です。

デバイスは、約1週間でCoreを実装できる必要があります。Coreは、**何を作るか、いつ完了するか、そして何が絶対に起きてはならないか**を定めます。ロボットがどのように動くかは定めません。

## 1. conformance クラス

| クラス | 実装必須事項 |
|---|---|
| **Recipe publisher** | 有効な `recipe.schema.json` ドキュメント; operation envelopes 内の温度; ハッシュおよび署名 |
| **Executor** (ロボット、家電、または hub) | Core API (`api/core.openapi.yaml`); operation envelopes および sensor ladders; ローカルな安全制限; 推測の代わりに refusal; execution log |
| **Catalog** | 署名済みレシピ、主要なレコードを含む `/.well-known/cookwala.json`、recall フィード、インシデント受付 |
| **Agent** (人間を代理する AI またはソフトウェア) | `AgentMandate` の下でのみ動作; ドキュメントのテキストをデータとして扱う; `confirmBefore` 内の事項を行う前に本人に確認する |
| **Verifier** | ハッシュ、署名、鍵の有効性と失効、開示、イベントチェーンおよびチェックポイント |

クラスを主張することは、その conformance ベクトル (`conformance/`, `tools/run_conformance.py` で実行) に合格することを意味します。

## 2. コアドキュメント

| ドキュメント | スキーマ |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

すべてのスキーマは**strict**です：`x-<vendor>-…` 拡張機能を除き、未知のフィールドは拒否されます。
読み手は理解できない `x-` フィールドを無視します。`tools/bundle_schemas.py` は、デバイスがオフラインで検証できるように単一の bundle を生成します。実装において、実行時にスキーマを取得することは MUST NOT です。

## 3. 操作の意味

- **Envelopes.** `vocab/ops.json` におけるすべての熱ベースまたは危険な operation には `envelope` があります。
  それは以下を指定します：
  - 媒体（水、油、空気、フライパンの表面、製品…）；
  - °C での温度帯（および圧力調理の場合は圧力）；
  - 攪拌、蓋、注意レベル、およびそのステップが unattended で実行可能かどうか；
  - 危険性；
  - テスト方法。

Example: `cw.op.simmer` = water-based liquid at 85–96 °C; `cw.op.deep_fry` = oil at 160–190 °C.
- **envelopes 内のターゲット。** レシピのターゲット (`params.tempC` または媒体の `target` (センサー上)) は、必ず envelope 内に位置しなければなりません。バリデーターは、これを破るレシピを拒否します。
- **Executors は媒体を envelope 内に保持します。** レシピがより狭いターゲットを指定している場合、一度そのターゲットに到達した後は、その範囲内にも保持します。
- **高度。** 水と蒸気の帯は、キッチンの高度 300 m ごとに −1 °C シフトします。
- **Heat levels** (`very_low` … `max`) は共通の意味を持ちます：`vocab/units.json` で定義された °C によるフライパン表面の帯です。
- **sensor ladder。** 各 envelope は、ステップを検証する方法を、優先度の高い順にリストしています：特定のセンサー、次に `model` (記録された推定値)、次に `time`、最後に `human` です。
  - executor は、満たすことができる最初の段（rung）を使用し、それを `verifiedBy` に記録します。
  - もし**どの**段も満たせない場合、そのステップを拒否しなければなりません (`missing_sensor_no_fallback`)。
  - 絶え間ない注意が必要で、放置して実行できない可能性がある操作（sautéing, searing, frying, reducing, caramelizing…）は、決して time 単独へのフォールバックは行いません：それらの最後の段は、見守る人間です。
  - Deep frying にはフォールバックがありません：油温センサーがないことは、deep frying ができないことを意味します。
  - `Condition` は `onSensorMissing` を使用して、これを狭めることができます。
- **推測ではなく、拒否。** ステップの envelope、ladder、機器、または安全制限を満たせない executor は、開始前に理由とともに `refused` と回答しなければなりません。

## 4. Numbers and units

- **温度はワイヤー上では °C です。** ディスプレイによって変換される場合があります。
- **許容誤差 (Tolerances)。**
  - `tolerance` は相対的であり、比率尺度 (ratio-scale) の単位にのみ許可されます。
  - `toleranceAbs` は値の単位における絶対値であり、°C で許可される唯一の許容誤差です。
  - `Target.tolerance` は絶対値です。
- **キッチン単位は正確なメートル法に基づいています:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **体積 ↔ 質量には密度が必要です** (`Quantity.densityGPerMl`、または材料の語彙を使用);
  密度がない場合はエラーとなり、推測は決して行われません。
- **通貨は、ISO 4217 通貨を持つ小数文字列** (`"12.70"`) であり、決して float ではありません。

## 5. 整合性と信頼

- **Hash.** `sha256:` に加え、ドキュメントの RFC 8785 canonical JSON から `hash` および `signature` フィールドを除いたものに対する 16 進ダイジェスト。リファレンス用の canonicalizer は RFC 8785 の例を正確に再現する。
- **Signature.** ASCII ハッシュ文字列に対する Ed25519 (`EdDSA`)。P-256 ハードウェアキーには `ES256` が許可される。`kid` は `KeyRecord` を指定する。
- **Keys.** `KeyRecord` は、公開鍵、その所有者、有効期間、および `revokedAt` を提供する。`signedAt` が失効後、または有効期間外に該当する署名は無効である。
  - カタログは `/.well-known/cookwala.json` に自身の鍵を公開する。
  - 組織および個人は、did:web ドキュメントに自身の鍵を公開する。
  - デバイスは、自身の capabilities document に鍵を公開する。
  - 検証者は、オフライン利用のために key records をキャッシュする。
- **Selective disclosure.** 署名済みドキュメントは、機密性の高い値の代わりに、`Disclosure` ダイジェスト `sha256(JCS([salt, value]))` を保持することができる。保持者は、それらを見ることを許可された当事者にのみ salt と value を開示し、署名は依然として検証可能である。
- **Event logs** (Mission profile):
  - ログごとに 1 つの sequencer が `seq` と `prev` を割り当てるため、チェーンがフォークすることはない。
  - チェックポイントは sequencer によって署名され、IETF SCITT のような transparency service を含む可能性のある witnesses によって副署される。witnessed checkpoint の後の書き換えは検出可能である。
  - `hash_only` モードでは、ペイロードは消去可能なストレージに保存され、ログにはそのハッシュのみが保持される。

## 6. 安全性とエージェントのルール (規範的)

1. **Safety is local.** 実行者はデバイス上で `SafetyLimits` pack を強制します。
   - いかなるレシピ、エージェント、リモートメッセージ、拡張機能、または動作モードも、制限を引き上げたり無効にしたりすることはできません。
   - より厳格な制限が常に優先されます。
   - `profiles/core/safety-limits.default.json` はドラフトの開始点であり、デバイスメーカーは独自の safety case に基づいてこれを強化します。
2. **Local stop.** デバイス上の停止制御は、ネットワークの有無にかかわらず、0.5 s 以内に動作を停止し、1 s 以内に熱を遮断します。呼び出し元が実行者に到達できる場合、`POST …/stop` が認可のために拒否されることは決してありません。
3. **Events report; they never protect.** `cookwalalatency: local_safety` イベントは、デバイスがすでに行ったことを報告します。いかなる安全機能も、イベントの到着に依存してはなりません。
4. **Untrusted text.** すべての自由形式テキストフィールド（`x-cookwala-untrusted` と注釈されたもの）はデータであり、ソフトウェアと AI エージェントの双方にとって、決して命令ではありません。テキストを通じて命令しようとする試みは無視され、ログに記録されます (`cw.incident.untrusted_instruction`)。
5. **Agents act under a mandate.** エージェントによって送信されたリクエストには、プリンシパルによって署名された `AgentMandate` が含まれます：スコープ、支出上限、許可されたプロバイダー、有効期限、および確認が必要なアクション。
   - `irreversible` および `safety_override` は、mandate が何と述べていても、常に確認を必要とします。
   - 実行者は mandate の範囲外のリクエストを拒否します (`mandate_scope`)。
6. **Unattended operations need a person.** envelope が `unattended: false` となっている操作には、責任ある人物が立ち会っているか、1 分以内に連絡が取れる必要があります。
7. **Allergen blocks refuse.** レシピまたはインベントリ内のブロックされたアレルゲンは、リクエストを拒否します。ブロックを回避する代用はありません。
8. **Recalls.** カタログは `GET /v1/recalls` で署名済みの recall を公開します。実行者はオンライン時にポーリングを行い、recall されたリビジョンを拒否します。`block_and_stop_running` は、実行中の execution も安全に停止させます。
9. **Incident reports** は匿名であり (`IncidentReport`: 日付のみ、名前や id はなし)、すべてのメーカーが各ニアミスから学べるよう、カタログに提出されます。

## 7. 実行ライフサイクルとAPI

- **API:** `api/core.openapi.yaml`。そのエンドポイントは以下の通りです：
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - カタログ側: `GET /v1/recalls`, `POST /v1/incidents`.
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` および `stopping` → 途中で `stopped` へ;
  - `refused` および `failed` は最終状態です。
  - 完全な遷移テーブルは `core.schema.json#/$defs/ExecutionState` および conformance ベクトルにあります。
- **Request rules:**
  - すべての POST は `Idempotency-Key` を伴います。
  - 既存の execution への変更は `If-Match: <seq>` を伴います。不一致の場合は 412 が返されます。
  - Stop には If-Match は必要ありません。
- **Events:**
  - デリバリーは at least once です。
  - CloudEvents `id` は重複排除キーです。
  - `cookwalaseq` は subject ごとにイベントを順序付けし、ステータスの `seq` と一致させます。
  - デバイスは `cookwala.device.heartbeat` を発行するため、hub はデバイスの紛失を検知して引き継ぎを行うことができます。

## 8. プライバシー

- **Execution logs には個人データが含まれません** (`privacy.personalData: "none"`).
- **それらは opt-in による同意がある場合にのみデバイスを離れます** (`consent.dataset`: デフォルトでは `none`、`research_only`、または `open`)。同意は撤回できます。
- **Open datasets は時間を日に単位まで粗くします。**
- **Household、健康、および宗教に関するデータは、本人が別の選択をしない限り、家庭内に留まります。** 転送が必要な場合は、selective disclosures として転送されます。
- **Humanitarian Profile** には個人データは一切含まれません。

## 9. バージョニングと拡張

- **Core バージョンは `0.2.x` です。**
  - リーダーは、自身のマイナーバージョンの任意のパッチを受け入れます。
  - 他のマイナーバージョンは `unsupported_version` で拒否されます。
  - 未知の `x-` フィールドは無視されます。
- **新しい operation、unit、sensor、および incident type** は、バージョンの変更なしに vocabulary に追加されます。
- **operation の意味を変更することは新しい id となります。** 古いものは `replacedBy` を伴う `deprecated` としてマークされます。
- **Profiles** は独立してバージョン管理され、必要とする Core バージョンを宣言します。

## 10. プロファイルとそのステータス

| プロファイル | ステータス | 備考 |
|---|---|---|
| Core (this document) | **draft, normative** | 最初のデバイス実装のターゲット |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | 個人データなし; SMSおよびCSVで動作; surplus to plate, impact summaries, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | ローカルファーストのhousehold context; derived constraintのみが転送される (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | 証明済みの名前空間, 正確なバージョン, tombstones; リクエストによる組織 (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | すべてのconformance claimの背後にある署名済みレポート (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | フィードとリレー; 発行者に対して検証 (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | レストラン, コミュニティ, 学校, 災害およびロボットキッチン (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | 集計された, 遅延した, クラスレベルの需要および供給信号; 競争法レビューに基づき制限 (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | イベントログ + 投影, `profiles/mission/transitions.json` 内の遷移 |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | 本番使用前に競争法レビューが必要 |
| Relief planning (`relief.schema.json`) | experimental | 運用フローはHumanitarian Profileに移動済み |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core APIがリファレンスサーフェス |

2つの独立した実装がその conformance ベクトルをパスし、かつ実ユーザーが存在するとき、プロファイルは安定します。

## 11. ツール

| ツール | 機能 |
|---|---|
| `tools/validate_specs.py` | スキーマ、例、レシピのセマンティクス（envelopes、op パラメータ、テンプレートのプレースホルダーがないこと）、厳格さ、および API 参照が解決されるかを確認する |
| `tools/run_conformance.py` | `conformance/*.json` および `conformance/profiles/*.json` を実行し、`--report` を用いて ConformanceReport を書き出す：ハッシュ化（RFC 8785 の例を含む）、署名（RFC 8032 の鍵を含む）、失効、開示、イベントチェーンとチェックポイント、単位、envelopes、sensor ladders、状態マシン |
| `tools/cookwala_ref.py` | リファレンスライブラリおよび CLI: `hash`、`verify`、`chain` |
| `tools/make_conformance.py` | ベクトルを再生成する（diff を確認すること） |
| `tools/bundle_schemas.py` | オフラインスキーマバンドル |
| `tools/humanitarian_check.py` | Humanitarian Profile rule pack チェッカーおよび影響の要約 |
| `tools/make_profile_vectors.py` | `conformance/profiles/` 内の profile ベクトルを再生成する |

## 12. 0.1からの変更点

| エリア | 0.1 | 0.2 |
|---|---|---|
| Schemas | 未知のフィールドを許容 | `x-` 拡張を含む厳格な形式 |
| Temperatures | °C または °F、相対的な許容誤差を許可 | °C のみ; 絶対的な許容誤差 |
| Money | 数値 | 小数文字列 |
| Operations | 文章による定義 | 物理的な operation envelope, sensor ladder, 熱レベル, テストベクトル |
| Signatures | 固定の EdDSA, ライフサイクルを持たない鍵 | EdDSA または ES256, 有効性と失効を持つ KeyRecords |
| Missions | 変更可能な単一のドキュメント, 内部に台帳 | イベントログ + プロジェクション, 単一のシーケンサー, 証跡付きチェックポイント, ハッシュのみモード |
| Agents | Missions 内の mandate のみ | common 内の `AgentMandate`; エージェントのリクエストに必要 |
| Safety | レシピ内で宣言 | SafetyLimits によるローカルな強制; recall; インシデントレポート |
| Data | データセットモデルなし | 同意済み、個人データを含まない ExecutionLog |
| Conformance | スキーマ検証のみ | 106 個のベクトル (44 Core, 62 profile) およびリファレンス実装 |

0.1 ドキュメントを移行するには: °F を °C に変換します。温度の相対的な許容誤差を `toleranceAbs` に置き換えます。金額を小数文字列に変換します。不明なフィールドを削除するか、`x-` フィールドに名前を変更します。

