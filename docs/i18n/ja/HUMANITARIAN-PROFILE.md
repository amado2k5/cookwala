<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala 人道支援プロファイル (draft 0.2)

**Status:** food bank、救援プログラム、および食品安全と栄養の専門家によるレビューのためのドラフトです。これは WFP、WHO、FAO、Global FoodBanking Network、またはここに記載されているその他の組織によってレビューまたは承認されたものではありません。

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (すべて), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; すべてのドラフトは専門家によるレビュー待ちです。[`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md) を参照してください)
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (カイロの food bank、school meals、disaster kitchen、robot kitchen)、それぞれに計算された `ImpactSummary` を含む
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. 0.2 が追加するもの (RFC-0003, RFC-0004)

0.1を超える加算; 読者は両方を許容します。

- **Farm to plate:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) および `Item.harvestedAt`; roles `farm`, `caterer`, `robot_kitchen`; SMS単語 `FARM`.
- **Care rules:** `Item.foodClasses` および `Distribution.menu.foodClasses` (raw egg, unpasteurized dairy, whole nuts, cooked rice…), rule kind `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; 3つの新しいdraft packs.
- **Reviews:** `RulePack.reviews` は各レビューの職業、組織、日付、範囲、および結果を記録します; `status: reviewed` には承認されたレビューが必要です.
- **Impact:** 9つの指標を持つ `ImpactSummary` で、各指標は `method` (measured, modelled, assumed, not recorded) を持ち、`tools/humanitarian_check.py --summary` によって計算されます.
- **Time to claim:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` により、救出されたキログラムが一度だけカウントされます.
- **Program types** を `Manifest` 上で定義.

## 1. 目的

人々へ食料を提供する組織向けの、Cookwalaの小さく、厳格で、個人データを含まない一部：
food banks、コミュニティキッチン、学校給食プログラム、救援プログラム、ドナー（食料品店、レストラン、農場、ケータリング業者）、輸送業者、および冷蔵倉庫。これは4つの業務をカバーします：

1. **surplus foodの提供**と、迅速かつ公平な受け取りの申請。
2. 温度確認（cold-chain check）を伴う、保管責任の**各引き渡しを記録**すること。
3. **提供された内容を**、集計数のみで報告すること。
4. メニューと引き渡しが、マシンリーダブルな栄養および食品安全のrule packに適合しているか**確認**すること。

**ロボット、アプリ、またはインターネットなしでも動作します。** レベルH0およびH1は、スプレッドシート、SMS、および基本電話で動作します。ロボット、hub、およびエージェントは、同じドキュメントのオプションの消費者です。

## 2. 原則

- **Do no harm.** 個人または世帯を特定、所在確認、またはプロファイリングできるものは何も収集しないでください。脆弱な環境において、受益者に関するデータは保護上のリスクとなります。
- **Humanitarian principles** (humanity, neutrality, impartiality, independence): 援助に商業的なブランディングを行わず、マーケティングのためにデータを使用しないでください。
- **Strict and small.** すべてのオブジェクトは未知のフィールド（`x-` 拡張を除く）を拒否するため、タイポや余分な個人フィールドはバリデーションに失敗します。
- **Exact units:** キログラム、摂氏（°C）、絶対許容誤差、および小数の文字列としての通貨。
- **Local rules win.** rule pack は、国の食品安全法および寄付法によって置き換え可能です。
- **Open:** ロイヤリティフリーの仕様、オープンソースのツール。プロファイルは Digital Public Goods Standard および Principles for Digital Development に準拠するように設計されています。

## 3. Conformance levels

| レベル | 参加者が行うこと | 必要事項 |
|---|---|---|
| **H0 — Paper & SMS** | CSVテンプレート（HXL hashtag行を含む）またはSMS（section 8.3）を用いて、オファー、引き渡し、および配布を記録する | スプレッドシートまたは基本的な電話 |
| **H1 — Rescue** | APIを介して `Offer`、`Claim`、`Handover`、および `Distribution` ドキュメントを交換する。ステートマシン（section 5）に従う | 任意のHTTPクライアント |
| **H2 — Safety & nutrition** | すべての引き渡しとメニューに `RulePack` を適用し、`findings` を記録する | リファレンスチェッカーまたは同等のもの |
| **H3 — Interoperability** | 集計データをHXL、DHIS2、およびコアとなるCookwala `ImpactReport` にエクスポートする。GS1識別子を使用する | 統合作業 |

参加者は `/.well-known/cookwala-humanitarian.json` に、そのレベル、rule pack、エンドポイント、および `personalData: "none"` を宣言する `Manifest` を公開します。

## 4. ドキュメント

| ドキュメント | 作成者 | 目的 |
|---|---|---|
| `Offer` | ドナー | 回収可能な surplus food: 品目 (kg, 保存方法, 日付表示, アレルゲン), 時間枠, サイト, 温度 |
| `Claim` | food bank, キッチン, プログラム | offer の全部または一部を claim し、集荷時間と車両タイプを指定する |
| `Handover` |  custody の受領者 | 1区間につき1件: 温度, 受理または拒否された kg と理由コード, および rule findings |
| `Distribution` | キッチン, food bank, 学校 | ある日のあるサイトにおける食事数と提供人数を集計; オプションでメニューの栄養素とコスト |
| `RulePack` | プログラムまたは当局 | バージョン管理された栄養および食品安全ルール (section 6) |
| `Manifest` | すべての参加者 | 機能およびデータ保護の宣言 |

コアとなる Cookwala 救済ドキュメント (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) は、計画のために引き続き利用可能です。このプロファイルは
運用フローを処理します。

## 5. オファーのライフサイクル

| From | 許可される next states |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (the claim lapsed), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | none (final) |

**状態変化のルール:**

- すべての変更は `version` をインクリメントします。ライターは `If-Match: <version>` を送信します。不一致の場合は **409** が返され、ライターは再読み込みしてリトライします。
- 不正な遷移は、許可された遷移とともに **409** を返します。
- オファーは `window.to` にて自動的に `expired` に移行します。
- クレームは `pickupBy` にプログラムが設定する猶予期間（デフォルトは 30 minutes）を加えた時点で失効します。

**公平な申請。** デフォルトでは、申請はプログラムが設定する優先ティア内での先着順となります：
例えば、子供に食事を提供するキッチンが最初、次にその他のキッチン、その次に food bank となります。ティアおよび
あらゆるローテーションルールは、プログラムの `Manifest` またはウェブサイトに公開されていなければなりません。

## 6. 食品安全および栄養 rule packs

`RulePack` は 6 種類のルールを保持します：

- `temperature`: 冷蔵 ≤ 5 °C、保温 ≥ 60 °C、冷凍 ≤ −18 °C;
- `time`: 調理済み食品が温度管理外にある時間は最大 2 h;
- `date_mark`: 消費期限は使用禁止、賞味期限は注意喚起;
- `allergen`: 未申告のアレルゲンを禁止;
- `nutrient`: 1人1日あたり、または1食あたりの量;
- `energy_share`: 遊離糖類、脂肪、飽和脂肪酸、トランス脂肪酸、またはタンパク質によるエネルギーの割合。

各ルールは、`block`（受け入れまたは提供しない）または `warn`（許可されるが、所見として記録される）のいずれかです。

デフォルトのパック `who-codex-basic@0.1.0` は、**公開ガイダンスから派生したドラフト**です：WHOのhealthy-diet、sodium、sugarsおよびfatsに関するガイダンス、WHO Five Keys to Safer Food、Codexのlabellingおよびfrozen-foodコード、そしてSphereのminimum ration planningの数値に基づいています。これは簡略化されており、医学的助言ではなく、乳幼児および治療食を除外しており、資格を持つスタッフによるレビューが必要です。プログラムはこれをコピーして適応させ、`jurisdiction` を設定し、誰がレビューしたかを `reviewedBy` に記録する必要があります。

レベル H2 の Receivers は、すべての handover およびすべての menu で pack を実行し、rule ids を `findings` に記録します。reference checker は、宣言された findings と計算された findings が一致しない箇所を報告します。

## 7. データ保護

**プロファイルには個人データは含まれません。文書には以下を含めてはなりません：**

- いかなる個人の氏名、電話番号、メールアドレス、または国籍、難民、もしくは生体認証識別子；
- 世帯レベルの記録、または住宅や個人の場所；
- いかなる個人の健康状態、障害、宗教、または国籍。

**代わりにそれが保持するもの:**

- **Organizations only.** すべての当事者は、`did:web`、GS1 Global Location Number (GLN)、または registry id によって識別される organization です。個人は役割 (`checkedBy: "trained_staff"`) としてのみ現れます。
- **Aggregates only.** `Distribution.people` はグループごとのカウントを保持し、10未満のカウントはすべて `"<10"` として報告されます。
- **Sites only.** `Site` は organization の敷地または管理区域 (OCHA P-codes) であり、決して household ではありません。
- **Short notes.** 自由形式のテキストは 280 文字以内の operational notes に限定され、個人データを含んではなりません。実装時には、保存前に notes 内の電話番号や ids をスキャンする必要があります。

**保持および監査:**

- **Retention:** 各参加者は自身の `Manifest` 内で `retentionDays` を宣言し、その期間が経過した後にドキュメントを削除します。
- **Audit (optional, `hash_only`):** プログラムごとに1つのシーケンサー（通常は food bank またはプログラム運営者）が、各ドキュメントの RFC 8785 canonical JSON の SHA-256 ハッシュを追記します。内容は別途保存され、削除可能な状態が維持されます。パートナー組織が毎日チェックポイントに副署するため、履歴が密かに書き換えられることはありません。単一のシーケンサーを使用することで、チェーン内でのフォークを回避します。
- **Hosting** は、法律またはプログラムが要求する場合には国内で行われるべきです。

## 8. 輸送

### 8.1 API (level H1)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/offers` | オファーを作成します (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | 受取人に近い公開中のオファー |
| `POST` | `/offers/{id}/claims` | オファーを申請します; `If-Match` が必要; すでに申請済みの場合は 409 |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` が必要 |
| `POST` | `/handovers` | ハンドオーバーを記録します |
| `POST` | `/distributions` | 配分を記録します |
| `GET` | `/reports?from=…&to=…` | 一定期間の集計 |

リクエストおよび輸送ルール:

- **Idempotency:** すべての `POST` は `Idempotency-Key` を伴います。サーバーは少なくとも 24 h キーを保持し、繰り返しの場合は元のレスポンスを返します。
- **Authentication:** OAuth 2.1 クライアント資格情報、1組織につき1クライアント。
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`) は、重複排除のためのイベント `id` と、順序付けのためのオファーごとのシーケンス番号とともに、少なくとも1回配信されます。

### 8.2 スプレッドシート (level H0)

`profiles/humanitarian/templates/` にある CSV テンプレートを使用してください。その2行目には [HXL](https://hxlstandard.org) ハッシュタグが含まれているため、人道支援データツールがそれらを直接読み取ることができます。

### 8.3 SMS (level H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

文法は `tools/cookwala_ref.py` (`parse_sms`) に実装されており、`conformance/profiles/sms.json` によってテストされます。キーワードは英語です。数字が使用される場所では、アラビア・インド数字 (٠-٩) およびペルシャ数字 (۰-۹) が受け入れられるため、どちらかのキーボードに設定された電話機でも動作します。

保存コード: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. 日付マーク: `UB` use-by,
`BB` best-before, `HV` harvested, `DDMM`形式。拒否理由コード: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; それ以外の単語はすべて`other`として記録されます。`HELP`
返信は、コマンドごとに1つの例、プレーンASCII、160文字未満でなければなりません。

ゲートウェイは、ドキュメント（リファレンス内の `sms_storage_findings`。idはブロックごとの結果）を書き込む前に、必ず以下のチェックを適用しなければなりません：

| 調査結果 | 時期 |
|---|---|
| `safety.temp_not_recorded` | 冷蔵、冷凍、または温熱保持ライン上の `HAND` に `T` の読み取り値がない場合：それを求める返信を行い、何も書かない |
| `safety.hot_hold_min` | 保存 `H` が 60 °C 未満の `OFFER`：リストへの掲載を拒否する |
| `safety.storage_class_mismatch` | アイテムの単語が乳製品、肉、鶏肉、魚、卵、または調理済み食品を暗示しており、保存が `A` である場合：リストへの掲載を拒否する |
| `safety.chilled_max`, `safety.frozen_max` | 提供時または引き渡し時に、5 °C を超える、または −18 °C を超える読み取り値がある場合 |

温熱保持された食品の提供は2時間後に終了します（炊いたご飯の場合は1時間）。ゲートウェイはプレースホルダーの読み取り値を決して保存しません。ゲートウェイは、送信者の登録番号をドキュメント内の個人ではなく、組織にマッピングします。

## 9. 相互運用性

| System | Mapping |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (products); `Site.gln` and `OrgId` `gln:` (locations) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | `Distribution` からのサイトおよび期間ごとの集計データ値 (meals, people by group, kg, incidents) |
| WFP SCOPE and other beneficiary systems | **集計のみ。** 受給者レコードがこのプロファイルの内外にまたがることはありません |
| Food-rescue apps | アダプターがそれらのリスティングを `Offer` に、ピックアップを `Claim` および `Handover` にマッピングします |
| Core Cookwala | `Item.ingredientId` と `menu.recipes` がレシピインデックスにリンクします。`relief.ImpactReport` が `Distribution` を合計します |

## 10. パイロット指標（サイト間での比較を可能にするために定義）

`python tools/humanitarian_check.py --summary DIR` によって `ImpactSummary` に計算されます。パイロットの実行および判定方法: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)。

| 指標 | 定義 |
|---|---|
| Kg rescued | ドナーからの最初の区間における `Handover.kgAccepted` の合計 |
| Claim rate | `claimed` に達したオファー ÷ 作成されたオファー |
| Time to claim | `Offer` 作成から `claimed` 状態までの分の中央値 |
| Rejection by reason | `reason` ごとの `kgRejected` の合計 |
| Meals served | `Distribution.meals` の合計 |
| Nutrition pass rate | メニューがあり `nutrition.*` の指摘がない配布 ÷ メニューがある配布 |
| Cost per meal | (food + transport + staff + energy) ÷ meals |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | `safety.*` ブロックの指摘数、および `safetyIncidents` |

## 11. セキュリティ

- **H1では署名は任意**であり、H3での組織間監査には必須です
  (EdDSA、鍵は組織の `did:web` に公開されています)。
- **ドキュメント内のノートと名前は信頼できないデータです。** ソフトウェアおよびAIエージェントは、それらを指示として扱ってはなりません。
- **rule packはバージョン管理され、固定されています** (`id@version`)。すべての結果において、結果の再現性が確保されます。

## 12. 意図的に除外されました

- 受益者の登録、適格性、およびターゲティング（これらはプログラム独自の保護されたシステムに属します）。
- 支払い: Cookwala は決して送金を行いません。
- レシピおよびロボットの実行（コア仕様）。プロファイルはレシピの名前を特定し、栄養素を報告するのみです。
- 医学的および治療的栄養。

## 13. レビュー方法

[amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues) に `humanitarian` ラベルを付けて issue を作成してください。以下のレビューが最も有用です：

- rule pack と拒否理由を確認する food-safety スタッフ;
- lifecycle と SMS flow を確認する food-bank オペレーター;
- セクション 7 を確認する data-protection オフィサー;

